const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const PDFMerger = require('pdf-merger-js');
const schedule = require('node-schedule');

// Update the multer destination to use /tmp for compatibility with Vercel's filesystem
const upload = multer({ dest: '/tmp/uploads/' });
const app = express();

// Use the PORT environment variable provided by Vercel or default to 3000
const port = process.env.PORT || 3000;

// Serve static files from 'public'. Note: This assumes you have a 'public' directory in your project.
app.use('/static', express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve the 'src' directory as static files. Ensure 'src' contains your client-side assets.
const websitePath = path.join(__dirname, '/src');
app.use(express.static(websitePath));

app.get('/', (req, res) => {
  // Adjusted to serve an index file or a simple message rather than sending the directory path
  res.sendFile(path.join(websitePath, 'index.html')); // Make sure 'index.html' exists or adjust as needed
});

app.post('/merge', upload.array('pdfs', 500), async (req, res) => {
  const merger = new PDFMerger();

  // Temporary list to store paths of uploaded files for this request
  const tempList = [];

  if (req.files) {
    req.files.forEach((file) => {
      tempList.push(file.path); // Use a request-specific list to avoid conflicts
    });
  }

  if (!tempList.length || tempList.length < 2) {
    return res.status(400).json({ error: 'Please provide at least 2 PDF files to merge.' });
  }

  for (const filePath of tempList) {
    await merger.add(filePath);
  }
  const time = new Date().getTime();
  const publicFolderPath = path.join(__dirname, '/public');
  const mergedPdfPath = `${publicFolderPath}/PDF_${time}.pdf`;

  await merger.save(mergedPdfPath); // Adjusted to remove callback

  tempList.length = 0; // Clear the temporary list

  // Adjust the redirection URL to not rely on localhost or PORT
  res.redirect(`/static/PDF_${time}.pdf`);

  // Note: The file cleanup logic has been removed for brevity. Adjust as necessary.
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
