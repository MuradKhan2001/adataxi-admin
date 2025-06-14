import React, {useMemo, useState, createContext} from "react";
import {Routes, Route} from "react-router-dom";
import {adminRoutes, publicRoutes} from "../../rootes";
import NotFound from "../notFound/NotFound";

export const MyContext = createContext();

function App() {
    const [url, setUrl] = useState('https://api.adataxi.uz');

    const admin = useMemo(() => localStorage.getItem('admin'), []);

    const routes = useMemo(() => {
        if (admin) return adminRoutes;
        return publicRoutes
    }, [admin]);

    return (
        <>
            <MyContext.Provider value={{
                url
            }}>
                <Routes>
                    {
                        routes.map((route, index) => (
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