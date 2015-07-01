<?php
session_start();  
if(isset($_SESSION['playerName']) && $_POST['text']!=''){  
    $text = $_POST['text'];  
  
    $fp = fopen("chat.html", 'a');  
    fwrite($fp, "<div class='msgln'><b>".$_SESSION['playerName']."</b>: ".stripslashes(htmlspecialchars($text))."<br></div>");  
    fclose($fp);  
}
  
?>