// Meeting Scheduler by Hampus Mattsson


// ONE MAJOR ISSUE
Since it uses Microsoft login and therefore uses a registered Microsoft Azure application which I have created,
I have to change the IP-adress there to your desired one which means you can't really use it out of the box
without my help or potetially creating your own Azure application and setting it up after that.


// Setting up the Meeting Scheduler
1. Set PORT and IP in index.js to whatever your port is
2. Go in the folder views, then scheduler, then open scheme.ejs
   Here you have to scroll down to the bottom and change the variable "dp"
   to whatever you set in your index.js
   Like this: var dp = new dataProcessor("https://IP:PORT/data");

3. config.js - Change stuff according to possbily your own Microsoft Azure app-registration or if you want me to change the settings in mine. 


// Using the Meeting Scheduler
Start the application with a terminal like cygwin and then something along the lines of "node scheduler.js"
