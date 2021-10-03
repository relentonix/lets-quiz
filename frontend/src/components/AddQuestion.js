import React from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Pagination } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { setLoginError } from "../actions/errorAction";
import { Redirect } from 'react-router-dom';
// component to display each question individually
const QuestionTag = (props) => {
    let question = props.question
    const handleOptionChange = (e) => {
        question.answer = e.target.value;
    }
    const options = ["A", "B", "C", "D"];
    const displayOptionInput = options.map((option, i) => {
        return (
            <Form.Group className="col-md-6" key={i} controlId={"formGrid" + option}>
                <Form.Control type="text" placeholder={"Enter option " + option}
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
function AddQuestion(props) {
    const [questionRow, setQuestionRow] = React.useState([]);
    const [error, setError] = React.useState(null);
    const { quizID } = props.match.params;
    const { title } = props.location.state || "Quiz";
    const [currPage, setCurrPage] = React.useState(1);
    const [redirect, setRedirect] = React.useState(false);
    const dispatch = useDispatch();
    React.useEffect(() => {
        if (props.isAuthenticated === false) {
            dispatch(setLoginError({
                errorType: "error", message: "Unauthorized"
            }));
            setRedirect(true);
        }
    },[props.isAuthenticated])

    const changeQuestions = (e) => {
        let currRow = questionRow;
        let n = currRow.length;
        setCurrPage((currPage - 1) * 5 > e.target.value ? 1 : currPage);
        if (e.target.value > 20) {
            setError({ type: "error", message: "cannot add more than 20 questions at a time" })
            e.target.value = n;
            return;
        }
        
        if (e.target.value > n) {
            for (let i = n; i < e.target.value; i++) {
                currRow.push({
                    index: i + 1, description: "",
                    A: "", B: "", C: "", D: "", answer: ""
                })
            }
        } else {
            while (e.target.value < currRow.length) {
                currRow.pop();
            }
        }
        setQuestionRow([...currRow])
    }

    React.useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, [error])
    const handleSubmit = event => {
        event.preventDefault();
        
        //-------------------------------
        //  validation of input values
        //-------------------------------
        let quiz = {};
        let isValid = true;
        let exp = /^[\s]+$/i;
        quiz.questions = questionRow
        if (!quiz.questions || quiz.questions.length < 1) {
            setError({ type: "error", message: "Minimum 1 questions is required" })
            return
        }
        quiz.questions.forEach((question, i) => {
            if (!question.description || exp.test(question.description)
                || !question.answer || question.answer === "") {
                setError({ type: "error", message: "Invalid entry for question " + (i + 1) })
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
        console.log(questionRow)
        axios.post("/addQuestion/"+quizID, { questionRow })
            .then(res => {
                setError({ type: "success", message: "Question added successfully" })
                setQuestionRow([]);
            })
            .catch(err => {
                setError({ type: "error", message: "Something went wrong" })
            })
    }
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setError(null);
        }, 5000)
        return () => clearTimeout(timer)
    }, [error])

    let pageNumber = [];
    for (let i = 0, j = 1; i < questionRow.length; i += 5, j++) {
        pageNumber.push(
            <Pagination.Item key={j} active={j === currPage} onClick={() => setCurrPage(j)}>
                {j}
            </Pagination.Item>,
        );
    }
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
                        {error ? <Alert variant={error.type === "error" ? "danger" : "success"}>
                            {error.message}</Alert> : ""}
                        <Alert variant="info">Add Question for {title}</Alert>
                        <Form>
                            <Form.Group controlId="formGridNumber">
                                <Form.Label>Total Questions</Form.Label>
                                <Form.Control type="Number" placeholder="Enter Number of Questions to add"
                                    onBlur={(event) => changeQuestions(event)} />
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
    }
}
export default connect(
    mapStateToProps,
    { setLoginError }
)(AddQuestion)
