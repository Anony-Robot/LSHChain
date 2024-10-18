# chunkify-stream

`chunkify-stream` is a duplex stream that combines incoming chunks into arrays of chunks.
Functions can be used to control how many chunks are combined and how they are combined. 

## Usage

The package exports a factory method that creates the duplex stream.
The following options are supported:

- `combine`: A callback function to control how the array of chunks is combined.
  The function will be called like this: `combine(chunks)`, where the `chunks` is an array of the chunks.
  By default a function is used that passes the input array through.

- `split`: A callback function to control when to split the chunks.
  The function will be called like this: `split(current, last, chunks)`.

  - `current` is the current chunk, which is not yet part of the chunks.
  - `last` is the last chunk, which is already part of the chunks.
  - `chunks` is the array of all collected chunks.

  If the function returns `true`, `chunks` will be emitted and `current` goes into the next collection of chunks.
  By default a function is used that always returns `false`, so all chunks are combined into one big array. 

## Example

```js
const chunkify = require('chunkify-stream')

const alphabeticWordList = chunkify({
  // combine all chunks to a comma separated string
  combine: chunks => chunks.join(', '),
  // split if the first character of the chunks is different
  split: (current, last) => current.slice(0, 1) !== last.slice(0, 1)
})

// write the output to the console
alphabeticWordList.on('data', chunk => console.log(chunk))

// feed the stream with alphabetic sorted animal names
alphabeticWordList.write('ant')
alphabeticWordList.write('ape')
alphabeticWordList.write('bat')
alphabeticWordList.write('bee')
alphabeticWordList.end()
```
