<?php
namespace Tests\Unit;
use PHPUnit\Framework\TestCase;

final class test_get_master_folders extends TestCase {

    public function test_1() {
        // Test ID und Name leer
        $_POST["get"] = 1;
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/get_master_folders.php');
        $data = JSON_DECODE($data);
        $this->assertIsArray($data);
    }
    
} ?>