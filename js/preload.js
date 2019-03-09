const remote = require('electron').remote;
window.getRemote = function () {
    return remote;
}
