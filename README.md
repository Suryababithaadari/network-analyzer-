# network-traffic-anaylizer- prototype 

Setup & Usage Instructions (README.md)
1. Prerequisites:
 Node.js (version 18 or above recommended)
npm


3. Installation:
  npm install

4. Running the Backend:
   npm run server
   
5. Running the Frontend:
Open a new terminal window in the same folder and run:
npm run dev


Node.js (version 18 or above recommended)
npm
Backend will run at: http://localhost:3001
Frontend will run at: http://localhost:5173

6. Using the App:
   Open your browser at http://localhost:5173
Click Upload PCAP to upload network capture files.
View sessions and network statistics.
(Optional: You can reset the database manually if needed.)

7. Resetting the Database (if needed):
If you want to clear all files and sessions:

DELETE FROM sessions; DELETE FROM files;
Open your browser at http://localhost:5173
Click Upload PCAP to upload network capture files.
View sessions and network statistics.
(Optional: You can reset the database manually if needed.)
Open traffic_analyzer.db in DB Browser for SQLite.

Run:
Save changes.
