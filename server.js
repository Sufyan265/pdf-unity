const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const PDFMerger = require('pdf-merger-js');
const schedule = require('node-schedule');

// Change upload destination to /tmp/uploads/ to ensure it works on Vercel
const upload = multer({ dest: '/tmp/uploads/' });
const app = express();
const port = process.env.PORT || 3000;

app.use('/static', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const websitePath = path.join(__dirname, '/src');
app.use(express.static(websitePath));

app.get('/', (req, res) => {
  res.send(websitePath);
});

const list = [];

app.post('/merge', upload.array('pdfs', 500), async (req, res, next) => {
  try {
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
    const publicFolderPath = path.join(__dirname, '/tmp/public');
    const mergedPdfPath = `${publicFolderPath}/PDF_${time}.pdf`;

    await merger.save(mergedPdfPath); // Removed callback to unlink here as it's handled below

    list.length = 0;

    // Use relative URL for redirect to ensure it works both locally and on Vercel
    res.redirect(`/static/PDF_${time}.pdf`);

    // Handling of uploaded and merged files deletion
    const now = new Date().getTime();
    const uploadDir = path.join('/tmp/uploads'); // Updated to reflect /tmp directory
    fs.readdir(uploadDir, (err, files) => {
      if (err) console.log(err);

      files.forEach((file) => {
        const filePath = path.join(uploadDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) console.log(err);

          if (now - stats.mtime.getTime() > 60 * 60 * 1000) {
            fs.unlink(filePath, err => {
              if (err) console.error(`Error deleting file: ${err}`);
            });
          }
        });
      });
    });

    // Merged file destruction is handled via the scheduled job as before
    const deletionDate = new Date(Date.now() + 60 * 60 * 1000);
    schedule.scheduleJob(deletionDate, () => {
      fs.unlink(mergedPdfPath, (err) => {
        if (err) console.error(`Error deleting file: ${err}`);
        else console.log('File deleted successfully.');
      });
    });
    console.log('The uploaded & merged files destroy after 1 hour.');

  } catch (error) {
    res.send("The /merge route is not working.")
    console.log(error)
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
