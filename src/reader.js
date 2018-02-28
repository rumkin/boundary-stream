const Transfrom = require('stream').Transform;

module.exports = class ChunkStream extends Transfrom {
    constructor(options = {}) {
        super(options);

        this.buffers = [];
        this.bufferedLength = 0;

        this.chunkLength = -1;
    }

    _transform(chunk, encoding, done) {
        const totalLength = this.bufferedLength + chunk.length;

        let data = chunk;
        let offset = 0;

        if (this.chunkLength > 0) {
            if (totalLength < this.chunkLength) {
                this.buffers = [...this.buffers, chunk];
                this.bufferedLength = totalLength;
                done();
                return;
            }

            // Has something to output
            data = Buffer.concat([...this.buffers, chunk]);
            this.buffers = null;
            this.bufferedLength = 0;

            offset = this.chunkLength;
            this.chunkLength = -1;

            this.push(data.slice(0, offset));
        }

        // Cut chunks untill them end
        while (data.length > offset) {
            const chunkLength = data.readUInt32BE(offset);

            if (chunkLength <= data.length - offset) {
                this.push(data.slice(offset + 4, offset + 4 + chunkLength));
                offset += 4 + chunkLength;
            }
            else {
                this.chunkLength = chunkLength;
                this.buffers = [data.slice(offset + 4)];
                this.bufferedLength = data.length - (offset + 4);
                break;
            }
        }

        done();
    }
};
