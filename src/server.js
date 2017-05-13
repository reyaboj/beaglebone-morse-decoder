/**
   Morse code decoder application.

   Client-server architecture with the following responsibilities for each host:
     - Server
       Read signals from the motion sensor and decode signals as Morse code.
       Push message to Firebase as it gets decoded.

     - Client
       Thin client simply listens to Firebase for updates and displays the
       decoded message to the user.
 */
