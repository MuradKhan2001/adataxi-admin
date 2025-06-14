import {useEffect, useRef, useState, useMemo, useContext} from "react";
import ReactPaginate from "react-paginate";
import "./style.scss"
import {CSSTransition} from "react-transition-group";
import axios from "axios";
import {MyContext} from "../../App/App";
import i18next from "i18next";
import LoaderAdmin from "../loader-admin/LoaderAdmin";

const Orders = () => {
    let value = useContext(MyContext);
    const [modalShow, setModalShow] = useState({show: false, status: false});
    const nodeRef = useRef(null);
    const [loader, setLoader] = useState(false);

    const [links, setLinks] = useState({});
    const [Pages, setPages] = useState([]);
    const [activeItem, setActiveItem] = useState(1);

    const [driversList, setDriversList] = useState([]);
    const [statistics, setStatistics] = useState([]);
    const [information, setInformation] = useState([]);
    const [tabs, setTabs] = useState("active");

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


    useEffect(() => {
        getList();

    }, []);

    // const filteredList = driversList.filter(item => item.status === tabs);

    const getList = (url = null, page = 1) => {
        setLoader(true);
        const main = url ? url : `${value.url}/dashboard/order/?page=${page}`;
        axios.get(main, {
            headers: {
                "Authorization": `Token ${localStorage.getItem("token")}`
            }
        }).then((response) => {
            setDriversList(response.data.results);
            setLinks(response.data.links);
            setPages(response.data.links.pages);
            setActiveItem(page);
        }).finally(() => {
            setLoader(false);
        });

    };

    return <div className="orders-container">
        <CSSTransition
            in={modalShow.show}
            nodeRef={nodeRef}
            timeout={300}
            classNames="alert"
            unmountOnExit
        >
            <div className="modal-sloy">
                <div ref={nodeRef} className="modal-card">
                    {modalShow.status === "car-information" && (
                        <div className="car-information">
                            <div className="cancel-btn">
                                <img
                                    onClick={() => setModalShow({status: "", show: false})}
                                    src="./images/admin/x.png"
                                    alt=""
                                />
                            </div>
                            <div className="title">
                                Qo'shimcha malumotlar
                            </div>
                            <div className="information">
                                <div className="info">
                                    <div className="title">Moshina modeli:</div>
                                    <div className="text">Chevrolet</div>
                                </div>
                            </div>
                        </div>
                    )}
                    {modalShow.status === "change-status" && (
                        <div className="change-status">
                            <div className="cancel-btn">
                                <img
                                    onClick={() => setModalShow({status: "", show: false})}
                                    src="./images/admin/x.png"
                                    alt=""
                                />
                            </div>
                            <div className="title">
                                Buyurtma bosqichini tanlang
                            </div>
                            <div className="form-box">
                                <select name="" id="">
                                    <option value=""></option>
                                    <option value="">Mijozni olish</option>
                                    <option value="">Yakunlash</option>
                                    <option value="">Bekor qilish</option>
                                </select>
                            </div>
                            <div className="success-btn">
                                Tasdiqlash
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CSSTransition>

        <div className="header">
            <div className="search-box">

            </div>

            <div className="statisitcs">
                {/*{statistics.length > 0 && statistics.map((item, index) => (*/}
                {/*    <div onClick={() => setTabs(item.status)} key={index}*/}
                {/*         className={`statistic-box ${tabs === item.status ? "active" : ""}`}>*/}
                {/*        <div className="name">*/}
                {/*            {item.status === "active" && "Faol buyurtmalar"}*/}
                {/*            {item.status === "inactive" && "Jarayonda"}*/}
                {/*            {item.status === "assigned" && "Tugallangan"}*/}
                {/*            {item.status === "rejected" && "Bekor qilingan"}*/}

                {/*        </div>*/}
                {/*        <div className="num">{item.count}</div>*/}
                {/*    </div>*/}
                {/*))}*/}
            </div>
        </div>

        <div className="wrapper-table">
            {
                loader ? <LoaderAdmin/> :
                    <table>
                        <thead>
                        <tr>
                            <th>№</th>
                            <th>Mijoz</th>
                            <th>Haydovchi</th>
                            <th>Buyurtma berilgan sana</th>
                            <th>Tarif</th>
                            <th>Buyurtma narxi</th>
                            <th>Batafsil ma'lumotlar</th>
                            <th>Statusni ozgartirish</th>
                        </tr>
                        </thead>

                        <tbody>
                        {driversList.map((item, index) => {
                            return <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    <div className="text-driver">
                                        <div className="name">
                                            {item.client.first_name}
                                            {item.client.last_name}
                                        </div>
                                        <div className="phone">
                                            {item.client.phone}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="text-driver">
                                        {item.driver && <>
                                            <div className="name">
                                                {item.driver.first_name}
                                                {item.driver.last_name}
                                            </div>
                                            <div className="phone">
                                                {item.driver.phone}
                                            </div>
                                        </>}
                                    </div>
                                </td>
                                <td>
                                    {item.created_at}
                                </td>
                                <td>
                                    {item.car_category.translations[i18next.language].name}
                                </td>
                                <td>
                                    {item.price} so'm
                                </td>
                                <td>
                                    <div className="icon">
                                        <img onClick={() => {
                                            setInformation(item)
                                            setModalShow({show: true, status: "car-information"});
                                        }} src="./images/admin/document.png" alt=""/>
                                    </div>
                                </td>
                                <td>
                                    <div className="icon">
                                        <img onClick={() => {
                                            setModalShow({show: true, status: "change-status"});
                                        }} src="./images/admin/status.png" alt=""/>
                                    </div>
                                </td>
                            </tr>
                        })}
                        </tbody>
                    </table>
            }

        </div>

        <div className="pagination">
            <div className="prev">
                <img onClick={() => {
                    if (activeItem > 1) {
                        getList(links.previous, activeItem - 1);
                    }
                }} src="./images/admin/prev.png" alt="Prev"/>
            </div>

            {visiblePages.map((item, index) => (
                <div key={index}
                     onClick={() => {
                         if (item !== "...") {
                             getList(null, item);
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

export default Orders