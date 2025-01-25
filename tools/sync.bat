cd /D %~dp0
cd ..
docker cp ./webcontent/site/. CWFM_server:/var/www/html
docker cp ./webcontent/tests/. CWFM_server:/tmp/vendor/bin/tests