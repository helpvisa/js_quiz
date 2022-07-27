//******** global variable declarations ********//
var scoreContainerEl = document.querySelector("#high-scores"); // query scorecard container
var quizEl = document.querySelector("#quiz"); // query the quiz container and store it
var questionEl = document.querySelector("#qText"); // query the question header and store it (for updating text)
var questionDescriptionEl = document.querySelector("#qDesc"); // query the question description and store it (also for updating text)
var questionResultEl = document.querySelector("#qRes"); // query the feedback result (right or wrong) for updating
var timerEl = document.querySelector("#timer"); // query the timer element
var checkHighScoreEl = document.querySelector("#go-to-scores"); // query high scores element (top left)
checkHighScoreEl.addEventListener("click", populateScores);
// the question currently being displayed
var currentQuestion = null;
var currentQuestionIndex = 0;
var showingResult = false; // used to prevent player from clicking the "result card" and triggering a timing bug

// tick timer
var defaultTime = 60;  // default time for quiz is 60 seconds
var timer = defaultTime; // set timer to default time
var timerIntervalId = null; // the id for the setInterval function
var points = 0; // player's total points
var maxHighScores = 6; // max amount of high scores the game is allowed to save
var highScores = JSON.parse(localStorage.getItem("scores"));
// create this array if highScores returns a false value (no saved data)
if (!highScores) {
    highScores = [];
}
// sort the high scores from highest to lowest, pop off scores exceeding storage cap
highScores.sort(compareScores);
if (highScores.length > maxHighScores) {
    scoresToPop = highScores.length - maxHighScores;
    for (var i = 0; i < scoresToPop; i++) {
        highScores.pop();
    }
}

// create primary questions object
var startingQuestions = [
    {
        question: "Which brackets denote the beginning and end of an array?",
        a: ["{}", "()", "[]", "<>"],
        correct: "[]",
    },
    {
        question: "What is var f = function()?",
        a: ["function expression", "function declaration", "variable declaration", "function equation"],
        correct: "function expression",
    },
    {
        question: "What can string values NOT be enclosed by?",
        a: ["\"\"", "''", "**", "``"],
        correct: "**",
    },
    {
        question: "Which of the following is not a data type?",
        a: ["boolean", "int", "float", "function"],
        correct: "function",
    },
    {
        question: "JavaScript is a ____-side programming language.",
        a: ["client", "server", "both", "none"],
        correct: "both",
    },
    {
        question: "Which of the following will write the message 'Hello' in an alert box?",
        a: ["alertBox('Hello');", "alert(Hello);", "msgAlert('Hello');", "alert('Hello');"],
        correct: "alert('Hello');",
    },
    {
        question: "Which of the following options returns the minimum between x and y?",
        a: ["min(x,y)", "Math.min(x,y)", "Math.min(xy)", "min(xy)"],
        correct: "Math.min(x,y)",
    },
    {
        question: "Which of these statements will throw an error?",
        a: ["function e(){}", "var e = function(){}", "function(){}", "var exec = null"],
        correct: "function(){}",
    },
    {
        question: "What is the output of the following piece of code: \
        var x = 32; if (x % 10 === 0) {console.log('No remainder.');} else {console.log('Remainder.');}",
        a: ["0", "2", "Remainder.", "No remainder."],
        correct: "Remainder.",
    },
    {
        question: "Elements can be added to the end of an array using: ",
        a: ["array.push()", "array.add()", "array.concat()", "array.pop()"],
        correct: "array.push()",
    },
    {
        question: "Math.random() generates a random number between: ",
        a: ["0 and 1", "0 and 1 (exclusive)", "1 and 2", "0 and 0.99"],
        correct: "0 and 1 (exclusive)",
    },
    {
        question: "The trim method, used on a string, will: ",
        a: ["cap it at 16 characters", "remove whitespace from both sides", "remove spaces from the string", "make the string lowercase"],
        correct: "remove whitespace from both sides",
    },
    {
        question: "string.replace(/a/g,'') will: ",
        a: ["remove every 'a' in the string", "replace every 'a' with a space", "replace every blank space with an 'a'", "set the string to empty"],
        correct: "remove every 'a' in the string",
    },
]

