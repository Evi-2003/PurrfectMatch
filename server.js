const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 3000;

require("dotenv").config();
app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(express.urlencoded({extended: true})) 

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

/* login */ 
app.get('/', async (req, res) => {
  let email = req.body.email
  let wachtwoord = req.body.wachtwoord
  const users = await db.collection('users').find({email: email, wachtwoord: wachtwoord})
  if (users) {
    res.render('pages/index')
  } else {
    res.render('pages/registreren')
  }
})

/* registratie */
app.post('/pages/registreren', async (req, res) => {
  let userData = {
    email: req.body.email, 
    wachtwoord: req.body.wachtwoord
  }
  await db.collection('users').insertOne(userData);
  res.redirect('/pages/index');
})

// Routes
app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/adoptie", (req, res) => {
  res.render("pages/adoptie");
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
