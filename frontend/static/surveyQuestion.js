/** LOGIC AND FUNCTIONALITY SPECIFIC TO SURVEY & QUESTION MODULE */



/*NAVIGATION*/
function goHome() {
  window.location.replace("http://localhost:5001/home");
}

function goRead() {
  window.location.replace(`http://localhost:5001/pdfs/${pdf_id}/readRecite`);
}















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
        questions.push({question: qa.question, answer: qa.text, page: qa.start_page });
      });
      console.log(questions)
      updateQuestions();
    })
    .catch(error => {
      console.error("Error: ", error.message);
      return [];
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
      setTimeout(() => window.location.reload(), 1500);
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

  const qList = document.getElementById("questions-list");
  qList.innerHTML = "";

  for (let i = 0; i < questions.length; i++) {
    const questionObj = document.createElement("li");
    questionObj.className = "question-obj";

    const questionText = document.createElement("div");
    questionText.className = "q-text";
    questionText.innerHTML = `Q: ${questions[i].question}`;

    const dQuestion = document.createElement("button");
    dQuestion.className = "remove-btn";
    dQuestion.setAttribute("onclick", `removeQuestion(${i})`);
    dQuestion.textContent = `remove`;

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

//saves answer as on screen object (OSO)
function updateAnswer(idx) {

  // THIS SHOULD BE REwritten as a way to save current text to BE
  //const preButton = document.getElementById(`answer${idx}`);
  //preButton.remove();
  const answer = document.getElementById(`answer-area${idx}`);
  const me = questions[idx].anwer +`\n=> ${answer.value.trim()}`;
  //answer.remove();
  questions[idx].answer = me;
  updateQuestions();
  //const answerBtn = document.getElementById("save-ans");
  //answerBtn.remove();
}

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