// assign this to the working game's questions object (modifiable)
//////////////////////////////////////////////////////////////////////////////////
// the concat here allows for the array to be copied without being a reference //
// and hence leaves the og unscathed //
var questions = [].concat(startingQuestions)


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
        else if (clicked.matches("#play-again")) { // restart game
            welcomeScreen();
        }
        else if (!showingResult) { // otherwise parse answer
            var answer = clicked.textContent;
            var id = clicked.dataset.id;
            var correct = checkAnswer(currentQuestion, answer, id);

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
    // clear qcards and scores
    var qCardsEl = document.querySelectorAll(".qcard, .qcard-noclick");
    for (var i = 0; i < qCardsEl.length; i++) {
        qCardsEl[i].remove();
    }
    var scoresEl = document.querySelectorAll(".scorecard");
    for (var i = 0; i < scoresEl.length; i++) {
        scoresEl[i].remove();
    }

    // ensure questions are restocked and points reset; it might be a replay!
    questions = [].concat(startingQuestions)
    points = 0;

    // ensure timer is the right colour (just in case)
    timer = defaultTime;
    timerEl.setAttribute("style", "color: black");
    updateTimer(timer);

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

// display this screen once game is finished
function gameOver() { // both for good jobs, *and* bad jobs!
    if (questions.length === 0) { // all questions answered; good job!
        // remove any lingering qCards
        var answersEl = document.querySelectorAll(".qcard, .qcard-noclick");
        for (var i = 0; i < answersEl.length; i++) {
            answersEl[i].remove();
        }

        // show player their score and congratulate them
        questionResultEl.textContent = "" // clear the q result from previously
        questionEl.textContent = "That's everything!";
        questionDescriptionEl.textContent =
        "You answered every question,\
        earning " + (points - timer) + " + " + timer + " points for time remaining.";

        // save score + prompt player for name if new high score, add scorecard button
        if (highScores.length === 0 || highScores.length < maxHighScores || 
            !highScores[maxHighScores - 1] || points > highScores[maxHighScores - 1].score) {
            var formEl = document.createElement("form");
            formEl.className = "qcard-noclick";
            formEl.innerHTML = "Your name: <br/> <input type='text' name='player-name'> <input type='submit'";
            formEl.innerHTML +=  "<input type='submit' name='player-name'/>";
            formEl.addEventListener("submit", saveAndPopulateScores);
            quizEl.appendChild(formEl);
        }

        createScorecard();
        addPlayAgain();
    }
    else { // ran out of time; bad job!
        // remove any lingering qCards
        var answersEl = document.querySelectorAll(".qcard, .qcard-noclick");
        for (var i = 0; i < answersEl.length; i++) {
            answersEl[i].remove();
        }

        // show player their score and admonish them
        questionResultEl.textContent = ""; // clear the q result from previously
        questionEl.textContent = "Out of time!";
        questionDescriptionEl.textContent = 
        "Oof, time's up. Better luck next time. You earned " + points + " points for your efforts.";

        // save score + prompt player for name if new high score, add scorecard button
        if (highScores.length === 0 || highScores.length < maxHighScores || 
            !highScores[maxHighScores - 1] || points > highScores[maxHighScores - 1].score) {
            var formEl = document.createElement("form");
            formEl.className = "qcard-noclick";
            formEl.innerHTML = "Your name: <br/> <input type='text' name='player-name'/>";
            formEl.innerHTML +=  "<input type='submit' name='player-name'/>";
            formEl.addEventListener("submit", saveAndPopulateScores);
            quizEl.appendChild(formEl);
        }

        createScorecard();
        addPlayAgain();
    }
}


// initializes basic set of question and four answers
function initQuestion(q) {
    // remove the question result
    questionResultEl.textContent = "";

    // we are no longer displaying a result!
    showingResult = false;

    // remove any lingering qCards
    var answersEl = document.querySelectorAll(".qcard, .qcard-noclick");
    for (var i = 0; i < answersEl.length; i++) {
        answersEl[i].remove();
    }

    q.a.sort(() => Math.random() -0.5); // shuffle answer cards for random display
    questionEl.textContent = q.question; // update the question
    questionDescriptionEl.textContent = ""; // wipe the description

    for (var i = 0; i < 4; i++) {
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
function checkAnswer(q, answer, id) {
    showingResult = true; // we will now be showing the result of the click
    var correct = q.correct;
    var result;

    // remove qcards from display
    questionEl.textContent = "";
    var answersEl = document.querySelectorAll(".qcard, .qcard-noclick");
    for (var i = 0; i < answersEl.length; i++) {
        if (i != parseInt(id)) {
            answersEl[i].remove();
        }
    }

    // now assign bool (right or wrong)
    if (correct === answersEl[parseInt(id)].textContent) {
        answersEl[parseInt(id)].setAttribute("style", "background-color: lightgreen; border-color: green");
        points += 5;
        result = true;
    }
    else {
        answersEl[parseInt(id)].setAttribute("style", "background-color: lightcoral; border-color: purple");
        updateTimer(timer - 10); // subtract 10 seconds from timer
        result = false;
    }

    // pose new random question after timeout
    questions.splice(currentQuestionIndex, 1);
    currentQuestionIndex = Math.floor(Math.random() * questions.length);
    if (questions.length > 0) {
        setTimeout(initQuestion, 1000, questions[currentQuestionIndex]);
    }
    else {
        // end the game if no questions left
        points += timer;
        clearInterval(timerIntervalId);
        setTimeout(gameOver, 1000);
    }

    return result;
}


// add "play again" qcard
function addPlayAgain() {
    var playAgainEl = document.createElement("div");
    playAgainEl.className = "qcard";
    playAgainEl.id = "play-again";
    playAgainEl.textContent = "Play?";
    quizEl.appendChild(playAgainEl);
}


// creates a child scorecard
function createScorecard() {
    // create a card that the player can click to see high scores
    scoreCardEl = document.createElement("div");
    scoreCardEl.classList.add("qcard");
    scoreCardEl.textContent = "Score: " + points;
    quizEl.appendChild(scoreCardEl);
}

// display the local high scores in the scorechart 
function populateScores() {
    // stop timer
    clearInterval(timerIntervalId);
    // reset Question elements
    questionEl.textContent = "High Scores";
    // clear these two just in case
    questionDescriptionEl.textContent = "";
    questionResultEl.textContent = "";
    // clear lingering cards
    var cardElements = document.querySelectorAll(".qcard, .qcard-noclick");
    for (var i = 0; i < cardElements.length; i++) {
        cardElements[i].remove();
    }
    var previousScoresEl = document.querySelectorAll(".scorecard");
    for (var i = 0; i < previousScoresEl.length; i++) {
        previousScoresEl[i].remove();
    }

    // add replay card if one is not already here
    if (!document.querySelector("#play-again")) {
        addPlayAgain();
    }

    // display scores in container
    for (var i = 0; i < highScores.length; i++) {
        scoreEl = document.createElement("div");
        scoreEl.className = "scorecard";
        scoreEl.innerHTML = highScores[i].name + ": <span>" + highScores[i].score + "</span>";
        scoreContainerEl.appendChild(scoreEl);
    }
}

function saveAndPopulateScores(event) {
    // prevent page reload on form submission
    event.preventDefault();
    var playerName = document.querySelector("input[name='player-name']").value;

    // save score
    var newScore = {name: playerName, score: points};
    highScores.push(newScore);
    localStorage.setItem("scores", JSON.stringify(highScores));

    // sort scores
    highScores.sort(compareScores);
    if (highScores.length > maxHighScores) {
        highScores.pop();
    }

    // display scores
    populateScores();
}


// in-game timer update
function decrementTimer() {
    // decrement and update timer
    if (timer > 0)
        timer--;
    timerEl.textContent = "Time: " + timer;

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
    timer = amount; // set given amount
    timerEl.textContent = "Time: " + timer;

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


// comparison function to sort high score objects (why did i do this...)
function compareScores(a, b) {
    if (a.score < b.score) {
        return 1;
    }
    if (a.score > b.score) {
        return -1;
    }
    return 0;
}