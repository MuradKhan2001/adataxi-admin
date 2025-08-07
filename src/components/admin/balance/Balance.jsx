import {useEffect, useRef, useState, useMemo, useContext} from "react";
import ReactPaginate from "react-paginate";
import "./style.scss"
import axios from "axios";
import {MyContext} from "../../App/App";

const Balance = () => {
    const [getSearchText, setGetSearchText] = useState("");
    let value = useContext(MyContext);
    const ref = useRef(null);
    const [driversList, setDriversList] = useState([]);
    const worksPage = 100;
    const [pageNumber, setPageNumber] = useState(0);
    const pagesVisited = pageNumber * worksPage;

    useEffect(() => {
        axios.get(`${value.url}/dashboard/balance/`, {
            headers: {
                Authorization: `Token ${localStorage.getItem("token")}`,
            },
        }).then((response) => {
            setDriversList(response.data);
        })
    }, []);

    const productList = driversList.slice(pagesVisited, pagesVisited + worksPage)
        .filter((item) => {
            const searchText = getSearchText.toString().toLowerCase().replace(/\s+/g, '').replace(/\+/g, '');
            const phoneNumber = item.driver_phone?.toString().toLowerCase().replace(/\s+/g, '').replace(/\+/g, '');
            return searchText === "" || phoneNumber.includes(searchText);
        }).map((item, index) => {
            return <tr key={index}>
                <td>{pagesVisited + index + 1}</td>
                <td className="driver-wrapper">
                    <div className="text-driver">
                        <div
                            className="name">{item.driver_name}</div>
                        <div className="phone">
                            {item.driver_phone}
                        </div>
                    </div>
                </td>
                <td>
                    {item.id_number}
                </td>
                <td>
                    {item.fund}
                </td>
            </tr>
        });

    const pageCount = Math.ceil(driversList.length / worksPage);

    const changePage = ({selected}) => {
        setPageNumber(selected)

        setTimeout(() => {
            ref.current?.scrollIntoView({behavior: "smooth"});
        }, 500);
    };

    return <div className="balance-container">
        <div className="header">
            <div className="search-box">
                <img src="./images/admin/search.png" alt=""/>
                <input onChange={(e) => setGetSearchText(e.target.value)} placeholder="Telefon raqam kiriting"
                       type="text"/>
            </div>
        </div>

        <div className="table-wrapper">
            <table>
                <thead>
                <tr>
                    <th>№</th>
                    <th>Haydovchi</th>
                    <th>Id raqam</th>
                    <th>Narx</th>
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

export default Balance