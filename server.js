const express = require("express");
const app = express();
const port = 3000;

require('dotenv').config()
app.set('view engine', 'ejs') 
app.use(express.static('static'))

app.get("/", (req, res) => {
  res.send("<h1>PurrfectMatch</h1>");
});

app.listen(port, () => {
  console.log(`Ik luister naar poort: ${port}`);
});
