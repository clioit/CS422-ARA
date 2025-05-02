/* SECTION TAGS SECTION */

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
        viewButton.textContent = 'REVIEW SET';
        viewButton.className = 'view-button';
        // deleteButton.setAttribute('onclick', `deleteTask(${i})`);
        tag.appendChild(tagTitle);
        tag.appendChild(viewButton);

        tagList.appendChild(tag);

}
}

function clearSections(){
   sectTags = [];
   updateSections();
}


/* NAVIGATION */


function goHome(){
    window.location.replace("http://localhost:5001/home");
  }



// Need to know pdf_id from backend (already passed in review.html), and chapter_id/section_id
let chapterId = null;
let sectionId = null;

// Loads flashcards when user selects chapter and section
function loadFlashcards() {
    if (!pdf_id || !chapterId || !sectionId) {
        console.log("Missing selection");
        return;
    }

    fetch(`/pdfs/${pdf_id}/chapters/${chapterId}/sections/${sectionId}/qas`)
    .then(response => response.json())
    .then(data => {
        const container = document.querySelector('.columns__cards--content');
        container.innerHTML = '';

        if (data.length === 0) {
            container.innerHTML = "<p>No flashcards yet.</p>";
            return;
        }

        data.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('flashcard');

            cardDiv.innerHTML = `
                <h3>Q: ${card.question}</h3>
                <button class="show-answer-btn">Show Answer</button>
                <p class="answer" style="display: none;">A: ${card.text ? card.text : "No answer yet."}</p>
            `;

           container.appendChild(cardDiv);
        });


        

 //review.js should only retrieve/display  the text from Survery/Questions