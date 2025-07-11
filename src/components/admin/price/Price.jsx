import {useEffect, useRef, useState, useContext} from "react";
import {CSSTransition} from "react-transition-group";
import {useFormik} from "formik";
import {
    TextField,
    MenuItem,
    InputLabel,
    FormControl,
    Select
} from "@mui/material";
import "./style.scss"
import axios from "axios";
import {MyContext} from "../../App/App";
import i18next from "i18next";
import LoaderAdmin from "../loader-admin/LoaderAdmin";

const Price = () => {
    const [loader, setLoader] = useState(false);
    let value = useContext(MyContext);
    const [modalShow, setModalShow] = useState({show: false, status: false});
    const nodeRef = useRef(null);
    const [direction, setDirection] = useState([])
    const [tarif, setTarif] = useState([]);
    const [regions, setRegions] = useState([]);
    const [serviceList, setServiceList] = useState([]);
    const [editId, setEditId] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [category, setCategory] = useState("");
    const [service, setService] = useState("");

    const validate = (values) => {
        const errors = {};

        if (!values.car_service) {
            errors.car_service = "Required";
        }

        if (!values.car_category) {
            errors.car_category = "Required";
        }
        if (!values.from_region) {
            errors.from_region = "Required";
        }
        if (!values.to_region) {
            errors.to_region = "Required";
        }
        if (!values.price) {
            errors.price = "Required";
        }

        return errors;
    };
    const formik = useFormik({
        initialValues: {
            car_service: "",
            car_category: "",
            from_region: "",
            to_region: "",
            price: "",
        },
        validate,
        onSubmit: (values) => {
            sendAllInfo()
        },
    });

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

    const getList = (url = null, page = 1) => {
        setLoader(true);
        const main = url ? url : `${value.url}/dashboard/price/?page=${page}`;
        axios.get(main, {
            headers: {
                "Authorization": `Token ${localStorage.getItem("token")}`
            }
        }).then((response) => {
            setServiceList(response.data.results);
            setLinks(response.data.links);
            setPages(response.data.links.pages);
            setActiveItem(page);
        }).finally(() => {
            setLoader(false);
        });

    };

    const sendAllInfo = () => {
        let allInfo = {
            service: formik.values.car_service,
            category: formik.values.car_category,
            from_region: formik.values.from_region,
            to_region: formik.values.to_region,
            cost: Number(formik.values.price),
        }

        if (!editId) {
            axios.post(`${value.url}/dashboard/price/`, allInfo, {
                headers: {
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
            }).then((response) => {
                getList(null, activeItem)
                setModalShow({status: "", show: false})
                formik.resetForm();
            })
        }

        if (editId) {
            axios.put(`${value.url}/dashboard/price/${editId}/`, allInfo,
                {
                    headers: {
                        Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                }).then((response) => {
                getList(null, activeItem)
                setModalShow({status: "", show: false})
                formik.resetForm();
                setEditId("")
            })
        }
    }

    useEffect(() => {
        getList()

        axios.get(`${value.url}/dashboard/region/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setRegions(response.data);
        })

        axios.get(`${value.url}/dashboard/carcategory/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setTarif(response.data);
        })

        axios.get(`${value.url}/dashboard/carservice/`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setDirection(response.data);
        })

    }, []);

    const delColor = (id) => {
        axios.delete(`${value.url}/dashboard/price/${id}/`, {
            headers: {
                Authorization: `Token ${localStorage.getItem("token")}`,
            },
        }).then((response) => {
            getList(null, activeItem)
        })
    }

    const editValues = (service) => {
        setEditId(service.id)
        setModalShow({show: true, status: "edit-driver"});
        formik.setValues({
            car_service: service.service.id,
            car_category: service.category.id,
            from_region: service.from_region.id,
            to_region: service.to_region.id,
            price: service.cost,
        });
    }

    const filterData = () => {
        setLoader(true);
        let page = 1
        axios.get(`${value.url}/dashboard/price/?service=${service}&category=${category}&from_region=${from}&to_region=${to}`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setServiceList(response.data.results);
            setLinks(response.data.links);
            setPages(response.data.links.pages);
            setActiveItem(page);
        }).finally(() => {
            setLoader(false);
        });
    }

    return <div className="price-container">
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
                                        formik.resetForm()
                                    }}
                                    src="./images/admin/x.png"
                                    alt=""
                                />
                            </div>

                            <div className="title">Narx qo'shish</div>

                            <div className="form-container">

                                <div className="select-box">
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Yo'nalish</InputLabel>
                                            <Select
                                                error={formik.errors.car_service === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.car_service}
                                                label="Yo'nalish"
                                                name="car_service"
                                                onChange={formik.handleChange}
                                            >
                                                {direction.map((item, index) => (
                                                    <MenuItem key={index} value={item.id}>
                                                        {item.translations[i18next.language].name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Tarif</InputLabel>
                                            <Select
                                                error={formik.errors.car_category === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.car_category}
                                                label="Tarif"
                                                name="car_category"
                                                onChange={formik.handleChange}
                                            >
                                                {tarif.map((item, index) => (
                                                    <MenuItem key={index} value={item.id}>
                                                        {item.translations[i18next.language].name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>

                                <div className="select-box">
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Qayerdan</InputLabel>
                                            <Select
                                                error={formik.errors.from_region === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.from_region}
                                                label="Qayerdan"
                                                name="from_region"
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
                                                label="Qayerga"
                                                name="to_region"
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

                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.price === "Required"}
                                            value={formik.values.price}
                                            onChange={formik.handleChange}
                                            name="price"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Narxi" variant="outlined" className="textField"/>
                                    </div>
                                </div>

                                <div onClick={sendAllInfo} className="add-btn">
                                    Narx qo'shish
                                </div>
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
                                        setEditId("")
                                    }}
                                    src="./images/admin/x.png"
                                    alt=""
                                />
                            </div>

                            <div className="title">Narxni tahrirlash</div>

                            <div className="form-container">

                                <div className="select-box">
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Yo'nalish</InputLabel>
                                            <Select
                                                error={formik.errors.car_service === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.car_service}
                                                label="Yo'nalish"
                                                name="car_service"
                                                onChange={formik.handleChange}
                                            >
                                                {direction.map((item, index) => (
                                                    <MenuItem key={index} value={item.id}>
                                                        {item.translations[i18next.language].name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Tarif</InputLabel>
                                            <Select
                                                error={formik.errors.car_category === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.car_category}
                                                label="Tarif"
                                                name="car_category"
                                                onChange={formik.handleChange}
                                            >
                                                {tarif.map((item, index) => (
                                                    <MenuItem key={index} value={item.id}>
                                                        {item.translations[i18next.language].name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>

                                <div className="select-box">
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Qayerdan</InputLabel>
                                            <Select
                                                error={formik.errors.from_region === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.from_region}
                                                label="Qayerdan"
                                                name="from_region"
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
                                                label="Qayerga"
                                                name="to_region"
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

                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.price === "Required"}
                                            value={formik.values.price}
                                            onChange={formik.handleChange}
                                            name="price"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Narxi" variant="outlined" className="textField"/>
                                    </div>
                                </div>

                                <div onClick={sendAllInfo} className="add-btn">
                                    Saqlash
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </CSSTransition>

        <div className="header">
            <div className="filter-form">
                <div className="select-sides">
                    <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                        <InputLabel id="demo-select-large-label">Yo'nalish</InputLabel>
                        <Select
                            labelid="demo-select-small-label"
                            id="demo-select-small"
                            value={service}
                            label="Qayerga"
                            name="service"
                            onChange={(e) => setService(e.target.value)}
                        >
                            <MenuItem value="">
                                -- Barchasi --
                            </MenuItem>

                            {direction.map((item, index) => (
                                <MenuItem key={index} value={item.service_type}>
                                    {item.translations[i18next.language].name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                <div className="select-sides">
                    <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                        <InputLabel id="demo-select-large-label">Tarif</InputLabel>
                        <Select
                            labelid="demo-select-small-label"
                            id="demo-select-small"
                            value={category}
                            label="Tarif"
                            name="car_category"
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <MenuItem value="">
                                -- Barchasi --
                            </MenuItem>
                            {tarif.map((item, index) => (
                                <MenuItem key={index} value={item.category_type}>
                                    {item.translations[i18next.language].name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                <div className="select-sides">
                    <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                        <InputLabel id="demo-select-large-label">Qayerdan</InputLabel>
                        <Select
                            labelid="demo-select-small-label"
                            id="demo-select-small"
                            value={from}
                            label="Qayerdan"
                            name="from"
                            onChange={(e) => setFrom(e.target.value)}
                        >
                            <MenuItem value="">
                                -- Barchasi --
                            </MenuItem>
                            {
                                regions.map((item, index) => {

                                    return <MenuItem key={index}
                                                     value={item.code}>
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
                            labelid="demo-select-small-label"
                            id="demo-select-small"
                            value={to}
                            label="Qayerga"
                            name="to"
                            onChange={(e) => setTo(e.target.value)}
                        >
                            <MenuItem value="">
                                -- Barchasi --
                            </MenuItem>
                            {
                                regions.map((item, index) => {
                                    return <MenuItem key={index}
                                                     value={item.code}>
                                        {item.translations[i18next.language].name}
                                    </MenuItem>
                                })
                            }
                        </Select>
                    </FormControl>
                </div>

                <div className="update-driver">
                    <img onClick={filterData} src="./images/admin/panel.png" alt="changes"/>
                </div>
            </div>

            {/*<div onClick={() => {*/}
            {/*    setModalShow({show: true, status: "add-driver"});*/}
            {/*}} className="add-driver-btn">*/}
            {/*    Narx qo'shish*/}
            {/*</div>*/}
        </div>

        {loader ? <LoaderAdmin/> : <div className="table-wrapper">
            <table>
                <thead>
                <tr>
                    <th>№</th>
                    <th>Yo'nalish</th>
                    <th>Tarif</th>
                    <th>Qayerdan</th>
                    <th>Qayerga</th>
                    <th>Narx</th>
                    {/*<th>O'chirish</th>*/}
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {serviceList.map((item, index) => {
                    return <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.service.translations?.[i18next.language]?.name}</td>
                        <td>{item.category.translations?.[i18next.language]?.name}</td>
                        <td>{item.from_region.translations?.[i18next.language]?.name}</td>
                        <td>{item.to_region.translations?.[i18next.language]?.name}</td>
                        <td>{item.cost}</td>
                        {/*<td>*/}
                        {/*    <div className="icon">*/}
                        {/*        <img onClick={() => delColor(item.id)} src="./images/admin/delete.png" alt=""/>*/}
                        {/*    </div>*/}
                        {/*</td>*/}
                        <td></td>
                        <div className="edit-icon">
                            <img onClick={() => editValues(item)} src="./images/admin/edit-tools.png" alt=""/>
                        </div>
                    </tr>
                })}
                </tbody>
            </table>
        </div>}


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

export default Price