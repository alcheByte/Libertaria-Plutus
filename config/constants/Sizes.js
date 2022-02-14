import { Platform, StatusBar, StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';

export function isiPhoneX() {
    const dimen = Dimensions.get('window');
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        (dimen.height === 812 || dimen.width === 812)
    );
}

export function ifiPhoneX(iphoneXStyle, regularStyle) {
    if (isiPhoneX()) {
        return iphoneXStyle;
    }
    return regularStyle;
}

export function getStatusBarHeight(safe) {
    return Platform.select({
        ios: ifiPhoneX(safe ? 44 : 30, 20),
        android: StatusBar.currentHeight
    });
}

export const Sizes = {
    navIcon: 24,
    navTabWidth: 100,
    navBarHeight: 60,
    cardCornerRadius: 5,
    statusbarHeight: getStatusBarHeight(false)
}