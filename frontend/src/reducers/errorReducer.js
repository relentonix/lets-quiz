const initialState = {
    errorType: undefined,
    message:"",
};

export default (state = initialState, action) => {
    const type = action.type;
    switch (type) {
        case "SET_LOGIN_ERROR":
            return {
                ...state,
                errorType: action.errorType,
                message: action.message,
            };
        case "SET_EDIT_ERROR":
            return {
                ...state,
                errorType: action.errorType,
                message: action.message,
            };
        default:
            return state;
    }
};