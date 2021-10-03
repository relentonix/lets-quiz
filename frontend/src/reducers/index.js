import { combineReducers } from "redux";
import user from "./userReducer";
import quiz from "./quizReducer";
import error from "./errorReducer";

const rootReducer = combineReducers({
    user,
    error,
    quiz
})

export default rootReducer;