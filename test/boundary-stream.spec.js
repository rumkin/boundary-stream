const net = require('net');
const boundary = require('../');
const assert = require('assert');

describe('Boundary Stream', function(){
    it('should pass message over network', function(){
        return new Promise(function(resolve, reject){
            const server = net.createServer(function(conn){
                var reader = boundary.reader();

                reader.on('data', (chunk) => {
                    try {
                        assert.equal(chunk.toString(), 'Hello', 'Message is "Hello"');
                    } catch (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                });

                conn.on('error', reject);
                conn.on('end', () => server.close());

                conn.pipe(reader);
            });

            server.on('error', reject);

            server.listen(0);

            var conn = net.connect(server.address().port);

            conn.on('connect', () => {
                var writer = boundary.writer();

                writer.pipe(conn);
                writer.write('Hello');
                writer.end();
            });

            conn.on('error', reject);
        });
    });
});
