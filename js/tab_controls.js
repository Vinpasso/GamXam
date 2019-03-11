function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    $(".tab-pane").css("display","none");
    $(".tab-link").removeClass("active");
    $("#"+tabName).css("display","block");
    evt.currentTarget.className += " active";
}