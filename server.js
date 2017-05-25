
// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var path = require('path');

var mongoose = require("mongoose");
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");

var request = require('request');
var cheerio = require('cheerio');


var newArticles = [];

// Initialize Express
var app = express();


// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));


// Set Handlebars.
var exphbs = require("express-handlebars");

app.set('views', path.join(__dirname, 'views'));
app.engine("handlebars", exphbs({ defaultLayout: "layout" }));
app.set("view engine", "handlebars");

// =========  Database configuration with mongoose ===============
// ---------  define local MongoDB URI ----------

var databaseUri = 'mongodb://heroku_7787qsks:gp9jm8tkki1fks0g95rnac6of2@ds147551.mlab.com:47551/heroku_7787qsks';

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

// Routes
// ======

// Import routes and give the server access to them.
var routes = require("./routes/routes.js");

app.use("/", routes);


// Listen on port 8001
app.listen(8001, function() {
  console.log("App running on port 8001");
});
