/* eslint-disable */

import React, { Component } from 'react'
import { Text, View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { Icon, Input, Button } from 'react-native-elements'
import { connect } from 'react-redux'
import firebaseLib from 'react-native-firebase'
import Spinner from 'react-native-loading-spinner-overlay';

import CustomButton from '../Component/Button'
import { themeColor, pinkColor } from '../Constant';
import firebase from '../utils/firebase'
import { emptyChart } from '../redux/actions/chartActions'

const stripe = require("stripe-client")(
    "pk_test_CoqYQbVZ6tJwY9dFWN7UTfin00QpVQsX20"
);

class ProductPay extends Component {
    state = {
        cardNumber: '4000056655665556',
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
        const subscription = this.props.navigation.state.params.subscription
        const { userObj, emptyChart, navigation } = this.props
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
        try {
            let customer = customerId;
            this.setState({ loading: true })

            if (!customerId) {
                console.log('Ifff')
                // Creating stripe customer id if not found in database
                let customerId = await fetch('https://e2a9139d.ngrok.io/customer-id', {
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

            // generating token for stripe customer payment source
            let token = await stripe.createToken(params);
            if ('error' in token) {
                console.log('Error =====>')
                this.setState({ loading: false })
                return
            }
            token = token.id

            // Generating customer payment source
            const body = {
                token,
                customer
            }
            let fingerPrint = await fetch('https://e2a9139d.ngrok.io/customer-source', {
                headers: {
                    "Content-Type": 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(body)
            })
            fingerPrint = await fingerPrint.json()
            // customerId = customerId.response.id
            const dbLib = firebaseLib.firestore()

            if (!subscription) {
                // One time Pay
                const amount = this.props.navigation.state.params.amount
                const chargeBody = {
                    customer,
                    amount,
                    source: fingerPrint.response.id
                }
                let chargeResponse = await fetch('https://e2a9139d.ngrok.io/charge-customer', {
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify(chargeBody)
                })
                chargeResponse = await chargeResponse.json()
                // customerId = customerId.response.id
                if ('errorMessage' in chargeResponse) {
                    console.log('Error ======>')
                    this.setState({ loading: false })
                    return
                }
            }

            else {
                // Start Subscription
                const subscriptionBody = {
                    customerId,
                    source: fingerPrint.response.id
                }
                let chargeSubscription = await fetch('https://e2a9139d.ngrok.io/subscription', {
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify(subscriptionBody)
                })
                chargeSubscription = await chargeSubscription.json()
                if ('errorMessage' in chargeSubscription) {
                    console.log('Error ======>')
                    this.setState({ loading: false })
                    return
                }

            }
            
            // Saving user card in db
            await dbLib.collection('Customers').doc(userId).collection('Cards').add(fingerPrint.response)
            emptyChart()
            alert('Success')
            navigation.replace('Feedback')
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
            customer: customerId
        }
        const { navigation } = this.props
        navigation.navigate('SavedCards', { data })
    }

    render() {
        const { cardNumber, expMonth, expYear, cvcNumber, email, loading } = this.state
        const amount = this.props.navigation.state.params.amount
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
                <TouchableOpacity style={styles.btnContainer} onPress={() => this.pay()}>
                    <Text style={styles.payText}>Pay</Text>
                    <Text style={styles.amount}>{`${amount}$`}</Text>
                </TouchableOpacity>
            </ScrollView>
        )
    }
}
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
export default connect(mapStateToProps, mapDispatchToProps)(ProductPay)


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColor,
    },
    btnContainer: {
        flexDirection: 'row',
        width: '90%',
        marginTop: 12,
        backgroundColor: pinkColor,
        justifyContent: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 15,
        borderRadius: 100,
    },
    payText: {
        color: '#fff',
        marginRight: 10
    },
    amount: {
        color: '#fff'
    }
})  
