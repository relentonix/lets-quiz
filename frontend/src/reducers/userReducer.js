const initialState = {
    isAuthenticated: undefined,
    user:null
};

export default (state = initialState, action) =>{
    const type = action.type;
    switch (type) {
        case "SET_AUTHENTICATED":
            return {
                ...state,
                isAuthenticated: action.isAuthenticated,
                user: action.user,
            };
        default:
            return state;
    }
};