const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt  = require("bcrypt");
const alert = require("alert");
const saltRounds = 10;
const {emailCheck, urlsForUser, generateRandomString} = require("./helpers.js");

/**************************Middleware functions******************************** */
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

/**************************Databases*********************************** */
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds)
  },
};

const urlDatabase = {
  b2xVn2:{longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
  i3BoGr:{longURL: "http://www.google.com", userID: "aJ48lW"},
};

/***************************Routes***************************** */

app.get("/", (req, res) => {
  const templateVars = {
    username: users[req.session["user_id"]]
  };
  if(!templateVars.username){
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const filteredURL = urlsForUser(req.session["user_id"], urlDatabase);
  const templateVars = {
    urls: filteredURL,
    username: users[req.session["user_id"]]
  };
  if(!templateVars.username){
    return res.redirect("/login");
  }
  return res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    alert("Please log in to see content!");
    return res.redirect("/login");
  }
  const randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = {
    longURL: req.body.longURL,
    userID
  };
  
  return res.redirect(`/urls/${randomShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!users[req.session["user_id"]]) {
    alert("Please log in to see content!");
    return res.redirect("/login");
  } else if (users[req.session["user_id"]] && users[req.session["user_id"]].id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  } else {
    return res.send("only the creator can delete the URL");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;

  if (!users[req.session["user_id"]]) {
    alert("Please login first!");
    return res.redirect("/login");
  } else if (users[req.session["user_id"]] && !longURL){
    alert("Please fill the URL");
    return res.redirect(`/urls/${shortURL}`);
  }
  
  if (users[req.session["user_id"]] && users[req.session["user_id"]].id !== urlDatabase[shortURL].userID) {
    return res.send("only the creator can edit the URL");
  } else {
    urlDatabase[shortURL].longURL = longURL;
    return res.redirect("/urls");
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: users[req.session["user_id"]],
  };
  if (!templateVars.username) {
    return res.redirect("/login");
  }

  return res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(!urlDatabase[shortURL]) {
    alert("Short URL code does not exist! Please try again.");
    return res.redirect("/urls");
  }
  
  if (users[req.session["user_id"]] && users[req.session["user_id"]].id !== urlDatabase[shortURL].userID) {
    return res.send("only the creator can edit the URL");
  }
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    username: users[req.session["user_id"]],
  };
  if (!templateVars.username) {
    return res.redirect("../login");
  }
  return res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]){
    alert("Short URL code does not exist!");
    return res.redirect(`/urls`);
  }

  const longURL = urlDatabase[req.params.shortURL].longURL;
  return res.redirect(longURL);  
});

app.get("/login", (req, res) => {
  if(users[req.session["user_id"]]){
    return res.redirect("urls");
  }
  return res.render("login");
});

app.get("/register", (req, res) => {
  if(users[req.session["user_id"]]){
    return res.redirect("urls");
  }
  const templateVars = {
    username: users[req.session["user_id"]],
    error: null
  };
  return res.render("register", templateVars);
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = emailCheck(userEmail, users);

  if (!userID) {
    alert("Error! Email cannot be found.")
    return res.status(403).redirect("/login");
  } else if(!bcrypt.compareSync(userPassword, users[userID].password)) {
    alert("Error! Password is incorrect.")
    return res.status(403).redirect("/login");
  }
  
  req.session["user_id"] = userID;
  return res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    alert("Error! No email or password is given")
    return res.status(400).render("register");
  } else if (emailCheck(userEmail, users)) {
    alert("Email already exist!");
    return res.status(400).render("register");
  }
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: userEmail,
      password: bcrypt.hashSync(userPassword, saltRounds)
    };

  req.session["user_id"] = userID;
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
