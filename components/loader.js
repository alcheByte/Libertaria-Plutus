import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  ActivityIndicator
} from 'react-native';

const Loader = props => {
  const {
    loading,
  } = props;

    return (
        <Modal transparent={true} animationType={'none'} visible={loading} onRequestClose={() => {}}>
            <View style={styles.modalBackground}>
                <ActivityIndicator size={'large'} />
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
});

export default Loader;