# CWFM | Container Web File-Manager
Diese Webanwendung dient als Benutzerschnittstelle für einen Webspeicher, ähnlich zu anderen Webspeichersystemen.
Mit der unten stehenden Beschreibung wird die Webanwendung als Docker-Container installiert, eine Nutzung ohne
Docker ist auch möglich (siehe Ohne Docker).

# Docker

## Voraussetzungen
-   Docker Desktop Version 4.37.0 (https://www.docker.com/products/docker-desktop/)
-   System Voraussetzungen (Docker Desktop) (https://docs.docker.com/desktop/setup/install/windows-install/)

## Installation (Windows)
-   git clone git@github.com:GoAlldex/cwfm.git
-   Powershell: docker-compose --profile test up -d (mit FTP-Server)
-   Powershell: docker-compose --profile prod up -d (ohne FTP-Server)

## Container Pods
-   MySQL-DB
-   OpenSSH-Server
-   Apache mit PHP 8.2

## Zusätzliche Skripte (Windows)
-   tools/sync.bat, kopiert die Dateien vom Ordner webcontent/site auf den Webserver-Ordner /var/www/html

## Initialisierungsdateien
-   webcontent/php-ini.ini, xdebug und upload/post limits
-   database/sql-init.sql, Anlegen der Datenbanktabellen (einmalig)

# Ohne Docker
-   phpMyAdmin installieren
-   Apache installieren
-   PHP installieren
-   phpMyAdmin: database/sql-init.sql importieren
-   Webserver php/php.ini: upload_max_filesize und post_max_size anpassen (siehe webcontent/php-ini.ini)
-   Webserver: Den Ordner site im Ordner webcontent in den Ordner vom Webserver (htdocs/) kopieren
-   Datenbankverbindung im Skript webcontent/site/scripts/db.php ändern

# Anwendungs Details
-   Dashboard: Balkendiagramm (Dateistatistik)
-   Dashboard: Kreisdiagramm (Speichernutzung)
-   Anlegen/Umbenennen/Entfernen von Verzeichnissen
-   Multiple Dateien hochladen mit Drag & Drop (keine Ordner)
-   Während des Uploads können die Verzeichnisse gewechselt werden
-   Es können parallel auch zu einem anderen Verzeichnis Dateien in die Upload-Warteschlange hinzugefügt werden
-   Darstellung der vorhandenen Dateien als Kacheln
-   Dateivorschau/-anzeige für hochgeladene Bilder/Musik/Videos/PDFs
-   Datei Kontextmenü umbenennen/herunterladen/entfernen
-   STRG + Linksklick Datei markieren
-   STRG + A alle Dateien im Verzeichnis markieren
-   STRG + D alle markierten Dateien herunterladen
-   STRG + C alle markierten Dateien kopieren (anwendungsintern)
-   STRG + V alle zuvor mit STRG + C kopierten Dateien hinzufügen (anwendungsintern)
-   STRG + E entferne alle markierten Dateien
-   Drag & Drop von markierten Dateien in ein anderes Verzeichnis (anwendungsintern, verschieben)

## Hinweise für die Nutzung
-   Es wird nicht verhindert, dass Skripte wie z.B. PHP hochgeladen werden, entsprechend können diese aufgerufen werden
-   docker-compose.yml und webcontent/site/scripts/db.php Passwörter für die Datenbank ändern :)
-   Die Dateinamen wurden mit bin2hex(random_bytes(15)) generiert. Um den Dateitoken zu vergrößern, muss dies im Skript webcontent/site/scripts/save_upload_files.php in der Funktion random_file() geändert werden

## Updates
Die Webanwendung wurde zu Lernzwecken entwickelt und wird nicht länger mit Erweiterungen versorgt.