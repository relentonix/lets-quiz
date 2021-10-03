import React from 'react';
import axios from 'axios';
import { Jumbotron, Container, Card, Row, Col, Button, Table } from 'react-bootstrap';
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import "../styles/playQuiz.css";
import { Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { setLoginError } from '../actions/errorAction';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp,faArrowDown } from '@fortawesome/free-solid-svg-icons';

// Display Each question individually
const DisplayQuestion = (props) => {
    let question = props.question;
    const [answer, setAnswer] = React.useState();
    const [disableChange, setDisableChange] = React.useState(false);

    React.useEffect(() => {     // effect to disable answer change after time up
        setAnswer(0)
        setDisableChange(false)
    }, [question])

    const handleAnswerChange = (value) => {     // handle answer click
        if (disableChange === false && props.timeLeft > 0) {
            setAnswer(value)
            if (value === question.answer) {
                props.setScore(props.score + 1);
            }
            setDisableChange(true);
        }
    }
    const classString = "btn-block option-button border border-secondary"

    const options = props.options;      // display each option
    const displayOptions = options.map((option, key) => {
        return (
            <Col xs={12} className="my-2" key={key}>
                <div onClick={() => handleAnswerChange(option)}
                    className={`${classString} ${option === question.answer ? props.timeLeft === 0 || answer === option ? "bg-success text-white" : "" : answer === option ? "bg-danger text-white" : ""}`}>
                    <strong>{question[option]}</strong>
                </div>
            </Col>
        )
    })
    return (
        <Row>
            <Col md={{ span: "6", offset: "3" }} className="text-center">
                <Card style={{ background: "transparent", border: "none" }}>
                    <Card.Body>
                        <Card.Title>{question.description}</Card.Title>
                        <Row>
                            {displayOptions}
                        </Row>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    )
}

//display leaderboard
const DisplayLeaderboard = (props) => {
    const [sortByField, setSortByField] = React.useState("accuracy");
    const [sortByOrder, setSortByOrder] = React.useState("desc");
    const [displayPlayers, setDisplayPlayers] = React.useState(<tr></tr>);

    let players = props.players
    players.map((player, key) => {
        let score = 0, outOf = 0;
        player.gamesPlayed.forEach((game) => {
            score += game.score; outOf += game.outOf;
        })
        player.totalScore = score;
        player.totalPoint = outOf;
        player.totalGamesPlayed = player.gamesPlayed.length;
        player.accuracy = Number(((score / outOf) * 100).toFixed(2));
    })
    React.useEffect(() => {
        if (sortByOrder === "asc") {
            players.sort((a, b) => {
                if (a[sortByField] > b[sortByField])
                    return 1;
                else return -1;
            })
        } else {
            players.sort((a, b) => {
                if (a[sortByField] < b[sortByField])
                    return 1;
                else return -1;
            })
        }
        const playerData = players.map((player, key) => {
            return (
                <tr key={key}>
                    <td>{key + 1}</td>
                    <td>{player.username}</td>
                    <td>{player.totalScore}</td>
                    <td>{player.totalPoint}</td>
                    <td>{player.totalGamesPlayed}</td>
                    <td>{player.accuracy} %</td>
                </tr>
            )
        })
        setDisplayPlayers(playerData);
    }, [sortByField,sortByOrder,players]);

    const handleSortClick = field => {
        setSortByField(field);
        setSortByOrder(sortByOrder === "asc" ? "desc" : "asc");
    }
    const tableHeader = [
        { a: "username", b: "Name" },
        { a: "totalScore", b: "Score" },
        { a: "totalPoint", b: "Max" },
        { a: "totalGamesPlayed", b: "Games Played" },
        { a: "accuracy", b: "Accuracy" },
    ]
    const displayTableHeader = tableHeader.map((header, key) => {
        return (
            <th onClick={() => handleSortClick(header.a)} key={key}
                className="leaderboard-th">{header.b} {' '}
                {sortByField === header.a ?
                    sortByOrder === "asc" ? <FontAwesomeIcon icon={faArrowUp} />
                        : <FontAwesomeIcon icon={faArrowDown} />
                :""}
            </th>   
        )
    })
    return (
        <>
            <h3 className="text-center mt-3">Leaderboards</h3>
            <Table variant="secondary" hover className="my-3 table-responsive">
                <thead><tr>
                    <th>Rank</th>
                    {displayTableHeader}
                </tr></thead>
                <tbody>
                    {displayPlayers}
                </tbody>
            </Table>
        </>
    )
}

