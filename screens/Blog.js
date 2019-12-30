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
import firebase from 'react-native-firebase'

import { themeColor, pinkColor } from '../Constant'
class Blog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      follow: false,
      blogs: [],
      isBlogs: false
    }
  }
  static navigationOptions = {
    header: null
  }

  async componentDidMount() {
    const db = firebase.firestore()

    const response = await db.collection('Blog').onSnapshot(snapShot => {
      snapShot.docChanges.forEach((change) => {
        if (change.type === "added") {
          const { blogs } = this.state
          blogs.unshift({id: change.doc.id, ...change.doc.data()})
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

    })
    // const snapShot = await response.forEach((doc)=> console.log('Response =====>' , doc.data()))
    // const snapShot = response.docChanges().forEach(() => (
    //     console.log('Response =====>', change.doc.data())))

  }


  _icon = (name, color) =>
    <TouchableOpacity >
      <Icon type={'font-awesome'} name={name} color={color} containerStyle={{ marginHorizontal: 12 }} />
    </TouchableOpacity>

  blog = (item, index) => {
    return <TouchableOpacity onPress={() => this.props.navigation.navigate('BlogDetail' , { data: item })} style={{ width: '100%', paddingHorizontal: '2%', marginBottom: 25, }}>
      <View style={styles.title}>
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
      </View>
      {!!item.imageUrl && <Image source={{uri: item.imageUrl}}
        style={{
          height: 200, width: '100%', alignSelf: 'center', marginVertical: 11,
          borderRadius: 5
        }} />}
  <Text style={styles.blogHeading}>{item.blog}</Text>
      <Text style={styles.likes}>{item.likes} Likes         73 Comments</Text>
      <View style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row' }}>
          {this._icon('heart-o', pinkColor)}
          {this._icon('bookmark-o', '#fff')}
          {this._icon('comment-o', '#fff')}
        </View>
        {this._icon('ellipsis-h', '#fff')}

      </View>

    </TouchableOpacity>
  }
  render() {
    const { navigation } = this.props
    let { follow, blogs, isBlogs } = this.state
    console.log('Blogs =====>' , blogs);
    
    return (
      <ScrollView stickyHeaderIndices={[0]} style={{ backgroundColor: '#323643', flex: 1 }}>
        <CustomHeader title={'BLOG'} navigation={navigation} />

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
export default Blog