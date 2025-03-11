import React from 'react'
import Header from './components/Header'
import { Route, Routes } from "react-router-dom"
import Home from './pages/Home'
import Collection from './pages/Collection'
import Blog from './pages/Blog'
import Product from './pages/Product'
import { ToastContainer } from "react-toastify"
import Cart from './pages/Cart'
import PlaceOrder from './pages/PlaceOrder'
import Login from './pages/Login'
import Orders from './pages/Orders'
import Verify from './pages/Verify'
import RequestStore from "./pages/RequestStore";
import StoreManagement from './pages/StoreManagement'
export const backend_url = import.meta.env.VITE_BACKEND_URL;


const App = () => {
  return (
    <main className='overflow-hidden text-tertiary'>
      <ToastContainer />
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/request-store" element={<RequestStore />} />
        <Route path="/my-store" element={<StoreManagement />} />

        <Route path='/collection' element={<Collection />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/login' element={<Login />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/verify' element={<Verify />} />
      </Routes>
    </main>
  )
}

export default App