import {useEffect, useRef, useState, useContext} from "react";
import "./style.scss"
import {CSSTransition} from "react-transition-group";
import axios from "axios";
import {MyContext} from "../../App/App";
import i18next from "i18next";
import LoaderAdmin from "../loader-admin/LoaderAdmin";
import {useTranslation} from "react-i18next";

const Orders = () => {
    const {t} = useTranslation();
    let value = useContext(MyContext);
    const [modalShow, setModalShow] = useState({show: false, status: false});
    const nodeRef = useRef(null);
    const [loader, setLoader] = useState(false);
    const [orderStatus, setOrderStatus] = useState();
    const [orderId, setOrderId] = useState("");
    const [reasonList, setReasonList] = useState([]);
    const [reason, setReason] = useState("");
    const [driversList, setDriversList] = useState([]);
    const [statistics, setStatistics] = useState([]);
    const [information, setInformation] = useState([]);
    const [client, setClient] = useState("");
    const [driver, setDriver] = useState("");
    const [status, setStatus] = useState("");
    const [direction, setDirection] = useState("");
    const [tarif, setTarif] = useState("");
    const [date, setDate] = useState("");

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

    useEffect(() => {
        getList();

        axios.get(`${value.url}/dashboard/rejectreson/?admin=true`, {
            headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
        }).then((response) => {
            setReasonList(response.data);
        })

        axios.get(`${value.url}/dashboard/order-stats/`, {
            headers: {
                "Authorization": `Token ${localStorage.getItem("token")}`
            }
        }).then((response) => {
            setStatistics(response.data);
        })
    }, []);

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

    const changeStatus = () => {
        axios.post(`${value.url}/dashboard/order/reject-order/`, {
                order_id: orderId,
                reason_id: reason,
                status: orderStatus
            },
            {
                headers: {"Authorization": `Token ${localStorage.getItem("token")}`}
            })
            .then((response) => {
                getList()
                setModalShow({status: "", show: false})
            })
    }

    const filterData = () => {
        setLoader(true);
        let page = 1
        axios.get(`${value.url}/dashboard/order/?client_phone=${client}&driver_phone=${driver}&service_type=${direction}&category_type=${tarif}&created_date=${date}&status=${status}`, {
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
                            {console.log(information)}
                            <div className="information">
                                <div className="info">
                                    <div className="title">Buyurtma raqami:</div>
                                    <div
                                        className="text">{information.id}</div>
                                </div>
                                <div className="info">
                                    <div className="title">Yo'nalish:</div>
                                    <div
                                        className="text">{information.car_service.translations[i18next.language].name}</div>
                                </div>
                                <div className="info">
                                    <div className="title">Masofa:</div>
                                    <div
                                        className="text">{information.distance}</div>
                                </div>
                                {
                                    information.end_date && <div className="info">
                                        <div className="title">Tugatilgan sana:</div>
                                        <div className="text">{information.end_date}</div>
                                    </div>
                                }

                                <div className="info">
                                    <div className="title">Olib ketish manzili:</div>
                                    <div
                                        className="text">{information.pick_up_locations && information.pick_up_locations.map((item, index) => {
                                        return <div key={index}>{index + 1}- manzil : {item.address} <br/></div>

                                    })}</div>
                                </div>

                                <div className="info">
                                    <div className="title">Yekazish manzili:</div>
                                    <div
                                        className="text">{information.drop_off_locations && information.drop_off_locations.map((item, index) => {
                                        return <div key={index}> {index + 1}- manzil : {item.address} <br/></div>

                                    })}</div>
                                </div>
                                {
                                    information.extra_services.length > 0 &&
                                    <div className="info">
                                        <div className="title">Qo'shimcha xizmatlar:</div>

                                        <div
                                            className="text">{information.extra_services && information.extra_services.map((item, index) => {
                                            return <div key={index}>{item.translations[i18next.language].name}</div>

                                        })}</div>
                                    </div>
                                }

                                <div className="info">
                                    <div className="title">Yo'lovchilar soni:</div>
                                    <div
                                        className="text">{information.passanger_count}</div>
                                </div>

                                <div className="info">
                                    <div className="title">To'lov turi:</div>
                                    <div className="text">
                                        {information.payment_type === "cash" && "Naqt"}
                                        {information.payment_type === "card" && "Karta"}
                                    </div>

                                </div>

                                <div className="info">
                                    <div className="title">Olib ketish sanasi:</div>
                                    <div className="text">
                                        {information.pick_up_date}
                                    </div>

                                </div>

                                {information.car_service.service_type === "postal" && <div className="info">
                                    <div className="title">To'lovni kim qiladi:</div>
                                    <div
                                        className="text">
                                        {information.payer === "sender" && "Yuboruvchi"}
                                        {information.payer === "receiver" && "Qabul qilovchi"}
                                    </div>
                                </div>}

                                {information.car_service.service_type === "postal" && <div className="info">
                                    <div className="title">Qabul qlivchi telefon raqami:</div>
                                    <div
                                        className="text">
                                        {information.receiver_phone}
                                    </div>
                                </div>}

                                {information.car_service.service_type === "postal" && <div className="info">
                                    <div className="title">Yuboruvchi telefon raqami:</div>
                                    <div
                                        className="text">
                                        {information.sender_phone}
                                    </div>
                                </div>}

                                {information.status === "rejected"
                                    && <div className="info">
                                        <div className="title">Bekor qilish sababi:</div>
                                        <div
                                            className="text">
                                            {information.rejected_reason.translations[i18next.language].name}
                                        </div>
                                    </div>}

                                {information.comment_to_driver
                                    && <div className="info">
                                        <div className="title">Haydovchi uchun izoh:</div>
                                        <div
                                            className="text">
                                            {information.comment_to_driver}
                                        </div>
                                    </div>}


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
                                <select onChange={(e) => setOrderStatus(e.target.value)} name="status">
                                    <option value=""></option>
                                    <option value="arrived">Mijozga kelish</option>
                                    <option value="picked">Mijozni olish</option>
                                    <option value="started">Boshlash</option>
                                    <option value="finished">Yakunlash</option>
                                    <option value="rejected">Bekor qilish</option>
                                </select>

                                {orderStatus === "rejected" &&
                                    <>
                                        <label htmlFor="reason">Bekor qilish sababini tanlang:</label>
                                        <select onChange={(e) => setReason(e.target.value)} name="status" id="reason">
                                            <option value=""></option>
                                            {reasonList.map((item, index) => (
                                                <option key={index} value={item.id}>
                                                    {item.translations[i18next.language].name}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                }
                            </div>
                            <div onClick={changeStatus} className="success-btn">
                                Tasdiqlash
                            </div>
                        </div>
                    )}

                    {modalShow.status === "statistic" && (
                        <div className="statistic">
                            <div className="cancel-btn">
                                <img
                                    onClick={() => setModalShow({status: "", show: false})}
                                    src="./images/admin/x.png"
                                    alt=""
                                />
                            </div>
                            <div className="title">
                                Buyurtmalar statistikasi
                            </div>
                            <div className="form-box">
                                <div className="statistic-box">
                                    <div className="name">
                                        Umumiy:
                                    </div>

                                    <div className="num">
                                        {statistics.total_orders}
                                    </div>
                                </div>
                                <div className="statistic-box">
                                    <div className="name">
                                        Yakunlangan:
                                    </div>

                                    <div className="num">
                                        {statistics.finished_orders}
                                    </div>
                                </div>
                                <div className="statistic-box">
                                    <div className="name">
                                        Faol:
                                    </div>

                                    <div className="num">
                                        {statistics.active_orders}
                                    </div>
                                </div>
                                <div className="statistic-box">
                                    <div className="name">
                                        Bekor qilingan:
                                    </div>

                                    <div className="num">
                                        {statistics.rejected_orders}
                                    </div>
                                </div>
                                <div className="statistic-box">
                                    <div className="name">
                                        Bugungi buyurtmalar soni:
                                    </div>

                                    <div className="num">
                                        {statistics.orders_today}
                                    </div>
                                </div>
                                <div className="statistic-box">
                                    <div className="name">
                                        Joriy oydagi buyurtmalar soni:
                                    </div>

                                    <div className="num">
                                        {statistics.orders_this_month}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CSSTransition>

        <div className="header">
            <div className="left-side">
                <div className="search-box">
                    <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Mijoz tel raqami"
                           type="text"/>
                </div>
                <div className="search-box">
                    <input value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="Haydovchi tel raqami"
                           type="text"/>
                </div>
                <div className="search-box">
                    <label htmlFor="direction">Yo'nalish:</label>
                    <select value={direction} onChange={(e) => setDirection(e.target.value)} name="direction"
                            id="direction">
                        <option value=""></option>
                        <option value="regional">
                            Taxi
                        </option>
                        <option value="postal">
                            Jo'natma
                        </option>
                        <option value="minivan">
                            Miniven
                        </option>
                        <option value="travel">
                            Sayohat
                        </option>
                    </select>
                </div>
                <div className="search-box">
                    <label htmlFor="tarif">Tarif:</label>
                    <select value={tarif} onChange={(e) => setTarif(e.target.value)} name="tarif" id="tarif">
                        <option value=""></option>
                        <option value="standart">
                            Standart
                        </option>
                        <option value="comfort">
                            Komfort
                        </option>
                        <option value="business">
                            Biznes
                        </option>
                        <option value="delivery">
                            Jo'natma
                        </option>
                    </select>
                </div>
                <div className="search-box">
                    <label htmlFor="status">Status:</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} name="status" id="status">
                        <option value=""></option>
                        <option value="rejected">
                            Bekor qilingan
                        </option>
                        <option value="started">
                            Boshlangan
                        </option>
                        <option value="arrived">
                            Mijozga keldi
                        </option>
                        <option value="picked">
                            Mijozni oldi
                        </option>
                        <option value="finished">
                            Yakunlangan
                        </option>
                        <option value="active">
                            Faol
                        </option>
                    </select>
                </div>
                <div className="search-box">
                    <label htmlFor="date">Sana:</label>
                    <input value={date} onChange={(e) => setDate(e.target.value)} type="date"/>
                </div>
                <div onClick={filterData} className="filter-btn">
                    <img src="./images/admin/panel.png" alt=""/>
                </div>
            </div>
        </div>

        <div className="header">
            <div className="left-side">

            </div>
            <div onClick={() => setModalShow({show: true, status: "statistic"})} className="statisitcs">
                Statistika
                <img src="./images/data-management.png" alt="a"/>
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
                                            {item.client?.first_name} &nbsp;
                                            {item.client?.last_name}
                                        </div>
                                        <div className="phone">
                                            {item.client?.phone}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="text-driver">
                                        {item.driver && <>
                                            <div className="name">
                                                {item.driver.first_name} &nbsp;
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

                                    {item.status === "rejected" ? <div className="status-red">
                                        Bekor qilingan
                                    </div> : item.status === "finished" ? <div className="status-green">
                                            Yakunlangan
                                        </div> :
                                        <div className="icon">
                                            <div className="status-blue">
                                                {item.status === "active" && "Faol"}
                                                {item.status === "started" && "Boshlandi"}
                                                {item.status === "arrived" && "Mijozga keldi"}
                                                {item.status === "picked" && "Mijozni oldi"}
                                            </div>
                                            <img onClick={() => {
                                                setOrderId(item.id)
                                                setModalShow({show: true, status: "change-status"});
                                            }} className="status-icon" src="./images/admin/status.png" alt=""/>
                                        </div>}

                                </td>
                            </tr>
                        })}
                        </tbody>
                    </table>
            }

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

export default Orders