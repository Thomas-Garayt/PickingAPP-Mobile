import React from 'react'
import {View, Text, Button, StyleSheet, ActivityIndicator, Alert, ProgressBarAndroid, ProgressViewIOS, Platform} from 'react-native'
import style from '../../assets/css/Style'

const GLOBAL = require('../../../Globals');


export default class About extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            message: '',
            user:{},
            caracteristic:{},
            preparation:{},
        }
    }


    componentDidMount() {

        // First load
        this._refreshData();


        const didFocusSubscription = this.props.navigation.addListener(
            'didFocus',
            payload => {
                // Refresh data on screen focus
                this._refreshData();

                if(this.state.user.caracteristic.id) {
                    this._refreshUserCaracteristics()
                }

            }
        );
    }

    _refreshData = () => {
        this._refreshPreparation();
        this._refreshUser();
    }

    _refreshPreparation = () => {
        this.setState({isLoading:true});
        storage.load({
            key: 'preparation',
        }).then(data => {
            console.log("loaded preparation from storage")
            this.setState({
                preparation:data,
                isLoading:false,
            });
        }).catch(err => {
            console.log("key 'preparation' NOT found in storage !");
            this.setState({isLoading:false});
        });
    }

    _refreshUser = () => {
        this.setState({isLoading:true});
        storage.load({
            key: 'user',
        }).then(data => {
            console.log("loaded user from storage")
            this.setState({
                user:data,
                isLoading:false,
            });
            this._refreshUserCaracteristics();
        }).catch(err => {
            console.log("key 'preparation' NOT found in storage !");
            this.setState({isLoading:false});
        });
    }

    _refreshUserCaracteristics = () => {
        this.setState({isLoading:true});

        id = this.state.user.caracteristic.id;

        if(!id) {
            return false;
        }

        fetch(GLOBAL.BASE_URL + "usercaracteristics/"+id, {
            method: GLOBAL.METHOD.GET,
            headers: {
                Accept: GLOBAL.CONTENT_TYPE.JSON,
                'Content-Type': GLOBAL.CONTENT_TYPE.JSON,
                'X-Auth-Token':this.state.user.jwt
            },
            //body: JSON.stringify(params)
        })
            .then((response) => response.json())
            .then((response) => {

                if (response.message != undefined) {
                    this.setState({ message: response.message })
                } else {
                    this.setState({ caracteristic: response })
                }
            })
            .then(() => {
                this.setState({isLoading:false});
            })
            .catch(err => {
                this.setState({ message: err.message })
                this.setState({ isLoading: false })
            });

    }

    _logout = () => {

        Alert.alert(
            'Déconnexion',
            "Si vous vous déconnectez, vos courses en cours seront interrompues." +
            "\nVoulez-vous vraiment continuer ?",
            [
                {text: 'Annuler', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'Oui', onPress: () => {

                        this.setState({
                            isLoading:true,
                        });

                        if(this.state.preparation) {
                            this._finishPreparation();
                        } else {
                            this._destroySession();
                        }

                    }},
            ],
            { cancelable: true }
        )
    }


    _finishPreparation = () => {
        let id = this.state.preparation.id;

        // if preparation is already finished
        if(!id || this.state.preparation.endTime) {
            this._destroySession();
            return false;
        }

        fetch(GLOBAL.BASE_URL + "preparations/finish/"+id, {
            method: GLOBAL.METHOD.GET,
            headers: {
                Accept: GLOBAL.CONTENT_TYPE.JSON,
                'Content-Type': GLOBAL.CONTENT_TYPE.JSON,
                'X-Auth-Token':this.state.user.jwt
            },
            //body: JSON.stringify(params)
        })
            .then((response) => response.json())
            .then((response) => {

                if (response.message != undefined) {
                    this.setState({ message: response.message })
                }
            })
            .then(() => {
                this.setState({isLoading:false});
                this._destroySession();
            })
            .catch(err => {
                this.setState({ message: err.message })
                this.setState({ isLoading: false })
            });
    }

    _destroySession = () => {
        storage.remove({
            key: 'user'
        });

        storage.remove({
            key: 'preparation'
        });

        // Display Login screen
        this.props.screenProps.setLogin(false);
    }

    render(){
        if(this.state.isLoading) {
            return (
                <View style={style.container}>
                    <Text style={[style.h1, style.centerAlign]}>Course</Text>
                    <Text style={[style.text, style.centerAlign]}>Veuillez patienter</Text>
                    <ActivityIndicator size={"large"} color={"#0099ff"} />
                </View>
            )
        } else {
            return (
                <View style={style.container}>
                    <Text style={[style.h1, style.centerAlign]}>Informations</Text>
                    <Text style={style.h2}>Mon compte</Text>
                    {!!this.state.user && (
                        <View style={style.container}>
                            <Text style={style.text}>
                                {this.state.user.firstname} {this.state.user.lastname}
                                {"\n"}
                            </Text>
                            {!!this.state.caracteristic && (
                                <Text>
                                    <Text>Force : {this.state.caracteristic.strength} / 100{"\n"}</Text>
                                    <Text>Endurance : {this.state.caracteristic.currentStamina} / 100{"\n"}</Text>
                                </Text>
                            )}

                            {
                                ( Platform.OS === 'android' )
                                    ?
                                    ( <ProgressBarAndroid styleAttr = "Horizontal" progress = { parseFloat(this.state.caracteristic.currentStamina / 100) } indeterminate = { false } /> )
                                    :
                                    ( <ProgressViewIOS progress = { this.state.Progress_Value } /> )
                            }
                        </View>
                    )}
                    <Text>{"\n"}</Text>
                    <Button
                        style={[style.button]}
                        title={"Se déconnecter"}
                        onPress={() => this._logout()} />
                </View>
            )
        }
    }
}
