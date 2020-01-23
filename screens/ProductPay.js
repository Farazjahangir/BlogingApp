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
        cardNumber: '6200000000000005',
        expMonth: '01',
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
        const type = this.props.navigation.state.params.type
        const { userObj, emptyChart, navigation, chart } = this.props
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
                let customerId = await fetch('https://5d95dca2.ngrok.io/customer-id', {
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
                alert(token.error.message)
                this.setState({ loading: false })
                return
            }
            token = token.id

            // Generating customer payment source
            const body = {
                token,
                customer
            }
            console.log('SourceBody', body);

            let fingerPrint = await fetch('https://5d95dca2.ngrok.io/customer-source', {
                headers: {
                    "Content-Type": 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(body)
            })
            fingerPrint = await fingerPrint.json()
            if ('errorMessage' in fingerPrint) {
                const { errorMessage: { raw: { message } } } = fingerPrint
                alert(message)
                this.setState({ loading: false })
                return
            }

            console.log('fingerPrint ====>', fingerPrint);
            console.log('customerId', customerId);
            
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
                let chargeResponse = await fetch('https://5d95dca2.ngrok.io/charge-customer', {
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify(chargeBody)
                })
                chargeResponse = await chargeResponse.json()
                // customerId = customerId.response.id
                if ('errorMessage' in chargeResponse) {
                    const { errorMessage: { raw: { message } } } = chargeResponse
                    alert(message)
                    this.setState({ loading: false })
                    return
                }
                console.log('Charge Response ========>', chargeResponse);
                const productDetails = {
                    userId,
                    products: [],
                    chargeDetails : chargeResponse,
                    amount,
                    createdAt: Date.now()
                }
                console.log('productDetails', productDetails);
                
                chart.map((item, index) => {
                    const c = {...item};
                    c.sellerId = chart[index].userId;
                    delete c.userId;
                    delete c.createdAt
                    productDetails.products.push(c)
                })
                await firebase.addDocument('Orders', productDetails)
            }

            else {
                // Start Subscription
                const subscriptionBody = {
                    customerId,
                    source: fingerPrint.response.id,
                    type
                }
                let chargeSubscription = await fetch('https://5d95dca2.ngrok.io/subscription', {
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify(subscriptionBody)
                })
                chargeSubscription = await chargeSubscription.json()
                if ('errorMessage' in chargeSubscription) {
                    alert('Something went wrong try again later')
                    this.setState({ loading: false })
                    return
                }
                console.log('chargeSubscription', chargeSubscription);
                
                const updateUserDoc = {
                    userType: 'paid',
                    userPackage: type,
                    subscriptionId: chargeSubscription.subscription.id
                }
                await firebase.updateDoc('Users', userId , updateUserDoc)

            }

            // Saving user card in db
            
            await dbLib.collection('Customers').doc(userId).collection('Cards').add(fingerPrint.response)
            
            emptyChart()
            this.setState({ loading: false })
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
        const subscription = this.props.navigation.state.params.subscription
        const type = this.props.navigation.state.params.type

        const { customerId } = this.state
        const data = {
            amount,
            customer: customerId
        }
        const { navigation } = this.props
        navigation.navigate('SavedCards', { data, subscription, type })
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
        userObj: state.auth.user,
        chart: state.chart.chart
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
