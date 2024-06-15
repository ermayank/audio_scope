import React, { ChangeEvent, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

interface UploadAudioProps {
  setAudioSrc: React.Dispatch<React.SetStateAction<string>>
}

const UploadAudio: React.FC<UploadAudioProps> = ({ setAudioSrc }) => {
  const fileInputRef = useRef(null)
  const apiURL = "http://localhost:5000/upload"
  const navigate = useNavigate()

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append("audio", file)

      try {
        const response = await axios.post(apiURL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        if (response.data.fileUrl) {
          setAudioSrc(response.data.fileUrl)
          navigate("/edit")
        }
      } catch (error) {
        console.error("Error uploading file:", error)
      }
    }
  }

  const handleClick = () => {
    const fileInput = fileInputRef.current as unknown as HTMLInputElement
    // const fileInput = document.querySelector(
    //   "input[type=file]"
    // ) as HTMLInputElement | null
    // fileInput?.click()
    fileInput.click()
  }

  return (
    <div>
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        style={{ display: "none" }}
        ref={fileInputRef}
      />
      <button onClick={handleClick}>Upload Audio</button>
    </div>
  )
}

export default UploadAudio
