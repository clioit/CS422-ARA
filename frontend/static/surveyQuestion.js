/*
Functions for Survey & Question page functionality. Inlcudes adding new chapters, sections, and questions and answers.
Created for CS 422 Project 1: ARA in Spring 2025.

Authors: Claire Cody, Clio Tsao
Last modified: 05/05/2025
*/

/** LOGIC AND FUNCTIONALITY SPECIFIC TO SURVEY & QUESTION MODULE */



/*NAVIGATION*/
function goHome() {
  window.location.replace("http://localhost:5001/home");
}

function goRead() {
  window.location.replace(`http://localhost:5001/pdfs/${pdf_id}/readRecite`);
}


let note_id = null;


/*QUESTION SECTION*/
let questions = [];

function getData(){
  questions =[];
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
        questions.push({question: qa.question, answer: qa.text, page: qa.start_page, id: qa._id });
      });
      note_id = questions[0].id;
      console.log(questions)
      updateQuestions();
    })
    .catch(error => {
      console.error("Error: ", error.message);
      return [];
    });
    
}

function postChapter() {
  console.log("entered postChapter");
  // postchapter adds a new chapter from user into the database
  // get chapter input
  const chapter = document.getElementById('new-chapter').value;
  const chapterMsg = document.getElementById('chapter-message');
  const chapterPage = document.getElementById('chapter-page').value;
  const chapPageMsg = document.getElementById('chap-page-message');
  // check if a section was entered
  if (!chapter) {
    chapterMsg.textContent = 'Please enter a chapter name!';
    return;
  }
  if (!chapterPage) {
    chapPageMsg.textContent = 'On what page does the chapter start?';
    return;
  }
  // POST request to endpoint
  fetch(`/pdfs/${pdf_id}/chapters`, {
    method: 'POST',
    body: JSON.stringify({
      title: chapter,
      start_page: chapterPage
   })
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
      chapPageMsg.textContent = result.body.message;
      window.location.reload();
    } else {
      chapPageMsg.textContent = result.body.message || 'Add section failed.';
    }
  })
  .catch(error => {
    chapPageMsg.textContent = 'An error occurred: ' + error.message;
  });
}

function postSection() {
  console.log("entered postSection");
  // postSection adds a new section tag from user into the database
  // get section tag input
  const section = document.getElementById('new-section').value;
  const sectionMsg = document.getElementById('section-message');
  const sectionPage = document.getElementById('section-page').value;
  const pageMsg = document.getElementById('page-message');
  // check if a section was entered
  if (!section) {
    sectionMsg.textContent = 'Please give your tag a name. Labels are a great way to organize your notes and can help you review later!';
    return;
  }
  if (!sectionPage) {
    pageMsg.textContent = 'Please enter a page number for the start of the section.';
    return;
  }
  if (!sectionPage) {
    pageMsg.textContent = 'Please select a chapter.';
    return;
  }

  // POST request to endpoint
  fetch(`/pdfs/${pdf_id}/chapters/${chap_id}/sections`, {
    method: 'POST',
    body: JSON.stringify({
      title: section,
      start_page: sectionPage
   })
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
      pageMsg.textContent = result.body.message;
      sectionMsg.textContent = "";
      setChap();
      // setTimeout(() => window.location.reload(), 1500);
    } else {
      pageMsg.textContent = result.body.message || 'Add section failed.';
    }
  })
  .catch(error => {
    pageMsg.textContent = 'An error occurred: ' + error.message;
  });
}


function postQuestion() {
  console.log("entered postQuestion");
  // postQuestion adds a new question from user into the database
  // get question input
  const question = document.getElementById('question').value;
  const qMessage = document.getElementById('question-message')
  const qList = document.getElementById('questions-list');

  // check if a question was entered
  if (!question) {
    qMessage.textContent = 'Please enter a question.';
    return;
  }
  if (!chap_id) {
    qMessage.textContent = 'Please select a chapter.';
    return;
  }
  else if (!tag_id) {
    qMessage.textContent = 'Please select a section.';
    return;
  }

  // POST request to endpoint
  fetch(`/pdfs/${pdf_id}/chapters/${chap_id}/sections/${tag_id}/qas`
    , {
    method: 'POST',
    body: JSON.stringify({
      start_page: 0,
      text: "",
      question: question
   })
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
      qMessage.textContent = "Question saved.";
      getData();
    } else {
      qMessage.textContent = result.body.message || 'Enter question failed.';
    }
  })
  .catch(error => {
    qMessage.textContent = 'An error occurred: ' + error.message;
  });
}


