// Imports
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

// Setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// random string url id generator
const randomString = Math.random().toString(36).substring(2, 8);

function generateRandomString() {
  return randomString;
 };


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let user;

app.get("/", (req, res) => {
  res.send("Hello!");
});

// Adding Routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies.username,
  };
  res.render("urls_show", templateVars);
});

/* Redirect to update url page */
app.get("/urls/<%= id%>/update", (req, res) => {
  res.redirect("/urls/<%= id%>");
});

//GET route to render urls_new template
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new");
});

// GET route to handle shortURL requests and redirect to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

/* New Url */
app.post("/urls", (req, res) => {
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

// log a cookie to the server
app.post("/login", (req, res) => {
  let username = req.body.username;
  let cookie = res.cookie("username", username);
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
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