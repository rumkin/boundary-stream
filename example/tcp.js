const net = require('net');
const bstream = require('../');
const inspect = require('util').inspect;

// Create server
const server = net.createServer(function(conn){
    var reader = new bstream.Reader();

    reader.on('data', (chunk) => {
        console.log('Got', inspect(
            JSON.parse(chunk.toString()), {colors: true})
        );
    });

    conn.pipe(reader);

    conn.on('end', () => server.close());
});

server.on('error', error => {
    console.error(error);
    process.exit(1);
});

server.listen(0);

// Connect to server and transfer JSON encoded messages
const conn = net.connect(server.address().port);

conn.on('connect', () => {
    var writer = new bstream.Writer();

    writer.pipe(conn);
    writer.write(JSON.stringify('Hello World'));
    writer.write([
        JSON.stringify({array: [1,2,3]}),
        JSON.stringify(null),
        JSON.stringify([1, 2, true]),
    ]);
    writer.end();
});

conn.on('error', error => {
    console.error(error);
    process.exit(1);
});
