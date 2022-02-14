import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ScrollView, View, Alert, Clipboard, Linking } from 'react-native';

import { Colors, Sizes } from '../../config';
import { Styles } from '../../config/styles';

import { T } from '../../localize/localizer';
import * as rw from '../../api/requestWrapper';

const _Link_Terms = 'https://exchange.libertaria.world/terms-and-conditions.html';
const _Link_Privacy = 'https://exchange.libertaria.world/privacy-policy.html';
const _Link_Help = 'https://discord.gg/pnUhbut';
const _Link_Discord = 'https://discord.gg/xENSXwk';

const localStyles = StyleSheet.create({
    page: {
        flex: 1,
        flexDirection: "column",
        alignItems: "flex-start",
        backgroundColor: Colors.bodyBG,
    },
    row: {
        flex: 0,
        margin: 5,
        flexDirection: "row",
        alignItems: 'center',
        alignContent: 'flex-end',
    },
    label: {
        flex: 1,
        color: Colors.bodyFG,
        fontSize: 18,
        textAlign: 'left',
        padding: 10,
    },
    link: {
        color: Colors.buttonBG,
        textAlign: 'center',
        alignContent: 'flex-end',
        margin: 5,
        padding: 5,
        fontSize: 20,
        textDecorationLine: 'underline',
    },
});

export class Support extends React.Component {
    onClickUsername = () => {
        Clipboard.setString(rw.username());
        Alert.alert(T('common.success'), T('support.username_copied'));
    }

    render() {
        return (
            <View style={localStyles.page}>
                <View style={localStyles.row}>
                    <Text style={localStyles.link} onPress={() => Linking.openURL(_Link_Discord)}>{T('support.discord')}</Text>
                </View>
                <View style={localStyles.row}>
                    <Text style={localStyles.link} onPress={() => Linking.openURL(_Link_Terms)}>{T('support.terms')}</Text>
                </View>
                <View style={localStyles.row}>
                    <Text style={localStyles.link} onPress={() => Linking.openURL(_Link_Privacy)}>{T('support.privacy')}</Text>
                </View>
                <View style={localStyles.row}>
                    <Text style={localStyles.link} onPress={() => Linking.openURL(_Link_Help)}>{T('support.help')}</Text>
                </View>
                <View style={localStyles.row}>
                    <Text style={localStyles.link} onPress={this.onClickUsername}>{T('support.username')}</Text>
                </View>
            </View>
        );
    }
}
