const PDFArray = [];

function logout(){
    console.log("logout clicked!");
    window.location.replace("http://localhost:5001/");
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
            PDFArray.push(pdf.name);
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
        thisDoc.textContent = PDFArray[i];
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
    displayArea.textContent = `You have chosen ${PDFArray[idx]}`;
}

function goSQ(){
    window.location.replace("http://localhost:5001/surveyQuestion");
  }

fetchPDFs();