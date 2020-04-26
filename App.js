import React, {Component} from "react";
import { StyleSheet, Text, View } from "react-native";
import Header from "./src/components/Header";
import Body from "./src/components/Body";

export default class App extends Component{
  render(){
    return (
      <View style={styles.container}>
        <Header/>
        <Body/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
