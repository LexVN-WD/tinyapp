// Imports
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

// Setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// URL database variable
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Global users object 
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// random string url id generator
const randomID = () => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
 };


// Helper function to find user by email
const findUserByEmail = (users, userEmail) => {
  for (const userID in users) {
    if (users[userID]["email"] === userEmail) {
      return users[userID];
    }
  }
  return false;
};


console.log()



// ------ GET Requests ------ //

// GET - Landing Page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Adding Routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// GET - /urls
app.get("/urls", (req, res) => {
  let user = req.cookies["user_id"];
  let templateVars = { 
    urls: urlDatabase,
    user: users[user],
  };
  res.render("urls_index", templateVars);
});

//GET route to render urls_new template
app.get("/urls/new", (req, res) => {
  let user = req.cookies["user_id"];
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
  let user = req.cookies["user_id"];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user,
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
  const longURL = urlDatabase[id];
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

app.get("/register", (req, res) => {
  let user = req.cookies["user_id"];
  const templateVars = {
    user: user,
  };
  if (user) {
    res.redirect("/urls");
  }
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let user = req.cookies["user_id"];
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
  urlDatabase[newID] = req.body.longURL;
  const user = req.cookies["user_id"];
  const templateVars = {
    user: users[user],
  }
  if (!user) {
    res.send({ERROR: "Must be logged in to shorten URLS"});
  }
  res.redirect(`/urls/${newID}`);
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

// POST - Logout and clear cookie key-value pair
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

// POST - /register endpoint
app.post("/register", (req, res) => {
  const newID = randomID();
  let userEmail = req.body.email;
  let userPass = req.body.password;

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

  if (findUserByEmail(users, userEmail)) {
    return res.status(400).json({
      status: "email already exists"
    })
  } else {
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: req.body.password,
    }
  }
  res.cookie('user_id', newID);
  res.redirect("/urls");
  //console.log(users); //--> /test to make sure users object
});

// POST - Login Page
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPass = req.body.password;
  let user = findUserByEmail(users, userEmail)
  
  // if email cannot be found, return 403
  if (user === false) {
    return res.status(403).json({
      status: "email cannot be found"
    })
  };
  // email matches but passwords do not, return 403
  if (user !== false) {
    if (user.password !== userPass) {
      return res.status(403).json({
        status: "password does not match"
      })
    }
  }
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});






// Sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});