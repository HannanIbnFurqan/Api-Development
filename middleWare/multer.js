
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import Stock from '../schema/stockSchema.js'; // Make sure the model is correctly imported

// Configure multer with storage and fileFilter
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this folder exists or create it
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Only CSV files are allowed'), false); // Reject other files
        }
    }
});


const fileUpload = async (req, res) => {
    try {
        // Check if a file is uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded or invalid file format. Only CSV allowed.' });
        }

        // Define required columns and initialize counters
        const requiredColumns = ["Date", "Symbol", "Series", "Prev Close", "Open", "High", "Low", "Last", "Close", "VWAP", "Volume", "Turnover", "Trades", "Deliverable", "%Deliverable"];
        let totalRecords = 0;
        let successCount = 0;
        let failedRecords = [];

        // Helper function to process each row
        const processRow = async (row) => {
            const hasAllColumns = requiredColumns.every(col => row.hasOwnProperty(col));
            const isNumeric = val => !isNaN(val) && isFinite(val);

            // Validate the row data
            if (!hasAllColumns || !isNumeric(row["Prev Close"]) || !isNumeric(row["Open"]) ||
                !isNumeric(row["High"]) || !isNumeric(row["Low"]) || !isNumeric(row["Last"]) ||
                !isNumeric(row["Close"]) || !isNumeric(row["VWAP"]) || !isNumeric(row["Volume"]) ||
                !isNumeric(row["Turnover"]) || !isNumeric(row["Trades"]) || !isNumeric(row["Deliverable"]) ||
                !isNumeric(row["%Deliverable"])) {
                
                failedRecords.push({ row, reason: 'Validation failed' });
                return;
            }

            // Construct data to save in the database
            const stockData = {
                date: new Date(row.Date),
                symbol: row.Symbol,
                series: row.Series,
                prev_close: parseFloat(row["Prev Close"]),
                open: parseFloat(row.Open),
                high: parseFloat(row.High),
                low: parseFloat(row.Low),
                last: parseFloat(row.Last),
                close: parseFloat(row.Close),
                vwap: parseFloat(row.VWAP),
                volume: parseInt(row.Volume, 10),
                turnover: parseFloat(row.Turnover),
                trades: parseInt(row.Trades, 10),
                deliverable: parseInt(row.Deliverable, 10),
                percent_deliverable: parseFloat(row["%Deliverable"]),
            };
             console.log()
            // Save to MongoDB
            try {
                console.log(Stock)
                await Stock.create({stockData});
                successCount++;
            } catch (dbError) {
                failedRecords.push({ row, reason: 'Database insertion error', error: dbError.message });
            }
        };

        // Read and process the CSV file
        const stream = fs.createReadStream(req.file.path).pipe(csv());

        stream.on('data', async (row) => {
            totalRecords++;
            await processRow(row);
        });
// Remove the uploaded file after processing
        stream.on('end', () => {
            fs.createWriteStream(req.file.path); 
            res.json({
                totalRecords,
                successCount,
                failedCount: totalRecords - successCount,
                failedRecords
            });
        });

        stream.on('error', (streamError) => {
            res.status(500).json({ error: 'Error processing CSV file', details: streamError.message });
        });

    } catch (error) {
        res.status(500).json({ error: 'Unexpected error', details: error.message });
    }
};

export { upload, fileUpload };
