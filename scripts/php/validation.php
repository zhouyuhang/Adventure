<?php
session_start();
include 'DbClass.php';
$db = new Db();
$name=$db -> quote($_POST['user_name']);
$pass=md5($_POST['password']);
//'' mark on $pass because $pass is string, same to $name
$rows = $db -> select("select class,name,id from players where name=" . $name . " and password='" . $pass . "'");
if($rows)
{
   $_SESSION['playerID']=$rows[0]['id'];
   $_SESSION['playerName']=$rows[0]['name'];
   $_SESSION['playerClass']=$rows[0]['class'];

   $id = $_SESSION['playerID'];
   $db -> query("UPDATE players SET lastseen=now() where id= " . $id . "");

	$fp = fopen("../../chat.html", 'a');  
	fwrite($fp, "<div class='msgln'>".$_SESSION['playerName']." has Join the Game."."<br></div>");  
	fclose($fp);

   echo json_encode($rows);
}
else
{
   echo json_encode("0");
}

?>