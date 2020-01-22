/* eslint-disable */

import React, {Fragment} from 'react';
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  FlatList,
  Text,
  Switch,
  ScrollView,
} from 'react-native';
import {SearchBar, Icon, Input} from 'react-native-elements';
import CustomButton from '../Component/Button';
import CustomHeader from '../Component/header';
import {SwipeListView} from 'react-native-swipe-list-view';
import {Picker} from 'native-base';
import {themeColor, pinkColor} from '../Constant';
import countries from '../Constant/countries';
import firebaseLib from 'react-native-firebase'
import { connect } from 'react-redux'


class MyOrders extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: '1',
      switch: false,
      myorders: []
    };
  }
  static navigationOptions = {
    header: null,
  };
  onValueChange(value) {
    this.setState({
      selected: value,
    });
  }

  async componentDidMount() {
    const { userObj: { userId } } = this.props
    const { myorders } = this.state
    const db = firebaseLib.firestore()
    // let data = []
    try{
      const userOrders = await db.collection('Orders').where('userId' , '==' , userId).get()
      userOrders.docs.forEach(snapShot => {
        myorders.push(snapShot.data())
        // data.push(snapShot.data())
      })
      const orders = []
      myorders.map(data => {
        data.products.map(product => {
          orders.push(product)
        })
      })
      this.setState({ myorders: orders })
    }
    catch(e){
      console.log('Error', e.messgae);
      alert(e.message)
      
    }
  }
  
  render() {
    const {navigation} = this.props;
    const { myorders } = this.state
    
    return (
      <ScrollView
        stickyHeaderIndices={[0]}
        style={{backgroundColor: '#323643', flex: 1}}>
        <CustomHeader navigation={navigation} title={'My Orders'} />
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
        <FlatList
          data={myorders}
          keyExtractor={item => item}
          renderItem={({item, index}) => (
            <View style={{flexDirection: 'row', marginVertical: 4}}>
              <Image source={{uri: item.imageUrl}} style={styles.imageStyle} />
              <View>
                <Text
                  style={{
                    paddingTop: 4,
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  {item.productName}
                </Text>
                <Text style={styles.descriptionText}>
                  {item.discription}
                </Text>
              </View>
              <Text style={[styles.descriptionText, {paddingTop: 4}]}>$24</Text>
            </View>
          )}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageStyle: {
    height: 120,
    backgroundColor: '#fff',
    width: 120,
    borderRadius: 12,
    marginHorizontal: 12,
    resizeMode: 'contain',
  },
  descriptionText: {color: '#fff', fontSize: 13, color: 'grey'},
});

const mapDispatchToProps = (dispatch) => {
  return {}
}
const mapStateToProps = (state) => {
  return {
      userObj: state.auth.user,
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(MyOrders)
