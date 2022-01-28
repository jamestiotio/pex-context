const createContext = require('../')
const ctx = createContext({ width: 10, height: 10 })

document.body.appendChild(
  document.createTextNode(' See dev console for test results')
)

const v0 = ctx.vertexBuffer([[0, 1, 2], [3, 4, 5]])
console.assert(v0.length === 6, 'Invalid buffer length')
console.assert(v0.type === ctx.DataType.Float32, 'Invalid data type')

const v1 = ctx.vertexBuffer([0, 1, 2, 3, 4, 5])
console.assert(v1.length === 6, 'Invalid buffer length')
console.assert(v1.type === ctx.DataType.Float32, 'Invalid data type')

const i0 = ctx.indexBuffer([[0, 1, 2], [3, 4, 5]])
console.assert(i0.length === 6, 'Invalid buffer length')
console.assert(i0.type === ctx.DataType.Uint16, 'Invalid data type')

const i1 = ctx.indexBuffer([0, 1, 2, 3, 4, 5])
console.assert(i1.length === 6, 'Invalid buffer length')
console.assert(i1.type === ctx.DataType.Uint16, 'Invalid data type')

const i2 = ctx.indexBuffer(new Uint16Array([0, 1, 2, 3, 4, 5]))
console.assert(i2.length === 6, 'Invalid buffer length')
console.assert(i2.type === ctx.DataType.Uint16, 'Invalid data type')

const i3 = ctx.indexBuffer(new Uint32Array([0, 1, 2, 3, 4, 5]))
console.assert(i3.length === 6, 'Invalid buffer length')
console.assert(i3.type === ctx.DataType.Uint32, `Invalid data type`)

const i4 = ctx.indexBuffer({
  data: [0, 1, 2, 3, 4, 5],
  type: ctx.DataType.Uint16
})
console.assert(i4.length === 6, 'Invalid buffer length')
console.assert(i4.type === ctx.DataType.Uint16, 'Invalid data type')

const i5 = ctx.indexBuffer({
  data: [0, 1, 2, 3, 4, 5],
  type: ctx.DataType.Uint32
})
console.assert(i5.length === 6, 'Invalid buffer length')
console.assert(i5.type === ctx.DataType.Uint32, 'Invalid data type')

// array type has priority
const i6 = ctx.indexBuffer({
  data: new Uint16Array([0, 1, 2, 3, 4, 5]),
  type: ctx.DataType.Uint32
})
console.assert(i6.length === 6, 'Invalid buffer length')
console.assert(i6.type === ctx.DataType.Uint16, 'Invalid data type')

// array type has priority
const i7 = ctx.indexBuffer({
  data: new Uint32Array([0, 1, 2, 3, 4, 5]),
  type: ctx.DataType.Uint16
})
console.assert(i7.length === 6, 'Invalid buffer length')
console.assert(i7.type === ctx.DataType.Uint32, 'Invalid data type')

const i8 = ctx.indexBuffer({ data: new Uint16Array([0, 1, 2, 3, 4, 5]).buffer })
console.assert(i8.length === 6, 'Invalid buffer length')
console.assert(i8.type === ctx.DataType.Uint16, 'Invalid data type')

const i9 = ctx.indexBuffer({
  data: new Uint32Array([0, 1, 2, 3, 4, 5]).buffer,
  type: ctx.DataType.Uint32
})
console.assert(i9.length === 6, 'Invalid buffer length')
console.assert(i9.type === ctx.DataType.Uint32, 'Invalid data type')

setTimeout(() => {
  window.dispatchEvent(new CustomEvent('pex-screenshot'))
}, 1000)
