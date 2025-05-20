'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, FileText, Loader } from 'lucide-react'
import {
  UnicoCheckBuilder,
  SelfieCameraTypes,
  UnicoThemeBuilder,
  DocumentCameraTypes,
  UnicoConfig,
  SDKEnvironmentTypes
} from 'unico-webframe'

export default function CameraCapture() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const config = new UnicoConfig()
    .setHostname("http://localhost:3000")
    .setHostKey("sdkKey_08778482-1a08-4470-bdd5-f451d5083067")

  const callback = {
    on: {
      success: function(obj: any) {
        console.log("Success capturing image")
        router.push('/photo-result?base64=' + encodeURIComponent(obj.base64) + '&jwt=' + encodeURIComponent(obj.encrypted))
      },
      error: function(error: any) {
        console.error("Error capturing image:", error)
        setError("An error occurred during capture. Please try again.")
        setTimeout(() => setError(null), 5000)
      },
      user_canceled: function() {
        console.log("Capture canceled by user.")
      }
    }
  }

  const unicoTheme = new UnicoThemeBuilder()
    .setColorSilhouetteSuccess("#0384fc")
    .setColorSilhouetteError("#D50000")
    .setColorSilhouetteNeutral("#fcfcfc")
    .setBackgroundColor("#f3f8fb")
    .setColorText("#0384fc")
    .setBackgroundColorComponents("#0384fc")
    .setColorTextComponents("#f3f8fb")
    .setBackgroundColorButtons("#0384fc")
    .setColorTextButtons("#f3f8fb")
    .setBackgroundColorBoxMessage("#ffffff")
    .setColorTextBoxMessage("#333333")
    .setHtmlPopupLoading(`
      <div style="position: absolute; top: 45%; right: 50%; transform:
      translate(50%, -50%); z-index: 10; text-align: center;">
        <div class="unico-loader"></div>
        <p style="margin-top: 8px; color: #0384fc; font-family: sans-serif;">Loading...</p>
      </div>
    `)
    .build()

  const unicoCamera = new UnicoCheckBuilder()
    .setResourceDirectory("/resources")
    .setModelsPath("/models")
    .setEnvironment(SDKEnvironmentTypes.UAT)
    .setTheme(unicoTheme)
    .build()

  const openCamera = async (cameraType: string) => {
    console.log(`Attempting to open camera: ${cameraType}`)
    setLoading(true)
    setError(null)

    try {
      let cameraPromised
      console.log(`Preparing camera: ${cameraType}`)

      switch (cameraType) {
        case 'smart':
          cameraPromised = unicoCamera.prepareSelfieCamera(config, SelfieCameraTypes.SMART)
          break
        case 'cnh':
          cameraPromised = unicoCamera.prepareDocumentCamera(config, DocumentCameraTypes.CNH)
          break
        case 'others':
          cameraPromised = unicoCamera.prepareDocumentCamera(config, DocumentCameraTypes.OTHERS("Generic Document"))
          break
        default:
          throw new Error(`Invalid camera type specified: ${cameraType}`)
      }

      const cameraOpener = await cameraPromised
      console.log(`Camera ${cameraType} prepared. Opening...`)
      cameraOpener.open(callback)

    } catch (errorCatch) {
      console.error(`Error PREPARING ${cameraType} camera:`, errorCatch)
      const errorMessage = errorCatch instanceof Error ? errorCatch.message : String(errorCatch)
      setError(`Failed to initialize camera (${cameraType}). ${errorMessage}. Please check permissions and try again.`)
      setTimeout(() => setError(null), 7000)
    } finally {
      console.log(`FINALLY block executed after trying to prepare ${cameraType} camera.`)
      setLoading(false)
    }
  }

  const features = [
    {
      title: 'Smart Camera',
      description: 'Enhanced selfie capture with intelligent framing',
      type: 'smart',
      icon: Camera
    }
  ]

  const documentFeatures = [
    {
      title: 'CNH Document',
      description: 'Capture Brazilian driver\'s license (CNH)',
      type: 'cnh',
      icon: FileText
    },
    {
      title: 'Other Documents',
      description: 'Capture other types of identification documents',
      type: 'others',
      icon: FileText
    }
  ]

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Biometric Capture</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the type of capture you need to perform. Make sure you're in a well-lit environment
            and your camera is enabled.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center" role="alert">
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Error:</span>&nbsp;{error}
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-label="Loading camera">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <Loader className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-700">Initializing camera...</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Camera className="w-5 h-5 mr-2 text-blue-600" />
            Selfie Capture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => openCamera(feature.type)}
                className="bg-white hover:bg-blue-50 border border-gray-200 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
                disabled={loading}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Document Capture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentFeatures.map((feature, index) => (
              <button
                key={index}
                onClick={() => openCamera(feature.type)}
                className="bg-white hover:bg-blue-50 border border-gray-200 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
                disabled={loading}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Tips for better capture
          </h3>
          <ul className="text-gray-600 text-sm list-disc list-inside space-y-1 ml-2">
            <li>Ensure you are in a well-lit environment</li>
            <li>Hold the camera steady and at eye level</li>
            <li>Make sure your face is fully visible and not partially covered</li>
            <li>For documents, place them on a flat, dark surface</li>
            <li>Avoid glare on documents by adjusting lighting</li>
          </ul>
        </div>

        <div className="mt-8" id="box-camera"></div>
      </div>
    </div>
  )
}