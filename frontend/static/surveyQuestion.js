/*NAVIGATION*/

function goRead(){
    window.location.replace("http://localhost:5001/readRecite");

}



/*QUESTION SECTION*/

let questions = [];

// store user input in questions array
function addQuestion(){
    const questionIn = document.getElementById("question").value.trim();
    console.log(questionIn);
    let newQ = [questionIn, ''];
    questions.unshift(newQ);
    console.log(`top`);
    updateQuestions();
    clearQ();}


function clearQ(){
    const quest = document.getElementById("question");
    quest.textContent = '';
}

// places questions array on screen
function updateQuestions(){
    console.log(`here`);
    console.log(questions);

    const qList = document.getElementById("questions-list");
    qList.innerHTML ='';

    for(let i=0; i<questions.length;i++){

    const questionObj = document.createElement("li");
    questionObj.className = "question-obj";

    const questionText = document.createElement("div");
    questionText.className = "q-text"
    questionText.innerHTML = `Q: ${questions[i][0]}`;

    const dQuestion = document.createElement("button");
    dQuestion.setAttribute("onclick", `removeQuestion(${i})`);
    dQuestion.textContent = `remove`;
   
    questionObj.appendChild(questionText);
    
    
    let saveAnswer;
    if(questions[i][1]==''){
    saveAnswer = document.createElement("button");
    saveAnswer.id = `answer${i}`;
   saveAnswer.setAttribute("onclick", `makeAnswer(${i})`);
   saveAnswer.textContent = `ANSWER`;}
   else {
    saveAnswer = document.createElement("div");
    saveAnswer.innerHTML = `${questions[i][1]}`;
   }

    questionObj.appendChild(saveAnswer);
    questionObj.appendChild(dQuestion);

    qList.appendChild(questionObj);}
}

function removeQuestion(idx){
    questions.splice(idx, 1);
    updateQuestions();
}

//creates area for question to be answered
function makeAnswer(idx){
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
function updateAnswer(idx){
    const preButton = document.getElementById(`answer${idx}`);
    preButton.remove();
    const answer = document.getElementById(`answer-area${idx}`);
    questions[idx][1] = `A: ${answer.value.trim()}`;
    answer.remove();
    updateQuestions();
    const but = document.getElementById("save-ans");
    but.remove();
}
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
