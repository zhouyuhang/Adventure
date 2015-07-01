<?php
session_start();
include 'DbClass.php';
$id = $_SESSION['playerID'];
$db = new Db();
$rows = $db -> select("select * from players where id= " . $id . ";");
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