import { useContext, useEffect, useRef, useState } from "react"
import { FileContext } from "../utils/fileContext"

const FileUpload = () => {
  const inputFile = useRef(null)
  const { fileURL, setFileURL } = useContext(FileContext)
  const [file, setFile] = useState("")

  useEffect(() => {
    if (file) {
      setFileURL(file)
      console.log(fileURL)
      // history.push("/edit")
    }
  }, [file, fileURL, setFileURL])
  const fileUploadHandler = (e: any) => {
    setFile(URL.createObjectURL(e.target.files[0]))
  }

  const uploadButtonHandler = () => {
    console.log(fileURL)
    console.log("Clicked")
  }

  return (
    <>
      <h1>File Upload</h1>

      {/* <input onChange={fileUploadHandler} type="file" /> */}
      <input
        type="file"
        id="file"
        ref={inputFile}
        // style={{ display: "none" }}
        accept="audio/*"
        onChange={fileUploadHandler}
      />
      <button className="upload-btn" onClick={uploadButtonHandler}>
        Upload
      </button>
    </>
  )
}

export default FileUpload
