// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { upload } from "./middleware/multer.middleware.js";
import { PDFExtract } from 'pdf.js-extract';
import { UploadParse } from "./controller/files.controller.js";
import { AiSummary } from "./controller/ai.controller.js";
dotenv.config();

// Initialize Express app and PDF extractor
const app = express();
const pdfExtract = new PDFExtract();
const extractionOptions = {}; // default options

// Middleware
// app.use(cors({
//     origin: 'http://127.0.0.1:5500', // this must match your frontend exactly
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type'],
//     credentials: false
//   }));
app.use(cors()) ;  
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
   res.send(`Welcome to the backend of SpendSense`);
});
app.post('/api/upload', upload.single("statement"),UploadParse);
app.post('/api/get-summary',AiSummary) ;

// Start server
const PORT = process.env.PORT || 3000; // Fallback port


app.listen(PORT, () => {
    console.log(`The server is successfully listening on PORT: ${PORT}`);
});