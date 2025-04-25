// stand in arrays, need functions to load from BE
const sectArray = [[`hi`,`hello`, `bye`],[`hi`,`ski`, `bye`]];
const chapArray = [[`one`, 0],[`two`, 1]];


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

let sectTags = [];

function fillTags(){
    clearSections();
    const chap = document.getElementById("chapter").value;
    const mySections = sectArray[chap];

    for(let i = 0; i<mySections.length; i++){
    sectTags.push(`${mySections[i]}`);
    }
    updateSections();
}

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
   updateSections
}
