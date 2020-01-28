/* eslint-disable */

import React, {Fragment} from 'react';
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  FlatList,
  Text,
  ScrollView,
} from 'react-native';
import {SearchBar, Icon, Input} from 'react-native-elements';
import {SwipeListView} from 'react-native-swipe-list-view';
import {Picker} from 'native-base';
import {connect} from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import firebase from '../utils/firebase'
import Spinner from 'react-native-loading-spinner-overlay';

import CustomButton from '../Component/Button';
import CustomHeader from '../Component/header';
import {themeColor, pinkColor} from '../Constant';


class EditProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 'key1',
      userName: '',
      photoUrl: '',
      country: ''
    };
  }
  static navigationOptions = {
    header: null,
  };

  componentDidMount() {
    const { userObj } = this.props
    const { userName, photoUrl, country } = userObj
    this.setState({ userName, photoUrl, country })
  }
  galleryPermissionAndroid() {
    return request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
  }

  async changePicture() {
    if (Platform.OS === 'android') {
      const result = await this.galleryPermissionAndroid();
      if (result !== RESULTS.GRANTED) return;
    }
    const image = await ImagePicker.openPicker({
      mediaType: 'photo',
      width: 85,
      height: 85,
      includeBase64: true,
      cropping: true
    })
    console.log('Image', image);
    
    this.setState({ photoUrl: image.path })
  }

  
  onValueChange(value) {
    this.setState({
      selected: value,
    });
  }

  async updateProfile(){
    const { userObj: { userId }, navigation } = this.props
    let { photoUrl, userName, country } = this.state
    this.setState({ loading: true })
    if (photoUrl) {
      photoUrl = await firebase.uploadImage(photoUrl, userId)
    }
    const data = {
      photoUrl,
      userName,
      country
    }
    try{
      await firebase.updateDoc('Users', userId, data)
      navigation.goBack()
    }
    catch(e){
      alert(e.message)
    }
    this.setState({ loading: false })
  }
  render() {
    const {navigation} = this.props;
    const { userName, photoUrl, country, loading } = this.state

    return (
      <ScrollView
        stickyHeaderIndices={[0]}
        style={{backgroundColor: '#323643', flex: 1}}>
        <CustomHeader navigation={navigation} title={'Edit PROFILE'} />
        <Spinner
          visible={loading}
          textContent={'Loading...'}
          textStyle={{ color: '#fff' }}
        />
        <View
          style={{
            alignSelf: 'center',
            width: '100%',
            alignItems: 'center',
            paddingBottom: 25,
            borderBottomColor: '#444B60',
            borderBottomWidth: 0.5,
          }}>
          <View style={styles.imageWrapper}>
            {photoUrl ? (
              <Image
                source={{uri: photoUrl}}
                style={[styles.imageStyle]}
              />
            ) : (
              <Image
                source={require('../assets/avatar.png')}
                style={[styles.imageStyle]}
              />
            )}
          </View>
          <TouchableOpacity onPress={()=> this.changePicture()}>
            <Text style={{color: pinkColor, fontSize: 15, marginTop: -12}}>
              {' '}
              Change Profile Picture{' '}
            </Text>
          </TouchableOpacity>
        </View>
        <Input
          placeholder={'User name'}
          containerStyle={{width: '100%'}}
          inputStyle={styles.inputStyle}
          placeholderTextColor={'#bbb'}
          inputContainerStyle={styles.inputContainer}
          value={userName}
          onChangeText = {(userName)=> this.setState({ userName })}
        />
        <View style={styles.picker}>
          <Picker
            note
            mode="dropdown"
            style={{width: '50%', color: '#bbb', alignItems: 'flex-end'}}
            selectedValue={this.state.selected}
            onValueChange={this.onValueChange.bind(this)}>
            <Picker.Item label="New Country" value="key0" />
            <Picker.Item label="ATM Card" value="key1" />
            <Picker.Item label="Debit Card" value="key2" />
            <Picker.Item label="Credit Card" value="key3" />
            <Picker.Item label="Net Banking" value="key4" />
          </Picker>
        </View>
        <Input
          placeholder={'Country'}
          containerStyle={{width: '100%'}}
          inputStyle={styles.inputStyle}
          placeholderTextColor={'#bbb'}
          inputContainerStyle={styles.inputContainer}
          value={country}
          onChangeText={(country) => this.setState({ country })}
        />
        <View
          style={{
            borderBottomColor: '#444B60',
            borderBottomWidth: 5,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
            borderTopColor: '#444B60',
            borderTopWidth: 5,
          }}>
          <TouchableOpacity>
            <Text style={{color: '#A05669'}}>Delete Account</Text>
          </TouchableOpacity>
        </View>
        <View style={{marginVertical: 15}}>
          <CustomButton
            title={'Save'}
            backgroundColor={pinkColor}
            containerStyle={{width: '90%'}}
            onPress= {()=> this.updateProfile()}
          />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageStyle: {
    height: 85,
    width: 85,
    borderRadius: 125,
    marginHorizontal: 12,
    resizeMode: 'cover',
  },
  picker: {
    width: '94%',
    alignSelf: 'center',
    paddingHorizontal: 4,
    backgroundColor: themeColor,
    height: 60,
    alignItems: 'flex-end',

    borderBottomColor: '#444B60',
    borderBottomWidth: 0.5,
    borderRadius: 7,
  },
  imageWrapper: {
    height: 100,
    width: 100,
    borderRadius: 125,
    borderColor: pinkColor,
    marginVertical: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 100,
    borderTopColor: '#ccc',
    borderBottomColor: '#BBB',
    borderWidth: 0.5,
  },
  heading: {color: 'grey', fontSize: 14, fontWeight: 'bold', margin: 4},
  number: {color: '#fff', fontSize: 16, textAlign: 'center'},
  inputStyle: {textAlign: 'right', color: '#ccc', fontSize: 15},
  inputContainer: {
    backgroundColor: themeColor,
    height: 60,
    borderBottomColor: '#444B60',
    borderBottomWidth: 0.5,
  },
});

const mapDispatchToProps = dispatch => {
  return {};
};
const mapStateToProps = state => {
  return {
    userObj: state.auth.user,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);
