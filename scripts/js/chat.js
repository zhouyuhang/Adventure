$(document).ready(function(){
    
    //If user submits the form
    $("#submitmsg").click(function(){   
        var user_msg = $("#usermsg").val();
        $.post("post.php", {text: user_msg});               
        //$("#usermsg").attr("value", "");
        document.getElementById("usermsg").value = "";
        return false;
    });
    
    //function to load the chat file contents into chatbox and to scroll automatically
    function loadLog(){     
        var oldscrollHeight = $("#chatbox").attr("scrollHeight") - 20;
        $.ajax({
            url: "chat.html",
            cache: false,
            success: function(html){        
                $("#chatbox").html(html);                            
                document.getElementById("chatbox").scrollTop = document.getElementById("chatbox").scrollHeight;
                },
        });
    }
    loadLog();
    setInterval (loadLog, 3000); //load the file every 1 seconds
});