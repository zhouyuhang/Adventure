<?php
session_start();
include 'DbClass.php';
$db = new Db();

$id = $_SESSION['playerID'];
$xposition = $_POST['xposition'];
$yposition = $_POST['yposition'];
$direction = $_POST['direction'];

$rows = $db -> query("UPDATE players SET xpos=" . $xposition . ", ypos=" . $yposition . ", direction=" . $direction . " WHERE id= " . $id . ";");
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