/*
Functions for review page functionality. Inlcudes displaying selected sets as flashcards to review.
Created for CS 422 Project 1: ARA in Spring 2025.

Authors: Claire Cody, Clio Tsao
Last modified: 05/02/2025
*/

/* STATIC JavaScript specified for review Module (review.html)
Includes functionality for gathering all notes + QAs for current Chapter & Section
Displays these as notecards with "reveal\hide" functionality for QA
Allows user to iterate through set
*/


/* DATA FETCHING */


// initialize empt questions array to load in notecard information
let questions = [];

async function getData(){
  // pushes each QA from current section into the questions array
  await getCurrTag();
  questions = [];
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
      console.log(questions)
      getDataContinued();
    })
    .catch(error => {
      console.error("Error: ", error.message);
      return [];
    });
    
}

function getDataContinued(){
    // Fetches all existing notes from the current section and pushes to questions Array
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
      console.log(questions)
      viewQuestions();
    })
    .catch(error => {
      console.error("Error: ", error.message);
      return [];
    });
    
}

// variable for storing current section title
let currTag;

function getCurrTag(){
//loads currTag
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
     // viewQuestions();
    })
    .catch(error => {
      console.error("Error: ", error.message);
      return [];
    });
    
}




/* NOTECARD FUNCTIONS */


  let cardIdx = 0;
  let flipped = false;
  

 function viewQuestions(){
  // displays content of notecard at cardIdx
  const Q = document.getElementById("question");
  const A = document.getElementById("answer");

  Q.textContent = "";
  A.textContent = "";

  Q.innerHTML = `${questions[cardIdx].question}`;
  if (questions[cardIdx].answer === ""){
    A.innerHTML = `${currTag}`;
    document.getElementById("reveal").classList.add('hidden');
    document.getElementById("card").classList.add('upside-down');
    document.getElementById("view").className ="yellow";}
  else {
    document.getElementById("reveal").classList.remove('hidden');
    document.getElementById("card").classList.remove('upside-down');
    document.getElementById("view").className = "red";
  if (flipped){ 
      A.innerHTML = `${questions[cardIdx].answer}`;
      
}}}

function next(){
  //iterates through note set - BTN[NEXT>>]
  if (cardIdx< questions.length-1) cardIdx++;
  else cardIdx=0;
  flipped=false;
  viewQuestions();
  const view = document.getElementById("reveal");

  view.innerHTML = `REVEAL`;

}

function back(){
  //iterates through note set - BTN[NEXT>>]
  if (cardIdx> 0) cardIdx--;
  else cardIdx=questions.length-1;
  flipped=false;
  viewQuestions();
}

function flip(){
  // functionality for BTN - [REVEAL | SHOW] 
  flipped =! flipped;
  viewQuestions();

  const view = document.getElementById("reveal");

  if (flipped) view.innerHTML = `HIDE`;
  else view.innerHTML = `REVEAL`;
}




/* NAVIGATION */


function goHome(){
  window.location.replace("http://localhost:5001/home");
}
function toEdit(){
  if (questions[cardIdx].answer === ""){
    window.location.replace(`http://localhost:5001/pdfs/${pdf_id}/readRecite`);
}
else window.location.replace(`http://localhost:5001/pdfs/${pdf_id}/surveyQuestion`);
}