<?php
include 'DbClass.php';
$db = new Db();
$xValue = $_POST['xValue'];
$yValue = $_POST['yValue'];
$zone = $_POST['zone'];
$counter = 0;
for($i = 0; $i < $xValue; $i++)
{
 for($m = 0; $m < $yValue; $m++)
 {
     $harvest = rand(0,40) + 40;
     $lumber = rand(0,40) + 40;
     $scrap = rand(0,40) + 40;
     $water = rand(0,40) + 40;
     $hunting = rand(0,40) + 40;
     $creatures = rand(0,40) + 40;
     $mining = rand(0,40) + 40;
     $result = $db -> query("INSERT INTO maps (mapR,mapC,zone,harvest,lumber,scrap,water,hunting,creatures,mining) VALUES (" . $i . "," . $m . ",'" . $zone . "'," . $harvest . "," . $lumber . "," . $scrap . "," . $water . "," . $hunting . "," . $creatures . "," . $mining . ")");  
     $counter++;
 }
}
if($db->error() != '')
{
    $error = $db->error();
    $db - > close();
    echo json_encode($error);
}
else
{
    $db -> close();
     echo json_encode($counter . " locations created");
}
?>