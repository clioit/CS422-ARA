// array to store book data [ch[s,s,s,..], ...]
const chapArray = [[`one`, [`hi`,`hello`, `bye`]],[`two`, [`hi`,`ski`, `bye`]]];

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

// function fillTags(){
//     const chap = document.getElementById("chapter");
//     const chVal = chap.value;

//     const listElement = document.createElement("ul");
//     listElement.className = "tags__tag-list";

//     for(let i=0; i<chVal.length; i++){
//         const tag =document.createElement("li");
//         tag.className="tags__tag-list--tag";
//         tag.textContent = `${chVal[i]}`;
//         listElement.appendChild(tag);
        
//         const onPage = document.getElementById("sections");
//         onPage.appendChild(listElement);
//     }
// }

// fillTags();

