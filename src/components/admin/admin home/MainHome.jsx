import "./adminHome.scss"
import {useEffect, useMemo, useState} from "react"
import {GoogleMap, useLoadScript, MarkerF, InfoWindow} from "@react-google-maps/api";
import Loader from "./loader/Loader";
import axios from "axios";
import {w3cwebsocket as W3CWebSocket} from "websocket";

const API_KEY = "AIzaSyBEN2azIRg6YCHa-tV8yAEUJoHsn__fRBM";

const MainHome = () => {
    const [statisitc, setStatisitc] = useState([]);
    const [sockedContext, setSockedContext] = useState(null);
    const [locationsList, setLocationsList] = useState([]);
    const [center, setCenter] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem("token")) return;

        const websocket = new W3CWebSocket(`wss://api.adataxi.uz/ws/driver/?token=${localStorage.getItem("token")}`);
        setSockedContext(websocket);
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const {latitude, longitude} = position.coords;
            let locMy = {lat: latitude, lng: longitude};
            setCenter(locMy);
        });

        axios.get(`https://api.adataxi.uz/api/v1/site/statistics/`).then((response) => {
            setStatisitc(response.data[0])
        })
    }, []);

    useEffect(() => {
        if (!sockedContext) return;
        sockedContext.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.message?.code === -35) {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                window.location.pathname = "/";
                return;
            }

            if (data.action === "driver_location") {
                setLocationsList(data.message)
            }
        };
    }, [sockedContext]);

    const {isLoaded} = useLoadScript({
        googleMapsApiKey: API_KEY
    });

    const options = useMemo(() => (
        {
            disableDefaultUI: false,
            clickableIcons: false
        }), []);

    const [selectedLocation, setSelectedLocation] = useState(null);

    const onMarkerClick = (location) => {
        setSelectedLocation(location);
    };

    const onCloseClick = () => {
        setSelectedLocation(null);
    };

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
                <div className="title">To'liq ro'yxatdan o'tgan haydovchilar:</div>
                <div className="count">{statisitc.avilable_drivers}</div>
            </div>
            <div className="statistic-card">
                <div className="icon">
                    <img src="./images/admin/shopping-list.png" alt=""/>
                </div>
                <div className="title">Yakunlangan buyurtmalar soni:</div>
                <div className="count">{statisitc.rides}</div>
            </div>
        </div>

        <div className="map">
            <GoogleMap
                zoom={5}
                center={center}
                options={options}
                mapContainerClassName="map-container">

                {locationsList.map((item, index) => (
                    item.latitude && item.longitude &&
                    <MarkerF
                        key={index}
                        position={{lat: item.latitude, lng: item.longitude}}
                        icon={icon}
                        onClick={() => onMarkerClick(item)}
                    />
                ))}

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


            </GoogleMap>
        </div>
    </div>
};


export default MainHome