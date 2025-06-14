import "./style.scss"
import {useContext, useEffect, useRef, useState} from "react";
import axios from "axios";
import {MyContext} from "../../App/App";

const ChatDriver = () => {
    let value = useContext(MyContext);
    const bodyRef = useRef(null);
    const [chats, setChats] = useState([]);
    const [message, setMessage] = useState();
    const [activeCHat, setActiveChat] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [getSearchText, setGetSearchText] = useState("");
    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
        axios.get(`${value.url}/dashboard/admin-chat/`, {
            headers: {
                Authorization: `Token ${localStorage.getItem("token")}`,
            },
        }).then((response) => {
            setChats(response.data);
        })
    });

    const getMessage = (chat) => {
        setActiveChat(chat)
        axios.get(`${value.url}/dashboard/admin-chat/${chat.id}/`, {
            headers: {
                Authorization: `Token ${localStorage.getItem("token")}`,
            },
        }).then((response) => {
            setMessage(response.data);
        })
    }

    const sendMessage = () => {
        let data = {room: activeCHat.id, message: messageText}
        axios.post(`${value.url}/dashboard/admin-message/`, data, {
            headers: {
                Authorization: `Token ${localStorage.getItem("token")}`,
            },
        }).then((response) => {
            setMessageText("")
            axios.get(`${value.url}/dashboard/admin-chat/${activeCHat.id}/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
            }).then((response) => {
                setMessage(response.data);
            })
        })
    }

    const delChat = (id) => {
        axios.delete(`${value.url}/dashboard/admin-chat/${id}/`, {
            headers: {
                Authorization: `Token ${localStorage.getItem("token")}`,
            },
        }).then((response) => {
            setActiveChat(null);
            axios.get(`${value.url}/dashboard/admin-chat/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
            }).then((response) => {
                setChats(response.data);
            })
        })
    }

    const verify = (id) => {
        axios.post(`${value.url}/dashboard/admin-chat/close/`,
            {chat_id: id}, {
                headers: {
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
            }).then((response) => {
            axios.get(`${value.url}/dashboard/admin-chat/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
            }).then((response) => {
                setChats(response.data);
            })
        })
    }

    return <div className="chat-driver">
        <div className="left">
            <div className="header">
                <div className="search-box">
                    <img src="./images/admin/search.png" alt=""/>
                    <input value={getSearchText} onChange={(e) => setGetSearchText(e.target.value)}
                           placeholder="Telefon raqam kiriting" type="text"/>
                </div>
            </div>
            <div className="drivers-box">
                {chats
                    .filter((item) => {
                        const searchText = getSearchText.toString().toLowerCase().replace(/\s+/g, '').replace(/\+/g, '');
                        const phoneNumber = item.user_phone.toString().toLowerCase().replace(/\s+/g, '').replace(/\+/g, '');
                        return searchText === "" || phoneNumber.includes(searchText);
                    }).map((chat, index) => {
                        return <div key={index}
                                    className={`driver ${activeCHat && activeCHat.id === chat.id ? "active" : ""}`}>
                            <div className="photo">
                                <img src="./images/admin/user2.png" alt=""/>
                            </div>
                            <div onClick={() => getMessage(chat)} className="left-content">
                                <div className="name">{chat.title}</div>
                                <div className="number">{chat.user_phone}</div>
                            </div>
                            <div className="buttons">

                                <img onClick={() => verify(chat.id)} className={chat.closed ? "closed" : "disabled"}
                                     src="./images/admin/check.png"
                                     alt="check"/>

                                <img onClick={() => delChat(chat.id)} src="./images/admin/delete.png" alt="delete"/>
                            </div>
                        </div>
                    })}
            </div>
        </div>

        {activeCHat && <div className="right">
            <div className="top">
                <div className="photo">
                    <img src="./images/admin/user2.png" alt=""/>
                </div>
                <div className="left-content">
                    <div className="name">{activeCHat && activeCHat.title}</div>
                    <div className="number">{activeCHat && activeCHat.user_phone}</div>
                </div>
            </div>
            <div ref={bodyRef} className="body">
                <div className="scroll">
                    {message && message.map((message, index) => (
                        <div key={index}
                             className={message.author && message.author.is_admin ? "message-my" : "message-driver"}>
                            <div className="message">
                                {message.author && <div className="name">
                                    {message.author.first_name} &ensp;
                                    {message.author.last_name}
                                </div>}
                                {message.message}
                                <div className="time">
                                    {message.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bottom">
                <input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Xabar..."
                       type="text"/>
                <div onClick={sendMessage} className="icon-send">
                    <img src="./images/admin/message.png" alt=""/>
                </div>
            </div>
        </div>}

    </div>
}

export default ChatDriver;