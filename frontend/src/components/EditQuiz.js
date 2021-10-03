import React from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Pagination } from 'react-bootstrap';
import { WithContext as ReactTags } from 'react-tag-input';
import "../styles/addQuiz.css";
import { connect, useDispatch } from 'react-redux';
import { setEditError } from "../actions/errorAction";
import { Redirect } from 'react-router-dom';

// component to display each question individually
const QuestionTag = (props) => {
    let question = props.question
    const handleOptionChange = e =>question.answer = e.target.value;
    const options = ["A", "B", "C", "D"];
    const displayOptionInput = options.map((option, i) => {
        return (
            <Form.Group className="col-md-6" key={i} controlId={"formGrid" + option}>
                <Form.Control type="text" placeholder={"Enter option " + option} defaultValue={question[option]||""}
                    onChange={(event) => question[option] = event.target.value} />
            </Form.Group>
        )
    })
    const displayCorrectRadio = options.map((option, i) => {
        return (
            <Form.Check inline label={option} key={i} type="radio" onChange={handleOptionChange}
                name={"correctOptionRadio-" + question.index} value={option || ""}
                defaultChecked={question.answer === option}
                id={"correctOptionRadio-" + option + "-" + question.index} />
        )
    })
    return (
        <div>
            <h6><strong>Question {question.index}</strong></h6>
            <Form.Group controlId="formGridDescription">
                <Form.Control type="text" placeholder="Enter Description" defaultValue={question.description||""}
                    onChange={(event) => question.description = event.target.value} />
            </Form.Group>
            <Form.Row>
                {displayOptionInput}
            </Form.Row>
            <div key="inline-radio" className="">
                <Row>
                    <Col xs={4}><Form.Label>Correct Option</Form.Label></Col>
                    <Col>{displayCorrectRadio}</Col>
                </Row>
            </div>
        </div>
    )
}
function EditQuiz(props) {
    const [redirect, setRedirect] = React.useState(false);
    const [currQuiz, setCurrQuiz] = React.useState({});         // hold quiz data
    const [questionRow, setQuestionRow] = React.useState([]);   // hold array of questions
    const [quizTags, setQuizTags] = React.useState([]);         // hold tags for current quiz
    const [quizTagsSuggestions, setQuizTagsSuggestions] = React.useState(); // holds tag suggestions
    const [currPage, setCurrPage] = React.useState(1);          // holds page number for question pagination
    const [currPageInterval, setCurrPageInterval] = React.useState({start:1,end:1});    // question pagination interval
    const { quizID } = props.match.params;      // quiz id passed from Link
    const [pageError, setPageError] = React.useState();
    const error = props.error;
    const dispatch = useDispatch();
    
    React.useEffect(() => {
        if (props.isAuthenticated === false) {
            dispatch(setEditError({
                errorType: "error", message: "Unauthorized"
            }));
            setRedirect(true);
        }
        if (props.isAuthenticated) {
            axios
                .get("/fetchQuiz/" + quizID)     // fetch current quiz data
                .then(res => {
                    if (res.data.author && props.user._id === res.data.author.id) {
                        setCurrQuiz(res.data);
                        fetchSuggestions();
                        res.data.questions.map((question, i) => question.index = i + 1);
                        setQuestionRow(res.data.questions);
                        let limit = Math.min(5, Math.ceil(res.data.totalQuestions / 5));
                        setCurrPageInterval({ start: 1, end: limit });
                        if (res.data.tags && res.data.tags.length > 0) {
                            let data = res.data.tags, formatted = [];
                            data.forEach((suggestion) => formatted.push({ id: suggestion, text: suggestion }))
                            setQuizTags(formatted)
                        }
                    } else {
                        setRedirect(true);
                    }
                }).catch(err => {
                    console.log('Error fetch quiz', err);
                })
        }
    }, [props.isAuthenticated]);

    const fetchSuggestions = () => {
        axios.get("/fetchSuggestion")       // fetch tags suggestions
            .then((res) => {
                let data = res.data, formatted = [];
                data.forEach((suggestion) => {
                    formatted.push({ id: suggestion, text: suggestion })
                })
                setQuizTagsSuggestions(formatted);
            }).catch(err => {
                console.log(err);
            })
    }
    const changeQuestions = (e) => {
        let currRow = questionRow, n = currRow.length, temp = currQuiz;
        if (e.target.value > 1000) {
            setPageError({ errorType: "error", message: "Exceeds question limit : 1000"});
            e.target.value = n;
            return;
        }
        if (e.target.value === "") {
            e.target.value = n;
            return;
        }
        temp.totalQuestions = e.target.value;
        setCurrQuiz(temp);
        if (e.target.value > n) {
            for (let i = n; i < e.target.value; i++) {
                currRow.push({
                    index: i + 1, description: "",
                    A: "", B: "", C: "", D: "", answer: ""
                })
            }
            if (currPageInterval.end - currPageInterval.start < 4) {
                let limit = Math.ceil(currRow.length / 5),interval=currPageInterval;
                interval.start = Math.max(1, currPage - 2);
                interval.end = Math.min(limit, interval.start + 4);
                if (interval.end === limit) {
                    interval.start = Math.max(1, limit - 4);
                }
                setCurrPageInterval(interval);
            }
        } else {
            while (e.target.value < currRow.length) {
                currRow.pop();
            }
            if (currPageInterval.end * 5 > Math.ceil(currRow.length / 5)) {
                let limit = Math.ceil(currRow.length / 5), interval = {};
                interval.start = Math.max(1, currPage - 2);
                interval.end = Math.min(limit, interval.start + 4);
                if (interval.end === limit) {
                    interval.start = Math.max(1, limit - 4);
                }
                setCurrPageInterval(interval);
                setCurrPage(currPage < interval.end ? currPage : interval.end);
            }
        }
        setQuestionRow([...currRow])
    }

    const handleChangeTitle = (e) => {
        let temp = currQuiz;
        temp.title = e.target.value.trim();
        setCurrQuiz(temp);
    }
    const handleChangeImage = (e) => {
        let temp = currQuiz;
        temp.image = e.target.value.trim();
        setCurrQuiz(temp);
    }
    const handleChangeDescription = (e) => {
        let temp = currQuiz;
        temp.description = e.target.value.trim();
        setCurrQuiz(temp);
    }
    const handleQuizTagDelete = (index) => {
        let currTags = quizTags.filter((tag, i) => index !== i)
        setQuizTags(currTags);
    }
    const handleQuizTagAddition = (tag) => {
        if (quizTags.length < 5)
            setQuizTags([...quizTags, tag]);

    }
    const handleQuizTagDrag = (tag, currPos, newPos) => {
        const tags = [...quizTags];
        const newTags = tags.slice();
        newTags.splice(currPos, 1);
        newTags.splice(newPos, 0, tag);
        setQuizTags(newTags)
    }
    React.useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, [error])
    
    const handleSubmit = event => {
        event.preventDefault();
        let temp = currQuiz;
        temp.questions = questionRow;
        temp.tags = quizTags.map((tag, i) => {
            const item = tag.text.toLowerCase().split(' ')
                .map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
            return item;
        });
        setCurrQuiz(temp);
        const quiz = currQuiz;

        //-------------------------------
        //  validation of input values
        //-------------------------------
        let exp = /^[\s]+$/i;
        if (!quiz.title || exp.test(quiz.title)) {
            setPageError({ errorType: "error", message: "Title cannot be empty" });
            return
        }
        if (!quiz.description || exp.test(quiz.description)) {
            setPageError({ errorType: "error", message: "description cannot be empty" });
            return
        }
        if (!quiz.image || exp.test(quiz.image)) {
            setPageError({ errorType: "error", message: "Image cannot be empty" });
            return
        }
        if (quizTags.length > 5 || quizTags.length < 2) {
            setPageError({ errorType: "error", message: "min 2 amd max 5 tags allowed" });
            return;
        }
        let isValid = true;
        const checkImage = (imageSrc) => {
            var img = new Image();
            img.src = imageSrc;
            img.onload = () => { isValid = true };
            img.onerror = () => {
                setPageError({ errorType: "error", message: "Invalid Image URL" });
                isValid = false;
            };
        }
        checkImage(quiz.image);
        if (!isValid)
            return
        if (!quiz.questions || quiz.questions.length < 1) {
            setPageError({ errorType: "error", message: "Minimum 5 questions are required" });
            return
        }
        quiz.questions.forEach((question, i) => {
            if (!question.description || exp.test(question.description)
                || !question.answer || question.answer === "") {
                isValid = false;
            }
            let options = ["A", "B", "C", "D"]
            options.forEach((option) => {
                if (!question[option] || exp.test(question[option])) {
                    isValid = false;
                }
            })
            if (!isValid)
                setPageError({ errorType: "error", message: "Invalid entry for question " + (i + 1) });
        })
        if (!isValid) return
        let newSuggestions = []
        const searchInTags = quizTagsSuggestions.map((tag, i) => {
            return tag.text.toLowerCase();
        })
        quizTags.forEach((tag) => {
            if (!searchInTags.includes(tag.text.toLowerCase())) {
                const item = tag.text.toLowerCase().split(' ')
                    .map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
                newSuggestions.push(item);
            }
        })
        if (newSuggestions.length > 0)
            axios
                .post("/addSuggestion", { newSuggestions })
                .then((res) => {
                    console.log(res.data)
                }).catch(err => {
                    console.log(err)
                })
        axios.post("/editQuiz/"+quizID, { quiz })
            .then(res => {
                dispatch(setEditError({
                    errorType: "success", message: "Quiz updated successfully"
                }));
                setRedirect(true);
            }).catch(err => {
                setPageError({ errorType: "error", message: "Something went wrong" });
                setRedirect(false);
            })
    }
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setPageError(false);
        }, 4000)
        return () => clearTimeout(timer)
    }, [error])

    let pageNumber = [];
    let limit = Math.ceil(questionRow.length / 5);
    pageNumber.push(<Pagination.First key={-2} onClick={() => {
        setCurrPageInterval({ start: 1, end: limit });
        setCurrPage(1);
    }}/>);
    pageNumber.push(<Pagination.Prev key={-1} onClick={() => {
        let interval = currPageInterval;
        setCurrPage(currPage > 1 ? currPage - 1 : 1);
        if (interval.start === 1) return;
        interval.end = Math.min(limit, currPage + 1);
        interval.start = Math.max(1, interval.end - 4);
        if (interval.start === 1) interval.end = Math.min(limit, 5);
        setCurrPageInterval(interval);
    }} />);
    for (let i = currPageInterval.start; i <= currPageInterval.end; i++) {
        pageNumber.push(
            <Pagination.Item key={i+2} active={i === currPage} onClick={() => setCurrPage(i)}>
                {i}
            </Pagination.Item>,
        );
    }
    pageNumber.push(<Pagination.Next key={-3} onClick={() => {
        let interval = currPageInterval;
        setCurrPage(currPage < limit ? currPage + 1 : limit);
        if (interval.end === limit) return;
        interval.start = Math.max(1, currPage - 1);
        interval.end = Math.min(limit, interval.start + 4);
        if (interval.end === limit) interval.start = Math.max(1, limit - 4);
        setCurrPageInterval(interval);
    }}/>);
    pageNumber.push(<Pagination.Last key={-4} onClick={() => {
        setCurrPageInterval({ start: Math.max(1, limit - 4), end: limit });
        setCurrPage(limit);
    }} />);
    let displayCurrPageQuestions = [];
    for (let i = (currPage - 1) * 5; i < currPage * 5 && i < questionRow.length; i++) {
        displayCurrPageQuestions.push(
            <QuestionTag question={questionRow[i]} key={i} />
        )
    }
    return (
        <Container>
            {redirect ? <Redirect push to="/login" /> : ""}
            <Row className="justify-content-center">
                <Col lg={3} md={2}></Col>
                <Col lg={6} md={8}>
                    <Container className="py-5">
                        {pageError ?
                            <Alert variant={pageError.errorType === "error" ? "danger" : "success"}>
                                {pageError.message}
                            </Alert> : ""}
                        <Form>
                            <Form.Group controlId="formGridTitle">
                                <Form.Label>Title</Form.Label>
                                <Form.Control type="text" placeholder="Enter Quiz Title" maxLength="50"
                                    onChange={handleChangeTitle} defaultValue={currQuiz.title||""}/>
                            </Form.Group>
                            <Form.Group controlId="formGridImage">
                                <Form.Label>Image URL</Form.Label>
                                <Form.Control type="text" placeholder="Enter Image URL (portrait image preferred)"
                                    onChange={handleChangeImage} defaultValue={currQuiz.image||""}/>
                            </Form.Group>
                            <Form.Group controlId="formGridDesc">
                                <Form.Label>Quiz Description</Form.Label>
                                <Form.Control type="text" placeholder="Enter Description" maxLength="120"
                                    onChange={handleChangeDescription} defaultValue={currQuiz.description||""}/>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Quiz tags</Form.Label>
                                <div>
                                    <ReactTags tags={quizTags}
                                        autofocus={false}
                                        maxLength={50}
                                        suggestions={quizTagsSuggestions}
                                        placeholder="Add min 2 and max 5 tags related to quiz"
                                        handleDelete={handleQuizTagDelete}
                                        handleAddition={handleQuizTagAddition}
                                        handleDrag={handleQuizTagDrag} />
                                </div>
                            </Form.Group>
                            <Form.Group controlId="formGridNumber">
                                <Form.Label>Total Questions</Form.Label>
                                <Form.Control type="Number" min="5" placeholder="Enter Total Number of Questions"
                                    onBlur={(event) => changeQuestions(event)} defaultValue={currQuiz.totalQuestions}/>
                            </Form.Group>
                            <div>
                                <Pagination className="justify-content-center">{pageNumber}</Pagination>
                            </div>
                                {displayCurrPageQuestions}
                            <Button variant="primary" block type="submit" onClick={handleSubmit}>
                                Submit
                            </Button>
                        </Form>
                    </Container>
                </Col>
                <Col lg={3} md={2}></Col>
            </Row>
        </Container>
    )
}

const mapStateToProps = state => {
    return {
        isAuthenticated: state.user.isAuthenticated,
        user: state.user.user,
        error: state.error
    }
}
export default connect(
    mapStateToProps,
    { setEditError }
)(EditQuiz)