// store user input in questions array
function addQuestion() {
  const questionIn = document.getElementById("question").value.trim();
  console.log(questionIn);
  let newQ = {question: questionIn};
  questions.unshift(newQ);
  console.log(`top`);
  updateQuestions();
  clearQ();
}

function clearQ() {
  const quest = document.getElementById("question");
  quest.textContent = "";
}

// places questions array on screen
function updateQuestions() {
  console.log(`here`);
  console.log(questions);
  //newQuestions();
  const qList = document.getElementById("questions-list");
  qList.innerHTML = "";

  for (let i = 0; i < questions.length; i++) {
    const questionObj = document.createElement("li");
    questionObj.className = "question-obj";

    const questionText = document.createElement("div");
    questionText.className = "q-text";
    questionText.innerHTML = `Q: ${questions[i].question}`;

    const ansQuestion = document.createElement("button");
    ansQuestion.className = "ans-btn";
    ansQuestion.setAttribute("onclick", document.createElement("text"));
    ansQuestion.textContent = `Add Answer`;

    const dQuestion = document.createElement("button");
    dQuestion.className = "remove-btn";
    dQuestion.setAttribute("onclick", `removeQuestion(${i})`);
    dQuestion.textContent = `Remove`;

    questionObj.appendChild(questionText);

    let saveAnswer;
    // if (questions[i].answer /*== "undefined"*/) {
      //there isn't an answer
      //     saveAnswer = document.createElement("button");
      //     saveAnswer.id = `answer${i}`;
      //    saveAnswer.setAttribute("onclick", `makeAnswer(${i})`);
      //    saveAnswer.textContent = `ANSWER`;
      const children = qList.children;
      const answerArea = document.createElement("textarea");
      answerArea.className = "answer-area";
      answerArea.id = `answer-area${i}`;

      answerArea.addEventListener("blur", function () {
        let notesContent = answerArea.value;
        let quest = questions[i].question;
        saveNote(notesContent,quest);
      });

      
      // const q2ba = children[i];
      questionObj.appendChild(answerArea);
      answerArea.value = `${questions[i].answer}`;
      newAnswer = document.createElement("button");
      newAnswer.setAttribute("onclick", `updateAnswer(${i})`);
      newAnswer.textContent = `SAVE`;
      newAnswer.className = "save-ans";
      //questionObj.appendChild(saveMe);
    //  } else {
      //there is an answer
      // saveAnswer = document.createElement("div");
      // saveAnswer.className = "answer-el";
      // saveAnswer.innerHTML = `=> ${questions[i].answer}`;
    //}

  
    //questionObj.appendChild(newAnswer);
    //questionObj.appendChild(saveAnswer);
    questionObj.appendChild(dQuestion);

    qList.appendChild(questionObj);
  }
  //newQuestions();
}

function removeQuestion(idx) {
  questions.splice(idx, 1);
  updateQuestions();
}

//creates area for question to be answered
function makeAnswer(idx) {
  const parent = document.getElementById("questions-list");
  const children = parent.children;
  const answerArea = document.createElement("textarea");
  answerArea.className = "answer-area";
  answerArea.id = `answer-area${idx}`;
  const q2ba = children[idx];
  q2ba.appendChild(answerArea);

  const saveMe = document.createElement("button");
  saveMe.setAttribute("onclick", `updateAnswer(${idx})`);
  saveMe.textContent = `Save Answer`;
  saveMe.className = "save-ans";
  q2ba.appendChild(saveMe);
}

