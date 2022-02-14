import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { inject, observer } from 'mobx-react/native';
import { Actions } from 'react-native-router-flux';
import { Container, Header, Button, Text, Content, Spinner } from 'native-base';

import * as auth from '../api/auth';
import api from "../api/apiClient.js";

import { Colors, Keys } from '../config';
import { T } from '../localize/localizer';

import stores from '../model/userstore';

@inject('userStore') @observer
export default class Launch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: 'Loading Wallets',
            tryAgain: false,
        }
    }

    async componentDidMount() {
        await this.loadMarket();
    }

    loadMarket = async() => {
        var isTestnet = this.props.userStore.userSettings.isTestnet();
        var pkLoaded = await auth.loadPK(isTestnet);
        if(pkLoaded) {
            console.log(`Launch >> staging: ${isTestnet}`);
            this.setState({message: T('common.loading')});
            try {
                let details = await api.details();
                this.props.userStore.loadMarket(details);
                // skip lock screen for faster startup when disabled
                if(this.props.userStore.lockSettings.option === 'none') Actions.jump('market');
                else Actions.jump('lock');
            } catch(e) {
                this.setState({tryAgain: true});
            }
        }
        else {
            console.log(`Launch >> firstUse`);
            Actions.push('firstuse');
        } 
    }

    fetchMarket = async () => {
        
    }

    render() {
        return (
            <Container style={_styles.page}>
                <Content containerStyle={_styles.fill}>
                    <Spinner color={Colors.action} />
                    <Text style={{color: Colors.bodyFG, textAlign: 'center', fontSize: 18}}>{this.state.message}</Text>
                    { this.state.tryAgain && 
                        <View style={{flexDirection: 'column'}}>
                            <Text style={_styles.subtext}>{T('common.connection_problem')}</Text>
                            <TouchableOpacity style={{backgroundColor: Colors.buttonBG, alignSelf: 'center', flexGrow: 1, padding: 10}} onPress={this.loadMarket}>
                                <Text style={{color: Colors.bodyBG, textAlign: 'center', alignSelf: 'center'}}>{T('common.tryagain')}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </Content>
            </Container>
        );
    }
}

const _styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        flex: 1,
        alignItems: 'center',
        alignContent: 'space-around',
        backgroundColor: Colors.bodyBG,
    },
    fill: {
        flex: 1,
        justifyContent: 'space-around',
    },
    subtext: {
        padding: 10,
        fontSize: 15,
        color: Colors.warningText,
        textAlign: 'center',
        alignContent: 'center',
    },
});

