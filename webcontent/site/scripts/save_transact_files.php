<?php
/***********************************************************
Dashboard CWFM Eigenschaften
***********************************************************/
if(isset($_POST['save'])) {
	include("./db.php");
	$error = false;
	$msg = array();

    /***********************************************************
    Übermittelte Parameter von JavaScript
    ***********************************************************/
    $folder = trim($_POST["folder"]);
    $ids = JSON_DECODE($_POST["ids"], true);

    /***********************************************************
    JavaScript Parameter Prüfen
    ***********************************************************/
    if(strlen($folder) == 0) {
        $error = true;
        $msg["ERROR"][] = "Kein Hauptverzeichnis übermittelt um zu verschieben!";
    } else if(!is_numeric($folder)) {
        $error = true;
        $msg["ERROR"][] = "Ungültiges Hauptverzeichnis (1)!";
    } else {
        $sql = "SELECT id, folder_name FROM folders WHERE id = ".$folder;
        $result = $pdo->query($sql)->fetch();
        if(!$result) {
            $error = true;
            $msg["ERROR"][] = "Ungültiges Hauptverzeichnis (2)!";
        }
    }
    if(count($ids) == 0) {
        $error = true;
        $msg["ERROR"][] = "Keine Dateien übermittelt um zu verschieben!";
    } else {
        for($i = 0; $i < count($ids); $i++) {
            if(!is_numeric($ids[$i])) {
                $error = true;
                $msg["ERROR"][] = "Fehlerhaft übermittelte Datei (1)!";
            }
        }
    }
    if(!$error) {
        for($i = 0; $i < count($ids); $i++) {
            $sql = "SELECT id FROM files WHERE id = ".$ids[$i];
            $result = $pdo->query($sql)->fetch();
            if(!$result) {
                $error = true;
                $msg["ERROR"][] = "Fehlerhaft übermittelte Datei (2)!";
            }
        }
    }

    /***********************************************************
    Wenn keine Übermittlungsfehler existieren speichere den
    neuen Verzeichnisnamen in der Datenbank
    ***********************************************************/
    if(!$error) {
        for($i = 0; $i < count($ids); $i++) {
            $statement = $pdo->prepare("UPDATE files SET folder_id = :folder_id WHERE id = ".$ids[$i]);
            $result = $statement->execute(array("folder_id" => $folder));
            if(!$result) {
                $error = true;
                $msg["ERROR"][] = "Verschieben konnte nicht gespeichert werden!";
            }
        }
    }

    /***********************************************************
    Rückgabe der Daten an JavaScript
    ***********************************************************/
    if(!$error) {
		echo JSON_ENCODE("TRUE");
	} else {
		echo JSON_ENCODE($msg);
	}
} ?>