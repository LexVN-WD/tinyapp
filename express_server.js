// Imports
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


// random string url id generator
const randomString = Math.random().toString(36).substring(2, 8);

function generateRandomString() {
  return randomString;
 };


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// Adding Routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


/* Redirect to update url page */
app.get("/urls/<%= id%>/update", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.redirect("/urls/<%= id%>");
});

//GET route to render urls_new template
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
})

// GET route to handle shortURL requests and redirect to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

/* New Url */
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

/* Delete Existing Url */
app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  delete urlDatabase[req.params.id]
  res.redirect("/urls");
});

/* Update Existing Url */
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL
  res.redirect(`/urls/${id}`);
});

/* Redirect to update url page */
app.get("/urls/<%= id%>/update", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.redirect("/urls/<%= id%>");
});

// Sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});