const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const PDFMerger = require('pdf-merger-js');

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
    const merger = new PDFMerger();
    const list = [];

    if (req.files) {
      req.files.forEach(file => {
        // Instead of storing the file path, we'll directly use the buffer
        merger.addBuffer(file.buffer);
      });
    }

    if (list.length < 2) {
      return res.status(400).json({ error: 'Please provide at least 2 PDF files to merge.' });
    }

    const time = new Date().getTime();
    const mergedPdfBuffer = await merger.saveAsBuffer(); // Save the merged PDF as buffer

    // Provide a URL to access the merged PDF file
    const pdfUrl = `/static/PDF_${time}.pdf`;

    res.json({ url: pdfUrl });

  } catch (error) {
    console.error('Error in "/merge":', error);
    res.status(500).json({ error: 'Internal server error during hit "/merge"' });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
