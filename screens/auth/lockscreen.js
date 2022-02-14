import React from 'react';
import { observer, inject } from 'mobx-react'
import { StyleSheet, TouchableOpacity, Text, TextInput, View, Image, ActivityIndicator, AsyncStorage } from 'react-native';
import {Actions} from 'react-native-router-flux';

import PinInput from '../../components/pininput';

import { Colors, Keys } from '../../config';
import { T } from '../../localize/localizer';

@inject('userStore') @observer
export class LockScreen extends React.Component {
    constructor(props) {
        super(props);
        this.pinLength = this.props.pinLength || 4;
        this.state = {
            enterMsg: null,
            errorMsg: null,
            loginError: false,
        };
    }

    componentDidMount() {
        var lockSettings = this.props.userStore.lockSettings;
        console.log(`LockScreen >> lockSettings: ${JSON.stringify(lockSettings)}`);
        switch (lockSettings.option) {
            case 'none' : Actions.jump('app'); break;
            case 'pin' : this.setState({enterMsg: T('lock_screen.pin_enter'), errorMsg: T('lock_screen.pin_error')}); break;
            case 'password': this.setState({enterMsg: T('lock_screen.pwd_enter'), errorMsg: T('lock_screen.pwd_error')}); break;
            case 'biometric': Actions.jump('app'); break;
        }
    }

    checkPinCode = (pins) => {
        let code = pins.map(c => c).join('');
        if(code === this.props.userStore.lockSettings.PIN) Actions.push('app');
        else {
            this.refs._pinInput.clear();
            this.setState({loginError: true});
        }
    }

    checkPassword = ({nativeEvent}) => {
        let pwd = nativeEvent.text;
        if(pwd === this.props.userStore.lockSettings.password) Actions.push('app');
        else {
            this.refs._pwdInput.clear();
            this.setState({loginError: true});
        }
    }

    render() {
        var lockSettings = this.props.userStore.lockSettings;
        return (
            <View style={_styles.page}>
                <Image source={require('../../assets/plutus-stacked.png')} resizeMode='contain' 
                    style={{height: 200, width: 200, alignSelf: 'center', margin: 10}}/>

            { lockSettings.option === 'none' && 
                <ActivityIndicator/>
            }
                <Text style={_styles.prompt}>{this.state.enterMsg}</Text>

            { this.state.loginError && 
                <Text style={_styles.error}>{this.state.errorMsg}</Text> }
                
            { lockSettings.option === 'pin' &&
                <PinInput ref={"_pinInput"} empty=' ' mask='*' caret='|' onPinsCompleted={this.checkPinCode}/>
            }
            {  lockSettings.option === 'password' &&
                <TextInput ref={"_pwdInput"} secureTextEntry={true} keyboardAppearance='dark' textContentType='password' autoFocus={true} clearTextOnFocus={this.state.loginError}
                                style={{alignSelf: 'stretch', textAlign: 'center', color: Colors.headerFG, height: 35, backgroundColor: Colors.headerBG, margin: 10}}
                                onSubmitEditing={this.checkPassword} />
            }
                {/* <View style={_styles.fill}>
                    <Text>TODO Login using Fingerprint/Touch</Text>
                </View> */}
            </View>
        );
    }
}

const _styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        flex: 1,
        alignItems: 'center',
        alignContent: 'center',
        backgroundColor: Colors.bodyBG,
        paddingTop: 30,
    },
    fill: {
        flex: 1,
        justifyContent: 'center',
    },
    prompt: {
        flex: 0,
        margin: 10,
        fontSize: 21,
        color: Colors.action,
        textAlign: 'center',
        alignContent: 'center',
    },
    error: {
        flex: 0,
        margin: 10,
        fontSize: 16,
        color: Colors.errorBG,
        textAlign: 'center',
        alignContent: 'center',
    },
});
