const express = require('express');
const fs = require('fs');
const path = require("path");
const multer = require('multer')
const bodyParser = require('body-parser');
const PDFMerger = require('pdf-merger-js');

// const { mergePdf } = require('./merge')

const upload = multer({ dest: 'uploads/' })
const app = express()
const port = 3000
app.use('/static', express.static('public'))


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const wbsitePath = path.join(__dirname, "/templates")
app.use(express.static(wbsitePath))

app.get('/', (req, res) => {
  res.send(wbsitePath)
})

const list = [];

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
  console.log(`Example app listening on port http://localhost:${port}`)
})
