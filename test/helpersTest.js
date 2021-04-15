const { assert } = require('chai');
const { emailCheck, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  b2xVn2:{longURL: "http://www.lighthouselabs.ca", userID: 'aJ48lW'},
  i3BoGr:{longURL: "http://www.google.com", userID: 'aJ48lW'},
};

describe('emailCheck', function() {
  it('should return a user with valid email', function() {
    const user = emailCheck("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });

  it('shoud return undefined if no emails were found in the database', function() {
    const user = emailCheck("jingu@example.com", testUsers);
    const expectedOutput = undefined;
    
    assert.equal(user, expectedOutput);
  });
});

describe('urlsForUser', () => {
  it(`should return corresponding object that specific user has`, function() {
    const result = urlsForUser('aJ48lW', testUrlDatabase);
    const expectedOutput = {
      b2xVn2:{longURL: "http://www.lighthouselabs.ca", userID: 'aJ48lW'},
      i3BoGr:{longURL: "http://www.google.com", userID: 'aJ48lW'},
    };

    assert.deepEqual(result, expectedOutput);
  });

  it(`should return empty object when passing in a non existing userID`, () => {
    const result = urlsForUser('lighthouse', testUrlDatabase);
    const expectedOutput = {};

    assert.deepEqual(result, expectedOutput);
  });
});