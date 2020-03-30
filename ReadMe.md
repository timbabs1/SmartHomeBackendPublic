#### README FILE FOR THE BACKEND SERVER - NODEJS AND KOA - TEAM HORSE

ws://localhost:8000/<RouteToWebsocket>

Host: localhost

Port: 8000

Current routes:
- /requestlight

- /requesttemp

- /requestalarm


## How to run:

clone the repository:

1. git clone https://github.coventry.ac.uk/302CEM-1920JANMAY/TeamHorse-302CEM-back-end.git

2. Change directory(cd) into the directory with the index.js file

3. npm install (if any modules are missing, use(remove quotes) "npm install missing_module_name" to install missing modules).
    - Make sure XAMPP or LAMPP is running on your local machine with MySQL running on port 3306 and default username and password.

4. node index.js to start the server.

5. Server will currently listen for and work with:
    - Target temperature, current temperature, day/night setting and room.
    - Light on or off information.
    - All data stored in mysql is pushed to the front end every 10 seconds.
    - Alarm data as per the backend data structure file in teams

To Note:

"logs" sent to the temp route will return all of the logs.
"close" message on both the lights and temperature routes will close the websocket connections until the page is reloaded.
