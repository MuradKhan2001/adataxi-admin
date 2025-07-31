import {useContext, useEffect, useState} from "react";
import "./style.scss";
import axios from "axios";
import {MyContext} from "../App/App";
import {useNavigate} from "react-router-dom";
import {useOnKeyPress} from "./useOnKeyPress";

const LoginAdmin = () => {
    let value = useContext(MyContext);
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const HandleLogin = () => {
        if (phone.trim().length > 0 && password.trim().length > 0) {
            let user = {
                username: phone,
                password
            };
            axios.post(`${value.url}/dashboard/login/`, user).then((response) => {
                localStorage.setItem("admin", response.data.user)
                localStorage.setItem("token", response.data.token);
                window.location.pathname = '/dashboard';
                localStorage.setItem("lng", "uz")
            }).catch((error) => {
                if (error.response?.status === 404) alert("Bu foydalanuvchi topilmadi");
            });

        } else alert("Formani to'ldiring")

    };

    const Clear = () => {
        setPhone("");
        setPassword("");
    };

    useOnKeyPress(HandleLogin, 'Enter');
    useOnKeyPress(Clear, 'Delete');

    useEffect(() => {
        if (localStorage.getItem("admin") && localStorage.getItem("token")) {
            navigate('/dashboard');
        }
    })

    return <div className="login-container">
        <div className="login-card">
            <div className="logo">
                <img src="./images/logo.png" alt=""/>
            </div>
            <div className="input_box">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Username" type="text"/>
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                       type="password"/>
            </div>

            <div onClick={HandleLogin} onKeyUp={() => console.log("enter")} className="btn-login">
                Kirish
            </div>
        </div>
    </div>
};

export default LoginAdmin;