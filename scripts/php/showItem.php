<?php
session_start();
include 'DbClass.php';
//$id = $_SESSION['playerID'];
$playerName = $_SESSION['playerName'];
$db = new Db();
$rows = $db -> select("select * from items where userName = '$playerName';");
if($db->error() != '')
{
    $error = $db->error();
    $db -> close();
    echo json_encode($error);
}
else
{
     $db -> close();
    echo json_encode($rows);
}
?>