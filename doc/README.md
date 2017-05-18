Morse Code Decoder
===================
This project is an implementation of a Morse code decoder running on the Beaglebone Black. It uses JohnnyFive to read signals from a passive-infrared motion sensor (PIR sensor) and decode them using the Morse code encoding. The architecture used is a simple client-server setup where thin clients receive the decoded message from the server. Google's Firebase is used to allow clients to be notified of the message as it is processed by the server.

Setup
------
Connect the PIR motion sensor to array P8, pin 8. Connect the beaglebone and boot it up. Once the board is running, clone this repository to the board and run the following command:

```sh
$ npm install --production
```

This should install the dependencies for the project. Make sure the Beaglebone Black is connected to the internet.

Usage
------

There are two servers:
 - `mock_server.js`
 - `server.js`
 
The first is to test the decoder without a running Beaglebone black + Motion sensor. To run the mock server, run this:

```sh
$ node src/mock_server.js 'MY MESSAGE IS HERE'
```

NOTE: The firebase key is not in version control, so even if you follow the instructions above, this will not run.

Both server modules look for the `morsedecoder-key.json`.

You should be seeing some output on the console. To open the client, visit [morsedecoder-fc3e1.firebaseapp.com](https://morsedecoder-fc3e1.firebaseapp.com).

Testing
--------

To run the test suites, run this command:

```sh
$ npm test
```

This project uses Mocha.js to test the modules.
