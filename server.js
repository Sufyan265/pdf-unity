const express = require('express');
// const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const PDFMerger = require('pdf-merger-js');
// const schedule = require('node-schedule');

// Updated upload destination to use /tmp directory, which is writable in Vercel environment
const upload = multer({ dest: 'tmp/uploads' });
const app = express();
const port = process.env.PORT || 3000;

app.use('/static', express.static(path.join(__dirname, 'tmp/public')));
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
        list.push(file.path);
      });
    }

    if (list.length < 2) {
      return res.status(400).json({ error: 'Please provide at least 2 PDF files to merge.' });
    }

    for (const filePath of list) {
      await merger.add(filePath);
    }

    const time = new Date().getTime();
    // Save the merged PDF in the /tmp directory, which is writable
    const mergedPdfPath = `tmp/public/PDF_${time}.pdf`;

    await merger.save(mergedPdfPath); // Save the merged PDF

    // Clear the list of processed files
    list.length = 0;

    // Provide a URL to access the merged PDF file. Note: This might need to be adjusted based on your actual file serving setup.
    res.json({ url: `/static/PDF_${time}.pdf` });

  } catch (error) {
    console.error('Error in /merge:', error);
    res.status(500).json({ error: 'Internal server error during hit /merge', error });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const multer = require('multer');
// const bodyParser = require('body-parser');
// const PDFMerger = require('pdf-merger-js');

// const upload = multer({ dest: 'tmp/uploads/' });
// const app = express();
// const port = process.env.PORT || 3000;

// app.use('/static', express.static('tmp/public'));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// const websitePath = path.join(__dirname, '/src');
// app.use(express.static(websitePath));

// app.get('/', (req, res) => {
//   res.send(websitePath);
// });

// const list = [];

// app.post('/merge', upload.array('pdfs', 500), async (req, res, next) => {
//   const merger = new PDFMerger();

//   try {
//     if (req.files) {
//       req.files.forEach((file) => {
//         list.push(file.path);
//       });
//     }

//     if (!list || !Array.isArray(list) || list.length < 2) {
//       return res.status(400).json({ error: 'Please provide at least 2 PDF files to merge.' });
//     }

//     for (const task of list) {
//       await merger.add(task);
//     }

//     const time = new Date().getTime();
//     const publicFolderPath = path.join(__dirname, 'tmp/public');
//     const mergedPdfPath = `${publicFolderPath}/PDF_${time}.pdf`;

//     await merger.save(mergedPdfPath);

//     res.redirect(`/static/PDF_${time}.pdf`);
//   } catch (err) {
//     console.error('Error occurred while merging PDFs:', err);
//     res.status(500).json({ error: 'An error occurred while merging PDFs.' });
//   } finally {
//     // Clear uploaded files list
//     list.length = 0;
//   }
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port http://localhost:${port}`);
// });
