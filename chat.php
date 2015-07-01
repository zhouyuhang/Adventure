<?php

/*
Project Name: Simple PHP group chat App
Author: Ankit Arte
*/

session_start();
$_SESSION['name'] = 'Guest';
if(isset($_GET['logout'])){	

	//when the user logs out
	$fp = fopen("chat.html", 'a');
	fwrite($fp, "<div class='msgln'><i>User ". $_SESSION['name'] ." has left the chat session.</i><br></div>");
	fclose($fp);
	//$file = file_get_contents('users.html', FILE_USE_INCLUDE_PATH);
	//$replace = preg_replace("/".$_SESSION['name']."<br>/" ,"",$file);
	//file_put_contents("users.html",$replace);
	
	session_destroy();
	header("Location: index.php"); //Redirect the user
}
/*
// when the user logn in
if(isset($_POST['enter'])){
	if($_POST['name'] != ""){
		$_SESSION['name'] = stripslashes(htmlspecialchars($_POST['name']));
			$fu = fopen("users.html", 'a');
			fwrite($fu, $_SESSION['name']."<br>");
			fclose($fu);
	}
	else{
		echo '<font color="red">Please type in your name</font>';
	}
}
*/
?>

<!DOCTYPE html>
<html>
<head>
    <title>Adventure</title>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="IE=Edge">
    <meta name="viewport" content="width=device-width, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes"> 
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js">
	<link type="text/css" rel="stylesheet" href="scripts/styles.css">

    <script type="text/javascript" src="lib/bootstrap.min.js"></script>
    <script type="text/javascript" src="lib/enchant.js"></script>
    <script type="text/javascript" src="lib/ui.enchant.js"></script>
    <script type="text/javascript" src="scripts/js/register.js"></script>
    <script type="text/javascript" src="scripts/js/userLogin.js"></script>
    <script type="text/javascript" src="scripts/js/chat.js"></script>

</head>


<div id="wrapper_chat">
	<div id="chatbox"><?php
	if(file_exists("chat.html") && filesize("chat.html") > 0){
		$handle = fopen("chat.html", "r");
		$contents = fread($handle, filesize("chat.html"));
		fclose($handle);
		echo $contents;
	}?>
</div>		
	<form name="message" action="">
		<input name="usermsg" type="text" id="usermsg" />
		<input name="submitmsg" type="submit"  id="submitmsg"  value="Send" />
	</form>
</div>

<script type="text/javascript">
$(document).ready(function(){
	
	//If user submits the form
	$("#submitmsg").click(function(){	
		var user_msg = $("#usermsg").val();
		$.post("post.php", {text: user_msg});				
		$("#usermsg").attr("value", "");
		return false;
	});
	
	//function to load the chat file contents into chatbox and to scroll automatically
	function loadLog(){			
		$.ajax({
			url: "chat.html",
			cache: false,
			success: function(html){		
				$("#chatbox").html(html); 				
				$("#chatbox").attr({ scrollTop: $("#chatbox").attr("scrollHeight") });  				
		  	},
		});
	}
	setInterval (loadLog, 1000); //load the file every 2 seconds
});
</script>

</body>
</html>