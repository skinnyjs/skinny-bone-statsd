function Timer(statd, name) {
    this.statd = statd;
    this.name = name;
    this.autoStop = true;
    this.startTime = null;
    this.elapsedTime = null;
};

Timer.prototype.start = function() {
    if (this.startTime) {
        throw new Error('Timer already started');
    }

    this.startTime = process.hrtime();
};

Timer.prototype.stop = function() {
    if (!this.startTime) {
        throw new Error('Timer not started');
    }

    var stop = process.hrtime(this.startTime);

    this.elapsedTime = (stop[0] *1e9 + stop[1]) / 1e6;

    this.statd.timing(this.name, this.elapsedTime.toFixed(3));
};

module.exports = Timer;
