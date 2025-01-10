<?php
if(isset($_POST['save'])) {
	include("./db.php");
	$error = false;
	$msg = array();
    $file_path = "../upload/";

    $id = trim($_POST["id"]);
    if(isset($_FILES['file'])) {
		$file = basename($_FILES["file"]["name"]);
        $file_size = $_FILES["file"]["size"];
	} else {
		$file = "";
	}

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

    function random_file($end, $file_path) {
        $rnd = bin2hex(random_bytes(15));
        if(!is_file($file_path.$rnd.".".$end)) {
            return $rnd.".".$end;
        } else {
            return random_file($end);
        }
    };

    if(!$error) {
        $name = random_file($end, $file_path);
        if(!is_dir($file_path)) {
			if(!mkdir($file_path)) {
				$error = true;
				$msg["ERROR"][] = "Upload Verzeichnis konnte nicht angelegt werden";
			}
		}
    }

    if(!$error) {
        if(!move_uploaded_file($_FILES['file']['tmp_name'], $file_path.$name)) {
            $error = true;
            $msg["ERROR"][] = "Datei konnte nicht auf dem Server abgelegt werden";
        }
    }

    if(!$error) {
        $statement = $pdo->prepare("INSERT INTO files (folder_id, file_name_original, file_name_saved, file_path, file_type, file_size) VALUES (:folder_id, :file_name_original, :file_name_saved, :file_path, :file_type, :file_size)");
        $result = $statement->execute(array("folder_id" => $id, "file_name_original" => $_FILES['file']['tmp_name'], "file_name_saved" => $name, "file_path" => $file_path, "file_type" => $end, "file_size" => $file_size));
        if(!$result) {
			$error = true;
			$msg["ERROR"][] = "Die Datei konnte nicht gespeichert werden, bitte versuchen Sie es später erneut";
            unlink($file_path.$name);
		}
    }

    if(!$error) {
		echo JSON_ENCODE("TRUE");
	} else {
		echo JSON_ENCODE($msg);
	}
} ?>