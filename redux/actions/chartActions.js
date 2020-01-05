/* eslint-disable */

const addToChart = (data) =>{
    console.log('loginUser' , data);
    
    return { 
        type : "ADD_CHART",
        data
    }
} 

export {
    addToChart,
}