$(document).ready(function() {
    $("#search-field").focus();
});

$("#search-button").on("click", function (){
  
    if($("#search-field").val() == "") {
         $(`<div class="alert alert-danger mt-3" 
                style="width: 100%; text-align: center">
                    "Please fill empty fields"
           </div>`).appendTo(".container-fluid"); 
        return;
    }
    $.ajax({
        type: "POST",
        url: "/scheduler/findAppointments",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
              "date": $("#search-field").val()
        }),
        success: function(result, status) {
            if (result.successful) {
                $(".container-fluid").empty();
                //set bussiness table head
                $(`<div class="table-row header">
                    <div class="text" style="width: 25%">Date</div>
                    <div class="text" style="width: 25%">Start Time</div>
                    <div class="text" style="width: 25%">Duration</div>
                    <div class="text" style="width: 25%">Booked By</div>
                </div>`).appendTo(".container-fluid");
                
                //variables for calculating appointment duration
                var startTime = new Date();
                var endTime   = new Date();
                var startValue, endValue;
                var hrs, min, sec;
                var duration;
                
                //populate bussiness table
                for (let i = 0; i < result.appointment.length; i++) {
                    startValue = result.appointment[i].startTime.split(':');
                    endValue = result.appointment[i].endTime.split(':');
                    
                    startTime.setHours(startValue[0], startValue[1], startValue[2], 0);
                    endTime.setHours(endValue[0], endValue[1], endValue[2], 0);
                    
                    hrs = endTime.getHours() - startTime.getHours();
                    min = endTime.getMinutes() - startTime.getMinutes();
                    sec = endTime.getSeconds() - startTime.getSeconds();
                    duration = hrs + "hrs " + min + "min " + sec + "sec";
                    
                    $(`<div class="table-row">
                           <div class="text" style="width: 25%">
                               ${result.appointment[i].date.split("T", 1)}
                           </div>
                           <div class="text" style="width: 25%">${result.appointment[i].startTime}</div>
                           <div class="text" style="width: 25%">${duration}</div>
                           <div class="text" style="width: 25%">${result.appointment[i].bookedBy}</div>
                       </div>`).appendTo(".container-fluid"); 
                
                }
            }
            else {
                $(".container-fluid").html(result.message).show();
                $(".container-fluid").attr("class", "alert alert-danger mt-3");
                document.getElementById(".container-fluid").style.textAlign = "center";
            }
        },
        error: function(xhr, status, error) {
            error = eval("error: (" + xhr.responseText + ")");
            console.error(error);
        }
    });
});

$('#submit-login-button').on('click', function(e) {
    e.preventDefault();
    
    $.ajax({
        type: "POST",
        url: "/scheduler/login",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
            "username": $("#LI_username").val(),
            "password": $("#LI_password").val()
        }),
        success: function(result, status) {
            console.log("got login status back", result);
            if (result.successful) {
                window.location.href = '/scheduler/dashboard';
            }
            else {
                // Show an error message or something and stay here
                alert(result.message);
            }
        },
        error: function(xhr, status, error) {
            error = eval("error: (" + xhr.responseText + ")");
            console.error(error);
        },
        complete: function(data, status) { //optional, used for debugging purposes
            console.log(status);
        }
    });
});

$('#create-account-button').on('click', function(e) {
    e.preventDefault();
    
    $.ajax({
        type: "POST",
        url: "/scheduler/create_account",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
               "fname": $("#CA_fname").val(),
               "lname": $("#CA_lname").val(),
            "username": $("#CA_username").val(),
            "password": $("#CA_password").val()
        }),
        success: function(result, status) {
            console.log("got login status back", result);
            if (result.successful) {
                alert("Account Created");
                window.location.href = '/scheduler';
            }
            else {
                // Show an error message or something and stay here
                alert(result.message);
            }
        },
        error: function(xhr, status, error) {
            error = eval("error: (" + xhr.responseText + ")");
            console.error(error);
        },
        complete: function(data, status) { //optional, used for debugging purposes
            console.log(status);
        }
    });
});

