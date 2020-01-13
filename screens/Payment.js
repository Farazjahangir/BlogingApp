/* eslint-disable */

import React, { Fragment } from 'react'
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  FlatList,
  Text, Dimensions,
  ScrollView
} from 'react-native'
import { SearchBar, Icon } from 'react-native-elements'
import CustomInput from '../Component/Input'
import CustomButton from '../Component/Button'
import CustomHeader from '../Component/header'
const { width: screenWidth } = Dimensions.get('window')
import { SwipeListView } from 'react-native-swipe-list-view'
import Carousel, { ParallaxImage, Pagination } from 'react-native-snap-carousel';
import { themeColor, pinkColor } from '../Constant'
import firebase from '../utils/firebase'
import { connect } from 'react-redux'
const stripe = require("stripe-client")(
  "pk_test_CoqYQbVZ6tJwY9dFWN7UTfin00QpVQsX20"
);


export const ENTRIES1 = [
  {
    type: 'BUSINESS',
    rate: '$39.99',
    description: 'Lorem ipsum dolor sit amet et nuncat mergitur',
    illustration: 'https://i.imgur.com/UYiroysl.jpg'
  },
  {
    type: 'ADVANCE',
    rate: '$399.99',
    description: 'Lorem ipsum dolor sit amet et nuncat mergitur',
    illustration: 'https://i.imgur.com/UYiroysl.jpg'
  },
];

class Payment extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      follow: false,
      address: false,
      customerId: ''
    }
  }
  static navigationOptions = {
    header: null
  }

  async componentDidMount() {
    const { userObj } = this.props
    const { email, userId, customerId } = userObj
    let customer = customerId
    if(customerId){
      const userData = await firebase.getDocument('Users', userId)
      customer = userData.data().customerId
    }
    this.setState({ email, customerId: customer })
  }

  _renderItem({ item, index }, parallaxProps) {
    return (
      <View style={styles.item}>
        <Text style={{ color: '#fff' }}>klsajdlasjd</Text>
        <ParallaxImage
          source={{ uri: item.illustration }}
          containerStyle={{ height: 250 }}
          style={styles.image}
          parallaxFactor={0.4}
          {...parallaxProps}
        />
        <Pagination
          dotsLength={ENTRIES1.length}
          activeDotIndex={index}
          containerStyle={{ backgroundColor: themeColor }}
          dotStyle={{
            width: 10,
            height: 10,
            borderRadius: 5,
            marginHorizontal: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.92)'
          }}
          inactiveDotStyle={{
            // Define styles for inactive dots here
          }}
          inactiveDotOpacity={0.4}
          inactiveDotScale={0.6}
        />
      </View>
    );
  }
  async buy(item){
    // const { customerId } = this.state
    const { userObj, navigation } = this.props
    const { email, userId, customerId } = userObj
    // try{
    //   let customerId = await fetch('https://e2a9139d.ngrok.io/customer-id', {
    //     headers: {
    //         "Content-Type": 'application/json'
    //     },
    //     method: 'POST',
    //     body: JSON.stringify({
    //         email
    //     })
    // })
    // customerId = await customerId.json()
    // customerId = customerId.response.id
    // console.log('customerId' , customerId);
    
    // const chargeBody = {
    //   customerId
    // }

    //   let chargeResponse = await fetch('https://e2a9139d.ngrok.io/subscription', {
    //     headers: {
    //         "Content-Type": 'application/json'
    //     },
    //     method: 'POST',
    //     body: JSON.stringify(chargeBody)
    //   })
    //   chargeResponse = await chargeResponse.json()
    //   console.log('chargeResponse' , chargeResponse);  
    // }
    // catch(e){
    //   console.log('Error', e);
    // }

    navigation.navigate('ProductPay' , { subscription: true })
    
  }
  render() {
    const { navigation } = this.props
    let { address, customerId } = this.state
    return (
      <View stickyHeaderIndices={[0]} style={{ backgroundColor: '#323643', flex: 1 }}>
        <CustomHeader title={'PAYMENT'} navigation={navigation} />
        <Carousel
          sliderWidth={screenWidth}
          sliderHeight={screenWidth + 300}
          itemWidth={screenWidth - 60}
          data={ENTRIES1}
          renderItem={({ item, index }, parallaxProps) =>
            <View style={{ flex: 1, justifyContent: "space-around" }}>
              <ParallaxImage
                source={{ uri: item.illustration }}
                containerStyle={{ height: 220 }}
                style={{ borderRadius: 10 }}
                parallaxFactor={0.4}
                {...parallaxProps}
              />
              <View>
                <Text style={{ alignSelf: 'center', fontSize: 22, fontWeight: "bold", color: "#fff" }}>{item.type}</Text>
                <Text style={{ alignSelf: 'center', fontSize: 30, fontWeight: "bold", color: "#fff" }}>{item.rate}</Text>
                <Text style={{ textAlign: 'center', fontSize: 14, color: "#bbb", marginHorizontal: 35 }}>{item.description}</Text>
              </View>
              <View style={{ marginTop: 18 }}>
                <CustomButton title={"BUY NOW"} backgroundColor={pinkColor} containerStyle={{ width: "95%" }} onPress={()=> this.buy(item)} />
              </View>
              <Pagination
                dotsLength={ENTRIES1.length}
                activeDotIndex={index}
                containerStyle={{ backgroundColor: themeColor }}
                dotStyle={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginHorizontal: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.92)'
                }}
                inactiveDotStyle={{
                  // Define styles for inactive dots here
                }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
              />
            </View>
          }
          hasParallaxImages={true}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
})
const mapDispatchToProps = (dispatch) => {
  return {
      emptyChart: (userData) => dispatch(emptyChart(userData))
  }
}
const mapStateToProps = (state) => {
  return {
      userObj: state.auth.user
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Payment)
