const Transform = require('stream').Transform;

module.exports = class Chunked extends Transform {
    constructor(options = {}) {
        options.objectMode = true;
        super(options);

        this.timer = null;
        this.buffer = [];
    }

    _transform(data, encoding, done) {
        var chunks;
        if (! Array.isArray(data)) {
            chunks = [data];
        } else {
            chunks = data;
        }

        var bufferLength = chunks.reduce((result, chunk) => {
            return result + Buffer.byteLength(chunk);
        }, 0);

        bufferLength += 4 * chunks.length;
        var buffer = Buffer.allocUnsafe(bufferLength);
        var offset = 0;

        chunks.forEach(chunk => {
            var chunkLength = Buffer.byteLength(chunk);
            buffer.writeUInt32BE(chunkLength, offset);
            if (chunk instanceof Buffer) {
                chunk.copy(buffer, offset + 4);
            } else {
                buffer.write(chunk, offset + 4);
            }

            offset += 4 + chunkLength;
        });

        setImmediate(() => {
            this.push(buffer);
            done();
        });
    }
};
