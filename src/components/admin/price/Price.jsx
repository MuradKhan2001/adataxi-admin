import {useEffect, useRef, useState, useContext} from "react";
import {CSSTransition} from "react-transition-group";
import {useFormik} from "formik";
import ReactPaginate from "react-paginate";
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
    const ref = useRef(null);
    const worksPage = 50;
    const [pageNumber, setPageNumber] = useState(0);
    const pagesVisited = pageNumber * worksPage;

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [category, setCategory] = useState("");
    const [service, setService] = useState("");

    const changePage = ({selected}) => {
        setPageNumber(selected)

        setTimeout(() => {
            ref.current?.scrollIntoView({behavior: "smooth"});
        }, 500);
    };

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
                getDrivers()
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
                getDrivers()
                setModalShow({status: "", show: false})
                formik.resetForm();
                setEditId("")
            })
        }
    }

    useEffect(() => {
        getDrivers()

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
            getDrivers()
        })
    }

    const getDrivers = () => {
        setLoader(true);

        axios.get(`${value.url}/dashboard/price/`, {
            headers: {
                Authorization: `Token ${localStorage.getItem("token")}`,
            },
        }).then((response) => {
            setServiceList(response.data);
            console.log(response.data);
        }).finally(() => {
            setLoader(false);
        });
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

    const filteredList = serviceList.filter(item => {
        const matchesService = service ? item.service.service_type === service : true;
        const matchesCategory = category ? item.category.category_type === category : true;
        const matchesFrom = from ? item.from_region.id === from : true;
        const matchesTo = to ? item.to_region.id === to : true;

        return matchesService && matchesCategory && matchesFrom && matchesTo;
    });

    const pageCount = Math.ceil(filteredList.length / worksPage);

    const productList = filteredList
        .slice(pagesVisited, pagesVisited + worksPage)
        .map((item, index) => (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.service.translations?.[i18next.language]?.name}</td>
                <td>{item.category.translations?.[i18next.language]?.name}</td>
                <td>{item.from_region.translations?.[i18next.language]?.name}</td>
                <td>{item.to_region.translations?.[i18next.language]?.name}</td>
                <td>{item.cost}</td>
                <td>
                    <div className="icon">
                        <img onClick={() => delColor(item.id)} src="./images/admin/delete.png" alt=""/>
                    </div>
                </td>
                <td></td>
                <div className="edit-icon">
                    <img onClick={() => editValues(item)} src="./images/admin/edit-tools.png" alt=""/>
                </div>
            </tr>
        ));

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
                                    onClick={() =>{
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
                            labelid="demo-select-small-label"
                            id="demo-select-small"
                            value={to}
                            label="Qayerga"
                            name="to"
                            onChange={(e) => setTo(e.target.value)}
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

            <div onClick={() => {
                setModalShow({show: true, status: "add-driver"});
            }} className="add-driver-btn">
                Narx qo'shish
            </div>
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
            {serviceList.length > 50 ? <ReactPaginate
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

export default Price