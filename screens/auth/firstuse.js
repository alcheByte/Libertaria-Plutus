import React from 'react';
import { Actions } from 'react-native-router-flux';
import { StyleSheet, TouchableOpacity, Text, TextInput, ScrollView, View, Alert, Clipboard, Image, Modal, KeyboardAvoidingView } from 'react-native';
import { Container, Content } from 'native-base';

import { LibertariaIcon } from '../../assets/LibertariaIcon';

import { Colors, Sizes } from '../../config';
import { ConfirmStyles } from '../../config/styles';

import { T } from '../../localize/localizer';
import * as auth from '../../api/auth';

export class FirstUse extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showPKInput: false,
            pkValid: false,
            pkToImport: null,
            importStep: null,
            pkError: null,
        }
    }

    componentDidMount = async () => {
        await this.checkClipboard();
    }

    checkClipboard = async () => {
        var cb = await Clipboard.getString();
        var step = cb ? T('first_use.pk_paste') : T('first_use.pk_clipboard');
        this.setState({importStep: step});
    }

    onPaste = async () => {
        const pk = await Clipboard.getString();
        if(pk) {
            try {
                auth.validatePK(pk);
                this.setState({pkValid: true, pkToImport: pk, importStep: T('first_use.pk_go')});
            }
            catch (e) {
                console.log(e);
                this.setState({pkError: e.detail ? e.err + ', ' + e.detail : e.err});
            }
        }
    }

    onImport = async () => {
        const pk = this.state.pkToImport;
        try {
            console.log(pk);
            var success = await auth.importPK(pk);
            if(success) Actions.jump('launch');
        }
        catch(ex) {
            Alert.alert(T('common.error'), ex.toString());
        }
    }

    resetImport = () => {
        this.setState({
            showPKInput: false,
            pkValid: false,
            pkToImport: null,
            importStep: null,
            pkError: null,
        });
    }

    onCreateAccount = async () => {
        var success = await auth.createAccount();
        if(success) Actions.jump('welcome');
    }

    render() {
        return (
            <Container style={_styles.root}>
                <Content style={_styles.root}>
                    <View style={{alignItems: 'center'}}>
                        <Image source={require('../../assets/plutus-stacked.png')} style={_styles.logo} resizeMode='center' />
                    </View>
                { this.state.showPKInput ? 
                    <KeyboardAvoidingView behavior="padding"  style={_styles.import}>
                        <Text style={ConfirmStyles.message}>{T('first_use.btn_import')}</Text>
                        <Text style={{color: Colors.action, alignSelf: 'center', margin: 5}}>{this.state.importStep}</Text>
                        { this.state.pkError ? <Text style={{color: Colors.errorBG, alignSelf: 'center', marginBottom: 5}}>{this.state.pkError}</Text> : <View/>}
                        <View style={{flexGrow: 1, flexDirection: 'row',}}>
                            <TextInput value={this.state.pkToImport} style={_styles.input} underlineColorAndroid='transparent' editable={false}
                                    placeholder={T('first_use.pk_hint')} placeholderTextColor={Colors.hintText}/>
                            <TouchableOpacity onPress={this.state.pkValid ? this.onImport : this.onPaste} style={{justifyContent: 'center'}}>
                                <LibertariaIcon name={this.state.pkValid ? 'go' : 'paste'} style={{alignSelf: 'center', margin: 10}}
                                                size={Sizes.navIcon} 
                                                color={this.state.pkValid ? Colors.import : Colors.action}/>
                            </TouchableOpacity>
                        </View>
                        <Text style={_styles.link} onPress={this.resetImport}>{T('common.cancel')}</Text>
                    </KeyboardAvoidingView> :
                    <View>
                        <View style={{flexGrow: 1, justifyContent: 'center'}}>
                            <Text style={ConfirmStyles.message}>{T('first_use.welcome')}</Text>
                            <Text style={ConfirmStyles.subtext}>{T('first_use.msg_create')}</Text>
                            <Text style={ConfirmStyles.subtext}>{T('first_use.msg_import')}</Text>
                        </View>
                        <TouchableOpacity onPress={this.onCreateAccount} style={ConfirmStyles.buttonConfirm}>
                            <Text style={ConfirmStyles.buttonText}>{T('first_use.btn_create')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.setState({showPKInput: true}, this.checkClipboard)} style={ConfirmStyles.buttonConfirm}>
                            <Text style={ConfirmStyles.buttonText}>{T('first_use.btn_import')}</Text>
                        </TouchableOpacity>
                    </View>
                }
                </Content>
            </Container>
        );
    }
}

const _styles = StyleSheet.create({
    logo: {
        height: 250,
        resizeMode: 'cover',
    },
    root: {
        flexDirection: "column",
        flex: 1,
        alignContent: 'flex-start',
        backgroundColor: Colors.bodyBG,
    },
    input: {
        fontSize: 11,
        flex: 3,
        color: Colors.bodyFG,
        backgroundColor: Colors.bodyBG,
        textAlign: 'center',
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
        padding: 0,
    },
    import: {
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: Colors.headerBG,
        padding: 10,
        margin: 10,
        borderRadius: Sizes.cardCornerRadius,
    },
    link: {
        color: Colors.buttonBG,
        textAlign: 'center',
        alignContent: 'flex-end',
        margin: 5,
        padding: 5,
        fontSize: 20,
    },
});

