<?php
/***********************************************************

***********************************************************/
if(isset($_POST['get'])) {
	include("./db.php");
    $data = array();
	$error = false;
	$msg = array();

    function get_storage($bytes) {
        $data = array();
        $symbols = array('B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB');
        $exp = floor(log($bytes)/log(1024));
        $data[] = $symbols[$exp];
        $data[] = $bytes/pow(1024, floor($exp));
        $data[] = $bytes;
        return $data;
    }

    /***********************************************************
    Wenn keine Übermittlungsfehler existieren:
    - Hole alle in der Datenbank aufgelisteten Eigenschaften
    ***********************************************************/
    if(!$error) {
        $data["FOLDER_COUNT"] = 0;
        $data["FILE_COUNT"] = 0;
        $data["IMG_COUNT"] = 0;
        $data["MUSIC_COUNT"] = 0;
        $data["VIDEO_COUNT"] = 0;
        $data["PDF_COUNT"] = 0;
        $data["OTHERS_COUNT"] = 0;
        $data["FILE_TYPES_COUNT"] = 0;
        $sql = "SELECT COUNT(id) AS folder_count FROM folders";
        $result = $pdo->query($sql)->fetch();
        if($result) {
            $data["FOLDER_COUNT"] = $result["folder_count"];
        }
        $sql = "SELECT COUNT(id) AS file_count FROM files";
        $result = $pdo->query($sql)->fetch();
        if($result) {
            $data["FILE_COUNT"] = $result["file_count"];
        }
        $sql = $pdo->prepare("SELECT file_type, COUNT(*) AS file_count FROM files GROUP BY file_type");
        $sql->execute();
        $result = $sql->fetchAll(PDO::FETCH_ASSOC);
        $i = 0;
        foreach($result as $index => $row) {
            if(mb_strtoupper($row["file_type"], "UTF-8") == "PNG" or mb_strtoupper($row["file_type"], "UTF-8") == "JPG" or mb_strtoupper($row["file_type"], "UTF-8") == "JPEG" or mb_strtoupper($row["file_type"], "UTF-8") == "GIF" or mb_strtoupper($row["file_type"], "UTF-8") == "WEBP") {
                $data["IMG_COUNT"] += $row["file_count"];
            } else if(mb_strtoupper($row["file_type"], "UTF-8") == "MP3" or mb_strtoupper($row["file_type"], "UTF-8") == "WAV" or mb_strtoupper($row["file_type"], "UTF-8") == "WMA" or mb_strtoupper($row["file_type"], "UTF-8") == "FLAC" or mb_strtoupper($row["file_type"], "UTF-8") == "OGG") {
                $data["MUSIC_COUNT"] += $row["file_count"];
            } else if(mb_strtoupper($row["file_type"], "UTF-8") == "MP4" or mb_strtoupper($row["file_type"], "UTF-8") == "WEBM" or mb_strtoupper($row["file_type"], "UTF-8") == "AVI" or mb_strtoupper($row["file_type"], "UTF-8") == "MKV" or mb_strtoupper($row["file_type"], "UTF-8") == "MPG") {
                $data["VIDEO_COUNT"] += $row["file_count"];
            } else if(mb_strtoupper($row["file_type"], "UTF-8") == "PDF") {
                $data["PDF_COUNT"] += $row["file_count"];
            } else {
                $data["OTHERS_COUNT"] += $row["file_count"];
            }
            $i++;
        }
        $data["FILE_TYPES_COUNT"] = $i;
        unset($i);
        $comp = get_storage(disk_total_space("/"));
        $data["STORAGE_TOTAL_TYPE"] = $comp[0];
        $data["STORAGE_TOTAL_VALUE"] = round($comp[1]*100)/100;
        $data["STORAGE_TOTAL_BYTES"] = $comp[2];
        unset($comp);
        $comp = get_storage(disk_free_space("/"));
        $data["STORAGE_TOTAL_FREE_TYPE"] = $comp[0];
        $data["STORAGE_TOTAL_FREE_VALUE"] = round($comp[1]*100)/100;
        $data["STORAGE_TOTAL_FREE_BYTES"] = $comp[2];
        unset($comp);
        $size = 0;
        $sql = $pdo->prepare("SELECT file_size FROM files");
        $sql->execute();
        $result = $sql->fetchAll(PDO::FETCH_ASSOC);
        foreach($result as $index => $row) {
            $size += $row["file_size"];
        }
        $comp = get_storage($size);
        $data["STORAGE_FILES_TYPE"] = $comp[0];
        $data["STORAGE_FILES_VALUE"] = round($comp[1]*100)/100;
        $data["STORAGE_FILES_BYTES"] = $comp[2];
        unset($comp);
        $comp = get_storage((disk_total_space("/")-disk_free_space("/")-$size));
        $data["STORAGE_SYSTEM_TYPE"] = $comp[0];
        $data["STORAGE_SYSTEM_VALUE"] = round($comp[1]*100)/100;
        $data["STORAGE_SYSTEM_BYTES"] = $comp[2];
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