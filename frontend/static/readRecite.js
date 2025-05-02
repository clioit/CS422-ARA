
/*
Currently, readRecite.js fetches an existing chapter -> section -> note.
Functionality for saving and loading (only) notes should be implemented correctly.

In practice, users will be able to change the chapter/section on the page which will change the note.

When chapters/sections are able to be saved and loaded at will, please remove fetchChapter() and fetchSection()
as these are tester functions that do a one-time fetch for (the first) chapter/section/note in the database.

So when a chapter/section is loaded and its chapter_id/section_id is updated, call fetchNote()
and it will (hopefully) fetch the note correctly. When users type, it should automatically save
to the correct note_id in the database.
*/

let chapter_id = null;
let section_id = null;
let note_id = null;

// One time fetch of a chapter
// TODO: Implement changing chapters/sections and remove this function
function fetchChapter() {
  return fetch(`/pdfs/${pdf_id}/chapters`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((chapters) => {
      chapter_id = chapters[0]._id;
      return fetchSection(chapter_id);
    });
}

// One time fetch of a section
// TODO: Implement changing chapters/sections and remove this function
function fetchSection(chapterId) {
  return fetch(`/pdfs/${pdf_id}/chapters/${chapterId}/sections`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((sections) => {
      section_id = sections[0]._id;
      return fetchNote();
    });
}

// Fetches note for the current chapter and section
function fetchNote() {
  fetch(`/pdfs/${pdf_id}/chapters/${chapter_id}/sections/${section_id}/notes`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((notes) => {
        note_id = notes[0]._id;
        console.log(note_id);
        const savedNotes = document.getElementById("notes");
        if (savedNotes) {
          savedNotes.value = notes[0].text;
        }
    });
}

// Saves note data with default start page of 1
function saveNote(noteText) {
  const noteData = {
    text: noteText,
    start_page: 1,
  };

  let method;
  let url;
  
  // If note exists, find note to edit. Otherwise, create note and return its ID
  if (note_id) {
    method = "PATCH";
    url = `/pdfs/${pdf_id}/chapters/${chapter_id}/sections/${section_id}/notes/${note_id}`;
  } else {
    method = "POST";
    url = `/pdfs/${pdf_id}/chapters/${chapter_id}/sections/${section_id}/notes`;
  }

  fetch(url, { method: method, body: JSON.stringify(noteData), })
    .then((response) => response.json())
    .then(
      (data) => {
      if (method === "POST") {
        note_id = data._id;
      }
  });
}

// Skeleton code to delete note for the current chapter and section - Does not work at the moment
function deleteNote() {
  fetch(`/pdfs/${pdf_id}/chapters/${chapter_id}/sections/${section_id}/notes/${note_id}`, {
    method: "DELETE",
  });
  note_id = null;
}

// Loads the first chapter, section, and its note info
// TODO: Update chapter_id and section_id, then run fetchNote()
window.onload = function () {
  fetchChapter();
};

// Saves note when user types
const savedNotes = document.getElementById("notes");
if (savedNotes) {
  savedNotes.addEventListener("input", function () {
    const notesContent = savedNotes.value;
    saveNote(notesContent);
  });
}

/**NAVIGATION */

function goHome(){
  window.location.replace("http://localhost:5001/home");
}

function goReview(){
  window.location.replace(`http://localhost:5001/pdfs/${pdf_id}/review`);
}

function goSQ(){
  window.location.replace(`http://localhost:5001/pdfs/${pdf_id}/surveyQuestion`);
}

