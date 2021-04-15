const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
/*************************************************** */
//Helper Functions
const generateRandomString = () => {
  let randomString = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i <= 5; i++) {
    let randomIndex = Math.floor(Math.random() * chars.length);
    let randomValue = chars[randomIndex];
    randomString += randomValue;
  }
  return randomString;
};

const emailCheck = (email, users) => {
  for (const key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
};

const lookUpUser = (email, password) => {
  for (const key in users) {
    if (users[key].email === email && users[key].password === password) {
      return key;
    }
  }
  return false;
};
/*********************************************************** */
//Databse
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

const urlDatabase = {
  b2xVn2:{longURL: "http://www.lighthouselabs.ca", userID: 'aJ48lw'},
  i3BoGr:{longURL: "http://www.google.com", userID: 'aj481W'}
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
  const templateVars = {
    urls: urlDatabase,
    username: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomShortURL = generateRandomString();
  urlDatabase[randomShortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${randomShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURLCode = req.params.shortURL;
  delete urlDatabase[shortURLCode];

  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURLCode = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURLCode] = longURL;

  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
  };
  if(!templateVars.username){
    res.redirect('../login');
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    username: users[req.cookies["user_id"]],
  };
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
  const userId = lookUpUser(userEmail, userPassword);

  if (!emailCheck(userEmail, users)) {
    return res.status(403).send("Error! Email cannot be found.");
  } else if (!userId) {
    return res
      .status(403)
      .send("Error! Password is incorrect.");
  }

  
  res.cookie("user_id", userId);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.id);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]]
  }
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
      password: userPassword,
    };

    res.cookie("user_id", userRandomID);
    console.log(users);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
