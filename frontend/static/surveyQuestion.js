/*NAVIGATION*/
function goHome(){
    window.location.replace("http://localhost:5001/home");
}

function goRead(){
    window.location.replace(`http://localhost:5001/pdfs/${pdf_id}/readRecite`);
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
    dQuestion.className = "remove-btn";
    dQuestion.setAttribute("onclick", `removeQuestion(${i})`);
    dQuestion.textContent = `remove`;
   
    questionObj.appendChild(questionText);
    
    
    let saveAnswer;
    if(questions[i][1]==''){ //there isn't an answer
    saveAnswer = document.createElement("button");
    saveAnswer.id = `answer${i}`;
   saveAnswer.setAttribute("onclick", `makeAnswer(${i})`);
   saveAnswer.textContent = `ANSWER`;}
   else { //there is an answer
    saveAnswer = document.createElement("div");
    saveAnswer.className = "answer-el";
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
    const answerBtn = document.getElementById("save-ans");
    answerBtn.remove();
}



/**SECTION TAGS */

// stand in arrays, need functions to load from BE
const sectArray = [[`hi`,`hello`, `bye`],[`hi`,`ski`, `bye`]];
const chapArray = [[`one`, 0],[`two`, 1]];

// loads chapters into select menu
function fillChapters(){
    for(let i=0; i<chapArray.length;i++){
        const chapHolder = document.createElement("div");
        chapHolder.className = "chap-obj";
        
        const chap = document.createElement("option");
        chap.textContent = `${chapArray[i][0]}`;
        chap.value = chapArray[i][1];
        
        const menu = document.getElementById("chapter");
        chapHolder.appendChild(chap);
        menu.appendChild(chapHolder);
    }
}

fillChapters();

// array for 
let sectTags = [];

// populates sectTags array with all sections from chosen chapter
function fillTags(){
    clearSections();
    const chap = document.getElementById("chapter").value;
    const mySections = sectArray[chap];

    for(let i = 0; i<mySections.length; i++){
    sectTags.push(`${mySections[i]}`);
    }
    updateSections();
}

// displays sectTags as OSO (On Screen Object)
function updateSections(){
    const tagList = document.getElementById("tags");
    tagList.innerHTML = '';
    for(let i=0; i<sectTags.length; i++){

        const tag = document.createElement('li');
        tag.className = "tag";

        let tagTitle = document.createElement('div');
        tagTitle.className = 'tag-title';
        tagTitle.innerHTML = `${sectTags[i]}`;

        // Create REVIEW SET button with onclick attribute
        const viewButton = document.createElement('button');
        viewButton.textContent = 'VIEW SET';
        viewButton.className = 'view-button';

        const rmvButton = document.createElement('button');
        rmvButton.textContent = 'REMOVE SET'
      //saveMe.setAttribute("onclick", `removeS()`);
        rmvButton.className = 'view-button';

       // viewButtonButton.setAttribute('onclick', `setSection(${i})`);
        tag.appendChild(tagTitle);
        tag.appendChild(viewButton);
        tag.appendChild(rmvButton);

        tagList.appendChild(tag);

}
}

function clearSections(){
   sectTags = [];
   updateSections();
}

function clearS(){
    const quest = document.getElementById("new-section");
    quest.textContent = '';
}

function addSection(){
    const sectionName = document.getElementById("new-section").value.trim();
    //console.log(questionIn);
    const currChap = document.getElementById("chapter").value;
    console.log(currChap);
    sectArray[currChap].push(sectionName);
    console.log(sectArray);
    console.log(`top`);
    fillTags();
    clearS();}

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
