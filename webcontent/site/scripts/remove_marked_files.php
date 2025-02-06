<?php
/***********************************************************
Entfernen mehrerer Dateien
***********************************************************/
if(isset($_POST['remove'])) {
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
    $ids = JSON_DECODE($_POST["ids"], true);

    /***********************************************************
    JavaScript Parameter Prüfen
    ***********************************************************/
    if($ids === false) {
        $error = true;
        $msg["ERROR"][] = "Ungültige Dateien (1)";
    } else if(!is_array($ids)) {
        $error = true;
        $msg["ERROR"][] = "Ungültige Dateien (2)";
    } else if(count($ids) == 0) {
        $error = true;
        $msg["ERROR"][] = "Ungültige Dateien (3)";
    } else {
        $files = array();
        foreach($ids as $index => $id) {
            if(!is_numeric($id)) {
                $error = true;
                $msg["ERROR"][] = "Ungültige Dateien (4)";
            } else if(intval($id) == 0) {
                $error = true;
                $msg["ERROR"][] = "Ungültige Dateien (5)";
            } else {
                $sql = "SELECT id, file_name_saved, file_path FROM files WHERE id = ".$id;
                $result = $pdo->query($sql)->fetch();
                if(!$result) {
                    $error = true;
                    $msg["ERROR"][] = "Ungültige Datei (6)";
                } else {
                    $files[] = $result["file_path"].$result["file_name_saved"];
                }
            }
        }
    }

    /***********************************************************
    Wenn keine Übermittlungsfehler existieren entferne die
    Dateien vom Server
    ***********************************************************/
    if(!$error) {
        foreach($files as $index => $file) {
            if(!unlink($file)) {
                $error = true;
                $msg["ERROR"][] = "Datei konnte nicht entfernt werden";
            }
        }
    }
    
    /***********************************************************
    Wenn keine Übermittlungsfehler existieren entferne die
    Dateien von der Datenbank
    ***********************************************************/
    if(!$error) {
        foreach($ids as $index => $id) {
            $file = $pdo->prepare("DELETE FROM files WHERE id = ".$id);
            $file->execute();
            if(!$file) {
                $error = true;
                $msg["ERROR"][] = "Datenbankeintrag für die Datei konnte nicht entfernt werden";
            }
        }
    }

    /***********************************************************
    Rückgabe der Daten an JavaScript
    ***********************************************************/
    if(!$error) {
        if(!isset($_POST["test"])) {
		    echo JSON_ENCODE($ids);
        } else {
            $data = JSON_ENCODE($ids);
        }
	} else {
        if(!isset($_POST["test"])) {
		    echo JSON_ENCODE($msg);
        } else {
            $data = JSON_ENCODE($msg);
        }
	}
} ?>
