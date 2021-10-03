import React from 'react';
import { Image, Navbar, Nav } from 'react-bootstrap';
import axios from 'axios';
import "../styles/navbar.css";
import { Redirect } from 'react-router-dom';
import { setAuthenticated } from '../actions/userAction';
import { connect, useDispatch } from 'react-redux';
import { setLoginError } from '../actions/errorAction';

function QuizNavbar(props) {
    const [redirect, setRedirect] = React.useState(false);
    const dispatch = useDispatch();
    React.useEffect(() => {
        axios
            .get("/isAuthenticated")
            .then(res => {
                dispatch(setAuthenticated({
                    isAuthenticated: res.data.isAuthenticated,
                    user: res.data.user
                }));
            })
            .catch(err => {
                console.log(err);
            })
    }, [])
    const logout = () => {
        axios
            .get("/logout")
            .then(res => {
                dispatch(setAuthenticated({
                    isAuthenticated: false,user: null
                }))
                dispatch(setLoginError({
                    errorType: "success", message: "Logged Out successfully"
                }));
                setRedirect(true);
            })
            .catch(err => {
                console.log(err);
            })
    }
    return (
        <>
            {redirect ? <Redirect push to="/" /> : ""}
            <Navbar bg="dark" expand="md" variant="dark" fixed="top">
                <Image src="/quiz-logo.png" className="main-logo p-2 mx-3" />
                <Navbar.Brand href="/">Let's QUIZ</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        {props.isAuthenticated === true ?
                            <>
                                <Nav.Link >Logged In as {props.user.username}</Nav.Link>
                                <Nav.Link onClick={logout}>Logout</Nav.Link>
                            </>
                            :
                            <>
                                <Nav.Link href="/register">Register</Nav.Link>
                                <Nav.Link href="/login">Login</Nav.Link>
                            </>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </>
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
    { setAuthenticated,setLoginError }
)(QuizNavbar)
