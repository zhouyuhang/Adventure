<?php
session_start();
include 'DbClass.php';
$id = $_SESSION['playerID'];
$db = new Db();

$rows = $db -> select("SELECT experience FROM players WHERE id= " . $id . ";");
$exp = $rows[0]['experience'];
$level = 0.3*sqrt($exp);
$randexp = rand(0,10);
$randgold = rand(0,10);

$result = $db -> query("UPDATE players SET experience = experience+20+$randexp, gold = gold+20+$randgold where id= " . $id . ";");
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