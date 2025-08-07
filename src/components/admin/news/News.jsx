import {useEffect, useRef, useState, useContext} from "react";
import {CSSTransition} from "react-transition-group";
import {useFormik} from "formik";
import axios from "axios";
import {TextareaAutosize, TextField} from "@mui/material";
import "./style.scss"
import {MyContext} from "../../App/App";
import LoaderAdmin from "../loader-admin/LoaderAdmin";
import {useTranslation} from "react-i18next";
import i18next from "i18next";

const News = () => {
    const {t} = useTranslation();
    let value = useContext(MyContext);
    const [modalShow, setModalShow] = useState({show: false, status: false});
    const nodeRef = useRef(null);
    const [driverId, setDriverId] = useState("");
    const [loader, setLoader] = useState(false);
    const [newsContent, setNewsContent] = useState([]);

    const validate = (values) => {
        const errors = {};

        if (!values.title_uz) {
            errors.title_uz = "Required";
        }

        if (!values.title_ru) {
            errors.title_ru = "Required";
        }

        if (!values.title_en) {
            errors.title_en = "Required";
        }

        if (!values.content_uz) {
            errors.content_uz = "Required";
        }

        if (!values.content_ru) {
            errors.content_ru = "Required";
        }

        if (!values.content_en) {
            errors.content_en = "Required";
        }

        return errors;
    };

    const formik = useFormik({
        initialValues: {
            title_uz: "",
            title_ru: "",
            title_en: "",
            content_uz: "",
            content_ru: "",
            content_en: ""
        },
        validate,
        onSubmit: (values) => {
            sendAllInfo()
        },
    });

    const getData = () => {
        axios.get(`${value.url}/dashboard/news/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setNewsContent(response.data);
        })
    }

    useEffect(() => {
        getData()
    }, []);

    const sendAllInfo = () => {
        const translations = {
            uz: {
                title: formik.values.title_uz,
                content: formik.values.content_uz
            },
            ru: {
                title: formik.values.title_ru,
                content: formik.values.content_ru
            },
            en: {
                title: formik.values.title_en,
                content: formik.values.content_en
            }
        }

        if (!driverId) {
            axios.post(`${value.url}/dashboard/news/`, {translations},
                {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                }).then((response) => {
                setModalShow({status: "", show: false})
                formik.resetForm();
                getData();
            })
        }

        if (driverId) {
            axios.patch(`${value.url}/dashboard/news/${driverId}/`, {translations},
                {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                }).then((response) => {
                setModalShow({status: "", show: false})
                formik.resetForm();
                getData();
            })
        }
    }

    const editInfo = (driver) => {
        formik.setValues({
            title_uz: driver.translations["uz"].title,
            title_ru: driver.translations["ru"].title,
            title_en: driver.translations["en"].title,
            content_uz: driver.translations["uz"].content,
            content_ru: driver.translations["ru"].content,
            content_en: driver.translations["en"].content,
        });
        setDriverId(driver.id)
    }

    const delDriver = (id) => {
        setLoader(true)
        const isConfirmed = window.confirm("Rostdan ham ushbu yangilikni o‘chirmoqchimisiz?");
        if (isConfirmed) {
            axios.delete(`${value.url}/dashboard/news/${id}/`, {
                headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
            }).then((response) => {
                getData()
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                setLoader(false);
            });

        } else {
            setLoader(false);
        }
    };

    return <div className="clients-container">
        <CSSTransition
            in={modalShow.show}
            nodeRef={nodeRef}
            timeout={300}
            classNames="alert"
            unmountOnExit
        >
            <div className="modal-sloy">
                <div ref={nodeRef} className="modal-card">
                    {modalShow.status === "add-driver" && (
                        <div className="add-driver">
                            <div className="cancel-btn">
                                <img
                                    onClick={() => {
                                        setModalShow({status: "", show: false})
                                        formik.resetForm();
                                    }}
                                    src="./images/admin/x.png"
                                    alt=""
                                />
                            </div>
                            <div className="title">Yangilik qoshish</div>
                            <div className="form-container">
                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.title_uz === "Required"}
                                            value={formik.values.title_uz}
                                            onChange={formik.handleChange}
                                            name="title_uz"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Sarlavha" variant="outlined" className="textField"/>
                                    </div>
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.title_en === "Required"}
                                            value={formik.values.title_en}
                                            onChange={formik.handleChange}
                                            name="title_en"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Title" variant="outlined" className="textField"/>
                                    </div>
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.title_ru === "Required"}
                                            value={formik.values.title_ru}
                                            onChange={formik.handleChange}
                                            name="title_ru"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Заголовок" variant="outlined" className="textField"/>
                                    </div>
                                </div>
                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextareaAutosize
                                            error={formik.errors.content_uz === "Required"}
                                            value={formik.values.content_uz}
                                            onChange={formik.handleChange}
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            name="content_uz"
                                            aria-label="minimum height"
                                            minRows={3}
                                            variant="outlined" className="textField"
                                            placeholder="Tavsif"
                                        />

                                    </div>
                                    <div className="select-sides">
                                        <TextareaAutosize
                                            error={formik.errors.content_ru === "Required"}
                                            value={formik.values.content_ru}
                                            onChange={formik.handleChange}
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            name="content_ru"
                                            aria-label="minimum height"
                                            minRows={3}
                                            variant="outlined" className="textField"
                                            placeholder="Описание"
                                        />

                                    </div>
                                    <div className="select-sides">
                                        <TextareaAutosize
                                            error={formik.errors.content_en === "Required"}
                                            value={formik.values.content_en}
                                            onChange={formik.handleChange}
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            name="content_en"
                                            aria-label="minimum height"
                                            minRows={3}
                                            variant="outlined" className="textField"
                                            placeholder="Description"
                                        />

                                    </div>
                                </div>
                            </div>

                            <div onClick={() => {
                                formik.handleSubmit()
                            }} className="add-btn">
                                Qo'shish
                            </div>
                        </div>
                    )}

                    {modalShow.status === "edit-driver" && (
                        <div className="add-driver">
                            <div className="cancel-btn">
                                <img
                                    onClick={() => {
                                        setModalShow({status: "", show: false})
                                        formik.resetForm();
                                    }}
                                    src="./images/admin/x.png"
                                    alt=""
                                />
                            </div>
                            <div className="title">Yangilikni tahrirlash</div>
                            <div className="form-container">
                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.title_uz === "Required"}
                                            value={formik.values.title_uz}
                                            onChange={formik.handleChange}
                                            name="title_uz"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Sarlavha" variant="outlined" className="textField"/>
                                    </div>
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.title_en === "Required"}
                                            value={formik.values.title_en}
                                            onChange={formik.handleChange}
                                            name="title_en"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Title" variant="outlined" className="textField"/>
                                    </div>
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.title_ru === "Required"}
                                            value={formik.values.title_ru}
                                            onChange={formik.handleChange}
                                            name="title_ru"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Заголовок" variant="outlined" className="textField"/>
                                    </div>
                                </div>
                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextareaAutosize
                                            error={formik.errors.content_uz === "Required"}
                                            value={formik.values.content_uz}
                                            onChange={formik.handleChange}
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            name="content_uz"
                                            aria-label="minimum height"
                                            minRows={3}
                                            variant="outlined" className="textField"
                                            placeholder="Tavsif"
                                        />

                                    </div>
                                    <div className="select-sides">
                                        <TextareaAutosize
                                            error={formik.errors.content_ru === "Required"}
                                            value={formik.values.content_ru}
                                            onChange={formik.handleChange}
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            name="content_ru"
                                            aria-label="minimum height"
                                            minRows={3}
                                            variant="outlined" className="textField"
                                            placeholder="Описание"
                                        />

                                    </div>
                                    <div className="select-sides">
                                        <TextareaAutosize
                                            error={formik.errors.content_en === "Required"}
                                            value={formik.values.content_en}
                                            onChange={formik.handleChange}
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            name="content_en"
                                            aria-label="minimum height"
                                            minRows={3}
                                            variant="outlined" className="textField"
                                            placeholder="Description"
                                        />

                                    </div>
                                </div>
                            </div>

                            <div onClick={() => {
                                formik.handleSubmit()
                            }} className="add-btn">
                                Tahrirlash
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CSSTransition>

        <div className="header">
            <div className="left-side">
            </div>


            <div onClick={() => {
                setModalShow({show: true, status: "add-driver"});
            }} className="add-driver-btn">
                Yangilik qo'shish
            </div>

        </div>

        <div className="table-wrapper">
            {loader ? <LoaderAdmin/> : <table>
                <thead>
                <tr>
                    <th>№</th>
                    <th>Yangilik nomi</th>
                    <th>Batafsil</th>
                    <th>O'chirish</th>
                    <th></th>
                </tr>
                </thead>

                <tbody>
                {newsContent.map((item, index) => {
                    return <tr key={index}>
                        <td>{index + 1}</td>

                        <td>
                            {item.translations[i18next.language].title}
                        </td>

                        <td>
                            {item.translations[i18next.language].content}
                        </td>

                        <td>
                            <div className="icon">
                                <img onClick={() => delDriver(item.id)} src="./images/admin/delete.png" alt=""/>
                            </div>
                        </td>

                        <td>
                        </td>

                        <div className="edit-icon">
                            <img onClick={() => {
                                setModalShow({show: true, status: "edit-driver"});
                                editInfo(item)
                            }} src="./images/admin/edit-tools.png" alt=""/>
                        </div>
                    </tr>
                })}
                </tbody>
            </table>}
        </div>

        <div className="pagination">

        </div>
    </div>
}

export default News