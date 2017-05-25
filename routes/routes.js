
var express = require("express");

var router = express.Router();

var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/saved', function(req,res){
    res.render('saved');
});

router.get('/homepage', function(req,res){
    res.render('scraped');
});


// A GET request to scrape the echojs website
router.get("/scrape", function(req, res) {

  // reset newArticles array
  newArticles = [];
  // First, we grab the body of the html with request
  request("http://www.echojs.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      console.log("-------------------------------------");
      console.log("Entry: ");
      console.log(entry);
      console.log("-------------------------------------");
      
      newArticles.push(entry);


      // router.get("/", function(req, res) {
      //   burger.all(function(data) {
      //     var hbsObject = {
      //       burgers: data
      //     };
      //     console.log(hbsObject);
      //     res.render("index", hbsObject);
      //   });
      // });


      // // Now, save that entry to the db
      // entry.save(function(err, doc) {
      //   // Log any errors
      //   if (err) {
      //     console.log(err);
      //   }
      //   // Or log the doc
      //   else {
      //     console.log(doc);
      //   }
      // });
    });
    var hbsObject = {
      articles: newArticles
    };
    res.render("scraped", hbsObject);

  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});


// // This will get the articles we scraped from the mongoDB
// app.get("/articles", function(req, res) {

//   // Using our Article model, "find" every article in our article db
//   Article.find({}, function(error, doc) {
//     // Send any errors to the browser
//     if (error) {
//       res.send(error);
//     }
//     // Or send the doc to the browser
//     else {
//       res.send(doc);
//     }
//   });
// });

// // This will grab an article by it's ObjectId
// app.get("/articles/:id", function(req, res) {

 
//   Article.find({id: req.params.id})
//     // and run the populate method with "comments",
//     .populate("comments")
//     // then responds with the article with the comments included
//     .exec(function(error, doc) {
//       // Send any errors to the browser
//       if (error) {
//         res.send(error);
//       }
//       else {
//         res.send(doc);
//       }
//     });
// });

// // Create a new comment or replace an existing comment
// app.post("/articles/:id", function(req, res) {

//   // TODO
//   // ====
//   // save the new comment that gets posted to the Comments collection
//   // then find an article from the req.params.id
//   // and update it's "comment" property with the _id of the new comment

//   // This POST route handles the creation of a new book in our mongodb books collection
// app.post("/submit", function(req, res) {

//   var newComment = new Comment(req.body);

// // Save the new book in the books collection
//   newComment.save(function(err, doc) {
//     // Send an error to the browser if there's something wrong
//     if (err) {
//       res.send(err);
//     }
//     // Otherwise...
//     else {
//     // Find one library in our Library collection (there's only one, so that's fine),
//     // then update it by pushing the object id of the book we just saved
//     //
//     // REMEMBER: doc is a variable containing the document of the book we just saved,
//     // so calling doc._id will grab the id of the doc, in this case, our new book

//     // ALSO: We need "{new: true}" in our call,
//     // or else our query will return the object as it was before it was updated
//       Article.findOneAndUpdate({"_id": req.params.id}, {"comments": doc._id })
//       .exec(function(error, doc) {
//         // Send any errors to the browser
//         if (error) {
//           res.send(error);
//         }
//         // Or send the doc to the browser
//         else {
//           res.send(doc);
//         }
//       });
//     }
//   });
// });
// });

// Export routes for server.js to use.
module.exports = router;