<?php
if(isset($_POST['remove'])) {
	include("./db.php");
    $data = array();
	$error = false;
	$msg = array();

    $id = trim($_POST["id"]);

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

    if(!$error) {
        $sql = $pdo->prepare("SELECT id, folder_id, file_name_original, file_name_saved, file_path, file_type FROM files WHERE folder_id = ".$id);
        $sql->execute();
        $result = $sql->fetchAll(PDO::FETCH_ASSOC);
        $i = 0;
        $s = 0;
        foreach($result as $index => $row) {
            if(is_dir($row["file_path"]."/")) {
                if(!unlink($row["file_path"].$row["file_name_saved"])) {
                    $s++;
                    $error = true;
                    $msg["ERROR"][] = "Datei ".$row["file_name_original"]." konnte nicht entfernt werden";
                } else {
                    $file = $pdo->prepare("DELETE FROM files WHERE id = ".$row["id"]);
                    $file->execute();
                    if(!$file) {
                        $s++;
                        $error = true;
                        $msg["ERROR"][] = "Datenbankeintrag für die Datei ".$row["file_name_original"]." konnte nicht entfernt werden";
                    }
                }
            } else {
                $s++;
                $error = true;
                $msg["ERROR"][] = "Ungültiges Hauptverzeichnis ".$row["file_path"]." für die Datei ".$row["file_name_original"];
            }
            $i++;
        }
        $data[] = ($i-$s);
        unset($i, $s);
    }

    if(!$error) {
        $folder = $pdo->prepare("DELETE FROM folders WHERE id = ".$id);
        $folder->execute();
        if(!$folder) {
            $error = true;
            $msg["ERROR"][] = "Hauptverzeichnis konnte nicht entfernt werden";
        }
    }

    if(!$error) {
		echo JSON_ENCODE($data);
	} else {
		echo JSON_ENCODE($msg);
	}
} ?>