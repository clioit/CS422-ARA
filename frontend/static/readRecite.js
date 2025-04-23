 // Check if there's already a saved note in localStorage
 window.onload = function() {
    const savedNotes = localStorage.getItem("userNotes");
    if (savedNotes) {
      document.getElementById("notes").value = savedNotes;
    }
  };

  // Save notes to localStorage whenever the user types
  document.getElementById("notes").addEventListener("input", function() {
    const notesContent = document.getElementById("notes").value;
    localStorage.setItem("userNotes", notesContent);
  });

  // Upload PDF to mongoDB tester
  document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Send data to backend using POST, backend sends back a result message, message
    // parsed as json, upload-status element is updated to json's message field
    const pdfData = new FormData(this);
    fetch('/upload_pdf', {method: 'POST', body: pdfData})
      .then(response => response.json())
      .then(data => document.getElementById('upload-status').textContent = data.message);
  });