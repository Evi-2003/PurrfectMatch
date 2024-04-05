const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 3000;
const bcrypt = require("bcrypt");
const multer = require("multer");
const session = require("express-session");
const minify = require("@node-minify/core");
const uglifyES = require("@node-minify/uglify-es");

require("dotenv").config();
app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));


// minify({
//   compressor: uglifyES,
//   input: 'static/script/script.js',
//   output: 'static/script/output.min.js',
// });


// Setting up the storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "static/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

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
    console.log("Er is verbinding!");
    db = database.db(process.env.DB_NAME);
    dbStatus = true;
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
  const user = await db.collection("users").findOne({ email: email });
  if (user) {
    let checkWachtwoord = await bcrypt.compare(wachtwoord, user.wachtwoord);

    if (checkWachtwoord) {
      return {
        id: user._id,
        voornaam: user.voornaam,
        profielfoto: user.profielfoto,
        verstuurdeVerzoeken: user.verstuurdeVerzoeken,
      };
    } else {
      return false;
    }
  } else {
    return false;
  }
}

/* login */
app.post("/inloggen", async (req, res) => {
  let email = req.body.email;
  let wachtwoord = req.body.wachtwoord;

  logginResultaat = await checkUser(email, wachtwoord);

  if (logginResultaat) {
    req.session.user = logginResultaat;
    res.redirect("/profiel");
  } else {
    res.render("pages/inloggen", {
      error: "Email of wachtwoord is onjuist",
      email: email,
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
  const filename = req.file.filename;

  bcrypt.hash(req.body.repassword, 10, async (err, hashedWachtwoord) => {
    let userData = {
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
    req.session.user = {
      email: userData.email,
      wachtwoord: req.body.repassword,
    };
    res.redirect("/vragenlijst");
  });
});

/* Profiel aanpassen */
app.post(
  "/profielAanpassen",
  upload.single("profielfoto"),
  async (req, res) => {
    let userId = { _id: new ObjectId(req.session.user.id) };
    let userGegv = await db.collection("users").findOne(userId);
    let email = userGegv.email;
    let wachtwoord = req.body.wachtwoord;

    profielAanpassen = await checkUser(email, wachtwoord);
    if (profielAanpassen) {
      let userData = {
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
  let filenames = [];
  images.forEach((element) => {
    filenames.push(element.filename);
  });
  console.log(filenames);

  let dierData = {
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
  //Ophalen aanbiederId via de dierId
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
      req.session.user = userRefetched;
      res.redirect("/adoptie");
    }
  }
});

// Accepteren of Weigeren
app.post("/accepteren", async (req, res) => {
  let verzoekId = { _id: new ObjectId(req.body.verzoekId) };

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
  let dieren = await db.collection("dieren").find().toArray();

  let matchedDieren = dieren.map((dier) => {
    let matchedCount = 0;
    for (let vraag in antwoorden) {
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
  let antwoorden = {
    vraag1: req.body.vraag1,
    vraag2: req.body.vraag2,
    vraag3: req.body.vraag3,
    vraag4: req.body.vraag4,
    vraag5: req.body.vraag5,
    vraag6: req.body.vraag6,
  };

  let email = req.session.user.email;
  let wachtwoord = req.session.user.wachtwoord;
  logginResultaat = await checkUser(email, wachtwoord);
  let id = logginResultaat.id;
  await db
    .collection("users")
    .updateOne({ _id: id }, { $set: { antwoorden: antwoorden } });

  let matchedDier = await match(antwoorden);

  if (matchedDier.length > 0) {
    let besteMatch = matchedDier.filter(
      (dier) => dier.matchedCount === matchedDier[0].matchedCount
    );

    let randomNummer = Math.floor(Math.random() * besteMatch.length);
    res.redirect(
      `/adoptie/${besteMatch[randomNummer].naam}?id=${besteMatch[randomNummer]._id}`
    );
  } else {
    res.send("er is iets fout gegaan");
  }
});

// Routes
app.get("/", (req, res) => {
  res.render("pages/index", { account: req?.session?.user });
});

// Route for the adoption page// Route for the adoption page
app.get("/adoptie", async (req, res) => {
  let likedIds;
  let dieren;
  let userFromDb;
  let selectedSortingMethod = "";
  let selectedSpecies = [];
  let selectedGenders = [];

  // Check if there's a selected sorting method in session
  if (req.session.selectedSortingMethod) {
    selectedSortingMethod = req.session.selectedSortingMethod;
  }

  // Check if there are selected species and genders from previous filtering
  if (req.session.selectedSpecies) {
    selectedSpecies = req.session.selectedSpecies;
  }
  if (req.session.selectedGenders) {
    selectedGenders = req.session.selectedGenders;
  }

  try {
    // Getting the animals
    dieren = await db.collection("dieren").find().toArray();

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
    if (req.session.user) {
      // Ophalen antwoorden matching voor soorteren
      const userId = { _id: new ObjectId(req.session.user.id) };
      userFromDb = await db.collection("users").findOne(userId);
      // If the user, for whatever reaseon, does not have the answered question in it's profile, just load all the animals in default sorting
      const doesAnswersExist = userFromDb?.antwoorden ? true : false;
      if (doesAnswersExist) {
        let matchedDier = await match(userFromDb.antwoorden);
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

    // Getting the user, for the liked animals
    if (req.session.user) {
      const userId = { _id: new ObjectId(req.session.user.id) };
      userFromDb = await db.collection("users").findOne(userId);
      likedIds = userFromDb?.liked?.map((item) => item.id._id.toString()) || [];
    }

    res.render("pages/adoptie", {
      dieren: dieren,
      user: req.session.user,
      likedIds: likedIds,
      account: req?.session?.user,
      selectedSortingMethod: selectedSortingMethod,
      selectedSpecies: selectedSpecies,
      selectedGenders: selectedGenders,
    });
  } catch (error) {
    console.error("Error fetching, sorting, and filtering animals:", error);
    res.render("pages/adoptie", {
      dieren: [],
      user: null,
      likedIds: null,
      account: req?.session?.user,
      selectedSortingMethod: selectedSortingMethod,
      selectedSpecies: selectedSpecies,
      selectedGenders: selectedGenders,
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

// Dynamic route for the animals
app.get("/adoptie/:name", async function (req, res) {
  const id = req.query.id;
  let dier;
  let adoptionRequestAlreadySent = false;
  if (req?.session.user) {
    try {
      // Find the animale
      dier = await db.collection("dieren").findOne({ _id: new ObjectId(id) });
    } finally {
      // Set the id of the animal in a const
      const dierId = dier._id;
      // Loop over every sent
      if (req.session.user.verstuurdeVerzoeken) {
        req.session.user.verstuurdeVerzoeken.forEach((element) => {
          Object.keys(element).forEach(function (key) {
            if (element[key] == dierId) {
              adoptionRequestAlreadySent = true;
            }
          });
        });
      }

      return res.render("pages/dier", {
        dier: dier,
        adoptionRequestAlreadySent: adoptionRequestAlreadySent,
        user: req?.session?.user,
      });
    }
  } else {
    res.redirect("/profiel");
  }
});

// Ophalen liked dieren en verzoeken
app.get("/profiel", checkSession, async (req, res) => {
  const userId = { _id: new ObjectId(req.session.user.id) };
  const userFromDb = await db.collection("users").findOne(userId);
  let likedAnimalsId = userFromDb?.liked?.map((element) => element.id._id);

  try {
    const likedAnimals = await Promise.all(
      likedAnimalsId?.map(async (element) => {
        const dier = await getAnimal(element);
        return dier;
      })
    );

    let verzoeken = await db
      .collection("verzoeken")
      .find({ aanbiederId: req.session.user.id })
      .toArray();
    for (let i = 0; i < verzoeken.length; i++) {
      // Ophalen dier naam
      let dier = await db
        .collection("dieren")
        .findOne({ _id: new ObjectId(verzoeken[i].dierId) });
      if (dier) {
        verzoeken[i].dierNaam = dier.naam;
      }
      // Ophalen zoeker naam
      let zoeker = await db
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

// Liken van een dier
app.post("/like", async (req, res) => {
  const id = { _id: new ObjectId(req.body.dier) };
  const user = { _id: new ObjectId(req.body.user) };
  console.log(req.body.user);
  let userFromDb;
  let likeCount; // Keep count of the likes
  let dier;
  let likedIds;
  let dieren;
  try {
    // Find the animal
    dier = await db.collection("dieren").findOne(id);
    // Find the user
    userFromDb = await db.collection("users").findOne(user);
  } finally {
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
        .updateOne(user, { $push: { liked: { id } } });
    } else {
      likeCount = dier.likes ? (dier.likes -= 1) : 1;
      await db
        .collection("dieren")
        .updateOne(id, { $set: { likes: likeCount } });
      await db
        .collection("users")
        .updateOne(user, { $pull: { liked: { id } } });
    }
    // Getting the updated dieren array
    dieren = await db.collection("dieren").find().toArray();
    userFromDb = await db.collection("users").findOne(user);
    likedIds = userFromDb.liked
      ? userFromDb.liked.map((item) => item.id._id.toString())
      : [];
    // Re-rendering the page with the new dieren
    if (req.session.user) {
      res.render("pages/adoptie", {
        dieren: dieren,
        user: req.session.user,
        likedIds: likedIds,
        account: req?.session?.user,
        selectedSortingMethod: "",
        selectedSpecies: "",
        selectedGenders: "",
      });
    } else {
      res.render("pages/adoptie", {
        dieren: dieren,
        user: null,
        likedIds: [],
        account: req?.session?.user,
        selectedSortingMethod: "",
        selectedSpecies: "",
        selectedGenders: "",
      });
    }
  }
});
app.listen(port, () => {
  console.log(`Ik luister naar poort: ${port}`);
});
