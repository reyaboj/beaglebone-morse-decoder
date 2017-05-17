/*Client script*/

var config = {
    apiKey: 'AIzaSyArkiQzS0XmfdBc37B1kXPRqtDuzxXzDL0',
    databaseURL: 'morsedecoder-fc3e1.firebaseio.com'
};

firebase.initializeApp(config);

const rootRef = firebase.database().ref();

const signalRef = rootRef.child('signal');
const motionRef = rootRef.child('motion');
const messageRef = rootRef.child('message');

const state = {
    signals: [],
    motions: [],
    message: []
};

signalRef.on('child_added', function (snap) {
    state.signals.push(snap.val());
    $('#signal').html(state.signals.join(''));
});


motionRef.on('child_added', function (snap) {
    state.motions.push(snap.val());
    $('#motion').html(state.motions.join(''));
});

messageRef.on('child_added', function (snap) {
    state.message.push(snap.val());
    $('#message').html(state.message.join(''));
});
