import React from 'react'
import {View,ScrollView, Text, Button, ActivityIndicator, } from 'react-native'
import style from '../../assets/css/Style'
const GLOBAL = require('../../../Globals');

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
            finished:false,
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
    }

    _startCourse = () => {
        this.getPreparation();
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


    _scanProduct = () => {
        console.log("scanning product...");
    }

    _reportProduct = () => {
        console.log("reporting product stock...");
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
                        this.setState({step: this.state.step + 1});
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

                        <View style={style.container}>
                            <Text style={[style.text, style.big]}>
                                <Text style={[style.bold]}>Etape : </Text>
                                <Text>{step + 1} / {this.state.course.length}</Text>
                            </Text>

                            {this.state.course[step].quantity && <Text style={[style.text, style.big]}>
                                <Text style={[style.bold]}>Quantité : </Text>
                                <Text>{this.state.course[step].quantity}</Text>
                            </Text>}
                        </View>

                        {this.state.course[step].productPosition.position && <View style={style.container}>
                            <Text style={[style.h2]}>{"\n"}Localisation</Text>
                            <Text style={[style.text]}>
                                <Text style={[style.bold]}>Allée : </Text>
                                <Text>{this.state.course[step].productPosition.position.lane}{this.state.course[step].productPosition.position.landmark}</Text>

                                <Text style={[style.bold]}> - Section : </Text>
                                <Text>{this.state.course[step].productPosition.position.section}</Text>

                                <Text style={[style.bold]}> - Etagère : </Text>
                                <Text>{this.state.course[step].productPosition.position.shelf}</Text>
                            </Text>
                        </View>}

                        {this.state.course[step].productPosition.product && <View style={style.container}>
                            <Text style={[style.h2]}>{"\n"}Informations</Text>
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
                            <Text style={[style.h2]}>{"\n"}Actions</Text>
                            <Button
                                style={[style.button]}
                                title={"Scanner"}
                                onPress={() => this._scanProduct()} />
                            <Text>{"\n"}</Text>
                            <Button
                                style={[style.button]}
                                title={"Stock insuffisant"}
                                onPress={() => this._reportProduct()} />

                            <Text>{"\n"}{"\n"}</Text>
                            <Button
                                style={[style.button]}
                                title={"Valider cette étape"}
                                onPress={() => this._validateStep()} />

                            {!!this.state.message && (
                                <Text style={[style.text, style.centerAlign, style.error]}>
                                    {this.state.message}
                                </Text>
                            )}
                            <Text>{"\n"}{"\n"}</Text>
                        </View>
                    </ScrollView>
                )
            } else {
                return (
                    <View style={style.container}>
                        <Text style={[style.h1, style.centerAlign]}>Course</Text>
                        <Text style={[style.text]}>Bravo {this.state.user.name},{"\n"}</Text>
                        <Text style={[style.text]}>Vous avez terminé la course !{"\n"}{"\n"}</Text>
                        <Text style={[style.text, style.info]}>
                            Veuillez maintenant vous diriger vers le service ventilation
                            avec votre caddie.{"\n"}
                            Merci.
                        </Text>
                    </View>
                )
            }
        }
    }
}