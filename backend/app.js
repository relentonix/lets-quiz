var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    flash = require("connect-flash"),
    cors = require('cors'),
    Quiz = require("./models/quiz"),
    TagSuggestion = require("./models/tagSuggestions"),
    User = require("./models/user"),
    methodOverride = require("method-override"),
    // seedDB = require("./seeds"),
    passport = require("passport"),
    LocalStrategy = require("passport-local");

//configure .env
// require('dotenv').config()

// -------------------------
//     connect routes
// -------------------------
// var quizRoutes = require("./routes/quiz")
//     indexRoutes = require("./routes/index"),
//     userRoutes = require("./routes/user");

// -------------------------
//     connect Database
// -------------------------
const url = process.env.MONGODB_URL || "mongodb://localhost/lets-quiz"
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// compress all responses
// const compression = require('compression');
// app.use(compression());

//minifying css files
// const minify = require('@node-minify/core');
// const cleanCSS = require('@node-minify/clean-css');

// minify({
//     compressor: cleanCSS,
//     input: './public/stylesheets/main.css',
//     output: './public/stylesheets/main-min.css',
//     callback: function (err, min) { }
// });
// minify({
//     compressor: cleanCSS,
//     input: './public/stylesheets/pagenotfound.css',
//     output: './public/stylesheets/pagenotfound-min.css',
//     callback: function (err, min) { }
// });

// -------------------------------------
//     Setup use and other requirements
// -------------------------------------
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));
// app.use(flash());
// app.locals.moment = require('moment');

// To disable browser caching
// app.set('etag', false)
// app.use((req, res, next) => {
//     res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
//     next()
// })

// ----------------------------
//     PASSPORT CONFIGURATION
// ----------------------------
app.use(require("express-session")({
    secret: "Harry Potter is my favourite movie",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// PASSPORT SERIALIZE AND DESERIALIZE
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});
passport.use(new LocalStrategy(User.authenticate()));

// require passport file for strategies
// require("./configure/passport");

// ---------------------------
//    setup local variables
// ---------------------------
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    // res.locals.success = req.flash("success");
    // res.locals.error = req.flash("error");
    next();
});
// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
// cors
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ extended: false }));

// ------------------
//     USE ROUTES
// ------------------
// app.use("/", indexRoutes);
// app.use("/quiz", quizRoutes);
// app.use("/dashboard", userRoutes);


// app.get('*', function (req, res) {
//     res.render('pagenotfound');
// });

app.post("/addQuiz", (req, res) => {
    let quiz = req.body.quiz;
    quiz.author = {
        id: req.user._id,
        username: req.user.username
    };
    Quiz.create(quiz, (err, createdQuiz) => {
        if (err) {
            res.status(401).send("Something went wrong");
        } else {
            res.json(createdQuiz);
        }
    })
})
app.post("/editQuiz/:quizID", (req, res) => {
    let quiz = req.body.quiz;
    let quizID = req.params.quizID;
    quiz.author = {
        id: req.user._id,
        username: req.user.username
    };
    quiz.players = [];
    Quiz.findByIdAndUpdate(quizID, quiz, (err, updateQuiz) => {
        if (err || !updateQuiz) {
            res.send(401).send("Something went wrong");
        } else {
            res.send("updated Successfully")
        }
    })
})
app.post("/addQuestion/:quizID", (req, res) => {
    let questions = req.body.questionRow;
    let quizID = req.params.quizID;
    Quiz.findOne({_id:quizID}, (err, foundQuiz) => {
        if (err || !foundQuiz) {
            res.send(401).send("Something went wrong");
        } else {
            foundQuiz.totalQuestions += questions.length;
            foundQuiz.questions.push(...questions);
            foundQuiz.save();
            res.send("Question added successfully");
        }
    })
})
app.get("/fetchSuggestion", (req, res) => {
    TagSuggestion.findOne({}, (err, suggestions) => {
        if (err || !suggestions) {
            res.status(401).send("Error fetching suggestions");   
        } else {
            res.json(suggestions.suggestions);
        }
    })
})
app.post("/addSuggestion", (req, res) => {
    TagSuggestion.findOne({}, (err, foundSuggestions) => {
        if (err) {
            res.status(401).send("Something went wrong");
        }else if (!foundSuggestions) {
            let suggestion = {
                suggestions:req.body.newSuggestions
            }
            TagSuggestion.create(suggestion, (err, newSuggestion) => {
                if (err || !newSuggestion) {
                    res.status(401).send("Something went wrong");
                } else {
                    res.send("suggestions added");
                }
            })
        } else {
            foundSuggestions.suggestions.push(...req.body.newSuggestions);
            foundSuggestions.save();
            res.send("suggestions added");
        }
    })
})

