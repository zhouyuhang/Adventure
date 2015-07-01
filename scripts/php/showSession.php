<?php
session_start();
if(isset($_SESSION['playerName'])) //variable created in validation.php
{
   $name = $_SESSION['playerName'];
   echo json_encode($name);
}
else
{
   echo json_encode('Guest');
}

?>