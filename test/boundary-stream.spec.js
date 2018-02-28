const net = require('net');
const boundary = require('../');
const assert = require('assert');

describe('Boundary Stream', function(){
    it('should pass 10MiB message over network', async function() {
        this.timeout(10 * 1000);

        const origin = Buffer.allocUnsafe(10 * 1024 * 1024);

        const result = await new Promise(function(resolve, reject){
            const server = net.createServer(function(conn){
                let reader = boundary.reader();
                let message;

                reader.on('data', (chunk) => {
                    message = chunk;
                });

                reader.on('end', () => {
                    server.close();
                    resolve(message);
                });

                conn.on('error', reject);
                conn.pipe(reader);
            });

            server.on('error', reject);

            server.listen(0);

            const conn = net.connect(server.address().port);

            conn.on('connect', () => {
                const writer = boundary.writer();

                writer.pipe(conn);
                writer.write(origin);
                writer.end();
            });

            conn.on('error', reject);
        });

        assert.ok(typeof result === 'object' && result instanceof Buffer, 'Result is Buffer');
        assert.ok(origin.length === result.length, `Message length ${result.length} should be ${origin.length}`);
        assert.ok(Buffer.compare(origin, result) === 0, `Message should be equal.`);
    });

    it('should pass 10 1MiB messages over network', async function() {
        this.timeout(10 * 1000);

        const origins = [];
        const count = 10;

        for (let i = 0; i < count; i++) {
            origins.push(Buffer.allocUnsafe(1024 * 1024));
        }

        const results = await new Promise(function(resolve, reject){
            const server = net.createServer(function(conn){
                let reader = boundary.reader();
                let messages = [];

                reader.on('data', (chunk) => {
                    messages.push(chunk);
                });

                reader.on('end', () => {
                    server.close();
                    resolve(messages);
                });

                conn.on('error', reject);
                conn.pipe(reader);
            });

            server.on('error', reject);
            server.listen(0);

            const conn = net.connect(server.address().port);

            conn.on('connect', () => {
                const writer = boundary.writer();

                writer.pipe(conn);
                for (let i = 0; i < count; i++) {
                    writer.write(origins[i]);
                }
                writer.end();
            });

            conn.on('error', reject);
        });

        assert.ok(results.length === count, `Results length is ${results.length}. Should be ${count}`);

        for (let i = 0; i < count; i++) {
            const origin = origins[i];
            const result = results[i];

            assert.ok(typeof result === 'object' && result instanceof Buffer, 'Result is Buffer');
            assert.ok(origin.length === result.length, `Message length ${result.length} should be ${origin.length}`);
            assert.ok(Buffer.compare(origin, result) === 0, `Message should be equal.`);
        }
    });

    it('should correct encode/decode message', async function() {
        const writer = boundary.writer();
        const reader = boundary.reader();

        const origins = [
            'Hello',
            'There',
            '1234567890',
        ];

        const result = await new Promise(resolve => {
            let messages = [];

            reader.on('data', (chunk) => {
                messages.push(chunk);
            });
            reader.on('end', () => resolve(messages));

            writer.pipe(reader);
            for (const o in origins) {
                writer.write(o);
            }
            writer.end();
        });

        assert.ok(
            result.length === origins.length,
            `Writen ${result.length} of ${origins.length} times`
        );

        for (const i of origins) {
            assert(result[i] === origins[i], `Message #${i} should be "${origins[i]}", got "${result[i]}".`);
        }
    });
});
