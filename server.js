const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 3000;
const bcrypt = require("bcrypt");
const multer = require("multer");
const session = require("express-session");
const nodemailer = require("nodemailer");
const { Promise } = require("es6-promise");
const compression = require("compression");

const RateLimit = require("express-rate-limit");

require("dotenv").config();
app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(compression());

app.use(express.urlencoded({ extended: true }));

// Limit api requests, (preventing DDOS)
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// Settings smtp
const smtpServer = nodemailer.createTransport({
  host: "smtp.mailersend.net",
  port: 587,
  secure: false,
  auth: {
    user: "MS_dbCI4o@trial-ynrw7gyqe2k42k8e.mlsender.net",
    pass: process.env.SMTP_PASSWORD,
  },
});

// E-mail versturen functie
function sendEmail({ toEmail, content, subject }) {
  const mailOptions = {
    from: "PurrfectMatch <purrfect@trial-ynrw7gyqe2k42k8e.mlsender.net>",
    to: toEmail, // Geadresseerde e-mailadres
    subject, // Onderwerp van het e-mailbericht
    text: content, // Tekst van het e-mailbericht
  };
  smtpServer.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Fout bij het versturen van het e-mailbericht:", error);
    } else {
      console.log("E-mailbericht succesvol verstuurd:", info.response);
    }
  });
}
// Example use of sending a e-mail: sendEmail({ toEmail: "mail@eviwammes.nl", subject: "test", content: "This is a test!" });

// minify({
//   compressor: uglifyES,
//   input: 'static/script/script.js',
//   output: 'static/script/output.min.js'
// })

// Setting up the storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "static/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Verbinden met database
let db;
// ConnectieURL opstellen met de gegevens uit .env
const connectionString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
// Nieuwe mongo client object aanmaken
const client = new MongoClient(connectionString, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// Connectie maken met de database, en status loggen
client
  .connect()
  .then((database) => {
    console.log("\x1b[42;30mEr is verbinding!\x1b[0m");
    db = database.db(process.env.DB_NAME);
  })
  .catch((err) => {
    console.log(`Er is wat mis gegaan - ${err}`);
  });

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

/* check wachtwoord */
async function checkUser(email, wachtwoord) {
  const user = await db.collection("users").findOne({ email });
  if (user) {
    const checkWachtwoord = await bcrypt.compare(wachtwoord, user.wachtwoord);

    if (checkWachtwoord) {
      return {
        id: user._id,
        voornaam: user.voornaam,
        profielfoto: user.profielfoto,
        verstuurdeVerzoeken: user.verstuurdeVerzoeken,
        email: user.email,
      };
    } else {
      return { verkeerdWachtwoord: true };
    }
  } else {
    return { geenAccount: true };
  }
}

/* login */
app.post("/inloggen", async (req, res) => {
  const email = req.body.email;
  const wachtwoord = req.body.wachtwoord;

  const logginResultaat = await checkUser(email, wachtwoord);

  if (
    logginResultaat &&
    !logginResultaat.verkeerdWachtwoord &&
    !logginResultaat.geenAccount
  ) {
    req.session.user = logginResultaat;
    res.redirect("/profiel");
  } else if (logginResultaat && logginResultaat.verkeerdWachtwoord) {
    req.session.failedEmail = email;
    res.render("pages/inloggen", {
      error: "Wachtwoord is onjuist",
      failedEmail: req.session.failedEmail,
    });
  } else if (logginResultaat && logginResultaat.geenAccount) {
    res.render("pages/inloggen", {
      error: "Email onbekend, nog geen account",
    });
  }
});

function checkSession(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = "Geen toegang";
    res.redirect("/inloggen");
  }
}

