// /* SECTION TAGS SECTION */

// // stand in arrays, need functions to load from BE
// // const sectArray = [[`hi`,`hello`, `bye`],[`hi`,`ski`, `bye`]];
// // const chapArray = [[`one`, 0],[`two`, 1]];

// // loads chapters into select menu
// function fillChapters(){
//     for(let i=0; i<chapArray.length;i++){
//         const chapHolder = document.createElement("div");
//         chapHolder.className = "chap-obj";
        
//         const chap = document.createElement("option");
//         chap.textContent = `${chapArray[i][0]}`;
//         chap.value = chapArray[i][1];
        
//         const menu = document.getElementById("chapter");
//         chapHolder.appendChild(chap);
//         menu.appendChild(chapHolder);
//     }
// }

// fillChapters();

// // array for 
// let sectTags = [];

// // populates sectTags array with all sections from chosen chapter
// function fillTags(){
//     clearSections();
//     const chap = document.getElementById("chapter").value;
//     const mySections = sectArray[chap];

//     for(let i = 0; i<mySections.length; i++){
//     sectTags.push(`${mySections[i]}`);
//     }
//     updateSections();
// }

// // displays sectTags as OSO (On Screen Object)
// function updateSections(){
//     const tagList = document.getElementById("tags");
//     tagList.innerHTML = '';
//     for(let i=0; i<sectTags.length; i++){

//         const tag = document.createElement('li');
//         tag.className = "tag";

//         let tagTitle = document.createElement('div');
//         tagTitle.className = 'tag-title';
//         tagTitle.innerHTML = `${sectTags[i]}`;

//         // Create REVIEW SET button with onclick attribute
//         const viewButton = document.createElement('button');
//         viewButton.textContent = 'REVIEW SET';
//         viewButton.className = 'view-button';
//         // deleteButton.setAttribute('onclick', `deleteTask(${i})`);
//         tag.appendChild(tagTitle);
//         tag.appendChild(viewButton);

//         tagList.appendChild(tag);

// }
// }

// function clearSections(){
//    sectTags = [];
//    updateSections();
// }

let questions = [];

function getData(){
  getCurrTag();
  console.log("im here");
  questions = [];
  //let tag_id = id;
  //console.log(tag_id);
    // Fetches all existing PDFs from the database to populate PDFArray[]
    return fetch(`http://localhost:5001/pdfs/${pdf_id}/chapters/${chap_id}/sections/${tag_id}/qas`, {
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
      data.forEach(qa => {
        questions.push({question: qa.question, answer: qa.text, page: qa.start_page });
      });
      //displayDocOptions();
      console.log(questions)
      //updateQuestions();
      getDataContinued();
    })
    .catch(error => {
      console.error("Error: ", error.message);
      return [];
    });
    
}

function getDataContinued(){
  console.log("im now here");
  //questions = [];
  //let tag_id = id;
  //console.log(tag_id);
    // Fetches all existing PDFs from the database to populate PDFArray[]
    return fetch(`http://localhost:5001/pdfs/${pdf_id}/chapters/${chap_id}/sections/${tag_id}/notes`, {
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
      data.forEach(note => {
        questions.push({answer: "", question: note.text, page: note.start_page });
      });
      //displayDocOptions();
      console.log(questions)
      //updateQuestions();
      viewQuestions();
    })
    .catch(error => {
      console.error("Error: ", error.message);
      return [];
    });
    
}

let currTag;

function getCurrTag(){
  console.log("im now here");
  //questions = [];
  //let currentSect;
  //console.log(tag_id);
    // Fetches all existing PDFs from the database to populate PDFArray[]
    return fetch(`http://localhost:5001/pdfs/${pdf_id}/chapters/${chap_id}/sections/${tag_id}`, {
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
        currTag = data.title;
      //displayDocOptions();
      console.log(questions)
      //updateQuestions();
      viewQuestions();
    })
    .catch(error => {
      console.error("Error: ", error.message);
      return [];
    });
    
}

//getData();

/* NAVIGATION */


function goHome(){
    window.location.replace("http://localhost:5001/home");
  }


  let cardIdx = 0;
  let flipped = false;
  

 function viewQuestions(){
 // await getData(); // wait for data before moving on

  console.log('loaded', questions);
  console.log(questions[0]);
  console.log(questions[cardIdx].answer);
  const Q = document.getElementById("question");
  const A = document.getElementById("answer");

  Q.textContent = "";
  A.textContent = "";

  Q.innerHTML = `${questions[cardIdx].question}`;
  if (questions[cardIdx].answer === ""){
    A.innerHTML = `${currTag}`;
    document.getElementById("reveal").classList.add('hidden');
    document.getElementById("card").classList.add('upside-down');}
  else {
    document.getElementById("reveal").classList.remove('hidden');
    document.getElementById("card").classList.remove('upside-down');
  if (flipped){ 
      A.innerHTML = `${questions[cardIdx].answer}`;
      
}}}

function next(){
  if (cardIdx< questions.length-1) cardIdx++;
  else cardIdx=0;
  flipped=false;
  viewQuestions();
}

function flip(){
  flipped =! flipped;
  viewQuestions();

  const view = document.getElementById("reveal");

  if (flipped) view.innerHTML = `HIDE`;
  else view.innerHTML = `REVEAL`;
}
//viewQuestions();

function toEdit(){
  if (questions[cardIdx].answer === ""){
    window.location.replace(`http://localhost:5001/pdfs/${pdf_id}/readRecite`);
}
else window.location.replace(`http://localhost:5001/pdfs/${pdf_id}/surveyQuestion`);
}