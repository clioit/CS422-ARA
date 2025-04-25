let userElement = document.getElementById("username");

function login(){
    userElement.value = `User has logged in`;
    console.log("button clicked!");
    window.location.replace("http://localhost:5001/home");
}
