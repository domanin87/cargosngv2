import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/sections/Header.jsx'
import Footer from './components/sections/Footer.jsx'
import Home from './components/sections/Home.jsx'
import CargoList from './components/sections/CargoList.jsx'
import Auth from './components/sections/Auth.jsx'
import Dashboard from './components/sections/Dashboard.jsx'

export default function App() {
  return (
    <div>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cargo" element={<CargoList />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}