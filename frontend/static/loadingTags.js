/** LOGIC AND FUNCTIONS ASSOCIATED WITH CHAPTERS & SECTIONS TAG COLUMN */

//initializing On-Screen area and empty arrays for chapters and sections
let chapArray = [];
let sectTags = [];
const menu = document.getElementById("chapter");


async function fetchChaps() {
    // Fetches all existing Chapters from the PDF to populate chapArray[]
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
          chapArray.push({id: chap._id, title: chap.title, startPage: chap.start_page});
        });
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
      // Fetches all existing sections from the chapter to populate sectTags[]
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
        console.log(sectTags)
        updateSections();
      })
      .catch(error => {
        console.error("Error: ", error.message);
        return [];
      });
      
  }


function fillChapters() {
  // loads chapters into select menu
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

}


function updateSections() {
  // displays sectTags as OSO (On Screen Object)
    const tagList = document.getElementById("tags");
    tagList.innerHTML = "";
    for (let i = 0; i < sectTags.length; i++) {
      const tag = document.createElement("li");
      tag.className = "tag";
  
      let tagTitle = document.createElement("div");
      tagTitle.className = "tag-title";
      tagTitle.innerHTML = `<p>${sectTags[i].title}<p>`;
  
      let tagPage = document.createElement("h6");
      tagPage.innerHTML = `begins on pg.${sectTags[i].startPage}`
      tagTitle.appendChild(tagPage);
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
      rmvButton.addEventListener('click', function() {
        console.log("change", sectTags[i].id);
        tag_id = sectTags[i].id;
        removeSection(tag_id);
        fetchTags();
      });      
      rmvButton.className = "view-button";
      // const rmvButton = document.createElement("button");
      // rmvButton.textContent = "REMOVE SET";
      // //saveMe.setAttribute("onclick", `removeS()`);
      // rmvButton.className = "view-button";
  
      // viewButtonButton.setAttribute('onclick', `setSection(${i})`);
      tag.appendChild(tagTitle);
      tag.appendChild(viewButton);
     // tag.appendChild(rmvButton);
  
      tagList.appendChild(tag);
    }
  }

  function removeSection(rmvId) {
    // DELETE request to endpoint
    tag_id = rmvId;
    fetch(`/pdfs/${pdf_id}/chapters/${chap_id}/sections/${tag_id}`
    , {
    method: 'DELETE'
    })
  }

  function changeSection(id){
    console.log("change", id);
    tag_id = id;
  }

  function clearSections() {
    sectTags = [];
    updateSections();
  }
  
  function clearS() {
    const quest = document.getElementById("new-section");
    quest.textContent = "";
  }
  