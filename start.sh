#!/bin/bash
node /var/www/html/server.js &
exec apache2ctl -D FOREGROUND
