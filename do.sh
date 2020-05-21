#!/bin/bash

echo "What environment do you want configure?"
echo "Type 1 for production 2 for development"
echo "If not pick an option the development environment will be a configuraded"
read environment

api_host="https://core.cancunhostingcenter.com/"
api_key="mvS80TiF0G9VStnUE0jYwUXrMIDYuTYkcBauSPxYEvC"
avatar_addr="https://core.cancunhostingcenter.com/img/avatars/"

db_db="dev_core"
db_user="usr_dev"
db_host="localhost"
db_pwd="7g)V=gzXbJ[ZTwzc"


if [ ! -z "$environment" ]; then
  if [ "$environment" -eq 1 ]; then
    db_db="itm_core"
    db_host="10.8.1.49"
    db_pwd="ooW&@RW8xBM8"
    db_user="usr_backoffice"

    api_host="https://core.tickettofun.travel/"
    api_key="TOi8ogmPpAVvYjNCF6PaBhuOxBtShvXK0a9tjsu72yn"
    avatar_addr="https://core.tickettofun.travel/img/avatars/"
  fi
fi

# Create .env file
mv core/app/config/env.php core/app/config/env.php.back

cat > core/app/config/env.php << EOM
<?php

    \$config["db_db"]       = "${db_db}";
    \$config["db_user"]     = "${db_user}";
    \$config["db_host"]     = "${db_host}";
    \$config["db_pwd"]      = "${db_pwd}";
    \$config["api_key"]     = "${api_key}";
    \$config["api_host"]    = "${api_host}";
    \$config["avatar_addr"] = "${avatar_addr}";

EOM

echo "Environment configuration complete!!!"
