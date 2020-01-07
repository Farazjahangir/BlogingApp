/* eslint-disable */

import React, { Component } from 'react'
import { Text, View, ScrollView, StyleSheet, Image } from 'react-native'
import { Icon, Input, Button } from 'react-native-elements'
import { connect } from 'react-redux'
import firebaseLib from 'react-native-firebase'
import Spinner from 'react-native-loading-spinner-overlay';

import CustomButton from '../Component/Button'
import { themeColor, pinkColor } from '../Constant';
import firebase from '../utils/firebase'

const stripe = require("stripe-client")(
    "pk_test_CoqYQbVZ6tJwY9dFWN7UTfin00QpVQsX20"
);

class ProductPay extends Component {
    state = {
        cardNumber: '378282246310005',
        expMonth: '05',
        expYear: '2020',
        cvcNumber: '222',
        email: '',
        customerId: '',
        loading: false
    }
    static navigationOptions = {
        header: null,
    };
    async componentDidMount() {
        const { userObj } = this.props
        const { email, userId } = userObj
        const userData = await firebase.getDocument('Users', userId)
        const customerId = userData.data().customerId
        this.setState({ email, customerId })
    }

    validateFields = () => {
        const { cardNumber, expMonth, expYear, cvcNumber } = this.state
        if (!cardNumber || !expMonth || !expYear || !cvcNumber) {
            alert('All Fileds are Required')
            return true
        }
    }

    async pay() {
        let { cardNumber, expMonth, expYear, cvcNumber, email, customerId } = this.state
        console.log('Email', email);

        const { userObj } = this.props
        const { userId } = userObj
        if (this.validateFields()) return
        const params = {
            card: {
                number: cardNumber,
                exp_month: expMonth,
                exp_year: expYear,
                cvc: cvcNumber
            }
        }
        console.log('params', params);

        try {
            let customer = customerId;
            this.setState({ loading: true })
            if (!customerId) {
                let customerId = await fetch('https://08a53661.ngrok.io/customer-id', {
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        email
                    })
                })
                customerId = await customerId.json()
                customerId = customerId.response.id
                customer = customerId
                await firebase.updateDoc('Users', userId, { customerId })
                this.setState({ customerId })
            }            
            let token = await stripe.createToken(params);
            if ('error' in token) {
                console.log('Error =====>')
                this.setState({ loading: false })
                return
            }
            token = token.id
            console.log('Token', token);
            const body = {
                token,
                customer
            }
            console.log('finger Body', body);

            let fingerPrint = await fetch('https://08a53661.ngrok.io/customer-source', {
                headers: {
                    "Content-Type": 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(body)
            })
            console.log(fingerPrint);

            fingerPrint = await fingerPrint.json()
            // customerId = customerId.response.id
            console.log('FingerPrint =====>', fingerPrint);
            const dbLib = firebaseLib.firestore()
            await dbLib.collection('Customers').doc(userId).collection('Cards').add(fingerPrint.response)

            const amount = this.props.navigation.state.params.amount
            const chargeBody = {
                customer,
                amount: amount * 100,
                source: fingerPrint.response.id

            }
            console.log('chargeBody', chargeBody);

            let chargeResponse = await fetch('https://08a53661.ngrok.io/charge-customer', {
                headers: {
                    "Content-Type": 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(chargeBody)
            })
            chargeResponse = await chargeResponse.json()
            // customerId = customerId.response.id
            console.log('chargeResponse', chargeResponse);
            if ('errorMessage' in chargeResponse) {
                console.log('Error ======>')
                this.setState({ loading: false })
                return
            }
            alert('Success')
        }
        catch (e) {
            console.log('Error ====>', e.message);
        }
        this.setState({ loading: false })

    }
    goToSavedCards() {
        const amount = this.props.navigation.state.params.amount
        const { customerId } = this.state
        const data = {
            amount,
            customer : customerId
        }
        const { navigation } = this.props
        navigation.navigate('SavedCards', { data })
    }

    render() {
        const { cardNumber, expMonth, expYear, cvcNumber, email, loading } = this.state
        console.log('cardNumber', cardNumber);

        return (
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
                <Spinner
                    visible={loading}
                    textContent={'Loading...'}
                    textStyle={{ color: '#fff' }}
                />
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
                    <CustomButton title={'Pay By Saved Cards'} backgroundColor={pinkColor} onPress={() => this.goToSavedCards()} />
                </View>
                <>
                    <Input
                        placeholder={'Email '}
                        value={email}
                        placeholderTextColor={'#fff'}
                        inputContainerStyle={{ height: 80 }}
                        inputStyle={{
                            color: '#fff',
                            letterSpacing: 2
                        }}
                        keyboardType='email-address'
                        editable={false}
                    />
                    <Input
                        placeholder={'Card Number'}
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
                        keyboardType='number-pad'
                    />
                    <Input
                        placeholder={'Expiration Year'}
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
                <CustomButton title={'Pay'} backgroundColor={pinkColor} onPress={() => this.pay()} containerStyle={{ marginVertical: 20 }} />
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
