import React from 'react'
import {View, ScrollView, Text, TextInput, Button, ActivityIndicator} from 'react-native'
import style from '../assets/css/Style'
const GLOBAL = require('../../Globals');


export default class Login extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            username: 'mimi',
            password: '123456',
            isLoggingIn: false,
            message: ''
        }

    }


    _userLogin = () => {
        this.setState({isLoggingIn: true, message: ''});

        let params = {
            login: this.state.username,
            password: this.state.password,
        };

        /*var formBody = [];
        for (var property in params) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(params[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");*/

        var proceed = false;

        fetch(GLOBAL.BASE_URL + "auth-tokens", {
            method: GLOBAL.METHOD.POST,
            headers: {
                Accept: GLOBAL.CONTENT_TYPE.JSON,
                'Content-Type': GLOBAL.CONTENT_TYPE.JSON
            },
            body: JSON.stringify(params)
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.value != undefined) {
                    proceed = true
                    this.setState({
                        message:'Success:' + proceed
                    })


                    // save in Storage
                    storage.save({
                        key: 'user',
                        data: {
                            jwt: response.value,
                            id: response.user.id,
                            name: response.user.username,
                        }
                    });
                }
                else {
                    this.setState({ message: response.message })
                }
            })
            .then(() => {
                this.setState({ isLoggingIn: false})
                if (proceed) {
                    this.props.onLoginPress();
                }
            })
            .catch(err => {
                this.setState({ message: err.message })
                this.setState({ isLoggingIn: false })
            });


    }

    clearUsername = () => {
        this.setState({ message: '' });
    }

    clearPassword = () => {
        this.setState({ message: '' });
    }

    render(){
        return (
            <ScrollView style={style.container}>
                <Text style={[style.h1, style.centerAlign]}>Authentification</Text>
                <Text style={[style.text, style.info]}>Vous devez vous connecter pour commencer une course.</Text>
                <View>
                    <TextInput
                        style={[style.textInput]}
                        placeholder={"pseudo"}
                        name={"username"}
                        onChangeText={(username) => this.setState({username})}
                        autoFocus={true}
                        onFocus={this.clearUsername}
                    />
                    <TextInput
                        style={[style.textInput]}
                        secureTextEntry={true} placeholder={"mot de passe"}
                        name={"password"}
                        onChangeText={(password) => this.setState({password})}
                        onFocus={this.clearPassword}
                    />
                    {this.state.isLoggingIn && <ActivityIndicator size={"large"} color={"#0099ff"} />}
                    {!!this.state.message && (
                        <Text style={[style.text, style.centerAlign, style.error]}>
                            {this.state.message}
                        </Text>
                    )}
                    <Button
                        style={[style.button]}
                        title={"Se connecter"}
                        disabled={this.state.isLoggingIn||!this.state.username||!this.state.password}
                        onPress={() => this._userLogin()} />
                </View>
            </ScrollView>
        )
    }
}