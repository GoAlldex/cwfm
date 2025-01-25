<?php
namespace Tests\Unit;
use PHPUnit\Framework\TestCase;

final class test_get_master_folder_contents extends TestCase {

    public function test_1() {
        // Test ID
        $_POST["get"] = 1;
        $_POST["id"] = "";
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/get_master_folder_contents.php');
        $data = JSON_DECODE($data);
        $this->assertIsObject($data);
    }

    public function test_2() {
        // Test ID String
        $_POST["get"] = 1;
        $_POST["id"] = "Test1";
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/get_master_folder_contents.php');
        $data = JSON_DECODE($data);
        $this->assertIsObject($data);
    }

    public function test_3() {
        // Test ID Int
        $_POST["get"] = 1;
        $_POST["id"] = "0";
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/get_master_folder_contents.php');
        $data = JSON_DECODE($data);
        $this->assertIsObject($data);
    }
    
} ?>