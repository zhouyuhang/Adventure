<?php
session_start();
if(isset($_SESSION['playerID'])) //variable created in validation.php
{
   echo json_encode("1");
}
else
{
   echo json_encode("0");
}

?>