app.get("/fetchQuiz/:id", (req, res) => {
    Quiz.findOne({_id:req.params.id}, (err, foundQuiz) => {
        if (err) {
            res.status(401).send("Something went wrong");
        } else {
            res.json(foundQuiz);
        }
    })
})
app.get("/fetchAllQuiz", (req, res) => {
    Quiz.find({}, (err, foundQuiz) => {
        if (err) {
            res.status(401).send("Something went wrong");
        } else {
            foundQuiz.forEach((quiz) => {
                quiz.players = quiz.questions = undefined;
                quiz.tags = quiz.author = undefined;
            })
            res.json(foundQuiz);
        }
    })
})

app.post("/saveResult/:quizID", (req, res) => {
    let game = req.body.game;
    Quiz.findOne({ _id: req.params.quizID }, (err, foundQuiz) => {
        if (err || !foundQuiz) res.status(401).send("Something went wrong");
        else {
            if (!foundQuiz.players)
                foundQuiz.players = [];
            var index = foundQuiz.players.findIndex(user => user.id.toString() === req.user._id.toString())
            if (index === -1) {
                foundQuiz.players.push({
                    id: req.user._id,
                    username: req.user.username,
                    gamesPlayed:[game],
                })
            } else {
                foundQuiz.players[index].gamesPlayed.push(game);
            }
            User.findOne({ _id: req.user._id }, (err, foundUser) => {
                if (err || !foundUser) res.status(401).send("Something went wrong");
                else {
                    if (!foundUser.quizzes)
                        foundQuiz.quizzes = [];
                    var index = foundUser.quizzes.findIndex(quiz => quiz.id.toString() === foundQuiz._id.toString())
                    if (index === -1) {
                        foundUser.quizzes.push({
                            id: foundQuiz._id,
                            title: foundQuiz.title,
                            gamesPlayed: [game],
                        })
                    } else {
                        foundUser.quizzes[index].gamesPlayed.push(game);
                    }
                    foundUser.save();
                }
            })
            foundQuiz.save();
            res.send("success");
        }
    })
})

app.post("/register", (req, res) => {
    let user = req.body.user;
    user.password = undefined;
    let password = req.body.password;
    User.register(user, password, function (err, createdUser) {
        if (err || !createdUser) {
            if (err.message.includes("duplicate key")) {
                res.status(401).send("A user with the given email is already registered")    
            } else {
                res.status(401).send(err.message)
            }
        } else {
            passport.authenticate("local")(req, res, function () {
                res.send("success")
            });
        }
    });
})
app.post("/login", passport.authenticate("local",
    {
        // successReturnToOrRedirect: "/",
        failureRedirect: "",
        // failureFlash: true,
        // successFlash: 'Logged In successfully'
    }), function (req, res) {
        res.json({
            isAuthenticated: true,
            user: req.user
        })
    }
)

app.get("/isAuthenticated", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            isAuthenticated: true,
            user:req.user
        })
    } else {
        res.json({
            isAuthenticated: false,
            user: null
        })
    }
})

// ----------------------
//    get user logout
// ----------------------
app.get("/logout", function (req, res) {
    req.logout();
    res.send("Logged Out successfully");
})

app.listen(process.env.PORT || 8080, process.env.IP, function () {
    console.log("The Blog Server Has Started!");
});