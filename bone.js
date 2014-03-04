var StatsD = require('node-statsd').StatsD;
var Timer = require('./timer');
var thunkify = require('thunkify');

module.exports = function(skinny, options) {
    "use strict";

    skinny.statsd = new StatsD(options);
    skinny.statsd.socket.close = thunkify(skinny.statsd.socket.close);

    skinny.statsd.socket.on('error', function(error) {
        skinny.emit('warning', error);
    });

    skinny.on('beforeAction', function startTimer(name, params, actionSkinny) {
        actionSkinny.timer = new Timer(skinny.statsd, 'actions.' + name);
        actionSkinny.timer.start();
    });

    skinny.on('afterAction', function stopTimer(name, params, actionSkinny) {
        if (actionSkinny.timer.autoStop) {
            actionSkinny.timer.stop();
        }
    });

    skinny.on('*shutdown', function *shutdown() {
        yield skinny.statsd.socket.close();
    });
};
