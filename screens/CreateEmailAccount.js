/* eslint-disable */

import React, { Fragment } from 'react';
import {
  StyleSheet,
  View, TouchableOpacity,
  Text, ScrollView
} from 'react-native';
import { Icon, Input, Button } from 'react-native-elements'
import { connect } from 'react-redux'

import CustomHeader from '../Component/header'
import CustomButton from '../Component/Button'
import firebase from '../utils/firebase'
import { loginUser } from '../redux/actions/authActions'


class EmailAccount extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: null,
      password: null,
      confirmPassword: null,
      userName: null
    }
  }
  static navigationOptions = {
    header: null,
  };
  sText(key, value) {
    this.setState({ [key]: value })
  }
  checkValidation = () => {
    const { email, password, confirmPassword } = this.state
    if (!email || !password || !confirmPassword) {
      this.setState({ email: null, password: null, confirmPassword: null })
      alert('All Fields Are Required')
      return true
    }
    if (password !== confirmPassword) {
      this.setState({ password: null, confirmPassword: null })
      alert('passwords Should Match')
      return true
    }
  }

  async signUp() {
    const { userName , email, password } = this.state
    const { navigation } = this.props

    if (this.checkValidation()) return

    try {
      const response = await firebase.signUpWithEmail(email, password, userName)
      this.props.loginUser(response)
      this.props.navigation.navigate('App')

      alert('Success')
    }
    catch (e) {
      alert(e.message)
    }

  }
  render() {
    const { navigation } = this.props
    const { userName , email, password, confirmPassword } = this.state
    return (
      <View style={{ backgroundColor: '#323643', flex: 1 }}>
        <CustomHeader navigation={navigation} title={'Sign Up'} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: "flex-end" }}>
          <Input placeholder={'Username'} placeholderTextColor={'#fff'}
            inputContainerStyle={styles.inputContainer} inputStyle={{ fontWeight: 'bold' }} onChangeText={(userName) => this.sText('userName', userName)} value={userName} />
          <Input placeholder={'Email'} placeholderTextColor={'#fff'}
            inputContainerStyle={styles.inputContainer} inputStyle={{ fontWeight: 'bold' }} onChangeText={(email) => this.sText('email', email)} value={email} />
          <Input placeholder={'Password'} secureTextEntry={true} placeholderTextColor={'#fff'}
            inputContainerStyle={styles.inputContainer} inputStyle={{ fontWeight: 'bold' }} onChangeText={(password) => this.sText('password', password)} value={password} />
          <Input placeholder={'Confirm Password'} secureTextEntry={true} placeholderTextColor={'#fff'}
            inputContainerStyle={styles.inputContainer} inputStyle={{ fontWeight: 'bold' }} onChangeText={(confirmPassword) => this.sText('confirmPassword', confirmPassword)} value={confirmPassword} />
          <View style={{ marginVertical: 12, width: "100%" }}>
            <CustomButton title={'Sign Up'} containerStyle={{ width: "90%" }} buttonStyle={{ borderColor: '#ccc', borderWidth: 1, }} onPress={() => this.signUp()} />
          </View>
        </View>
      </View>
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
    backgroundColor: '#323643', borderColor: "#fff", borderWidth: 0.5, marginHorizontal: 6
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

export default connect(mapStateToProps, mapDispatchToProps)(EmailAccount)

