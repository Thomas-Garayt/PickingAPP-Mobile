import React from 'react'
import {AppRegistry} from 'react-native'

// screens
import Login from './Login'
import Home from "./auth/Home";

export default class Router extends React.Component {

    state = {
        isLoggedIn: false,
    }


    setLogin = (status) => {
        this.setState({isLoggedIn:status})
    }


    render() {
        if (this.state.isLoggedIn) {
            return (<Home handleLogin={this.setLogin}
                onLogouts={() => {this.setState({isLoggedIn:false})}}
            />)
        }
        else {
            return (
                <Login
                    onLoginPress={() => {this.setState({isLoggedIn:true})}}/>
            )
        }
    }
}

AppRegistry.registerComponent(Router , () => Router );