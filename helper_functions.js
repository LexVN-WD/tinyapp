// Helper Function Storage

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

// Helper function that returns URLS where userID is equal to ID of currently logged-in user
const urlsForUser = (id, users) => {
  for (keys in users) {
    if (id === users[id].userID) {
      urls[keys] = {
        longURL: users[keys].longURL,
      }
    }
  }
  return false;
}


module.exports = {
  randomID,
  findUserByEmail,
  urlsForUser,
}