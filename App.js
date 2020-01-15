/* eslint-disable */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, ScrollView, StatusBar, Linking } from 'react-native';
import Routes from './navigation'
import { themeColor } from './Constant/index'
import { store, persistor } from './redux/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
// import DeepLinking from 'react-native-deep-linking';

export default class App extends Component {
  constructor(props) {
    super(props)
    console.disableYellowBox = true;
  }

  componentDidMount() {
    console.log('componentDidMount');
    console.log('PRops =========>', this.props)

    // DeepLinking.addScheme('example://');
    // Linking.addEventListener('url', this.handleUrl);
    // DeepLinking.addRoute('/Blog', (response) => {
      // example://test
    //   console.log('response', response)
    //   this.setState({ response });
    // });

  }
  // componentWillUnmount() {
  //   Linking.removeEventListener('url', this.handleUrl);
  // }

  // handleUrl = ({ url }) => {
  //   console.log('URL', url);

  //   Linking.canOpenURL(url).then((supported) => {
  //     console.log('supported', supported);

  //     if (supported) {
  //       // this.props.navigation.navigate(ur)
  //       DeepLinking.evaluateUrl(url);
  //     }
  //   });
  // };


  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Routes />
        </PersistGate>
      </Provider>
    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
