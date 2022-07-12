import './Cameras.css';
import { UnicoCheckBuilder, SelfieCameraTypes, UnicoThemeBuilder, DocumentCameraTypes } from 'unico-webframe';

const callback = {
  on: {
    success: function(obj) {
      console.log(obj.base64);
    },
    error: function(error) {
      console.error(error)
      //confira na aba "Configurações" sobre os tipos de erros
    }
  }
};

const CameraSDK = () => {

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
      .catch(()=>console.error('Error initializing normal camera'));;
    
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
      .catch(()=>console.error('Error initializing liveness camera'));
    
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
      <div className="container">
        <div id="box-camera">
        </div>
      </div>
    </>
  );
};

function Cameras() {
  return (
    <div className="Cameras">
      <CameraSDK />
    </div>
  );
}

export default Cameras;
