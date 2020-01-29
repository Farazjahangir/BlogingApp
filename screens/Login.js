/* eslint-disable */

import React, { Fragment } from 'react';
import {
  StyleSheet,
  View, TouchableOpacity,
  Text, ScrollView
} from 'react-native';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import FirebaseLib from 'react-native-firebase'
import { connect } from 'react-redux'

import firebase from '../utils/firebase'
import { loginUser } from '../redux/actions/authActions'
import Spinner from 'react-native-loading-spinner-overlay';




import { Icon, Input, Button } from 'react-native-elements'
class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: null,
      password: null,
      loading: false
    }
  }
  static navigationOptions = {
    header: null,
  };
  checkValidation() {
    const { email, password } = this.state
    if (!email || !password) {
      this.setState({ password: null })
      alert('All fields are required')
      return true
    }
  }

  async login() {
    const { email, password } = this.state
    console.log('Email', email);
    console.log('PAss', password);



    if (this.checkValidation()) return
    try {
      this.setState({ loading: true })
      const res = await firebase.signInWithEmail(email, password)
      const uid = res.user.uid
      const dbResponse = await firebase.getDocument('Users', uid)
      const userData = dbResponse._data
      this.props.loginUser(userData)
      this.props.navigation.navigate('App')
    }
    catch (e) {
      alert(e.message)
    }
    this.setState({ loading: false })
  }

  async facebookLogin() {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) {
        throw new Error('User cancelled request');
      }
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error('Something went wrong obtaining the users access token');
      }
      const credential = FirebaseLib.auth.FacebookAuthProvider.credential(data.accessToken);
      const firebaseUserCredential = await FirebaseLib.auth().signInWithCredential(credential);
      const fbUid = firebaseUserCredential.user.uid
      const response = await firebase.getDocument('Users' , fbUid)
      let userObj = {}
      response.exists
      if (response.exists) {
        userObj = response.data();
        this.props.loginUser(userObj)
        this.props.navigation.navigate('App')  
      }
      else {
        userObj = {
          userName: firebaseUserCredential.user.displayName.toLowerCase(),
          email: firebaseUserCredential.user.email,
          photoUrl: firebaseUserCredential.user.photoURL,
          userId: fbUid,
          followers: [],
          following: [],
          userPackage: 'none',
          userType: 'free'
        }
        await firebase.setDocument('Users', fbUid, userObj)
        this.props.loginUser(userObj)
        this.props.navigation.navigate('BlogCategory')
      }
    }
    catch (e) {
      alert(e.message);
    }
  }

  render() {
    const { navigation } = this.props
    const { email, password, loading } = this.state
    return (
      <ScrollView style={{ backgroundColor: '#323643' }}>
        <Spinner
          visible={loading}
          textContent={'Loading...'}
          textStyle={{ color: '#fff' }}
        />
        <View style={{
          height: 100, flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', marginHorizontal: 15,
        }}>
          <Text style={{ color: '#fff', fontSize: 25, fontWeight: 'bold' }}>Login</Text>
          <Icon type={'font-awesome'} name={'angle-left'} color={'#fff'} containerStyle={{ marginTop: 8 }}
            size={25} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', marginTop: "32%" }}>
          <Input placeholder={'Email'} placeholderTextColor={'#fff'}
            inputContainerStyle={styles.inputContainer} inputStyle={{ fontWeight: 'bold' }} onChangeText={(email) => this.setState({ email: email })} value={email} />

          <Input placeholder={'Password'} secureTextEntry={true} placeholderTextColor={'#fff'}
            inputContainerStyle={styles.inputContainer} inputStyle={{ fontWeight: 'bold' }} onChangeText={(password) => this.setState({ password: password })} value={password} />

          <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 12 }}>
            <Button onPress={() => this.login()} title={'Login'} buttonStyle={styles.buttonStyle} />
            <Button title={'Sign Up'} buttonStyle={[styles.buttonStyle, { backgroundColor: "#FD7496", borderWidth: 0 }]} />
          </View>

          <View style={{
            flexDirection: "row", width: "95%",
            alignItems: "center", marginVertical: 15
          }}>
            <View style={styles.line} />
            <Text style={{ marginHorizontal: 12, color: "#ccc", fontSize: 18 }}>OR</Text>
            <View style={styles.line} />
          </View>
          <Button title={'Facebook'}
            buttonStyle={{ width: 300, height: 50, borderRadius: 25, backgroundColor: '#3b5998' }} onPress={() => this.facebookLogin()} />
        </View>
        <View style={{ paddingLeft: 12 }}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate("CreateAccount")} style={{ height: 30, justifyContent: "center" }}>
            <Text style={styles.bottomLink}>Need An Account ?<Text style={{ color: '#FD7496' }}>  Sign Up</Text></Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.props.navigation.navigate("ForgotPassword")} style={{ height: 30, justifyContent: "center" }}>
            <Text style={[styles.bottomLink, { marginVertical: 12 }]}>Forget Your Password ?<Text style={{ color: '#FD7496' }}>  Retrive</Text></Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    borderColor: '#323643', backgroundColor: '#454B61', borderRadius: 7,
    paddingLeft: 12, marginVertical: 6
  },
  buttonStyle: {
    width: 140, height: 45, borderRadius: 25,
    backgroundColor: '#000000', borderColor: "#000000", borderWidth: 0.5, marginHorizontal: 6
  },
  bottomLink: { fontSize: 14, fontWeight: "bold", color: "#ccc" },
  line: { flex: 1, height: 0.5, borderWidth: 0.3, borderColor: "#ccc" }
})
const mapDispatchToProps = (dispatch) => {
  return {
    loginUser: (userData) => dispatch(loginUser(userData))
  }
}
const mapStateToProps = (state) => {
  return {
    userObj: state.auth.user
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
