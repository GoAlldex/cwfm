<?php
/***********************************************************
Kopieren von Dateien in ein Hauptverzeichnis
***********************************************************/
if(isset($_POST['save'])) {
	if(!isset($_POST["test"])) {
	    include("./db.php");
    } else {
        include("../../../var/www/html/scripts/db.php");
    }
    $data = array();
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
    Zufälliger Dateiname:
    - Zufälligen Dateinamen generieren
    - Prüfen ob dieser Dateiname schon existiert
    - Wenn Dateiname schon vorhanden rufe dich selbst nochmal auf
    ***********************************************************/
    if(!function_exists("random_file")) {
        function random_file($end, $file_path) {
            $rnd = bin2hex(random_bytes(15));
            if(!is_file($file_path.$rnd.".".$end)) {
                return $rnd.".".$end;
            } else {
                return random_file($end);
            }
        };
    }

    /***********************************************************
    
    ***********************************************************/
    if(!$error) {
        for($i = 0; $i < count($ids); $i++) {
            $sql = "SELECT id, file_name_original, file_name_saved, file_path, file_type, file_size FROM files WHERE id = ".$ids[$i];
            $result = $pdo->query($sql)->fetch();
            if(!$result) {
                $error = true;
                $msg["ERROR"][] = "Zu kopierende Datei nicht gefunden!";
            } else {
                $name_s = random_file($result["file_type"], $result["file_path"]);
                if(!copy($result["file_path"].$result["file_name_saved"], $result["file_path"].$name_s)) {
                    $error = true;
                    $msg["ERROR"][] = "Datei konnte nicht kopiert werden!";
                }
                if(!$error) {
                    $statement = $pdo->prepare("INSERT INTO files (folder_id, file_name_original, file_name_saved, file_path, file_type, file_size) VALUES (:folder_id, :file_name_original, :file_name_saved, :file_path, :file_type, :file_size)");
                    $result = $statement->execute(array("folder_id" => $folder, "file_name_original" => $result["file_name_original"], "file_name_saved" => $name_s, "file_path" => $result["file_path"], "file_type" => $result["file_type"], "file_size" => $result["file_size"]));
                    if(!$result) {
                        $error = true;
                        $msg["ERROR"][] = "Datei konnte nicht gespeichert werden!";
                    } else {
                        $n_id = $pdo->lastInsertId();
                        $sql = "SELECT id, folder_id, file_name_original, file_name_saved, file_path, file_type, file_size, creation_date FROM files WHERE id = ".$n_id;
                        $result = $pdo->query($sql)->fetch();
                        $data[$i]["ID"] = $result["id"];
                        $data[$i]["FID"] = $result["folder_id"];
                        $data[$i]["NAME_O"] = $result["file_name_original"];
                        $data[$i]["NAME_S"] = $result["file_path"].$result["file_name_saved"];
                        $data[$i]["SIZE"] = $result["file_size"];
                        $data[$i]["TYPE"] = $result["file_type"];
                        $data[$i]["CREATION_DATE"] = date("d.m.Y H:i:s", strtotime($result["creation_date"]));
                    }
                }
            }
        }
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