const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt  = require("bcrypt");
const saltRounds = 10;
const {emailCheck, lookUpUser, urlsForUser, generateRandomString} = require("./helpers.js");

/************************************************************* */
//Middleware
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

/************************************************************* */
//Databse
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
  b2xVn2:{longURL: "http://www.lighthouselabs.ca", userID: 'aJ48lW'},
  i3BoGr:{longURL: "http://www.google.com", userID: 'aJ48lW'},
};

/******************************************************** */
//Routes

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const filteredURL = urlsForUser(req.session["user_id"], urlDatabase);
  const templateVars = {
    urls: filteredURL,
    username: users[req.session["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  };
  res.redirect(`/urls/${randomShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURLCode = req.params.shortURL;
  if (users[req.session["user_id"]] && users[req.session["user_id"]].id === urlDatabase[shortURLCode].userID) {
    delete urlDatabase[shortURLCode];
    res.redirect("/urls");
  }else{
    res.send('only the creator can change the URL');
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURLCode = req.params.shortURL;
  const longURL = req.body.longURL;
 
  if (users[req.session["user_id"]] && users[req.session["user_id"]].id === urlDatabase[shortURLCode].userID) {
    urlDatabase[shortURLCode].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.send('only creator can change the URL');
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: users[req.session["user_id"]],
  };
  if (!templateVars.username) {
    res.redirect('../login');
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    username: users[req.session["user_id"]],
  };
  if (!templateVars.username) {
    res.redirect('../login');
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userId = lookUpUser(userEmail, userPassword, users);

  if (!emailCheck(userEmail, users)) {
    return res.status(403).send("Error! Email cannot be found.");
  } else if (!userId) {
    return res
      .status(403)
      .send("Error! Password is incorrect.");
  }

  
  req.session["user_id"] = userId;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: users[req.session["user_id"]]
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    res.status(400);
    res.send("Error! No email or password is given");
  } else if (emailCheck(userEmail, users)) {
    res.status(400);
    res.send("Error! Email already exist!");
  } else {
    const userRandomID = generateRandomString();
    users[userRandomID] = {
      id: userRandomID,
      email: userEmail,
      password: bcrypt.hashSync(userPassword, saltRounds)
    };
  

    req.session['user_id'] = userRandomID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
