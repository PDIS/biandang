#!/bin/bash

# When you change this file, you must take manual action. Read this doc:
# - https://docs.sandstorm.io/en/latest/vagrant-spk/customizing/#setupsh

set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

apt install -y g++
wget https://deb.nodesource.com/setup_8.x
chmod 766 setup_8.x
bash setup_8.x
apt install -y nodejs
rm -f /usr/bin/node
ln -s `which nodejs` /usr/bin/node
cd /opt/app
npm install npm@latest -g
npm i
