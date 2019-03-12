let exam;
let question;
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

function showAnswer(modelResponse, userResponse, score, possibleScore) {
    $("#question-ui").css("display", "none");
    $("#solution-ui").css("display", "block");
    $("#response-alerts").prepend(
        "        <div class=\"card my-4\" id=\"response-card\">\n" +
        "            <div class=\"card-header\">\n" +
        "                Response\n" +
        "            </div>\n" +
        "            <ul class=\"list-group list-group-flush\">\n" +
        "                <li class=\"list-group-item\" id=\"response-model\">Model response: " + modelResponse + "</li>\n" +
        "                <li class=\"list-group-item\" id=\"response-user\">Your response: " + userResponse + "</li>\n" +
        "                <li class=\"list-group-item text-success\" id=\"response-score\">Score: " + score + "/" + possibleScore + " points</li>\n" +
        "            </ul>\n" +
        "        </div>\n"
    );
    $("#grading-incorrect-button").removeClass("btn-primary");
    $("#grading-partially-button").removeClass("btn-primary");
    $("#grading-correct-button").removeClass("btn-primary");
    $("#grading-incorrect-button").removeClass("btn-secondary");
    $("#grading-partially-button").removeClass("btn-secondary");
    $("#grading-correct-button").removeClass("btn-secondary");
    if (score == 0) {
        $("#grading-incorrect-button").addClass("btn-primary");
        $("#grading-partially-button").addClass("btn-secondary");
        $("#grading-correct-button").addClass("btn-secondary");
    } else if (score < possibleScore) {
        $("#grading-incorrect-button").addClass("btn-secondary");
        $("#grading-partially-button").addClass("btn-primary");
        $("#grading-correct-button").addClass("btn-secondary");
    } else {
        $("#grading-incorrect-button").addClass("btn-secondary");
        $("#grading-partially-button").addClass("btn-secondary");
        $("#grading-correct-button").addClass("btn-primary");
    }
}

function autoGradeResponse(response) {
    $(question).find("answer").each(function (answerIndex) {
        let marks = 0;
        let possibleMarks = 0;
        $(this).find("mark").each(function (markIndex) {
            let regexFlags = this.getAttribute("regex-flags");
            if (regexFlags === null) {
                regexFlags = 'i';
            }
            let possiblePoints = this.getAttribute("points");
            if (possiblePoints === null) {
                possiblePoints = 1;
            }
            possibleMarks += parseInt(possiblePoints);
            switch (this.getAttribute("type")) {
                case "manual":
                    marks += parseInt(possiblePoints);
                    break;
                case "keyword":
                    if (response.toLowerCase().indexOf(this.innerHTML.toLowerCase().trim()) !== -1) {
                        marks += parseInt(possiblePoints);
                    }
                    break;
                case "regex":
                    if (new RegExp(this.innerHTML.trim(), regexFlags).test(response)) {
                        marks += parseInt(possiblePoints);
                    }
                    break;
            }
        });
        showAnswer($(this).children("body")[0].innerHTML, response, marks, possibleMarks);
    })
}

function gradeResponse(grade) {
    if (grade.localeCompare("correct") == 0) {
        console.log("correct");
    } else if (grade.localeCompare("partially") == 0) {
        console.log("partially");
    } else {
        console.log("incorrect");
    }
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