// //saves answer as on screen object (OSO)
// function updateAnswer(idx) {

//   // THIS SHOULD BE REwritten as a way to save current text to BE
//   //const preButton = document.getElementById(`answer${idx}`);
//   //preButton.remove();
//   const answer = document.getElementById(`answer-area${idx}`);
//   const me = questions[idx].anwer +`\n=> ${answer.value.trim()}`;
//   //answer.remove();
//   questions[idx].answer = me;
//   updateQuestions();
//   //const answerBtn = document.getElementById("save-ans");
//   //answerBtn.remove();
// }

/**SECTION TAGS */


function addSection() {
  const sectionName = document.getElementById("new-section").value.trim();
  //console.log(questionIn);
  const currChap = document.getElementById("chapter").value;

  if (currChap == "") {alert("Choose a Chapter from the dropdown.")}
  else{
  if (sectionName!= ""){

  console.log(currChap);
  sectArray[currChap].push(sectionName);
  console.log(sectArray);
  console.log(`top`);
  fillTags();
  clearS();}
  else{
    alert("Please give your tag a name. Labels are a great way to organize your notes and can help you review later!");
  }}
}



function addChapter(){
  
  const addBtn = document.getElementById("chapters-btn");

  const sectionTopper = document.getElementById("section-topper");
  const sectionTop = document.createElement("div");
  sectionTop.className = "add-area";
  const titleArea = document.createElement("div");
  titleArea.className = "title-area";
  

  // const titleLabel = document.createElement("label");
  // titleLabel.setAttribute("for", "new-title");
  const titleInput = document.createElement("input");
  titleInput.id = "new-title";
  titleInput.setAttribute("placeholder", "New Chapter");
titleArea.appendChild(titleInput);
  const startLabel = document.createElement("label");
  startLabel.setAttribute("for", "start-pg");
  startLabel.textContent = "Starts on Page: ";
  const startInput = document.createElement("input");
  startInput.id ="start-pg";
  startInput.setAttribute("type", "number"); 
  startInput.setAttribute("placeholder", "Starts on Page");

  
  sectionTop.appendChild(startLabel);
  sectionTop.appendChild(startInput);
titleArea.appendChild(addBtn);
  sectionTop.appendChild(titleArea);


  sectionTopper.appendChild(sectionTop);

}





// Saves note data with default start page of 1
function saveNote(noteText, quest) {

  console.log('hi');
  const QData = {
    text: noteText,
    question: quest

   // start_page: 1,
  };

  let method;
  let url;
  
  // If note exists, find note to edit. Otherwise, create note and return its ID
  if (note_id) {
    method = "PATCH";
    url = `/pdfs/${pdf_id}/chapters/${chap_id}/sections/${tag_id}/qas/${note_id}`;
  } else {
    method = "POST";
    url = `/pdfs/${pdf_id}/chapters/${chap_id}/sections/${tag_id}/qas`;
  }

  fetch(url, { method: method, body: JSON.stringify(QData), })
    .then((response) => response.json())
    .then(
      (data) => {
      if (method === "POST") {
        note_id = data._id;
      }
      getData();
  });
}


// let saveQ = [];

// function newQuestions(){
// // Saves note when user types
// //if(questions.length>0){
// for (let i = 0;i<questions.length; i++){
//  saveQ[i] = document.getElementById(`answer-area${i}`);
//  note_id = questions[i].id;
// saveQ[i].addEventListener("input", function () {
//     let notesContent = saveQ[i].value;
//     let quest = questions[i].question;
//     saveNote(notesContent,quest);
//   });
// }}
//}


// function removeS(){

// }

// function newQuestion(){
//     const questionText = get
// }

// add QUESTION
// edit QUESTION
// ANSWER question
// REMOVE question
// UPDATE Q display

// add SECTION
// add CHAPTER
// remove SECTION

// onclick for sections buttons has function to set value of let var = currSect

// other functionality, adding an answer to a question like adding a question to the list
// one question can have multiple answers, easier than going back to edit old answers?
// make answers removable?
