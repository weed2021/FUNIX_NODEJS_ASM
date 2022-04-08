function getField(selectObject) {
    var value = selectObject.value;

    switch (value) {
        case "daySearch":
            document.getElementById('field').type = "date";
            document.getElementById('field').name = "daySearch";
            document.getElementById('guideText').innerText = "*Choose the day you want to see all session work!";
            break;
        case "workplace":
            document.getElementById('field').type = "text";
            document.getElementById('field').name = "workplace";
            document.getElementById('guideText').innerText = "*Input your workplace: 'company', 'home' or 'customer'";
            break;
        case "monthSearch":
            document.getElementById('field').type = "number";
            document.getElementById('field').name = "monthSearch";
            document.getElementById('guideText').innerText = "*Input month number from 1 to 12. That you want to view all session";
            break;
        case "overTimeDays":
            document.getElementById('field').type = "number";
            document.getElementById('field').name = "overTimeDays";
            document.getElementById('guideText').innerText = "*Input month number from 1 to 12. That you want to view the days have been work overtime";
            break;
        case "lackOfTimeDays":
            document.getElementById('field').type = "number";
            document.getElementById('field').name = "lackOfTimeDays";
            document.getElementById('guideText').innerText = "*Input month number from 1 to 12. That you want to view the days have been work lack of time";
            break;
        default:
            break;
    }
    // if(value = "daySearch"){
    //     document.getElementById('test').type ="date";
    // }else

}