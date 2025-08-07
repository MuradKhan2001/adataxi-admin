import {useEffect, useRef, useState, useMemo, useContext} from "react";
import ReactPaginate from "react-paginate";
import "./style.scss"
import {MyContext} from "../../App/App";
import axios from "axios";

const Payment = () => {
    let value = useContext(MyContext);
    const ref = useRef(null);
    const [driversList, setDriversList] = useState([]);
    const [getSearchText, setGetSearchText] = useState("");
    const worksPage = 100;
    const [pageNumber, setPageNumber] = useState(0);
    const pagesVisited = pageNumber * worksPage;
    const [statistics, setStatistics] = useState([]);

    const pageCount = Math.ceil(driversList.length / worksPage);

    const changePage = ({selected}) => {
        setPageNumber(selected)

        setTimeout(() => {
            ref.current?.scrollIntoView({behavior: "smooth"});
        }, 500);
    };

    useEffect(() => {
        axios.get(`${value.url}/dashboard/payment/`, {
            headers: {
                "Authorization": `Token ${localStorage.getItem("token")}`
            }
        }).then((response) => {
            console.log(response.data);
            setDriversList(response.data);
        })
    }, []);

    const productList = driversList.slice(pagesVisited, pagesVisited + worksPage)
        .filter((item) => {
            const searchText = getSearchText.toString().toLowerCase().replace(/\s+/g, '').replace(/\+/g, '');
            const phoneNumber = item.balance_id.toString().toLowerCase().replace(/\s+/g, '').replace(/\+/g, '');
            return searchText === "" || phoneNumber.includes(searchText);
        }).map((item, index) => {
            return <tr key={index}>
                <td>{pagesVisited + index + 1}</td>

                <td>
                    {item.balance_id}
                </td>

                <td>
                    {item.amount}
                </td>

                <td>
                    {item.status}
                </td>
                <td>
                    {item.payment_operator}
                </td>

                <td>
                    {item.updated_at}
                </td>
                <td>
                    {item.reason}
                </td>
            </tr>
        });

    return <div className="payment-container">
        <div className="header">
            <div className="search-box">
                <img src="./images/admin/search.png" alt=""/>
                <input onChange={(e) => setGetSearchText(e.target.value)} placeholder="ID kiritng" type="text"/>
            </div>
            <div className="statisitcs">
            </div>
        </div>

        <div className="wrapper-table">
            <table>
                <thead>
                <tr>
                    <th>№</th>
                    <th>Balans id</th>
                    <th>Miqdor</th>
                    <th>Status</th>
                    <th>To'lov turi</th>
                    <th>To'lov sanasi</th>
                    <th>Sabab</th>
                </tr>

                </thead>

                <tbody>
                {productList}
                </tbody>
            </table>
        </div>

        <div className="pagination">
            <ReactPaginate
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
            />
        </div>
    </div>
}

export default Payment