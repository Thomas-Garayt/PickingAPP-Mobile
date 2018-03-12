import React from 'react'
import {View,ScrollView, Text, Button, ActivityIndicator, } from 'react-native'
import style from '../../assets/css/Style'
const GLOBAL = require('../../../Globals');

export default class Course extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            user:'',
            preparation:'',
            course:'',
            message:'',
            step:0,
        }
    }


    componentDidMount() {
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
                this.setState({ isLoading: false})
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

                if (response.message == undefined) {
                    this.setState({
                        course:response
                    })
                }
                else {
                    this.setState({ message: response.message })
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
        if(this.state.step < this.state.course.length) {
            this.setState({isLoading:true, step: this.state.step + 1});
            this.setState({isLoading: false});
        } else {
            this._finishCourse();
        }
    }


    _finishCourse = () => {
        console.log("finishing course...");
        this.setState({isLoading: true});
        this.setState({course: ''});
        this.setState({isLoading: false});
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
            if(!this.state.course) {
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


                        {this.state.isLoading && <ActivityIndicator size={"large"} color={"#0099ff"} />}
                        {!!this.state.message && (
                            <Text style={[style.text, style.centerAlign, style.error]}>
                                {this.state.message}
                            </Text>
                        )}
                    </View>
                )
            } else {
                const{step} = this.state;
                return(
                    <ScrollView style={style.container}>
                        <Text style={[style.h1, style.centerAlign]}>Course</Text>

                        <View style={style.container}>
                            <Text style={[style.text, style.big]}>
                                <Text style={[style.bold]}>Etape : </Text>
                                <Text>{step + 1} / {this.state.course.length}</Text>
                            </Text>

                            <Text style={[style.text, style.big]}>
                                <Text style={[style.bold]}>Quantité : </Text>
                                <Text>{this.state.course[step].quantity}</Text>
                            </Text>
                        </View>

                        <View style={style.container}>
                            <Text style={[style.h2]}>{"\n"}Localisation</Text>
                            <Text style={[style.text]}>
                                <Text style={[style.bold]}>Allée : </Text>
                                <Text>{this.state.course[step].productPosition.position.lane}{this.state.course[step].productPosition.position.landmark}</Text>

                                <Text style={[style.bold]}> - Section : </Text>
                                <Text>{this.state.course[step].productPosition.position.section}</Text>

                                <Text style={[style.bold]}> - Etagère : </Text>
                                <Text>{this.state.course[step].productPosition.position.shelf}</Text>
                            </Text>
                        </View>

                        <View style={style.container}>
                            <Text style={[style.h2]}>{"\n"}Informations</Text>
                            <Text style={[style.text]}>
                                <Text style={[style.bold]}>Poids : </Text>
                                <Text>{this.state.course[step].productPosition.product.weight} KG</Text>
                            </Text>
                            <Text style={[style.text]}>
                                <Text style={[style.bold]}>EAN13 : </Text>
                                <Text>{this.state.course[step].productPosition.product.ean13}</Text>
                            </Text>
                        </View>

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

                            {this.state.isLoading && <ActivityIndicator size={"large"} color={"#0099ff"} />}
                            {!!this.state.message && (
                                <Text style={[style.text, style.centerAlign, style.error]}>
                                    {this.state.message}
                                </Text>
                            )}
                            <Text>{"\n"}{"\n"}</Text>
                        </View>
                    </ScrollView>
                )
            }
        }
    }
}