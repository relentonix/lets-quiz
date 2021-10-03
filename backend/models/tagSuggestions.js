var mongoose = require("mongoose");
var tagSuggestionSchema = new mongoose.Schema({
    suggestions: [
        String
    ]
});
module.exports = mongoose.model("TagSuggestion", tagSuggestionSchema);
