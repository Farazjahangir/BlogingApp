/* eslint-disable */

import React, { Fragment } from 'react'
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  FlatList,
  Text,
  ScrollView,
  Dimensions,
  Platform,
  Share,
  Linking
} from 'react-native'
import { SearchBar, Icon } from 'react-native-elements'
import CustomInput from '../Component/Input'
import CustomButton from '../Component/Button'
import CustomHeader from '../Component/header'
import { SwipeListView } from 'react-native-swipe-list-view'
import firebase from 'react-native-firebase'
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux'


import { themeColor, pinkColor } from '../Constant'
import { NavigationEvents } from 'react-navigation'
const dimensions = Dimensions.get('window')
const windowHeight = dimensions.height

class Blog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      follow: false,
      blogs: [],
      isBlogs: false,
      controls: false,
      paused: true,
      hidePlayPause: true,
      hideSeekbar: true,
      fullScreenHeight: null,
      loading: true
    }
  }
  static navigationOptions = {
    header: null
  }

  async componentDidMount() {
    const db = firebase.firestore()
    console.log('PRops', this.props);
    let link = ''
    if(this.props.navigation.state.params){
      link = this.props.navigation.state.params.link
    }
    
    // setTimeout(()=>{
    //   this.videoRef.presentFullscreenPlayer()
    // }, 5000)

    try {
      const url  = await Linking.getInitialURL()
      console.log('getInitialURL=====>', url)
      console.log('getInitialLink=====>', link)
      if(!link && url){
        console.log('URL======>', url)
        const extractId = url.split('/')
        const id = extractId[4]
        const dbResponse = await db.collection('Blog').doc(id).get()
        console.log('DB_RESPONSE', dbResponse.data())
        const { blogs } = this.state
        blogs.push(dbResponse.data())
        this.setState({ blogs, isBlogs: true, loading: false })
        return
        // navigation.navigate(path)
      }
    }
    catch (e) {
      console.log('Error', e.message);
    }

    const response = await db.collection('Blog').onSnapshot(snapShot => {
      snapShot.docChanges.forEach((change) => {
        if (change.type === "added") {
          const { blogs } = this.state
          blogs.unshift({ id: change.doc.id, ...change.doc.data() })
          this.setState({ blogs: [...blogs], isBlogs: true })

        }
        if (change.type === "modified") {
          console.log("Modified city: ", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("Removed city: ", change.doc.data());
        }
      })
      // console.log('snapShot ====>' , snapShot);
      this.setState({ loading: false })
      console.log('Response' , snapShot);
    })
    
    // const snapShot = await response.forEach((doc)=> console.log('Response =====>' , doc.data()))
    // const snapShot = response.docChanges().forEach(() => (
    //     console.log('Response =====>', change.doc.data())))

  }
  videoIsReady() {
    console.log('videoIsReady');

    this.setState({ hidePlayPause: false, hideSeekbar: false })
  }
  navigateToDetail(item) {
    this.setState({ paused: true })
    this.props.navigation.navigate('BlogDetail', { data: item })
  }

  async share(item){
    try {
      const result = await Share.share({
        message:`http://blogster.android.com/Blog/${item.id}`
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
    
  }


  _icon = (name, color, onPress) =>
    <TouchableOpacity onPress={onPress ? ()=> onPress() : ''}>
      <Icon type={'font-awesome'} name={name} color={color} containerStyle={{ marginHorizontal: 12 }} />
    </TouchableOpacity>

  blog = (item, index) => {
    console.log('this.props.userObj.userId !== item.userId', this.props.userObj.userId !== item.userId);
    
    return this.props.userObj.userId !== item.userId && <View style={{ width: '100%', marginBottom: 25, }}>
      {console.log('this.state.controls', this.state.controls)}
      {!this.state.fullScreenHeight && <View style={styles.title}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../assets/avatar.png')}
            style={styles.imageStyle}
          />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            Jesicca DOE
</Text>
        </View>
        <CustomButton title={'Follow'}
          buttonStyle={{ borderColor: '#ccc', borderWidth: 1, height: 40 }}
          containerStyle={{ width: 120 }} backgroundColor={this.state.follow ? pinkColor : themeColor} />
      </View>}
      {!!item.imageUrl && !this.state.fullScreenHeight && <Image source={{ uri: item.imageUrl }}
        style={{
          height: 200, width: '100%', alignSelf: 'center', marginVertical: 11,
          borderRadius: 5
        }} />}
      {!!item.videoUrl &&
        <View style={{ display: 'flex', alignItems: 'center', marginVertical: 10 }}>
          {Platform.OS === 'ios' ?
            <Video
              source={{ uri: item.videoUrl }}
              style={{ width: '100%', height: 250, backgroundColor: 'black' }}
              paused={true}
              pictureInPicture={true}
              controls={true}
              onLoad={() => this.videoIsReady()}
              ref={(ref) => this.videoRef = ref}
            />
            :
            <VideoPlayer
              source={{ uri: item.videoUrl }}
              videoStyle={{ width: '100%', height: this.state.fullScreenHeight ? this.state.fullScreenHeight : 250 }}
              style={{ width: '100%', height: this.state.fullScreenHeight ? this.state.fullScreenHeight : 250 }}
              disableVolume={true}
              fullscreen={false}
              paused={this.state.paused}
              onLoad={() => this.videoIsReady()}
              disablePlayPause={this.state.hidePlayPause}
              disableSeekbar={this.state.hideSeekbar}
              disableBack={true}
              onEnterFullscreen={() => this.setState({ fullScreenHeight: windowHeight })}
              onExitFullscreen={() => this.setState({ fullScreenHeight: null })}
            />}
        </View>}
      {!this.state.fullScreenHeight &&
        <TouchableOpacity onPress={() => this.navigateToDetail(item)}>
          <Text style={styles.blogHeading}>{item.blog}</Text>
        </TouchableOpacity>}
      {!this.state.fullScreenHeight &&
        <TouchableOpacity>
          <Text style={styles.likes}>{item.likes} Likes         73 Comments</Text>
        </TouchableOpacity>
      }
      {!this.state.fullScreenHeight &&
        <View style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row' }}>
            {this._icon('heart-o', pinkColor)}
            {this._icon('bookmark-o', '#fff')}
            {this._icon('comment-o', '#fff', () => this.share(item))}
          </View>
          {this._icon('ellipsis-h', '#fff')}

        </View>}

    </View>
  }
  render() {
    const { navigation } = this.props
    let { follow, blogs, isBlogs, loading } = this.state
    console.log('Blogs =====>', blogs);

    return (
      <ScrollView stickyHeaderIndices={[0]} style={{ backgroundColor: '#323643', flex: 1 }}>
        {!this.state.fullScreenHeight && <CustomHeader title={'BLOG'} navigation={navigation} />}
        <Spinner
          visible={loading}
          textContent={'Loading...'}
          textStyle={{ color: '#fff' }}
        />

        {isBlogs &&
          <FlatList
            data={blogs}
            keyExtractor={item => item}
            renderItem={({ item, index }) => this.blog(item, index)}
          />
        }
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  imageStyle: {
    height: 45,
    width: 45,
    borderRadius: 125,
    marginHorizontal: 12,
    resizeMode: 'contain'
  },
  title: { flexDirection: 'row', paddingHorizontal: 6, alignItems: 'center', justifyContent: 'space-between' },
  blogHeading: {
    color: '#fff', fontSize: 19, fontWeight: 'bold', paddingLeft: 6,
    lineHeight: 26, marginVertical: 8
  },
  likes: { color: '#ccc', paddingLeft: 12, paddingBottom: 4, borderBottomColor: '#ccc', borderBottomWidth: 0.5, },
})
const mapDispatchToProps = (dispatch) => {
  return {}
}
const mapStateToProps = (state) => {
  return {
    userObj: state.auth.user
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Blog)

