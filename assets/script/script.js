//******** global variable declarations ********//
var quizEl = document.querySelector("#quiz"); // query the quiz container and store it
var questionEl = document.querySelector("#qText"); // query the question header and store it (for updating text)
var questionDescriptionEl = document.querySelector("#qDesc"); // query the question description and store it (also for updating text)
var questionResultEl = document.querySelector("#qRes"); // query the feedback result (right or wrong) for updating

// the question currently being displayed
var currentQuestion = null;
var currentQuestionIndex = 0;

// create questions object
var questions = [
    {
        question: "Which brackets denote the beginning and end of an array?",
        a: ["{}", "()", "[]", "<>"],
        correct: 2,
    },
    {
        question: "What is var f = function()?",
        a: ["Function expression", "Function declaration", "Variable declaration", "Function equation"],
        correct: 0,
    },
    {
        question: "What can string values NOT be enclosed by?",
        a: ["\"\"", "''", "**", "``"],
        correct: 2,
    },
    {
        question: "Which of the following is not a data type?",
        a: ["boolean", "int", "float", "function"],
        correct: 3,
    },
]


//******** main body of logic code ********//
currentQuestionIndex = Math.floor(Math.random() * questions.length);
initQuestion(questions[currentQuestionIndex]);

// add listener to quiz container element to check its events for clicks
quizEl.addEventListener("click", function(event) {
    var clicked = event.target;
    if (clicked.matches(".qcard")) {
        var id = clicked.dataset.id;
        var correct = checkAnswer(currentQuestion, id);

        if (correct) {
            questionResultEl.textContent = "Correct!";
        }
        else {
            questionResultEl.textContent = "Wrong!";
        }
    }
});


//******* function declarations *******//
// initializes basic set of question and four answers
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
    var correct = q.correct;
    // remove qcards from display
    questionEl.textContent = "";
    var answersEl = document.querySelectorAll(".qcard");
    for (var i = 0; i < answersEl.length; i++) {
        if (i != parseInt(id)) {
            answersEl[i].remove();
        }
    }
    
    // pose new random question after timeout
    questions.splice(currentQuestionIndex, 1);
    currentQuestionIndex = Math.floor(Math.random() * questions.length);
    setTimeout(initQuestion, 1000, questions[currentQuestionIndex]);

    // now return bool (right or wrong)
    if (parseInt(correct) === parseInt(id)) {
        answersEl[parseInt(id)].setAttribute("style", "background-color: green");
        return true;
    }
    else {
        answersEl[parseInt(id)].setAttribute("style", "background-color: red");
        return false;
    }
}