import React from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { setAuthenticated } from '../actions/userAction';
import { setLoginError } from '../actions/errorAction';
import { useDispatch, connect } from 'react-redux';
import { Redirect } from 'react-router-dom';


function Register(props) {
    const [user, setUser] = React.useState({});
    const [error, setError] = React.useState(null);
    const dispatch = useDispatch()
    React.useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(setLoginError({
                errorType: undefined, message: ""
            }));
        }, 4000);
        return () => clearTimeout(timer);
    }, [error])

    const handleUserChange = (event) => {
        let currUser = user
        let key = event.target.name;
        let value = event.target.value;
        currUser[key] = value;
        setUser(currUser);
    }
    const handleSubmit = (event) => {
        event.preventDefault();

        //------------------------------
        //  validation of input values
        //------------------------------
        let finalUser = user;
        let exp = /^([a-zA-Z]+[\s]?)+$/;
        if (!finalUser.fullName || !exp.test(finalUser.fullName)) {
            setError({ type: "error", message: "Invalid Full Name" })
            return
        }
        exp = /[\s]/;
        if (!finalUser.username || exp.test(finalUser.username) || finalUser.username.length < 4) {
            setError({
                type: "error",
                message: "Username should be min 4 characters" +
                         " and should not contain spaces"
            })
            return
        }
        exp = /[\s]/;
        if (!finalUser.password || exp.test(finalUser.password) || finalUser.password.length < 4) {
            console.log(finalUser.password)
            setError({
                type: "error",
                message: "Password should be min 4 characters" +    
                         " and should not contain spaces"
            })
            return
        }
        exp = /^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/;
        if (!finalUser.email || !exp.test(finalUser.email)) {
            setError({ type: "error", message: "Invalid email address" })
            return
        }
        exp = /^[0-9]{10}$/
        if (!finalUser.phone || !exp.test(finalUser.phone)) {
            setError({ type: "error", message: "Invalid phone number" })
            return
        }
        let password = finalUser.password;
        axios.post("/register",
            {
                user: finalUser,
                username:finalUser.username,
                password:password
            })
            .then(res => {
                console.log(res.data)
                setError({ type: "success", message: "Registered successfully" })
            })
            .catch(err => {
                setError({ type: "error", message: err.response.data })
            })
    }
    return (
        <Container>
            {props.isAuthenticated === true ? <Redirect push to="/" /> : ""}
            <Row className="justify-content-center">
                <Col lg={3} md={2}></Col>
                <Col lg={6} md={8}>
                    <Container className="py-5">
                        {error ? <Alert variant={error.type === "error" ? "danger" : "success"}>
                            {error.message}</Alert> : ""}
                        <Form>
                            <Form.Group controlId="formGridFullName">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control type="text" name="fullName" placeholder="Enter Full Name" onChange={handleUserChange}
                                    title="name should not contain special characters or number" />
                            </Form.Group>
                            
                            <Form.Group controlId="formGridUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" name="username" placeholder="Enter username" onChange={handleUserChange}
                                    title= "username can contain only alphanumeric and ! @ # $ % ^ & * and min length should be 4"/>
                            </Form.Group>
                            
                            <Form.Row>
                                <Form.Group as={Col} controlId="formGridEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" name="email" placeholder="Enter email" onChange={handleUserChange}/>
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridPhone">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control type="text" name="phone" placeholder="Enter 10 digit phone number"
                                        title="10 digit mobile number" onChange={handleUserChange}/>
                                </Form.Group>
                            </Form.Row>

                            <Form.Group controlId="formGridAddress1">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" name="password" placeholder="Enter password" onChange={handleUserChange}
                                    title="password can contain only alphanumeric and ! @ # $ % ^ & * "/>
                            </Form.Group>

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
    { setAuthenticated, setLoginError }
)(Register)
