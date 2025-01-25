<?php
namespace Tests\Unit;
use PHPUnit\Framework\TestCase;

final class test_remove_master_folder extends TestCase {

    public function test_1() {
        // Test ID leer
        $_POST["remove"] = 1;
        $_POST["id"] = "";
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/remove_master_folder.php');
        $data = JSON_DECODE($data);
        $this->assertIsObject($data);
    }

    public function test_2() {
        // Test ID String
        $_POST["remove"] = 1;
        $_POST["id"] = "Test1";
        $_POST["name"] = "";
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/remove_master_folder.php');
        $data = JSON_DECODE($data);
        $this->assertIsObject($data);
    }

    public function test_3() {
        // Test ID und Name String
        $_POST["remove"] = 1;
        $_POST["id"] = "0";
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/remove_master_folder.php');
        $data = JSON_DECODE($data);
        $this->assertIsObject($data);
    }
    
} ?>