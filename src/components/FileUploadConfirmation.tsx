import React from "react"

interface File {
  name: string
}

interface FileUploadConfirmationProps {
  selectedFile: File
  onConfirm: () => void
  onCancel: () => void
}

const FileUploadConfirmation: React.FC<FileUploadConfirmationProps> = ({
  selectedFile,
  onConfirm,
  onCancel,
}) => {
  return (
    <div>
      <p>You selected: {selectedFile.name}</p>
      <button onClick={onConfirm}>Confirm Upload (Simulate)</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}

export default FileUploadConfirmation
