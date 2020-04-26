import React, { Component } from 'react';
 
import { StyleSheet, Image, View, Text, TouchableOpacity } from 'react-native';

export default class ExpandableView extends Component {
 
  constructor() {
 
    super();
 
    this.state = {
 
      updated_Height: 0
 
    }
  }
 
  componentWillReceiveProps(update_Props) {
      
    if (update_Props.item.expanded) {
      this.setState(() => {
        return {
          updated_Height: null
        }
      });
    }
    else {
      this.setState(() => {
        return {
          updated_Height: 0
        }
      });
    }
  }
 
  shouldComponentUpdate(update_Props, nextState) {
 
    if (update_Props.item.expanded !== this.props.item.expanded) {
      return true;
    }
    return false;
 
  }
 
  render() {
    const {item} = this.props;

    return (
      <View style={styles.panelHolder}>
        <TouchableOpacity activeOpacity={0.7} onPress={this.props.onClickFunction} style={styles.btn}>
          <Text style={styles.panelButtonText}>{item.dt_txt}</Text>
        </TouchableOpacity>
        <View style={{ height: this.state.updated_Height, overflow: 'hidden' }}>
          <Text style={styles.panelText}>
              {`${item.weather[0].main}-(${item.weather[0].description})`}
          </Text>
          <Image style={{width:100, height:100, alignItems:'center'}} source={{uri:"https://openweathermap.org/img/w/" + item.weather[0].icon + ".png"}} />
        </View>
      </View>
 
    );
  }
}

const styles = StyleSheet.create({  
    panelText: {
      fontSize: 18,
      color: '#000',
      padding: 10
    },
   
    panelButtonText: {
      textAlign: 'center',
      color: '#84FFFF',
      fontSize: 21
    },
   
    panelHolder: {
      borderWidth: 1,
      borderColor: '#E8EAF6',
      marginVertical: 5
    },
   
    btn: {
      padding: 10,
      backgroundColor: '#1A237E'
    }
   
  });