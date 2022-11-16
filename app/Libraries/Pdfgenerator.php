<?php
namespace App\Libraries;

// Al requerir el autoload, cargamos todo lo necesario para trabajar
require_once APPPATH . "/ThirdParty/dompdf/autoload.inc.php";

use Dompdf\Dompdf;

class Pdfgenerator
{
    // por defecto, usaremos papel A4 en vertical, salvo que digamos otra cosa al momento de generar un PDF //landscape
    public function generate($html, $filename='', $paper = 'A4', $orientation = "portrait")
    {
        $dompdf = new DOMPDF();
        $dompdf->loadHtml($html);
        $dompdf->setPaper($paper, $orientation);
        $dompdf->render();
        $dompdf->stream($filename, array("Attachment" => false));
    }
}
?>
