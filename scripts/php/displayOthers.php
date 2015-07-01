<?php
session_start();
include 'DbClass.php';
$id = $_SESSION['playerID'];
$db = new Db();
//select online players who is not yourself and who has logged in within the last 60 mins
$rows = $db -> select("SELECT * FROM players WHERE id != " . $id . " AND lastseen > NOW() - INTERVAL 60 MINUTE");
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