/**
 * Created by demon on 10.11.2016.
 */
$(document).ready(function () {
    var priority = $('.priority');
    var TaskBoards =  $('.taskCard');
    for(var i = 0; i < priority.length; i++){
        if(priority[i].innerHTML.toLowerCase()==='критичный'){
            TaskBoards[i].style.background = "#F2625C";
            TaskBoards[i].style.borderColor = "#B50000";
        }else if(priority[i].innerHTML.toLowerCase()==='высокий'){
            TaskBoards[i].style.background = "#E6D000";
            TaskBoards[i].style.borderColor = "#A68800";
        }else{
            TaskBoards[i].style.background = "#94CA30";
            TaskBoards[i].style.borderColor = "#3A8000";
        }
    };
});