$('#logout-button').on('click', function(e) {
    // Do not submit until I am ready
    e.preventDefault();
    
    $.ajax({
        type: "GET",
        url: "/scheduler/logout",
        dataType: "json",
        success: function(result, status) {
            console.log("got logout status back", result);
            if (result.successful) {
                // This will navigate to wherever i say...
                window.location.href = '/scheduler';
            }
            else {
                // Show an error message or something and stay here
                alert(result.message);
            }
        },
        error: function(xhr, status, error) {
            err = eval("error: (" + xhr.responseText + ")");
            console.error(err);
        },
        complete: function(data, status) { //optional, used for debugging purposes
            console.log(status);
        }
    });
});

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function showBussinessAppointments() {
    $.ajax({
        type: "GET",
        url: "/scheduler/dashboard/bussinessAppointments",
        dataType: "json",
        contentType: "application/json",
        success: function(result, status) {
            console.log("got appointment status back", result);
            if (result.successful) {
                $("#bussinessAppointmentsTable").empty();
                //set bussiness table head
                $(`<div class="table-row header">
                    <div class="text" style="width: 20%">Date</div>
                    <div class="text" style="width: 20%">Start Time</div>
                    <div class="text" style="width: 20%">Duration</div>
                    <div class="text" style="width: 20%">Booked By</div>
                    <a class="btn btn-info" onclick="document.getElementById('add').style.display='block'" style="width: 20%">Add Appointment</a>
                </div>`).appendTo("#bussinessAppointmentsTable");
                
                //variables for calculating appointment duration
                var startTime = new Date();
                var endTime   = new Date();
                var startValue, endValue;
                var hrs, min, sec;
                var duration;
                
                //populate bussiness table
                for (let i = 0; i < result.appointment.length; i++) {
                    startValue = result.appointment[i].startTime.split(':');
                    endValue = result.appointment[i].endTime.split(':');
                    
                    startTime.setHours(startValue[0], startValue[1], startValue[2], 0);
                    endTime.setHours(endValue[0], endValue[1], endValue[2], 0);
                    
                    hrs = endTime.getHours() - startTime.getHours();
                    min = endTime.getMinutes() - startTime.getMinutes();
                    sec = endTime.getSeconds() - startTime.getSeconds();
                    duration = hrs + "hrs " + min + "min " + sec + "sec";
                    
                    $(`<div class="table-row">
                           <div class="text" style="width: 20%" onclick="">
                               ${result.appointment[i].date.split("T", 1)}
                           </div>
                           <div class="text" style="width: 20%">${result.appointment[i].startTime}</div>
                           <div class="text" style="width: 20%">${duration}</div>
                           <div class="text" style="width: 20%">${result.appointment[i].bookedBy}</div>
                           <div style="width: 20%">
                               <a class="btn btn-edit btn-primary" onclick="showDetails(${result.appointment[i].appointmentID})">Details</a>
                               <a class="btn btn-delete btn-danger" onclick="deleteAppointment(${result.appointment[i].appointmentID})">Delete</a>
                           </div>
                       </div>`).appendTo("#bussinessAppointmentsTable"); 
                
                }
            }
            else {
                $("#bussinessAppointmentsTable").html(result.message).show();
                $("#bussinessAppointmentsTable").attr("class", "alert alert-danger mt-3");
                document.getElementById("#bussinessAppointmentsTable").style.textAlign = "center";
            }
        },
        error: function(xhr, status, error) {
            error = eval("error: (" + xhr.responseText + ")");
            console.error(error);
        }
    });
}

function showDetails(appointmentID) {
    console.log("Appointment", appointmentID);
    
    $.ajax({
        type: "POST",
        url: "/scheduler/dashboard/bussinessAppointments/details",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
               "appointmentID": appointmentID
        }),
        success: function(result, status) {
            document.getElementById("appointmentID").value = result.appointment.appointmentID;
            document.getElementById("appointmentDate").value = result.appointment.date;
            document.getElementById("appointmentStartTime").value = result.appointment.startTime;
            document.getElementById("appointmentEndTime").value = result.appointment.endTime;
            document.getElementById("appointmentBookedBy").value = result.appointment.bookedBy;
            
            $('#detailsModal').modal('toggle');
            //document.getElementById('detailsModal').modal('show');
           // window.$("#detailsModal").modal("show");
        },
        error: function(xhr, status, error) {
            error = eval("error: (" + xhr.responseText + ")");
            console.error(error);
        }
    });
}

$("#btn1").on('click', function(e) {
    e.preventDefault();
    
    var startTime = new Date();
    var endTime   = new Date();
    var startValue = $("#startTime").val().split(':');
    var endValue = $("#endTime").val().split(':');
    startTime.setHours(startValue[0], startValue[1], 00, 0);
    endTime.setHours(endValue[0], endValue[1], 00, 0);
    
    console.log("TIME: ", startTime);
    
    $.ajax({
        type: "POST",
        url: "/scheduler/dashboard/add_appointment",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
              "date": $("#date").val(),
              "startTime": startTime,
              "endTime":endTime
        }),
        success: function(result, status) {
            document.getElementById('add').style.display='none';
            location.reload(true);
        },
        error: function(xhr, status, error) {
            err = eval("error: (" + xhr.responseText + ")");
            console.error(err);
        }
    });
});
var ID;
function deleteAppointment(id) {
    ID = id;
    $.ajax({
        type: "POST",
        url: "/scheduler/dashboard/delete-confirmation",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
               "appointmentID": id
        }),
        success: function(result, status) {
            document.getElementById("del_date").append(result.appointment[0].date.split('T', 1));
            document.getElementById("del_startTime").append(result.appointment[0].startTime);
            document.getElementById("del_endTime").append(result.appointment[0].endTime);
            document.getElementById('delete').style.display='block';
        },
        error: function(xhr, status, error) {
            error = eval("error: (" + xhr.responseText + ")");
            console.error(error);
        }
    });
}

$("#btn3").on('click', function(e) {    
    e.preventDefault();
    $.ajax({
        type: "POST",
        url: "/scheduler/dashboard/delete_appointment",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
              "appointmentID": ID
        }),
        success: function(result, status) {
            if (result.successful) {
                 document.getElementById('delete').style.display='none';
                 location.reload(true);
            }
        },
        error: function(xhr, status, error) {
            err = eval("error: (" + xhr.responseText + ")");
            console.error(err);
        }
    });
});


// Get the modal
var add_modal = document.getElementById('add');
var delete_modal = document.getElementById('delete');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == add_modal) {
        add_modal.style.display = "none";
    }
    if (event.target == delete_modal) {
        delete_modal.style.display = "none";
    }
};