/* uitloggen */
app.get("/uitloggen", function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

/* registratie van gebruiker */
app.post("/", upload.single("profielfoto"), async (req, res) => {
  const user = await db.collection("users").findOne({ email: req.body.email });
  if (user) {
    req.session.failedEmail = req.body.email;
    res.render("pages/inloggen", {
      error: "Email heeft al een account, log hier in",
      failedEmail: req.session.failedEmail,
    });
  } else {
    const filename = req.file.filename;

    bcrypt.hash(req.body.repassword, 10, async (err, hashedWachtwoord) => {
      if (err) {
        console.log(err);
      }
      const userData = {
        profielfoto: filename,
        voornaam: req.body.voornaam,
        tussenvoegsel: req.body.tussenvoegsel,
        achternaam: req.body.achternaam,
        geslacht: req.body.geslacht,
        postcode: req.body.postcode,
        straatnaam: req.body.straatnaam,
        huisnummer: parseInt(req.body.huisnummer),
        toevoeging: req.body.toevoeging,
        woonplaats: req.body.woonplaats,
        geboortedatum: req.body.geboortedatum,
        telefoonnummer: req.body.telefoonnummer,
        email: req.body.email,
        wachtwoord: hashedWachtwoord,
        liked: [],
      };

      await db.collection("users").insertOne(userData);
      sendEmail({
        toEmail: userData.email,
        subject: "Welkom bij PurrfectMatch " + userData.voornaam + "!",
        content:
          "Welkom bij PurrfectMatch! We hopen dat je een geweldige ervaring gaat hebben op ons platform. Heb je vragen? Neem contact met ons op!",
      });
      req.session.user = {
        email: userData.email,
        wachtwoord: req.body.repassword,
      };
      res.redirect("/vragenlijst");
    });
  }
});

/* Profiel aanpassen */
app.post(
  "/profielAanpassen",
  upload.single("profielfoto"),
  async (req, res) => {
    const userId = { _id: new ObjectId(req.session.user.id) };
    const userGegv = await db.collection("users").findOne(userId);
    const email = userGegv.email;
    const wachtwoord = req.body.wachtwoord;

    const profielAanpassen = await checkUser(email, wachtwoord);
    if (profielAanpassen) {
      const userData = {
        voornaam: req.body.voornaam,
        tussenvoegsel: req.body.tussenvoegsel,
        achternaam: req.body.achternaam,
        geslacht: req.body.geslacht,
        postcode: req.body.postcode,
        straatnaam: req.body.straatnaam,
        huisnummer: parseInt(req.body.huisnummer),
        toevoeging: req.body.toevoeging,
        woonplaats: req.body.woonplaats,
        geboortedatum: req.body.geboortedatum,
        telefoonnummer: req.body.telefoonnummer,
        email: req.body.email,
      };

      if (req.file) {
        userData.profielfoto = req.file.filename;
      }

      await db.collection("users").updateOne(userId, { $set: userData });
      res.redirect("/profiel");
    } else {
      res.redirect("/profiel");
    }
  }
);

/* registratie van dier */
app.post("/registreer-dier", upload.array("foto"), async (req, res) => {
  const images = req.files;
  const filenames = [];
  images.forEach((element) => {
    filenames.push(element.filename);
  });
  console.log(filenames);

  const dierData = {
    foto: filenames,
    naam: req.body.diernaam,
    soort: req.body.diersoort,
    leeftijd: req.body.dierleeftijd,
    gewicht: req.body.diergewicht,
    geslacht: req.body.diergeslacht,
    omschrijving: req.body.dieromschrijving,
    aanbieder: req.session.user.id,
    vraag1: req.body.vraag1,
    vraag2: req.body.vraag2,
    vraag3: req.body.vraag3,
    vraag4: req.body.vraag4,
    vraag5: req.body.vraag5,
    vraag6: req.body.vraag6,
  };

  await db.collection("dieren").insertOne(dierData);
  res.redirect("/adoptie");
});

// Verzoeken sturen
app.post("/verzoek", checkSession, async (req, res) => {
  // Ophalen aanbiederId via de dierId
  const dierId = { _id: new ObjectId(req.body.dierId) };
  const dierCollection = await db.collection("dieren").findOne(dierId);
  const verzoekData = {
    zoekerId: req.session.user.id,
    dierId: req.body.dierId,
    aanbiederId: dierCollection.aanbieder,
    status: "Nog niet beoordeeld",
  };

  const data = await db.collection("verzoeken").insertOne(verzoekData);

  // Koppel het verzoek dat je stuurt aan de gebruiker die het stuurt
  const idNieuwVerzoek = data.insertedId;
  const profielId = { _id: new ObjectId(req.session.user.id) };

  try {
    await db.collection("users").updateOne(profielId, {
      $push: {
        verstuurdeVerzoeken: {
          verzoekId: idNieuwVerzoek,
          animalId: req.body.dierId,
        },
      },
    });
    sendEmail({
      toEmail: req.session.user.email,
      subject: "Je adoptie verzoek is verstuurd!",
      content:
        "Je adoptie verzoek is verstuurd naar het baasje van " +
        dierCollection.naam,
    });
  } catch (error) {
    console.log(error);
  } finally {
    // Fetch the user again after modifying it. So the session doesnt have old data of the user
    let userRefetched;
    try {
      userRefetched = await db.collection("users").findOne(profielId);
    } catch (error) {
      console.log(error);
    } finally {
      const user = {
        id: userRefetched._id,
        voornaam: userRefetched.voornaam,
        profielfoto: userRefetched.profielfoto,
        verstuurdeVerzoeken: userRefetched.verstuurdeVerzoeken,
        email: userRefetched.email,
      };
      req.session.user = user;
      res.redirect("/adoptie");
    }
  }
});

// Accepteren of Weigeren
app.post("/accepteren", async (req, res) => {
  const verzoekId = { _id: new ObjectId(req.body.verzoekId) };

  if (req.body.accepteren === "accepteren") {
    await db
      .collection("verzoeken")
      .updateOne(verzoekId, { $set: { status: "Geaccepteerd" } });
  } else if (req.body.accepteren === "weigeren") {
    await db
      .collection("verzoeken")
      .updateOne(verzoekId, { $set: { status: "Geweigerd" } });
  }
  res.redirect("/profiel");
});

/* Matchen Vragenlijst */
async function match(antwoorden) {
  const dieren = await db.collection("dieren").find().toArray();

  const matchedDieren = dieren.map((dier) => {
    let matchedCount = 0;
    for (const vraag in antwoorden) {
      if (antwoorden[vraag] === dier[vraag]) {
        matchedCount++;
      }
    }
    dier.matchedCount = matchedCount;
    return dier;
  });

  matchedDieren.sort((a, b) => b.matchedCount - a.matchedCount);
  return matchedDieren;
}

app.post("/matchenVragenlijst", async (req, res) => {
  const antwoorden = {
    vraag1: req.body.vraag1,
    vraag2: req.body.vraag2,
    vraag3: req.body.vraag3,
    vraag4: req.body.vraag4,
    vraag5: req.body.vraag5,
    vraag6: req.body.vraag6,
  };

  const email = req.session.user.email;
  const wachtwoord = req.session.user.wachtwoord;
  const logginResultaat = await checkUser(email, wachtwoord);
  const id = logginResultaat.id;
  await db.collection("users").updateOne({ _id: id }, { $set: { antwoorden } });

  const matchedDier = await match(antwoorden);

  if (matchedDier.length > 0) {
    const besteMatch = matchedDier.filter(
      (dier) => dier.matchedCount === matchedDier[0].matchedCount
    );

    const randomNummer = Math.floor(Math.random() * besteMatch.length);
    res.redirect(
      `/adoptie/${besteMatch[randomNummer].naam}?id=${besteMatch[randomNummer]._id}`
    );
  } else {
    res.send("er is iets fout gegaan");
  }
});

// Routes
app.get("/", async (req, res) => {
  const dieren = await db.collection("dieren").find().toArray();
  let likedIds;
  if (req.session.user) {
    const userId = { _id: new ObjectId(req.session.user.id) };
    const userFromDb = await db.collection("users").findOne(userId);
    likedIds = userFromDb?.liked?.map((item) => item.id._id.toString()) || [];
  }
  res.render("pages/index", {
    account: req?.session?.user,
    dieren,
    likedIds,
  });
});
// fetching the animals
async function fetchingAnimals(
  user,
  selectedSortingMethod,
  selectedSpecies = [],
  selectedGenders = []
) {
  let likedIds = [];
  let dieren = [];
  let userFromDb;

  try {
    // Getting the animals
    dieren = await db.collection("dieren").find().toArray();

    // Getting the user, for the liked animals
    if (user) {
      const userId = { _id: new ObjectId(user.id) };
      userFromDb = await db.collection("users").findOne(userId);
      likedIds = userFromDb?.liked?.map((item) => item.id._id.toString()) || [];
    }

    // Filtering based on selected species
    if (selectedSpecies.length > 0) {
      dieren = dieren.filter((dier) =>
        selectedSpecies.includes(dier.soort.toLowerCase())
      );
    }

    // Filtering based on selected genders
    if (selectedGenders.length > 0) {
      dieren = dieren.filter((dier) =>
        selectedGenders.includes(dier.geslacht.toLowerCase())
      );
    }

    // Sorting based on selected method
    if (user && selectedSortingMethod === "relevant") {
      // Ophalen antwoorden matching voor soorteren
      const userId = { _id: new ObjectId(user.id) };
      userFromDb = await db.collection("users").findOne(userId);
      // If the user, for whatever reaseon, does not have the answered question in its profile, just load all the animals in default sorting
      const doesAnswersExist = !!userFromDb?.antwoorden;
      if (doesAnswersExist) {
        const matchedDier = await match(userFromDb.antwoorden);
        dieren = matchedDier;
      } else {
        dieren = await db.collection("dieren").find().toArray();
      }
    } else if (selectedSortingMethod === "jongOud") {
      dieren.sort((a, b) => a.leeftijd - b.leeftijd);
    } else if (selectedSortingMethod === "oudJong") {
      dieren.sort((a, b) => b.leeftijd - a.leeftijd);
    } else if (selectedSortingMethod === "lichtZwaar") {
      dieren.sort((a, b) => a.gewicht - b.gewicht);
    } else if (selectedSortingMethod === "zwaarLicht") {
      dieren.sort((a, b) => b.gewicht - a.gewicht);
    }

    return { dieren, userFromDb, likedIds };
  } catch (error) {
    console.error("Error fetching, sorting, and filtering animals:", error);
    return { dieren: [], userFromDb: null, likedIds: [] };
  }
}

// adoption page rout
app.get("/adoptie", async (req, res) => {
  const { user, selectedSortingMethod, selectedSpecies, selectedGenders } =
    req.session;

  const { dieren, likedIds } = await fetchingAnimals(
    user,
    selectedSortingMethod,
    selectedSpecies,
    selectedGenders
  );

  res.render("pages/adoptie", {
    dieren,
    user,
    likedIds,
    account: user,
    selectedSortingMethod: selectedSortingMethod || "",
    selectedSpecies: selectedSpecies || [],
    selectedGenders: selectedGenders || [],
  });
});

// liking route
app.post("/like", async (req, res) => {
  const { user } = req.session;
  const id = { _id: new ObjectId(req.body.dier) };
  const userId = { _id: new ObjectId(user.id) };

  let likeCount; // Keep count of the likes
  let dier;
  let dieren;
  let likedIds;

  try {
    // Find the animal
    dier = await db.collection("dieren").findOne(id);
    // Find the user
    let userFromDb = await db.collection("users").findOne(userId);

    // Updating the likes on the dier, after checking if the user already liked it
    likedIds = userFromDb.liked
      ? userFromDb.liked.map((item) => item.id._id.toString())
      : [];
    if (!likedIds.includes(req.body.dier.toString())) {
      // If there is no likes, make it 1.
      if (dier) {
        likeCount = dier.likes ? (dier.likes += 1) : 1;
      }
      await db
        .collection("dieren")
        .updateOne(id, { $set: { likes: likeCount } });
      await db
        .collection("users")
        .updateOne(userId, { $push: { liked: { id } } });
    } else {
      likeCount = dier.likes ? (dier.likes -= 1) : 1;
      await db
        .collection("dieren")
        .updateOne(id, { $set: { likes: likeCount } });
      await db
        .collection("users")
        .updateOne(userId, { $pull: { liked: { id } } });
    }

    // Getting the updated dieren array
    dieren = await db.collection("dieren").find().toArray();
    userFromDb = await db.collection("users").findOne(userId);
    likedIds = userFromDb.liked
      ? userFromDb.liked.map((item) => item.id._id.toString())
      : [];

    // Re-rendering the page with the new dieren
    res.render("pages/adoptie", {
      dieren,
      user,
      likedIds,
      account: user,
      selectedSortingMethod: "",
      selectedSpecies: "",
      selectedGenders: "",
    });
  } catch (error) {
    console.error("Error liking a pet:", error);
    res.render("pages/adoptie", {
      dieren: [],
      user: null,
      likedIds: [],
      account: user,
      selectedSortingMethod: "",
      selectedSpecies: "",
      selectedGenders: "",
    });
  }
});

// Route for filtering
app.post("/filteren", async (req, res) => {
  // Convert submitted values to lowercase and ensure they are arrays
  const selectedSpecies = Array.isArray(req.body.diersoort)
    ? req.body.diersoort.map((species) => species.toLowerCase())
    : [req.body.diersoort?.toLowerCase()].filter(Boolean);
  const selectedGenders = Array.isArray(req.body.geslacht)
    ? req.body.geslacht.map((gender) => gender.toLowerCase())
    : [req.body.geslacht?.toLowerCase()].filter(Boolean);

  // Save selected species and genders in session
  req.session.selectedSpecies = selectedSpecies;
  req.session.selectedGenders = selectedGenders;

  // Redirect back to adoption page
  res.redirect("/adoptie");
});

// Route for sorting
app.post("/sorteren", async (req, res) => {
  const selectedSortingMethod = req.body.sorteerModus;

  // Save selected sorting method in session
  req.session.selectedSortingMethod = selectedSortingMethod;

  // Redirect back to adoption page
  res.redirect("/adoptie");
});

app.get("/adoptie/:name", async function (req, res) {
  let likedIds;
  let dier;
  try {
    if (!req.session.user) {
      return res.redirect("/profiel");
    }

    const id = req.query.id;

    let adoptionRequestAlreadySent = false;

    // Find the animal
    dier = await db.collection("dieren").findOne({ _id: new ObjectId(id) });

    // Checking if the user has liked the animal
    const userId = { _id: new ObjectId(req.session.user.id) };
    const userFromDb = await db.collection("users").findOne(userId);
    likedIds = userFromDb?.liked?.map((item) => item.id._id.toString()) || [];

    // Set the id of the animal in a const
    const dierId = dier._id;

    // Loop over every sent adoption request
    if (req.session.user.verstuurdeVerzoeken) {
      req.session.user.verstuurdeVerzoeken.forEach((element) => {
        if (Object.values(element).includes(dierId.toString())) {
          adoptionRequestAlreadySent = true;
        }
      });
    }

    res.render("pages/dier", {
      dier,
      adoptionRequestAlreadySent,
      user: req.session.user,
      likedIds,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Ophalen liked dieren en verzoeken
app.get("/profiel", checkSession, async (req, res) => {
  const userId = { _id: new ObjectId(req.session.user.id) };
  const userFromDb = await db.collection("users").findOne(userId);
  const likedAnimalsId = userFromDb?.liked?.map((element) => element.id._id);
  let likedAnimals;
  try {
    if (Array.isArray(likedAnimalsId)) {
      likedAnimals = await Promise.all(
        likedAnimalsId.map(async (element) => {
          const dier = await getAnimal(element);
          return dier;
        })
      );
      // Use likedAnimals as needed
    }
    const verzoeken = await db
      .collection("verzoeken")
      .find({ aanbiederId: req.session.user.id, status: "Nog niet beoordeeld" })
      .toArray();
    for (let i = 0; i < verzoeken.length; i++) {
      // Ophalen dier naam en img
      const dier = await db
        .collection("dieren")
        .findOne({ _id: new ObjectId(verzoeken[i].dierId) });
      if (dier) {
        verzoeken[i].dierNaam = dier.naam;
        verzoeken[i].dierFoto = dier.foto[0];
      }
      // Ophalen zoeker naam
      const zoeker = await db
        .collection("users")
        .findOne({ _id: new ObjectId(verzoeken[i].zoekerId) });
      if (zoeker) {
        verzoeken[i].zoekerNaam = zoeker.voornaam;
      }
    }

    res.render("pages/profiel", {
      account: userFromDb,
      dieren: likedAnimals,
      data: req.session.user,
      selectedSortingMethod: "",
      verzoeken: verzoeken,
      likedIds: likedAnimalsId,
    });
  } catch (error) {
    console.log("Iets mis gegaan");
    console.log(error);
  }
});

async function getAnimal(element) {
  const dier = await db.collection("dieren").findOne({ _id: element });
  return dier;
}

app.get("/toevoegen", checkSession, (req, res) => {
  res.render("pages/toevoegen", { account: req?.session?.user });
});

app.get("/favorieten", (req, res) => {
  res.render("pages/favorieten", { account: req?.session?.user });
});
app.get("/mail", (req, res) => {
  res.render("pages/mail", { account: req?.session?.user });
});

app.get("/inloggen", (req, res) => {
  res.render("pages/inloggen", { account: req?.session?.user });
});
app.get("/registreren", (req, res) => {
  res.render("pages/registreren", { account: req?.session?.user });
});

app.get("/vragenlijst", (req, res) => {
  res.render("pages/vragenlijst", { account: req?.session?.user });
});
app.post("/contactformulier", async (req, res) => {
  await db.collection("contactformulieren").insertOne(req.body);
  sendEmail({
    toEmail: "mail@eviwammes.nl",
    subject: "Contactformulier ingevuld door " + req.body.voornaam,
    content: req.body.bericht,
  });
  sendEmail({
    toEmail: req.body.email,
    subject: "Bedankt voor je e-mail " + req.body.voornaam + "!",
    content:
      "We hebben je bericht ontvangen. We zullen je e-mail zo snel mogelijk proberen te beantwoorden.",
  });
  res.redirect("/");
});
app.listen(port, () => {
  console.log(
    `\x1b[44mDe website kan worden bezocht op localhost:${process.env.PORT}\x1b[0m`
  );
  console.log("\x1b[41mVeel plezier met PurrfectMatch!\x1b[0m");
});
