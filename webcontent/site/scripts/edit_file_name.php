<?php
/***********************************************************
Umbennen einer Datei
***********************************************************/
if(isset($_POST['save'])) {
	include("./db.php");
    $data = array();
	$error = false;
	$msg = array();

    /***********************************************************
    Übermittelte Parameter von JavaScript
    ***********************************************************/
    $id = trim($_POST["id"]);
    $name = trim($_POST["name"]);

    /***********************************************************
    JavaScript Parameter Prüfen
    ***********************************************************/
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
        $sql = "SELECT id, file_name_original, file_type FROM files WHERE id = ".$id;
        $result = $pdo->query($sql)->fetch();
        if(!$result) {
            $error = true;
            $msg["ERROR"][] = "Ungültiger Datei (4)";
        } else {
            $data["NAME_O"] = $name;
            $data["TYPE"] = $result["file_type"];
        }
    }
    if(strlen($name) == 0) {
        $error = true;
        $msg["ERROR"][] = "Bitte geben Sie einen Dateinamen ein";
    }

    /***********************************************************
    Wenn keine Übermittlungsfehler existieren speichere den
    neuen Dateinamen in der Datenbank
    ***********************************************************/
    if(!$error) {
        $statement = $pdo->prepare("UPDATE files SET file_name_original = :file_name_original WHERE id = ".$id);
		$result = $statement->execute(array("file_name_original" => $name));
		if(!$result) {
			$error = true;
			$msg["ERROR"][] = "Neuer Dateiname konnte nicht gespeichert werden";
		}
    }

    /***********************************************************
    Rückgabe der Daten an JavaScript
    ***********************************************************/
    if(!$error) {
		echo JSON_ENCODE($data);
	} else {
		echo JSON_ENCODE($msg);
	}
} ?>