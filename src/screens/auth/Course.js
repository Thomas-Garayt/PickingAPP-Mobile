import React from 'react'
import {View, Text, Button, ActivityIndicator} from 'react-native'
import style from '../../assets/css/Style'
const GLOBAL = require('../../../Globals');

export default class Course extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoggingIn: false,
            user:'',
        }
    }

    componentWillMount() {
        // load user from storage
        console.log("loading user...", storage)
        storage.load({
            key: 'user',
        }).then(data => {
            this.setState({user:data})
            console.log("loaded user from storage")
        }).catch(err => {
            console.log('key NOT found in storage !')
            console.warn(err.message);
        })
    }

    _startCourse = () => {
        console.log("begin course...")
    }

    render(){
        return (
            <View style={style.container}>
                <Text style={[style.h1, style.centerAlign]}>Course</Text>
                <Text style={[style.text]}>Bonjour {this.state.user.name},{"\n"}</Text>
                <Text style={[style.text]}>Bienvenue sur votre assistant personnel.{"\n\n"}</Text>
                <Text style={[style.text, style.info]}>Cliquez sur "Commencer" pour lancer une course.</Text>
                <Button
                    style={[style.button]}
                    title={"Commencer"}
                    onPress={() => this._startCourse()} />
            </View>
        )
    }
}