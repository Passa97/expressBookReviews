const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username":"Marco","password":"qwerty123456"}];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    const userMatches = users.filter((user) => user.username === username);
    return userMatches.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    const matchingUsers = users.filter((user) => user.username === username && user.password === password);
    return matchingUsers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
    const username = req.body.username;
    const password = req.body.password;

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({data:password}, "access", {expiresIn: 3600});
        req.session.authorization = {accessToken,username};
        return res.status(200).send("User successfully logged in");
    }
    else {
        return res.status(208).json({message: "Invalid username or password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
    const requestedIsbn = req.params.isbn;
    const reviewText = req.query.review;
    const username = req.session.authorization.username;

    if (!username) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const book = books[requestedIsbn];

    if (book) {
      book.reviews[username] = reviewText; // Add or modify review based on username
      res.json({ message: "Review added/modified successfully" });
    } else {
      res.status(404).json({ message: "Book not found" }); // Handle book not found
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const requestedIsbn = req.params.isbn;
    const username = req.session.authorization.username; // Retrieve username from session

    if (!username) {
      return res.status(401).json({ message: "Unauthorized" }); // Handle unauthorized access
    }

    const book = books[requestedIsbn];

    if (book) {
      if (book.reviews[username]) { // Check if a review exists for the user
        delete book.reviews[username]; // Delete the user's review
        res.json({ message: "Review deleted successfully" });
      } else {
        res.status(404).json({ message: "Review not found" }); // Handle review not found
      }
    } else {
      res.status(404).json({ message: "Book not found" }); // Handle book not found
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
