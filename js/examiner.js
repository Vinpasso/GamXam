let examFileName;
let exam;
let question;
let examLength;

let progressStages;
let cooldownDates;
let history;

const local_storage_tag = "progress_xml";

function loadExam(file) {
    examFileName = file.name.substring(0, file.name.length - 4);
    let reader = new FileReader();
    reader.onload = function (e) {
        let xmlStr = reader.result;
        let domxml = new DOMParser().parseFromString(xmlStr, "text/xml");
        handleExam(domxml);
    };
    reader.readAsText(file);
}

function loadExamFromURL(url) {
    let xmlHTTPRequest = new XMLHttpRequest();
    xmlHTTPRequest.open("GET", url, false);
    xmlHTTPRequest.setRequestHeader("Cache-Control", "no-store, no-cache, must-revalidate, post-check=0, pre-check=0");
    xmlHTTPRequest.onload = function (e) {
        handleExam(xmlHTTPRequest.responseXML);
    };
    xmlHTTPRequest.send();
}

function handleExam(xmlEncodedExam) {
    exam = xmlEncodedExam;
    examLength = exam.getElementsByTagName("question").length;
    $("#exam-info").html("<h5>Exam: " +
        $(exam).find("title")[0].innerHTML + "</h5><hr><h5>" +
        examLength + " Questions</h5>");
    sanityCheckExam();
    initializeProgressStages();
    postRandomQuestion();
    $("#header-ui").css("display", "block");
    $("#progress-file").removeAttr("disabled");
}

function sanityCheckExam() {
    let idSet = new Set();
    $(exam).find("question").each(function (index) {
        if (idSet.has(this.getAttribute("id"))) {
            showAlert("Exam has duplicate question id: " + this.getAttribute("id") + ".", "alert-danger");
        }
        idSet.add(this.getAttribute("id"));
    });
    if (idSet.size != examLength) {
        showAlert("Exam has duplicate questions. Progress may not work correctly.", "alert-danger");
    }
}

function initializeProgressStages() {
    progressStages = [[], [], [], [], [], []];
    $(exam).find("question").each(function (index) {
        progressStages[0].push(this.getAttribute("id"));
    });
    refreshProgressUI();

    cooldownDates = {};

    history = [];
    refreshHistoryUI();
}

function refreshProgressUI() {
    let learningProgressTooltip = "Learning progress:<p/>";
    for (i = 0; i < progressStages.length; i++) {
        let percentage = parseFloat(progressStages[i].length) / parseFloat(examLength) * parseFloat(100);
        $("#progress-ui > .progress > .bg-stage-" + (i + 1)).attr("aria-valuenow", percentage.toString());
        $("#progress-ui > .progress > .bg-stage-" + (i + 1)).css("width", percentage.toString() + "%");
        learningProgressTooltip += "Stage " + (i + 1) + ": " + progressStages[i].length + "<p/>";
    }
    // Remove the superfluous last two characters
    $("#progress-ui").attr("data-original-title", learningProgressTooltip.trim());
}

function refreshHistoryUI() {
    $("#history-ui")[0].innerHTML = "";
    for (i = 0; i < 20; i++) {
        if (i >= history.length) {
            $("#history-ui")[0].innerHTML = "<span class=\"filled-circle\"></span>" + $("#history-ui")[0].innerHTML;
            continue;
        }

        if (history[i] == -1) {
            $("#history-ui")[0].innerHTML = "<span class=\"filled-circle incorrect-circle\"></span>" + $("#history-ui")[0].innerHTML;
        } else if (history[i] == 0) {
            $("#history-ui")[0].innerHTML = "<span class=\"filled-circle partially-circle\"></span>" + $("#history-ui")[0].innerHTML;
        } else {
            $("#history-ui")[0].innerHTML = "<span class=\"filled-circle correct-circle\"></span>" + $("#history-ui")[0].innerHTML;
        }
    }
}

function loadProgress(file) {
    let reader = new FileReader();
    reader.onload = function (e) {
        let xmlStr = reader.result;
        handleProgress(xmlStr);
    };
    reader.readAsText(file);
}

