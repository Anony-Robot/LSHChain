const { Transform } = require('readable-stream')

class Chunkify extends Transform {
  constructor ({ combine, split } = {}) {
    super({ objectMode: true })

    this.combine = combine || (chunks => chunks)
    this.split = split || (() => false)
    this.chunks = []
  }

  _transform (chunk, encoding, callback) {
    if (this.chunks.length > 0) {
      if (this.split(chunk, this.chunks[this.chunks.length - 1], this.chunks)) {
        this.push(this.combine(this.chunks))
        this.chunks = []
      }
    }

    this.chunks.push(chunk)

    callback()
  }

  _flush (callback) {
    if (this.chunks.length > 0) {
      this.push(this.combine(this.chunks))
    }

    callback()
  }

  static create ({ combine, split } = {}) {
    return new Chunkify({ combine, split })
  }
}

module.exports = Chunkify.create
