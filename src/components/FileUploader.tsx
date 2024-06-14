import React, { useState } from "react"
import FileUpload from "./FileUpload"
import FileUploadConfirmation from "./FileUploadConfirmation"

interface File {
  name: string
}

const FileUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleConfirmUpload = () => {
    setIsConfirmationVisible(false)
    // Simulate upload logic (e.g., display success message)
    console.log(`Simulating upload of ${selectedFile?.name}`)
    setSelectedFile(null)
  }

  const handleCancelUpload = () => {
    setIsConfirmationVisible(false)
    setSelectedFile(null)
  }

  return (
    <div>
      <FileUpload onFileChange={handleFileChange} />
      {selectedFile && (
        <FileUploadConfirmation
          selectedFile={selectedFile}
          onConfirm={() => setIsConfirmationVisible(true)}
          onCancel={handleCancelUpload}
        />
      )}
      {isConfirmationVisible && (
        <div>
          <p>Are you sure you want to upload?</p>
          <button onClick={handleConfirmUpload}>Yes</button>
          <button onClick={handleCancelUpload}>No</button>
        </div>
      )}
    </div>
  )
}

export default FileUploader
