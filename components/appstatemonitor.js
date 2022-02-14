import React, { Component } from 'react'
import { AppState, Text } from 'react-native'

export class AppStateMonitor extends Component {

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if(this.props.onStateChanged) this.props.onStateChanged(nextAppState);
    }

    render() {
        // no visible component
        return ( null );
    }

}