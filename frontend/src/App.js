import React from 'react';
import QuizNavbar from "./components/QuizNavbar";
import { Route, Switch, Redirect, Router } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Landing from './components/Landing';
import routeHistory from './RouteHistory';
import AddQuiz from './components/AddQuiz';
import PlayQuiz from './components/PlayQuiz';
import EditQuiz from './components/EditQuiz';
import AddQuestion from './components/AddQuestion';
import "./App.css"
function App() {
  return (
    <div className="App">
      <Router history={routeHistory}>
      <QuizNavbar />
      <div style={{height:"65px"}}></div>
        <Switch>
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/landing" component={Landing} />
          <Route exact path="/addQuiz" component={AddQuiz} />
          <Route exact path="/playQuiz/:quizID" component={PlayQuiz} />
          <Route exact path="/editQuiz/:quizID" component={EditQuiz} />
          <Route exact path="/addQuestion/:quizID" component={AddQuestion} />
          <Route exact path="/">
            <Redirect to="/landing" />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
