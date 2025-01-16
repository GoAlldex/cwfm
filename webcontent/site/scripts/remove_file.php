<?php
if(isset($_POST['remove'])) {
	include("./db.php");
    $data = array();
	$error = false;
	$msg = array();

    $id = trim($_POST["id"]);

    if(strlen($id) == 0) {
        $error = true;
        $msg["ERROR"][] = "Ungültiger Datei (1)";
    } else if(!is_numeric($id)) {
        $error = true;
        $msg["ERROR"][] = "Ungültiger Datei (2)";
    } else if(intval($id) == 0) {
        $error = true;
        $msg["ERROR"][] = "Ungültiger Datei (3)";
    } else {
        $sql = "SELECT id, file_name_saved, file_path FROM files WHERE id = ".$id;
        $result = $pdo->query($sql)->fetch();
        if(!$result) {
            $error = true;
            $msg["ERROR"][] = "Ungültiger Datei (4)";
        } else {
            $file = $result["file_path"].$result["file_name_saved"];
        }
    }

    if(!$error) {
        if(!unlink($file)) {
            $error = true;
            $msg["ERROR"][] = "Datei konnte nicht entfernt werden";
        }
    }
    if(!$error) {
        $file = $pdo->prepare("DELETE FROM files WHERE id = ".$id);
        $file->execute();
        if(!$file) {
            $error = true;
            $msg["ERROR"][] = "Datenbankeintrag für die Datei konnte nicht entfernt werden";
        }
    }

    if(!$error) {
		echo JSON_ENCODE("TRUE");
	} else {
		echo JSON_ENCODE($msg);
	}
} ?>