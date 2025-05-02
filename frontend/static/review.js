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


// Should only retrieve/display the text from Survey/Questions and ?readRecite?
// Need to know pdf_id from backend (already passed in review.html), and chapter_id/section_id
//from backend @app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections/<section_id>/qas', methods=['GET', 'POST'])
let chapter_id = null;
let section_id = null;

// Load flashcards when user selects chapter and section
function loadFlashcards() {
    if (!pdf_id || !chapter_id || !section_id) {
        console.log("Missing selection");
        return;
    }

    fetch(`/pdfs/${pdf_id}/chapters/${chapter_id}/sections/${section_id}/qas`)
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

       //Event listeners for each "Show Answer" button
        const showButtons = document.querySelectorAll('.show-answer-btn');
        showButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const answer = btn.nextElementSibling;
                answer.style.display = 'block';
                btn.style.display = 'none';
            });
        });
    })
    .catch(error => {
        console.error("Error loading flashcards:", error);
    });
}

// These documents are for users to be able to choose which chapter/section flashcards to fetch.
// When user selects a chapter (from dropdown)
document.getElementById('chapter').addEventListener('change', function() {
    chapter_id = this.value;
    // I may also want to clear the section_id or load sections here?
});

// When user clicks on a section (assumed to be in list with section-tag and data-section-id)
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('section-tag')) {
        section_id = e.target.dataset.section=_id;
        loadFlashcards();
    }
});
