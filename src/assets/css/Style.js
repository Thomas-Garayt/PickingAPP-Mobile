import {StyleSheet} from 'react-native'

export default StyleSheet.create({
    h1: {
        fontSize: 26,
        marginBottom:40
    },
    h2: {
        fontSize: 22,
        marginBottom:30
    },
    text: {
        fontFamily:'Roboto',
        fontSize:14,
        color:'#454545',
        marginBottom:10,
    },
    info:{
        fontStyle:'italic',
        color:'#9e9e9e',
    },
    error: {
        fontSize: 14,
        color: 'red',
        padding: 5
    },
    centerAlign: {
        textAlign: 'center'
    },
    container: {
        marginHorizontal: 20,
        marginTop:10,
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    textInput:{
        height: 40,
        padding: 10,
        marginVertical: 10,
    },
    button:{
        height:50,
        marginTop:110,
    },
    textBlue:{
        color:"#0099FF"
    }
})