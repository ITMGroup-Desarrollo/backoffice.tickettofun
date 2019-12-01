<?php
require_once("config.php");

$content = file_get_contents("php://input");
$json    = json_decode($content, true);
$file    = fopen(LOGFILE, "a");
$time    = time();
$token   = false;
$response = "";

// retrieve the token
if (isset($_GET["token"])) {
    $token = $_GET["token"];
}

// log the time
date_default_timezone_set("America/Cancun");
fputs($file, date("d-m-Y (H:i:s)", $time) . "\n");

$response = "<p>" . date("d-m-Y (H:i:s)", $time) . "</p>";

// function to forbid access
function forbid($file, $reason) {
    // explain why
    if ($reason) fputs($file, "=== ERROR: " . $reason . " ===\n");

    fputs($file, "*** ACCESS DENIED ***" . "\n\n\n");
    fclose($file);

    // forbid
    header("HTTP/1.0 403 Forbidden");
    exit;
}

// function to return OK
function ok() {
    ob_start();
    header("HTTP/1.1 200 OK");
    header("Connection: close");
    header("Content-Length: " . ob_get_length());
    ob_end_flush();
    ob_flush();
    flush();
}

// Check for a $_GET token
if (!empty(TOKEN) && isset($_GET["token"]) && $token !== TOKEN) {
    $response .= "<p>=== ERROR: \$_GET[\"token\"] does not match TOKEN ===</p>";

    forbid($file, "\$_GET[\"token\"] does not match TOKEN");
// if none of the above match, but a token exists, exit
} elseif (!isset($_GET["token"])) {
    $response .= "<p>=== ERROR: No token detected ===</p>";

    forbid($file, "No token detected");
} else {
    fputs($file, $content . PHP_EOL);

    // ensure directory is a repository
    if (file_exists(DIR . ".git") && is_dir(DIR)) {
        try {
            $response .= "<p>*** AUTO PULL INITIATED ***</p><br/>";
            fputs($file, "*** AUTO PULL INITIATED ***" . "\n");
            chdir(DIR);

            // The commands
            $commands = array(
                'pull 2>&1',
                'status 2>&1'
            );

            // Run the commands for output
            $output = '';
            foreach($commands AS $command){
                // Run it
                $tmp = shell_exec(GIT . $command);

                // Write log
                fputs($file, $tmp . "\n");
                ok();

                // Output
                $output .= "<span style=\"color: #6BE234;\">\$</span> <span style=\"color: #729FCF;\">git {$command}\n</span>";
                $output .= htmlentities(trim($tmp)) . "\n";
            }

            $response .= $output;
            $response .= "<p>*** AUTO PULL COMPLETE ***</p><br/>";
            fputs($file, "*** AUTO PULL COMPLETE ***" . "\n");
        } catch (Exception $e) {
            fputs($file, $e . "\n");
        }
    } else {
        $response .= "<p>=== ERROR: DIR is not a repository ===</p><br/>";
        fputs($file, "=== ERROR: DIR is not a repository ===" . "\n");
    }
}

fputs($file, "\n\n" . PHP_EOL);
fclose($file);
?>
<!DOCTYPE HTML>
<html lang="en-US">
<head>
    <meta charset="UTF-8">
    <title>GIT Deployment Script</title>
</head>
    <body style="background-color: #000000; color: #FFFFFF; font-weight: bold; padding: 0 10px;">
        <pre>
             .  ____  .    ____________________________
             |/      \|   |                            |
            [|  |  |  |]  |  Git Deployment Script v1  |
             |___^^___|  /     ITM Developers <?php echo date('Y'); ?>     |
                          |____________________________|
            <?php echo $response; ?>
        </pre>
    </body>
</html>
