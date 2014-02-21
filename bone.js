var Lynx = require('lynx');

module.exports = function(skinny, options) {
    "use strict";

    options.on_error = function(error) {
        skinny.emit('error', error);
    };

    skinny.statsd = new Lynx(options.host, options.port, options);

    skinny.on('beforeAction', function(name, params, actionSkinny) {
        var timer = skinny.statsd.createTimer('actions.' + name);
        timer.autoStop = true;

        actionSkinny.timer = timer;
    });

    skinny.on('afterAction', function(name, params, actionSkinny) {
        if (actionSkinny.timer.autoStop) {
            actionSkinny.timer.stop();
        }
    });

    skinny.on('shutdown', function *() {
        skinny.statsd.close();
    });
};