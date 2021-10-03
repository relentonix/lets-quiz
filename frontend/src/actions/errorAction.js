
export const setLoginError = ({ errorType, message }) => {
    return {
        type: "SET_LOGIN_ERROR",
        errorType,
        message,
    }
}
export const setEditError = ({ errorType, message }) => {
    return {
        type: "SET_EDIT_ERROR",
        errorType,
        message,
    }
}