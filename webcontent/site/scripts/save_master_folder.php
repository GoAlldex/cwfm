<?php
if(isset($_POST['save'])) {
	include("./db.php");
	$error = false;
	$msg = array();

    $name = trim($_POST["name"]);

    if(strlen($name) == 0) {
        $error = true;
        $msg["ERROR"][] = "Bitte geben Sie einen Ordnernamen ein";
    }

    if(!$error) {
        $statement = $pdo->prepare("INSERT INTO folders (folder_name) VALUES (:folder_name)");
        $result = $statement->execute(array("folder_name" => $name));
        if(!$result) {
            $error = true;
            $msg["ERROR"][] = "Titel konnte nicht gespeichert werden";
        }
    }

    if(!$error) {
		echo JSON_ENCODE("TRUE");
	} else {
		echo JSON_ENCODE($msg);
	}
} ?>