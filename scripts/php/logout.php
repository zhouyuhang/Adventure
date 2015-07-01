<?php
session_start();

$fp = fopen("../../chat.html", 'a');  
//fwrite($fp, "<div class='msgln'>".$_SESSION['playerName']." has Left the Game."."<br></div>");  
fclose($fp);
session_destroy();
echo json_encode("1");
?>