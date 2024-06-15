import express from "express"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs" // Import the fs module to check and create directories
import cors from "cors" // Import the cors package

const app = express()
const port = 5000

// Get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Enable CORS for all routes
app.use(cors())

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})
const upload = multer({ storage })

app.use("/uploads", express.static(uploadDir))

// Endpoint to handle file upload
app.post("/upload", upload.single("audio"), (req, res) => {
  if (req.file) {
    const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`
    res.status(200).json({ fileUrl })
  } else {
    res.status(400).json({ error: "No file uploaded" })
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
