/**
 * Express server setup for handling file uploads.
 * Uses multer for file upload handling and serves uploaded files statically.
 *
 * Dependencies:
 * - express
 * - multer
 * - path
 * - url
 * - fs
 * - cors
 *
 * @module server
 */

import express from "express" // Fast, unopinionated, minimalist web framework for Node.js
import multer from "multer" // Middleware for handling `multipart/form-data` for file uploads
import path from "path" // Utility for working with file and directory paths
import { fileURLToPath } from "url" // Utility for working with file URLs
import fs from "fs" // File system module to check and create directories
import cors from "cors" // Middleware for enabling CORS (Cross-Origin Resource Sharing)

const app = express() // Initialize Express application
const port = process.env.PORT || 5000 // Port to run the server on

const __filename = fileURLToPath(import.meta.url) // Variables for current filename and directory
const __dirname = path.dirname(__filename) // Directory path for uploads

/**
 * Enable CORS for all routes.
 */
app.use(cors())

/**
 * Ensure the uploads directory exists. If not, create it synchronously.
 */
const uploadDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

/**
 * Multer storage configuration.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

/**
 * Multer instance for file uploads.
 */

const upload = multer({ storage })

/**
 * Serve uploaded files statically from the 'uploads' directory.
 */

app.use("/uploads", express.static(uploadDir))

/**
 * POST /upload - Endpoint to handle file upload.
 * @function
 * @name POST/upload
 * @memberof module:server
 * @param {string} path - Route path (`/upload`).
 * @param {Function} middleware - Multer middleware to handle file (`audio`) upload.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 */
app.post("/upload", upload.single("audio"), (req, res) => {
  if (req.file) {
    const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`
    res.status(200).json({ fileUrl })
  } else {
    res.status(400).json({ error: "No file uploaded" })
  }
})

/**
 * Start the Express server.
 * @function
 * @name app.listen
 * @memberof module:server
 * @param {number} port - Port number for the server.
 * @param {Function} callback - Callback function once server is running.
 */

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

/**
 * Export the Express application.
 * @exports app
 */

export default app
