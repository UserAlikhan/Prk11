// App.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Layout, Typography, Space } from 'antd';
import './App.css';
import { Navbar, HomePage, Cryptocurrencies, Cryptodetails, Exchanges, News } from './components';
import LoadData from './components/chartTutorial/LoadData';
import LayoutWithOutNavbar from './LayoutWithOutNavbar';

const App = () => (
  <Routes>
      <Route
        path='/'
        element={
            <LayoutWithOutNavbar>
              <HomePage />
            </LayoutWithOutNavbar>
        }
      />
      <Route path='/exchanges' element={<LayoutWithOutNavbar>{<Exchanges />}</LayoutWithOutNavbar>} />
      <Route
        path='/cryptocurrencies'
        element={<LayoutWithOutNavbar>{<Cryptocurrencies />}</LayoutWithOutNavbar>}
      />
      <Route
        path='/crypto/:coinId'
        element={<LayoutWithOutNavbar>{<Cryptodetails />}</LayoutWithOutNavbar>}
      />
      <Route path='/news' element={<LayoutWithOutNavbar>{<News />}</LayoutWithOutNavbar>} />
      <Route
        path='/chart/:coinName'
        element={<LayoutWithOutNavbar hideNavbar hideFooter>{<LoadData />}</LayoutWithOutNavbar>}
      />
  </Routes>
);

export default App;