function loadLocalProgress() {
    handleProgress(window.localStorage.getItem(local_storage_tag))
}

function handleProgress(xmlString) {
    let numImported = 0;
    let domxml = new DOMParser().parseFromString(xmlString, "text/xml");
    progressStages = [[], [], [], [], [], []];
    for (let i = 0; i < progressStages.length; i++) {
        $(domxml).find("stage[id='" + i + "']").children("question").each(function (questionIndex) {
            progressStages[i].push(this.innerHTML);
            numImported++;
        });
    }

    cooldownDates = {};
    $(domxml).find("cooldown").each(function (cooldownIndex) {
        cooldownDates[this.getAttribute("question")] = parseInt(this.innerHTML);
    });

    // handle removed questions
    for (let i = 0; i < progressStages.length; i++) {
        for (let j = 0; j < progressStages[i].length; j++) {
            if ($(exam).find("question[id='" + progressStages[i][j] + "']") === undefined) {
                progressStages[i].splice(j, 1);
            }
        }
    }
    let killKeys = [];
    for (let key in cooldownDates) {
        if ($(exam).find("question[id='" + key + "']") === undefined) {
            killKeys.push(key);
        }
    }
    for (key of killKeys) {
        delete cooldownDates[key];
    }

    // handle new questions
    for (let i = 0; i < examLength; i++) {
        console.log(i);
        let q = exam.getElementsByTagName("question")[i];
        if (getStageOfQuestion(q.getAttribute("id")) === null) {
            progressStages[0].push(q.getAttribute("id"));
        }
    }

    refreshProgressUI();
    postRandomQuestion();
    showAlert("Successfully imported " + numImported + " progress save elements.", "alert-success");
}

function showAlert(content, type = 'alert-primary') {
    $("#alerts").append("<div class=\"alert " + type + " alert-dismissible fade show\" role=\"alert\" id=\"alert-box\">\n" +
        "                        <span id=\"alert-box-content\">" + content + "</span>\n" +
        "                        <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
        "                            <span aria-hidden=\"true\">&times;</span>\n" +
        "                        </button>\n" +
        "                    </div>\n");
}

function exportProgressToXML() {
    let exportedElements = 0;
    let xml = ["<?xml version=\"1.0\" encoding=\"UTF-8\" ?>", "<progress>"];

    xml.push("<head>");
    xml.push("<examid>");
    xml.push($(exam).find("head").children("id")[0].innerHTML);
    xml.push("</examid>");
    xml.push("</head>");

    xml.push("<stages>");
    for (i = 0; i < progressStages.length; i++) {
        xml.push("<stage id=\"" + i + "\">");
        for (j = 0; j < progressStages[i].length; j++) {
            xml.push("<question>" + progressStages[i][j] + "</question>");
            exportedElements++;
        }
        xml.push("</stage>");
    }
    xml.push("</stages>");

    xml.push("<cooldowns>");
    for (var key in cooldownDates) {
        xml.push("<cooldown question=\"" + key + "\">" + cooldownDates[key] + "</cooldown>");
    }
    xml.push("</cooldowns>");

    xml.push("</progress>");

    showAlert("Successfully exported " + exportedElements + " progress elements.", "alert-success");
    return xml.join("");
}

function saveProgress() {
    let text = exportProgressToXML();
    let blob = new Blob([text], {type: 'text/xml'});
    let anchor = document.createElement('a');

    anchor.download = "progress_" + examFileName + ".xml";
    anchor.href = window.URL.createObjectURL(blob);
    anchor.dataset.downloadurl = ['text/xml', anchor.download, anchor.href].join(':');
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    window.URL.revokeObjectURL(blob);
}


function saveLocalProgress() {
    let text = exportProgressToXML();
    window.localStorage.setItem(local_storage_tag, text);
}

function postQuestion(index, newQuestion) {
    $("#question-ui").css("display", "block");
    $("#answer-ui").css("display", "block");
    $("#solution-ui").css("display", "none");
    $("#no-question-ui").css("display", "none");
    $("#question-card-header").html("Question " + index);
    question = newQuestion;
    $("#question-card").html($(newQuestion).children("body").html());
    $("#response").val("");
    $("#response-alerts").html("");
}

