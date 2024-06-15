import { createContext, useState } from "react"

interface FileContextType {
  fileURL: string
  setFileURL: React.Dispatch<React.SetStateAction<string>>
}

const FileContext = createContext({})

const FileContextProvider = ({ children }: any) => {
  const [fileURL, setFileURL] = useState("")
  return (
    <FileContext.Provider value={{ fileURL, setFileURL }}>
      {children}
    </FileContext.Provider>
  )
}

export { FileContext, FileContextProvider }
