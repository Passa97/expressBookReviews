const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({"username":username,"password":password});
            return res.status(200).json({message:`User ${username} registered`});
        }
        else {
            return res.status(400).json({message:`User ${username} already registered`});
        }
    }
    else {
        return res.status(404).json({message: "Must provide username and password"});
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  try {
    res.send(JSON.stringify(books, null, 4));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving book list" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  try {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({message: "Book not found"})
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Error retrieving book details"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  const booksByAuthor = [];

  //book keys
  const bookKeys = Object.keys(books);

  for (const key of bookKeys) {
    const book = books[key];
    if (book.author === author) {
        booksByAuthor.push(book);
    }
  }

  if (booksByAuthor.length > 0) {
    res.json(booksByAuthor)
  } else {
      res.status(404).json({ message: "No books found by that author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const booksByTitle = [];

  //book keys
  const bookKeys = Object.keys(books);

  for (const key of bookKeys) {
    const book = books[key];
    if (book.title === title) {
        booksByTitle.push(book);
    }
  }

  if (booksByTitle.length > 0) {
    res.json(booksByTitle)
  } else {
      res.status(404).json({ message: "No books found by that author" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
      const reviews = book.reviews;
      res.json(reviews);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
});

// Function to fetch book list using Promise callbacks
function getBookListWithPromise(url) {
    return new Promise((resolve, reject) => {
      axios.get(url)
        .then(response => resolve(response.data))
        .catch(error => reject(error));
    });
  }

  // Function to fetch book list using async-await
  async function getBookListAsync(url) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error; // Re-throw the error for handling in the route
    }
  }

  //Task 10
  public_users.get('/async', async function (req, res) {
    try {
      const bookList = await getBookListAsync('http://localhost:5000/'); //
      res.json(bookList);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving book list" });
    }
  });

    //Task 11
    public_users.get('/async/isbn/:isbn', async function (req, res) {
        try {
          const requestedIsbn = req.params.isbn;
          const book = await getBookListAsync("http://localhost:5000/isbn/" + requestedIsbn);
          res.json(book);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Error retrieving book details" });
        }
      });

      //Task 12
      public_users.get('/async/author/:author', async function (req, res) {
        try {
          const requestedAuthor = req.params.author;
          const book = await getBookListAsync("http://localhost:5000/author/" + requestedAuthor);
          res.json(book);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Error retrieving book details" });
        }
      });

      // Task 13
    public_users.get('/async/title/:title', async function (req, res) {
    try {
      const requestedTitle = req.params.title;
      const book = await getBookListAsync("http://localhost:5000/title/" + requestedTitle);
      res.json(book);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving book details" });
    }
  });

module.exports.general = public_users;
