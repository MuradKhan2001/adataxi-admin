import "./style.scss"
import {useContext, useEffect, useState} from "react";
import axios from "axios";
import {MyContext} from "../../App/App";
import i18next from "i18next";
import {useTranslation} from "react-i18next";

const ExtraServices = () => {
    const {t} = useTranslation();
    let value = useContext(MyContext);
    const [colorsList, setColorsList] = useState([])
    const [edit, setEdit] = useState(false)
    const [editId, setEditId] = useState('')
    const [isMain, setIsMain] = useState(false);
    const [price, setPrice] = useState("");
    const [translations, setTranslations] = useState(
        {
            name_uz: "",
            name_ru: "",
            name_en: ""
        })

    const getData = () => {
        axios.get(`${value.url}/dashboard/extraservices/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setColorsList(response.data);
        })
    }

    useEffect(() => {
        getData()
    }, []);

    const addColor = (status) => {
        const {name_uz, name_ru, name_en} = translations;

        const isAnyNameFilled = name_uz.trim() && name_ru.trim() && name_en.trim();

        if (!isAnyNameFilled) {
            alert("Iltimos, formani toldiring");
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
            axios.post(`${value.url}/dashboard/extraservices/`, {
                    is_main: isMain,
                    price,
                    translations: translation_list
                },
                {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                })
                .then((response) => {
                    setTranslations({name_uz: "", name_ru: "", name_en: ""});
                    setIsMain(false);
                    setPrice("")
                    getData();
                })
                .catch((error) => {
                    console.error("Xizmat qo'shishda xatolik:", error);
                });
        }

        if (status === "edit") {
            axios.put(`${value.url}/dashboard/extraservices/${editId}/`, {
                    is_main: isMain,
                    price,
                    translations: translation_list
                },
                {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                })
                .then((response) => {
                    setTranslations({name_uz: "", name_ru: "", name_en: ""});
                    getData();
                    setEdit(false);
                    setIsMain(false);
                    setPrice("")
                })
                .catch((error) => {
                    console.error("Rangni tahrirlashda xatolik:", error);
                });
        }
    };

    const delColor = (id) => {
        axios.delete(`${value.url}/dashboard/extraservices/${id}/`, {
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
        setIsMain(color.is_main)
        setPrice(color.price)
    };

    const handleCheckboxChange = () => {
        setIsMain(!isMain);
    };

    return <div className="extra-services-wrapper">
        <div className="header">
            <div className="form-wrapper">

                <label htmlFor="ismain" className="ismain">
                    <div className="name">
                        Asosiymi?
                    </div>

                    <input
                        type="checkbox"
                        checked={isMain}
                        id="ismain"
                        onChange={handleCheckboxChange}
                    />
                </label>

                <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Narx"
                    type="number"
                />


                <input
                    value={translations.name_uz}
                    onChange={(e) =>
                        setTranslations({...translations, name_uz: e.target.value})
                    }
                    placeholder="Xizmat nomi (uz)..."
                    type="text"
                />
                <input
                    value={translations.name_en}
                    onChange={(e) =>
                        setTranslations({...translations, name_en: e.target.value})
                    }
                    placeholder="Price name (en)..."
                    type="text"
                />

                <input
                    value={translations.name_ru}
                    onChange={(e) =>
                        setTranslations({...translations, name_ru: e.target.value})
                    }
                    placeholder="Название услуги (ru)..."
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
                    colorsList.map((service, index) => (
                        <div key={index} className={`color-card ${service.is_main && "ismain"}`}>
                            <div className="name">{service.translations[i18next.language].name}: {service.price} so'm
                            </div>
                            <div className="bttons">
                                <div onClick={() => handleEdit(service)} className="btn">
                                    <img src="./images/admin/edit-tools.png" alt=""/>
                                </div>

                                <div onClick={() => delColor(service.id)} className="btn">
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

export default ExtraServices;