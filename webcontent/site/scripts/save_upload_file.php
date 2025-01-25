<?php
/***********************************************************
Speichern einer hochgeladenen Datei auf dem Server
***********************************************************/
if(isset($_POST['save'])) {
	if(!isset($_POST["test"])) {
	    include("./db.php");
    } else {
        include("../../../var/www/html/scripts/db.php");
    }
	$error = false;
	$msg = array();
    $file_path = "../upload/";

    /***********************************************************
    Übermittelte Parameter von JavaScript
    ***********************************************************/
    $id = trim($_POST["id"]);
    if(isset($_FILES['file'])) {
		$file = basename($_FILES["file"]["name"]);
        $file_size = $_FILES["file"]["size"];
	} else {
		$file = "";
	}

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
        }
    }
    if(strlen($file) == 0) {
		$error = true;
		$msg["ERROR"][] = "Bitte wählen Sie eine Datei zum hochladen aus";
	} else {
		$comp = explode(".", $file);
		$end = mb_strtolower(trim($comp[count($comp)-1]), "UTF-8");
		unset($comp[count($comp)-1]);
		$fname = "";
		foreach($comp as $index => $sname) {
			$fname .= $sname;
		}
		unset($comp, $index, $sname);
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
    Wenn keine Übermittlungsfehler existieren:
    - Erstelle Upload Verzeichnis falls noch nicht vorhanden
    ***********************************************************/
    if(!$error) {
        $name = random_file($end, $file_path);
        if(!is_dir($file_path)) {
			if(!mkdir($file_path)) {
				$error = true;
				$msg["ERROR"][] = "Upload Verzeichnis konnte nicht angelegt werden";
			}
		}
    }

    /***********************************************************
    Wenn keine Übermittlungsfehler existieren:
    - Speichere die Datei im Upload Verzeichnis
    ***********************************************************/
    if(!$error) {
        if(!move_uploaded_file($_FILES['file']['tmp_name'], $file_path.$name)) {
            $error = true;
            $msg["ERROR"][] = "Datei konnte nicht auf dem Server abgelegt werden";
        }
    }

    /***********************************************************
    Wenn keine Übermittlungsfehler existieren:
    - Speichere die Datei Eigenschaften in der Datenbank
    - Speichere die Datei Eigenschaften für die Rückgabe an
    JavaScript
    ***********************************************************/
    if(!$error) {
        $comp = explode(".", $_FILES['file']['name']);
        unset($comp[count($comp)-1]);
		$fname = "";
		foreach($comp as $index => $sname) {
			$fname .= $sname;
		}
        $statement = $pdo->prepare("INSERT INTO files (folder_id, file_name_original, file_name_saved, file_path, file_type, file_size) VALUES (:folder_id, :file_name_original, :file_name_saved, :file_path, :file_type, :file_size)");
        $result = $statement->execute(array("folder_id" => $id, "file_name_original" => $fname, "file_name_saved" => $name, "file_path" => $file_path, "file_type" => $end, "file_size" => $file_size));
        if(!$result) {
			$error = true;
			$msg["ERROR"][] = "Die Datei konnte nicht gespeichert werden, bitte versuchen Sie es später erneut";
            unlink($file_path.$name);
		} else {
            $n_id = $pdo->lastInsertId();
            $sql = "SELECT id, creation_date FROM files WHERE id = ".$n_id;
            $result = $pdo->query($sql)->fetch();
            $data["FID"] = $id;
            $data["ID"] = $n_id;
            $data["NAME_O"] = $fname;
            $data["NAME_S"] = $file_path.$name;
            $data["SIZE"] = $file_size;
            $data["TYPE"] = $end;
            $data["CREATION_DATE"] = date("d.m.Y H:i:s", strtotime($result["creation_date"]));
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