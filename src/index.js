exports.Reader = require('./reader.js');
exports.Writer = require('./writer.js');

exports.reader = function() {
    return new this.Reader();
};

exports.writer = function() {
    return new this.Writer();
};
