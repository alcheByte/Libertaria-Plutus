import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ScrollView, View, Alert } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import { Container } from 'native-base';

import { Colors, Sizes } from '../../../config';
import { Styles } from '../../../config/styles';

import api from "../../../api/apiClient";
import { T } from '../../../localize/localizer';

import { PlutusHeader } from '../../../components/plutusheader'

export default class ICOs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            myicos: [],
        }
    }

    componentDidMount() {
        this.props.navigation.addListener('didFocus', this.onView);
    }

    onView = async () => {
        await this.reload();
    }
    
    async componentWillReceiveProps(nextProps) {
        //console.log(nextProps);
        if(this.state.isTestnet != nextProps.isTestnet)
        {
            this.setState({ isTestnet: nextProps.isTestnet });
            await this.reload();
        }
    }

    reload = async () => {
        // this.setState({});
    }

    render() {
        return (
            <Container>
                <PlutusHeader  {...this.props}/>
                <View style={localStyles.page}>
                    <View style={localStyles.fill}>
                        <Text style={localStyles.intro}>{T('icos.intro_1')}</Text>
                        <Text style={localStyles.subtext}>{T('icos.intro_2')}</Text>
                        <Text style={localStyles.small}>{T('icos.soon')}</Text>
                    </View>
                </View>
            </Container>
        );
    }
}

const localStyles = StyleSheet.create({
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

