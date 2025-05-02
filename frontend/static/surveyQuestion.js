
let chapArray = [];
// let menu = document.getElementById("chapter");
let chap_id = null;
// array for
let sectTags = [];
const menu = document.getElementById("chapter");

let tag_id = null;

async function fetchChaps() {
    // Fetches all existing PDFs from the database to populate PDFArray[]
    return fetch(`http://localhost:5001/pdfs/${pdf_id}/chapters`, {
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
        chapArray.length = 0;
        data.forEach(chap => {
          chapArray.push({id: chap._id, title: chap.title, startPage: chap.start_page, /*notesCount: tag.notes_count */});
        });
        //displayDocOptions();
        console.log(chapArray)
      })
      .catch(error => {
        console.error("Error: ", error.message);
        return [];
      });

  }

fetchChaps();
//fillChapters();


function setChap(){
  chap_id = menu.value;
  fetchTags();
}


async function fetchTags() {
  console.log(chap_id);
  clearSections();
    // Fetches all existing PDFs from the database to populate PDFArray[]
    return fetch(`http://localhost:5001/pdfs/${pdf_id}/chapters/${chap_id}/sections`, {
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
      sectTags.length = 0;
      data.forEach(tag => {
        sectTags.push({title: tag.title, startPage: tag.start_page, notesCount: tag.notes_count });
      });
      //displayDocOptions();
      console.log(sectTags)
      updateSections();
    })
    .catch(error => {
      console.error("Error: ", error.message);
      return [];
    });
    
}

async function fetchTags() {
  console.log(chap_id);
  clearSections();
    // Fetches all existing PDFs from the database to populate PDFArray[]
    return fetch(`http://localhost:5001/pdfs/${pdf_id}/chapters/${chap_id}/sections`, {
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
      sectTags.length = 0;
      data.forEach(tag => {
        sectTags.push({id: tag._id, title: tag.title, startPage: tag.start_page, notesCount: tag.notes_count });
      });
      //displayDocOptions();
      console.log(sectTags)
      updateSections();
    })
    .catch(error => {
      console.error("Error: ", error.message);
      return [];
    });
    
}



/*NAVIGATION*/
function goHome() {
  window.location.replace("http://localhost:5001/home");
}

function goRead() {
  window.location.replace(`http://localhost:5001/pdfs/${pdf_id}/readRecite`);
}















/*QUESTION SECTION*/

let questions = [];

function fetchQAS(id){
  tag_id = id;
  console.log(tag_id);
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
      sectTags.length = 0;
      data.forEach(qa => {
        questions.push({question: qa.question, answer: qa.text, page: qa.start_page });
      });
      //displayDocOptions();
      console.log(questions)
      updateQuestions();
    })
    .catch(error => {
      console.error("Error: ", error.message);
      return [];
    });
    
}

// function fetchNewQAS(){
//  // tag_id = id;
//  //let newQAS = null;
//   console.log(tag_id);
//     // Fetches all existing PDFs from the database to populate PDFArray[]
//     return fetch(`http://localhost:5001/pdfs/${pdf_id}/chapters/${chap_id}/sections/${tag_id}/qas`, {
//       method: 'POST'
//   })
//     .then(response => {
//       if (!response.ok) {
//         return response.json().then(errorData => {
//           throw new Error(errorData.description || 'Unknown error');
//         });
//       }
//       return response.json();
//     })
//     .then(data => {
//       data.forEach(qa => {
//         questions.push({question: qa.question, answer: qa.text, page: qa.start_page });
//       });
//       // displayDocOptions();
//       console.log(questions)
//       updateQuestions();
    
//     })
//     .catch(error => {
//       console.error("Error: ", error.message);
//       return [];
//     });
    
//}

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
    if (questions[i].answer == "undefined") {
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

      saveAnswer = document.createElement("button");
      saveAnswer.setAttribute("onclick", `updateAnswer(${i})`);
      saveAnswer.textContent = `Save Answer`;
      saveAnswer.className = "save-ans";
      //questionObj.appendChild(saveMe);
     } else {
      //there is an answer
      saveAnswer = document.createElement("div");
      saveAnswer.className = "answer-el";
      saveAnswer.innerHTML = `${questions[i].answer}`;
    }

    questionObj.appendChild(saveAnswer);
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
  //const preButton = document.getElementById(`answer${idx}`);
  //preButton.remove();
  const answer = document.getElementById(`answer-area${idx}`);
  questions[idx][1] = `A: ${answer.value.trim()}`;
  //answer.remove();
  updateQuestions();
  //const answerBtn = document.getElementById("save-ans");
  //answerBtn.remove();
}

/**SECTION TAGS */

// stand in arrays, need functions to load from BE






// loads chapters into select menu
function fillChapters() {
    console.log("helo");
 for (let i = 0; i < chapArray.length; i++) {
    const chapHolder = document.createElement("div");
    chapHolder.className = "chap-obj";

    const chapter = document.createElement("option");
    chapter.innerHTML = `${chapArray[i].title}`;
    chapter.value = chapArray[i].id;
    console.log(chapArray[i]);

    
    chapHolder.appendChild(chapter);
    menu.appendChild(chapHolder);
  }

  const chapBtn = document.getElementById("chapters-btn");
  chapBtn.innerHTML = `ADD NEW`;
  chapBtn.setAttribute("onclick", addChapter());

  const noSelect = document.getElementById("no-select");
  noSelect.textContent = `Choose a Chapter`;
}















// // populates sectTags array with all sections from chosen chapter
// function fillTags() {
//   clearSections();
//   const chap = document.getElementById("chapter").value;
//   const mySections = sectArray[chap];

//   for (let i = 0; i < mySections.length; i++) {
//     sectTags.push(`${mySections[i].title}`);
//   }
//   updateSections();}


// displays sectTags as OSO (On Screen Object)
function updateSections() {
  const tagList = document.getElementById("tags");
  tagList.innerHTML = "";
  for (let i = 0; i < sectTags.length; i++) {
    const tag = document.createElement("li");
    tag.className = "tag";

    let tagTitle = document.createElement("div");
    tagTitle.className = "tag-title";
    tagTitle.innerHTML = `${sectTags[i].title}`;

    // Create REVIEW SET button with onclick attribute
    const viewButton = document.createElement("button");
    viewButton.textContent = "VIEW SET";
    viewButton.className = "view-button";
    viewButton.setAttribute("onclick", fetchQAS(sectTags[i].id))

    const rmvButton = document.createElement("button");
    rmvButton.textContent = "REMOVE SET";
    //saveMe.setAttribute("onclick", `removeS()`);
    rmvButton.className = "view-button";

    // viewButtonButton.setAttribute('onclick', `setSection(${i})`);
    tag.appendChild(tagTitle);
    tag.appendChild(viewButton);
    tag.appendChild(rmvButton);

    tagList.appendChild(tag);
  }
}



function clearSections() {
  sectTags = [];
  updateSections();
}

function clearS() {
  const quest = document.getElementById("new-section");
  quest.textContent = "";
}

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
