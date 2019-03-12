let exam;
let question;
let remainingAnswers;
let examLength;

function loadExam(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
        var xmlStr = reader.result;
        var domxml = new DOMParser().parseFromString(xmlStr, "text/xml");
        handleExam(domxml);
    };
    reader.readAsText(file);
}

function handleExam(xmlEncodedExam) {
    exam = xmlEncodedExam;
    examLength = exam.getElementsByTagName("question").length;
    $("#exam-info").html("<h5>Exam: " +
        $(exam).find("title")[0].innerHTML + "</h5><hr><h5>" +
        examLength + " Questions</h5>");
    postRandomQuestion();
    $("#header-ui").css("display", "block");
}

function postQuestion(index, newQuestion) {
    $("#question-ui").css("display", "block");
    $("#solution-ui").css("display", "none");
    $("#question-card-header").html("Question " + index);
    question = newQuestion;
    $("#question-card").html($(newQuestion).children("body").html());
    let answers = $(newQuestion).find("answers > answer");
    $("#response-alerts").html("");
}

function showAnswer(answer, userResponse, score) {
    $("#question-ui").css("display", "none");
    $("#solution-ui").css("display", "block");
    $("#response-alerts").prepend(
        "        <div class=\"card my-4\" id=\"response-card\">\n" +
        "            <div class=\"card-header\">\n" +
        "                Response\n" +
        "            </div>\n" +
        "            <ul class=\"list-group list-group-flush\">\n" +
        "                <li class=\"list-group-item\" id=\"response-model\">Model response: " + $(answer).children("body")[0].innerHTML + "</li>\n" +
        "                <li class=\"list-group-item\" id=\"response-user\">Your response: " + userResponse + "</li>\n" +
        "                <li class=\"list-group-item text-success\" id=\"response-score\">Score: " + score + "/" + $(answer).find("mark").length + " points</li>\n" +
        "            </ul>\n" +
        "        </div>\n"
    );
}

function markResponse(response) {
    $(question).find("answer").each(function (answerIndex) {
        let marks = 0;
        $(this).find("mark").each(function (markIndex) {
            let regexFlags = this.getAttribute("regex-flags");
            if (regexFlags === null) {
                regexFlags = 'i';
            }
            let possiblePoints = this.getAttribute("points");
            if (possiblePoints === null) {
                possiblePoints = 1;
            }
            switch (this.getAttribute("type")) {
                case "manual":
                    marks += possiblePoints;
                    break;
                case "keyword":
                    if (response.toLowerCase().indexOf(this.innerHTML.toLowerCase().trim()) !== -1) {
                        marks += possiblePoints;
                    }
                    break;
                case "regex":
                    if (new RegExp(this.innerHTML.trim(), regexFlags).test(response)) {
                        marks += possiblePoints;
                    }
                    break;
            }
        });
        showAnswer(this, response, marks);
    })
}

function postRandomQuestion() {
    let index = Math.floor(Math.random() * examLength);
    postQuestion(index, exam.getElementsByTagName("question")[index]);
}

$(document).on('keydown', function (e) {
    console.log(e.which);
    // Catch the newline CTRL-Enter -> check question
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.which === 13)) {
        $("#response-submit-button")[0].onclick();
    }
    // Catch the newline CTRL-Shift-Enter -> new question
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.which === 13)) {
        $("#new-question-button")[0].onclick();
    }
});

$("document").ready(function () {
    $("#header-ui").css("display", "none");
    $("#question-ui").css("display", "none");
    $("#solution-ui").css("display", "none");

    $("#question-file").change(function () {
        var selectedFile = $("#question-file")[0].files[0];
        loadExam(selectedFile);
    });
});