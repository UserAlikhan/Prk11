import React from "react";
import { Layout, Typography, Space } from "antd";
import { Navbar } from "./components";
import { Link } from "react-router-dom";
import './App.css';

const LayoutWithOutNavbar = ({ children, hideNavbar, hideFooter }) => {
    return (
        <div>
            {!hideNavbar && (
                <div className="navbar">
                    <Navbar/>
                </div>
            )}
            {!hideNavbar ? (
                <div className="routes" style={{marginLeft: '15%'}}>
                    {children}
                </div>
            ) : (
                <div className="routes">
                    {children}
                </div>
            )}
            
            {!hideFooter && (
                <div className="footer" level={5}>
                    <Typography.Title style={{ color: 'white', textAlign: 'center', fontSize: '28px' }}>
                        Cryptoverse <br />
                        All rights reserved
                    </Typography.Title>
                    <Space>
                        <Link to='/'>Home</Link>
                        <Link to='/exchanges'>Exchanges</Link>
                        <Link to='/news'>News</Link>
                    </Space>
                </div>
            )}
        </div>
    )
}

export default LayoutWithOutNavbar