<?php 
$fp = fopen('asset/results.json', 'w');
fwrite($fp, (($_POST["data"])));
fclose($fp); 
?> 