#!/bin/sh

set -e

#For Azure Web Apps
echo "Starting the health server"
mini_httpd


echo "Starting FAS Bot"
npm run bot