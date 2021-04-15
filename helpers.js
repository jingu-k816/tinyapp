/*********************************************************** */
//Helper Functions

const emailCheck = (email, users) => {
  for (const key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
  return undefined;
};

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

const lookUpUser = (email, password, users) => {
  for (const key in users) {
    if (users[key].email === email && bcrypt.compareSync(password, users[key].password)) {
      return key;
    }
  }
  return false;
};

const urlsForUser = (id, urlDatabase) => {
  const urls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};
module.exports = {emailCheck, urlsForUser, generateRandomString, lookUpUser};