// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var SavedarticleSchema = new Schema({
  // title is a required string
  title: {
    type: String,
    required: true
  },
  // link is a required string
  link: {
    type: String,
    required: true
  },
  // This only saves one comment's ObjectId, ref refers to the Comment model
  comments: [
    {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }
  ]
});


// Create the Article model with the ArticleSchema
var Savedarticle = mongoose.model("Savedarticle", SavedarticleSchema);

// Export the model
module.exports = Savedarticle;


