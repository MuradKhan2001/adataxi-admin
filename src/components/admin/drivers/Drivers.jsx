import {useEffect, useRef, useState, useContext} from "react";
import {CSSTransition} from "react-transition-group";
import {useFormik} from "formik";
import ReactPaginate from "react-paginate";
import i18next from "i18next";
import axios from "axios";
import {
    TextField,
    MenuItem,
    InputLabel,
    FormControl,
    Select,
    OutlinedInput,
    Checkbox,
    ListItemText
} from "@mui/material";
import "./style.scss"
import {MyContext} from "../../App/App";
import {useTranslation} from "react-i18next";
import LoaderAdmin from "../loader-admin/LoaderAdmin";
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

const Drivers = () => {
    const {t} = useTranslation();
    let value = useContext(MyContext);
    const [modalShow, setModalShow] = useState({show: false, status: false});
    const nodeRef = useRef(null);
    const ref = useRef(null);
    const [getSearchText, setGetSearchText] = useState("");
    const [driverPhoto, setDriverPhoto] = useState(null);
    const [carInformation, setCarInformation] = useState([]);
    const [driversList, setDriversList] = useState([]);
    const [driverId, setDriverId] = useState("");
    const [reason, setReason] = useState("");
    const [loader, setLoader] = useState(false);

    const [car_serviceId, setCarServiceId] = useState([])
    const [car_categoriesId, setCarCategoriesId] = useState([])

    const [regions, setRegions] = useState([])

    const [luggage, setLuggage] = useState("male");
    const [profileImage, setProfileImage] = useState(null);
    const [car_images, setCar_images] = useState([]);
    const [base_car_images, setBase_Car_images] = useState([]);

    const [doc_images, setDocImages] = useState([]);
    const [base_doc_images, setBaseDocImages] = useState([]);

    const [car_make, setCar_make] = useState([]);
    const [car_model, setCar_model] = useState([]);
    const [car_colors, setCar_colors] = useState([]);
    const [extra_services, setExtra_services] = useState([]);
    const [extra_servicesList, setExtra_servicesList] = useState([]);

    const [car_categories, setCar_categories] = useState([]);
    const [car_service, setCar_service] = useState([]);

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    const worksPage = 100;
    const [pageNumber, setPageNumber] = useState(0);
    const pagesVisited = pageNumber * worksPage;

    const [confirmFilter, setConfirmFilter] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState("");

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

        if (!values.car_model) {
            errors.car_model = "Required";
        }

        if (!values.car_color) {
            errors.car_color = "Required";
        }

        if (!values.car_make) {
            errors.car_make = "Required";
        }

        if (!values.car_number) {
            errors.car_number = "Required";
        }

        if (!values.extra_services) {
            errors.extra_services = "Required";
        }

        if (!values.seat_count) {
            errors.seat_count = "Required";
        }

        if (!values.from_region) {
            errors.from_region = "Required";
        }

        if (!values.to_region) {
            errors.to_region = "Required";
        }

        return errors;
    };
    const formik = useFormik({
        initialValues: {
            phone: "",
            first_name: "",
            last_name: "",
            birth_date: "",
            car_number: "",
            car_color: "",
            car_make: "",
            car_model: "",
            extra_services: [],
            seat_count: "",
            from_region: "",
            to_region: ""
        },
        validate,
        onSubmit: (values) => {
            sendAllInfo()
        },
    });

    useEffect(() => {
        getDrivers()
        axios.get(`${value.url}/dashboard/carcategory/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setCar_categories(response.data);
        })

        axios.get(`${value.url}/dashboard/carservice/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setCar_service(response.data);
        })

        axios.get(`${value.url}/dashboard/carmake/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setCar_make(response.data);
        })

        axios.get(`${value.url}/dashboard/carcolor/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setCar_colors(response.data);
        })

        axios.get(`${value.url}/dashboard/extraservices/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setExtra_servicesList(response.data);
        })

        axios.get(`${value.url}/dashboard/region/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setRegions(response.data);
        })

    }, []);

    const getDrivers = () => {
        setLoader(true);
        axios.get(`${value.url}/dashboard/driver/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setDriversList(response.data);
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            setLoader(false);
        });
    }

    const getCarNames = (id) => {
        axios.get(`${value.url}/dashboard/carmake/${id}/`, {
            headers: {
                "Authorization": `Token ${localStorage.getItem("token")}`
            }
        }).then((response) => {
            setCar_model(response.data);
        })
    }

    const changePage = ({selected}) => {
        setPageNumber(selected)

        setTimeout(() => {
            ref.current?.scrollIntoView({behavior: "smooth"});
        }, 500);
    };

    const getInputPhoto = (event) => {
        const file = event.target.files[0];
        setProfileImage(file);
    };

    const sendAllInfo = () => {
        const formData = new FormData();
        let user = {
            role: "driver",
            first_name: formik.values.first_name,
            last_name: formik.values.last_name,
            phone: formik.values.phone,
            gender: luggage,
            is_verified: true,
            is_confirmed: true
        }
        let driver = {
            car_make: formik.values.car_make,
            car_model: formik.values.car_model,
            car_color: formik.values.car_color,
            car_number: formik.values.car_number,
            seat_count: formik.values.seat_count,
            birth_date: formik.values.birth_date,
            extra_services: formik.values.extra_services,
            from_region: formik.values.from_region,
            to_region: formik.values.to_region
        }

        for (let key in user) {
            formData.append(key, user[key]);
        }

        for (let key in driver) {
            if (Array.isArray(driver[key])) {
                driver[key].forEach(value => {
                    formData.append(`driver.${key}`, value);
                });
            } else {
                formData.append(`driver.${key}`, driver[key]);
            }
        }

        if (profileImage) {
            formData.append('profile_image', profileImage);
        }

        if (!driverId) {
            axios.post(`${value.url}/dashboard/driver/`, formData,
                {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                }).then((response) => {
                setModalShow({status: "", show: false})
                getDrivers()
                formik.resetForm();
            })
        }

        if (driverId) {
            axios.patch(`${value.url}/dashboard/driver/${driverId}/`, formData,
                {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                }).then((response) => {
                setModalShow({status: "", show: false})
                getDrivers()
                formik.resetForm();
            })
        }
    }

    const editInfo = (id) => {

        axios.get(`${value.url}/dashboard/driver/${id}/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            formik.setValues({
                phone: response.data.user.phone,
                first_name: response.data.user.first_name,
                last_name: response.data.user.last_name,
                birth_date: response.data.birth_date,
                car_number: response.data.car_number,
                car_color: response.data.car_color && response.data.car_color.id,
                car_make: response.data.car_make && response.data.car_make.id,
                car_model: response.data.car_model && response.data.car_model.id,
                extra_services: response.data.extra_services.length > 0 ? response.data.extra_services.map(service => service.id) : [],
                seat_count: response.data.seat_count,
                from_region: response.data.from_region && response.data.from_region.id,
                to_region: response.data.to_region && response.data.to_region.id,
            });

            setLuggage(response.data.user.gender)
            if (response.data.car_make) {
                getCarNames(response.data.car_make.id)
            }
        })
        setDriverId(id)
    }

    const blockDriver = (status) => {
        if (status === "block" && reason.trim().length > 0) {
            axios.post(`${value.url}/dashboard/driver/block-driver/`,
                {driver_id: driverId, reason}, {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                }).then((response) => {
                setModalShow({status: "", show: false})
                getDrivers()
                setReason("")
            })
        } else alert("Bloklash sababini kiriting!")

        if (status === "unblock") {
            axios.post(`${value.url}/dashboard/driver/unblock-driver/`,
                {driver_id: driverId}, {
                    headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
                }).then((response) => {
                setModalShow({status: "", show: false})
                getDrivers()
            })
        }
    }

    const handleCheckboxChangeService = (serviceId) => {
        setCarServiceId((prevSelected) =>
            prevSelected.includes(serviceId)
                ? prevSelected.filter((id) => id !== serviceId)
                : [...prevSelected, serviceId]
        );
    };

    const handleCheckboxChangeCategory = (serviceId) => {
        setCarCategoriesId((prevSelected) =>
            prevSelected.includes(serviceId)
                ? prevSelected.filter((id) => id !== serviceId)
                : [...prevSelected, serviceId]
        );
    };

    const verify = () => {
        let driver = {
            driver_id: driverId,
            available_services: car_serviceId,
            available_categories: car_categoriesId
        }

        axios.post(`${value.url}/dashboard/driver/confirm-driver/`,
            driver, {
                headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
            }).then((response) => {
            getDrivers()
            setModalShow({status: "", show: false})
        })

    }

    const getInformation = (id) => {
        setModalShow({show: true, status: "car-information"});

        axios.get(`${value.url}/dashboard/driver/${id}/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setCarInformation(response.data);
            console.log(response.data)
        })
    }

    const handleAddImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCar_images((prevImages) => [
                    ...prevImages,
                    {
                        preview: reader.result,
                        file: file
                    }
                ]);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = null;
    };

    const getCarImages = (id) => {
        setModalShow({show: true, status: "car-photos"});
        setDriverId(id)
        axios.post(`${value.url}/dashboard/driver/car-images/`, {driver_id: id}, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setBase_Car_images(response.data)
        }).catch((error) => {
            console.log(error);
        })
    }

    const handleDeleteImageBase = (id) => {
        axios.post(`${value.url}/dashboard/driver/delete-car-image/`, {driver_car_image: id}, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            getCarImages(driverId)
        })
    };

    const handleDeleteImage = (index) => {
        setCar_images((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const addCar_Images = () => {
        const formData = new FormData();
        formData.append('driver', driverId);

        car_images.forEach((image, index) => {
            formData.append('car_images', image.file);
        });

        axios.post(`${value.url}/dashboard/driver/update-image/`, formData, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setModalShow({status: "", show: false})
            setCar_images([])
        })
    }

    const handleAddImageDoc = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDocImages((prevImages) => [
                    ...prevImages,
                    {
                        preview: reader.result,
                        file: file
                    }
                ]);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = null;
    };

    const getDocsImages = (id) => {
        setModalShow({show: true, status: "car-docs"});
        setDriverId(id)
        axios.post(`${value.url}/dashboard/driver/document-images/`, {driver_id: id}, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setBaseDocImages(response.data)
        }).catch((error) => {
            console.log(error);
        })
    }

    const handleDeleteImageDocsBase = (id) => {
        axios.post(`${value.url}/dashboard/driver/delete-document-image/`, {driver_document_image: id}, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            getDocsImages(driverId)
        })
    };

    const handleDeleteImageDocs = (index) => {
        setDocImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const addCar_Images_Docs = () => {
        const formData = new FormData();
        formData.append('driver', driverId);

        doc_images.forEach((image, index) => {
            formData.append('document_images', image.file);
        });

        axios.post(`${value.url}/dashboard/driver/update-image/`, formData, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setModalShow({status: "", show: false})
            setCar_images([])
            setDocImages([])
        })
    }

    const delDriver = (id) => {
        setLoader(true)
        const isConfirmed = window.confirm("Rostdan ham ushbu haydovchini o‘chirmoqchimisiz?");
        if (isConfirmed) {
            axios.delete(`${value.url}/dashboard/driver/${id}/`, {
                headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
            }).then((response) => {
                getDrivers()
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                setLoader(false);
            });
        } else {
            setLoader(false);
        }
    };

    const filteredDrivers = driversList.filter((item) => {
        const searchText = getSearchText.toString().toLowerCase().replace(/\s+/g, '').replace(/\+/g, '');
        const phoneNumber = item.phone?.toString().toLowerCase().replace(/\s+/g, '').replace(/\+/g, '');

        const matchesSearch = searchText === "" || phoneNumber.includes(searchText);
        const matchesConfirm = confirmFilter === ""
            ? true
            : item.is_confirmed === (confirmFilter === "true");
        return matchesSearch && matchesConfirm;
    });

    const pageCount = Math.ceil(filteredDrivers.length / worksPage);

    const productList = filteredDrivers.slice(pagesVisited, pagesVisited + worksPage).map((item, index) => {
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
                        {item.user_name && item.user_name}
                    </div>
                    <div className="phone">
                        {item.phone && item.phone}
                    </div>
                </div>
            </td>
            <td>
                {item.created_at}
            </td>
            <td>
                {item.from_region && item.from_region.translations[i18next.language].name}
                --
                {item.to_region && item.to_region.translations[i18next.language].name}
            </td>
            <td>
                {item.car_color && item.car_color.translations[i18next.language].name}&nbsp;
                {item.car_make && item.car_make.translations[i18next.language].name} &nbsp;
                {item.car_model && item.car_model.translations[i18next.language].name}
            </td>
            <td>
                {item.car_number && item.car_number}
            </td>
            <td>
                <div className="icon">
                    <img onClick={() => getInformation(item.id)} src="./images/admin/sport-car.png" alt=""/>
                </div>
            </td>
            <td>
                <div className="icon">
                    <img onClick={() => getCarImages(item.id)} src="./images/admin/car-photo.png" alt=""/>
                </div>
            </td>
            <td>
                <div className="icon">
                    <img onClick={() => getDocsImages(item.id)} src="./images/admin/document.png" alt=""/>
                </div>
            </td>
            <td>
                <div className={item.is_confirmed ? "icon-check" : "icon-check disablet"}>
                    <img onClick={() => {
                        setModalShow({show: true, status: "driver-service"});
                        setDriverId(item.id)
                        setCarServiceId(item.available_services)
                        setCarCategoriesId(item.available_categories)
                    }} src="./images/admin/check.png" alt=""/>
                </div>
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
                    editInfo(item.id)
                }} src="./images/admin/edit-tools.png" alt=""/>
            </div>
        </tr>
    });

    return <div className="drivers-container">
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

                            <div className="title">Haydovchi qo'shish</div>

                            <div className="title-form">Haydovchi ma'lumotlari:</div>

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
                                        <TextField
                                            error={formik.errors.phone === "Required"}
                                            value={formik.values.phone}
                                            onChange={formik.handleChange}
                                            name="phone"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Telefon raqam" variant="outlined" className="textField"/>
                                    </div>
                                    <div className="select-sides-time">
                                        <label htmlFor="">Tug'ilgan sana:</label>
                                        <input
                                            className={`working_time ${formik.errors.birth_date === "Required" ? "working_time_required" : ""}`}
                                            name="birth_date" onChange={formik.handleChange}
                                            value={formik.values.birth_date}
                                            type="date"/>
                                    </div>
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

                            <div className="title-form">Avtomobil ma'lumotlari:</div>

                            <div className="form-container">
                                <div className="select-box">
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Avtomobil modeli</InputLabel>
                                            <Select
                                                error={formik.errors.car_make === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.car_make}
                                                name="car_make"
                                                label="Avtomobil modeli"
                                                onChange={formik.handleChange}
                                            >
                                                {
                                                    car_make.map((item, index) => {
                                                        return <MenuItem onClick={() => getCarNames(item.id)}
                                                                         key={index}
                                                                         value={item.id}>
                                                            {item.translations[i18next.language].name}
                                                        </MenuItem>
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Avtomobil nomi</InputLabel>
                                            <Select
                                                error={formik.errors.car_model === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.car_model}
                                                name="car_model"
                                                label="Avtomobil nomi"
                                                onChange={formik.handleChange}
                                            >
                                                {
                                                    car_model.map((item, index) => {
                                                        return <MenuItem key={index}
                                                                         value={item.id}>
                                                            {item.translations[i18next.language].name}
                                                        </MenuItem>
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.car_number === "Required"}
                                            value={formik.values.car_number}
                                            onChange={formik.handleChange}
                                            name="car_number"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Avtomobil raqami" variant="outlined" className="textField"/>
                                    </div>
                                </div>
                                <div className="select-box ">
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Avtomobil rangi</InputLabel>
                                            <Select
                                                error={formik.errors.car_color === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                name="car_color"
                                                label="Avtomobil rangi"
                                                value={formik.values.car_color}
                                                onChange={formik.handleChange}
                                            >
                                                {
                                                    car_colors.map((item, index) => {
                                                        return <MenuItem key={index}
                                                                         value={item.id}>
                                                            {item.translations[i18next.language].name}
                                                        </MenuItem>
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <TextField
                                                id="seat_count"
                                                name="seat_count"
                                                label="O‘rindiqlar soni"
                                                type="number"
                                                value={formik.values.seat_count}
                                                onChange={formik.handleChange}
                                                error={formik.touched.seat_count && Boolean(formik.errors.seat_count)}
                                                helperText={formik.touched.seat_count && formik.errors.seat_count}
                                                inputProps={{min: 1}}
                                                fullWidth
                                                size="small"
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, width: "100%"}} className="selectMui" size="small">
                                            <InputLabel id="demo-multiple-checkbox-label">Xizmatlar</InputLabel>

                                            <Select
                                                error={formik.errors.extra_services === "Required"}
                                                name="extra_services"
                                                labelId="demo-multiple-checkbox-label"
                                                id="demo-multiple-checkbox"
                                                multiple
                                                value={formik.values.extra_services}
                                                onChange={(event) => {
                                                    const {value} = event.target;
                                                    formik.setFieldValue(
                                                        "extra_services",
                                                        typeof value === 'string' ? value.split(',') : value
                                                    );
                                                }}
                                                input={<OutlinedInput label="Xizmatlar"/>}
                                                renderValue={(selected) =>
                                                    selected
                                                        .map((id) => {
                                                            const item = extra_servicesList.find(i => i.id === id);
                                                            return item ? item.translations[i18next.language].name : '';
                                                        })
                                                        .join(', ')
                                                }
                                                MenuProps={MenuProps}
                                            >
                                                {extra_servicesList.map((item) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        <Checkbox
                                                            checked={formik.values.extra_services.includes(item.id)}
                                                        />
                                                        <ListItemText
                                                            primary={item.translations[i18next.language].name}
                                                        />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </div>

                            <div className="title-form">Asosan qaysi yo'nalishda harakat qilasiz:</div>
                            <div className="form-container">
                                <div className="select-box start">
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Qayerdan</InputLabel>
                                            <Select
                                                error={formik.errors.from_region === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.from_region}
                                                name="from_region"
                                                label="Qayerdan"
                                                onChange={formik.handleChange}
                                            >
                                                {
                                                    regions.map((item, index) => {
                                                        return <MenuItem key={index}
                                                                         value={item.id}>
                                                            {item.translations[i18next.language].name}
                                                        </MenuItem>
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Qayerga</InputLabel>
                                            <Select
                                                error={formik.errors.to_region === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.to_region}
                                                name="to_region"
                                                label="Qayerga"
                                                onChange={formik.handleChange}
                                            >
                                                {
                                                    regions.map((item, index) => {
                                                        return <MenuItem key={index}
                                                                         value={item.id}>
                                                            {item.translations[i18next.language].name}
                                                        </MenuItem>
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </div>

                            <div onClick={() => {
                                formik.handleSubmit()
                            }} className="add-btn">
                                <img src="./images/admin/add.png" alt=""/>
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

                    {modalShow.status === "car-information" && (
                        <div className="car-information">
                            <div className="cancel-btn">
                                <img onClick={() => setModalShow({status: "", show: false})}
                                     src="./images/admin/x.png"
                                     alt=""
                                />
                            </div>
                            <div className="title">
                                Avtomobil ma'lumotlari
                            </div>
                            {carInformation &&
                                <div className="information">
                                    <div className="info">
                                        <div className="title">Tugilgan sanasi:</div>
                                        <div
                                            className="text">{carInformation.birth_date && carInformation.birth_date}</div>
                                    </div>
                                    <div className="info">
                                        <div className="title">Jinsi:</div>
                                        <div
                                            className="text">
                                            {carInformation.user && carInformation.user.gender === "male" && "Erkak"}
                                            {carInformation.user && carInformation.user.gender === "female" && "Ayol"}
                                        </div>
                                    </div>
                                    <div className="info">
                                        <div className="title">Reyting:</div>
                                        <div
                                            className="text">{carInformation.user && carInformation.user.rate}</div>
                                    </div>
                                    <div className="info">
                                        <div className="title">O'rindiqlar soni:</div>
                                        <div
                                            className="text">{carInformation.seat_count && carInformation.seat_count}</div>
                                    </div>
                                    <div className="info">
                                        <div className="title">Yakunlagan buyurtmalar:</div>
                                        <div
                                            className="text">{carInformation.user && carInformation.user.finished_orders_count}</div>
                                    </div>
                                    <div className="info">
                                        <div className="title">Qo'shimcha xizmatlar:</div>
                                        <div className="text">
                                            {carInformation.extra_services && carInformation.extra_services.map((item, index) => {
                                                return <span key={index}>
                                                    {item.translations[i18next.language].name},
                                                </span>
                                            })}
                                        </div>
                                    </div>
                                </div>}
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

                            <div className="title">Haydovchi malumotlarini tahrirlash</div>

                            <div className="title-form">Haydovchi ma'lumotlari:</div>

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
                                        <TextField
                                            error={formik.errors.phone === "Required"}
                                            value={formik.values.phone}
                                            onChange={formik.handleChange}
                                            name="phone"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Telefon raqam" variant="outlined" className="textField"/>
                                    </div>
                                    <div className="select-sides-time">
                                        <label htmlFor="">Tug'ilgan sana:</label>
                                        <input
                                            className={`working_time ${formik.errors.birth_date === "Required" ? "working_time_required" : ""}`}
                                            name="birth_date" onChange={formik.handleChange}
                                            value={formik.values.birth_date}
                                            type="date"/>
                                    </div>
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

                            <div className="title-form">Avtomobil ma'lumotlari:</div>

                            <div className="form-container">
                                <div className="select-box">
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Avtomobil modeli</InputLabel>
                                            <Select
                                                error={formik.errors.car_make === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.car_make}
                                                name="car_make"
                                                label="Avtomobil modeli"
                                                onChange={formik.handleChange}
                                            >
                                                {
                                                    car_make.map((item, index) => {
                                                        return <MenuItem onClick={() => getCarNames(item.id)}
                                                                         key={index}
                                                                         value={item.id}>
                                                            {item.translations[i18next.language].name}
                                                        </MenuItem>
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Avtomobil nomi</InputLabel>
                                            <Select
                                                error={formik.errors.car_model === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.car_model}
                                                name="car_model"
                                                label="Avtomobil nomi"
                                                onChange={formik.handleChange}
                                            >
                                                {
                                                    car_model.map((item, index) => {
                                                        return <MenuItem key={index}
                                                                         value={item.id}>
                                                            {item.translations[i18next.language].name}
                                                        </MenuItem>
                                                    })
                                                }
                                            </Select>
                                        </FormControl>

                                    </div>

                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.car_number === "Required"}
                                            value={formik.values.car_number}
                                            onChange={formik.handleChange}
                                            name="car_number"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Avtomobil raqami" variant="outlined" className="textField"/>
                                    </div>
                                </div>
                                <div className="select-box ">
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Avtomobil rangi</InputLabel>
                                            <Select
                                                error={formik.errors.car_color === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                name="car_color"
                                                label="Avtomobil rangi"
                                                value={formik.values.car_color}
                                                onChange={formik.handleChange}
                                            >
                                                {
                                                    car_colors.map((item, index) => {
                                                        return <MenuItem key={index}
                                                                         value={item.id}>
                                                            {item.translations[i18next.language].name}
                                                        </MenuItem>
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <TextField
                                                id="seat_count"
                                                name="seat_count"
                                                label="O‘rindiqlar soni"
                                                type="number"
                                                value={formik.values.seat_count}
                                                onChange={formik.handleChange}
                                                error={formik.touched.seat_count && Boolean(formik.errors.seat_count)}
                                                helperText={formik.touched.seat_count && formik.errors.seat_count}
                                                inputProps={{min: 1}}
                                                fullWidth
                                                size="small"
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, width: "100%"}} className="selectMui" size="small">
                                            <InputLabel id="demo-multiple-checkbox-label">Xizmatlar</InputLabel>

                                            <Select
                                                error={formik.errors.extra_services === "Required"}
                                                name="extra_services"
                                                labelId="demo-multiple-checkbox-label"
                                                id="demo-multiple-checkbox"
                                                multiple
                                                value={formik.values.extra_services}
                                                onChange={(event) => {
                                                    const {value} = event.target;
                                                    formik.setFieldValue(
                                                        "extra_services",
                                                        typeof value === 'string' ? value.split(',') : value
                                                    );
                                                }}
                                                input={<OutlinedInput label="Xizmatlar"/>}
                                                renderValue={(selected) =>
                                                    selected
                                                        .map((id) => {
                                                            const item = extra_servicesList.find(i => i.id === id);
                                                            return item ? item.translations[i18next.language].name : '';
                                                        })
                                                        .join(', ')
                                                }
                                                MenuProps={MenuProps}
                                            >
                                                {extra_servicesList.map((item) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        <Checkbox
                                                            checked={formik.values.extra_services.includes(item.id)}
                                                        />
                                                        <ListItemText
                                                            primary={item.translations[i18next.language].name}
                                                        />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </div>

                            <div className="title-form">Asosan qaysi yo'nalishda harakat qilasiz:</div>
                            <div className="form-container">
                                <div className="select-box start">
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Qayerdan</InputLabel>
                                            <Select
                                                error={formik.errors.from_region === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.from_region}
                                                name="from_region"
                                                label="Qayerdan"
                                                onChange={formik.handleChange}
                                            >
                                                {
                                                    regions.map((item, index) => {
                                                        return <MenuItem key={index}
                                                                         value={item.id}>
                                                            {item.translations[i18next.language].name}
                                                        </MenuItem>
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Qayerga</InputLabel>
                                            <Select
                                                error={formik.errors.to_region === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.to_region}
                                                name="to_region"
                                                label="Qayerga"
                                                onChange={formik.handleChange}
                                            >
                                                {
                                                    regions.map((item, index) => {
                                                        return <MenuItem key={index}
                                                                         value={item.id}>
                                                            {item.translations[i18next.language].name}
                                                        </MenuItem>
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </div>

                            <div onClick={() => {
                                formik.handleSubmit()
                            }} className="add-btn">
                                <img src="./images/admin/checkmark.png" alt=""/>
                            </div>

                        </div>
                    )}

                    {modalShow.status === "driver-service" && (
                        <div className="driver-service">
                            <div className="cancel-btn">
                                <img onClick={() => setModalShow({status: "", show: false})}
                                     src="./images/admin/x.png"
                                     alt=""
                                />
                            </div>

                            <div className="bottom-side">
                                <div className="left-side">
                                    <div className="title">
                                        Yo'nalish
                                    </div>
                                    <div className="form-wrapper">
                                        {
                                            car_service.map((category, index) => (
                                                <label key={index}>
                                                    <input onChange={() => handleCheckboxChangeService(category.id)}
                                                           checked={car_serviceId.includes(category.id)} type="checkbox"
                                                           name="agree"/>
                                                    {category.translations[i18next.language].name}
                                                </label>
                                            ))
                                        }
                                    </div>
                                </div>
                                <div className="right-side">
                                    <div className="title">
                                        Tariflar
                                    </div>
                                    <div className="form-wrapper">
                                        {
                                            car_categories.map((category, index) => (
                                                <label key={index}>
                                                    <input onChange={() => handleCheckboxChangeCategory(category.id)}
                                                           checked={car_categoriesId.includes(category.id)}
                                                           type="checkbox"
                                                           name="agree"/>
                                                    {category.translations[i18next.language].name}
                                                </label>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                            <div onClick={verify} className="btn-success">
                                Tasdiqlash
                            </div>
                        </div>
                    )}

                    {modalShow.status === "car-photos" && (
                        <div className="car-photos">
                            <div className="cancel-btn">
                                <img onClick={() => setModalShow({status: "", show: false})}
                                     src="./images/admin/x.png"
                                     alt=""
                                />
                            </div>
                            <div className="title">
                                Avtomobil rasmlari
                            </div>
                            <div className="form-wrapper">
                                {base_car_images.map((image, index) => (
                                    <div key={index} className="photo">
                                        <img onClick={() => {
                                            setCurrentImage(image.image);
                                            setTimeout(() => setIsOpen(true), 100);
                                        }} src={image.image} alt={`car-${index}`}/>
                                        <div className="del-icon" onClick={() => handleDeleteImageBase(image.id)}>
                                            <img src="./images/admin/delete.png" alt="delete"/>
                                        </div>
                                    </div>
                                ))}
                                {car_images.map((image, index) => (
                                    <div key={index} className="photo">
                                        <img onClick={() => {
                                            setCurrentImage(image.preview);
                                            setTimeout(() => setIsOpen(true), 100);
                                        }} src={image.preview} alt={`car-${index}`}/>
                                        <div className="del-icon" onClick={() => handleDeleteImage(index)}>
                                            <img src="./images/admin/delete.png" alt="delete"/>
                                        </div>
                                    </div>
                                ))}
                                <div className="add-icon">
                                    <input onChange={handleAddImage} type="file"/>
                                    <img src="./images/admin/image.png" alt=""/>
                                </div>
                            </div>
                            <div onClick={addCar_Images} className="btn-success">
                                Tasdiqlash
                            </div>
                        </div>
                    )}

                    {modalShow.status === "car-docs" && (
                        <div className="car-docs">
                            <div className="cancel-btn">
                                <img onClick={() => setModalShow({status: "", show: false})}
                                     src="./images/admin/x.png"
                                     alt=""
                                />
                            </div>
                            <div className="title">
                                Xujjatlar rasmlari
                            </div>
                            <div className="form-wrapper">
                                {base_doc_images.map((image, index) => (
                                    <div key={index} className="photo">
                                        <img onClick={() => {
                                            setCurrentImage(image.image);
                                            setTimeout(() => setIsOpen(true), 100);
                                        }} src={image.image} alt={`car-${index}`}/>
                                        <div className="del-icon" onClick={() => handleDeleteImageDocsBase(image.id)}>
                                            <img src="./images/admin/delete.png" alt="delete"/>
                                        </div>
                                    </div>
                                ))}
                                {doc_images.map((image, index) => (
                                    <div key={index} className="photo">
                                        <img onClick={() => {
                                            setCurrentImage(image.preview);
                                            setTimeout(() => setIsOpen(true), 100);
                                        }} src={image.preview} alt={`car-${index}`}/>
                                        <div className="del-icon" onClick={() => handleDeleteImageDocs(index)}>
                                            <img src="./images/admin/delete.png" alt="delete"/>
                                        </div>
                                    </div>
                                ))}

                                <div className="add-icon">
                                    <input onChange={handleAddImageDoc} type="file"/>
                                    <img src="./images/admin/image.png" alt=""/>
                                </div>
                            </div>
                            <div onClick={addCar_Images_Docs} className="btn-success">
                                Tasdiqlash
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CSSTransition>

        {isOpen && (
            <Lightbox
                mainSrc={currentImage}
                onCloseRequest={() => setIsOpen(false)}
            />
        )}

        <div className="header">
            <div className="left-side">
                <div className="search-box">
                    <img src="./images/admin/search.png" alt=""/>
                    <input onChange={(e) => setGetSearchText(e.target.value)} placeholder="Telefon raqam kiriting"
                           type="text"/>
                </div>

                <div className="select-sides">
                    <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                        <InputLabel id="confirm-filter-label">Holat</InputLabel>
                        <Select
                            labelId="confirm-filter-label"
                            id="confirm-filter"
                            value={confirmFilter}
                            label="Holat"
                            onChange={(e) => setConfirmFilter(e.target.value)}
                        >
                            <MenuItem value="">Barchasi</MenuItem>
                            <MenuItem value="true">Tasdiqlangan</MenuItem>
                            <MenuItem value="false">Tasdiqlanmagan</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </div>

            <div onClick={() => {
                setModalShow({show: true, status: "add-driver"});
            }} className="add-driver-btn">
                Haydovchi qo'shish
            </div>
        </div>

        {loader ? <LoaderAdmin/> : <div className="table-wrapper">
            <table>
                <thead>
                <tr>
                    <th>№</th>
                    <th>Haydovchi haqida</th>
                    <th>Ro'yxatdan o'tgan sanasi</th>
                    <th>Yo'nalish</th>
                    <th>Mashina</th>
                    <th>Mashina raqami</th>
                    <th>Moshina ma'lumotlari</th>
                    <th>Moshina rasmlari</th>
                    <th>Dokument rasmlari</th>
                    <th>Tasdiqlash</th>
                    <th>Bloklash</th>
                    <th>O'chirish</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {productList}
                </tbody>
            </table>
        </div>}

        <div className="pagination">
            {driversList.length > 100 ? <ReactPaginate
                breakLabel="..."
                previousLabel={<img src="./images/admin/prev.png" alt=""/>}
                nextLabel={<img src="./images/admin/next.png" alt=""/>}
                pageCount={pageCount}
                onPageChange={changePage}
                containerClassName={"paginationBttns"}
                previousLinkClassName={"previousBttn"}
                nextLinkClassName={"nextBttn"}
                disabledCalassName={"paginationDisabled"}
                activeClassName={"paginationActive"}
            /> : ""}
        </div>
    </div>
}

export default Drivers