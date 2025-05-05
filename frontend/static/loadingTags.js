let chapArray = [];
// let menu = document.getElementById("chapter");
//let chap_id = null;
// array for
let sectTags = [];
const menu = document.getElementById("chapter");

//let tag_id = null;

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
        fillChapters();
      })
      .catch(error => {
        console.error("Error: ", error.message);
        return [];
      });

  }

fetchChaps();

function setChap(){
    console.log("entering setChap()", chap_id);
    chap_id = menu.value;
    fetchTags();
  }

  async function fetchTags() {
    console.log("entering fetchTags()", chap_id);
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
        sectTags = [];
        data.forEach(tag => {
          sectTags.push({title: tag.title, startPage: tag.start_page, notesCount: tag.notes_count, id: tag._id });
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

  // const noSelect = document.getElementById("no-select");
  // noSelect.textContent = `Choose a Chapter`;
}


//   const chapBtn = document.getElementById("chapters-btn");
//   chapBtn.innerHTML = `ADD NEW`;
//   chapBtn.setAttribute("onclick", addChapter());

//   const noSelect = document.getElementById("no-select");
//   noSelect.textContent = `Choose a Chapter`;
// }

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
      viewButton.textContent = "SELECT SECTION";
      viewButton.className = "view-button";
      viewButton.addEventListener('click', function() {
        console.log("change", sectTags[i].id);
        tag_id = sectTags[i].id;
        getData();
      });
       // view BUtton attatches id to button, calls correct function for data load*/

      const rmvButton = document.createElement("button");
      rmvButton.textContent = "REMOVE SECTION";
      //saveMe.setAttribute("onclick", `removeS()`);
      rmvButton.className = "view-button";
  
      // viewButtonButton.setAttribute('onclick', `setSection(${i})`);
      tag.appendChild(tagTitle);
      tag.appendChild(viewButton);
      tag.appendChild(rmvButton);
  
      tagList.appendChild(tag);
    }
  }

  function changeSection(id){
    console.log("change", id);
    tag_id = id;
    //getData();
    //viewQuestions();
  }

  function clearSections() {
    sectTags = [];
    updateSections();
  }
  
  function clearS() {
    const quest = document.getElementById("new-section");
    quest.textContent = "";
  }
  
//   function addSection() {
//     const sectionName = document.getElementById("new-section").value.trim();
//     //console.log(questionIn);
//     const currChap = document.getElementById("chapter").value;
  
//     if (currChap == "") {alert("Choose a Chapter from the dropdown.")}
//     else{
//     if (sectionName!= ""){
  
//     console.log(currChap);
//     sectArray[currChap].push(sectionName);
//     console.log(sectArray);
//     console.log(`top`);
//     fillTags();
//     clearS();}
//     else{
//       alert("Please give your tag a name. Labels are a great way to organize your notes and can help you review later!");
//     }}
//   }
  
  
  
//   function addChapter(){
    
//     const addBtn = document.getElementById("chapters-btn");
  
//     const sectionTopper = document.getElementById("section-topper");
//     const sectionTop = document.createElement("div");
//     sectionTop.className = "add-area";
//     const titleArea = document.createElement("div");
//     titleArea.className = "title-area";
    
  
//     // const titleLabel = document.createElement("label");
//     // titleLabel.setAttribute("for", "new-title");
//     const titleInput = document.createElement("input");
//     titleInput.id = "new-title";
//     titleInput.setAttribute("placeholder", "New Chapter");
//   titleArea.appendChild(titleInput);
//     const startLabel = document.createElement("label");
//     startLabel.setAttribute("for", "start-pg");
//     startLabel.textContent = "Starts on Page: ";
//     const startInput = document.createElement("input");
//     startInput.id ="start-pg";
//     startInput.setAttribute("type", "number"); 
//     startInput.setAttribute("placeholder", "Starts on Page");
  
    
//     sectionTop.appendChild(startLabel);
//     sectionTop.appendChild(startInput);
//   titleArea.appendChild(addBtn);
//     sectionTop.appendChild(titleArea);
  
  
//     sectionTopper.appendChild(sectionTop);
  
//   }