/* eslint-disable */

import React, { Component } from 'react'
import { Text, View, ScrollView, Image } from 'react-native'

import CustomButton from '../Component/Button'
import CustomHeader from '../Component/header'
import ProductContainer from '../Component/ProductContainer'

const data = [
    {
        productName: 'Product1',
        price: 100,
        image: require('../assets/avatar.png'),
        discription: 'this is the great product',
        shipFrom: 'Canada',
        deliverInfo: '15 tp 20 days',
        returnPolicy: 'lorem ipsum lorem ipsum'
    },
    {
        productName: 'Product2',
        price: 100,
        image: require('../assets/avatar.png'),
        discription: 'this is the great product',
        shipFrom: 'Canada',
        deliverInfo: '15 tp 20 days',
        returnPolicy: 'lorem ipsum lorem ipsum'
    },
    {
        productName: 'Product3',
        price: 100,
        image: require('../assets/avatar.png'),
        discription: 'this is the great product',
        shipFrom: 'Canada',
        deliverInfo: '15 tp 20 days',
        returnPolicy: 'lorem ipsum lorem ipsum'
    },
    {
        productName: 'Product4',
        price: 100,
        image: require('../assets/avatar.png'),
        discription: 'this is the great product',
        shipFrom: 'Canada',
        deliverInfo: '15 tp 20 days',
        returnPolicy: 'lorem ipsum lorem ipsum'
    },
    {
        productName: 'Product5',
        price: 100,
        image: require('../assets/avatar.png'),
        discription: 'this is the great product',
        shipFrom: 'Canada',
        deliverInfo: '15 tp 20 days',
        returnPolicy: 'lorem ipsum lorem ipsum'
    },
]

class Shop extends Component {
    static navigationOptions = {
        header: null
    }
    render() {
        const { navigation } = this.props
        return (
            <ScrollView stickyHeaderIndices={[0]} style={{ backgroundColor: '#323643', flex: 1 }}>
                <CustomHeader title={'SHOP'} navigation={navigation} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, flexWrap: 'wrap' }}>
                    {/* <View>
                        <Image source={require('../assets/avatar.png')} style={{width: 135, height: 135}} />
                        <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                            <Text>Product</Text>
                            <Text>200</Text>
                        </View>
                    </View> */}
                    {data.map(val => 
                        <ProductContainer data={val} navigate={()=> navigation.navigate('Detail' , {data: val})} />
                    )}
                </View>
            </ScrollView>
        )
    }
}

export default Shop