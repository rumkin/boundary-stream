# Boundary Stream

Boundary stream converts passed data into length prefixed buffers to send it
over network. It's useful for messaging over tcp connection. It's more speed
efficient then delimiter based encoding.


## Installation

Installation via npm:

```shell
npm i boundary-stream
```

## Usage

Example of JSON encoded messages. It's possible to use MsgPack, CBOR or BORN
encoders too.

```javascript
const bstream = require('boundary-stream');

const writer = bstream.writer(); // or new bstream.Writer();
const reader = bstream.reader(); // or new bstream.Reader();

writer.pipe(reader);
reader.on('data', chunk => console.log(JSON.decode(chunk.toString())));

writer.write(JSON.encode({message: 'Hello'}));
```


## API

### Writer()

Writer constructor

### Reader()

Reader constructor

### writer() -> Writer{}

Create Writer instance.

### reader() -> Reader{}

Create Reader instance.


## License

MIT
