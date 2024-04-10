const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const { PDFDocument } = require('pdf-lib');

const upload = multer(); // Remove the destination option, as we won't be saving files locally
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the /public directory
app.use('/static', express.static(path.join(__dirname, 'public')));
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
    const mergedPdfPath = path.join(__dirname, 'public', `merged.pdf`);

    // Save the merged PDF to the public directory
    await fs.promises.writeFile(mergedPdfPath, mergedPdfBytes);

    const pdfUrl = `/static/merged.pdf`;

    res.json({ url: pdfUrl });
  } catch (error) {
    console.error('Error in "/merge":', error);
    res.status(500).json({ error: 'Internal server error during hit "/merge"' });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
