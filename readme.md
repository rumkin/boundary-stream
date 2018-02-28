# Boundary Stream

[![npm](https://img.shields.io/npm/v/boundary-stream.svg?style=flat-square)](https://npmjs.com/packages/boundary-stream)

Boundary stream converts passed data into length prefixed buffers.
It helps to send data via tcp connection. Length prefixed protocols are more speed
efficient then delimiter based (like HTTP).

Boundary stream can handle any size of message. The only limit is RAM size.
It supports String or Buffer transfer and fits for JSON, MsgPack, CBOR and BORN
encoders.

## Install

Install via npm:

```shell
npm i boundary-stream
```

## Usage

Example of raw Buffer message transfer.

### Client

```javascript
const net = require('net');
const boundary = require('boundary-stream');

const conn = net.connect(9090);

conn.on('connect', () => {
    const writer = boundary.writer();

    writer.pipe(conn);

    writer.write(Buffer.alloc(10 * 1024 * 1024)); // Send 10 MiB buffer
    writer.end();
});

// ...
```

### Server

```javascript
const net = require('net');
const boundary = require('boundary-stream');

const server = net.createServer(function(conn){
    let reader = boundary.reader();

    reader.on('data', (message) => {
        console.log(message.length); // -> 10485760
    });

    conn.pipe(reader);
});

// ...
```

## API

### writer() -> Writer{}

Create Writer instance.

### reader() -> Reader{}

Create Reader instance.

### Writer()

Writer constructor

### Writer().write(String|Buffer)

Write message to stream.

### Reader()

Reader constructor

## License

MIT
