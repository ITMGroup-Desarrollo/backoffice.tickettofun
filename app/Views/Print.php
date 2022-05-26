<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?php echo $title; ?></title>
  </head>
  <body>
    <div class="content">
        <h1 align="center" style="font-family: sans-serif; font-size:12px; margin:0px; font-weight:bold;">
        Daily operation journal
        </h1>
        <p align="center" style="font-family: sans-serif; font-size:10px; margin:0 0 5px 0;">
            <?php echo $port_of; ?>
        </p>
        <?php echo $contents; ?>
    </div>
  </body>
</html>
