<?php
/***********************************************************
Datenbankverbindung
***********************************************************/
$pdo = new PDO('mysql:host=cwfm_db:3306;dbname=cwfm', 'root', 'P@ssw0rd');
$pdo->exec("SET NAMES utf8"); ?>