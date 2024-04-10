const express = require('express');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const fileUpload = require('express-fileupload');

const app = express();
const port = process.env.PORT || 3000;

app.use(fileUpload()); // Use express-fileupload middleware

const websitePath = path.join(__dirname, '/src');
app.use(express.static(websitePath));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/merge', async (req, res) => {
  try {
    if (!req.files || !req.files.pdfs) {
      return res.status(400).send('No files were uploaded.');
    }

    const mergedPdf = await PDFDocument.create();

    // Loop through each uploaded file
    for (const file of Array.isArray(req.files.pdfs) ? req.files.pdfs : [req.files.pdfs]) {
      const pdfBytes = file.data; // Access file data
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    // Serialize the merged PDF to bytes
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
