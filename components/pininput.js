/**
 * @flow
 * */
import React, {Component} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import Immutable from 'immutable';
import { Colors } from '../config';
import { T } from '../localize/localizer';

export default class PinInput extends Component {
    constructor(props) {
        super(props);
        this.pinLength = this.props.pinLength || 4;
        this.state = {
            curPin: 0,
            pins: Array(this.pinLength).fill(null)
        };
    }

    setPins = (pins) =>  {
        pins = pins || Array(this.pinLength).fill(null);
        if (pins.length !== this.pinLength) {
            throw new Error(`pin length is not equal ${this.pinLength}`)
        }
        this.setState({pins: pins});
    }

    getPins = () => {
        return this.state.pins;
    }

    clear = () => {
        let pins = Array(this.pinLength).fill(null);
        this.setState({pins: pins, curPin: 0});
    }

    isCompleted() {
        return this.state.pins.filter(e => !e).length === 0;
    }

    onNumPad = (i) => {
        // console.log(`onNumPad(${i}), curPin: ${this.state.curPin}, pins: ${this.state.pins}`);
        let curPin = this.state.curPin;
        let pins = Immutable.List(this.state.pins).set(curPin, i).toArray();
        let complete = pins.filter(e => !e).length === 0;
        curPin++;
        // console.log(`updated- pins: ${pins}, curPin: ${curPin}, complete: ${complete}`);
        this.setState({pins: pins, curPin: curPin}, () => { if (complete && this.props.onPinsCompleted) this.props.onPinsCompleted(pins) });
    }

    onBack = () => {
        let curPin = this.state.curPin;
        let pins = Immutable.List(this.state.pins).set(curPin, null).toArray();
        if(curPin > 0) {
            curPin--;
            this.setState({pins: pins, curPin: curPin});
        }
    }

    onCancel = () => {
        if(this.props.onCancel)
            this.props.onCancel();
    }

    render() {
        let numPad = [1,2,3,4,5,6,7,8,9,-2,0,-1];
        let pins = this.state.pins;
        return (
            <View style={StyleSheet.flatten([_styles.container, this.props.style])}>
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                { pins.map( (p, i) => {
                    if(i == this.state.curPin)
                        return (<Text key={i} style={_styles.maskItem}>{this.props.caret}</Text>);
                    if(p === null)
                        return (<Text key={i} style={_styles.maskItem}>{this.props.empty}</Text>)
                    return (<Text key={i} style={_styles.maskItem}>{this.props.mask}</Text>)
                } ) }
                </View>
                <View style={{width: 300, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around'}}>
                { numPad.map((i) => {
                    switch(i) {
                        case -2: return (
                                <TouchableOpacity key={i} onPress={this.onCancel} style={{justifyContent: 'center', margin: 7, width: 80, height: 80}}>
                                    <Text style={_styles.textItem}>{T('common.cancel')}</Text>
                                </TouchableOpacity>
                            )
                        case -1: return (
                            <TouchableOpacity key={i} onPress={this.onBack} style={{justifyContent: 'center', margin: 7, width: 80, height: 80}}>
                                    <Text style={_styles.textItem}>{T('common.back')}</Text>
                                </TouchableOpacity>
                            )
                        default: return (
                                <TouchableOpacity key={i} onPress={() => this.onNumPad(i)} style={_styles.padItem}>
                                    <Text style={_styles.pinItem}>{i}</Text>
                                </TouchableOpacity>
                            )
                    }
                } ) }
                </View>
            </View>
        )
    }
}

const _styles = StyleSheet.create({
    container: {flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center'},
    padItem: {
        justifyContent: 'center',
        margin: 5,
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 1,
        borderColor: Colors.headerFG
    },
    pinItem: {
        textAlign: 'center',
        color: Colors.bodyFG,
        fontSize: 30,
    },
    maskItem: {
        height: 40,
        margin: 10, 
        color: Colors.selected,
        fontSize: 30,
        textAlign: 'center',
    },
    textItem: {
        textAlign: 'center',
        color: Colors.bodyFG,
        fontSize: 13,
    },
});