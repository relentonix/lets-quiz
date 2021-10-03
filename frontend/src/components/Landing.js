import React from 'react';
import axios from 'axios';
import { Container, Row, Button, Col, Card, Alert } from 'react-bootstrap';
import "../styles/landing.css";
import { Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { setLoginError } from '../actions/errorAction';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRandom } from '@fortawesome/free-solid-svg-icons';

const DisplayQuiz = (props) => {
    const quiz = props.quiz;
    return (
        <Col md={6} lg={4} className="mb-3">
            <Card className="border-info h-100 quiz-card">
                <Row className="no-gutters h-100">
                    <Col md={4}>
                        <Card.Img  className="p-1 landing-quiz-image" src={quiz.image ? quiz.image : "/no-quiz-image.png"} />
                    </Col>
                    <Col md={8} >
                        <Card.Body>
                            <Card.Title>{quiz.title}</Card.Title>
                            <hr className="border-info mt-0"/>
                            <Card.Text>
                                {quiz.description ? quiz.description : quiz.title}
                            </Card.Text>
                            <Link to={"/playQuiz/" + quiz._id}>
                                <Button variant="outline-primary" className="btn-play-now">
                                    Play Now
                                </Button>
                                <div className="btn-play-now-div"></div>
                            </Link>
                        </Card.Body>
                    </Col>
                </Row>
            </Card>
        </Col>
    )
}
function Landing(props) {
    const [quizzes, setQuizzes] = React.useState();
    const error = props.error;
    const dispatch = useDispatch();

    React.useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(setLoginError({
                errorType: undefined, message: ""
            }));
        }, 4000);
        return () => clearTimeout(timer);
    }, [error])

    React.useEffect(() => {
        axios
            .get("/fetchAllQuiz")
            .then(res => {
                setQuizzes(res.data);
            })
            .catch(err => {
                console.log('Error fetch quiz');
            })
    }, [])
    const pickRandomQuiz = () => {
        let index = quizzes?Math.floor(Math.random() * quizzes.length):0
        return quizzes ? quizzes[index]._id : ""
    }
    return (
        <Container className="mt-5">
            {error && error.errorType ?
                <Alert variant={error.errorType === "error" ? "danger" : "success"}>
                    {props.error.message}
                </Alert> : ""}
            <Row>
                <Col sm={12} md={4} className="my-2">
                    <Link to="/addQuiz" >
                        <Button variant="outline-success" className="landing-nav-buttons" block>Add Quiz</Button>
                    </Link>
                </Col>
                <Col sm={12} md={4} className="my-2">
                    <Link to={"/playQuiz/" + pickRandomQuiz()} >
                        <Button variant="outline-secondary" className="landing-nav-buttons" block>
                            Play Now
                            <FontAwesomeIcon icon={faRandom} className="ml-2" />
                        </Button>
                    </Link>
                </Col>
                <Col sm={12} md={4} className="my-2">
                    <Button variant="outline-primary" className="landing-nav-buttons" block>Explore</Button>
                </Col>
            </Row>
            <Row className="my-2">
                {quizzes ? quizzes.map((quiz, i) => <DisplayQuiz quiz={quiz} key={i} />):"Loading...."}
            </Row>
        </Container>
    )
}
const mapStateToProps = state => {
    return {
        error: state.error
    }
}
export default connect(
    mapStateToProps,
    { setLoginError }
)(Landing)
