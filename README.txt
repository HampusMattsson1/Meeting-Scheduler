// Meeting Scheduler by Hampus Mattsson


// Step 1: Find your IP-Adress and desired Port

On windows you can open the CMD and type "ipconfig".
Here you find "IPv4 Adress" which you copy and then use as the IP for the application.
You can pick a port you want to use so long as it's not already in use, 3000 like I'm using should work I guess.


// Step 2: Register Microsoft Azure Application

Microsoft Azure - register an app: https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps

1. Click New registration at the top beside the +
2. Go to Branding (to the left of the screen)
3. Set the Home page-URL to "https://IP:PORT/scheme"
4. Go to Authentication (to the left of the screen)
5. Set the website Redirect-URL to the same as before: "https://IP:PORT/scheme"
6. Set the Outlogging-URL to the same: "https://IP:PORT/scheme"
7. Go to Certifices & secrets (to the left of the screen)
8. Create a new Client secret and copy it.


// Step 3: Setting up after registering an application on Microsoft Azure

1. Open config.js and paste the Client secret in the clientSecret-variable
2. Paste the redirect-URL into the redirectUrl-variable
3. Paste the Program-ID from the overview page of your appregistration on Azure into the clientID-variable
4. Go back here: https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview
5. Now look for Primary domain and copy what says below it (it should end with ".onmicrosoft.com")
6. Paste this into the variable at the top and REPLACE the already existing "hjmownit.onmicrosoft.com"

7. Open scheduler.js and set PORT and IP to whatever your ip and port is
2. Go in the folder "views", then "scheduler", then open scheme.ejs
   Here you have to scroll down to the bottom and change the URL in the scheduler.load(), and change the URL in the variable "dp"
   to what you set in your Azure registration, but it has to end with "/data" instead of "/scheme"
   It should look like this: "https://IP:PORT/data"


// Step 4: Using the Meeting Scheduler
1. Make sure you have Node JS installed and some kind of terminal like cygwin.
2. Make sure you have a database like mySQL installed.
3. Run the "database.sql" file in sql/schedule in your database client to set up the database.

4. Start the application through the terminal with possibly "node scheduler.js"


// Features
Login with your Microsoft account
Scheme to see your meetings
Schedule meetings
Schedule negotiable meetings
Invite people to your meetings
