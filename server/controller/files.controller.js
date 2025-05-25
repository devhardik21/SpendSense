// Modified file.controller.js with enhanced debugging and fixes
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import { PDFExtract } from 'pdf.js-extract';
import { parse } from "csv-parse";
import { StructuredPdfText } from "../utils/StrText.utils.js";
import { TextAnalysis } from "../utils/Analysis.utils.js";

const pdfExtract = new PDFExtract();
const extractionOptions = {};

const UploadParse = async (req, res) => {
    console.log("File got successfully uploaded");

    if (req.file.mimetype == 'application/pdf') {
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

                const Data = StructuredPdfText(fullText.toLowerCase());

                // res.Data = Data;

                const AnalysedData = TextAnalysis(Data);

                  const GraphAnalyedData = {
                    MoneyBreakdown: {
                      label: Object.keys(AnalysedData.MoneyRecord),
                      values: Object.values(AnalysedData.MoneyRecord),
                    },
                    TransactionType: {
                      label: Object.keys(AnalysedData.TransactionType),
                      values: Object.values(AnalysedData.TransactionType),
                    },
                    MonthlyBreakdown: {
                      label: Object.keys(AnalysedData.MonthlyBreakdown),
                      values: Object.values(AnalysedData.MonthlyBreakdown),
                    },
                  };

                const FinalResponse = new ApiResponse(201, "The file has been sent and analysed successfully",  GraphAnalyedData) ;

                res.json(FinalResponse);
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
    }
    else {
        const records = [];
        const parser = parse({
            columns: true,
            skip_empty_lines: true,
            trim: true  // Automatically trim whitespace
        });

        fs.createReadStream(req.file.path)
            .pipe(parser)
            .on("data", (row) => {
                let NormalisedRow = {};

                // Log original row to see what we're getting
                console.log("Original CSV row:", row);

                // Normalize column names
                for (const key in row) {
                    const normalizedKey = key.trim().toLowerCase();
                    NormalisedRow[normalizedKey] = row[key];

                    // Check for common alternative column names
                    if (normalizedKey === "dr" || normalizedKey === "debit" || normalizedKey === "withdrawal amount") {
                        NormalisedRow.amount = parseFloat(row[key].replace(/[^\d.-]/g, '')) || 0;
                        NormalisedRow.type = "Debit";
                    }
                    else if (normalizedKey === "cr" || normalizedKey === "credit" || normalizedKey === "deposit amount") {
                        NormalisedRow.amount = parseFloat(row[key].replace(/[^\d.-]/g, '')) || 0;
                        NormalisedRow.type = "Credit";
                    }
                    else if (normalizedKey === "amount" || normalizedKey === "transaction amount" || normalizedKey === "amount (inr)") {
                        NormalisedRow.amount = parseFloat(row[key].replace(/[^\d.-]/g, '')) || 0;
                    }
                    else if (normalizedKey.includes("desc") || normalizedKey.includes("narration") || normalizedKey.includes("particular")) {
                        NormalisedRow.description = row[key];
                    }
                    else if (normalizedKey.includes("date") || normalizedKey === "txn date" || normalizedKey === "transaction date") {
                        NormalisedRow.date = row[key];
                    }
                    else if (normalizedKey.includes("type") || normalizedKey === "txn type" || normalizedKey === "transaction type") {
                        const typeValue = row[key].trim().toLowerCase();
                        if (typeValue === "debit" || typeValue === "dr" || typeValue === "withdrawal") {
                            NormalisedRow.type = "Debit";
                        } else if (typeValue === "credit" || typeValue === "cr" || typeValue === "deposit") {
                            NormalisedRow.type = "Credit";
                        } else {
                            console.log("Unknown transaction type:", typeValue);
                            NormalisedRow.type = "Unknown";
                        }
                    }
                }

                // Make sure we have required fields with correct types
                if (!NormalisedRow.amount && NormalisedRow.amount !== 0) {
                    console.warn("Missing amount for row:", row);
                    NormalisedRow.amount = 0;
                }

                if (typeof NormalisedRow.amount !== 'number') {
                    NormalisedRow.amount = parseFloat(NormalisedRow.amount.toString().replace(/[^\d.-]/g, '')) || 0;
                }

                if (!NormalisedRow.type) {
                    // If no type was found, determine based on additional rules
                    // For example, if there's a "debit amount" column but it's empty and "credit amount" has value
                    console.warn("Missing transaction type for row:", row);
                    NormalisedRow.type = "Unknown";
                }

                NormalisedRow.description = NormalisedRow.description?.trim() || "";
                NormalisedRow.date = NormalisedRow.date?.trim() || "";

                // Debug the normalized row
                console.log("Normalized row:", NormalisedRow);

                // Only add valid rows with required fields
                if (NormalisedRow.amount !== undefined && NormalisedRow.type) {
                    records.push(NormalisedRow);
                } else {
                    console.warn("Skipping invalid row:", NormalisedRow);
                }
            })
            .on('end', () => {
                // Debug the processed records
                console.log("Total records processed:", records.length);

                // Debug first few records
                if (records.length > 0) {
                    console.log("First 3 records:", JSON.stringify(records.slice(0, 3), null, 2));
                    console.log("Transaction types distribution:",
                        records.reduce((acc, curr) => {
                            acc[curr.type] = (acc[curr.type] || 0) + 1;
                            return acc;
                        }, {}));
                    console.log("Total amount by type:",
                        records.reduce((acc, curr) => {
                            acc[curr.type] = (acc[curr.type] || 0) + curr.amount;
                            return acc;
                        }, {}));
                }

                const response = new ApiResponse(200, "Your CSV file is successfully parsed", {
                    name: req.file.originalname,
                    originalname: req.file.originalname,
                    path: req.file.path,
                    recordCount: records.length,
                    success: true
                });

                // Add validation check
                if (records.length === 0) {
                    console.warn("Warning: No records were parsed from the CSV!");
                    return res.status(400).json({
                        error: "No valid records found in the CSV file."
                    });
                }

                // Finally sending the response
                const AnalysedData = TextAnalysis(records);
                console.log("Analysis results:", JSON.stringify(AnalysedData, null, 2));

                const GraphAnalyedData = {
                  MoneyBreakdown: {
                    label: Object.keys(AnalysedData.MoneyRecord),
                    values: Object.values(AnalysedData.MoneyRecord),
                  },
                  TransactionType: {
                    label: Object.keys(AnalysedData.TransactionType),
                    values: Object.values(AnalysedData.TransactionType),
                  },
                  MonthlyBreakdown: {
                    label: Object.keys(AnalysedData.MonthlyBreakdown),
                    values: Object.values(AnalysedData.MonthlyBreakdown),
                  },
                };

                const FinalResponse = new ApiResponse(201, "The file has been sent and analysed successfully", GraphAnalyedData)

                res.json(FinalResponse);
            })
            .on('error', (err) => {
                console.error("CSV parsing error:", err);
                res.status(422).json({
                    error: "Could not process the CSV file. Please ensure it's valid."
                });
            });
    }
}

export { UploadParse };