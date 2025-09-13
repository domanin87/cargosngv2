import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'

function Home() {
  return <h2>Главная страница CargoSNG</h2>
}

function About() {
  return <h2>О проекте</h2>
}

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">Главная</Link> |{" "}
        <Link to="/about">О проекте</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}
