import React from 'react';
import { Actions } from 'react-native-router-flux';
import { StyleSheet, TouchableOpacity, Text, ScrollView, View, Clipboard } from 'react-native';

import { Colors, Sizes } from '../../config';
import { ConfirmStyles } from '../../config/styles';

import api from "../../api/apiClient";
import * as auth from '../../api/auth';
import { T } from '../../localize/localizer';

export class Welcome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    async componentDidMount() {
        var key = await auth.exportPK();
        Clipboard.setString(key);
    }

    onBackupComplete = () => {
        Clipboard.setString(null);
        Actions.jump('launch');
    }

    render() {
        return (
            <View style={{flex: 1, flexDirection: 'column', backgroundColor: Colors.bodyBG}}>
                <View style={{flexGrow: 1, justifyContent: 'center'}}>
                    <Text style={ConfirmStyles.message}>{T('app.create_account_alert')}</Text>
                    <Text style={ConfirmStyles.subtext}>{T('app.create_account_message')}</Text>
                </View>
                <View style={{flex: 0, height: 100, margin: 8, padding: 10}}>
                    <TouchableOpacity onPress={this.onBackupComplete} style={ConfirmStyles.buttonConfirm}>
                        <Text style={ConfirmStyles.buttonText}>{T('common.ok')}</Text>
                    </TouchableOpacity>
                </View>
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
    },
    fill: {
        flex: 1,
        justifyContent: 'center',
    },
    intro: {
        flex: 0,
        fontSize: 24,
        color: Colors.plutus,
        textAlign: 'center',
        alignContent: 'center',
        margin: 4,
    },
    subtext: {
        flex: 0,
        fontSize: 16,
        color: Colors.headerFG,
        textAlign: 'center',
        alignContent: 'center',
    },
    small: {
        flex: 0,
        fontSize: 10,
        color: Colors.headerFG,
        textAlign: 'center',
        alignContent: 'center',
        margin: 4,
    }
});

