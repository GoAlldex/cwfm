<?php
namespace Tests\Unit;
use PHPUnit\Framework\TestCase;

final class test_edit_master_folder extends TestCase {

    public function test_1() {
        // Test ID und Name leer
        $_POST["save"] = 1;
        $_POST["id"] = "";
        $_POST["name"] = "";
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/edit_master_folder.php');
        $data = JSON_DECODE($data);
        $this->assertIsObject($data);
    }

    public function test_2() {
        // Test ID String und Name leer
        $_POST["save"] = 1;
        $_POST["id"] = "Test1";
        $_POST["name"] = "";
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/edit_master_folder.php');
        $data = JSON_DECODE($data);
        $this->assertIsObject($data);
    }

    public function test_3() {
        // Test ID und Name String
        $_POST["save"] = 1;
        $_POST["id"] = "Test1";
        $_POST["name"] = "Test2";
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/edit_master_folder.php');
        $data = JSON_DECODE($data);
        $this->assertIsObject($data);
    }

    public function test_4() {
        // Test ID leer und Name String
        $_POST["save"] = 1;
        $_POST["id"] = "";
        $_POST["name"] = "Test2";
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/edit_master_folder.php');
        $data = JSON_DECODE($data);
        $this->assertIsObject($data);
    }

    public function test_5() {
        // Test ID Zahl und Name String
        $_POST["save"] = 1;
        $_POST["id"] = "0";
        $_POST["name"] = "Test2";
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/edit_master_folder.php');
        $data = JSON_DECODE($data);
        $this->assertIsObject($data);
    }
    
} ?>