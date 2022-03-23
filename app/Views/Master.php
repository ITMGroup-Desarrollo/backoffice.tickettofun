<!DOCTYPE html>
<html lang="es">
  <head>
    <!-- HTML5 Shim and Respond.js IE10 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 10]>
    <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
    <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
    <title><?php echo $title; ?></title>
    <!-- Meta -->
    <?php echo $metas; ?>
    <!-- Favicon -->
    <?php echo $favicon; ?>
    <!-- Stylesheets -->
    <?php echo $css; ?>
  </head>
  <body id="<?php echo $id;?>">
    <?php echo $contents; ?>
    <?php echo $scripts; ?>
  </body>
</html>
