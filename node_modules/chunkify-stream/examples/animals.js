const chunkify = require('..')

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
