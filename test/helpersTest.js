const { assert } = require('chai');

const { findUserByEmail, randomID } = require('../helper_functions');

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

describe('findUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID, 'should return userRandomID')
  });
  it('should return false', function () {
    const user = findUserByEmail("alex@example.com", testUsers) // --> this email does not exist in testUsers object
    const expectedUserID = false;
    assert.equal(user, expectedUserID, 'should return false')
  });
});
