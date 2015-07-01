<?php
session_start();
include 'DbClass.php';
$id = $_SESSION['playerID'];
$db = new Db();
$result = $db -> query("UPDATE players SET experience = experience+10 where id= " . $id . ";");
if($db->error() != '')
{
    $error = $db->error();
    $db -> close();
    echo json_encode($error);
}
else
{
     $db -> close();
    echo json_encode(1);
}
?>