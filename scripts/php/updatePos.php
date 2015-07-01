<?php
session_start();
include 'DbClass.php';
$db = new Db();

$id = $_SESSION['playerID'];
$xposition = $_POST['xposition'];
$yposition = $_POST['yposition'];

$rows = $db -> query("UPDATE players SET 'xpos'=" . $xposition . ", 'ypos'=" . $yposition . " WHERE id= " . $id . ";");
if($db->error() != '')
{
    $error = $db->error();
    $db -> close();
    echo json_encode($error);
}
else
{
     $db -> close();
    echo json_encode($xposition+":"+$yposition);
}
?>