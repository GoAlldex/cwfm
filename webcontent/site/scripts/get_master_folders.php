<?php
/***********************************************************
Ermitteln aller gespeicherten Hauptverzeichnisse
***********************************************************/
if(isset($_POST['get'])) {
	if(!isset($_POST["test"])) {
	    include("./db.php");
    } else {
        include("../../../var/www/html/scripts/db.php");
    }
    $data = array();
	$error = false;
	$msg = array();

    /***********************************************************
    Wenn keine Übermittlungsfehler existieren:
    - Hole alle Hauptverzeichnisse
    ***********************************************************/
    if(!$error) {
        $sql = $pdo->prepare("SELECT id, folder_name, creation_date FROM folders ORDER BY folder_name ASC");
        $sql->execute();
        $result = $sql->fetchAll(PDO::FETCH_ASSOC);
        $i = 0;
        foreach($result as $index => $row) {
            $data[$i][] = $row["id"];
            $data[$i][] = $row["folder_name"];
            $data[$i][] = $row["creation_date"];
            $i++;
        }
        unset($i);
    }

    /***********************************************************
    Rückgabe der Daten an JavaScript
    ***********************************************************/
    if(!$error) {
        if(!isset($_POST["test"])) {
		    echo JSON_ENCODE($data);
        } else {
            $data = JSON_ENCODE($data);
        }
	} else {
        if(!isset($_POST["test"])) {
		    echo JSON_ENCODE($msg);
        } else {
            $data = JSON_ENCODE($msg);
        }
	}
} ?>