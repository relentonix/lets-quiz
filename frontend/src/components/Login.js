import React from 'react'
import { Row, Container, Col, Form, Button, Alert } from 'react-bootstrap'
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { setAuthenticated } from '../actions/userAction';
import { setLoginError } from '../actions/errorAction';
import { useDispatch, connect } from 'react-redux';

function Login(props) {
    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const error = props.error;
    const dispatch = useDispatch();
    
    React.useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(setLoginError({
                errorType: undefined, message: ""
            }));
        }, 4000);
        return () => clearTimeout(timer);
    },[error])
    
    const handleSubmit = (e) => {
        e.preventDefault();
        let exp = /\s/
        if (!username || exp.test(username)) {
            dispatch(setLoginError({
                errorType: "error",message: "username can't be blank"
            }));
            return
        }
        if (!password || exp.test(password)) {
            dispatch(setLoginError({
                errorType: "error",message: "password can't be blank"
            }));
            return
        }
        axios.post("/login", { username, password })
            .then(res => {
                dispatch(setLoginError({
                    errorType:"success",message:"Logged in successfully"
                }));
                dispatch(setAuthenticated({
                    isAuthenticated: true,user: res.data.user
                }));
                
            }).catch(err => {
                dispatch(setLoginError({
                    errorType: "error",message: err.response.data
                }));
                dispatch(setAuthenticated({
                    isAuthenticated: false,user: null
                }));
            })
    }
    return (
        <Container>
            {props.isAuthenticated === true ? <Redirect push to="/" />:""}
            <Row className="justify-content-center">
                <Col lg={3} md={2}></Col>
                <Col lg={6} md={8}>
                    <Container className="py-5">
                        {error && error.errorType ?
                            <Alert variant={error.errorType === "error" ? "danger" : "success"}>
                                {props.error.message}
                            </Alert> : ""}
                        <Form>
                            <Form.Group controlId="formGridAddress1">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" onChange={(e)=>setUsername(e.target.value)}
                                    placeholder="Enter your username" />
                            </Form.Group>

                            <Form.Group controlId="formGridAddress1">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" onChange={(e)=>setPassword(e.target.value)}
                                    placeholder="Enter your password" title="min 4 characters" />
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
        error:state.error
    }
}
export default connect(
    mapStateToProps,
    { setAuthenticated,setLoginError }
)(Login)
