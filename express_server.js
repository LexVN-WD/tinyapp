// Imports
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

// Setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["secret keys"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Database Imports
const urlDatabase = require("./url_database");
const users = require("./users_database");

// Helper Function Imports
const {
  randomID,
  findUserByEmail,
  urlsForUser,
} = require("./helper_functions");

// ------ GET Requests ------ //

// GET - Landing Page
app.get("/", (req, res) => {
  let user;
  res.render("urls_home", user)
});

// Adding Routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// GET - /urls
app.get("/urls", (req, res) => {
  let user = req.session.user_id;
  if (!user) {
    res.send({ERROR: "You are not logged in"});
  }

  let templateVars = { 
    urls: urlsForUser(user),
    user: users[user],
  };
  res.render("urls_index", templateVars);
});

//GET route to render urls_new template
app.get("/urls/new", (req, res) => {
  let user = req.session.user_id;
  let templateVars = {
    user: users[user],
  };
  if (!user) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

// GET - /urls/:id (by shortURL handle)
app.get("/urls/:id", (req, res) => {
  let user = req.session.user_id;
  let id = req.params.id;
  if (!user) {
    res.send({ ERROR: "You need to be logged in to access this URL" });
  }
  const userObj = urlDatabase[id];
  
  if (!userObj) {
    res.send({ ERROR: "Invalid URL ID" });
  }

  if (user !== userObj.userID) {
    res.send({ ERROR: "This URL does not belong to you" });
  }

  const templateVars = {
    id: req.params.id,
    longURL: userObj.longURL,
    user: users[user],
  };

  res.render("urls_show", templateVars);
});

// GET - Redirect to update url page
app.get("/urls/<%= id%>/update", (req, res) => {
  res.redirect("/urls/<%= id%>");
});


// GET route to handle shortURL requests and redirect to longURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id].longURL;
  const templateVars = {
    id: id,
    longURL: longURL,
    user: users[id],
  }
  if (!longURL) {
    res.send({Error: "this tinyURL does not exist"})
  } else {
    res.redirect(longURL);
  }
});

// GET - Register Page
app.get("/register", (req, res) => {
  let user = req.session.user_id;
  const templateVars = {
    user: user,
  };
  if (user) {
    res.redirect("/urls");
  }
  res.render("urls_register", templateVars);
});

// GET - Login Page
app.get("/login", (req, res) => {
  let user = req.session.user_id;
  const templateVars = {
    user: user,
  };
  if (user) {
    res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});


// ------ POST Requests ------ //

// Posting New URL
app.post("/urls", (req, res) => {
  let newID = randomID();
  const user = req.session.user_id;
  //urlDatabase[newID] = req.body.longURL;
  urlDatabase[newID] = { longURL: req.body.longURL, userID: user };
  const templateVars = {
    user: users[user],
  }
  if (!user) {
    res.send({ ERROR: "Must be logged in to shorten URLS" });
  }
  res.redirect(`/urls/${newID}`);
});

/* Delete Existing Url */
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user = req.session.user_id;
  const userObj = urlDatabase[id];
  if (!user) {
    res.send({ ERROR: "You need to be logged in to access this URL" });
  }

  if (!userObj) {
    res.send({ ERROR: "Invalid URL ID" });
  }

  if (user !== userObj.userID) {
    res.send({ ERROR: "This URL does not belong to you" });
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

/* Update Existing Url */
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL
  res.redirect(`/urls/${id}`);
});

// POST - Logout and clear cookie key-value pair
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// POST - /register endpoint
app.post("/register", (req, res) => {
  const newID = randomID();
  let userEmail = req.body.email;
  let userPass = req.body.password;
  let hashedPass = bcrypt.hashSync(userPass, 10);

  // error code checks
  if (userEmail.length === 0) {
    return res.status(400).json({
      status: "invalid email entered"
    });
  };

  if (userPass.length === 0) {
    return res.status(400).json({
      status: "invalid password entered"
    });
  };

  if (findUserByEmail(userEmail, users)) {
    return res.status(400).json({
      status: "email already exists"
    })
  } else {
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: hashedPass,
    }
    //console.log(users[newID].password); --> checking for Hash
  }
  req.session.user_id = newID;
  res.redirect("/urls");
  //console.log(users); //--> /test to make sure users object
});

// POST - Login Page - Endpoint
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPass = req.body.password;
  let hashedPass = bcrypt.hashSync(userPass, 10);
  let user = findUserByEmail(userEmail, users)
  
  // if email cannot be found, return 403
  if (user === false) {
    return res.status(403).json({
      status: "email cannot be found"
    })
  };
  // email matches but passwords do not, return 403
  if (user !== false) {
    if (bcrypt.compareSync(user.password, hashedPass)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.send({ status: "password does not match"})
    }
  }
});






// Sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});