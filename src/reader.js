const Transfrom = require('stream').Transform;

module.exports = class ChunkStream extends Transfrom {
    constructor(options = {}) {
        super(options);
        // this.buffer = new BUffer();
        this.chunkLength = -1;
    }

    _transform(chunk, encoding, done) {
        var totalLength = this.buffer
            ? this.buffer.length + chunk.length
            : chunk.length;

        if (this.chunkLength > 0 && totalLength < this.chunkLength) {
            this.buffer = Buffer.concat([this.buffer, chunk]);
            done();
        }

        var offset = 0;

        if (this.chunkLength > 0) {
            // Has something to output
            chunk = Buffer.concat([this.buffer, chunk]);
            this.push(chunk.slice(0, this.chunkLength));
            this.buffer = null;
            offset = this.chunkLength;
            this.chunkLength = -1;
        }

        // Cut chunks untill them end
        while (chunk.length > offset) {
            let chunkSize = chunk.readUInt32BE(offset);
            if (chunkSize < chunk.length - offset) {
                this.push(chunk.slice(offset + 4, offset + 4 + chunkSize));
                offset += 4 + chunkSize;
            } else {
                this.chunkSize = chunkSize;
                this.buffer = chunk.slice(offset + 4);
                break;
            }
        }

        done();
    }
};
