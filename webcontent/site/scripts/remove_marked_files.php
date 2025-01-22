<?php
/***********************************************************
Entfernen mehrerer Dateien
***********************************************************/
if(isset($_POST['remove'])) {
	include("./db.php");
	$error = false;
	$msg = array();

    /***********************************************************
    Übermittelte Parameter von JavaScript
    ***********************************************************/
    $ids = JSON_DECODE($_POST["ids"], true);

    /***********************************************************
    JavaScript Parameter Prüfen
    ***********************************************************/
    if(count($ids) == 0) {
        $error = true;
        $msg["ERROR"][] = "Ungültige Dateien (1)";
    } else {
        $files = array();
        foreach($ids as $index => $id) {
            if(!is_numeric($id)) {
                $error = true;
                $msg["ERROR"][] = "Ungültige Dateien (2)";
            } else if(intval($id) == 0) {
                $error = true;
                $msg["ERROR"][] = "Ungültige Dateien (3)";
            } else {
                $sql = "SELECT id, file_name_saved, file_path FROM files WHERE id = ".$id;
                $result = $pdo->query($sql)->fetch();
                if(!$result) {
                    $error = true;
                    $msg["ERROR"][] = "Ungültige Datei (4)";
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
		echo JSON_ENCODE($ids);
	} else {
		echo JSON_ENCODE($msg);
	}
} ?>