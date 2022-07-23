// query the quiz container and store it
var quizEl = document.querySelector("#quiz");
// query the question header and store it (for updating text)
var questionEl = document.querySelector("#qText");
// query the question description and store it (also for updating text)
var questionDescriptionEl = document.querySelector("#qDesc");
// query the feedback result (right or wrong) for updating
var questionResultEl = document.querySelector("#qRes");

// the question currently being displayed
var currentQuestion = null;

// create a test question object for testing purposes
var question1 = {
    question: "what is my favourite colour?",
    a: ["green", "blue", "red", "burgundy"],
    correct: 0,
}


initQuestion(question1);

// add listener to quiz container element to check its events for clicks
quizEl.addEventListener("click", function(event) {
    var clicked = event.target;
    if (clicked.matches(".qcard")) {
        var id = clicked.dataset.id;
        var correct = checkAnswer(currentQuestion, id);
        console.log(id);

        if (correct) {
            questionResultEl.textContent = "Correct!";
        }
        else {
            questionResultEl.textContent = "Wrong!";
        }
    }
});

// function declarations
// initializes basic set of four answers
function initQuestion(q) {
    // remove any lingering qCards
    var answersEl = document.querySelectorAll(".qcard");
    for (var i = 0; i < answersEl.length; i++) {
        answersEl[i].remove();
    }

    for (var i = 0; i < 4; i++) {
        questionEl.textContent = q.question; // update the question
        questionDescriptionEl.textContent = ""; // wipe the description
        
        // create answers and append them
        var qCardEl = document.createElement("div");
        qCardEl.className = "qcard";
        qCardEl.setAttribute("data-id", i);
        qCardEl.textContent = q.a[i];
        quizEl.appendChild(qCardEl);

        currentQuestion = q;
    }    
}

// check if the provided answer is correct
function checkAnswer(q, id) {
    // remove qcards from display
    questionEl.textContent = "";
    var answersEl = document.querySelectorAll(".qcard");
    for (var i = 0; i < answersEl.length; i++) {
        if (i != parseInt(id)) {
            answersEl[i].remove();
        }
    }
    setTimeout(initQuestion, 1000, question1);

    // now return bool (right or wrong)
    if (parseInt(q.correct) === parseInt(id)) {
        answersEl[parseInt(id)].setAttribute("style", "background-color: green");
        return true;
    }
    else {
        answersEl[parseInt(id)].setAttribute("style", "background-color: red");
        return false;
    }
}