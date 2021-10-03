const { Mongoose } = require("mongoose");
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    username: String,
    password: String,
    phone: String,
    google: {
        id: String,
        token: String,
        name: String,
        email: String,
        photo: String
    },
    facebook: {
        id: String,
        token: String,
        name: String,
        email: String,
        photo: String
    },
    quizzes: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            title:String,
            gamesPlayed: [
                {
                    score: Number,
                    outOf: Number,
                    Date: Date,
                }
            ]
        }
    ]
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
