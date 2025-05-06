//file.controller.js
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import { PDFExtract } from 'pdf.js-extract';
import {parse} from "csv-parse";
import { StructuredPdfText } from "../utils/StrText.utils.js";
import { TextAnalysis } from "../utils/analysis.utils.js";

const pdfExtract = new PDFExtract();
const extractionOptions = {}; 

const UploadParse = async (req, res) => {
    console.log("File got successfully uploaded");
    
  if (req.file.mimetype=='application/pdf') {
      try {
          if (!req.file) {
              return res.status(400).json({ 
                  error: "No file uploaded" 
              });
          }
          
          console.log(req.file);
          
          // Check if file exists before reading
          if (!fs.existsSync(req.file.path)) {
              return res.status(404).json({ 
                  error: `Uploaded file not found at ${req.file.path}` 
              });
          }
          
          try {
              // Extract text from PDF
              const extractedData = await pdfExtract.extract(req.file.path, extractionOptions);
              
              // Combine text from all pages
              let fullText = '';
              
              if (extractedData && extractedData.pages) {
                  extractedData.pages.forEach(page => {
                      if (page.content) {
                          page.content.forEach(item => {
                              fullText += item.str + ' ';
                          });
                      }
                  });
              }
              
              // Create response
              const response = new ApiResponse(200, "File upload was successful", {
                  name: req.file.originalname,
                  originalname: req.file.originalname,
                  path: req.file.path,
                  pageCount: extractedData.pages.length
              });

            const Data = StructuredPdfText(fullText.toLowerCase()) ;

            res.Data = Data ;

            const AnalysedData = TextAnalysis(Data) ;
              res.json({ 
                  response, 
                  AnalysedData
              });
              
          } catch (pdfError) {
              console.error("PDF processing error:", pdfError);
              return res.status(422).json({ 
                  error: "Could not process the PDF file. Please ensure it's a valid PDF." 
              });
          }
      } catch (error) {
          console.error(`Error processing upload: ${error}`);
          return res.status(500).json({ 
              error: `Server error: ${error.message}` 
          });
      }
  } else {
    const records = [] ;
    // const pass = new PassThrough() ;
    const parser = parse({columns : true})
    fs.createReadStream(req.file.path)
    .pipe(parser) 
    .on("data",(row)=>{
        let NormalisedRow = {} ;

        for (const key in row) {
            NormalisedRow[key.trim().toLowerCase()] = row[key] ;
        }
      // Convert amount to number and sanitize
    NormalisedRow.amount = parseFloat(NormalisedRow.amount) || 0;
    NormalisedRow.type = NormalisedRow.type?.trim();
    NormalisedRow.description = NormalisedRow.description?.trim() || "";
    NormalisedRow.date = NormalisedRow.date?.trim() || "";

    records.push(NormalisedRow) ;
    })
    .on('end',()=>{
        const response = new ApiResponse(200,"Your CSV file is successfully parsed",{
            name: req.file.originalname,
            originalname: req.file.originalname,
            path: req.file.path,
        })

        // finally sending the response
    const AnalysedData = TextAnalysis(records) ;

        res.json({response,AnalysedData}) ;
    })
    // pass.pipe(res)
    // pass.pipe(parser) ;
   
  }
}

export {UploadParse} ;