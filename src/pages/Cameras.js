import React from 'react'
import { useNavigate } from 'react-router-dom'
import { UnicoCheckBuilder, SelfieCameraTypes, UnicoThemeBuilder, DocumentCameraTypes } from 'unico-webframe';
import "./Cameras.css"
import packageJson from "../../package.json";

const Cameras = () => {
  const navigate = useNavigate();

  const callback = {
    on: {
      success: function(obj) {
        console.log("success");
        // console.log(obj.encrypted);
        navigate("/photo-result", {state:{base64: obj.base64, jwt: obj.encrypted}});
      },
      error: function(error) {
        console.log('errorMessage');
        console.error(error);
      }
    }
  };

  const unicoTheme = new UnicoThemeBuilder()
    .setColorSilhouetteSuccess("#0384fc")
    .setColorSilhouetteError("#D50000")
    .setColorSilhouetteNeutral("#fcfcfc")
    .setBackgroundColor("#dff1f5")
    .setColorText("#0384fc")
    .setBackgroundColorComponents("#0384fc")
    .setColorTextComponents("#dff1f5")
    .setBackgroundColorButtons("#0384fc")
    .setColorTextButtons("#dff1f5")
    .setBackgroundColorBoxMessage("#fff")
    .setColorTextBoxMessage("#000")
    .setHtmlPopupLoading(`<div style="position: absolute; top: 45%; right: 50%; transform:
    translate(50%, -50%); z-index: 10; text-align: center;">Carregando...</div>`)
    .build();

  const unicoCamera = new UnicoCheckBuilder()
    .setResourceDirectory("/resources")
    .setModelsPath("/models")
    .setTheme(unicoTheme)
    .build();

  const openSelfieCameraNormal = async () => {
    const cameraPromised = unicoCamera
      .prepareSelfieCamera("/unico-credentials.json", SelfieCameraTypes.NORMAL)
      .catch(()=>console.error('Error initializing normal camera'));
    
    cameraPromised.then(cameraOpener => cameraOpener.open(callback));
  }
  
  const openSelfieCameraSmart = async () => {
    const cameraPromised = unicoCamera
      .prepareSelfieCamera("/unico-credentials.json", SelfieCameraTypes.SMART)
      .catch(()=>console.error('Error initializing smart camera'));
    
    cameraPromised.then(cameraOpener => cameraOpener.open(callback));
  }

  const openSelfieCameraLiveness = async () => {
    const cameraPromised = unicoCamera
      .prepareSelfieCamera("/unico-credentials-liveness.json", SelfieCameraTypes.SMART)
      .catch((e)=>{
          console.error('Error initializing liveness camera');
          console.error(e);
        });
    
    cameraPromised.then(cameraOpener => cameraOpener.open(callback));
  }

  const openDocumentCameraCNH = async () => {
    const cameraPromised = unicoCamera
      .prepareDocumentCamera("/unico-credentials.json", DocumentCameraTypes.CNH)
      .catch(()=>console.error('Error initializing CNH camera'));
    
    cameraPromised.then(cameraOpener => cameraOpener.open(callback));
  }

  const openDocumentCameraOutros = async () => {
    const cameraPromised = unicoCamera
      .prepareDocumentCamera("/unico-credentials.json", DocumentCameraTypes.OTHERS("Teste"))
      .catch(()=>console.error('Error initializing other documents camera'));
    
    cameraPromised.then(cameraOpener => cameraOpener.open(callback));
  }

  return (
    <>
      <h2>
        Bem vindo a POC do Unico SDK Web v{packageJson.dependencies['unico-webframe']}
      </h2>
      <div class="buttons">
        <button
          type="button"
          onClick={() => openSelfieCameraNormal()}
        >
          Camera Normal
        </button>
        <button
          type="button"
          onClick={() => openSelfieCameraSmart()}
        >
          Camera Smart
        </button>
        <button
          type="button"
          onClick={() => openSelfieCameraLiveness()}
        >
          Camera Liveness
        </button>
        <button
          type="button"
          onClick={() => openDocumentCameraCNH()}
        >
          Camera CNH
        </button>
        <button
          type="button"
          onClick={() => openDocumentCameraOutros()}
        >
          Camera Outros
        </button>
      </div>
      <div className="container">
        <div id="box-camera">
        </div>
      </div>
    </>
  );
};

export default Cameras;
