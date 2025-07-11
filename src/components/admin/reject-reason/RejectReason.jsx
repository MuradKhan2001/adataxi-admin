import "./style.scss"
import {useContext, useEffect, useState} from "react";
import axios from "axios";
import {MyContext} from "../../App/App";
import i18next from "i18next";

const RejectReason = () => {
    let value = useContext(MyContext);
    const [colorsList, setColorsList] = useState([])
    const [edit, setEdit] = useState(false)
    const [rejectStatus, setRejectStatus] = useState("")
    const [editId, setEditId] = useState('')
    const [translations, setTranslations] = useState(
        {
            name_uz: "",
            name_ru: "",
            name_en: ""
        })

    const getData = (status) => {
        setRejectStatus(status)
        axios.get(`${value.url}/dashboard/rejectreson/?type=${status}`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setColorsList(response.data);
        })
    }

    const addColor = (status) => {
        const {name_uz, name_ru, name_en} = translations;

        const isAnyNameFilled = name_uz.trim() && name_ru.trim() && name_en.trim();

        if (!isAnyNameFilled) {
            alert("Iltimos, rang nomini kiriting");
            return;
        }

        const translation_list = {
            uz: {
                name: name_uz.trim()
            },
            ru: {
                name: name_ru.trim()
            },
            en: {
                name: name_en.trim()
            }
        };

        if (status === "add") {
            axios.post(`${value.url}/dashboard/rejectreson/`, {type: rejectStatus, translations: translation_list},
                {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                })
                .then((response) => {
                    setTranslations({name_uz: "", name_ru: "", name_en: ""});
                    getData();
                })
                .catch((error) => {
                    console.error("Rang qo'shishda xatolik:", error);
                });
        }

        if (status === "edit") {
            axios.put(`${value.url}/dashboard/rejectreson/${editId}/`, {
                    type: rejectStatus,
                    translations: translation_list
                },
                {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                })
                .then((response) => {
                    setTranslations({name_uz: "", name_ru: "", name_en: ""});
                    getData();
                    setEdit(false);
                })
                .catch((error) => {
                    console.error("Rangni tahrirlashda xatolik:", error);
                });
        }
    };

    const delColor = (id) => {
        axios.delete(`${value.url}/dashboard/rejectreson/${id}/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setTranslations({name_uz: "", name_ru: "", name_en: ""});
            getData()
            setEdit(false)
        })
    }

    const handleEdit = (color) => {
        setEdit(true);
        setEditId(color.id);
        setTranslations({
            name_uz: color.translations["uz"].name || "",
            name_ru: color.translations["ru"].name || "",
            name_en: color.translations["en"].name || ""
        });
    };

    return <div className="reject-reason-wrapper">
        <div className="header">
            <div className="form-wrapper">
                <label htmlFor="status">Moshina brendini tanlang: </label>
                <select onChange={(e) => getData(e.target.value)} name="status"
                        id="status">
                    <option value=""></option>
                    <option value="driver">Haydovchi</option>
                    <option value="client">Mijoz</option>
                    <option value="admin">Admin</option>
                </select>

                <input
                    value={translations.name_uz}
                    onChange={(e) =>
                        setTranslations({...translations, name_uz: e.target.value})
                    }
                    placeholder="Sabab nomi (uz)..."
                    type="text"
                />
                <input
                    value={translations.name_en}
                    onChange={(e) =>
                        setTranslations({...translations, name_en: e.target.value})
                    }
                    placeholder="Reason name (en)..."
                    type="text"
                />

                <input
                    value={translations.name_ru}
                    onChange={(e) =>
                        setTranslations({...translations, name_ru: e.target.value})
                    }
                    placeholder="Название причины (ru)..."
                    type="text"
                />


                {edit ? <div onClick={() => addColor("edit")} className="add-color">
                    <img src="./images/admin/checkmark.png" alt=""/>
                </div> : <div onClick={() => addColor("add")} className="add-color">
                    <img src="./images/admin/add.png" alt=""/>
                </div>}

            </div>
        </div>
        <div className="colors-cards">
            <div className="wrapper-box">
                {
                    colorsList.map((color, index) => (
                        <div key={index} className="color-card">
                            <div className="name">{color.translations[i18next.language].name}</div>
                            <div className="bttons">
                                <div onClick={() => handleEdit(color)} className="btn">
                                    <img src="./images/admin/edit-tools.png" alt=""/>
                                </div>

                                <div onClick={() => delColor(color.id)} className="btn">
                                    <img src="./images/admin/delete.png" alt=""/>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    </div>
}

export default RejectReason;