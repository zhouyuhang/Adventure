<?php
include 'DbClass.php';
$db = new Db();
$userName = $db -> quote($_POST['userName']);
$password = md5($_POST['password']);
$playerClass = $_POST['playerClass'];

$rows = $db -> select("select * from players where name=" . $userName ."");
if($db->error() != '')
{
    $error = $db->error();
    $db -> close();
    echo json_encode($error);
}
else
{
    if(count($rows) > 0)
    {
      echo json_encode("0"); //user name taken
    }
    else
    {
        $rows = $db -> select("select * from classes where id=" . $playerClass ." ");
        if($db->error() != '')
        {
            $error = $db->error();
            $db -> close();
            echo json_encode($error);
        }
        else
        {
            $hpoints = $rows[0]['hpoints'];
            $mpoints = $rows[0]['mpoints'];
            $attack = $rows[0]['attack'];
            $speed = $rows[0]['speed'];
            $armor = $rows[0]['armor'];
            $result = $db -> query("INSERT INTO players (name,password,class,hpoints,mpoints,attack,speed,armor,level,experience) VALUES (" . $userName . ", '" . $password . "', " . $playerClass . ", '$hpoints','$mpoints','$attack','$speed','$armor', '1', '0')");
            $item   = $db -> query("INSERT INTO items (itemName,userName,quantity,itemId,attack,speed,armor,hpoints,mpoints) VALUES ('small bread', " . $userName . ", '1', '101', '', '', '', '100', ''), ('small clarity', " . $userName . ", '1', '102', '', '', '', '', '100')");
            $db -> close();
            echo json_encode("1"); //success
        }
    
    }
}

?>