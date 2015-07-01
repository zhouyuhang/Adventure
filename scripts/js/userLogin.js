
function checkSession()
{
      $.ajax({
            url : 'scripts/php/checkSession.php',
            type: 'POST',
        dataType: 'json',
        success : function(data) {
            if(data != 0)
            {
                buildPage();                
            }
            else
            {
                loginPage();
            }
        }
});
}

function buildPage()
{
  userStat();
  setInterval (userStat,3000);  //update user Status every 3 sec
  setInterval (updateLastSeen,60000);   //update logged in users' lastSeen time every 10 minutes
}


function login()
{
    $("#msgbox").removeClass().addClass('messagebox').text('Validating....').fadeIn(1000);  
        $.ajax({
            url : 'scripts/php/validation.php',
            type : 'POST',
            data : { user_name:$('#username').val(),password:$('#password').val()
        },
        dataType:'json',
        success : function(data) { 
            console.log(data);
          if(data != 0)
                {
                        $("#msgbox").fadeTo(200,0.1,function()
                        { 
                          $(this).html('Logging in...').addClass('alert alert-success').fadeTo(900,1,
                          function()
                          { 
                              $('#loginModal').modal('toggle');
                              location.reload();
                          });

                        });
            }
            else
            {
               $("#msgbox").fadeTo(200,0.1,function()
                    { 
                      $(this).html('Your login details are incorrect').addClass('alert alert-danger').fadeTo(900,1);
                    });    
            }
        }
    });
}

function logout()
{
        $.ajax({
            url : 'scripts/php/logout.php',
            type : 'POST',
        dataType:'json',
        success : function(data) { 
           location.reload();
        }
    });
}

function loginPage()
{
     $('#loginModal').modal('toggle');
      document.getElementById("registerBox").innerHTML = "<form class='form-horizontal' method='post' action='' id='login_form'>" +
            "<div class='control-group'>" +
            "<label class='control-label' for='username'>Username</label>" +
            "<div class='controls'>" +
              "<input type='text' id='username' placeholder='Username'></div></div>" +
            "<div class='control-group'> " +
            "<label class='control-label' for='password'>Password</label>" +
            "<div class='controls'>" +
              "<input type='password' id='password' placeholder='Password'>" +
            "</div><br>" +
            "<div id='msgbox'></div></div>" +
            "<div class='control-group'>" +
            "<div class='controls'>" +
              "<input name='Submit' type='button' onclick='javascript:login()' value='Log in' class='btn btn-primary'/>&nbsp;&nbsp;" +
              "<input name='Submit' type='button' onclick='javascript:registration()' value='Register' class='btn btn-success'/>" +
            "</div></div><br>"+
          "</form><div class='modal-footer'></div>";
      $("#login_form input").keypress(function(e) {
      if(e.which == 13) {
        login();
    };
});
}

function registration()
{
      document.getElementById("registerBox").innerHTML = "<form class='form-horizontal' method='post' action='' id='register_form'>" +
					  "<div class='row'><div class='col-md-5 column'><div class='control-group'>" + 
						"<label class='control-label' for='username'>Username</label><div class=''controls'>" + 
						  "<input type='text' id='registerUsername' placeholder='Username'>" +
						"</div></div>" +
					  "<div class='control-group'>" +
						"<label class='control-label' for='password'>Password</label>" +
						"<div class='controls'>" +
						  "<input type='password' id='registerPassword' placeholder='Password'>" +
						"</div><br></div>" +
            "<div class='control-group'>" +
						"<label class='control-label' for='rePassword'>Retype Password</label>" +
						"<div class='controls'>" +
						  "<input type='password' id='rePassword' placeholder='Password'>" +
						"</div><br></div><br>"+
            "<div class='control-group'>" +
            "<div class='controls'>" +
              "<input name='Submit' type='button' onclick='javascript:register()' value='Register' class='btn btn-success'/>&nbsp;&nbsp;" +
              "<input name='Submit' type='button' onclick='javascript:location.reload(); ' value='Cancel' class='btn btn-default'/>"+
            "</div></div><br>"
            +"<div id='registerMsgbox'></div></div>" +
                        "<div class='col-md-5 column'>" +
                        "<b><u>Choose a Class</b></u><br><div id='characters'></div>" +
                        "</div></div>" +
					  "</form>"+"<div class='modal-footer'></div>";
    $.ajax({
        url : 'scripts/php/getCharacters.php',
        type : 'POST',
        data : {table:'classes'},
        dataType:'json',
        success : function(data) {              
           buildClasses(data); //show the class with pic.
        }
    });
}


//displaying character classes when register
function buildClasses(data)
{
    var characterDiv = "";
    for(var i = 0; i < data.length; i++)
    {
        characterDiv += "<div class='characterBox'><input type='radio' name='radioClasses' value='" + data[i].id + "'>" +
        "<img src='images/heroTiles/" + data[i].pic + ".png'>" + data[i].name + "</div>";
    }
    document.getElementById("characters").innerHTML = characterDiv;
}

//display user status on main page
function userStat(){
  $.ajax({
      url : 'scripts/php/userstat.php',
      type : 'POST',
      dataType:'json',
      success : function(data) {
        var playerclass = "";
        var classNO = data[0].class;
          
        if     (classNO==1 || classNO==2) playerclass="Swordsman";
        else if(classNO==3 || classNO==4) playerclass="Berserker";
        else if(classNO==5 || classNO==6) playerclass="Mage";
        else if(classNO==7 || classNO==8) playerclass="Preist";
        else if(classNO==9 || classNO==10)playerclass="Fighter";
        else playerclass="Human";        

          document.getElementById("userstat").innerHTML = 
          "Name: "+ data[0].name +" "+
          "<br>Class: "+ playerclass +" "+
          "<br>Level: "+ data[0].level +" "+
          "<br>Experience: "+ data[0].experience +" "+
          "<br>Health: "+ data[0].hpoints +" "+
          "<br>Magic: "+ data[0].mpoints +" "+          

          "<br><br>Attack: "+ data[0].attack +" "+
          "<br>Speed: "+ data[0].speed +" "+
          "<br>Armor: "+ data[0].armor +" "+

          "<br><br>Gold: "+ data[0].gold +" ";
      }
  })
}

//update the user's datetime in database
function updateLastSeen(){
   $.ajax({
      url : 'scripts/php/updateLastSeen.php',
      type : 'POST',
      dataType:'json',
      success : function(data) {}
  })
}