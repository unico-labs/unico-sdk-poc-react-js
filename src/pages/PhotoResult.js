import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import './PhotoResult.css';

const PhotoResult = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const regexHeadBase64 = /^data:image\/(jpeg|png|jpg);base64,/;
    let imageSrc = location.state.base64;
    if(!regexHeadBase64.test(imageSrc)){
        imageSrc = "data:image/jpeg;base64, " + imageSrc;
    }

    return (
        <>
            <div class="PhotoResult">
                <h2>PhotoResult</h2>
                <img src= {imageSrc} alt="Photo"/>
                <div class="buttons">
                    <button onClick={() => {navigator.clipboard.writeText(location.state.base64)}}>Copy Base64</button>
                    <button onClick={() => {navigator.clipboard.writeText(location.state.jwt)}}>Copy JWT</button>
                    <button onClick={() => navigate("/")}>Go Back</button>
                </div>
            </div>
        </>
    );
  };
  
export default PhotoResult;
  