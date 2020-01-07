/* eslint-disable */

import React, { Component } from 'react'
import { Text, View, ScrollView, StyleSheet, Image } from 'react-native'
import { Icon, Input, Button } from 'react-native-elements'

import { themeColor, pinkColor } from '../Constant';

export default class SavedCards extends Component {
    static navigationOptions = {
        header: null,
    };
    render() {
        return (
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{
                    height: 100, flexDirection: 'row', alignItems: 'center',
                    justifyContent: 'space-between', marginHorizontal: 15,
                }}>
                    <Text style={{ color: '#fff', fontSize: 25, fontWeight: 'bold', marginTop: 12 }}>Saved Cards</Text>
                    <Icon type={'font-awesome'} name={'angle-left'} color={'#fff'} containerStyle={{ marginTop: 8 }}
                        size={25} />

                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5, flexWrap: 'wrap', flex: 1}}>
                    <View style={{ borderColor: '#fff', borderWidth: 1, padding: 15, backgroundColor: '#fff', width: '45%', borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image source={require('../assets/mastercard.png')} style={{ width: 40, height: 24 }} />
                            <View style={{ marginLeft: 14 }}>
                                <Text>Master Card</Text>
                                <Text>444</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColor,
    },
})

