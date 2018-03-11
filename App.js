/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';

import { AsyncStorage, YellowBox } from 'react-native';

// External
import Storage from 'react-native-storage';


// Components
import Router from './src/screens/Router'


// Init localStorage
var storage = new Storage({
    // maximum capacity, default 1000
    size: 1000,

    storageBackend: AsyncStorage,

    // expire time : 2 hours
    defaultExpires: 7200,

    // cache data in the memory. default is true.
    enableCache: true,
})

// save into global variable
global.storage = storage;


export default class App extends Component {

  constructor(props) {
    super(props);

    // cheat to ignore warnings
    YellowBox.ignoreWarnings([
        'Warning: componentWillMount is deprecated',
        'Warning: componentWillReceiveProps is deprecated',
    ]);
  }

  render() {
    return (
        <Router/>
    );
  }
}