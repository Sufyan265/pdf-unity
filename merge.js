const PDFMerger = require('pdf-merger-js');
// const path = require('path');

var merger = new PDFMerger();


const mergePdf = async (p1) => {


  for (const file of p1) {
    await merger.add(file);
    
    pdfFiles.forEach((pdfFile) => {
      merger.add(pdfFile)
    });
  }



  // await merger.add(p1);  //merge all pages. parameter is the path to file and filename.
  // await merger.add(p2); // merge only page 2
  // await merger.add(p3); // merge only page 2
  // await merger.add('pdf2.pdf', [1, 3]); // merge the pages 1 and 3
  // await merger.add('pdf2.pdf', '4, 7, 8'); // merge the pages 4, 7 and 8
  // await merger.add('pdf3.pdf', '3 to 5'); //merge pages 3 to 5 (3,4,5)
  // await merger.add('pdf3.pdf', '3-5'); //merge pages 3 to 5 (3,4,5)

  const time = new Date().getTime();
  await merger.save(`public/file_${time}.pdf`); //save under given name and reset the internal document

  // Export the merged PDF as a nodejs Buffer
  // const mergedPdfBuffer = await merger.saveAsBuffer();
  // fs.writeSync('merged.pdf', mergedPdfBuffer);
};
module.exports = { mergePdf };

// */
// console.log("________________________________________________________________________________________________________________________3")

/*
const PDFMerger = require('pdf-merger-js');
const fs = require('fs');

// Define a function to merge an array of PDF files
async function mergePDFs(outputPath, pdfFiles) {
  const merger = new PDFMerger();

  for (const file of pdfFiles) {
    merger.add(file);
  }

  await merger.save(outputPath);
  console.log(`Merged PDFs saved to: ${outputPath}`);
}

// Specify the input PDF files and the output merged PDF file
const inputPDFs = ['input1.pdf', 'input2.pdf', 'input3.pdf']; // Add your input PDFs here
const outputPDF = 'output.pdf';

// Call the mergePDFs function
mergePDFs(outputPDF, inputPDFs);

// */