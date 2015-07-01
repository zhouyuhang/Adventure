function getmessage(messageId)
{
     var message = "";
     messageId = parseInt(messageId);
    console.log(messageId);
     switch(messageId)
     {
          case 0:
                 message = "This username is already taken."
                 break;
          case 1:
                 message = "Registration complete! Please click 'Cancel' to log in."
                 break;
          case 2:
                 message = "Passwords do not match!"
                 break;
          case 3:
                 message = "Username is too short. Must be >= 3 characters."
                 break;
          case 4:
                 message = "Username is too long. Must be <= 16 characters."
                 break;
          case 5:
                 message = "Password is too short. Must be >= 6 characters."
                 break;
          case 6:
                 message = "Please Select a class."
                 break; 
     }
    //console.log(message);
         return message;
}

function register()
{
    if($('#registerPassword').val() != $('#rePassword').val())
    {
           $("#registerMsgbox").fadeTo(200,0.1,function()
      { 
        $(this).html(getmessage(2)).addClass('alert alert-danger').fadeTo(900,1);
      }); 
        return;
    }
     if($('#registerUsername').val().length < 3)
    {
           $("#registerMsgbox").fadeTo(200,0.1,function()
      { 
        $(this).html(getmessage(3)).addClass('alert alert-danger').fadeTo(900,1);
      }); 
        return;
    }
      if($('#registerUsername').val().length > 16)
    {
           $("#registerMsgbox").fadeTo(200,0.1,function()
      { 
        $(this).html(getmessage(4)).addClass('alert alert-danger').fadeTo(900,1);
      }); 
        return;
    }
      if($('#registerPassword').val().length < 6)
    {
           $("#registerMsgbox").fadeTo(200,0.1,function()
      { 
        $(this).html(getmessage(5)).addClass('alert alert-danger').fadeTo(900,1);
      }); 
        return;
    }
     
     if (! $("input[name=radioClasses]").is(':checked'))
    {
           $("#registerMsgbox").fadeTo(200,0.1,function()
      { 
        $(this).html(getmessage(6)).addClass('alert alert-danger').fadeTo(900,1);
      }); 
        return;
    }
    
    var playerClass = $('input[name=radioClasses]:checked', '#register_form').val(); //user's selection of class
    
     $.ajax({
        url : 'scripts/php/register.php',
        type : 'POST',
        data : { userName:$('#registerUsername').val(),password:$('#registerPassword').val(),playerClass:playerClass
        },
        dataType:'json',
        success : function(data) { 
            if(data === "1")
            {
                //checkSession();                
                $("#registerMsgbox").fadeTo(200,0.1,function()
                    { 
                      $(this).html(getmessage(data)).addClass('alert alert-success').fadeTo(900,1);
                    });
                                   
            }
            else
            {
                $("#registerMsgbox").fadeTo(200,0.1,function()
                { 
                  $(this).html(getmessage(data)).addClass('alert alert-danger').fadeTo(900,1);
                }); 
            }
        }
    });
}

