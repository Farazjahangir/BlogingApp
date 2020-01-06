/* eslint-disable */

/* eslint-disable */

import React, { Component } from 'react'
import { Text, View, ScrollView, StyleSheet, Image } from 'react-native'
import { Icon, Input, Button } from 'react-native-elements'
import { connect } from 'react-redux'

import CustomButton from '../Component/Button'
import { themeColor, pinkColor } from '../Constant';
import firebase from '../utils/firebase'
const stripe = require("stripe-client")(
    "pk_test_CoqYQbVZ6tJwY9dFWN7UTfin00QpVQsX20"
  );

class ProductPay extends Component {
    state = {
        cardNumber: '',
        expMonth: '',
        expYear: '',
        cvcNumber: ''
    }
    static navigationOptions = {
        header: null,
    };
    componentDidMount() {
        console.log('PRoductPay', this.props.navigation.state.params.amount);

    }

    validateFields = () => {
        const { cardNumber, expMonth, expYear, cvcNumber } = this.state
        if (!cardNumber || !expMonth || !expYear || !cvcNumber) {
            alert('All Fileds are Required')
            return true
        }
    }

    pay(){
        if(this.validateFields()) return

    }

    render() {
        const { cardNumber, expMonth, expYear, cvcNumber } = this.state
        return (
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{
                    height: 100, flexDirection: 'row', alignItems: 'center',
                    justifyContent: 'space-between', marginHorizontal: 15,
                }}>
                    <Text style={{ color: '#fff', fontSize: 25, fontWeight: 'bold', marginTop: 12 }}>Payment</Text>
                    <Icon type={'font-awesome'} name={'angle-left'} color={'#fff'} containerStyle={{ marginTop: 8 }}
                        size={25} />

                </View>
                <View style={{
                    flexDirection: 'row', justifyContent: 'space-between',
                    marginHorizontal: 12, marginVertical: 12
                }}>
                    <CustomButton title={'Back'} buttonStyle={{ borderColor: '#ccc', borderWidth: 1 }} onPress={() => this.back()} />
                    <CustomButton title={'Pay'} backgroundColor={pinkColor} onPress={() => this.pay()} />
                </View>
                <>
                    <Input
                        placeholder={'Card Number'}
                        type='number'
                        value={cardNumber}
                        placeholderTextColor={'#fff'}
                        inputContainerStyle={{ height: 80 }}
                        inputStyle={{
                            color: '#fff',
                            letterSpacing: 2
                        }}
                        onChangeText={(text) => this.setState({ cardNumber: text })}
                        keyboardType='number-pad'
                    />
                    <Input
                        placeholder={'Expiration month'}
                        value={expMonth}
                        placeholderTextColor={'#fff'}
                        inputContainerStyle={{ height: 80 }}
                        inputStyle={{
                            color: '#fff',
                            letterSpacing: 2
                        }}
                        onChangeText={(text) => this.setState({ expMonth: text })}
                    />
                    <Input
                        placeholder={'Expiration Year'}
                        type="number"
                        value={expYear}
                        placeholderTextColor={'#fff'}
                        inputContainerStyle={{ height: 80 }}
                        inputStyle={{
                            color: '#fff',
                            letterSpacing: 2
                        }}
                        onChangeText={(text) => this.setState({ expYear: text })}
                        keyboardType='number-pad'
                    />
                    <Input
                        placeholder={'CVC number'}
                        type="number"
                        value={cvcNumber}
                        placeholderTextColor={'#fff'}
                        inputContainerStyle={{ height: 80 }}
                        inputStyle={{
                            color: '#fff',
                            letterSpacing: 2
                        }}
                        onChangeText={(text) => this.setState({ cvcNumber: text })}
                        keyboardType='number-pad'
                    />
                </>
            </ScrollView>
        )
    }
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
const mapStateToProps = (state) => {
    return {
        userObj: state.auth.user
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ProductPay)


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColor,
    },
})  
