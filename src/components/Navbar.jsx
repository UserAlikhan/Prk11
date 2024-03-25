import React, { useState, useEffect } from 'react'
import { Button, Menu, Typography, Avatar } from 'antd'
import { Link } from 'react-router-dom'
import { HomeOutlined, MoneyCollectOutlined, 
    BulbOutlined, FundOutlined, MenuOutlined } 
    from '@ant-design/icons'

import icon from '../images/manhattan-2430572_1920.jpg'

const Navbar = () => {

  const [activeMenu, setActiveMenu] = useState(true)
  const [screenSize, setScreenSize] = useState(null)

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth)
    }
    // every time that the window resize, handle resize
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (screenSize > 768){
      setActiveMenu(false)
    } else {
      setActiveMenu(true)
    }
  }, [screenSize])

  return (
    <div className='nav-container'>
        <div className='logo-container'>
            <Avatar src={icon} size="large"/>
            <Typography.Title level={2} className='logo'>
                <Link to="/">CryptoVerse</Link>
            </Typography.Title>
            <Button className='menu-control-container' onClick={() => setActiveMenu(!activeMenu)}>
              <MenuOutlined/>
            </Button>
        </div>
        {activeMenu ? (
          <Menu theme='dark'>
          <Menu.Item icon={<HomeOutlined/>}>
            <Link to="/">Home</Link>
          </Menu.Item>

          <Menu.Item icon={<FundOutlined/>}>
            <Link to="/cryptocurrencies">Crypto currencies</Link>
          </Menu.Item>

          <Menu.Item icon={<MoneyCollectOutlined/>}>
            <Link to="/exchanges">Exchanges</Link>
          </Menu.Item>

          <Menu.Item icon={<BulbOutlined/>}>
            <Link to="/news">News</Link>
          </Menu.Item>
        </Menu>
        ) : null}
    </div>
  )
}

export default Navbar