import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import './App.css';
import Cameras from "./Cameras";
import Home from "./Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="cameras" element={<Cameras />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const Layout = () => {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/cameras">Cameras</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  )
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
