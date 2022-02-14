import { StyleSheet, Platform, StatusBar } from 'react-native';
import { Colors } from '../config';
import { Sizes } from './constants/Sizes';

export const Styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        backgroundColor: Colors.bodyBG,
    },
    text: {
        color: Colors.bodyFG,
        fontSize: 16,
    },
    title: {
        flexDirection: 'column',
        color: Colors.headerFG,
        textAlign: 'center',
        alignContent: 'center',
        fontSize: 20,
    },
});

export const ConfirmStyles = StyleSheet.create({
    modal: {
        flex: 1,
        flexDirection: "column",
        padding: 16,
        borderRadius: Sizes.cardCornerRadius,
        margin: 8,
        backgroundColor: Colors.headerBG,
    },
    message: {
        flex: 0,
        flexDirection: 'column',
        color: Colors.headerFG,
        textAlign: 'center',
        alignContent: 'center',
        margin: 10,
        fontSize: 20,
    },
    subtext: {
        flex: 0,
        flexDirection: 'column',
        color: Colors.headerFG,
        textAlign: 'center',
        alignContent: 'center',
        margin: 5,
        marginLeft: 30,
        marginRight: 30,
        fontSize: 14,
    },
    buttonConfirm: {
        flex: 1,
        backgroundColor: Colors.buttonBG,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        height: 60,
        margin: 10,
        borderRadius: 3,
    },
    buttonCancel: {
        flex: 1,
        backgroundColor: Colors.errorBG,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        height: 60,
        margin: 10,
        borderRadius: 3,
    },
    buttonText: { 
        color: Colors.buttonFG,
        textAlign: 'center',
        fontSize: 18,
    },
});
