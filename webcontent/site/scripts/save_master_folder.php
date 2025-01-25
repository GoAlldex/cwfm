<?php
/***********************************************************
Speichern eines neuen Hauptverzeichnisses
***********************************************************/
if(isset($_POST['save'])) {
	if(!isset($_POST["test"])) {
	    include("./db.php");
    } else {
        include("../../../var/www/html/scripts/db.php");
    }
	$error = false;
	$msg = array();

    /***********************************************************
    Übermittelte Parameter von JavaScript
    ***********************************************************/
    $name = trim($_POST["name"]);

    /***********************************************************
    JavaScript Parameter Prüfen
    ***********************************************************/
    if(strlen($name) == 0) {
        $error = true;
        $msg["ERROR"][] = "Bitte geben Sie einen Ordnernamen ein";
    }

    /***********************************************************
    Wenn keine Übermittlungsfehler existieren speichere den
    Verzeichnisnamen in der Datenbank
    ***********************************************************/
    if(!$error) {
        $statement = $pdo->prepare("INSERT INTO folders (folder_name) VALUES (:folder_name)");
        $result = $statement->execute(array("folder_name" => $name));
        if(!$result) {
            $error = true;
            $msg["ERROR"][] = "Hauptverzeichnis konnte nicht gespeichert werden";
        }
    }

    /***********************************************************
    Rückgabe der Daten an JavaScript
    ***********************************************************/
    if(!$error) {
        if(!isset($_POST["test"])) {
		    echo JSON_ENCODE("TRUE");
        } else {
            $data = JSON_ENCODE("TRUE");
        }
	} else {
        if(!isset($_POST["test"])) {
		    echo JSON_ENCODE($msg);
        } else {
            $data = JSON_ENCODE($msg);
        }
	}
} ?>