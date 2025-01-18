<?php
/***********************************************************
Umbennen eines Hauptverzeichnisses
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
        $msg["ERROR"][] = "Ungültiger Ordner (1)";
    } else if(!is_numeric($id)) {
        $error = true;
        $msg["ERROR"][] = "Ungültiger Ordner (2)";
    } else if(intval($id) == 0) {
        $error = true;
        $msg["ERROR"][] = "Ungültiger Ordner (3)";
    } else {
        $sql = "SELECT id, folder_name FROM folders WHERE id = ".$id;
        $result = $pdo->query($sql)->fetch();
        if(!$result) {
            $error = true;
            $msg["ERROR"][] = "Ungültiger Ordner (4)";
        } else {
            $data[] = $result["folder_name"];
        }
    }
    if(strlen($name) == 0) {
        $error = true;
        $msg["ERROR"][] = "Bitte geben Sie einen Ordnernamen ein";
    }

    /***********************************************************
    Wenn keine Übermittlungsfehler existieren speichere den
    neuen Verzeichnisnamen in der Datenbank
    ***********************************************************/
    if(!$error) {
        $statement = $pdo->prepare("UPDATE folders SET folder_name = :folder_name WHERE id = ".$id);
		$result = $statement->execute(array("folder_name" => $name));
		if(!$result) {
			$error = true;
			$msg["ERROR"][] = "Neuer Hauptordnername konnte nicht gespeichert werden";
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