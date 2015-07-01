<?php
include 'DbClass.php';
$db = new Db();
$table = $_POST['table']; //which is 'classes'

$rows = $db -> select("select * from " .$table. "");
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