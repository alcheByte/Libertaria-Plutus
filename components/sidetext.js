import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Colors } from '../config';

export class SideText extends Component {
    constructor(props) {
        super(props);
    }

    render() {
      	let txtStyle = {
			color: this.props.isBuy !== null ? ( this.props.isBuy ? Colors.buy : Colors.sell) : Colors.headerFG,
			textAlign: this.props.textAlign !== undefined ? this.props.textAlign : 'justify',
			fontSize: this.props.fontSize !== undefined ? this.props.fontSize : 13,
		}
        return ( <Text style={txtStyle}>{this.props.text}</Text> );
    }
}
