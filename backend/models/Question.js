const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  symptoms: String,
  age: Number,
  recommendation: String
}, {timestamps:true});

module.exports = mongoose.model('Question', QuestionSchema);