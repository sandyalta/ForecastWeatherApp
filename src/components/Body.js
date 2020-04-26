import React, {Component} from "react";
import {
    Dimensions,
    LayoutAnimation,
    Platform,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from "react-native";
import AsyncStorage from '@react-native-community/async-storage';
import Carousel from 'react-native-snap-carousel';
import ExpandableView from './ExpandableView';
import ForecastCard from './ForecastCard';
import Geolocation from '@react-native-community/geolocation';
import Modal from 'react-native-modal';
import {Icon} from 'react-native-elements';
import { TextInput } from 'react-native-paper';

const apiKey = '7bab777ba66de76a25273ccb0059724f'
export default class Body extends Component{

    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental(true);
          }

        this.state = {
            activeSections: [],
            cities:['Kuala Lumpur','George Town','Johor Bahru'],
            error:'',
            forecast: [],
            isDialogShow: false,
            latitude: null,
            longitude: null,
            text: null,
            weather: [],
         };
       }
       
    async componentDidMount(){
        const {cities} = this.state;

        let cityName = await AsyncStorage.getItem('cityName');
        if(!!cityName)
        {
            cities.push(cityName);  
            this.setState({
                cities,
            });
        }
        this.fetchCities();
    }

    callLocation(){
        Geolocation.getCurrentPosition(
             (position) => {
                const currentLongitude = JSON.stringify(position.coords.longitude);
                const currentLatitude = JSON.stringify(position.coords.latitude);
                this.setState({ longitude:currentLongitude, latitude: currentLatitude }, () => { 
                    this.fetchCities(); 
                });
             },
             (error) => alert(error.message),
             { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          );
    }

    async fetchCities(){
        let {cities, forecast, longitude, latitude, text} = this.state;

        if(!!text)
        {
            let {forecast} = this.state;
            const isSameCity = forecast.find(i => {
               return i.name === text
            });

            if(!!isSameCity)
            {
                return null;
            }
            else{
                let url = `https://api.openweathermap.org/data/2.5/weather?q=${text}&appid=${apiKey}`;

                const response = await fetch(url);
                const data = await response.json();
                forecast.push(data);
                cities.push(text);
                try {
                    await AsyncStorage.setItem('cityName', text);
                } catch (error) {
                    alert(error)
                }
                this.setState({forecast, cities});
            }
        }
        else if (forecast.length === 0)
        {
            await Promise.all(cities.map(async o => {

            let {forecast} = this.state;
            let url = `https://api.openweathermap.org/data/2.5/weather?q=${o}&appid=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            forecast.push(data);
            this.setState({forecast});
            }))
        }
        else if (!!longitude && !!latitude)
        {
            let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            forecast.push(data);
            cities.push(text);
            this.setState({forecast, cities});
        }
       
    }

    fetchWeather(cityName){    
        let url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`;
        fetch(url)
        .then(response => response.json())
        .then(data => {
            !!data && data.list.length > 0 && data.list.map(o => {
                o.expanded = false;
            })
            this.setState({weather: data, isDialogShow: !this.state.isDialogShow});
        })
    }

    onToggleModal = () => {
        this.setState({isDialogShow: false});
      };

    update_Layout = (index) => {
        const {weather} = this.state;

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const array = !!weather && weather.list.length > 0 && weather.list.map((item) => {
            const newItem = Object.assign({}, item);
            newItem.expanded = false;

            return newItem;
        });

        array[index].expanded = true;

        this.setState(() => {
            let weatherTemp = {...weather};
            weatherTemp.list = array;

            return {
            weather: weatherTemp
            }
        });
    }

    renderWeatherItem(){
        const {weather} = this.state;
        return (
            <View style={styles.weatherContainer}>
                {
                  weather.list.map((item, key) =>
                    (
                      <ExpandableView key={key} onClickFunction={this.update_Layout.bind(this, key)} item={item} />
                    ))
                }
            </View>
          );
    }

    render(){
        const {forecast, weather} = this.state;
        return (
            <SafeAreaView style={styles.container}>
                    <View style={{flexDirection: 'row', justifyContent:'center'}}>
                        <View style={{flexBasis: '70%'}}>
                            <TextInput
                                label='Enter City'
                                value={this.state.text}
                                onChangeText={text => this.setState({text})}
                            />
                        </View>
                        <View style={{flexBasis: '30%', alignItems: 'center', backgroundColor: '#512DA8'}}>
                            <TouchableOpacity activeOpacity={0.7}  onPress={()=>{this.fetchCities()}} style={styles.btn}>
                                <Text style={{textAlign: 'center', color: 'white', fontSize:20}}>ADD</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {!!forecast && forecast.length > 0 && (
                        <Carousel
                            data={forecast} 
                            renderItem={({item}) =>
                                <TouchableOpacity onPress={()=>this.fetchWeather(item.name)}>
                                    <ForecastCard detail={item} location={item.name}
                                    />
                                </TouchableOpacity>
                            }
                            sliderWidth={Dimensions.get('screen').width}
                            itemWidth={Dimensions.get('screen').width - 50}
                        />
                    )
                    }
                    <Modal
                        isVisible={this.state.isDialogShow}
                        onBackdropPress={this.onToggleModal}
                        onBackButtonPress={this.onToggleModal}
                        backdropOpacity={0.3}>
                        <ScrollView>
                            <View style={styles.modalStyle}>
                                <Icon
                                reverse
                                name='ios-rainy'
                                type='ionicon'
                                color='#517fa4'
                                />
                                <Text style={{fontSize: 24, color:'#517fa4'}}>5 Days Weather Information</Text>
                                {!!weather &&  !!weather.list && weather.list.length > 0 && this.renderWeatherItem()}
                            </View>
                        </ScrollView>
                    </Modal>
                    <View style={{flex : 1, bottom: 0, justifyContent: 'flex-end'}}>
                        <TouchableOpacity activeOpacity={0.7} onPress={()=>this.callLocation()} style={styles.btnCurrent}>
                            <Text style={styles.btnCurrentText}>Current Location</Text>
                        </TouchableOpacity>
                    </View>
            </SafeAreaView>
        )
    }
  }

const styles = StyleSheet.create({
    container:{
        flex:1,
    },
    btn: {
        padding: 20,
        backgroundColor: '#512DA8'
    },
    modalStyle: {
        backgroundColor: '#E0F7FA',
        alignItems: 'center',
        justifyContent: 'center',
        },
    weatherContainer: {
        justifyContent: 'center',
        paddingTop: (Platform.OS === 'ios') ? 20 : 0
    },
    btnCurrent: {
        padding: 10,
        backgroundColor: '#512DA8'
    },
    btnCurrentText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 21
    },
});