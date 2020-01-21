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
  Linking,
} from 'react-native';
import {SearchBar, Icon} from 'react-native-elements';
import CustomInput from '../Component/Input';
import ControlPanel from '../screens/ControlPanel';
import CustomButton from '../Component/Button';
import {NavigationEvents} from 'react-navigation';
import {connect} from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import firebaseLib from 'react-native-firebase';

import CustomHeader from '../Component/header';
import {SwipeListView} from 'react-native-swipe-list-view';
import Drawer from 'react-native-drawer';
import firebase from '../utils/firebase';
import {loginUser} from '../redux/actions/authActions';

import {themeColor, pinkColor} from '../Constant';
class Feedback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: false,
      users: [],
      loading: true,
    };
  }
  static navigationOptions = {
    header: null,
  };
  async componentDidMount() {
    const {
      navigation,
      userObj: {userId},
    } = this.props;
    firebaseLib.notifications().onNotification(notification => {
      console.log('notification =====>', notification);
    });
    firebaseLib.notifications().onNotificationOpened(notificationOpen => {
      // Get the action triggered by the notification being opened
      const action = notificationOpen.action;
      console.log('notificationOpen=======>', notificationOpen);
      navigation.navigate('Messages');

      // Get information about the notification that was opened
      // const notification: Notification = notificationOpen.notification;
    });
    const notification = await firebaseLib
      .notifications()
      .getInitialNotification();
    if (notification) {
      navigation.navigate('Messages');
    }

    this.fcmToken();
    const db = firebaseLib.firestore();
    Linking.addEventListener('url', this.handleDeepLink);
    try {
      const url = await Linking.getInitialURL();
      console.log('getInitialURL=====>', url);
      if (url) {
        console.log('URL======>', url);
        const extractPath = url.split('/');
        const path = extractPath[3];
        console.log('PAth =========>', path);
        navigation.navigate(path);
      }
      db.collection('Users')
        .doc(userId)
        .onSnapshot(snapshot => {
          this.props.loginUser(snapshot.data());
        });
      console.log('LAst Console');
    } catch (e) {
      console.log('Error', e.message);
    }
    this.setState({loading: false});
  }

  fcmToken = async () => {
    const fcm = firebaseLib.messaging();
    const db = firebaseLib.firestore();
    const {
      userObj: {userId},
    } = this.props;
    const fcmToken = await fcm.getToken();
    const per = await fcm.hasPermission();
    console.log('PEr =========>', per);

    await fcm.requestPermission();
    if (fcmToken) {
      await firebase.updateDoc('Users', userId, {token: fcmToken});
    } else {
      console.log('fcmToken Error', fcmToken);
    }
  };
  handleDeepLink(e) {
    // const route = e.url.replace(/.*?:\/\//g, "");
    // this._navigator.replace(this.state.routes[route]);
    console.log('handleDeepLink', e);
  }

  closeControlPanel = () => {
    this._drawer.close();
  };
  openControlPanel = () => {
    this._drawer.open();
  };
  swipListItem = (item, index) => (
    <View
      style={[
        styles.itemContainer,
        {
          flexDirection: 'column',
          minHeight: 110,
          alignItems: 'flex-start',
          width: '95%',
          justifyContent: 'space-around',
        },
      ]}>
      <View style={{flexDirection: 'row', padding: 6, alignItems: 'center'}}>
        <Image
          source={require('../assets/avatar.png')}
          style={styles.imageStyle}
        />
        <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
          Jesicca DOE
        </Text>
      </View>
      <Text style={{color: '#ccc', marginHorizontal: 25}}>
        Lorun Ispem Lorun Ispem Lorun Ispem Lorun Ispem Lorun Ispem Lorun Ispem
      </Text>
    </View>
  );

  feedBackListItem = (item, index) =>
    this.props.userObj.userId !== item.userId && (
      <View style={styles.itemContainer}>
        <View>
          <Image
            source={require('../assets/avatar.png')}
            style={styles.imageStyle}
          />
          <Icon
            type={'font-awesome'}
            name={index % 2 !== 1 ? 'heart-o' : 'user-plus'}
            color={'#fff'}
            size={10}
            containerStyle={[
              styles.iconContainer,
              {
                backgroundColor: index % 2 !== 1 ? pinkColor : '#72CEBA',
              },
            ]}
          />
        </View>
        <View>
          <Text style={{color: '#fff', fontSize: 15, fontWeight: 'bold'}}>
            {' '}
            Ivan Morris{' '}
            <Text style={{fontWeight: '400', color: '#ccc', fontSize: 12}}>
              {' '}
              added you to friends
            </Text>
          </Text>
          <Text style={{color: '#ccc', fontSize: 12}}> 4 Hrs ago</Text>
        </View>
      </View>
    );

  render() {
    const {navigation} = this.props;
    let {comments, users, loading} = this.state;
    console.log('loading ===========>', loading);

    return (
      <Drawer
        ref={ref => (this._drawer = ref)}
        type="overlay"
        tapToClose={true}
        openDrawerOffset={0.2} // 20% gap on the right side of drawer
        panCloseMask={0.2}
        closedDrawerOffset={-3}
        styles={styles.drawer}
        tweenHandler={ratio => ({
          main: {opacity: (2 - ratio) / 2},
        })}
        content={<ControlPanel />}>
        {/* <Spinner
          visible={loading}
          textContent={'Loading...'}
          textStyle={{ color: '#fff' }}
        /> */}
        <NavigationEvents onDidFocus={() => this.closeControlPanel()} />
        <View style={{backgroundColor: '#323643', flex: 1}}>
          <CustomHeader
            home
            title={comments ? 'Comments' : 'Feedback'}
            onPress={() => this.openControlPanel()}
          />
          <SearchBar
            containerStyle={{
              margin: 8,
              borderRadius: 5,
              borderTopColor: themeColor,
              borderBottomColor: themeColor,
            }}
            placeholder={'Search'}
            inputContainerStyle={{backgroundColor: '#fff'}}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginBottom: 12,
            }}>
            <CustomButton
              // onPress={() => this.setState({ comments: true })}
              buttonStyle={styles.commentButton}
              title={'Comments'}
              backgroundColor={comments ? pinkColor : themeColor}
            />
            <CustomButton
              // onPress={() => this.setState({ comments: false })}
              buttonStyle={styles.commentButton}
              backgroundColor={!comments ? pinkColor : themeColor}
              title={'Feedback'}
              // onPress={() => Linking.openURL('example://blog')}
            />
          </View>

          {comments ? (
            <SwipeListView
              data={['1', '2', '3', '4', '5', '6', '7']}
              renderItem={(data, rowMap) => this.swipListItem(data, rowMap)}
              renderHiddenItem={(data, rowMap) => (
                <View
                  style={{
                    alignSelf: 'flex-end',
                    marginRight: 20,
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity style={styles.arrowButton}>
                    <Icon type={'font-awesome'} name={'reply'} color={'#fff'} />
                  </TouchableOpacity>
                </View>
              )}
              disableRightSwipe
              leftOpenValue={0}
              rightOpenValue={-75}
            />
          ) : (
            <FlatList
              data={['1', '2', '3', '4', '5', '6', '7']}
              keyExtractor={item => item}
              renderItem={({item, index}) => this.feedBackListItem(item, index)}
            />
          )}
        </View>
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawer: {shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3},
  main: {paddingLeft: 3},
  imageStyle: {
    height: 45,
    width: 45,
    borderRadius: 125,
    marginHorizontal: 12,
    resizeMode: 'contain',
  },
  itemContainer: {
    minHeight: 80,
    backgroundColor: '#444B60',
    flexDirection: 'row',
    marginHorizontal: 12,
    borderRadius: 12,
    marginVertical: 4,
    alignItems: 'center',
  },
  iconContainer: {
    height: 18,
    width: 18,
    backgroundColor: pinkColor,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -12,
    marginLeft: 8,
  },
  commentButton: {borderColor: pinkColor, borderWidth: 1, width: 150},
  rowFront: {
    alignItems: 'center',
    backgroundColor: '#CCC',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    justifyContent: 'center',
    height: 50,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  arrowButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: pinkColor,
    justifyContent: 'center',
    alignItems: 'center',
  },

  userContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
  },
  chatBtn: {
    color: '#fff',
    fontSize: 18,
  },
});
const mapDispatchToProps = dispatch => {
  return {
    loginUser: userData => dispatch(loginUser(userData)),
  };
};
const mapStateToProps = state => {
  return {
    userObj: state.auth.user,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Feedback);
