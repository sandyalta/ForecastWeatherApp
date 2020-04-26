import React from "react";
import {
    Appbar
} from 'react-native-paper';

const Header = () => {
    return (
        <Appbar.Header>
            <Appbar.Content
            title="Weather App"
            subtitle="By Sandy Tadete"
            />
        </Appbar.Header>
    )
}

export default Header;