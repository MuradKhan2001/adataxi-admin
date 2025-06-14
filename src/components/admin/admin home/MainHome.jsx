import "./adminHome.scss"
import {useEffect, useMemo, useState} from "react"
import {GoogleMap, useLoadScript, Marker, InfoWindow} from "@react-google-maps/api";
import Loader from "./loader/Loader";
import axios from "axios";

const API_KEY = "AIzaSyBEN2azIRg6YCHa-tV8yAEUJoHsn__fRBM";

const MainHome = () => {
    const [statisitc, setStatisitc] = useState([]);
    const websocket = new WebSocket(`wss://api.buyukyol.uz/ws/orders/Tashkent/uzbekistan/?token=${localStorage.getItem('token')}`);

    const [locationsList, setLocationsList] = useState([]);

    useEffect(() => {
        axios.get(`https://api.adataxi.uz/api/v1/site/statistics/`).then((response) => {
            setStatisitc(response.data[0])
        })
    }, []);

    const [selectedLocation, setSelectedLocation] = useState(null);

    const onMarkerClick = (location) => {
        setSelectedLocation(location);
    };

    const onCloseClick = () => {
        setSelectedLocation(null);
    };

    const {isLoaded} = useLoadScript({
        googleMapsApiKey: API_KEY
    });

    const center = useMemo(() => ({lat: 41, lng: 65}), []);

    const options = useMemo(() => (
        {
            disableDefaultUI: false,
            clickableIcons: false
        }), []);

    if (!isLoaded) return <Loader/>;

    const icon = {url: './images/admin/driver-icon.png', scaledSize: {width: 45, height: 45}};

    return <div className="admin-home-container">

        <div className="header-side">
            <div className="statistic-card">
                <div className="icon">
                    <img src="./images/admin/driver.png" alt=""/>
                </div>
                <div className="title">Haydovchilar soni:</div>
                <div className="count">{statisitc.drivers}</div>
            </div>
            <div className="statistic-card">
                <div className="icon">
                    <img src="./images/admin/user.png" alt=""/>
                </div>
                <div className="title">Mijozlar soni:</div>
                <div className="count">{statisitc.clients}</div>
            </div>
            <div className="statistic-card">
                <div className="icon">
                    <img src="./images/admin/handshake.png" alt=""/>
                </div>
                <div className="title">Hamkorlar soni:</div>
                <div className="count">{statisitc.avilable_drivers}</div>
            </div>
            <div className="statistic-card">
                <div className="icon">
                    <img src="./images/admin/shopping-list.png" alt=""/>
                </div>
                <div className="title">Yakunlangan soni:</div>
                <div className="count">{statisitc.rides}</div>
            </div>
        </div>

        <div className="map">
            <GoogleMap
                zoom={5}
                center={center}
                options={options}
                mapContainerClassName="map-container">

                {locationsList.length >= 0 ?

                    <>
                        {locationsList.map((item) => {
                            return <Marker
                                key={Number(item.latitude)}
                                position={{lat: Number(item.latitude), lng: Number(item.longitude)}}
                                icon={icon}
                                onClick={() => onMarkerClick(item)}
                            />
                        })}

                        {selectedLocation && (
                            <InfoWindow
                                position={{
                                    lat: Number(selectedLocation.latitude),
                                    lng: Number(selectedLocation.longitude)
                                }}
                                onCloseClick={onCloseClick}
                            >
                                <div className="info-box">
                                    <div className="info-text">
                                        <span>Moshina raqam:</span>
                                        {selectedLocation.car_number} <br/>
                                        <span>Tel raqam:</span>
                                        {selectedLocation.phone_number}
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                    </>

                    : ""
                }


            </GoogleMap>
        </div>


    </div>
};


export default MainHome