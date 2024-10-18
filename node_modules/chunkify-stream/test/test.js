const assert = require('assert')
const chunkify = require('..')
const getStream = require('get-stream')
const isStream = require('isstream')
const { describe, it } = require('mocha')

describe('chunkify-stream', () => {
  it('should be a function', () => {
    assert.strictEqual(typeof chunkify, 'function')
  })

  it('should return a duplex stream', () => {
    const stream = chunkify()

    assert(isStream.isReadable(stream))
    assert(isStream.isWritable(stream))
  })

  it('should emit no data if there are no input chunks', async () => {
    const stream = chunkify()
    stream.end()

    const result = await getStream.array(stream)

    assert.deepStrictEqual(result, [])
  })

  it('should combine all incoming chunks if no split function is given', async () => {
    const stream = chunkify()
    stream.write('a')
    stream.write('b')
    stream.end('c')

    const result = await getStream.array(stream)

    assert.deepStrictEqual(result, [['a', 'b', 'c']])
  })

  it('should call the split function after the first chunk for each chunk', async () => {
    let count = 0
    const stream = chunkify({
      split: () => {
        count++
      }
    })
    stream.write('a')
    stream.write('b')
    stream.end('c')

    await getStream.array(stream)

    assert.strictEqual(count, 2)
  })

  it('should call split with current, last and chunks argument', async () => {
    let args = null
    const stream = chunkify({
      split: (current, last, chunks) => {
        args = { current, last, chunks: chunks.slice(0) }

        return false
      }
    })
    stream.write('a')
    stream.write('b')
    stream.end('c')

    await getStream.array(stream)

    assert.deepStrictEqual(args, {
      current: 'c',
      last: 'b',
      chunks: ['a', 'b']
    })
  })

  it('should split chunks when split returns true', async () => {
    const stream = chunkify({
      split: (current, last) => {
        return current.slice(0, 1) !== last.slice(0, 1)
      }
    })
    stream.write('a0')
    stream.write('a1')
    stream.write('b0')
    stream.end('b1')

    const result = await getStream.array(stream)

    assert.deepStrictEqual(result, [['a0', 'a1'], ['b0', 'b1']])
  })

  it('should call combine to combine the chunks', async () => {
    let called = false
    const stream = chunkify({
      combine: () => {
        called = true
      },
      split: (current, last) => {
        return current.slice(0, 1) !== last.slice(0, 1)
      }
    })
    stream.write('a0')
    stream.write('a1')
    stream.write('b0')
    stream.end('b1')

    await getStream.array(stream)

    assert.strictEqual(called, true)
  })

  it('should use combine to create the result of the combined chunks', async () => {
    const stream = chunkify({
      combine: chunks => {
        return chunks.reverse().join('')
      },
      split: (current, last) => {
        return current.slice(0, 1) !== last.slice(0, 1)
      }
    })
    stream.write('a0')
    stream.write('a1')
    stream.write('b0')
    stream.end('b1')

    const result = await getStream.array(stream)

    assert.deepStrictEqual(result, ['a1a0', 'b1b0'])
  })
})