function showAnswer(modelResponse, userResponse, score, possibleScore) {
    $("#answer-ui").css("display", "none");
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

function getStageOfQuestion(qid) {
    for (i = 0; i < progressStages.length; i++) {
        if (progressStages[i].includes(qid)) {
            return i;
        }
    }
    return null;
}

function getCooldownDate(stage) {
    let now = Date.now();
    switch (stage) {
        case 0:
            // 5min
            return now + (5 * 60 * 1000)
        case 1:
            // 10min
            return now + (10 * 60 * 1000)
        case 2:
            // 15min
            return now + (15 * 60 * 1000)
        case 3:
            // 20min
            return now + (20 * 60 * 1000)
        default:
            return 0;
    }
}

function addCooldown(stage) {
    cooldownDates[question.getAttribute("id")] = getCooldownDate(stage);
}

function addDefaultCooldown() {
    cooldownDates[question.getAttribute("id")] = getCooldownDate(0);
}

function gradeResponse(grade) {
    let stage = getStageOfQuestion(question.getAttribute("id"));
    if (grade.localeCompare("correct") == 0) {
        // one stage up
        if (stage < progressStages.length - 1) {
            progressStages[stage].splice(progressStages[stage].indexOf(question.getAttribute("id")), 1);
            progressStages[stage + 1].push(question.getAttribute("id"));
            addCooldown(stage);
        }

        history.push(1);
    } else if (grade.localeCompare("partially") == 0) {
        // no change
        addDefaultCooldown();

        history.push(0);
    } else {
        // one stage down
        if (stage > 0) {
            progressStages[stage].splice(progressStages[stage].indexOf(question.getAttribute("id")), 1);
            progressStages[stage - 1].push(question.getAttribute("id"));
        }
        addDefaultCooldown();

        history.push(-1);
    }

    if (history.length > 20) {
        history.shift();
    }

    refreshHistoryUI();
    refreshProgressUI();
    postRandomQuestion();
}

function questionAskable(question) {
    if (progressStages[progressStages.length - 1].includes(question.getAttribute("id"))) {
        return false;
    }

    if (question.getAttribute("id") in cooldownDates) {
        if (cooldownDates[question.getAttribute("id")] < Date.now()) {
            delete cooldownDates[question.getAttribute("id")];
            return true;
        } else {
            return false;
        }
    }

    return true;
}

function postRandomQuestion() {
    let possibleQuestions = [];
    for (i = 0; i < examLength; i++) {
        let q = exam.getElementsByTagName("question")[i];
        if (questionAskable(q)) {
            possibleQuestions.push(q);
        }
    }

    if (possibleQuestions.length == 0) {
        $("#no-question-ui").css("display", "block");
        $("#question-ui").css("display", "none");
        $("#solution-ui").css("display", "none");
    } else {
        let index = Math.floor(Math.random() * possibleQuestions.length);
        postQuestion(possibleQuestions[index].getAttribute("id"), possibleQuestions[index]);
    }
}

$(document).on('keydown', function (e) {
    // Catch the newline CTRL-Enter -> check question
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.which === 13)) {
        if ($("#answer-ui").css("display").localeCompare("block") == 0) {
            $("#response-submit-button")[0].onclick();
        } else if ($("#solution-ui").css("display").localeCompare("block") == 0) {
            $("#response-submit-button")[0].onclick();
            if ($("#grading-incorrect-button").hasClass("btn-primary")) {
                gradeResponse("incorrect");
            } else if ($("#grading-partially-button").hasClass("btn-primary")) {
                gradeResponse("partially");
            } else if ($("#grading-correct-button").hasClass("btn-primary")) {
                gradeResponse("correct");
            }
        }
    }
});

$("document").ready(function () {
    $("#question-file").change(function () {
        let selectedFile = $("#question-file")[0].files[0];
        loadExam(selectedFile);
    });
    $("#progress-file").change(function () {
        let selectedFile = $("#progress-file")[0].files[0];
        loadProgress(selectedFile);
    });
});