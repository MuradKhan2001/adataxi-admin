import {useState, useEffect, useContext} from "react";
import {useNavigate, Route, Routes, NavLink} from "react-router-dom";
import "./admin.scss"
import {adminPageRoutes} from "../../../rootes";
import {MyContext} from "../../App/App";
import i18next from "i18next";
import Dropdown from "react-bootstrap/Dropdown";
import {useTranslation} from "react-i18next";


const Admin = () => {
    const {t} = useTranslation();
    let value = useContext(MyContext);
    const navigate = useNavigate();
    const [adminMenu, setAdminMenu] = useState(false)

    const menues = [
        {
            name: "Dashboard",
            url: "/dashboard",
            img: "../images/admin/dashboard.png"
        },
        {
            name: "Haydovchilar",
            url: "/drivers",
            img: "../images/admin/driver.png"
        },
        {
            name: "Mijozlar",
            url: "/clients",
            img: "../images/admin/user.png"
        },
        {
            name: "Buyurtmalar",
            url: "/orders",
            img: "../images/admin/shopping-list.png"
        },
        {
            name: "Moshina brendi",
            url: "/car-brands",
            img: "../images/admin/car.png"
        },
        {
            name: "Moshina modeli",
            url: "/car-models",
            img: "../images/admin/car.png"
        },
        {
            name: "Ranglar",
            url: "/colors",
            img: "../images/admin/palette.png"
        },
        {
            name: "Narxlar",
            url: "/price",
            img: "../images/admin/price-list.png"
        },
        {
            name: "Qo'shimcha xizmatlar",
            url: "/extra-services",
            img: "../images/admin/technical-service.png"
        },
        {
            name: "Bekor qilish sababi",
            url: "/reject-reason",
            img: "../images/admin/rejected.png"
        },

        // {
        //     name: "Tariflar",
        //     url: "/service",
        //     img: "../images/admin/list.png"
        // },

        {
            name: "Balans",
            url: "/balance",
            img: "../images/admin/wallet.png"
        },
        {
            name: "To'lov tizimi",
            url: "/payment",
            img: "../images/admin/credit-card.png"
        },
    ];

    useEffect(() => {
        // axios.get(`${value.url}dashboard/home/`, {
        //     headers: {
        //         "Authorization": `Token ${localStorage.getItem("token")}`
        //     }
        // }).then((response) => {
        //     setStatisticsCount(response.data)
        //     setCountPrice(response.data.balance)
        // }).catch((error) => {
        //     if (error.response.statusText == "Unauthorized") {
        //         window.location.pathname = "/";
        //         localStorage.removeItem("token");
        //     }
        // });
    }, []);

    const language = [
        {
            code: "uz",
            name: "O'zbek tili",
            country_code: "uz",
        },
        {
            code: "en",
            name: "English language",
            country_code: "en",
        },
        {
            code: "ru",
            name: "Pусский язык",
            country_code: "ru",
        },
    ];
    const changeLanguage = (code) => {
        localStorage.setItem("lng", code);
        i18next.changeLanguage(code);
    };

    const logOut = () => {
        const isConfirmed = window.confirm("Rostdan ham profildan chiqmoqchimisz?");
        if (isConfirmed) {
            window.location.pathname = "/";
            localStorage.removeItem("admin")
            localStorage.removeItem("token")
        }
    }

    return <div className="admin-home">
        <div className={`left-box ${adminMenu ? "" : "hide-left"}`}>

            <div className={`logo ${adminMenu ? "" : "hide-logo"}`}>
                <img onClick={() => navigate('/')} src="../images/logo2.png" alt=""/>
            </div>

            <div className="admin-navbar">
                {
                    menues.map((item, index) => {
                        return <NavLink to={item.url} key={index}
                                        className={`nav-item ${({isActive}) => isActive ? "active" : ""}`}>
                            <img src={item.img} alt=""/>
                            {adminMenu ? <span>{item.name}</span> : ""}
                        </NavLink>
                    })
                }
            </div>

            <div onClick={() => setAdminMenu(!adminMenu)} className={`circle ${adminMenu ? "" : "circle-rotate"}`}>
                <img src="../images/admin/previous.png" alt=""/>
            </div>

        </div>

        <div className={`right-box ${adminMenu ? "" : "show-right"}`}>
            <div className="top-box">
                <div className="languge">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            <img className="globe" src="./images/globe-alt.webp" alt="language" loading="lazy"/>
                            <div className="name">
                                {language.map((item, index) => {
                                    return (
                                        <div key={index}>
                                            {i18next.language === item.code ? item.name : ""}
                                        </div>
                                    );
                                })}
                            </div>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>

                            {language.map(({code, name, country_code}) => (
                                <Dropdown.Item key={country_code}
                                               onClick={() => changeLanguage(code)}>{name}</Dropdown.Item>
                            ))}

                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className="title">
                    <img src="./images/logo.png" alt=""/>
                </div>
                <div className="icons">
                    <div onClick={() => logOut()} className="exit"><img src="./images/admin/logout.png" alt=""/></div>
                </div>
            </div>

            <div className="bottom-box">
                <Routes>
                    {
                        adminPageRoutes.map((route, index) => (
                            <Route key={index} {...route} />
                        ))
                    }
                </Routes>
            </div>
        </div>
    </div>
};

export default Admin