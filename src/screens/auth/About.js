import React from 'react'
import {View, Text, Button, StyleSheet, ActivityIndicator} from 'react-native'
import style from '../../assets/css/Style'

export default class About extends React.Component {

    constructor(props) {
        super(props);
    }

    _logout = () => {

        storage.remove({
            key: 'user'
        });

        this.props.screenProps.setLogin(false);
    }

    render(){
        return (
            <View style={style.container}>
                <Text style={[style.h1, style.centerAlign]}>Informations</Text>
                <Text style={style.h2}>Mon compte</Text>
                <Button
                    style={[style.button]}
                    title={"Se déconnecter"}
                    onPress={() => this._logout()} />
            </View>
        )
    }
}