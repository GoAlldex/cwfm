<?php
namespace Tests\Unit;
use PHPUnit\Framework\TestCase;

final class test_save_master_folder extends TestCase {

    public function test_1() {
        // Name leer
        $_POST["save"] = 1;
        $_POST["name"] = "";
        $_POST["test"] = 1;
        include('../../../var/www/html/scripts/save_master_folder.php');
        $data = JSON_DECODE($data);
        $this->assertIsObject($data);
    }
    
} ?>