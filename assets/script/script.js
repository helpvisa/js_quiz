//******** global variable declarations ********//
var quizEl = document.querySelector("#quiz"); // query the quiz container and store it
var questionEl = document.querySelector("#qText"); // query the question header and store it (for updating text)
var questionDescriptionEl = document.querySelector("#qDesc"); // query the question description and store it (also for updating text)
var questionResultEl = document.querySelector("#qRes"); // query the feedback result (right or wrong) for updating
var timerEl = document.querySelector("#timer"); // query the timer element
// the question currently being displayed
var currentQuestion = null;
var currentQuestionIndex = 0;

// tick timer
var timer = 60; // default time for quiz is 60 seconds
var timerIntervalId = null; // the id for the setInterval function

// create questions object
var questions = [
    {
        question: "Which brackets denote the beginning and end of an array?",
        a: ["{}", "()", "[]", "<>"],
        correct: 2,
    },
    {
        question: "What is var f = function()?",
        a: ["function expression", "function declaration", "variable declaration", "function equation"],
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
// set the initial count of the html element to the internal value
timerEl.textContent = "Time: " + timer;

// welcome the user on launch :^)
welcomeScreen();

// add listener to quiz container element to check its events for clicks
quizEl.addEventListener("click", function(event) {
    var clicked = event.target;
    if (clicked.matches(".qcard")) {
        if (clicked.matches("#start-button")) { // start game
            // pick an initial random question
            currentQuestionIndex = Math.floor(Math.random() * questions.length);
            initQuestion(questions[currentQuestionIndex]);
            // init timer
            timerIntervalId = setInterval(decrementTimer, 1000);
            timerEl.setAttribute("style", "color: green");
        }
        else { // otherwise parse answer
            var id = clicked.dataset.id;
            var correct = checkAnswer(currentQuestion, id);

            if (correct) {
                questionResultEl.textContent = "Correct!";
            }
            else {
                questionResultEl.textContent = "Wrong!";
            }
        }
    }
});


//******* function declarations *******//
// prep introductory screen
function welcomeScreen() {
    // clear placeholder text
    questionResultEl.textContent = ""
    // ensure timer is the right colour (just in case)
    timerEl.setAttribute("style", "color: black");

    // write intro to question element
    questionEl.textContent = "Javascript Code Quiz Challenge"
    // write description into its sub-element
    questionDescriptionEl.textContent =
    "Answer as many as questions as \
    you can before time's up! Just be careful,\
    because wrong answers steal time away from you!";

    // prep start came button as qcard
    var startButtonEl = document.createElement("div");
    startButtonEl.className = "qcard";
    startButtonEl.id = "start-button"; // set custom element id to be identified on-click
    startButtonEl.textContent = "Start Quiz";
    //startButtonEl.setAttribute("style", "text-align: center"); // center the button text
    quizEl.appendChild(startButtonEl);
}

function gameOver() { // both for good jobs, *and* bad jobs!
    if (questions.length === 0) { // all questions answered; good job!
        
    }
    else { // ran out of time; bad job!

    }
}

// initializes basic set of question and four answers
function initQuestion(q) {
    // remove the question result
    questionResultEl.textContent = ""

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
    if (questions.length > 0) {
        setTimeout(initQuestion, 1000, questions[currentQuestionIndex]);
    }
    else {
        // end the game if no questions left
        gameOver();
    }

    // now return bool (right or wrong)
    if (parseInt(correct) === parseInt(id)) {
        answersEl[parseInt(id)].setAttribute("style", "background-color: lightgreen; border-color: green");
        return true;
    }
    else {
        answersEl[parseInt(id)].setAttribute("style", "background-color: lightcoral; border-color: purple");
        return false;
    }
}

// in-game timer update
function decrementTimer() {
    // decrement and update timer
    if (timer > 0)
        timer--;
    timerEl.textContent = "Time: " + timer

    // change colour as early warning
    if (timer < 20) { // 20 seconds left better be speedy...
        timerEl.setAttribute("style", "color: red");
    }

    // is it at zero? break if so!
    if (timer < 1) {
        timer = 0; // ensure no negative values are being displayed
        // stop the timer
        clearInterval(timerIntervalId);

        // reset timer colour
        timerEl.setAttribute("style", "color: black");
        gameOver();
    }
}

// can be called arbitrarily to modify timer by set amount
function updateTimer(amount) {
    timer -= amount; // subtract given amount

    if (timer < 1) {
        timer = 0; // ensure no negative values are displayed
        // stop timer
        if (timerIntervalId != null) { // perform null check since this can be called arbitrarily
            clearInterval(timerIntervalId)
        }

        // reset timer colour
        timerEl.setAttribute("style", "color: black");
        gameOver();
    }
}