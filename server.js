const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 3000;
const bcrypt = require("bcrypt");

require("dotenv").config();
app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

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

/* check wachtwoord */ 
async function checkUser(email, wachtwoord) {
  const user = await db.collection("users").findOne({ email: email });
  if (user) {
    let checkWachtwoord = await bcrypt.compare(wachtwoord, user.wachtwoord);

    if (checkWachtwoord) {
      return true;
    } else {
      return false; 
    }
  } else {
    return false;
  }
}

/* login */
app.post("/inloggen", async (req, res) => {
  let email = req.body.email
  let wachtwoord = req.body.wachtwoord

  logginResultaat = await checkUser(email, wachtwoord);

  if (logginResultaat) {
    res.redirect("/profiel");
  } else {
    res.send('email of wachtwoord is onjuist');
  }
});

/* registratie */
app.post("/", async (req, res) => {
  bcrypt.hash(req.body.repassword, 10, async (err, hashedWachtwoord) => {

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
      wachtwoord: hashedWachtwoord,
    };

    await db.collection("users").insertOne(userData);
    res.redirect("/profiel");
  });
});

// Routes
app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/adoptie", async (req, res) => {
  // Getting the animals
  const dieren = await db.collection("dieren").find().toArray();
  // Making an array of objects of animals

  console.log(dieren);
  res.render("pages/adoptie", { dieren: dieren });
});

// Dynamic route for the animals
app.get("/adoptie/:name", async function (req, res) {
  const id = req.query.id;
  let dier;
  try {
    // Zoek de bijhorende dier erbij
    dier = await db.collection("dieren").findOne({ _id: new ObjectId(id) });
  } finally {
    return res.render("pages/dier", { dier: dier });
  }
});

app.get("/toevoegen", (req, res) => {
  res.render("pages/toevoegen");
});

app.get("/favorieten", (req, res) => {
  res.render("pages/favorieten");
});
app.get("/mail", (req, res) => {
  res.render("pages/mail");
});
app.get("/profiel", (req, res) => {
  res.render("pages/profiel");
});

app.get("/inloggen", (req, res) => {
  res.render("pages/inloggen");
});
app.get("/registreren", (req, res) => {
  res.render("pages/registreren");
});

app.listen(port, () => {
  console.log(`Ik luister naar poort: ${port}`);
});
