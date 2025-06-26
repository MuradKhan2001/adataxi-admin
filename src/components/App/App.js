import React, {useState, createContext} from "react";
import {Routes, Route} from "react-router-dom";
import {adminRoutes} from "../../rootes";
import NotFound from "../notFound/NotFound";

export const MyContext = createContext();

function App() {
    const [url, setUrl] = useState('https://api.adataxi.uz');

    return (
        <>
            <MyContext.Provider value={{
                url
            }}>
                <Routes>
                    {
                        adminRoutes.map((route, index) => (
                            <Route key={index} {...route} />
                        ))
                    }
                    <Route path={'*'} element={<NotFound/>}/>
                </Routes>

            </MyContext.Provider>
        </>
    );
}

export default App;