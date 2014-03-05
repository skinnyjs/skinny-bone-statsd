var StatsD = require('node-statsd').StatsD;
var Timer = require('./timer');
var thunkify = require('thunkify');

module.exports = function attachStatd(skinny, options) {
    "use strict";

    skinny.statsd = new StatsD(options);
    skinny.statsd.socket.close = thunkify(skinny.statsd.socket.close);

    skinny.statsd.createTimer = function createTimer(name, sampleRate) {
        return new Timer(skinny.statsd, name, sampleRate);
    };

    skinny.statsd.socket.on('error', function handleSocketError(error) {
        skinny.emit('warning', error);
    });

    skinny.on('beforeAction', function startTimer(name, params, actionSkinny) {
        actionSkinny.timer = skinny.statsd.createTimer('actions.' + name);
        actionSkinny.timer.start();

        actionSkinny.timerAutoStop = true;
    });

    skinny.on('afterAction', function stopTimer(name, params, actionSkinny) {
        if (actionSkinny.timerAutoStop) {
            actionSkinny.timer.stop();
        }
    });

    skinny.on('*shutdown', function *shutdown() {
        yield skinny.statsd.socket.close();
    });
};
