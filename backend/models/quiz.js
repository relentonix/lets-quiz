var mongoose = require("mongoose");
var quizSchema = new mongoose.Schema({
    title: String,
    totalQuestions: Number,
    image: String,
    description: String,
    tags: [
        String,
    ],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    players: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: String,
            gamesPlayed: [
                {
                    score: Number,
                    outOf:Number,
                    Date:Date,
                }
            ]
        }
    ],
    questions: [
        {
            description: String,
            A:String,
            B:String,
            C:String,
            D: String,
            answer:String
        },
    ]
});
module.exports = mongoose.model("Quiz", quizSchema);
