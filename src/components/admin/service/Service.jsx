import {useCallback, useEffect, useRef, useState, useMemo, useContext} from "react";
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

const Service = () => {
    let value = useContext(MyContext);
    const [modalShow, setModalShow] = useState({show: false, status: false});
    const nodeRef = useRef(null);
    const [serviceList, setServiceList] = useState([]);
    const [editId, setEditId] = useState("");
    const ref = useRef(null);
    const [driversList, setDriversList] = useState([{}]);
    const worksPage = 100;
    const [pageNumber, setPageNumber] = useState(0);
    const pagesVisited = pageNumber * worksPage;

    const pageCount = Math.ceil(driversList.length / worksPage);

    const changePage = ({selected}) => {
        setPageNumber(selected)

        setTimeout(() => {
            ref.current?.scrollIntoView({behavior: "smooth"});
        }, 500);
    };

    const validate = (values) => {
        const errors = {};

        if (!values.service) {
            errors.service = "Required";
        }

        if (!values.includedCars) {
            errors.includedCars = "Required";
        }

        if (!values.start_price) {
            errors.start_price = "Required";
        }

        if (!values.price_per_km) {
            errors.price_per_km = "Required";
        }

        if (!values.price_per_min) {
            errors.price_per_min = "Required";
        }

        if (!values.wait_price_per_min) {
            errors.wait_price_per_min = "Required";
        }

        if (!values.free_wait_time) {
            errors.free_wait_time = "Required";
        }

        return errors;
    };

    const formik = useFormik({
        initialValues: {
            service: "",
            start_price: "",
            price_per_km: "",
            price_per_min: "",
            wait_price_per_min: "",
            free_wait_time: "",
            includedCars: ""
        },
        validate,
        onSubmit: (values) => {
            sendAllInfo()
        },
    });

    const sendAllInfo = () => {
        let allInfo = {
            service: formik.values.service,
            includedCars: formik.values.includedCars,
            start_price: formik.values.start_price,
            price_per_km: formik.values.price_per_km,
            price_per_min: formik.values.price_per_min,
            wait_price_per_min: formik.values.wait_price_per_min,
            free_wait_time: formik.values.free_wait_time
        }

        if (!editId) {
            axios.post(`${value.url}/dashboard/service/`, allInfo, {
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
            axios.put(`${value.url}/dashboard/service/${editId}/`, allInfo,
                {
                    headers: {
                        Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                }).then((response) => {
                getDrivers()
                formik.resetForm();
                setModalShow({status: "", show: false})
            })
        }
    }

    useEffect(() => {
        getDrivers()
    }, []);

    const delColor = (id) => {
        axios.delete(`${value.url}/dashboard/service/${id}/`, {
            headers: {
                Authorization: `Token ${localStorage.getItem("token")}`,
            },
        }).then((response) => {
            getDrivers()
        })
    }

    const getDrivers = () => {
        axios.get(`${value.url}/dashboard/service/`, {
            headers: {
                Authorization: `Token ${localStorage.getItem("token")}`,
            },
        }).then((response) => {
            setServiceList(response.data);
        })
    }

    const editValues = (service) => {
        setEditId(service.id)
        setModalShow({show: true, status: "edit-driver"});
        formik.setValues({
            service: service.service,
            start_price: service.start_price,
            price_per_km: service.price_per_km,
            price_per_min: service.price_per_min,
            wait_price_per_min: service.wait_price_per_min,
            free_wait_time: service.free_wait_time,
            includedCars: service.includedCars,
        });
    }

    const productList = serviceList.slice(pagesVisited, pagesVisited + worksPage).map((item, index) => {
        return <tr key={index}>
            <td>{index + 1}</td>
            <td>
                {item.service}
            </td>
            <td>
                {item.includedCars}
            </td>
            <td>{item.start_price}</td>
            <td>{item.price_per_km}</td>
            <td>{item.price_per_min}</td>
            <td>{item.wait_price_per_min}</td>
            <td>{item.free_wait_time}</td>
            <td>
                <div className="icon">
                    <img onClick={() => delColor(item.id)} src="./images/admin/delete.png" alt=""/>
                </div>
            </td>
            <td>
            </td>
            <div className="edit-icon">
                <img onClick={() => editValues(item)} src="./images/admin/edit-tools.png" alt=""/>
            </div>
        </tr>
    });

    return <div className="service-container">
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
                                    onClick={() => setModalShow({status: "", show: false})}
                                    src="./images/admin/x.png"
                                    alt=""
                                />
                            </div>

                            <div className="title">Tarif qo'shish</div>

                            <div className="title-form">Tarif ma'lumotlari:</div>

                            <div className="form-container">

                                <div className="select-box">
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Tarif nomi</InputLabel>
                                            <Select
                                                error={formik.errors.service === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.service}
                                                label="Tarif nomi"
                                                name="service"
                                                onChange={formik.handleChange}
                                            >
                                                <MenuItem value="standart">Standart</MenuItem>
                                                <MenuItem value="bussiness">Bussiness</MenuItem>
                                                <MenuItem value="comfort">Comfort</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.includedCars === "Required"}
                                            value={formik.values.includedCars}
                                            onChange={formik.handleChange}
                                            name="includedCars"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Tarifga kiruvchi mashinalar" variant="outlined"
                                            className="textField"/>
                                    </div>
                                </div>

                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.start_price === "Required"}
                                            value={formik.values.start_price}
                                            onChange={formik.handleChange}
                                            name="start_price"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Boshlash narxi" variant="outlined" className="textField"/>
                                    </div>
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.price_per_km === "Required"}
                                            value={formik.values.price_per_km}
                                            onChange={formik.handleChange}
                                            name="price_per_km"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Narx (km)" variant="outlined" className="textField"/>
                                    </div>
                                </div>

                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.price_per_min === "Required"}
                                            value={formik.values.price_per_min}
                                            onChange={formik.handleChange}
                                            name="price_per_min"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Narx (min)" variant="outlined" className="textField"/>
                                    </div>
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.wait_price_per_min === "Required"}
                                            value={formik.values.wait_price_per_min}
                                            onChange={formik.handleChange}
                                            name="wait_price_per_min"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Kutish uchun narx (min)" variant="outlined" className="textField"/>
                                    </div>
                                </div>

                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.free_wait_time === "Required"}
                                            value={formik.values.free_wait_time}
                                            onChange={formik.handleChange}
                                            name="free_wait_time"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Tekin kutish vaqti" variant="outlined" className="textField"/>
                                    </div>
                                </div>

                                <div onClick={sendAllInfo} className="add-btn">
                                    Tarif qo'shish
                                </div>

                            </div>
                        </div>
                    )}

                    {modalShow.status === "edit-driver" && (
                        <div className="edit-driver">
                            <div className="cancel-btn">
                                <img
                                    onClick={() => setModalShow({status: "", show: false})}
                                    src="./images/admin/x.png"
                                    alt=""
                                />
                            </div>

                            <div className="title">Tarifni tahrirlash</div>

                            <div className="title-form">Tarif ma'lumotlari:</div>

                            <div className="form-container">

                                <div className="select-box">
                                    <div className="select-sides">
                                        <FormControl sx={{m: 1, minWidth: "100%"}} size="small" className="selectMui">
                                            <InputLabel id="demo-select-large-label">Tarif nomi</InputLabel>
                                            <Select
                                                error={formik.errors.service === "Required"}
                                                labelid="demo-select-small-label"
                                                id="demo-select-small"
                                                value={formik.values.service}
                                                label="Tarif nomi"
                                                name="service"
                                                onChange={formik.handleChange}
                                            >
                                                <MenuItem value="standart">Standart</MenuItem>
                                                <MenuItem value="bussiness">Bussiness</MenuItem>
                                                <MenuItem value="comfort">Comfort</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.includedCars === "Required"}
                                            value={formik.values.includedCars}
                                            onChange={formik.handleChange}
                                            name="includedCars"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Tarifga kiruvchi mashinalar" variant="outlined"
                                            className="textField"/>
                                    </div>
                                </div>

                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.start_price === "Required"}
                                            value={formik.values.start_price}
                                            onChange={formik.handleChange}
                                            name="start_price"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Boshlash narxi" variant="outlined" className="textField"/>
                                    </div>
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.price_per_km === "Required"}
                                            value={formik.values.price_per_km}
                                            onChange={formik.handleChange}
                                            name="price_per_km"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Narx (km)" variant="outlined" className="textField"/>
                                    </div>
                                </div>

                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.price_per_min === "Required"}
                                            value={formik.values.price_per_min}
                                            onChange={formik.handleChange}
                                            name="price_per_min"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Narx (min)" variant="outlined" className="textField"/>
                                    </div>
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.wait_price_per_min === "Required"}
                                            value={formik.values.wait_price_per_min}
                                            onChange={formik.handleChange}
                                            name="wait_price_per_min"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Kutish uchun narx (min)" variant="outlined" className="textField"/>
                                    </div>
                                </div>

                                <div className="select-box">
                                    <div className="select-sides">
                                        <TextField
                                            error={formik.errors.free_wait_time === "Required"}
                                            value={formik.values.free_wait_time}
                                            onChange={formik.handleChange}
                                            name="free_wait_time"
                                            type="text"
                                            sx={{m: 1, minWidth: "100%"}} size="small" id="outlined-basic"
                                            label="Tekin kutish vaqti" variant="outlined" className="textField"/>
                                    </div>
                                </div>

                                <div onClick={sendAllInfo} className="add-btn">
                                    Tasdiqlash
                                </div>

                            </div>
                        </div>
                    )}

                </div>

            </div>
        </CSSTransition>

        <div className="header">
            <div onClick={() => {
                setModalShow({show: true, status: "add-driver"});
            }} className="add-driver-btn">
                Tarif qo'shish
            </div>
        </div>

        <table>
            <thead>
            <tr>
                <th>№</th>
                <th>Nomi</th>
                <th>Moshinalar</th>
                <th>Boshlash narxi</th>
                <th>Narx km</th>
                <th>Narx min</th>
                <th>Kutish narxi min</th>
                <th>Tekin kutish vaqti</th>
                <th>O'chirish</th>
                <th></th>
            </tr>
            </thead>

            <tbody>
            {productList}
            </tbody>
        </table>

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

export default Service