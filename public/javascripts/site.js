/**
 * Created by alexey-dev on 31.10.16.
 */
$(document).ready(function () {
    $(".droppable").droppable({
        accept: '.draggable',
        hoverClass: "drop-hover",
        drop: function (event, ui) {
            $(this).append(ui.draggable);
            $.ajax({
                method: "POST",
                url: "/changeState",
                data: {id: ui.draggable.data('id'), status: $(this).data('status')}
            })
                .done(function (msg) {
                    alertify.success("Статус задачи успешно изменен!");
                })
                .fail(function (msg) {
                    alertify.error("Случилась ошибка операции!");
                })
        }
    });
    $(".draggable").draggable({
        helper: "clone",
        axis: "x",
        cursor: "crosshair",
        opacity: 0.45
    });


});

function refuseTask(taskID) {
    "use strict";
    $.ajax({
        method: "POST",
        url: "/refuseTask",
        data: {id: taskID}
    })
        .done(function () {
            $("#execute").html('<div class="col-md-6"><h3><a href="javascript:executeTask(' + "'"+taskID+"'" + ');" class="takeTask">Взять задачу</a></h3></div>');

            alertify.success("Вы отказались от задачи!");
        })
        .fail(function (errInfo) {
            alertify.error(errInfo.responseJSON.errInfo);
        })
}
function refuseTaskList(taskID) {
    "use strict";
    $.ajax({
        method: "POST",
        url: "/refuseTask",
        data: {id: taskID}
    })
        .done(function () {
            $("#"+taskID).css("display", "none");
            alertify.success("Вы отказались от задачи!");
        })
        .fail(function (errInfo) {
            alertify.error(errInfo.responseJSON.errInfo);
        })
}
function removeTask(taskID) {
    "use strict";
    $.ajax({
        method: "POST",
        url: "/removeTask",
        data: {id: taskID}
    })
        .done(function (id) {
            alertify.success("Задача успешно удалена");
            window.location.replace('/board?project=' + id.id);
        })
        .fail(function (id) {
            alertify.error("Случилась ошибка операции!");
            window.location.replace('/board?project=' + id.id);
        })
    taskID.preventDefault()
}
function removeTaskBoard(taskID) {
    "use strict";
    $.ajax({
        method: "POST",
        url: "/removeTask",
        data: {id: taskID}
    })
        .done(function () {
            alertify.success("Задача успешно удалена");
            $("#"+taskID).detach();
        })
        .fail(function () {
            alertify.error("Случилась ошибка операции!");
        })
    taskID.preventDefault()
}
function removeTaskList(taskID) {
    "use strict";
    $.ajax({
        method: "POST",
        url: "/removeTask",
        data: {id: taskID}
    })
        .done(function () {
            $("#"+taskID).css("display", "none");
            alertify.success("Задача успешно удалена");
        })
        .fail(function () {
            alertify.error("Случилась ошибка операции!");
        })
    taskID.preventDefault()
}
function executeTask(taskID) {
    "use strict";
    $.ajax({
        method: "POST",
        url: "/executeTask",
        data: {id: taskID}
    })
        .done(function (successInfo) {
            $("#execute").html('<div class="col-md-6"><h3>Задача в разработке</h3></div><div class="col-md-6"><h3><a href="javascript:refuseTask(' + "'"+taskID+"'" + ');" class="refuseTask">Отказаться от задачи</a></h3></div>');
            alertify.success(successInfo.successInfo);
        })
        .fail(function (errInfo) {
            alertify.error(errInfo.responseJSON.errInfo);
        })
    taskID.preventDefault();
}
function removeProject(projectID) {
    "use strict";
    $.ajax({
        method: "POST",
        url: "/removeProject",
        data: {id: projectID}
    })
        .done(function () {
            alertify.success("Проект успешно удален");
            window.location.replace("/profile");
        })
        .fail(function () {
            alertify.error("Случилась ошибка операции!");
            window.location.replace("/profile");
        })
    projectID.preventDefault();
}
function fireLogout() {
    $.post("/logout")
        .done(function () {
            "use strict";
            window.location.replace("/");
        })
        .fail(function () {
            "use strict";
            alertify.error("Случилась ошибка операции!");
        })
}
$(document).on('focusin', function (e) {
    if ($(e.target).closest(".mce-window").length) {
        e.stopImmediatePropagation();
    }
});





