<?php
namespace Tests\Unit;
use PHPUnit\Framework\TestCase;

final class test_get_dashboard extends TestCase {

    public function test_1() {
        // Test Rückgabe
        $_POST["get"] = 1;
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/get_dashboard.php');
        $data = JSON_DECODE($data);
        $this->assertIsObject($data);
    }
    
} ?>