
export const setAuthenticated = ({isAuthenticated,user}) => {
    return {
        type: "SET_AUTHENTICATED",
        isAuthenticated,
        user,
    }
}