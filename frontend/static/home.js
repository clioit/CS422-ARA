/*
Functions for home page functionality. Inlcudes uploading a pdf, loading in selected pdfs, and selecting a pdf to open.
Created for CS 422 Project 1: ARA in Spring 2025.

Authors: Claire Cody, Clio Tsao
Last modified: 05/01/2025
*/

const PDFArray = [];
let pdf_id = null;

function uploadPDF() {
  // uploadPDF uploads the pdf from user into the database
  // get uploaded pdf and any messages
  const fileInput = document.getElementById('pdfInput');
  const file = fileInput.files[0];
  const message = document.getElementById('message');

  // check if valid pdf type
  if (!file || file.type !== 'application/pdf') {
    message.textContent = 'Please select a valid PDF file.';
    return;
  }

  // create data for sending to /upload_pdf
  const formData = new FormData();
  formData.append('pdf_file', file);

  // POST request to endpoint
  fetch('/pdfs', {
    method: 'POST',
    body: formData
  })
  // check response is json
  .then(async response => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { status: response.status, body: data };
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }
  })
  // handle result
  .then(result => {
    if (result.status === 201) {
      message.textContent = result.body.message;
      setTimeout(() => window.location.reload(), 1500);
    } else {
      message.textContent = result.body.message || 'Upload failed.';
    }
  })
  .catch(error => {
    message.textContent = 'An error occurred: ' + error.message;
  });
}


function fetchPDFs() {
    // Fetches all existing PDFs from the database to populate PDFArray[]
    return fetch('http://localhost:5001/pdfs', {
        method: 'GET'
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.description || 'Unknown error');
          });
        }
        return response.json();
      })
      .then(data => {
        PDFArray.length = 0;
        data.forEach(pdf => {
            PDFArray.push({name: pdf.name, id: pdf._id});
        });
        displayDocOptions();
      })
      .catch(error => {
        console.error("Error: ", error.message);
        return [];
      });
  }

function displayDocOptions(){
    for (let i = 0; i < PDFArray.length; i++){
        const thisDoc = document.createElement("button");
        thisDoc.textContent = PDFArray[i].name;
        thisDoc.className = "pdf-button";
        thisDoc.setAttribute('onclick',`displayDocChoice(${i})`);

        const docIcon = document.createElement("i");
        docIcon.className = "fa-regular fa-file-pdf";

        const docArea = document.getElementById("pdf-display");

        const myDoc = document.createElement("div");
        myDoc.className = "doc-el";
        myDoc.appendChild(docIcon);
        myDoc.appendChild(thisDoc);

        docArea.appendChild(myDoc);
    }
}

function displayDocChoice(idx){
    const displayArea = document.getElementById("chosen-doc");
    displayArea.textContent = `You have chosen ${PDFArray[idx].name}`;
    displayArea.style.color = "black";
    pdf_id = PDFArray[idx].id

}

function goSQ(){
    if (pdf_id) {
        window.location.replace(`http://localhost:5001/pdfs/${pdf_id}/surveyQuestion`);
    } else {
        const displayArea = document.getElementById("chosen-doc");
        displayArea.textContent = "Please select a PDF before proceeding.";
        displayArea.style.color = "red";
    }
}

fetchPDFs();
