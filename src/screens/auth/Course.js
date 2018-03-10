import React from 'react'
import {View, Text, Button, ActivityIndicator} from 'react-native'
import style from '../../assets/css/Style'


export default class Course extends React.Component {

    _startCourse = () => {

    }

    render(){
        return (
            <View style={style.container}>
                <Text style={[style.h1, style.centerAlign]}>Course</Text>
                <Text style={[style.text, style.info]}>Bienvenue sur votre assistant personnel.</Text>
                <Text style={[style.text, style.info]}>Cliquez sur "Commencer" pour lancer une course.</Text>
                <Button
                    style={[style.button]}
                    title={"Commencer"}
                    onPress={() => this._startCourse()} />
            </View>
        )
    }
}