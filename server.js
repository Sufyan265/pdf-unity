const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const PDFMerger = require('pdf-merger-js');

const upload = multer();
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/merge', upload.array('pdfs', 500), async (req, res) => {
  const merger = new PDFMerger();

  if (req.files) {
    req.files.forEach((file) => {
      merger.addBuffer(file.buffer);
    });
  }

  if (merger.mergerArray.length < 2) {
    return res.status(400).json({ error: 'Please provide at least 2 PDF files to merge.' });
  }

  const mergedPdfBuffer = await merger.asBuffer();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
  res.send(mergedPdfBuffer);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
