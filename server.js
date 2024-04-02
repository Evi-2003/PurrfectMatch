const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 3000;
const bcrypt = require("bcrypt");
const multer = require("multer");
const session = require("express-session");

require("dotenv").config();
app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

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
  }),
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
    res.send("email of wachtwoord is onjuist");
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
    res.redirect("/profiel");
  });
});
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
  };

  await db.collection("dieren").insertOne(dierData);
  res.redirect("/adoptie");
});

// Verzoeken sturen
app.post("/verzoek", checkSession, async (req, res) => {
  //Ophalen aanbiederId via de dierId
  let dierId = { _id: new ObjectId(req.body.dierId) };
  let dierCollection = await db.collection('dieren').findOne(dierId);

  let verzoekData = {
    zoekerId: req.session.user.id,
    dierId: req.body.dierId,
    aanbiederId: dierCollection.aanbieder,
    status: "Nog niet beoordeeld",
  };

  await db.collection("verzoeken").insertOne(verzoekData);
  res.redirect("/profiel");
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

// Routes
app.get("/", (req, res) => {
  console.log(req.session);
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
        selectedSpecies.includes(dier.soort.toLowerCase()),
      );
    }

    // Filtering based on selected genders
    if (selectedGenders.length > 0) {
      dieren = dieren.filter((dier) =>
        selectedGenders.includes(dier.geslacht.toLowerCase()),
      );
    }

    // Sorting based on selected method
    if (selectedSortingMethod === "jongOud") {
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
  try {
    // Zoek de bijhorende dier erbij
    dier = await db.collection("dieren").findOne({ _id: new ObjectId(id) });
  } finally {
    return res.render("pages/dier", {
      dier: dier,
      account: req?.session?.user,
    });
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
      }),
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
  let userFromDb;
  let likeCount; // Voor het bijhouden van de likes
  let dier;
  let likedIds;
  let dieren;
  try {
    // Zoek de bijhorende dier erbij
    dier = await db.collection("dieren").findOne(id);
    // Zoek user erbij
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
