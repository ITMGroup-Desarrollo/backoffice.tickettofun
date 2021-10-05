<?php
require 'vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setCellValue('A1', 'Hola Mundo !');
$writer = new Xlsx($spreadsheet);
$writer->save('hola_mundo.xlsx');
// Redireccionamos para que descargue el archivo generado
header("Location: hola_mundo.xlsx");
?>
