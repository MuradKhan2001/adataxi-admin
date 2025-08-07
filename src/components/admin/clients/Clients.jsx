import {useEffect, useRef, useState, useContext} from "react";
import {CSSTransition} from "react-transition-group";
import {useFormik} from "formik";
import axios from "axios";
import {TextField} from "@mui/material";
import "./style.scss"
import {MyContext} from "../../App/App";
import LoaderAdmin from "../loader-admin/LoaderAdmin";
import {useTranslation} from "react-i18next";

const Clients = () => {
    const {t} = useTranslation();
    let value = useContext(MyContext);
    const [modalShow, setModalShow] = useState({show: false, status: false});
    const nodeRef = useRef(null);
    const [luggage, setLuggage] = useState("male");
    const [getSearchText, setGetSearchText] = useState("");
    const [driverPhoto, setDriverPhoto] = useState(null);
    const [driversList, setDriversList] = useState([]);
    const [driverId, setDriverId] = useState("");
    const [reason, setReason] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [loader, setLoader] = useState(false);

    const [links, setLinks] = useState({});
    const [Pages, setPages] = useState([]);
    const [activeItem, setActiveItem] = useState(1);
    const visiblePages = [];
    const totalPages = Pages.length;

    if (totalPages <= 7) {
        visiblePages.push(...Pages.map((_, index) => index + 1));
    } else {
        visiblePages.push(1);

        if (activeItem > 3) {
            visiblePages.push("...");
        }

        for (let i = Math.max(2, activeItem - 1); i <= Math.min(totalPages - 1, activeItem + 1); i++) {
            visiblePages.push(i);
        }

        if (activeItem < totalPages - 2) {
            visiblePages.push("...");
        }

        visiblePages.push(totalPages);
    }

    const validate = (values) => {
        const errors = {};

        if (!values.first_name) {
            errors.first_name = "Required";
        }

        if (!values.last_name) {
            errors.last_name = "Required";
        }

        if (!values.phone) {
            errors.phone = "Required";
        }
        return errors;
    };

    const formik = useFormik({
        initialValues: {
            first_name: "",
            last_name: "",
            phone: "",
        },
        validate,
        onSubmit: (values) => {
            sendAllInfo()
        },
    });

    useEffect(() => {
        getList()
    }, []);

    const getList = (url = null, page = 1) => {
        setLoader(true);
        const main = url ? url : `${value.url}/dashboard/client/?page=${page}`;
        axios.get(main, {
            headers: {
                "Authorization": `Token ${localStorage.getItem("token")}`
            }
        }).then((response) => {
            setDriversList(response.data.results);
            console.log(response.data.results)
            setLinks(response.data.links);
            setPages(response.data.links.pages);
            setActiveItem(page);
        }).finally(() => {
            setLoader(false);
        });

    };

    const getInputPhoto = (event) => {
        const file = event.target.files[0];
        setProfileImage(file);
    };

    const sendAllInfo = () => {
        const formData = new FormData();
        let user = {
            role: "client",
            first_name: formik.values.first_name,
            last_name: formik.values.last_name,
            phone: formik.values.phone,
            gender: luggage,
        }
        for (let key in user) {
            formData.append(key, user[key]);
        }
        if (profileImage) {
            formData.append('profile_image', profileImage);
        }

        if (!driverId) {
            axios.post(`${value.url}/dashboard/client/`, formData,
                {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                }).then((response) => {
                setModalShow({status: "", show: false})
                getList(null, activeItem)
                formik.resetForm();
            })
        }

        if (driverId) {
            axios.patch(`${value.url}/dashboard/client/${driverId}/`, formData,
                {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                }).then((response) => {
                setModalShow({status: "", show: false})
                getList(null, activeItem)
                formik.resetForm();
            })
        }
    }

    const editInfo = (driver) => {
        formik.setValues({
            first_name: driver.first_name,
            last_name: driver.last_name,
            phone: driver.phone,
        });
        setLuggage(driver.gender)
        setDriverId(driver.id)
    }

    const blockDriver = (status) => {
        if (status === "block" && reason.trim().length > 0) {
            axios.post(`${value.url}/dashboard/client/block-client/`,
                {client_id: driverId, reason}, {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                }).then((response) => {
                setModalShow({status: "", show: false})
                getList(null, activeItem)
                setReason("")
            })
        } else alert("Bloklash sababini kiriting!")

        if (status === "unblock") {
            axios.post(`${value.url}/dashboard/client/unblock-client/`,
                {client_id: driverId}, {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                }).then((response) => {
                setModalShow({status: "", show: false})
                getList(null, activeItem)
            })
        }
    }

    const delDriver = (id) => {
        setLoader(true)
        const isConfirmed = window.confirm("Rostdan ham ushbu mijozni o‘chirmoqchimisiz?");
        if (isConfirmed) {
            axios.delete(`${value.url}/dashboard/client/${id}/`, {
                headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
            }).then((response) => {
                getList(null, activeItem)
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                setLoader(false);
            });
        } else {
            setLoader(false);
        }
    };

    const filterData = () => {
        setLoader(true);
        let page = 1
        axios.get(`${value.url}/dashboard/client/?phone=${getSearchText}`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setDriversList(response.data.results);
            setLinks(response.data.links);
            setPages(response.data.links.pages);
            setActiveItem(page);
        }).finally(() => {
            setLoader(false);
        });
    }

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
                            <div className="title">Mijoz qo'shish</div>
                            <div className="title-form">Mijoz ma'lumotlari:</div>
                            <div className="form-container">
                                <div className="select-box">
                                    <div className="select-sides-file">
                                        <input onChange={getInputPhoto} type="file"/>
                                        <div className={`sloy-image ${profileImage ? "active" : ""}`}>
                                            Profil rasmi
                                            <img src="./images/admin/image.png" alt=""/>
                                        </div>
                                    </div>

                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.phone === "Required"}
                                            value={formik.values.phone}
                                            onChange={formik.handleChange}
                                            name="phone"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Telefon raqam" variant="outlined" className="textField"/>
                                    </div>
                                </div>
                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.first_name === "Required"}
                                            value={formik.values.first_name}
                                            onChange={formik.handleChange}
                                            name="first_name"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Ism" variant="outlined" className="textField"/>
                                    </div>
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.last_name === "Required"}
                                            value={formik.values.last_name}
                                            onChange={formik.handleChange}
                                            name="last_name"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Familiya" variant="outlined" className="textField"/>
                                    </div>
                                </div>
                                <div className="select-box">
                                    <div className="select-sides">
                                        <div className="title-on">
                                            Jinsi:
                                        </div>
                                        <div className="on-of">
                                            <div onClick={() => setLuggage("male")}
                                                 className={`of ${luggage === "male" ? "on" : ""}`}>
                                                Erkak
                                            </div>
                                            <div onClick={() => setLuggage("female")}
                                                 className={`of ${luggage === "female" ? "on" : ""}`}>
                                                Ayol
                                            </div>
                                        </div>
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

                    {modalShow.status === "driver-photo" && (
                        <div className="driver-photo">
                            <div className="cancel-btn">
                                <img
                                    onClick={() => setModalShow({status: "", show: false})}
                                    src="./images/admin/x.png"
                                    alt=""
                                />
                            </div>

                            <div className="photo">
                                <img src={driverPhoto} alt=""/>
                            </div>
                        </div>
                    )}

                    {modalShow.status === "blocked" && (
                        <div className="blocked">
                            <div className="cancel-btn">
                                <img onClick={() => {
                                    setModalShow({status: "", show: false})
                                    setReason("")
                                }}
                                     src="./images/admin/x.png"
                                     alt=""
                                />
                            </div>

                            <div className="title">
                                Haydovchini bloklash
                            </div>

                            <div className="reason-text">
                                <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                                          placeholder="Blok qilish sababini kiriting..." name="reason"
                                          id="reason"></textarea>

                                <div className="buttons">
                                    <div onClick={() => {
                                        blockDriver("unblock")
                                    }}
                                         className="cancel">Bekor qilish
                                    </div>

                                    <div onClick={() => {
                                        blockDriver("block")
                                    }} className="success">Bloklash
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {modalShow.status === "edit-driver" && (
                        <div className="edit-driver">
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

                            <div className="title">Mijoz ma'lumotlarini tahrirlash</div>

                            <div className="title-form">Mijoz ma'lumotlari:</div>

                            <div className="form-container">
                                <div className="select-box">
                                    <div className="select-sides-file">
                                        <input onChange={getInputPhoto} type="file"/>
                                        <div className={`sloy-image ${profileImage ? "active" : ""}`}>
                                            Profil rasmi
                                            <img src="./images/admin/image.png" alt=""/>
                                        </div>
                                    </div>

                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.phone === "Required"}
                                            value={formik.values.phone}
                                            onChange={formik.handleChange}
                                            name="phone"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Telefon raqam" variant="outlined" className="textField"/>
                                    </div>
                                </div>
                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.first_name === "Required"}
                                            value={formik.values.first_name}
                                            onChange={formik.handleChange}
                                            name="first_name"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Ism" variant="outlined" className="textField"/>
                                    </div>
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.last_name === "Required"}
                                            value={formik.values.last_name}
                                            onChange={formik.handleChange}
                                            name="last_name"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Familiya" variant="outlined" className="textField"/>
                                    </div>
                                </div>
                                <div className="select-box">
                                    <div className="select-sides">
                                        <div className="title-on">
                                            Jinsi:
                                        </div>
                                        <div className="on-of">
                                            <div onClick={() => setLuggage("male")}
                                                 className={`of ${luggage === "male" ? "on" : ""}`}>
                                                Erkak
                                            </div>
                                            <div onClick={() => setLuggage("female")}
                                                 className={`of ${luggage === "female" ? "on" : ""}`}>
                                                Ayol
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div onClick={() => {
                                formik.handleSubmit()
                            }} className="add-btn">
                                Saqlash
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CSSTransition>

        <div className="header">
            <div className="left-side">
                <div className="search-box">
                    <img src="./images/admin/find-person.png" alt=""/>
                    <input value={getSearchText} onChange={(e) => setGetSearchText(e.target.value)} placeholder="Telefon raqam kiriting"
                           type="text"/>
                    {getSearchText &&
                        <img style={{cursor: "pointer"}} onClick={() => setGetSearchText("")} src="./images/close.png"
                             alt="close"/>}
                </div>

                <div className="update-driver">
                    <img onClick={filterData} src="./images/admin/panel.png" alt="changes"/>
                </div>
            </div>


            <div onClick={() => {
                setModalShow({show: true, status: "add-driver"});
            }} className="add-driver-btn">
                Mijoz qo'shish
            </div>

        </div>

        <div className="table-wrapper">
            {loader ? <LoaderAdmin/> : <table>
                <thead>
                <tr>
                    <th>№</th>
                    <th>Mijoz haqida</th>
                    <th>Telefon raqam</th>
                    <th>Jinsi</th>
                    <th>Bloklash</th>
                    <th>O'chirish</th>
                    <th></th>
                </tr>
                </thead>

                <tbody>
                {driversList.map((item, index) => {
                    return <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="driver-wrapper">
                            <div className="icon-driver">
                                <img onClick={() => {
                                    setModalShow({show: true, status: "driver-photo"});
                                    setDriverPhoto(item.profile_image)
                                }} src={item.profile_image} alt=""/>
                            </div>
                            <div className="text-driver">
                                <div className="name">
                                    {item.first_name} &nbsp;
                                    {item.last_name}
                                </div>
                            </div>
                        </td>
                        <td>
                            {item.phone}
                        </td>
                        <td>
                            {item.gender}
                        </td>
                        <td>
                            <div className={item.is_block ? "icon-check" : "icon-check disablet"}>
                                <img onClick={() => {
                                    setModalShow({show: true, status: "blocked"});
                                    if (item.is_block) {
                                        setReason(item.reason)
                                    }
                                    setDriverId(item.id)
                                }} src="./images/admin/block.png" alt="block"/>

                                {item.reason && item.is_block && <div className="reason-block">
                                    <img src="./images/admin/warning.png" alt=""/>
                                    <div className="text">
                                        {item.reason}
                                    </div>
                                </div>}

                            </div>
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
            <div onClick={() => {
                if (activeItem > 1) {
                    getList(links.previous, activeItem - 1);
                }
            }} className="prev">
                <img src="./images/admin/prev.png" alt="Prev"/>
            </div>

            {visiblePages.map((item, index) => (
                <div key={index}
                     onClick={() => {
                         if (item !== "...") {
                             const pageNumber = item;
                             const pageObj = Pages.find(item_page => item_page[pageNumber]);
                             const pageUrl = pageObj ? pageObj[pageNumber] : null;
                             getList(pageUrl, item);
                         }
                     }}
                     className={`items ${activeItem === item ? "active" : ""} `}
                     style={{cursor: item === "..." ? "default" : "pointer"}}>
                    {item}
                </div>
            ))}

            <div className="next" onClick={() => {
                if (activeItem < totalPages) {
                    getList(links.next, activeItem + 1);
                }
            }}>
                <img src="./images/admin/next.png" alt="Next"/>
            </div>
        </div>
    </div>
}

export default Clients