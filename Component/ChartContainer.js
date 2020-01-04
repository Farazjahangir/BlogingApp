/* eslint-disable */

import React, { Component } from 'react'
import { Text, View, StyleSheet, Image } from 'react-native'

class ChartContainer extends Component {
    render() {
        return (
            <View style={[styles.title, { marginVertical: 15 }]}>
                <View style={[{ flexDirection: 'row', flex: 1 }, styles.cartImage]}>
                    <Image
                        source={require('../assets/avatar.png')}
                        style={styles.imageStyle}
                    />
                    <View>
                        <Text style={{ paddingTop: 4, color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                            Product Name
                        </Text>
                        <Text style={styles.descriptionText}>
                            Lorem Spum dsajkhdakjdhsakjdh
                        </Text>
                    </View>
                    <Text style={[styles.descriptionText, { paddingTop: 4, }]}>$24</Text>
                </View>
            </View>
        )
    }
}
export default ChartContainer

const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    title : { flexDirection: 'row', paddingHorizontal: 6, alignItems: 'center' , justifyContent : 'space-between' },
    imageStyle: {
      height: 111,
      width: 111,
      borderRadius: 12    ,
      marginHorizontal: 12,
      resizeMode: 'contain'
    },
    cartImage : {justifyContent : 'center'  ,alignItems : 'center' , height : 150},
    descriptionText : { color: '#fff', fontSize: 13 , color : 'grey'},
    listHeading : {paddingLeft: 18 , fontSize : 16 , color : '#fff' ,
    fontWeight : 'bold' , marginVertical: 12,},
    input : {height : 45 , backgroundColor : '#fff' , borderRadius  : 5 , paddingLeft : 6},
    inputView : {flexDirection : 'row' , justifyContent : 'space-around' , marginVertical : 5 },
    borderButton : {borderColor : '#ccc' , borderWidth:  1, height : 40 },
    borderBottom : {borderBottomColor : '#454545' , borderBottomWidth : 8 , paddingBottom : 25},
    imageBtn : {height : 40 , width : 40 , backgroundColor :'#fff' , borderRadius : 25  ,
    justifyContent : 'center'  , alignItems : 'center' },
    productName : {margin: 12, color : '#fff' , fontSize : 28 , fontWeight : 'bold'},
  })
  