import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import './App.css';
import Cameras from "./pages/Cameras";
import PhotoResult from "./pages/PhotoResult";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cameras />} />
        <Route path="photo-result" element={<PhotoResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
