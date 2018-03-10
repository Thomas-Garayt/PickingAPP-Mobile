import React from 'react'
import {AppRegistry} from 'react-native'

// screens
import Login from './Login'
import Home from "./auth/Home";

export default class Router extends React.Component {

    state = {
        isLoggedIn: false,
        jwt:''
    }

    render() {
        if (this.state.isLoggedIn) {
            return (<Home/>)
        }
        else {
            return (
                <Login
                    onLoginPress={() => this.setState({isLoggedIn: true})}/>
            )
        }
    }
}

AppRegistry.registerComponent(Router , () => Router );