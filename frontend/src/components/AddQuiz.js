import React from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Pagination } from 'react-bootstrap';
import { WithContext as ReactTags } from 'react-tag-input';
import "../styles/addQuiz.css";
import { Redirect } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { setLoginError } from '../actions/errorAction';


// component to display each question individually
const QuestionTag = (props) => {
    let question = props.question
    const handleOptionChange = (e) => {
        question.answer = e.target.value;
    }
    const options = ["A", "B", "C", "D"];
    const displayOptionInput = options.map((option, i) => {
        return (
            <Form.Group className="col-md-6" key={i} controlId={"formGrid"+option}>
                <Form.Control type="text" placeholder={"Enter option "+option}
                    onChange={(event) => question[option] = event.target.value} />
            </Form.Group>
        )
    })
    const displayCorrectRadio = options.map((option, i) => {
        return (
            <Form.Check inline label={option} key={i} type="radio" onChange={handleOptionChange}
                name={"correctOptionRadio-" + question.index} value={option}
                    id={"correctOptionRadio-" + option + "-" + question.index} />
        )
    })
    return (
        <div>
            <h6><strong>Question {question.index}</strong></h6>
            <Form.Group controlId="formGridDescription">
                <Form.Control type="text" placeholder="Enter Description"
                    onChange={(event) => question.description = event.target.value} />
            </Form.Group>
            <Form.Row>
                {displayOptionInput}
            </Form.Row>
            <div key="inline-radio" className="">
                <Row>
                    <Col xs={4}><Form.Label>Correct Option</Form.Label></Col>
                    <Col>
                        {displayCorrectRadio}
                    </Col>
                </Row>
            </div>
        </div>
    )
}
function AddQuiz(props) {
    const [questionRow, setQuestionRow] = React.useState([]);
    const [finalQuiz, setFinalQuiz] = React.useState({});
    const [error, setError] = React.useState(null);
    const [redirect, setRedirect] = React.useState(false);
    const [quizTags, setQuizTags] = React.useState([]);
    const [quizTagsSuggestions, setQuizTagsSuggestions] = React.useState();
    const [currPage, setCurrPage] = React.useState(1);
    const QPP = 7;
    const dispatch = useDispatch();
    React.useEffect(() => {
        if (props.isAuthenticated === false) {
            dispatch(setLoginError({
                errorType: "error", message: "Login required"
            }));
            setRedirect(true);
        }
        if (props.isAuthenticated) {
            axios
                .get("http://localhost:8080/fetchSuggestion")
                .then((res) => {
                    let data = res.data;
                    let formatted = [];
                    data.forEach((suggestion) => {
                        formatted.push({ id: suggestion, text: suggestion })
                    })
                    setQuizTagsSuggestions(formatted);
                })
                .catch(err => {
                    // setError({ type: "error", message: "Error fetching tag suggestions" })
                    console.log(err)
                })
        }
    }, [props.isAuthenticated]);
    
    const changeQuestions = (e) => {
        let currRow = questionRow;
        let n = currRow.length;
        let temp = finalQuiz;
        setCurrPage((currPage - 1) * QPP > e.target.value ? 1 : currPage);
        if (e.target.value > 50) {
            setError({ type: "error", message: "exceeds initial questions limit : 50" })
            e.target.value = n;
            return;
        }
        temp.totalQuestions = e.target.value;
        setFinalQuiz(temp);
        if (e.target.value > n) {
            for (let i = n; i < e.target.value; i++){
                currRow.push({
                        index:i+1,description: "",
                        A:"",B:"",C:"",D: "",answer:""
                })
            }
        } else {
            while (e.target.value < currRow.length) {
                currRow.pop();
            }
        }
        setQuestionRow([...currRow])
    }

    const handleChangeTitle = (e) => {
        let temp = finalQuiz;
        temp.title = e.target.value.trim();
        setFinalQuiz(temp);
    }
    const handleChangeImage = (e) => {
        let temp = finalQuiz;
        temp.image = e.target.value.trim();
        setFinalQuiz(temp);
    }
    const handleChangeDescription = (e) => {
        let temp = finalQuiz;
        temp.description = e.target.value.trim();
        setFinalQuiz(temp);
    }
    const handleQuizTagDelete = (index) => {
        let currTags = quizTags.filter((tag, i) => index !== i)
        setQuizTags(currTags);
    }
    const handleQuizTagAddition = (tag) => {
        if(quizTags.length<5)
            setQuizTags([...quizTags, tag]);
        
    }
    const handleQuizTagDrag = (tag, currPos, newPos) => {
        const tags = [...quizTags];
        const newTags = tags.slice();

        newTags.splice(currPos, 1);
        newTags.splice(newPos, 0, tag);

        // re-render
        setQuizTags(newTags)
    }
    React.useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    },[error])
    const handleSubmit = event => {
        event.preventDefault();
        let temp = finalQuiz;
        temp.questions = questionRow;
        temp.tags = quizTags.map((tag, i) => {
            const item = tag.text.toLowerCase()
                .split(' ')
                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(' ');
            return item;
        });
        setFinalQuiz(temp);
        const quiz = finalQuiz;
        
        //-------------------------------
        //  validation of input values
        //-------------------------------
        let exp = /^[\s]+$/i;
        if (!quiz.title || exp.test(quiz.title)) {
            setError({ type: "error", message: "Title cannot be empty" })
            return
        }
        if (!quiz.description || exp.test(quiz.description)) {
            setError({ type: "error", message: "description cannot be empty" })
            return
        }
        if (!quiz.image || exp.test(quiz.image)) {
            setError({ type: "error", message: "image cannot be empty" })
            return
        }
        if (quizTags.length > 5 || quizTags.length < 2) {
            setError({ type: "error", message: "min 2 amd max 5 tags allowed" })
            return;
        }
        let isValid = true;
        const checkImage = (imageSrc) => {
            var img = new Image();
            img.src = imageSrc;
            img.onload = ()=>{isValid=true};
            img.onerror = () => { 
                setError({ type: "error", message: "invalid image url" })
                isValid = false;
             };
        }
        checkImage(quiz.image);
        if (!isValid)
            return
        if (!quiz.questions || quiz.questions.length<5) {
            setError({ type: "error", message: "Minimum 5 questions are required" })
            return
        }
        quiz.questions.forEach((question,i) => {
            if (!question.description || exp.test(question.description)
                || !question.answer || question.answer === "") {
                setError({type:"error", message: "Invalid entry for question "+ (i + 1)})
                isValid = false;
            }
            let options = ["A", "B", "C", "D"]
            options.forEach((option) => {
                if (!question[option] || exp.test(question[option])) {
                    setError({ type: "error", message: "Invalid entry for question " + (i + 1) })
                    isValid = false; 
                }
            })
        })
        if (!isValid) {
            return
        }
        let newSuggestions = []
        const searchInTags = quizTagsSuggestions.map((tag,i) => {
            return tag.text.toLowerCase();
        })
        quizTags.forEach((tag) => {
            if (!searchInTags.includes(tag.text.toLowerCase())) {
                const item = tag.text.toLowerCase().split(' ')
                            .map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
                newSuggestions.push(item);
            }
        })
        axios
            .post("/addSuggestion", {newSuggestions}) 
            .then((res) => {
                console.log(res.data)
            })
            .catch(err => {
                console.log(err)
            })
        axios.post("/addQuiz", { quiz })
            .then(res => {
                setError({ type: "success", message: "Quiz added successfully" })
            })
            .catch(err => {
                setError({ type: "error", message: "Something went wrong" })
            })
    }
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setError(null);
        }, 5000)
        return ()=>clearTimeout(timer)
    }, [error])
    
    let pageNumber = [];
    for (let i = 0, j = 1; i < questionRow.length; i += QPP,j++) {
        pageNumber.push(
            <Pagination.Item key={j} active={j === currPage} onClick={()=>setCurrPage(j)}>
                {j}
            </Pagination.Item>,
        );
    }
    let displayCurrPageQuestions = [];
    for (let i = (currPage - 1) * QPP; i < currPage * QPP && i< questionRow.length; i++){
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
                        {error ? <Alert variant={error.type === "error" ? "danger" : "success"}>
                            {error.message}</Alert> : ""}
                        <Form>
                            <Form.Group controlId="formGridTitle">
                                <Form.Label>Title</Form.Label>
                                <Form.Control type="text" placeholder="Enter Quiz Title" maxLength="50"
                                onChange={handleChangeTitle}/>
                            </Form.Group>
                            <Form.Group controlId="formGridImage">
                                <Form.Label>Image URL</Form.Label>
                                <Form.Control type="text" placeholder="Enter Image URL (portrait image preferred)"
                                onChange={handleChangeImage} />
                            </Form.Group>
                            <Form.Group controlId="formGridDesc">
                                <Form.Label>Quiz Description</Form.Label>
                                <Form.Control type="text" placeholder="Enter Description" maxLength="120"
                                onChange={handleChangeDescription}/>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Quiz tags</Form.Label>
                                <div>
                                    <ReactTags tags={quizTags}
                                        autofocus={false}
                                        maxLength={30}
                                        suggestions={quizTagsSuggestions}
                                        placeholder="Add min 2 and max 5 tags related to quiz"
                                        handleDelete={handleQuizTagDelete}
                                        handleAddition={handleQuizTagAddition}
                                        handleDrag={handleQuizTagDrag}/>
                                </div>
                            </Form.Group>
                            <Form.Group controlId="formGridNumber">
                                <Form.Label>Total Questions</Form.Label>
                                <Form.Control type="Number" min="5" placeholder="Enter Total Number of Questions"
                                    onBlur={(event)=>changeQuestions(event)}/>
                            </Form.Group>
                            <div>
                                <Pagination>{pageNumber}</Pagination>
                                {displayCurrPageQuestions}
                            </div>
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
        error: state.error
    }
}
export default connect(
    mapStateToProps,
    { setLoginError }
)(AddQuiz)
