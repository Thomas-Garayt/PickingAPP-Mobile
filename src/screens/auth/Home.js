import React from 'react'
import {View, StatusBar} from 'react-native'

// External modules
import {TabNavigator} from "react-navigation"


// screens
import Course from './Course'
import About from "./About"

const Tabs = TabNavigator({
    Course: {screen: Course},
    About: {screen: About},
}, {
    tabBarPosition: 'bottom',
    tabBarOptions: {
        showIcon: false,
        showLabel:true,
        indicatorStyle: {
            height:2,
            backgroundColor: "#005555",
        }
    }
})



export default class Home extends React.Component {

    render(){
        return (
            <View style={{flex:1}}>
                <StatusBar hidden={false}/>
                <Tabs/>
            </View>
        )
    }
}