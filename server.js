
// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");

var mongoose = require("mongoose");
var request = require('request');
var cheerio = require('cheerio');


// Initialize Express
var app = express();


// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));


// =========  Database configuration with mongoose ===============
// ---------  define local MongoDB URI ----------

var databaseUri = 'mongodb://localhost/week18day3mongoose';

if (process.env.MONGODB_URI){
    // this executes if this is being executed in heroku app
    mongoose.connect(process.env.MONGODB_URI);
} else {
    // this ececutes if this is being executed on local machine
    mongoose.connect(databaseUri);
}

// =========  End databse configuration  ================

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


//  ============  Routes  =====================

// app.post("/submit", function(req, res) {

//   var user = new Example(req.body);

// // NORMAL METHOD BELOW

//   // Save a user to our mongoDB
//   user.save(function(error, doc) {
//     // Send an error to the browser
//     if (error) {
//       res.send(error);
//     }
//     // Or send the doc to our browser
//     else {
//       res.send(doc);
//     }
//   });
// });

// Listen on port 8001
app.listen(8001, function() {
  console.log("App running on port 8001");
});
