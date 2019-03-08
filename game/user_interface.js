
function addTrackerVariable() {
    var title = $("#tracker-name").val();
    switch ($("#tracker-type").val()) {
        case "integer":
            const row = "<div class=\"row form-group justify-content-between mx-auto\">\n" +
                "                <label for=\"life-controls\" class=\"col-sm-2 col-form-label\">" + title + "</label>\n" +
                "                <div class=\"btn-group col-sm-4\">\n" +
                "                    <button type=\"button\" class=\"btn btn-primary\" id='tracker-decrement' onclick='updateNumericTrackerValue(this, -1)'>-</button>\n" +
                "                    <button type=\"button\" class=\"btn btn-primary disabled\" id='tracker-value'>0</button>\n" +
                "                    <button type=\"button\" class=\"btn btn-primary\" id='tracker-increment' onclick='updateNumericTrackerValue(this, +1)'>+</button>\n" +
                "                </div>\n" +
                "            </div>\n";
            $("#trackers").append(row);
            break;
        case "list":
            break;
    }
}

function updateNumericTrackerValue(handle, delta) {
    let valueElement = handle.parentElement.querySelector("#tracker-value");
    valueElement.innerHTML = parseInt(valueElement.innerHTML) + delta;
}

function setupEBook(ebook) {
    let reader = new FileReader();
    reader.onload = displayEBook.bind(null, reader);
    reader.readAsArrayBuffer(ebook);
}

function displayEBook(reader) {
    let book = ePub();
    book.open(reader.result);
    let rendered = book.renderTo("book-panel", {method: "default", width: "100%", height: "100%"});
    let displayPromise = rendered.display();
    displayPromise.then(function () {
        console.log("Displayed");
    }, function (reason) {
        console.log("Fail: " + reason);
    });
    console.log(displayPromise);
}

