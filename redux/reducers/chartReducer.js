/* eslint-disable */

const initialState = {
    chart: []
  }
  
  const reducer = (state = initialState, action) =>{
    switch(action.type) {
        case "ADD_CHART": {
            return {...state, chart:[ ...action.data]}
        }
        default: {
            return state;
        }
    }
}

export default reducer;