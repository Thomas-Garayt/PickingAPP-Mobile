import React from 'react'
import {View, ScrollView, Text, Button, ActivityIndicator, AppRegistry, Linking, Alert, Modal} from 'react-native'
import style from '../../assets/css/Style'
const GLOBAL = require('../../../Globals');

// external NFC
import NfcManager, {NdefParser} from 'react-native-nfc-manager'


export default class Course extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            user:false,
            preparation:false,
            course:false,
            message:'',
            step:0,
            retrieved:0,
            overflow:false,
            stepValid:false,
            finished:false,
            nfc:false,
            tag:{}
        }
    }


    componentDidMount() {
        // load user from storage
        this.setState({isLoading:true})
        console.log("loading user...", storage)
        storage.load({
            key: 'user',
        }).then(data => {
            console.log("loaded user from storage")
            this.setState({
                user:data,
                isLoading:false,
            })
        }).catch(err => {
            console.log('key NOT found in storage !')
            console.warn(err.message);
            this.setState({isLoading:true})
        })

        // Check for NFC
        //this.setState({message:'check for NFC...'})
        NfcManager.isSupported()
            .then(supported => {
                if (supported) {
                    //this.setState({ message:'NFC is supported' });
                    this._startNfc();
                } else {
                    this.setState({ message:'NFC is not supported !' });
                }
            })
    }

    componentWillUnmount() {
        if (this._stateChangedSubscription) {
            this._stateChangedSubscription.remove();
        }

        if(this.state.nfc){
            this._stopDetection()
        }
    }


    _startNfc() {
        NfcManager.start({
            onSessionClosedIOS: () => {
                console.log('ios session closed');
            }
        })
            .then(result => {
                console.log('start OK', result);
                this.setState({nfc:true});
            })
            .catch(error => {
                console.warn('start fail', error);
                this.setState({message:'nfc start error'});
            })

        if (Platform.OS === 'android') {
            NfcManager.getLaunchTagEvent()
                .then(tag => {
                    console.log('launch tag', tag);
                    if (tag) {
                        //this.setState({ tag });
                        //this.setState({message:'tag event'});
                    }
                })
                .catch(err => {
                    console.log(err);
                    Alert.alert(JSON.stringify(err))
                })
            NfcManager.isEnabled()
                .then(enabled => {
                    //this.setState({ enabled });
                    //this.setState({message:'nfc is enabled'});
                })
                .catch(err => {
                    console.log(err);
                    Alert.alert(JSON.stringify(err))
                })
            NfcManager.onStateChanged(
                event => {
                    if (event.state === 'on') {
                        //this.setState({enabled: true});
                    } else if (event.state === 'off') {
                        this.setState({enabled: false});
                    } else if (event.state === 'turning_on') {
                        // do whatever you want
                    } else if (event.state === 'turning_off') {
                        // do whatever you want
                    }
                }
            )
                .then(sub => {
                    this._stateChangedSubscription = sub;
                    // remember to call this._stateChangedSubscription.remove()
                    // when you don't want to listen to this anymore
                })
                .catch(err => {
                    console.warn(err);
                    Alert.alert(JSON.stringify(err))
                })
        }
    }

    _onTagDiscovered = tag => {
        console.log('Tag Discovered', tag);
        this.setState({
            message:"success",
            tag: tag.ndefMessage[0]
        });
        let url = this._parseUri(tag);
        if (url) {
            //this.setState({ message: url });
            /*Linking.openURL(url)
                .catch(err => {
                    console.warn(err);
                    Alert.alert(JSON.stringify(err))
                })*/
            let valid = this._scanProduct(url);

            if(valid) {
                this.setState({retrieved: this.state.retrieved + 1});
                this._checkQuantity();
            }

        }
    }

    _stopDetection = () => {
        NfcManager.unregisterTagEvent()
            .then(result => {
                console.log('unregisterTagEvent OK', result)
            })
            .catch(error => {
                console.warn('unregisterTagEvent fail', error)
            })
    }

    _parseUri = (tag) => {
        if (tag.ndefMessage) {
            let result = NdefParser.parseUri(tag.ndefMessage[0]),
                uri = result && result.uri;
            if (uri) {
                console.log('parseUri: ' + uri);
                //Alert.alert(JSON.stringify(uri))
                return uri;
            }
        }
        return null;
    }

    _startCourse = () => {
        this.getPreparation();

        if(this.state.nfc){
            NfcManager.registerTagEvent(this._onTagDiscovered)
                .then(result => {
                    console.log('registerTagEvent OK', result)

                })
                .catch(error => {
                    console.warn('registerTagEvent fail', error)
                    this.setState({message:'failed read tag'})
                })
        } else {
            this.setState({message:'Le lecteur NFC ne fonctionne pas !'})
        }

    }

    getPreparation = () => {

        console.log("Get preparation for user : " + this.state.user.id);

        this.setState({ isLoading: true})

        fetch(GLOBAL.BASE_URL + "preparations/" + this.state.user.id, {
            method: GLOBAL.METHOD.POST,
            headers: {
                Accept: GLOBAL.CONTENT_TYPE.JSON,
                'Content-Type': GLOBAL.CONTENT_TYPE.JSON,
                'X-Auth-Token':this.state.user.jwt
            },
            //body: JSON.stringify(params)
        })
        .then((response) => response.json())
        .then((response) => {
                console.log(response);

                if (response.id != undefined) {
                    this.setState({
                        preparation:response
                    })
                    this.getCourse();
                }
                else {
                    this.setState({ message: response.message })
                }
            })
            .then(() => {
                //this.setState({ isLoading: false})
            })
            .catch(err => {
                this.setState({ message: err.message })
                this.setState({ isLoading: false })
        });
    }


    getCourse = () => {

        console.log("Get course for preparation : " + this.state.preparation.id);

        this.setState({ isLoading: true})

        fetch(GLOBAL.BASE_URL + "courses/" + this.state.preparation.id, {
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
                console.log(response);

                if (response.message != undefined) {
                    this.setState({ message: response.message })
                }
                else {
                    // on success
                    this.setState({
                        course:response
                    })
                }
            })
            .then(() => {
                this.setState({ isLoading: false})
            })
            .catch(err => {
                this.setState({ message: err.message })
                this.setState({ isLoading: false })
            });
    }


    _scanProduct = (url) => {
        console.log("scanning product...");

        let scan = url.split("ean13://")[1];

        if(!scan) {
            this.setState({ message: "Tag NFC invalide !" })
            return false;
        }


        let product = this.state.course[this.state.step].productPosition.product.ean13;

        if(!product) {
            this.setState({
                message: "Impossible de trouver le code " +
                "EAN13 dans votre course à l'étape : " + this.state.step
            });
            return false;
        }

        if(scan != product) {
            this.setState({
                message: "L'article scanné ("+scan+") ne correspond pas au produit actuel ("+product+")"
            });
            //return false;
            return true;
        }

        return true;
    }

    _reportProduct = () => {
        console.log("reporting product stock...");

        Alert.alert(
            'Stock insuffisant',
            "Confirmez-vous que le stock n'est pas suffisant pour valider cette étape ?",
            [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'OK', onPress: () => {

                        let params = {type:"stock"};

                        let productPosition = this.state.course[this.state.step].productPosition.id;

                        fetch(GLOBAL.BASE_URL + "productposition/"+productPosition+"/notifications", {
                            method: GLOBAL.METHOD.POST,
                            headers: {
                                Accept: GLOBAL.CONTENT_TYPE.JSON,
                                'Content-Type': GLOBAL.CONTENT_TYPE.JSON,
                                'X-Auth-Token':this.state.user.jwt
                            },
                            body: JSON.stringify(params)
                        })
                            .then((response) => response.json())
                            .then((response) => {

                                if (response.message != undefined) {
                                    this.setState({ message: response.message })
                                }
                                else {
                                    this.setState({stepValid:true});
                                }
                            })
                            .then(() => {
                                this.setState({isLoading:false});
                            })
                            .catch(err => {
                                this.setState({ message: err.message })
                                this.setState({ isLoading: false })
                            });



                }},
            ],
            { cancelable: true }
        )

    }

    _validateStep = () => {
        console.log("validating current step...");
        if(this.state.step < this.state.course.length -1) {
            this.setState({isLoading:true});
            //setTimeout(() => {this.setState({isLoading:false})}, 500)

            let params = {
                stepValidated:true
            };

            fetch(GLOBAL.BASE_URL + "courses/update/" + this.state.course[this.state.step].id, {
                method: GLOBAL.METHOD.PATCH,
                headers: {
                    Accept: GLOBAL.CONTENT_TYPE.JSON,
                    'Content-Type': GLOBAL.CONTENT_TYPE.JSON,
                    'X-Auth-Token':this.state.user.jwt
                },
                body: JSON.stringify(params)
            })
                .then((response) => response.json())
                .then((response) => {
                    console.log(response);

                    if (response.message != undefined) {
                        this.setState({ message: response.message })
                    }
                    else {
                        //on success
                        this.setState({
                            retrieved:0,
                            overflow:false,
                            stepValid:false,
                            tag:{},
                            step: this.state.step + 1
                        });
                    }
                })
                .then(() => {
                    this.setState({ isLoading: false})
                })
                .catch(err => {
                    this.setState({ message: err.message })
                    this.setState({ isLoading: false })
                });

        } else {
            this._finishCourse();
        }
    }


    _finishCourse = () => {
        console.log("finishing course...");
        this.setState({
            isLoading: true,
            course:false
        });
        //setTimeout(() => {this.setState({isLoading:false})}, 1000)

        fetch(GLOBAL.BASE_URL + "preparations/finish/" + this.state.preparation.id, {
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
                else {
                    // reset data
                    this.setState({
                        preparation:false,
                        course:false,
                        finished:true,
                    })
                }
            })
            .then(() => {
                this.setState({ isLoading: false})
            })
            .catch(err => {
                this.setState({ message: err.message })
                this.setState({ isLoading: false })
            });

    }


    _cancelOverflow = () => {
        this.setState({
            retrieved: this.state.retrieved - 1
        });
        setTimeout(() => {
            this._checkQuantity()
        }, 150)
    }


    _checkQuantity = () => {
        let check = (this.state.retrieved / this.state.course[this.state.step].quantity);
        if(check == 1) {
            this.setState({
                stepValid:true,
                message:''
            });
        } else if(check > 1) {
            this.setState({
                stepValid:false,
                overflow:true,
                message:"Vous avez pris trop d'articles ! " +
                "Veuillez reposer le surplus."
            });
        } else {
            this.setState({
                stepValid:false,
                message:''
            });
        }
    }

    render(){
        if(this.state.isLoading) {
            return(
                <View style={style.container}>
                    <Text style={[style.h1, style.centerAlign]}>Course</Text>
                    <Text style={[style.text, style.centerAlign]}>Veuillez patienter</Text>
                    <ActivityIndicator size={"large"} color={"#0099ff"} />
                </View>
            )
        } else {
            if((!this.state.preparation || !this.state.course) && !this.state.finished) {
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

                        {!!this.state.message && (
                            <Text style={[style.text, style.centerAlign, style.error]}>
                                {this.state.message}
                            </Text>
                        )}
                    </View>
                )
            } else if(this.state.preparation && this.state.course && !this.state.finished) {
                const{step} = this.state;
                return(
                    <ScrollView style={style.container}>
                        <Text style={[style.h1, style.centerAlign]}>Course</Text>

                        {this.state.course[step].productPosition.position && <View style={style.container}>
                            <Text style={[style.h2]}>Localisation</Text>
                            <Text style={[style.text]}>
                                <Text style={[]}>Allée : </Text>
                                <Text style={[style.bold, style.big]}>{this.state.course[step].productPosition.position.lane}{this.state.course[step].productPosition.position.landmark}</Text>

                                <Text style={[]}> - Section : </Text>
                                <Text style={[style.bold, style.big]}>{this.state.course[step].productPosition.position.section}</Text>

                                <Text style={[]}> - Etagère : </Text>
                                <Text style={[style.bold, style.big]}>{this.state.course[step].productPosition.position.shelf}</Text>
                            </Text>
                        </View>}

                        {this.state.course[step].productPosition.product && <View style={style.container}>
                            <Text style={[style.h2]}>Informations</Text>
                            <Text style={[style.text]}>
                                <Text style={[style.bold]}>Poids : </Text>
                                <Text>{this.state.course[step].productPosition.product.weight} KG</Text>
                            </Text>
                            <Text style={[style.text]}>
                                <Text style={[style.bold]}>EAN13 : </Text>
                                <Text>{this.state.course[step].productPosition.product.ean13}</Text>
                            </Text>
                        </View>}

                        <View style={style.container}>
                            <Text style={[style.text, style.big]}>
                                <Text style={[style.bold]}>Etape : </Text>
                                <Text>{step + 1} / {this.state.course.length}</Text>
                            </Text>

                            {this.state.course[step].quantity && <Text style={[style.text, style.big]}>
                                <Text style={[style.bold]}>Quantité récupérée : </Text>
                                <Text> {this.state.retrieved} / {this.state.course[step].quantity}</Text>
                            </Text>}
                        </View>

                        <View style={style.container}>
                            {!!this.state.message && (
                                <Text style={[style.text, style.centerAlign, style.error]}>
                                    {this.state.message}
                                </Text>
                            )}

                            {!this.state.message && !this.state.stepValid && (<Text style={[style.text, style.info]}>
                                Approchez votre smartphone d'un tag NFC
                                pour scanner un article.{"\n"}
                                Répétez l'opération jusqu'à la récupération de la quantité demandée,
                                puis validez.
                            </Text>)}

                            {!this.state.message && !!this.state.stepValid && (<Text style={[style.text, style.textGreen]}>
                                Vous pouvez désormais passer à l'étape suivante.
                            </Text>)}
                        </View>

                        <View style={style.container}>
                            <Text style={[style.h2]}>{"\n"}Actions</Text>
                            {!this.state.stepValid && !!this.state.overflow && (<Button
                                style={[style.button]}
                                title={"Reposer un article"}
                                onPress={() => this._cancelOverflow()} />)}
                            <Button
                                style={[style.button]}
                                color={"#00CC55"}
                                disabled={!this.state.stepValid}
                                title={"Valider cette étape"}
                                onPress={() => this._validateStep()} />
                            <Text>{"\n"}</Text>
                            <Button
                                style={[style.button]}
                                color={"#EE0055"}
                                disabled={!!this.state.stepValid || !!this.state.overflow}
                                title={"Stock insuffisant"}
                                onPress={() => this._reportProduct()} />
                        </View>
                    </ScrollView>
                )
            } else {
                return (
                    <View style={style.container}>
                        <Text style={[style.h1, style.centerAlign]}>Courses</Text>
                        <Text style={[style.text]}>Bravo {this.state.user.name},{"\n"}</Text>
                        <Text style={[style.text]}>Vous avez terminé la course !{"\n"}{"\n"}</Text>
                        <Text style={[style.text, style.info]}>
                            Veuillez maintenant vous diriger vers le service ventilation
                            avec votre caddie.{"\n"}
                            Merci.
                        </Text>
                        {!!this.state.message && (
                            <Text style={[style.text, style.centerAlign, style.error]}>
                                {this.state.message}
                            </Text>
                        )}
                    </View>
                )
            }
        }
    }
}