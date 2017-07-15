
// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var path = require('path');

var mongoose = require("mongoose");
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");
var Savedarticle = require("./models/Savedarticle.js");

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

app.set('views', path.join(__dirname, '/views'));
app.engine("handlebars", exphbs({ defaultLayout: "layout" }));
app.set("view engine", "handlebars");

// =========  Database configuration with mongoose ===============
// ---------  define local MongoDB URI ----------
var localMongo = "mongodb://localhost/OnionPeeler1";
var MONGODB_URI = 'mongodb://<dbuser>:<dbpassword>@ds159662.mlab.com:59662/heroku_vng3nmkm';

//mongoose.connect(localMongo);

if (process.env.MONGODB_URI){
    // this executes if this is being executed in heroku app
    mongoose.connect(process.env.MONGODB_URI);
} else {
    // this ececutes if this is being executed on local machine
    mongoose.connect(localMongo);
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

// Get Homepage
app.get('/', function (req, res) {
    res.render('home');
});

app.get('/saved', function (req, res) {
        Savedarticle.find({}) 
        
        .populate("comments")

        .exec(function (error, doc) {
        // Send any errors to the browser
        if (error) {
            res.send(error);
        }
        // Or send the doc to the articles in handlebars
        else {
            res.render("saved", { articles: doc }); 
            //console.log(doc[0].comments);
        }
    })
});

app.get('/scraped', function (req, res) {

    Article.find({}, function (error, doc) {
        // Send any errors to the browser
        if (error) {
            res.send(error);
        }
        // Or send the doc to the articles in handlebars
        else {
            //res.json(doc);
            res.render("scraped", { articles: doc }); 
        }
    });
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// A GET request to scrape the echojs website
app.get("/scrape", function (req, res) {

    console.log("Scrape in Routes reached.")

    // First, we grab the body of the html with request
    request("http://www.theonion.com/", function (error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Now, we grab every h2 within an article tag, and do the following:
        $("article.summary").each(function (i, element) {

            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children("div").children("div").children("header").children("h2").text();
            result.link = $(this).children("a").attr("href");

            // Using our Article model, create a new entry
            // This effectively passes the result object to the entry (and the title and link)
            var entry = new Article(result);

            console.log("-------------------------------------");
            console.log("Entry: ");
            console.log(entry);
            console.log("-------------------------------------");

            // Now, save that entry to the db
            entry.save(function (err, doc) {
                // Log any errors
                if (err) {
                    console.log(err);
                }
                // Or log the doc
                else {
                    console.log(doc);
                }
            });
        });
        //res.redirect('/scraped');
    });
    // Tell the browser that we finished scraping the text
    res.send("Scrape Complete");
});

// Grab an article by it's ObjectId
app.post("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  //.populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      console.log("doc");
      console.log(doc);
      res.json(doc);

      var result = {};

      result.title = doc.title;
      result.link = doc.link;

      // Create a new note and pass the req.body to the entry
      var newSavedarticle = new Savedarticle(result);

      // And save the new note the db
      newSavedarticle.save(function(error, doc) {
        // Log any errors
        if (error) {
          console.log(error);
        }
        // Otherwise
        else {
          // Or send the document to the browser
          //res.send(doc);
          console.log("newSavedarticle");
          console.log(newSavedarticle);
        }
      });
    }
  });
}); 


app.get("/delete/:id", function(req, res) {
  Savedarticle.findByIdAndRemove(req.params.id, function (err, doc){
    if(err) { 
      throw err; 
    } else {
      res.redirect('/saved');
    };
  });
});


// Create a new note or replace an existing note
app.post("/comments/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newComment = new Comment(req.body);

  // And save the new note the db
  newComment.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Savedarticle.findOneAndUpdate({ "_id": req.params.id }, {$push: {"comments": doc._id }})

      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});


// Grab an article by it's ObjectId
app.get("/comments/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("comments")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
}); 

app.get("/deletecomment/:id", function(req, res) {
  Comment.findByIdAndRemove(req.params.id, function (err, doc){
    if(err) { 
      throw err; 
    } else {
      res.redirect('/saved');
    };
  });
});



app.listen(process.env.PORT || 8001, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
