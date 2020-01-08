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
    handleOk = async () => {
        const data = this.props.navigation.state.params.data
        this.setState({ showDialogue: false });
        const { source } = this.state
        const { emptyChart , navigation } = this.props
        data.source = source
        console.log(data)
        try {
            this.setState({ loading: true })
            let chargeResponse = await fetch('https://af172d5a.ngrok.io/charge-customer', {
                headers: {
                    "Content-Type": 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(data)
            })
            chargeResponse = await chargeResponse.json()
            // customerId = customerId.response.id
            console.log('chargeResponse', chargeResponse);
            if ('errorMessage' in chargeResponse) {
                console.log('Error ======>')
                return
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
                    {!!cards.length &&
                        cards.map((val) => {
                            return (
                                <TouchableOpacity style={styles.box} onPress={() => this.pay(val)}>
                                    <View style={styles.flexRow}>
                                        <Image source={require('../assets/mastercard.png')} style={styles.cardImage} />
                                        <View style={{ marginLeft: 14 }}>
                                            <Text>{val.brand}</Text>
                                            <Text>{`(${val.last4})`}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        })
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
        userObj: state.auth.user
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
        backgroundColor:
            '#fff',
        width: '45%',
        borderRadius: 10,
        marginTop: 10
    },
    flexRow: {
        flexDirection: 'row'
    },
    cardImage: {
        width: 40,
        height: 24
    }
})