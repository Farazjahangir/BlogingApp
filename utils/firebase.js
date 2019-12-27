/* eslint-disable */
import firebaseLib from "react-native-firebase";

const firebaseFunctions = {};

const auth = firebaseLib.auth()

firebaseFunctions.signUpWithEmail = async (email , password , userName) => {
    try{
        const authResponse = await auth.createUserWithEmailAndPassword(email, password)
        const userId = authResponse.user.uid        
        const userObj = {
            userName,
            userId,
            email,
            followers: [],
            following: []
        }
    //    await firebaseFunctions.setDocument('Users' , userId , userObj)
    //    userObj.userId = userId
    //     return userObj
    }
    catch(e){
        throw e
    }
}

export default firebaseFunctions