// main render function
function PlayQuiz(props) {
    const [currQuiz, setCurrQuiz] = React.useState({});         // hold quiz data
    const [currQuestion, setCurrQuestion] = React.useState();   // hold current question 
    const [score, setScore] = React.useState(0);                // hold player score
    const [endQuiz, setEndQuiz] = React.useState(false);        // flag to check for end of quiz
    const { quizID } = props.match.params;
    const [options, setOptions] = React.useState(["A", "B", "C", "D"]); // initial option array
    const [numberOfQuestionsForQuiz, setNumberOfQuestionsForQuiz] = React.useState(7);
    const [redirect, setRedirect] = React.useState(false);
    const [author, setAuthor] = React.useState();
    const dispatch = useDispatch();

    // function to shuffle an array
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    React.useEffect(() => {
        if (props.isAuthenticated === false) {
            dispatch(setLoginError({
                errorType: "error", message: "Login required"
            }));
            setRedirect(true);
        }
        if (props.isAuthenticated)
            axios
                .get("/fetchQuiz/" + quizID)     // fetch current quiz data
                .then(res => {
                    shuffleArray(res.data.questions);
                    setNumberOfQuestionsForQuiz(Math.min(numberOfQuestionsForQuiz, res.data.totalQuestions));
                    setCurrQuiz(res.data);
                    setAuthor(res.data.author);
                })
                .catch(err => {
                    console.log('Error fetch quiz', err);
                })
    }, [props.isAuthenticated])
    const [timeLeft, setTimeLeft] = React.useState();       // hold time left for each question
    const [currIndex, setCurrIndex] = React.useState();     // hold index of current question
    const [quizStart, setQuizStart] = React.useState();     // hold buffer time before start of quiz
    const [flagQuizStart, setFlagQuizStart] = React.useState(false);    // flag for start of quiz
    const timeForEachQuestion = 5;

    React.useEffect(() => {
        if (flagQuizStart === true) {
            setQuizStart(5);
            setCurrIndex(0);
        }
    }, [flagQuizStart])

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(timeLeft > 0 ? timeLeft - 1 : 0);
        }, 1000);
        return () => clearTimeout(timer);
    }, [timeLeft])

    React.useEffect(() => {
        if (currIndex === 0 && quizStart === 0 && currQuiz.questions) {
            setCurrQuestion(currQuiz.questions[currIndex])
            setCurrIndex(currIndex + 1)
            setTimeLeft(timeForEachQuestion)
        }
        const timer = setTimeout(() => {
            setQuizStart(quizStart > 0 ? quizStart - 1 : undefined);
        }, 1000);
        return () => clearTimeout(timer);
    }, [quizStart])
    React.useEffect(() => {
        if (currQuiz.questions && currIndex > numberOfQuestionsForQuiz && endQuiz === false) {
            setEndQuiz(true);
            postQuizScores();
        }
        const questionTimer = setTimeout(() => {
            if (currQuiz.questions && currIndex < numberOfQuestionsForQuiz) {
                let temp = options;
                shuffleArray(temp);
                setOptions(temp);
                setCurrQuestion(currQuiz.questions[currIndex])
                setTimeLeft(timeForEachQuestion)
            }
            setCurrIndex(currIndex + 1)
        }, (timeForEachQuestion + 2) * 1000)
        return () => clearTimeout(questionTimer);
    }, [currIndex])

    const postQuizScores = () => {
        const game = {
            score: score,
            outOf: numberOfQuestionsForQuiz,
            Date: new Date(),
        }
        axios.post("/saveResult/" + quizID, { game })     // fetch current quiz data
            .then(res => {
                axios.get("/fetchQuiz/" + quizID)
                    .then(res => setCurrQuiz(res.data)).catch(err => { console.log(err) })
            }).catch(err => {
                console.log('Error saving results', err);
            })
    }

    const displayRemainingTime = ({ remainingTime }) => {
        return (
            <div>{remainingTime > 0 ? <h1><strong>{remainingTime}</strong></h1> : <h4>Time up</h4>}</div>
        )
    }
    return (
        <Container className="pt-5">
            {redirect ? <Redirect push to="/login" /> : ""}
            {quizStart > 0 || flagQuizStart === false || endQuiz ? <Jumbotron className="bg-dark my-3 text-white">
                <h1>{currQuiz.title}</h1>
                <p>Total Questions : {currQuiz.totalQuestions}</p>
                {currQuiz.description ? <p>{currQuiz.description}</p> : ""}
                {currQuiz.tags && currQuiz.tags.length > 0 ? "Quiz Tags :" : ""}
                {currQuiz.tags ?
                    currQuiz.tags.map((tag, i) => <div className="m-1 btn btn-outline-success" key={i}>{tag}</div>)
                    : ""}
                {author && props.user && author.id === props.user._id ?
                    <div>
                        You are Author :
                        <Link to={"/editQuiz/" + quizID}>
                            <Button variant="outline-warning m-1">Edit Quiz</Button>
                        </Link>
                        <Link to={{
                            pathname: "/addQuestion/" + quizID,
                            state: {
                                title: currQuiz.title
                            }
                        }}>
                            <Button variant="outline-warning m-1">Add Questions</Button>
                        </Link>
                    </div>
                    : ""}
            </Jumbotron> : ""}
            <Row>
                <Col md={{ span: "6", offset: "3" }}>
                    <div className="timerDiv text-center">
                        {currQuestion ?
                            endQuiz ? "Time is Up ..." :
                                <>
                                    <h3>Question {currIndex}</h3>
                                    <CountdownCircleTimer
                                        isPlaying
                                        strokeWidth="20"
                                        duration={timeForEachQuestion}
                                        onComplete={() => {
                                            return [true, 2000]
                                        }}
                                        colors={[
                                            ['#5cb85c', 0.5],
                                            ['#f0ad4e', 0.25],
                                            ['#d9534f', 0.25],
                                        ]}
                                    >
                                        {displayRemainingTime}
                                    </CountdownCircleTimer>
                                </>
                            :
                            flagQuizStart === false ?
                                <>
                                    <Button variant="outline-primary" onClick={() => setFlagQuizStart(true)}>Start Now</Button>
                                    {currQuiz.players ? <DisplayLeaderboard players={currQuiz.players} /> : ""}
                                </>
                                : quizStart ? <h1>Quiz starts in {quizStart}</h1> : ""
                        }
                    </div>
                </Col>
            </Row>
            {endQuiz === false ?
                currQuestion ? <DisplayQuestion question={currQuestion} key="1" options={options} score={score} setScore={setScore} timeLeft={timeLeft} /> : ""
                :
                <>
                    <Row>
                        <Col md={{ span: "6", offset: "3" }}>
                            <Card style={{ background: "transparent", border: "none" }}>
                                <Row className="no-gutters h-100">
                                    <Col md={4}>
                                        <Card.Img className="py-2" src="/celebrate.png" />
                                    </Col>
                                    <Col md={8}>
                                        <Card.Body className="text-center">
                                            <h1>Final Score</h1>
                                            <h1>{score}/{numberOfQuestionsForQuiz}</h1>
                                        </Card.Body>
                                    </Col>
                                </Row>
                            </Card>
                            {currQuiz.players ? <DisplayLeaderboard players={currQuiz.players} /> : ""}
                        </Col>
                    </Row>
                </>
            }
        </Container>
    )
}
const mapStateToProps = state => {
    return {
        isAuthenticated: state.user.isAuthenticated,
        user: state.user.user,
    }
}
export default connect(
    mapStateToProps,
    { setLoginError }
)(PlayQuiz)
