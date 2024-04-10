const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const { PDFDocument } = require('pdf-lib');

const upload = multer(); // Remove the destination option, as we won't be saving files locally
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const websitePath = path.join(__dirname, '/src');
app.use(express.static(websitePath));

app.get('/', (req, res) => {
  res.send(websitePath);
});

app.post('/merge', upload.array('pdfs', 500), async (req, res) => {
  try {
    const mergedPdf = await PDFDocument.create();
    
    for (const file of req.files) {
      const pdfBytes = file.buffer;
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    
    // Set headers to indicate that the response is a PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');

    // Send the merged PDF content as response
    res.send(mergedPdfBytes);
  } catch (error) {
    console.error('Error in "/merge":', error);
    res.status(500).json({ error: 'Internal server error during hit "/merge"' });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
