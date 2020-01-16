/* eslint-disable */

import React, { Fragment } from 'react'
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  FlatList,
  Text,
  ScrollView
} from 'react-native'
import { SearchBar, Icon } from 'react-native-elements'
import CustomInput from '../Component/Input'
import CustomButton from '../Component/Button'
import CustomHeader from '../Component/header'
import { SwipeListView } from 'react-native-swipe-list-view'
import { connect } from 'react-redux'
import Spinner from 'react-native-loading-spinner-overlay';

import { themeColor, pinkColor } from '../Constant'
import firebaseLib from 'react-native-firebase'

class Profile extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      comments: false,
      blogs: [],
      loading: true
    }
  }
  static navigationOptions = {
    header: null
  }
  async componentDidMount() {
    let { userObj: { userId } } = this.props
    if(this.props.navigation.state.params.otherUser){
      userId = this.props.navigation.state.params.otherUser.userId
    }
    
    const db = firebaseLib.firestore()
    console.log('USerId', userId);
    const blogs = []

    try {
      let userBlogs = await db.collection('Blog').where('userId', '==', userId).get()
      console.log('UserBlogs ====>', userId);
      
      userBlogs = userBlogs.docs.forEach(doc => blogs.push(doc.data()))
      this.setState({ blogs, loading: false })
    }
    catch (e) {
      console.log('Error', e.message);
    }
  }


  statsNumber = (heading, number) =>
    <View>
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.number}>{number}</Text>
    </View>
  render() {
    const { navigation, userObj } = this.props
    let userdata = ''
    if(navigation.state.params.otherUser){
        userdata = navigation.state.params.otherUser
    }
    else{
      userdata = userObj
    }
    const { userName, followers, following } = userdata
    let { comments, blogs, loading } = this.state
    console.log('BLogs ====>', blogs);
    
    return (
      <ScrollView stickyHeaderIndices={[0]} style={{ backgroundColor: '#323643', flex: 1 }}>
        <Spinner
          visible={loading}
          textContent={'Loading...'}
          textStyle= {{color: '#fff'}}
        />
        <CustomHeader title={'PROFILE'} rightIcon navigation={navigation} />
        <View style={{ alignSelf: 'center', width: '60%', alignItems: 'center' }} >
          <View style={styles.imageWrapper} >
            <Image
              source={require('../assets/avatar.png')}
              style={[styles.imageStyle, { borderRadius: 125 }]} />
          </View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
            {userName}
          </Text>
          <Text style={{ color: '#ccc', margin: 12 }}>Graphic Designer</Text>
        </View>
        <View style={styles.statsView}>
          {this.statsNumber("FOLLOWING", following.length)}
          {this.statsNumber("FOLLOWER", followers.length)}
        </View>
        <View style={{
          flexDirection: "row", justifyContent: "space-around",
          marginHorizontal: "6%", height: 50, alignItems: "center"
        }}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate("EditProfile")}>
            <Icon type={"font-awesome"} name={"edit"} color={"#fff"} size={25} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon type={"font-awesome"} name={"image"} color={"#fff"} size={25} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon type={"font-awesome"} name={"edit"} color={"#fff"} size={25} />
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: themeColor, flexWrap: "wrap", flexDirection: "row" }}>
          {!!blogs.length &&
            blogs.map((data, index) =>
              <Image source={{ uri: data.imageUrl }}
                style={{
                  height: 110, width: "32%", margin: 1,
                  resizeMode: "stretch",
                }} />)
          }
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  imageStyle: {
    height: 85,
    width: 85,
    borderRadius: 125,
    marginHorizontal: 12,
    resizeMode: 'contain'
  },
  imageWrapper: {
    height: 100,
    width: 100,
    borderRadius: 125,
    borderColor: pinkColor,
    marginVertical: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statsView: {
    flexDirection: "row", justifyContent: "space-around",
    alignItems: 'center', height: 100,
    borderTopColor: "#ccc", borderBottomColor: "#BBB", borderWidth: 0.5
  },
  heading: { color: "grey", fontSize: 14, fontWeight: "bold", margin: 4 },
  number: { color: "#fff", fontSize: 16, textAlign: "center" },
})
const mapDispatchToProps = (dispatch) => {
  return {}
}
const mapStateToProps = (state) => {
  return {
    userObj: state.auth.user
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Profile)

