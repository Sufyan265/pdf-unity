
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const PDFMerger = require('pdf-merger-js');
const schedule = require('node-schedule');

const upload = multer({ dest: 'uploads/' });
const app = express();
const port = process.env.PORT || 3000;

app.use('/static', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const websitePath = path.join(__dirname, '/templates');
app.use(express.static(websitePath));

app.get('/', (req, res) => {
  res.send(websitePath);
});

const list = [];

app.post('/merge', upload.array('pdfs', 500), async (req, res, next) => {
  const merger = new PDFMerger();

  if (req.files) {
    req.files.forEach((file) => {
      list.push(file.path);
    });
  }

  if (!list || !Array.isArray(list) || list.length < 2) {
    return res.status(400).json({ error: 'Please provide at least 2 PDF files to merge.' });
  }

  for (const task of list) {
    await merger.add(task);
  }
  const time = new Date().getTime();
  const publicFolderPath = path.join(__dirname, '/public');
  const mergedPdfPath = `${publicFolderPath}/PDF_${time}.pdf`;

  await merger.save(mergedPdfPath, () => {
    fs.unlinkSync(mergedPdfPath);
    console.log('Saved');
  });

  list.length = 0;

  res.redirect(`http://localhost:${port}/static/PDF_${time}.pdf` || 'No files found');

  // Uploaded files delete after 1 hour
  const now = new Date().getTime();
  const uploadDir = path.join(__dirname, 'uploads');
  const files = fs.readdirSync(uploadDir);
  files.forEach((file) => {
    const filePath = path.join(uploadDir, file);
    const fileStats = fs.statSync(filePath);
    if (now - fileStats.mtime.getTime() > 60 * 60 * 1000) {
      fs.unlinkSync(filePath);
    }
  });

  // Merged file destroy after 1 hour
  const deletionDate = new Date(Date.now() + 60 * 60 * 1000);
  schedule.scheduleJob(deletionDate, () => {
    fs.unlink(mergedPdfPath, (err) => {
      if (err) console.error(`Error deleting file: ${err}`);
      else console.log('File deleted successfully.');
    });
  });
  console.log('The uploaded & merged files destroy after 1 hour.');
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});


// _____________________________________________________________________________2

// const express = require('express');
// const fs = require('fs');
// const path = require("path");
// const multer = require('multer')
// const bodyParser = require('body-parser');
// const PDFMerger = require('pdf-merger-js');

// // const { mergePdf } = require('./merge')

// const upload = multer({ dest: 'uploads/' })
// const app = express()
// const port = 3000
// app.use('/static', express.static('public'))


// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());


// const wbsitePath = path.join(__dirname, "/templates")
// app.use(express.static(wbsitePath))

// app.get('/', (req, res) => {
//   res.send(wbsitePath)
// })

// app.post('/merge', upload.array('pdfs', 500), async (req, res) => {
//   const merger = new PDFMerger();

//   if (req.files) {
//     req.files.forEach((file) => {
//       merger.addBuffer(file.buffer);
//     });
//   }

//   if (merger.mergerArray.length < 2) {
//     return res.status(400).json({ error: 'Please provide at least 2 PDF files to merge.' });
//   }

//   const mergedPdfBuffer = await merger.asBuffer();

//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
//   res.send(mergedPdfBuffer);
// });


// app.listen(port, () => {
//   console.log(`Example app listening on port http://localhost:${port}`)
// })
