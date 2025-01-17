<?php
if(isset($_POST['get'])) {
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
        }
    }

    if(!$error) {
        $sql = $pdo->prepare("SELECT id, folder_id, file_name_original, file_name_saved, file_path, file_type, file_size, creation_date FROM files ORDER BY file_name_original ASC");
        $sql->execute();
        $result = $sql->fetchAll(PDO::FETCH_ASSOC);
        $i = 0;
        foreach($result as $index => $row) {
            $data[$i]["ID"] = $row["id"];
            $data[$i]["FID"] = $row["folder_id"];
            $data[$i]["NAME_O"] = $row["file_name_original"];
            $data[$i]["NAME_S"] = $row["file_path"].$row["file_name_saved"];
            $data[$i]["SIZE"] = $row["file_size"];
            $data[$i]["TYPE"] = $row["file_type"];
            $data[$i]["CREATION_DATE"] = date("d.m.Y H:i:s", strtotime($row["creation_date"]));
            $i++;
        }
        unset($i);
    }

    if(!$error) {
		echo JSON_ENCODE($data);
	} else {
		echo JSON_ENCODE($msg);
	}
} ?>