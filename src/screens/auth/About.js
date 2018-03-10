import React from 'react'
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native'
import style from '../../assets/css/Style'


export default class About extends React.Component {

    render(){
        return (
            <View style={style.container}>
                <Text style={[style.h1, style.centerAlign]}>Informations</Text>
                <Text style={style.h2}>Application</Text>
            </View>
        )
    }
}