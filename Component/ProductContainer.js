/* eslint-disable */

import React, { Component } from 'react'
import { Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native'
import {withNavigation } from 'react-navigation'

class ProductContainer extends Component {
    render() {
        const { data, navigate } = this.props
        console.log('Data ====>', data.imageUrl);
        
        return (
            <TouchableOpacity onPress={navigate}>
                <View style={styles.productMainContainer}>
                    <Image source={{uri : data.imageUrl}} style={{ width: 135, height: 135 }} />
                    <View style={styles.prodcutDetailContainer}>
                    <Text style={styles.productName}>{data.productName}</Text>
                    <Text style={styles.productPrice}>{data.price}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}
export default withNavigation(ProductContainer)

const styles = StyleSheet.create({
    productMainContainer:{
        marginVertical: 14
    },
    prodcutDetailContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-between',
        marginTop: 8,
    },
    productName: {
        fontSize: 16,
        color: '#ffffff',
        flex: 0.9,
        flexWrap: 'wrap-reverse'
    },
    productPrice: {
        fontSize: 16,
        color: '#ffffff',
    }
})
