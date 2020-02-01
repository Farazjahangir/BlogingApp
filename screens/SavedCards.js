/* eslint-disable */

import React, { Component } from 'react'
import { Text, View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { Icon, Input, Button } from 'react-native-elements'
import { connect } from 'react-redux'
import firebaseLib from 'react-native-firebase'
import Spinner from 'react-native-loading-spinner-overlay';

import { themeColor, pinkColor } from '../Constant';
import Dialogue from '../Component/Dialogue'
import { emptyChart } from '../redux/actions/chartActions'
import firebase from '../utils/firebase'

class SavedCards extends Component {
    state = {
        cards: [],
        showDialogue: false,
        loading: true
    }
    static navigationOptions = {
        header: null,
    };

    async componentDidMount() {
        const db = firebaseLib.firestore()
        const subscription = this.props.navigation.state.params.subscription
        console.log('subscription', subscription);
        const { userObj: { userId } } = this.props
        const { cards } = this.state

        try {
            let cardsRes = await db.collection('Customers').doc(userId).collection('Cards').get()
            cardsRes = cardsRes._docs.forEach(data => cards.push(data.data()))
            this.setState({ cards })
            console.log('Cards', cards);
        }
        catch (e) {
            console.log('Eror ====>', e.message);
        }
        this.setState({ loading: false })
    }
    pay(val) {
        this.setState({ showDialogue: true })
        this.setState({ source: val.id });

    }
    productObjToEmail = () => {
        const { chart } = this.props
        const objToSend = []
        chart.map((item, i) => {
          const findedIndex = objToSend.findIndex(email => email.email === item.email)
          if(findedIndex === -1){
            const data = {
              email: item.email,
              products: [{
                name: item.productName,
                price: item.price
              }]
            }
            objToSend.push(data)
          }
          else if (findedIndex !== -1){
            const data = {
              name: item.productName,
              price: item.price
            }
            objToSend[findedIndex].products.push(data)
          }
        })
        return objToSend    
        
      }    
    handleOk = async () => {
        const data = this.props.navigation.state.params.data
        const subscription = this.props.navigation.state.params.subscription
        const type = this.props.navigation.state.params.type
        const emailObj =  this.productObjToEmail()
        this.setState({ showDialogue: false });
        const { source } = this.state
        const { emptyChart, navigation, chart, userObj: { userId } } = this.props
        data.source = source
        console.log(data)
        try {
            data.forEmail = emailObj,
            console.log('****************** data ***************', data);
            
            this.setState({ loading: true })
            if (!subscription) {
                // One Time Pay
                let chargeResponse = await fetch('https://7d06cf88.ngrok.io/charge-customer', {
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify(data)
                })
                chargeResponse = await chargeResponse.json()
                if ('errorMessage' in chargeResponse) {
                    const { errorMessage: { raw: { message } } } = chargeResponse
                    alert(message)
                    this.setState({ loading: false })
                    return
                }
                const productDetails = {
                    userId,
                    products: [],
                    chargeDetails : chargeResponse,
                    amount: data.amount,
                    createdAt: Date.now()
                }
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
                    customerId : data.customer,
                    source: data.source,
                    type,
                }
                let chargeSubscription = await fetch('https://7d06cf88.ngrok.io/subscription', {
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
                const updateUserDoc = {
                    userType: 'paid',
                    userPackage: type,
                    subscriptionId: chargeSubscription.subscription.id
                }
                await firebase.updateDoc('Users', userId , updateUserDoc)

            }
            emptyChart()
            navigation.replace('Feedback')
            alert('Success')
        }
        catch (e) {
            console.log('Error', e.message);
        }
        this.setState({ loading: false })
    };
    handleCancel = () => {
        this.setState({ showDialogue: false });
    };

    render() {
        const { cards, showDialogue, loading } = this.state
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
                    <Text style={{ color: '#fff', fontSize: 25, fontWeight: 'bold', marginTop: 12 }}>Saved Cards</Text>
                    <Icon type={'font-awesome'} name={'angle-left'} color={'#fff'} containerStyle={{ marginTop: 8 }}
                        size={25} />

                </View>
                <View style={styles.mainContainer}>
                    {!!cards.length ?
                        cards.map((val) => {
                            return (
                                <TouchableOpacity style={styles.box} onPress={() => this.pay(val)}>
                                    <View style={styles.flexRow}>
                                        {val.brand === 'MasterCard' && <Image source={require('../assets/mastercard.png')} style={styles.cardImage} />}
                                        {val.brand === 'Visa' && <Image source={require('../assets/visa.png')} style={styles.cardImage} />}
                                        {val.brand === 'American Express' && <Image source={require('../assets/american-express.png')} style={styles.americanExpress} />}
                                        <View style={{ marginLeft: 14 }}>
                                            <Text style={styles.brandName}>{val.brand}</Text>
                                            <Text>{`(${val.last4})`}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        })
                        :
                        <Text style={styles.error}>You Don't have any saved cards</Text>
                    }
                </View>
                {showDialogue &&
                    <Dialogue
                        title='Confirm Payment'
                        description='Do you want to confirm payment'
                        okButtonLabel="Confirm"
                        dialogVisible={showDialogue}
                        handleCancel={() => this.handleCancel()}
                        handleOk={() => this.handleOk()}
                    />}
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
export default connect(mapStateToProps, mapDispatchToProps)(SavedCards)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColor,
    },
    mainContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        flexWrap: 'wrap',
    },
    box: {
        borderColor: '#fff',
        borderWidth: 1,
        padding: 15,
        backgroundColor: '#fff',
        width: '49%',
        borderRadius: 10,
        marginTop: 10
    },
    flexRow: {
        flexDirection: 'row'
    },
    cardImage: {
        width: 40,
        height: 24
    },
    americanExpress: {
        width: 55,
        height: 24
    },
    brandName: {
        fontSize: 12,
        width: '90%'
    },
    error: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 19,
        marginTop: 20
    }
})