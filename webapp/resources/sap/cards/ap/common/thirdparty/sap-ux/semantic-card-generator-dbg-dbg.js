sap.ui.define((function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getAugmentedNamespace(n) {
	  if (n.__esModule) return n;
	  var f = n.default;
		if (typeof f == "function") {
			var a = function a () {
				if (this instanceof a) {
	        return Reflect.construct(f, arguments, this.constructor);
				}
				return f.apply(this, arguments);
			};
			a.prototype = f.prototype;
	  } else a = {};
	  Object.defineProperty(a, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	var dist = {exports: {}};

	var global$1 = (typeof global !== "undefined" ? global :
	  typeof self !== "undefined" ? self :
	  typeof window !== "undefined" ? window : {});

	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
	var inited = false;
	function init () {
	  inited = true;
	  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	  for (var i = 0, len = code.length; i < len; ++i) {
	    lookup[i] = code[i];
	    revLookup[code.charCodeAt(i)] = i;
	  }

	  revLookup['-'.charCodeAt(0)] = 62;
	  revLookup['_'.charCodeAt(0)] = 63;
	}

	function toByteArray (b64) {
	  if (!inited) {
	    init();
	  }
	  var i, j, l, tmp, placeHolders, arr;
	  var len = b64.length;

	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // the number of equal signs (place holders)
	  // if there are two placeholders, than the two characters before it
	  // represent one byte
	  // if there is only one, then the three characters before it represent 2 bytes
	  // this is just a cheap hack to not do indexOf twice
	  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

	  // base64 is 4/3 + up to two characters of the original data
	  arr = new Arr(len * 3 / 4 - placeHolders);

	  // if there are placeholders, only get up to the last complete 4 chars
	  l = placeHolders > 0 ? len - 4 : len;

	  var L = 0;

	  for (i = 0, j = 0; i < l; i += 4, j += 3) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
	    arr[L++] = (tmp >> 16) & 0xFF;
	    arr[L++] = (tmp >> 8) & 0xFF;
	    arr[L++] = tmp & 0xFF;
	  }

	  if (placeHolders === 2) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
	    arr[L++] = tmp & 0xFF;
	  } else if (placeHolders === 1) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
	    arr[L++] = (tmp >> 8) & 0xFF;
	    arr[L++] = tmp & 0xFF;
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp;
	  var output = [];
	  for (var i = start; i < end; i += 3) {
	    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
	    output.push(tripletToBase64(tmp));
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  if (!inited) {
	    init();
	  }
	  var tmp;
	  var len = uint8.length;
	  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
	  var output = '';
	  var parts = [];
	  var maxChunkLength = 16383; // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1];
	    output += lookup[tmp >> 2];
	    output += lookup[(tmp << 4) & 0x3F];
	    output += '==';
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
	    output += lookup[tmp >> 10];
	    output += lookup[(tmp >> 4) & 0x3F];
	    output += lookup[(tmp << 2) & 0x3F];
	    output += '=';
	  }

	  parts.push(output);

	  return parts.join('')
	}

	function read (buffer, offset, isLE, mLen, nBytes) {
	  var e, m;
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var nBits = -7;
	  var i = isLE ? (nBytes - 1) : 0;
	  var d = isLE ? -1 : 1;
	  var s = buffer[offset + i];

	  i += d;

	  e = s & ((1 << (-nBits)) - 1);
	  s >>= (-nBits);
	  nBits += eLen;
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1);
	  e >>= (-nBits);
	  nBits += mLen;
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen);
	    e = e - eBias;
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	function write (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c;
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
	  var i = isLE ? 0 : (nBytes - 1);
	  var d = isLE ? 1 : -1;
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

	  value = Math.abs(value);

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0;
	    e = eMax;
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2);
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * Math.pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }

	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
	      e = 0;
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128;
	}

	var toString = {}.toString;

	var isArray$1 = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};

	/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */

	var INSPECT_MAX_BYTES = 50;

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer$1.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
	  ? global$1.TYPED_ARRAY_SUPPORT
	  : true;

	/*
	 * Export kMaxLength after typed array support is determined.
	 */
	kMaxLength();

	function kMaxLength () {
	  return Buffer$1.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	function createBuffer (that, length) {
	  if (kMaxLength() < length) {
	    throw new RangeError('Invalid typed array length')
	  }
	  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length);
	    that.__proto__ = Buffer$1.prototype;
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    if (that === null) {
	      that = new Buffer$1(length);
	    }
	    that.length = length;
	  }

	  return that
	}

	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */

	function Buffer$1 (arg, encodingOrOffset, length) {
	  if (!Buffer$1.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer$1)) {
	    return new Buffer$1(arg, encodingOrOffset, length)
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new Error(
	        'If encoding is specified then the first argument must be a string'
	      )
	    }
	    return allocUnsafe(this, arg)
	  }
	  return from(this, arg, encodingOrOffset, length)
	}

	Buffer$1.poolSize = 8192; // not used by this implementation

	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer$1._augment = function (arr) {
	  arr.__proto__ = Buffer$1.prototype;
	  return arr
	};

	function from (that, value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }

	  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	    return fromArrayBuffer(that, value, encodingOrOffset, length)
	  }

	  if (typeof value === 'string') {
	    return fromString(that, value, encodingOrOffset)
	  }

	  return fromObject(that, value)
	}

	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer$1.from = function (value, encodingOrOffset, length) {
	  return from(null, value, encodingOrOffset, length)
	};

	if (Buffer$1.TYPED_ARRAY_SUPPORT) {
	  Buffer$1.prototype.__proto__ = Uint8Array.prototype;
	  Buffer$1.__proto__ = Uint8Array;
	  if (typeof Symbol !== 'undefined' && Symbol.species &&
	      Buffer$1[Symbol.species] === Buffer$1) ;
	}

	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be a number')
	  } else if (size < 0) {
	    throw new RangeError('"size" argument must not be negative')
	  }
	}

	function alloc (that, size, fill, encoding) {
	  assertSize(size);
	  if (size <= 0) {
	    return createBuffer(that, size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpretted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(that, size).fill(fill, encoding)
	      : createBuffer(that, size).fill(fill)
	  }
	  return createBuffer(that, size)
	}

	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer$1.alloc = function (size, fill, encoding) {
	  return alloc(null, size, fill, encoding)
	};

	function allocUnsafe (that, size) {
	  assertSize(size);
	  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
	  if (!Buffer$1.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < size; ++i) {
	      that[i] = 0;
	    }
	  }
	  return that
	}

	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer$1.allocUnsafe = function (size) {
	  return allocUnsafe(null, size)
	};
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer$1.allocUnsafeSlow = function (size) {
	  return allocUnsafe(null, size)
	};

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8';
	  }

	  if (!Buffer$1.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }

	  var length = byteLength(string, encoding) | 0;
	  that = createBuffer(that, length);

	  var actual = that.write(string, encoding);

	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    that = that.slice(0, actual);
	  }

	  return that
	}

	function fromArrayLike (that, array) {
	  var length = array.length < 0 ? 0 : checked(array.length) | 0;
	  that = createBuffer(that, length);
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255;
	  }
	  return that
	}

	function fromArrayBuffer (that, array, byteOffset, length) {
	  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('\'offset\' is out of bounds')
	  }

	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('\'length\' is out of bounds')
	  }

	  if (byteOffset === undefined && length === undefined) {
	    array = new Uint8Array(array);
	  } else if (length === undefined) {
	    array = new Uint8Array(array, byteOffset);
	  } else {
	    array = new Uint8Array(array, byteOffset, length);
	  }

	  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = array;
	    that.__proto__ = Buffer$1.prototype;
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromArrayLike(that, array);
	  }
	  return that
	}

	function fromObject (that, obj) {
	  if (internalIsBuffer(obj)) {
	    var len = checked(obj.length) | 0;
	    that = createBuffer(that, len);

	    if (that.length === 0) {
	      return that
	    }

	    obj.copy(that, 0, 0, len);
	    return that
	  }

	  if (obj) {
	    if ((typeof ArrayBuffer !== 'undefined' &&
	        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	      if (typeof obj.length !== 'number' || isnan(obj.length)) {
	        return createBuffer(that, 0)
	      }
	      return fromArrayLike(that, obj)
	    }

	    if (obj.type === 'Buffer' && isArray$1(obj.data)) {
	      return fromArrayLike(that, obj.data)
	    }
	  }

	  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength()` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}
	Buffer$1.isBuffer = isBuffer;
	function internalIsBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer$1.compare = function compare (a, b) {
	  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length;
	  var y = b.length;

	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i];
	      y = b[i];
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	};

	Buffer$1.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	};

	Buffer$1.concat = function concat (list, length) {
	  if (!isArray$1(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }

	  if (list.length === 0) {
	    return Buffer$1.alloc(0)
	  }

	  var i;
	  if (length === undefined) {
	    length = 0;
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length;
	    }
	  }

	  var buffer = Buffer$1.allocUnsafe(length);
	  var pos = 0;
	  for (i = 0; i < list.length; ++i) {
	    var buf = list[i];
	    if (!internalIsBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    }
	    buf.copy(buffer, pos);
	    pos += buf.length;
	  }
	  return buffer
	};

	function byteLength (string, encoding) {
	  if (internalIsBuffer(string)) {
	    return string.length
	  }
	  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    string = '' + string;
	  }

	  var len = string.length;
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false;
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len
	      case 'utf8':
	      case 'utf-8':
	      case undefined:
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase();
	        loweredCase = true;
	    }
	  }
	}
	Buffer$1.byteLength = byteLength;

	function slowToString (encoding, start, end) {
	  var loweredCase = false;

	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.

	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0;
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }

	  if (end === undefined || end > this.length) {
	    end = this.length;
	  }

	  if (end <= 0) {
	    return ''
	  }

	  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0;
	  start >>>= 0;

	  if (end <= start) {
	    return ''
	  }

	  if (!encoding) encoding = 'utf8';

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase();
	        loweredCase = true;
	    }
	  }
	}

	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer$1.prototype._isBuffer = true;

	function swap (b, n, m) {
	  var i = b[n];
	  b[n] = b[m];
	  b[m] = i;
	}

	Buffer$1.prototype.swap16 = function swap16 () {
	  var len = this.length;
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (var i = 0; i < len; i += 2) {
	    swap(this, i, i + 1);
	  }
	  return this
	};

	Buffer$1.prototype.swap32 = function swap32 () {
	  var len = this.length;
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (var i = 0; i < len; i += 4) {
	    swap(this, i, i + 3);
	    swap(this, i + 1, i + 2);
	  }
	  return this
	};

	Buffer$1.prototype.swap64 = function swap64 () {
	  var len = this.length;
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits')
	  }
	  for (var i = 0; i < len; i += 8) {
	    swap(this, i, i + 7);
	    swap(this, i + 1, i + 6);
	    swap(this, i + 2, i + 5);
	    swap(this, i + 3, i + 4);
	  }
	  return this
	};

	Buffer$1.prototype.toString = function toString () {
	  var length = this.length | 0;
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	};

	Buffer$1.prototype.equals = function equals (b) {
	  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer$1.compare(this, b) === 0
	};

	Buffer$1.prototype.inspect = function inspect () {
	  var str = '';
	  var max = INSPECT_MAX_BYTES;
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
	    if (this.length > max) str += ' ... ';
	  }
	  return '<Buffer ' + str + '>'
	};

	Buffer$1.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (!internalIsBuffer(target)) {
	    throw new TypeError('Argument must be a Buffer')
	  }

	  if (start === undefined) {
	    start = 0;
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0;
	  }
	  if (thisStart === undefined) {
	    thisStart = 0;
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length;
	  }

	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }

	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }

	  start >>>= 0;
	  end >>>= 0;
	  thisStart >>>= 0;
	  thisEnd >>>= 0;

	  if (this === target) return 0

	  var x = thisEnd - thisStart;
	  var y = end - start;
	  var len = Math.min(x, y);

	  var thisCopy = this.slice(thisStart, thisEnd);
	  var targetCopy = target.slice(start, end);

	  for (var i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i];
	      y = targetCopy[i];
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	};

	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1

	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset;
	    byteOffset = 0;
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff;
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000;
	  }
	  byteOffset = +byteOffset;  // Coerce to Number.
	  if (isNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : (buffer.length - 1);
	  }

	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1
	    else byteOffset = buffer.length - 1;
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0;
	    else return -1
	  }

	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer$1.from(val, encoding);
	  }

	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (internalIsBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
	  } else if (typeof val === 'number') {
	    val = val & 0xFF; // Search for a byte value [0-255]
	    if (Buffer$1.TYPED_ARRAY_SUPPORT &&
	        typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
	      }
	    }
	    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
	  var indexSize = 1;
	  var arrLength = arr.length;
	  var valLength = val.length;

	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase();
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2;
	      arrLength /= 2;
	      valLength /= 2;
	      byteOffset /= 2;
	    }
	  }

	  function read (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }

	  var i;
	  if (dir) {
	    var foundIndex = -1;
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i;
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex;
	        foundIndex = -1;
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
	    for (i = byteOffset; i >= 0; i--) {
	      var found = true;
	      for (var j = 0; j < valLength; j++) {
	        if (read(arr, i + j) !== read(val, j)) {
	          found = false;
	          break
	        }
	      }
	      if (found) return i
	    }
	  }

	  return -1
	}

	Buffer$1.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	};

	Buffer$1.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
	};

	Buffer$1.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
	};

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0;
	  var remaining = buf.length - offset;
	  if (!length) {
	    length = remaining;
	  } else {
	    length = Number(length);
	    if (length > remaining) {
	      length = remaining;
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length;
	  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2;
	  }
	  for (var i = 0; i < length; ++i) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16);
	    if (isNaN(parsed)) return i
	    buf[offset + i] = parsed;
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function latin1Write (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer$1.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8';
	    length = this.length;
	    offset = 0;
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset;
	    length = this.length;
	    offset = 0;
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0;
	    if (isFinite(length)) {
	      length = length | 0;
	      if (encoding === undefined) encoding = 'utf8';
	    } else {
	      encoding = length;
	      length = undefined;
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }

	  var remaining = this.length - offset;
	  if (length === undefined || length > remaining) length = remaining;

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8';

	  var loweredCase = false;
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'latin1':
	      case 'binary':
	        return latin1Write(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase();
	        loweredCase = true;
	    }
	  }
	};

	Buffer$1.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	};

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return fromByteArray(buf)
	  } else {
	    return fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end);
	  var res = [];

	  var i = start;
	  while (i < end) {
	    var firstByte = buf[i];
	    var codePoint = null;
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1;

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint;

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte;
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1];
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint;
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1];
	          thirdByte = buf[i + 2];
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint;
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1];
	          thirdByte = buf[i + 2];
	          fourthByte = buf[i + 3];
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint;
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD;
	      bytesPerSequence = 1;
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000;
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
	      codePoint = 0xDC00 | codePoint & 0x3FF;
	    }

	    res.push(codePoint);
	    i += bytesPerSequence;
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000;

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length;
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = '';
	  var i = 0;
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    );
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = '';
	  end = Math.min(buf.length, end);

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7F);
	  }
	  return ret
	}

	function latin1Slice (buf, start, end) {
	  var ret = '';
	  end = Math.min(buf.length, end);

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i]);
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length;

	  if (!start || start < 0) start = 0;
	  if (!end || end < 0 || end > len) end = len;

	  var out = '';
	  for (var i = start; i < end; ++i) {
	    out += toHex(buf[i]);
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end);
	  var res = '';
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
	  }
	  return res
	}

	Buffer$1.prototype.slice = function slice (start, end) {
	  var len = this.length;
	  start = ~~start;
	  end = end === undefined ? len : ~~end;

	  if (start < 0) {
	    start += len;
	    if (start < 0) start = 0;
	  } else if (start > len) {
	    start = len;
	  }

	  if (end < 0) {
	    end += len;
	    if (end < 0) end = 0;
	  } else if (end > len) {
	    end = len;
	  }

	  if (end < start) end = start;

	  var newBuf;
	  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end);
	    newBuf.__proto__ = Buffer$1.prototype;
	  } else {
	    var sliceLen = end - start;
	    newBuf = new Buffer$1(sliceLen, undefined);
	    for (var i = 0; i < sliceLen; ++i) {
	      newBuf[i] = this[i + start];
	    }
	  }

	  return newBuf
	};

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer$1.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  var val = this[offset];
	  var mul = 1;
	  var i = 0;
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul;
	  }

	  return val
	};

	Buffer$1.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length);
	  }

	  var val = this[offset + --byteLength];
	  var mul = 1;
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul;
	  }

	  return val
	};

	Buffer$1.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length);
	  return this[offset]
	};

	Buffer$1.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  return this[offset] | (this[offset + 1] << 8)
	};

	Buffer$1.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  return (this[offset] << 8) | this[offset + 1]
	};

	Buffer$1.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	};

	Buffer$1.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	};

	Buffer$1.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  var val = this[offset];
	  var mul = 1;
	  var i = 0;
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul;
	  }
	  mul *= 0x80;

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

	  return val
	};

	Buffer$1.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  var i = byteLength;
	  var mul = 1;
	  var val = this[offset + --i];
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul;
	  }
	  mul *= 0x80;

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

	  return val
	};

	Buffer$1.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length);
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	};

	Buffer$1.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  var val = this[offset] | (this[offset + 1] << 8);
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	};

	Buffer$1.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  var val = this[offset + 1] | (this[offset] << 8);
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	};

	Buffer$1.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	};

	Buffer$1.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	};

	Buffer$1.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);
	  return read(this, offset, true, 23, 4)
	};

	Buffer$1.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);
	  return read(this, offset, false, 23, 4)
	};

	Buffer$1.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length);
	  return read(this, offset, true, 52, 8)
	};

	Buffer$1.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length);
	  return read(this, offset, false, 52, 8)
	};

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}

	Buffer$1.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
	    checkInt(this, value, offset, byteLength, maxBytes, 0);
	  }

	  var mul = 1;
	  var i = 0;
	  this[offset] = value & 0xFF;
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer$1.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
	    checkInt(this, value, offset, byteLength, maxBytes, 0);
	  }

	  var i = byteLength - 1;
	  var mul = 1;
	  this[offset + i] = value & 0xFF;
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer$1.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
	  if (!Buffer$1.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
	  this[offset] = (value & 0xff);
	  return offset + 1
	};

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1;
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8;
	  }
	}

	Buffer$1.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff);
	    this[offset + 1] = (value >>> 8);
	  } else {
	    objectWriteUInt16(this, value, offset, true);
	  }
	  return offset + 2
	};

	Buffer$1.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8);
	    this[offset + 1] = (value & 0xff);
	  } else {
	    objectWriteUInt16(this, value, offset, false);
	  }
	  return offset + 2
	};

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1;
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
	  }
	}

	Buffer$1.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24);
	    this[offset + 2] = (value >>> 16);
	    this[offset + 1] = (value >>> 8);
	    this[offset] = (value & 0xff);
	  } else {
	    objectWriteUInt32(this, value, offset, true);
	  }
	  return offset + 4
	};

	Buffer$1.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24);
	    this[offset + 1] = (value >>> 16);
	    this[offset + 2] = (value >>> 8);
	    this[offset + 3] = (value & 0xff);
	  } else {
	    objectWriteUInt32(this, value, offset, false);
	  }
	  return offset + 4
	};

	Buffer$1.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1);

	    checkInt(this, value, offset, byteLength, limit - 1, -limit);
	  }

	  var i = 0;
	  var mul = 1;
	  var sub = 0;
	  this[offset] = value & 0xFF;
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1;
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer$1.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1);

	    checkInt(this, value, offset, byteLength, limit - 1, -limit);
	  }

	  var i = byteLength - 1;
	  var mul = 1;
	  var sub = 0;
	  this[offset + i] = value & 0xFF;
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1;
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer$1.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
	  if (!Buffer$1.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
	  if (value < 0) value = 0xff + value + 1;
	  this[offset] = (value & 0xff);
	  return offset + 1
	};

	Buffer$1.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
	  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff);
	    this[offset + 1] = (value >>> 8);
	  } else {
	    objectWriteUInt16(this, value, offset, true);
	  }
	  return offset + 2
	};

	Buffer$1.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
	  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8);
	    this[offset + 1] = (value & 0xff);
	  } else {
	    objectWriteUInt16(this, value, offset, false);
	  }
	  return offset + 2
	};

	Buffer$1.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
	  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff);
	    this[offset + 1] = (value >>> 8);
	    this[offset + 2] = (value >>> 16);
	    this[offset + 3] = (value >>> 24);
	  } else {
	    objectWriteUInt32(this, value, offset, true);
	  }
	  return offset + 4
	};

	Buffer$1.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
	  if (value < 0) value = 0xffffffff + value + 1;
	  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24);
	    this[offset + 1] = (value >>> 16);
	    this[offset + 2] = (value >>> 8);
	    this[offset + 3] = (value & 0xff);
	  } else {
	    objectWriteUInt32(this, value, offset, false);
	  }
	  return offset + 4
	};

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4);
	  }
	  write(buf, value, offset, littleEndian, 23, 4);
	  return offset + 4
	}

	Buffer$1.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	};

	Buffer$1.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	};

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8);
	  }
	  write(buf, value, offset, littleEndian, 52, 8);
	  return offset + 8
	}

	Buffer$1.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	};

	Buffer$1.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	};

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer$1.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0;
	  if (!end && end !== 0) end = this.length;
	  if (targetStart >= target.length) targetStart = target.length;
	  if (!targetStart) targetStart = 0;
	  if (end > 0 && end < start) end = start;

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length;
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start;
	  }

	  var len = end - start;
	  var i;

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; --i) {
	      target[i + targetStart] = this[i + start];
	    }
	  } else if (len < 1000 || !Buffer$1.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; ++i) {
	      target[i + targetStart] = this[i + start];
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    );
	  }

	  return len
	};

	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer$1.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start;
	      start = 0;
	      end = this.length;
	    } else if (typeof end === 'string') {
	      encoding = end;
	      end = this.length;
	    }
	    if (val.length === 1) {
	      var code = val.charCodeAt(0);
	      if (code < 256) {
	        val = code;
	      }
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer$1.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255;
	  }

	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }

	  if (end <= start) {
	    return this
	  }

	  start = start >>> 0;
	  end = end === undefined ? this.length : end >>> 0;

	  if (!val) val = 0;

	  var i;
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val;
	    }
	  } else {
	    var bytes = internalIsBuffer(val)
	      ? val
	      : utf8ToBytes(new Buffer$1(val, encoding).toString());
	    var len = bytes.length;
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len];
	    }
	  }

	  return this
	};

	// HELPER FUNCTIONS
	// ================

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '=';
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity;
	  var codePoint;
	  var length = string.length;
	  var leadSurrogate = null;
	  var bytes = [];

	  for (var i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i);

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint;

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	        leadSurrogate = codePoint;
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	    }

	    leadSurrogate = null;

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint);
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      );
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      );
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      );
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = [];
	  for (var i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF);
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo;
	  var byteArray = [];
	  for (var i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i);
	    hi = c >> 8;
	    lo = c % 256;
	    byteArray.push(lo);
	    byteArray.push(hi);
	  }

	  return byteArray
	}


	function base64ToBytes (str) {
	  return toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; ++i) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i];
	  }
	  return i
	}

	function isnan (val) {
	  return val !== val // eslint-disable-line no-self-compare
	}


	// the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
	// The _isBuffer check is for Safari 5-7 support, because it's missing
	// Object.prototype.constructor. Remove this eventually
	function isBuffer(obj) {
	  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
	}

	function isFastBuffer (obj) {
	  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
	}

	// For Node v0.10 support. Remove this eventually.
	function isSlowBuffer (obj) {
	  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
	}

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var isBufferEncoding = Buffer$1.isEncoding
	  || function(encoding) {
	       switch (encoding && encoding.toLowerCase()) {
	         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
	         default: return false;
	       }
	     };


	function assertEncoding(encoding) {
	  if (encoding && !isBufferEncoding(encoding)) {
	    throw new Error('Unknown encoding: ' + encoding);
	  }
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters. CESU-8 is handled as part of the UTF-8 encoding.
	//
	// @TODO Handling all encodings inside a single object makes it very difficult
	// to reason about this code, so it should be split up in the future.
	// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
	// points as used by CESU-8.
	function StringDecoder(encoding) {
	  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
	  assertEncoding(encoding);
	  switch (this.encoding) {
	    case 'utf8':
	      // CESU-8 represents each of Surrogate Pair by 3-bytes
	      this.surrogateSize = 3;
	      break;
	    case 'ucs2':
	    case 'utf16le':
	      // UTF-16 represents each of Surrogate Pair by 2-bytes
	      this.surrogateSize = 2;
	      this.detectIncompleteChar = utf16DetectIncompleteChar;
	      break;
	    case 'base64':
	      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
	      this.surrogateSize = 3;
	      this.detectIncompleteChar = base64DetectIncompleteChar;
	      break;
	    default:
	      this.write = passThroughWrite;
	      return;
	  }

	  // Enough space to store all bytes of a single character. UTF-8 needs 4
	  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
	  this.charBuffer = new Buffer$1(6);
	  // Number of bytes received for the current incomplete multi-byte character.
	  this.charReceived = 0;
	  // Number of bytes expected for the current incomplete multi-byte character.
	  this.charLength = 0;
	}

	// write decodes the given buffer and returns it as JS string that is
	// guaranteed to not contain any partial multi-byte characters. Any partial
	// character found at the end of the buffer is buffered up, and will be
	// returned when calling write again with the remaining bytes.
	//
	// Note: Converting a Buffer containing an orphan surrogate to a String
	// currently works, but converting a String to a Buffer (via `new Buffer`, or
	// Buffer#write) will replace incomplete surrogates with the unicode
	// replacement character. See https://codereview.chromium.org/121173009/ .
	StringDecoder.prototype.write = function(buffer) {
	  var charStr = '';
	  // if our last write ended with an incomplete multibyte character
	  while (this.charLength) {
	    // determine how many remaining bytes this buffer has to offer for this char
	    var available = (buffer.length >= this.charLength - this.charReceived) ?
	        this.charLength - this.charReceived :
	        buffer.length;

	    // add the new bytes to the char buffer
	    buffer.copy(this.charBuffer, this.charReceived, 0, available);
	    this.charReceived += available;

	    if (this.charReceived < this.charLength) {
	      // still not enough chars in this buffer? wait for more ...
	      return '';
	    }

	    // remove bytes belonging to the current character from the buffer
	    buffer = buffer.slice(available, buffer.length);

	    // get the character that was split
	    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

	    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	    var charCode = charStr.charCodeAt(charStr.length - 1);
	    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	      this.charLength += this.surrogateSize;
	      charStr = '';
	      continue;
	    }
	    this.charReceived = this.charLength = 0;

	    // if there are no more bytes in this buffer, just emit our char
	    if (buffer.length === 0) {
	      return charStr;
	    }
	    break;
	  }

	  // determine and set charLength / charReceived
	  this.detectIncompleteChar(buffer);

	  var end = buffer.length;
	  if (this.charLength) {
	    // buffer the incomplete character bytes we got
	    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
	    end -= this.charReceived;
	  }

	  charStr += buffer.toString(this.encoding, 0, end);

	  var end = charStr.length - 1;
	  var charCode = charStr.charCodeAt(end);
	  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	    var size = this.surrogateSize;
	    this.charLength += size;
	    this.charReceived += size;
	    this.charBuffer.copy(this.charBuffer, size, 0, size);
	    buffer.copy(this.charBuffer, 0, 0, size);
	    return charStr.substring(0, end);
	  }

	  // or just emit the charStr
	  return charStr;
	};

	// detectIncompleteChar determines if there is an incomplete UTF-8 character at
	// the end of the given buffer. If so, it sets this.charLength to the byte
	// length that character, and sets this.charReceived to the number of bytes
	// that are available for this character.
	StringDecoder.prototype.detectIncompleteChar = function(buffer) {
	  // determine how many bytes we have to check at the end of this buffer
	  var i = (buffer.length >= 3) ? 3 : buffer.length;

	  // Figure out if one of the last i bytes of our buffer announces an
	  // incomplete char.
	  for (; i > 0; i--) {
	    var c = buffer[buffer.length - i];

	    // See http://en.wikipedia.org/wiki/UTF-8#Description

	    // 110XXXXX
	    if (i == 1 && c >> 5 == 0x06) {
	      this.charLength = 2;
	      break;
	    }

	    // 1110XXXX
	    if (i <= 2 && c >> 4 == 0x0E) {
	      this.charLength = 3;
	      break;
	    }

	    // 11110XXX
	    if (i <= 3 && c >> 3 == 0x1E) {
	      this.charLength = 4;
	      break;
	    }
	  }
	  this.charReceived = i;
	};

	StringDecoder.prototype.end = function(buffer) {
	  var res = '';
	  if (buffer && buffer.length)
	    res = this.write(buffer);

	  if (this.charReceived) {
	    var cr = this.charReceived;
	    var buf = this.charBuffer;
	    var enc = this.encoding;
	    res += buf.slice(0, cr).toString(enc);
	  }

	  return res;
	};

	function passThroughWrite(buffer) {
	  return buffer.toString(this.encoding);
	}

	function utf16DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 2;
	  this.charLength = this.charReceived ? 2 : 0;
	}

	function base64DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 3;
	  this.charLength = this.charReceived ? 3 : 0;
	}

	var _polyfillNode_string_decoder = /*#__PURE__*/Object.freeze({
		__proto__: null,
		StringDecoder: StringDecoder
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_string_decoder);

	var domain;

	// This constructor is used to store event handlers. Instantiating this is
	// faster than explicitly calling `Object.create(null)` to get a "clean" empty
	// object (tested with v8 v4.9).
	function EventHandlers() {}
	EventHandlers.prototype = Object.create(null);

	function EventEmitter() {
	  EventEmitter.init.call(this);
	}

	// nodejs oddity
	// require('events') === require('events').EventEmitter
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.usingDomains = false;

	EventEmitter.prototype.domain = undefined;
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	EventEmitter.init = function() {
	  this.domain = null;
	  if (EventEmitter.usingDomains) {
	    // if there is an active domain, then attach to it.
	    if (domain.active ) ;
	  }

	  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
	    this._events = new EventHandlers();
	    this._eventsCount = 0;
	  }

	  this._maxListeners = this._maxListeners || undefined;
	};

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
	  if (typeof n !== 'number' || n < 0 || isNaN(n))
	    throw new TypeError('"n" argument must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	function $getMaxListeners(that) {
	  if (that._maxListeners === undefined)
	    return EventEmitter.defaultMaxListeners;
	  return that._maxListeners;
	}

	EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
	  return $getMaxListeners(this);
	};

	// These standalone emit* functions are used to optimize calling of event
	// handlers for fast cases because emit() itself often has a variable number of
	// arguments and can be deoptimized because of that. These functions always have
	// the same number of arguments and thus do not get deoptimized, so the code
	// inside them can execute faster.
	function emitNone(handler, isFn, self) {
	  if (isFn)
	    handler.call(self);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self);
	  }
	}
	function emitOne(handler, isFn, self, arg1) {
	  if (isFn)
	    handler.call(self, arg1);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1);
	  }
	}
	function emitTwo(handler, isFn, self, arg1, arg2) {
	  if (isFn)
	    handler.call(self, arg1, arg2);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1, arg2);
	  }
	}
	function emitThree(handler, isFn, self, arg1, arg2, arg3) {
	  if (isFn)
	    handler.call(self, arg1, arg2, arg3);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1, arg2, arg3);
	  }
	}

	function emitMany(handler, isFn, self, args) {
	  if (isFn)
	    handler.apply(self, args);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].apply(self, args);
	  }
	}

	EventEmitter.prototype.emit = function emit(type) {
	  var er, handler, len, args, i, events, domain;
	  var doError = (type === 'error');

	  events = this._events;
	  if (events)
	    doError = (doError && events.error == null);
	  else if (!doError)
	    return false;

	  domain = this.domain;

	  // If there is no 'error' event listener then throw.
	  if (doError) {
	    er = arguments[1];
	    if (domain) {
	      if (!er)
	        er = new Error('Uncaught, unspecified "error" event');
	      er.domainEmitter = this;
	      er.domain = domain;
	      er.domainThrown = false;
	      domain.emit('error', er);
	    } else if (er instanceof Error) {
	      throw er; // Unhandled 'error' event
	    } else {
	      // At least give some kind of context to the user
	      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	      err.context = er;
	      throw err;
	    }
	    return false;
	  }

	  handler = events[type];

	  if (!handler)
	    return false;

	  var isFn = typeof handler === 'function';
	  len = arguments.length;
	  switch (len) {
	    // fast cases
	    case 1:
	      emitNone(handler, isFn, this);
	      break;
	    case 2:
	      emitOne(handler, isFn, this, arguments[1]);
	      break;
	    case 3:
	      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
	      break;
	    case 4:
	      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
	      break;
	    // slower
	    default:
	      args = new Array(len - 1);
	      for (i = 1; i < len; i++)
	        args[i - 1] = arguments[i];
	      emitMany(handler, isFn, this, args);
	  }

	  return true;
	};

	function _addListener(target, type, listener, prepend) {
	  var m;
	  var events;
	  var existing;

	  if (typeof listener !== 'function')
	    throw new TypeError('"listener" argument must be a function');

	  events = target._events;
	  if (!events) {
	    events = target._events = new EventHandlers();
	    target._eventsCount = 0;
	  } else {
	    // To avoid recursion in the case that type === "newListener"! Before
	    // adding it to the listeners, first emit "newListener".
	    if (events.newListener) {
	      target.emit('newListener', type,
	                  listener.listener ? listener.listener : listener);

	      // Re-assign `events` because a newListener handler could have caused the
	      // this._events to be assigned to a new object
	      events = target._events;
	    }
	    existing = events[type];
	  }

	  if (!existing) {
	    // Optimize the case of one listener. Don't need the extra array object.
	    existing = events[type] = listener;
	    ++target._eventsCount;
	  } else {
	    if (typeof existing === 'function') {
	      // Adding the second element, need to change to array.
	      existing = events[type] = prepend ? [listener, existing] :
	                                          [existing, listener];
	    } else {
	      // If we've already got an array, just append.
	      if (prepend) {
	        existing.unshift(listener);
	      } else {
	        existing.push(listener);
	      }
	    }

	    // Check for listener leak
	    if (!existing.warned) {
	      m = $getMaxListeners(target);
	      if (m && m > 0 && existing.length > m) {
	        existing.warned = true;
	        var w = new Error('Possible EventEmitter memory leak detected. ' +
	                            existing.length + ' ' + type + ' listeners added. ' +
	                            'Use emitter.setMaxListeners() to increase limit');
	        w.name = 'MaxListenersExceededWarning';
	        w.emitter = target;
	        w.type = type;
	        w.count = existing.length;
	        emitWarning(w);
	      }
	    }
	  }

	  return target;
	}
	function emitWarning(e) {
	  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
	}
	EventEmitter.prototype.addListener = function addListener(type, listener) {
	  return _addListener(this, type, listener, false);
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.prependListener =
	    function prependListener(type, listener) {
	      return _addListener(this, type, listener, true);
	    };

	function _onceWrap(target, type, listener) {
	  var fired = false;
	  function g() {
	    target.removeListener(type, g);
	    if (!fired) {
	      fired = true;
	      listener.apply(target, arguments);
	    }
	  }
	  g.listener = listener;
	  return g;
	}

	EventEmitter.prototype.once = function once(type, listener) {
	  if (typeof listener !== 'function')
	    throw new TypeError('"listener" argument must be a function');
	  this.on(type, _onceWrap(this, type, listener));
	  return this;
	};

	EventEmitter.prototype.prependOnceListener =
	    function prependOnceListener(type, listener) {
	      if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');
	      this.prependListener(type, _onceWrap(this, type, listener));
	      return this;
	    };

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener =
	    function removeListener(type, listener) {
	      var list, events, position, i, originalListener;

	      if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');

	      events = this._events;
	      if (!events)
	        return this;

	      list = events[type];
	      if (!list)
	        return this;

	      if (list === listener || (list.listener && list.listener === listener)) {
	        if (--this._eventsCount === 0)
	          this._events = new EventHandlers();
	        else {
	          delete events[type];
	          if (events.removeListener)
	            this.emit('removeListener', type, list.listener || listener);
	        }
	      } else if (typeof list !== 'function') {
	        position = -1;

	        for (i = list.length; i-- > 0;) {
	          if (list[i] === listener ||
	              (list[i].listener && list[i].listener === listener)) {
	            originalListener = list[i].listener;
	            position = i;
	            break;
	          }
	        }

	        if (position < 0)
	          return this;

	        if (list.length === 1) {
	          list[0] = undefined;
	          if (--this._eventsCount === 0) {
	            this._events = new EventHandlers();
	            return this;
	          } else {
	            delete events[type];
	          }
	        } else {
	          spliceOne(list, position);
	        }

	        if (events.removeListener)
	          this.emit('removeListener', type, originalListener || listener);
	      }

	      return this;
	    };
	    
	// Alias for removeListener added in NodeJS 10.0
	// https://nodejs.org/api/events.html#events_emitter_off_eventname_listener
	EventEmitter.prototype.off = function(type, listener){
	    return this.removeListener(type, listener);
	};

	EventEmitter.prototype.removeAllListeners =
	    function removeAllListeners(type) {
	      var listeners, events;

	      events = this._events;
	      if (!events)
	        return this;

	      // not listening for removeListener, no need to emit
	      if (!events.removeListener) {
	        if (arguments.length === 0) {
	          this._events = new EventHandlers();
	          this._eventsCount = 0;
	        } else if (events[type]) {
	          if (--this._eventsCount === 0)
	            this._events = new EventHandlers();
	          else
	            delete events[type];
	        }
	        return this;
	      }

	      // emit removeListener for all listeners on all events
	      if (arguments.length === 0) {
	        var keys = Object.keys(events);
	        for (var i = 0, key; i < keys.length; ++i) {
	          key = keys[i];
	          if (key === 'removeListener') continue;
	          this.removeAllListeners(key);
	        }
	        this.removeAllListeners('removeListener');
	        this._events = new EventHandlers();
	        this._eventsCount = 0;
	        return this;
	      }

	      listeners = events[type];

	      if (typeof listeners === 'function') {
	        this.removeListener(type, listeners);
	      } else if (listeners) {
	        // LIFO order
	        do {
	          this.removeListener(type, listeners[listeners.length - 1]);
	        } while (listeners[0]);
	      }

	      return this;
	    };

	EventEmitter.prototype.listeners = function listeners(type) {
	  var evlistener;
	  var ret;
	  var events = this._events;

	  if (!events)
	    ret = [];
	  else {
	    evlistener = events[type];
	    if (!evlistener)
	      ret = [];
	    else if (typeof evlistener === 'function')
	      ret = [evlistener.listener || evlistener];
	    else
	      ret = unwrapListeners(evlistener);
	  }

	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  if (typeof emitter.listenerCount === 'function') {
	    return emitter.listenerCount(type);
	  } else {
	    return listenerCount$1.call(emitter, type);
	  }
	};

	EventEmitter.prototype.listenerCount = listenerCount$1;
	function listenerCount$1(type) {
	  var events = this._events;

	  if (events) {
	    var evlistener = events[type];

	    if (typeof evlistener === 'function') {
	      return 1;
	    } else if (evlistener) {
	      return evlistener.length;
	    }
	  }

	  return 0;
	}

	EventEmitter.prototype.eventNames = function eventNames() {
	  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
	};

	// About 1.5x faster than the two-arg version of Array#splice().
	function spliceOne(list, index) {
	  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
	    list[i] = list[k];
	  list.pop();
	}

	function arrayClone(arr, i) {
	  var copy = new Array(i);
	  while (i--)
	    copy[i] = arr[i];
	  return copy;
	}

	function unwrapListeners(arr) {
	  var ret = new Array(arr.length);
	  for (var i = 0; i < ret.length; ++i) {
	    ret[i] = arr[i].listener || arr[i];
	  }
	  return ret;
	}

	// shim for using process in browser
	// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	var cachedSetTimeout = defaultSetTimout;
	var cachedClearTimeout = defaultClearTimeout;
	if (typeof global$1.setTimeout === 'function') {
	    cachedSetTimeout = setTimeout;
	}
	if (typeof global$1.clearTimeout === 'function') {
	    cachedClearTimeout = clearTimeout;
	}

	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	function nextTick(fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	}
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	var title = 'browser';
	var platform = 'browser';
	var browser = true;
	var env = {};
	var argv = [];
	var version = ''; // empty string to avoid regexp issues
	var versions = {};
	var release = {};
	var config = {};

	function noop() {}

	var on = noop;
	var addListener = noop;
	var once = noop;
	var off = noop;
	var removeListener = noop;
	var removeAllListeners = noop;
	var emit = noop;

	function binding(name) {
	    throw new Error('process.binding is not supported');
	}

	function cwd () { return '/' }
	function chdir (dir) {
	    throw new Error('process.chdir is not supported');
	}function umask() { return 0; }

	// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
	var performance = global$1.performance || {};
	var performanceNow =
	  performance.now        ||
	  performance.mozNow     ||
	  performance.msNow      ||
	  performance.oNow       ||
	  performance.webkitNow  ||
	  function(){ return (new Date()).getTime() };

	// generate timestamp or delta
	// see http://nodejs.org/api/process.html#process_process_hrtime
	function hrtime(previousTimestamp){
	  var clocktime = performanceNow.call(performance)*1e-3;
	  var seconds = Math.floor(clocktime);
	  var nanoseconds = Math.floor((clocktime%1)*1e9);
	  if (previousTimestamp) {
	    seconds = seconds - previousTimestamp[0];
	    nanoseconds = nanoseconds - previousTimestamp[1];
	    if (nanoseconds<0) {
	      seconds--;
	      nanoseconds += 1e9;
	    }
	  }
	  return [seconds,nanoseconds]
	}

	var startTime = new Date();
	function uptime() {
	  var currentTime = new Date();
	  var dif = currentTime - startTime;
	  return dif / 1000;
	}

	var browser$1 = {
	  nextTick: nextTick,
	  title: title,
	  browser: browser,
	  env: env,
	  argv: argv,
	  version: version,
	  versions: versions,
	  on: on,
	  addListener: addListener,
	  once: once,
	  off: off,
	  removeListener: removeListener,
	  removeAllListeners: removeAllListeners,
	  emit: emit,
	  binding: binding,
	  cwd: cwd,
	  chdir: chdir,
	  umask: umask,
	  hrtime: hrtime,
	  platform: platform,
	  release: release,
	  config: config,
	  uptime: uptime
	};

	var inherits;
	if (typeof Object.create === 'function'){
	  inherits = function inherits(ctor, superCtor) {
	    // implementation from standard node.js 'util' module
	    ctor.super_ = superCtor;
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  inherits = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    var TempCtor = function () {};
	    TempCtor.prototype = superCtor.prototype;
	    ctor.prototype = new TempCtor();
	    ctor.prototype.constructor = ctor;
	  };
	}
	var inherits$1 = inherits;

	var formatRegExp = /%[sdj%]/g;
	function format(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	}

	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	function deprecate(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global$1.process)) {
	    return function() {
	      return deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (browser$1.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (browser$1.throwDeprecation) {
	        throw new Error(msg);
	      } else if (browser$1.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	}

	var debugs = {};
	var debugEnviron;
	function debuglog(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = browser$1.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = 0;
	      debugs[set] = function() {
	        var msg = format.apply(null, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	}

	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    _extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}

	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var length = output.reduce(function(prev, cur) {
	    if (cur.indexOf('\n') >= 0) ;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}

	function isNull(arg) {
	  return arg === null;
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isString(arg) {
	  return typeof arg === 'string';
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}

	function _extend(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	}
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	function BufferList() {
	  this.head = null;
	  this.tail = null;
	  this.length = 0;
	}

	BufferList.prototype.push = function (v) {
	  var entry = { data: v, next: null };
	  if (this.length > 0) this.tail.next = entry;else this.head = entry;
	  this.tail = entry;
	  ++this.length;
	};

	BufferList.prototype.unshift = function (v) {
	  var entry = { data: v, next: this.head };
	  if (this.length === 0) this.tail = entry;
	  this.head = entry;
	  ++this.length;
	};

	BufferList.prototype.shift = function () {
	  if (this.length === 0) return;
	  var ret = this.head.data;
	  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
	  --this.length;
	  return ret;
	};

	BufferList.prototype.clear = function () {
	  this.head = this.tail = null;
	  this.length = 0;
	};

	BufferList.prototype.join = function (s) {
	  if (this.length === 0) return '';
	  var p = this.head;
	  var ret = '' + p.data;
	  while (p = p.next) {
	    ret += s + p.data;
	  }return ret;
	};

	BufferList.prototype.concat = function (n) {
	  if (this.length === 0) return Buffer$1.alloc(0);
	  if (this.length === 1) return this.head.data;
	  var ret = Buffer$1.allocUnsafe(n >>> 0);
	  var p = this.head;
	  var i = 0;
	  while (p) {
	    p.data.copy(ret, i);
	    i += p.data.length;
	    p = p.next;
	  }
	  return ret;
	};

	Readable.ReadableState = ReadableState;

	var debug = debuglog('stream');
	inherits$1(Readable, EventEmitter);

	function prependListener(emitter, event, fn) {
	  // Sadly this is not cacheable as some libraries bundle their own
	  // event emitter implementation with them.
	  if (typeof emitter.prependListener === 'function') {
	    return emitter.prependListener(event, fn);
	  } else {
	    // This is a hack to make sure that our error handler is attached before any
	    // userland ones.  NEVER DO THIS. This is here only because this code needs
	    // to continue to work with older versions of Node.js that do not include
	    // the prependListener() method. The goal is to eventually remove this hack.
	    if (!emitter._events || !emitter._events[event])
	      emitter.on(event, fn);
	    else if (Array.isArray(emitter._events[event]))
	      emitter._events[event].unshift(fn);
	    else
	      emitter._events[event] = [fn, emitter._events[event]];
	  }
	}
	function listenerCount (emitter, type) {
	  return emitter.listeners(type).length;
	}
	function ReadableState(options, stream) {

	  options = options || {};

	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

	  // cast to ints.
	  this.highWaterMark = ~ ~this.highWaterMark;

	  // A linked list is used to store data chunks instead of an array because the
	  // linked list can remove elements from the beginning faster than
	  // array.shift()
	  this.buffer = new BufferList();
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;
	  this.resumeScheduled = false;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // when piping, we only care about 'readable' events that happen
	  // after read()ing all the bytes and not getting any pushback.
	  this.ranOut = false;

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}
	function Readable(options) {

	  if (!(this instanceof Readable)) return new Readable(options);

	  this._readableState = new ReadableState(options, this);

	  // legacy
	  this.readable = true;

	  if (options && typeof options.read === 'function') this._read = options.read;

	  EventEmitter.call(this);
	}

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function (chunk, encoding) {
	  var state = this._readableState;

	  if (!state.objectMode && typeof chunk === 'string') {
	    encoding = encoding || state.defaultEncoding;
	    if (encoding !== state.encoding) {
	      chunk = Buffer$1.from(chunk, encoding);
	      encoding = '';
	    }
	  }

	  return readableAddChunk(this, state, chunk, encoding, false);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function (chunk) {
	  var state = this._readableState;
	  return readableAddChunk(this, state, chunk, '', true);
	};

	Readable.prototype.isPaused = function () {
	  return this._readableState.flowing === false;
	};

	function readableAddChunk(stream, state, chunk, encoding, addToFront) {
	  var er = chunkInvalid(state, chunk);
	  if (er) {
	    stream.emit('error', er);
	  } else if (chunk === null) {
	    state.reading = false;
	    onEofChunk(stream, state);
	  } else if (state.objectMode || chunk && chunk.length > 0) {
	    if (state.ended && !addToFront) {
	      var e = new Error('stream.push() after EOF');
	      stream.emit('error', e);
	    } else if (state.endEmitted && addToFront) {
	      var _e = new Error('stream.unshift() after end event');
	      stream.emit('error', _e);
	    } else {
	      var skipAdd;
	      if (state.decoder && !addToFront && !encoding) {
	        chunk = state.decoder.write(chunk);
	        skipAdd = !state.objectMode && chunk.length === 0;
	      }

	      if (!addToFront) state.reading = false;

	      // Don't add to the buffer if we've decoded to an empty string chunk and
	      // we're not in object mode
	      if (!skipAdd) {
	        // if we want the data now, just emit it.
	        if (state.flowing && state.length === 0 && !state.sync) {
	          stream.emit('data', chunk);
	          stream.read(0);
	        } else {
	          // update the buffer info.
	          state.length += state.objectMode ? 1 : chunk.length;
	          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

	          if (state.needReadable) emitReadable(stream);
	        }
	      }

	      maybeReadMore(stream, state);
	    }
	  } else if (!addToFront) {
	    state.reading = false;
	  }

	  return needMoreData(state);
	}

	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
	}

	// backwards compatibility.
	Readable.prototype.setEncoding = function (enc) {
	  this._readableState.decoder = new StringDecoder(enc);
	  this._readableState.encoding = enc;
	  return this;
	};

	// Don't raise the hwm > 8MB
	var MAX_HWM = 0x800000;
	function computeNewHighWaterMark(n) {
	  if (n >= MAX_HWM) {
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2 to prevent increasing hwm excessively in
	    // tiny amounts
	    n--;
	    n |= n >>> 1;
	    n |= n >>> 2;
	    n |= n >>> 4;
	    n |= n >>> 8;
	    n |= n >>> 16;
	    n++;
	  }
	  return n;
	}

	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function howMuchToRead(n, state) {
	  if (n <= 0 || state.length === 0 && state.ended) return 0;
	  if (state.objectMode) return 1;
	  if (n !== n) {
	    // Only flow one buffer at a time
	    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
	  }
	  // If we're asking for more than the current hwm, then raise the hwm.
	  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
	  if (n <= state.length) return n;
	  // Don't have enough
	  if (!state.ended) {
	    state.needReadable = true;
	    return 0;
	  }
	  return state.length;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function (n) {
	  debug('read', n);
	  n = parseInt(n, 10);
	  var state = this._readableState;
	  var nOrig = n;

	  if (n !== 0) state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
	    return null;
	  }

	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0) endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug('reading or ended', doRead);
	  } else if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0) state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	    // If _read pushed data synchronously, then `reading` will be false,
	    // and we need to re-evaluate how much data we can return to the user.
	    if (!state.reading) n = howMuchToRead(nOrig, state);
	  }

	  var ret;
	  if (n > 0) ret = fromList(n, state);else ret = null;

	  if (ret === null) {
	    state.needReadable = true;
	    n = 0;
	  } else {
	    state.length -= n;
	  }

	  if (state.length === 0) {
	    // If we have nothing in the buffer, then we want to know
	    // as soon as we *do* get something into the buffer.
	    if (!state.ended) state.needReadable = true;

	    // If we tried to read() past the EOF, then emit end on the next tick.
	    if (nOrig !== n && state.ended) endReadable(this);
	  }

	  if (ret !== null) this.emit('data', ret);

	  return ret;
	};

	function chunkInvalid(state, chunk) {
	  var er = null;
	  if (!Buffer$1.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}

	function onEofChunk(stream, state) {
	  if (state.ended) return;
	  if (state.decoder) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // emit 'readable' now to make sure it gets picked up.
	  emitReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    if (state.sync) nextTick(emitReadable_, stream);else emitReadable_(stream);
	  }
	}

	function emitReadable_(stream) {
	  debug('emit readable');
	  stream.emit('readable');
	  flow(stream);
	}

	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    nextTick(maybeReadMore_, stream, state);
	  }
	}

	function maybeReadMore_(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;else len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function (n) {
	  this.emit('error', new Error('not implemented'));
	};

	Readable.prototype.pipe = function (dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	  var doEnd = (!pipeOpts || pipeOpts.end !== false);

	  var endFn = doEnd ? onend : cleanup;
	  if (state.endEmitted) nextTick(endFn);else src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable) {
	    debug('onunpipe');
	    if (readable === src) {
	      cleanup();
	    }
	  }

	  function onend() {
	    debug('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);

	  var cleanedUp = false;
	  function cleanup() {
	    debug('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', cleanup);
	    src.removeListener('data', ondata);

	    cleanedUp = true;

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
	  }

	  // If the user pushes more data while we're writing to dest then we'll end up
	  // in ondata again. However, we only want to increase awaitDrain once because
	  // dest will only emit one 'drain' event for the multiple writes.
	  // => Introduce a guard on increasing awaitDrain.
	  var increasedAwaitDrain = false;
	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    increasedAwaitDrain = false;
	    var ret = dest.write(chunk);
	    if (false === ret && !increasedAwaitDrain) {
	      // If the user unpiped during `dest.write()`, it is possible
	      // to get stuck in a permanently paused state if that write
	      // also returned false.
	      // => Check whether `dest` is still a piping destination.
	      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
	        debug('false write response, pause', src._readableState.awaitDrain);
	        src._readableState.awaitDrain++;
	        increasedAwaitDrain = true;
	      }
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (listenerCount(dest, 'error') === 0) dest.emit('error', er);
	  }

	  // Make sure our error handler is attached before userland ones.
	  prependListener(dest, 'error', onerror);

	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain(src) {
	  return function () {
	    var state = src._readableState;
	    debug('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain) state.awaitDrain--;
	    if (state.awaitDrain === 0 && src.listeners('data').length) {
	      state.flowing = true;
	      flow(src);
	    }
	  };
	}

	Readable.prototype.unpipe = function (dest) {
	  var state = this._readableState;

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0) return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes) return this;

	    if (!dest) dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest) dest.emit('unpipe', this);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var _i = 0; _i < len; _i++) {
	      dests[_i].emit('unpipe', this);
	    }return this;
	  }

	  // try to find the right one.
	  var i = indexOf(state.pipes, dest);
	  if (i === -1) return this;

	  state.pipes.splice(i, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1) state.pipes = state.pipes[0];

	  dest.emit('unpipe', this);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function (ev, fn) {
	  var res = EventEmitter.prototype.on.call(this, ev, fn);

	  if (ev === 'data') {
	    // Start flowing on next tick if stream isn't explicitly paused
	    if (this._readableState.flowing !== false) this.resume();
	  } else if (ev === 'readable') {
	    var state = this._readableState;
	    if (!state.endEmitted && !state.readableListening) {
	      state.readableListening = state.needReadable = true;
	      state.emittedReadable = false;
	      if (!state.reading) {
	        nextTick(nReadingNextTick, this);
	      } else if (state.length) {
	        emitReadable(this);
	      }
	    }
	  }

	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	function nReadingNextTick(self) {
	  debug('readable nexttick read 0');
	  self.read(0);
	}

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function () {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    state.flowing = true;
	    resume(this, state);
	  }
	  return this;
	};

	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    nextTick(resume_, stream, state);
	  }
	}

	function resume_(stream, state) {
	  if (!state.reading) {
	    debug('resume read 0');
	    stream.read(0);
	  }

	  state.resumeScheduled = false;
	  state.awaitDrain = 0;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading) stream.read(0);
	}

	Readable.prototype.pause = function () {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (false !== this._readableState.flowing) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  return this;
	};

	function flow(stream) {
	  var state = stream._readableState;
	  debug('flow', state.flowing);
	  while (state.flowing && stream.read() !== null) {}
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function (stream) {
	  var state = this._readableState;
	  var paused = false;

	  var self = this;
	  stream.on('end', function () {
	    debug('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length) self.push(chunk);
	    }

	    self.push(null);
	  });

	  stream.on('data', function (chunk) {
	    debug('wrapped data');
	    if (state.decoder) chunk = state.decoder.write(chunk);

	    // don't skip over falsy values in objectMode
	    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

	    var ret = self.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (this[i] === undefined && typeof stream[i] === 'function') {
	      this[i] = function (method) {
	        return function () {
	          return stream[method].apply(stream, arguments);
	        };
	      }(i);
	    }
	  }

	  // proxy certain important events.
	  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
	  forEach(events, function (ev) {
	    stream.on(ev, self.emit.bind(self, ev));
	  });

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  self._read = function (n) {
	    debug('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return self;
	};

	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromList(n, state) {
	  // nothing buffered
	  if (state.length === 0) return null;

	  var ret;
	  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
	    // read it all, truncate the list
	    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
	    state.buffer.clear();
	  } else {
	    // read part of list
	    ret = fromListPartial(n, state.buffer, state.decoder);
	  }

	  return ret;
	}

	// Extracts only enough buffered data to satisfy the amount requested.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromListPartial(n, list, hasStrings) {
	  var ret;
	  if (n < list.head.data.length) {
	    // slice is the same for buffers and strings
	    ret = list.head.data.slice(0, n);
	    list.head.data = list.head.data.slice(n);
	  } else if (n === list.head.data.length) {
	    // first chunk is a perfect match
	    ret = list.shift();
	  } else {
	    // result spans more than one buffer
	    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
	  }
	  return ret;
	}

	// Copies a specified amount of characters from the list of buffered data
	// chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBufferString(n, list) {
	  var p = list.head;
	  var c = 1;
	  var ret = p.data;
	  n -= ret.length;
	  while (p = p.next) {
	    var str = p.data;
	    var nb = n > str.length ? str.length : n;
	    if (nb === str.length) ret += str;else ret += str.slice(0, n);
	    n -= nb;
	    if (n === 0) {
	      if (nb === str.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = str.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	// Copies a specified amount of bytes from the list of buffered data chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBuffer(n, list) {
	  var ret = Buffer$1.allocUnsafe(n);
	  var p = list.head;
	  var c = 1;
	  p.data.copy(ret);
	  n -= p.data.length;
	  while (p = p.next) {
	    var buf = p.data;
	    var nb = n > buf.length ? buf.length : n;
	    buf.copy(ret, ret.length - n, 0, nb);
	    n -= nb;
	    if (n === 0) {
	      if (nb === buf.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = buf.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	function endReadable(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

	  if (!state.endEmitted) {
	    state.ended = true;
	    nextTick(endReadableNT, state, stream);
	  }
	}

	function endReadableNT(state, stream) {
	  // Check that we didn't get one last unshift.
	  if (!state.endEmitted && state.length === 0) {
	    state.endEmitted = true;
	    stream.readable = false;
	    stream.emit('end');
	  }
	}

	function forEach(xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	function indexOf(xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}

	// A bit simpler than readable streams.
	// Implement an async ._write(chunk, encoding, cb), and it'll handle all
	// the drain event emission and buffering.

	Writable.WritableState = WritableState;
	inherits$1(Writable, EventEmitter);

	function nop() {}

	function WriteReq(chunk, encoding, cb) {
	  this.chunk = chunk;
	  this.encoding = encoding;
	  this.callback = cb;
	  this.next = null;
	}

	function WritableState(options, stream) {
	  Object.defineProperty(this, 'buffer', {
	    get: deprecate(function () {
	      return this.getBuffer();
	    }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
	  });
	  options = options || {};

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

	  // cast to ints.
	  this.highWaterMark = ~ ~this.highWaterMark;

	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function (er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.bufferedRequest = null;
	  this.lastBufferedRequest = null;

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;

	  // count buffered requests
	  this.bufferedRequestCount = 0;

	  // allocate the first CorkedRequest, there is always
	  // one allocated and free to use, and we maintain at most two
	  this.corkedRequestsFree = new CorkedRequest(this);
	}

	WritableState.prototype.getBuffer = function writableStateGetBuffer() {
	  var current = this.bufferedRequest;
	  var out = [];
	  while (current) {
	    out.push(current);
	    current = current.next;
	  }
	  return out;
	};
	function Writable(options) {

	  // Writable ctor is applied to Duplexes, though they're not
	  // instanceof Writable, they're instanceof Readable.
	  if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

	  this._writableState = new WritableState(options, this);

	  // legacy.
	  this.writable = true;

	  if (options) {
	    if (typeof options.write === 'function') this._write = options.write;

	    if (typeof options.writev === 'function') this._writev = options.writev;
	  }

	  EventEmitter.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function () {
	  this.emit('error', new Error('Cannot pipe, not readable'));
	};

	function writeAfterEnd(stream, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  nextTick(cb, er);
	}

	// If we get something that is not a buffer, string, null, or undefined,
	// and we're not in objectMode, then that's an error.
	// Otherwise stream chunks are all considered to be of length=1, and the
	// watermarks determine how many objects to keep in the buffer, rather than
	// how many bytes or characters.
	function validChunk(stream, state, chunk, cb) {
	  var valid = true;
	  var er = false;
	  // Always throw error if a null is written
	  // if we are not in object mode then throw
	  // if it is not a buffer, string, or undefined.
	  if (chunk === null) {
	    er = new TypeError('May not write null values to stream');
	  } else if (!Buffer$1.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  if (er) {
	    stream.emit('error', er);
	    nextTick(cb, er);
	    valid = false;
	  }
	  return valid;
	}

	Writable.prototype.write = function (chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;

	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (Buffer$1.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

	  if (typeof cb !== 'function') cb = nop;

	  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer(this, state, chunk, encoding, cb);
	  }

	  return ret;
	};

	Writable.prototype.cork = function () {
	  var state = this._writableState;

	  state.corked++;
	};

	Writable.prototype.uncork = function () {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;

	    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
	  }
	};

	Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
	  // node::ParseEncoding() requires lower case.
	  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
	  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
	  this._writableState.defaultEncoding = encoding;
	  return this;
	};

	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
	    chunk = Buffer$1.from(chunk, encoding);
	  }
	  return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, chunk, encoding, cb) {
	  chunk = decodeChunk(state, chunk, encoding);

	  if (Buffer$1.isBuffer(chunk)) encoding = 'buffer';
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret) state.needDrain = true;

	  if (state.writing || state.corked) {
	    var last = state.lastBufferedRequest;
	    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
	    if (last) {
	      last.next = state.lastBufferedRequest;
	    } else {
	      state.bufferedRequest = state.lastBufferedRequest;
	    }
	    state.bufferedRequestCount += 1;
	  } else {
	    doWrite(stream, state, false, len, chunk, encoding, cb);
	  }

	  return ret;
	}

	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	  --state.pendingcb;
	  if (sync) nextTick(cb, er);else cb(er);

	  stream._writableState.errorEmitted = true;
	  stream.emit('error', er);
	}

	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate(state);

	  if (er) onwriteError(stream, state, sync, er, cb);else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(state);

	    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
	      clearBuffer(stream, state);
	    }

	    if (sync) {
	      /*<replacement>*/
	        nextTick(afterWrite, stream, state, finished, cb);
	      /*</replacement>*/
	    } else {
	        afterWrite(stream, state, finished, cb);
	      }
	  }
	}

	function afterWrite(stream, state, finished, cb) {
	  if (!finished) onwriteDrain(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}

	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;
	  var entry = state.bufferedRequest;

	  if (stream._writev && entry && entry.next) {
	    // Fast case, write everything using _writev()
	    var l = state.bufferedRequestCount;
	    var buffer = new Array(l);
	    var holder = state.corkedRequestsFree;
	    holder.entry = entry;

	    var count = 0;
	    while (entry) {
	      buffer[count] = entry;
	      entry = entry.next;
	      count += 1;
	    }

	    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

	    // doWrite is almost always async, defer these to save a bit of time
	    // as the hot path ends with doWrite
	    state.pendingcb++;
	    state.lastBufferedRequest = null;
	    if (holder.next) {
	      state.corkedRequestsFree = holder.next;
	      holder.next = null;
	    } else {
	      state.corkedRequestsFree = new CorkedRequest(state);
	    }
	  } else {
	    // Slow case, write chunks one-by-one
	    while (entry) {
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;

	      doWrite(stream, state, false, len, chunk, encoding, cb);
	      entry = entry.next;
	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        break;
	      }
	    }

	    if (entry === null) state.lastBufferedRequest = null;
	  }

	  state.bufferedRequestCount = 0;
	  state.bufferedRequest = entry;
	  state.bufferProcessing = false;
	}

	Writable.prototype._write = function (chunk, encoding, cb) {
	  cb(new Error('not implemented'));
	};

	Writable.prototype._writev = null;

	Writable.prototype.end = function (chunk, encoding, cb) {
	  var state = this._writableState;

	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished) endWritable(this, state, cb);
	};

	function needFinish(state) {
	  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
	}

	function prefinish(stream, state) {
	  if (!state.prefinished) {
	    state.prefinished = true;
	    stream.emit('prefinish');
	  }
	}

	function finishMaybe(stream, state) {
	  var need = needFinish(state);
	  if (need) {
	    if (state.pendingcb === 0) {
	      prefinish(stream, state);
	      state.finished = true;
	      stream.emit('finish');
	    } else {
	      prefinish(stream, state);
	    }
	  }
	  return need;
	}

	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished) nextTick(cb);else stream.once('finish', cb);
	  }
	  state.ended = true;
	  stream.writable = false;
	}

	// It seems a linked list but it is not
	// there will be only 2 of these for each stream
	function CorkedRequest(state) {
	  var _this = this;

	  this.next = null;
	  this.entry = null;

	  this.finish = function (err) {
	    var entry = _this.entry;
	    _this.entry = null;
	    while (entry) {
	      var cb = entry.callback;
	      state.pendingcb--;
	      cb(err);
	      entry = entry.next;
	    }
	    if (state.corkedRequestsFree) {
	      state.corkedRequestsFree.next = _this;
	    } else {
	      state.corkedRequestsFree = _this;
	    }
	  };
	}

	inherits$1(Duplex, Readable);

	var keys = Object.keys(Writable.prototype);
	for (var v = 0; v < keys.length; v++) {
	  var method = keys[v];
	  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
	}
	function Duplex(options) {
	  if (!(this instanceof Duplex)) return new Duplex(options);

	  Readable.call(this, options);
	  Writable.call(this, options);

	  if (options && options.readable === false) this.readable = false;

	  if (options && options.writable === false) this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

	  this.once('end', onend);
	}

	// the no-half-open enforcer
	function onend() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended) return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  nextTick(onEndNT, this);
	}

	function onEndNT(self) {
	  self.end();
	}

	// a transform stream is a readable/writable stream where you do
	// something with the data.  Sometimes it's called a "filter",
	// but that's not a great name for it, since that implies a thing where
	// some bits pass through, and others are simply ignored.  (That would
	// be a valid example of a transform, of course.)
	//
	// While the output is causally related to the input, it's not a
	// necessarily symmetric or synchronous transformation.  For example,
	// a zlib stream might take multiple plain-text writes(), and then
	// emit a single compressed chunk some time in the future.
	//
	// Here's how this works:
	//
	// The Transform stream has all the aspects of the readable and writable
	// stream classes.  When you write(chunk), that calls _write(chunk,cb)
	// internally, and returns false if there's a lot of pending writes
	// buffered up.  When you call read(), that calls _read(n) until
	// there's enough pending readable data buffered up.
	//
	// In a transform stream, the written data is placed in a buffer.  When
	// _read(n) is called, it transforms the queued up data, calling the
	// buffered _write cb's as it consumes chunks.  If consuming a single
	// written chunk would result in multiple output chunks, then the first
	// outputted bit calls the readcb, and subsequent chunks just go into
	// the read buffer, and will cause it to emit 'readable' if necessary.
	//
	// This way, back-pressure is actually determined by the reading side,
	// since _read has to be called to start processing a new chunk.  However,
	// a pathological inflate type of transform can cause excessive buffering
	// here.  For example, imagine a stream where every byte of input is
	// interpreted as an integer from 0-255, and then results in that many
	// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
	// 1kb of data being output.  In this case, you could write a very small
	// amount of input, and end up with a very large amount of output.  In
	// such a pathological inflating mechanism, there'd be no way to tell
	// the system to stop doing the transform.  A single 4MB write could
	// cause the system to run out of memory.
	//
	// However, even in such a pathological case, only a single written chunk
	// would be consumed, and then the rest would wait (un-transformed) until
	// the results of the previous transformed chunk were consumed.

	inherits$1(Transform, Duplex);

	function TransformState(stream) {
	  this.afterTransform = function (er, data) {
	    return afterTransform(stream, er, data);
	  };

	  this.needTransform = false;
	  this.transforming = false;
	  this.writecb = null;
	  this.writechunk = null;
	  this.writeencoding = null;
	}

	function afterTransform(stream, er, data) {
	  var ts = stream._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (data !== null && data !== undefined) stream.push(data);

	  cb(er);

	  var rs = stream._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    stream._read(rs.highWaterMark);
	  }
	}
	function Transform(options) {
	  if (!(this instanceof Transform)) return new Transform(options);

	  Duplex.call(this, options);

	  this._transformState = new TransformState(this);

	  // when the writable side finishes, then flush out anything remaining.
	  var stream = this;

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  if (options) {
	    if (typeof options.transform === 'function') this._transform = options.transform;

	    if (typeof options.flush === 'function') this._flush = options.flush;
	  }

	  this.once('prefinish', function () {
	    if (typeof this._flush === 'function') this._flush(function (er) {
	      done(stream, er);
	    });else done(stream);
	  });
	}

	Transform.prototype.push = function (chunk, encoding) {
	  this._transformState.needTransform = false;
	  return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function (chunk, encoding, cb) {
	  throw new Error('Not implemented');
	};

	Transform.prototype._write = function (chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function (n) {
	  var ts = this._transformState;

	  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};

	function done(stream, er) {
	  if (er) return stream.emit('error', er);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  var ws = stream._writableState;
	  var ts = stream._transformState;

	  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

	  if (ts.transforming) throw new Error('Calling transform done when still transforming');

	  return stream.push(null);
	}

	inherits$1(PassThrough, Transform);
	function PassThrough(options) {
	  if (!(this instanceof PassThrough)) return new PassThrough(options);

	  Transform.call(this, options);
	}

	PassThrough.prototype._transform = function (chunk, encoding, cb) {
	  cb(null, chunk);
	};

	inherits$1(Stream, EventEmitter);
	Stream.Readable = Readable;
	Stream.Writable = Writable;
	Stream.Duplex = Duplex;
	Stream.Transform = Transform;
	Stream.PassThrough = PassThrough;

	// Backwards-compat with node 0.4.x
	Stream.Stream = Stream;

	// old-style streams.  Note that the pipe method (the only relevant
	// part of this class) is overridden in the Readable class.

	function Stream() {
	  EventEmitter.call(this);
	}

	Stream.prototype.pipe = function(dest, options) {
	  var source = this;

	  function ondata(chunk) {
	    if (dest.writable) {
	      if (false === dest.write(chunk) && source.pause) {
	        source.pause();
	      }
	    }
	  }

	  source.on('data', ondata);

	  function ondrain() {
	    if (source.readable && source.resume) {
	      source.resume();
	    }
	  }

	  dest.on('drain', ondrain);

	  // If the 'end' option is not supplied, dest.end() will be called when
	  // source gets the 'end' or 'close' events.  Only dest.end() once.
	  if (!dest._isStdio && (!options || options.end !== false)) {
	    source.on('end', onend);
	    source.on('close', onclose);
	  }

	  var didOnEnd = false;
	  function onend() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    dest.end();
	  }


	  function onclose() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    if (typeof dest.destroy === 'function') dest.destroy();
	  }

	  // don't leave dangling pipes when there are errors.
	  function onerror(er) {
	    cleanup();
	    if (EventEmitter.listenerCount(this, 'error') === 0) {
	      throw er; // Unhandled stream error in pipe.
	    }
	  }

	  source.on('error', onerror);
	  dest.on('error', onerror);

	  // remove all the event listeners that were added.
	  function cleanup() {
	    source.removeListener('data', ondata);
	    dest.removeListener('drain', ondrain);

	    source.removeListener('end', onend);
	    source.removeListener('close', onclose);

	    source.removeListener('error', onerror);
	    dest.removeListener('error', onerror);

	    source.removeListener('end', cleanup);
	    source.removeListener('close', cleanup);

	    dest.removeListener('close', cleanup);
	  }

	  source.on('end', cleanup);
	  source.on('close', cleanup);

	  dest.on('close', cleanup);

	  dest.emit('pipe', source);

	  // Allow for unix-like usage: A.pipe(B).pipe(C)
	  return dest;
	};

	var _polyfillNode_stream = /*#__PURE__*/Object.freeze({
		__proto__: null,
		Duplex: Duplex,
		PassThrough: PassThrough,
		Readable: Readable,
		Stream: Stream,
		Transform: Transform,
		Writable: Writable,
		default: Stream
	});

	var require$$2 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_stream);

	(function (module, exports) {
		(function (global, factory) {
		    factory(exports, require$$0) ;
		})(commonjsGlobal, (function (exports, require$$1) {
		    class App {
		        manifest;
		        _metadata;
		        constructor() { }
		        get servicePath() {
		            const dataSources = this.manifest['sap.app']?.['dataSources'];
		            const path = (dataSources['mainService'] ?? Object.values(dataSources)[0]).uri;
		            return path.endsWith('/') ? path : `${path}/`;
		        }
		        get componentId() {
		            return this.manifest?.['sap.app'].id || '';
		        }
		        get objectEntitySet() {
		            if (this.fe === 'v4') {
		                const targets = Object.values(this.manifest['sap.ui5']?.routing?.targets ?? {});
		                const listTarget = targets.find((target) => target.name === 'sap.fe.templates.ListReport');
		                return listTarget?.options?.settings?.entitySet;
		            }
		            else if (this.fe === 'v2') {
		                const pages = this.manifest['sap.ui.generic.app']?.pages;
		                return (Array.isArray(pages) ? pages : Object.values(pages))[0]?.entitySet;
		            }
		            else {
		                return '';
		            }
		        }
		        get filters() {
		            const metadata = this.getMetadata();
		            if (metadata) {
		                const entitySet = metadata.entitySets.find((entitySet) => entitySet.name === this.objectEntitySet);
		                return entitySet?.entityType.entityProperties
		                    .filter((property) => property.type.startsWith('Edm.')) // Filter Edm types
		                    .map(({ name, type }) => ({ name, type }));
		            }
		            return [];
		        }
		        get objectKeys() {
		            const metadata = this.getMetadata();
		            if (metadata) {
		                const entitySet = metadata.entitySets.find((entitySet) => entitySet.name === this.objectEntitySet);
		                return entitySet?.entityType.keys.map(({ name, type }) => ({ name, type }));
		            }
		            else {
		                return undefined;
		            }
		        }
		        get fe() {
		            if (!!this.manifest?.['sap.ui5']?.dependencies?.libs?.['sap.fe.templates']) {
		                return 'v4';
		            }
		            else if (!!this.manifest?.['sap.ui.generic.app']?.pages) {
		                return 'v2';
		            }
		            else {
		                return undefined;
		            }
		        }
		        addMetadata(metadata) {
		            this._metadata = metadata;
		        }
		        addManifest(manifest) {
		            this.manifest = manifest;
		        }
		        getMetadata() {
		            return this._metadata;
		        }
		        isUI5() {
		            return this.manifest['sap.ui5'] !== undefined;
		        }
		        isFE() {
		            return this.fe !== undefined;
		        }
		    }

		    var dist$3 = {};

		    var FilterBar = {};

		    var BaseDefinition = {};

		    var hasRequiredBaseDefinition;

		    function requireBaseDefinition () {
		    	if (hasRequiredBaseDefinition) return BaseDefinition;
		    	hasRequiredBaseDefinition = 1;

		    	Object.defineProperty(BaseDefinition, "__esModule", {
		    	  value: true
		    	});
		    	BaseDefinition.Placement = BaseDefinition.BaseDefinition = void 0;
		    	BaseDefinition.annotation = annotation;
		    	BaseDefinition.configurable = configurable;
		    	BaseDefinition.Placement = /*#__PURE__*/function (Placement) {
		    	  Placement["After"] = "After";
		    	  Placement["Before"] = "Before";
		    	  Placement["End"] = "End";
		    	  return Placement;
		    	}({});
		    	let BaseDefinition$1 = class BaseDefinition {
		    	  constructor(metaPath, configuration) {
		    	    this.annotationPath = metaPath?.getPath();
		    	    for (const configurablePropertiesKey in this.__configurableProperties) {
		    	      const configSettings = this.__configurableProperties[configurablePropertiesKey];
		    	      if (configSettings) {
		    	        const configurationValue = configuration[configSettings.aliasFor];
		    	        if (configurationValue !== undefined) {
		    	          this[configurablePropertiesKey] = configSettings.validator(configurationValue);
		    	        } else if (configSettings.defaultValue !== undefined) {
		    	          this[configurablePropertiesKey] = configSettings.defaultValue;
		    	        }
		    	      }
		    	    }
		    	    const targetObject = metaPath?.getTarget();
		    	    if (targetObject) {
		    	      for (const annotationPropertiesKey in this.__annotationProperties) {
		    	        const configSettings = this.__annotationProperties[annotationPropertiesKey];
		    	        if (configSettings) {
		    	          const configurationValue = targetObject.annotations._annotations?.[configSettings.term];
		    	          if (configurationValue !== undefined && configurationValue !== null) {
		    	            this[annotationPropertiesKey] = configurationValue.valueOf();
		    	          } else if (configSettings.defaultValue !== undefined) {
		    	            this[annotationPropertiesKey] = configSettings.defaultValue;
		    	          }
		    	        }
		    	      }
		    	    }
		    	  }
		    	  getConfiguration() {
		    	    const outObj = {};
		    	    for (const configurablePropertiesKey in this.__configurableProperties) {
		    	      const configSettings = this.__configurableProperties[configurablePropertiesKey];
		    	      if (configSettings) {
		    	        outObj[configSettings.aliasFor] = this[configurablePropertiesKey];
		    	      }
		    	    }
		    	    return outObj;
		    	  }
		    	};
		    	BaseDefinition.BaseDefinition = BaseDefinition$1;
		    	function noop(value) {
		    	  return value;
		    	}
		    	function configurable(propertyConfiguration = {}) {
		    	  return function (target, propertyKey, propertyDescriptor) {
		    	    const localPropertyConfiguration = {
		    	      name: propertyKey,
		    	      validator: propertyConfiguration.validator || noop,
		    	      aliasFor: propertyConfiguration.aliasFor || propertyKey,
		    	      defaultValue: propertyDescriptor.initializer?.()
		    	    };
		    	    const targetPrototype = target.constructor.prototype;
		    	    if (!targetPrototype.__configurableProperties) {
		    	      targetPrototype.__configurableProperties = {};
		    	    }
		    	    delete propertyDescriptor?.initializer;
		    	    targetPrototype.__configurableProperties[propertyKey] = localPropertyConfiguration;
		    	  };
		    	}
		    	function annotation(annotationConfiguration) {
		    	  return function (target, propertyKey, propertyDescriptor) {
		    	    const localAnnotationConfiguration = {
		    	      name: propertyKey,
		    	      term: annotationConfiguration.term,
		    	      defaultValue: propertyDescriptor.initializer?.()
		    	    };
		    	    const targetPrototype = target.constructor.prototype;
		    	    if (!targetPrototype.__annotationProperties) {
		    	      targetPrototype.__annotationProperties = {};
		    	    }
		    	    targetPrototype.__annotationProperties[propertyKey] = localAnnotationConfiguration;
		    	    delete propertyDescriptor.initializer;
		    	    return propertyDescriptor;
		    	  }; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
		    	}
		    	
		    	return BaseDefinition;
		    }

		    var EntitySet = {};

		    var hasRequiredEntitySet;

		    function requireEntitySet () {
		    	if (hasRequiredEntitySet) return EntitySet;
		    	hasRequiredEntitySet = 1;

		    	Object.defineProperty(EntitySet, "__esModule", {
		    	  value: true
		    	});
		    	EntitySet.default = void 0;
		    	var _BaseDefinition = requireBaseDefinition();
		    	class _EntitySet extends _BaseDefinition.BaseDefinition {
		    	  constructor(entitySet, entitySetConfiguration = {}) {
		    	    super(entitySet, entitySetConfiguration);
		    	    this.entitySet = entitySet;
		    	    this.entitySetConfiguration = entitySetConfiguration;
		    	  }
		    	  //
		    	  // @annotation({
		    	  // 	term: CapabilitiesAnnotationTerms.FilterRestrictions,
		    	  // 	processor: (filterRestrictions?: FilterRestrictions): Property[] => {
		    	  // 		const requiredProperties =
		    	  // 			filterRestrictions?.RequiredProperties ?? [];
		    	  // 		return requiredProperties
		    	  // 			.map((propertyPath) => {
		    	  // 				return propertyPath.$target;
		    	  // 			})
		    	  // 			.filter((property): property is Property => {
		    	  // 				return !!property;
		    	  // 			});
		    	  // 	}
		    	  // })
		    	  // requiredProperties: Property[];

		    	  /**
		    	   * Retrieves the required properties for the entity set.
		    	   */
		    	  getRequiredProperties() {
		    	    const requiredProperties = this.entitySet.getTarget().annotations.Capabilities?.FilterRestrictions?.RequiredProperties ?? [];
		    	    return requiredProperties.map(propertyPath => {
		    	      return propertyPath.$target;
		    	    }).filter(property => {
		    	      return !!property;
		    	    });
		    	  }

		    	  /**
		    	   * Retrieves the required properties for the entity set.
		    	   */
		    	  getNonFilterableProperties() {
		    	    const nonFilterableProperties = this.entitySet.getTarget().annotations.Capabilities?.FilterRestrictions?.NonFilterableProperties ?? [];
		    	    return nonFilterableProperties.map(propertyPath => {
		    	      return propertyPath.$target;
		    	    }).filter(property => {
		    	      return !!property;
		    	    });
		    	  }

		    	  /**
		    	   * Retrieves the required properties for the entity set.
		    	   * @param property
		    	   */
		    	  getAllowedFilterExpression(property) {
		    	    const filterExpressionRestrictions = this.entitySet.getTarget().annotations.Capabilities?.FilterRestrictions?.FilterExpressionRestrictions ?? [];
		    	    const propertyRestrictions = filterExpressionRestrictions.filter(filterExpressionRestriction => filterExpressionRestriction.Property?.$target === property);
		    	    return propertyRestrictions.map(propertyRestriction => {
		    	      return propertyRestriction.AllowedExpressions;
		    	    }).filter(propertyRestriction => {
		    	      return !!propertyRestriction;
		    	    });
		    	  }
		    	  isSearchAllowed() {
		    	    return !!this.entitySet.getTarget().annotations.Capabilities?.SearchRestrictions?.Searchable;
		    	  }
		    	}
		    	EntitySet.default = _EntitySet;
		    	
		    	return EntitySet;
		    }

		    var TypeGuards = {};

		    var hasRequiredTypeGuards;

		    function requireTypeGuards () {
		    	if (hasRequiredTypeGuards) return TypeGuards;
		    	hasRequiredTypeGuards = 1;

		    	Object.defineProperty(TypeGuards, "__esModule", {
		    	  value: true
		    	});
		    	TypeGuards.isAnnotationOfTerm = isAnnotationOfTerm;
		    	TypeGuards.isAnnotationOfType = isAnnotationOfType;
		    	TypeGuards.isAnnotationPath = isAnnotationPath;
		    	TypeGuards.isAnnotationTerm = isAnnotationTerm;
		    	TypeGuards.isComplexType = isComplexType;
		    	TypeGuards.isEntityContainer = isEntityContainer;
		    	TypeGuards.isEntitySet = isEntitySet;
		    	TypeGuards.isEntityType = isEntityType;
		    	TypeGuards.isMultipleNavigationProperty = isMultipleNavigationProperty;
		    	TypeGuards.isNavigationProperty = isNavigationProperty;
		    	TypeGuards.isPathAnnotationExpression = isPathAnnotationExpression;
		    	TypeGuards.isProperty = isProperty;
		    	TypeGuards.isPropertyPathExpression = isPropertyPathExpression;
		    	TypeGuards.isServiceObject = isServiceObject;
		    	TypeGuards.isSingleNavigationProperty = isSingleNavigationProperty;
		    	TypeGuards.isSingleton = isSingleton;
		    	TypeGuards.isTypeDefinition = isTypeDefinition;
		    	TypeGuards.isValidPropertyPathExpression = isValidPropertyPathExpression;
		    	/**
		    	 * Checks whether the argument is an annotation of the given type.
		    	 * @param potentialAnnotationType The annotation to check
		    	 * @param typeName The type to check for
		    	 * @returns Whether the argument is an annotation of the given type
		    	 */
		    	function isAnnotationOfType(potentialAnnotationType, typeName) {
		    	  if (Array.isArray(typeName)) {
		    	    return typeName.includes(potentialAnnotationType?.$Type);
		    	  }
		    	  return potentialAnnotationType?.$Type === typeName;
		    	}

		    	/**
		    	 * Checks whether the argument is an annotation of the given term.
		    	 * @param potentialAnnotation The annotation to check
		    	 * @param termName The term to check for
		    	 * @returns Whether the argument is an annotation of the given term
		    	 */
		    	function isAnnotationOfTerm(potentialAnnotation, termName) {
		    	  return potentialAnnotation.term === termName;
		    	}
		    	function isAnnotationTerm(potentialAnnotation) {
		    	  return potentialAnnotation.hasOwnProperty('term');
		    	}

		    	/**
		    	 * Checks whether the argument is a {@link ServiceObject}.
		    	 *
		    	 * @param serviceObject The object to be checked.
		    	 * @returns Whether the argument is a {@link ServiceObject}.
		    	 */
		    	function isServiceObject(serviceObject) {
		    	  return serviceObject?.hasOwnProperty('_type') ?? false;
		    	}

		    	/**
		    	 * Checks whether the argument is a {@link ComplexType}.
		    	 *
		    	 * @param serviceObject The object to be checked.
		    	 * @returns Whether the argument is a {@link ComplexType}.
		    	 */
		    	function isComplexType(serviceObject) {
		    	  return serviceObject._type === 'ComplexType';
		    	}

		    	/**
		    	 * Checks whether the argument is a {@link TypeDefinition}.
		    	 *
		    	 * @param serviceObject The object to be checked.
		    	 * @returns Whether the argument is a {@link TypeDefinition}.
		    	 */
		    	function isTypeDefinition(serviceObject) {
		    	  return serviceObject._type === 'TypeDefinition';
		    	}

		    	/**
		    	 * Checks whether the argument is an {@link EntityContainer}.
		    	 *
		    	 * @param serviceObject The object to be checked.
		    	 * @returns Whether the argument is an {@link EntityContainer}.
		    	 */
		    	function isEntityContainer(serviceObject) {
		    	  return serviceObject._type === 'EntityContainer';
		    	}

		    	/**
		    	 * Checks whether the argument is an {@link EntitySet}.
		    	 *
		    	 * @param serviceObject The object to be checked.
		    	 * @returns Whether the argument is an {@link EntitySet}.
		    	 */
		    	function isEntitySet(serviceObject) {
		    	  return serviceObject._type === 'EntitySet';
		    	}

		    	/**
		    	 * Checks whether the argument is a {@link Singleton}.
		    	 *
		    	 * @param serviceObject The object to be checked.
		    	 * @returns Whether the argument is a {@link Singleton}
		    	 */
		    	function isSingleton(serviceObject) {
		    	  return serviceObject._type === 'Singleton';
		    	}

		    	/**
		    	 * Checks whether the argument is an {@link EntityType}.
		    	 *
		    	 * @param serviceObject The object to be checked.
		    	 * @returns Whether the argument is an {@link EntityType}
		    	 */
		    	function isEntityType(serviceObject) {
		    	  return serviceObject._type === 'EntityType';
		    	}

		    	/**
		    	 * Checks whether the argument is a {@link Property}.
		    	 *
		    	 * @param serviceObject The object to be checked.
		    	 * @returns Whether the argument is a {@link Property}.
		    	 */
		    	function isProperty(serviceObject) {
		    	  return serviceObject._type === 'Property';
		    	}

		    	/**
		    	 * Checks whether the argument is a {@link NavigationProperty}.
		    	 *
		    	 * Hint: There are also the more specific functions {@link isSingleNavigationProperty} and {@link isMultipleNavigationProperty}. These can be
		    	 * used to check for to-one and to-many navigation properties, respectively.
		    	 *
		    	 * @param serviceObject The object to be checked.
		    	 * @returns Whether the argument is a {@link NavigationProperty}.
		    	 */
		    	function isNavigationProperty(serviceObject) {
		    	  return serviceObject._type === 'NavigationProperty';
		    	}

		    	/**
		    	 * Checks whether the argument is a {@link SingleNavigationProperty}.
		    	 *
		    	 * @param serviceObject The object to be checked.
		    	 * @returns Whether the argument is a {@link SingleNavigationProperty}.
		    	 */
		    	function isSingleNavigationProperty(serviceObject) {
		    	  return isNavigationProperty(serviceObject) && !serviceObject.isCollection;
		    	}

		    	/**
		    	 * Checks whether the argument is a {@link MultipleNavigationProperty}.
		    	 *
		    	 * @param serviceObject The object to be checked.
		    	 * @returns Whether the argument is a {@link MultipleNavigationProperty}.
		    	 */
		    	function isMultipleNavigationProperty(serviceObject) {
		    	  return isNavigationProperty(serviceObject) && serviceObject.isCollection;
		    	}

		    	/**
		    	 * Checks whether the argument is a {@link PathAnnotationExpression}.
		    	 *
		    	 * @param expression The object to be checked.
		    	 * @returns Whether the argument is a {@link PathAnnotationExpression}.
		    	 */
		    	function isPathAnnotationExpression(expression) {
		    	  return expression.type === 'Path';
		    	}

		    	/**
		    	 * Checks whether the argument is a {@link AnnotationPathExpression}.
		    	 *
		    	 * @param expression The object to be checked.
		    	 * @returns Whether the argument is a {@link AnnotationPathExpression}.
		    	 */
		    	function isAnnotationPath(expression) {
		    	  return expression.type == 'AnnotationPath';
		    	}

		    	/**
		    	 * Checks whether the argument is a {@link PropertyPath}.
		    	 *
		    	 * @param expression The object to be checked.
		    	 * @returns Whether the argument is a {@link PropertyPath}.
		    	 */
		    	function isPropertyPathExpression(expression) {
		    	  return expression?.type === 'PropertyPath';
		    	}
		    	/**
		    	 * Checks whether the argument is a {@link PropertyPath}.
		    	 *
		    	 * @param expression The object to be checked.
		    	 * @returns Whether the argument is a {@link PropertyPath}.
		    	 */
		    	function isValidPropertyPathExpression(expression) {
		    	  return expression.type === 'PropertyPath' && !!expression.$target;
		    	}
		    	
		    	return TypeGuards;
		    }

		    var hasRequiredFilterBar;

		    function requireFilterBar () {
		    	if (hasRequiredFilterBar) return FilterBar;
		    	hasRequiredFilterBar = 1;

		    	Object.defineProperty(FilterBar, "__esModule", {
		    	  value: true
		    	});
		    	FilterBar.default = FilterBar.FilterField = void 0;
		    	var _BaseDefinition = requireBaseDefinition();
		    	var _EntitySet2 = _interopRequireDefault(requireEntitySet());
		    	var _TypeGuards = requireTypeGuards();
		    	var _dec, _dec2, _dec3, _dec4, _dec5, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4;
		    	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
		    	function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
		    	function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = true), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
		    	let FilterField = FilterBar.FilterField = (_dec = (0, _BaseDefinition.configurable)(), _dec2 = (0, _BaseDefinition.configurable)(), _dec3 = (0, _BaseDefinition.configurable)(), _dec4 = (0, _BaseDefinition.configurable)(), _dec5 = (0, _BaseDefinition.configurable)(), _class = class FilterField extends _BaseDefinition.BaseDefinition {
		    	  get name() {
		    	    return this.filterFieldProperty.getTarget().name;
		    	  }
		    	  get isParameter() {
		    	    // The property is a parameter if the closest entity type has a ResultContext annotation
		    	    // This indicates that the entity type is a parametrized entity type with a result context
		    	    return !!this.filterFieldProperty.getClosestEntityType().annotations.Common?.ResultContext;
		    	  }
		    	  get label() {
		    	    return this.filterFieldProperty.getTarget().annotations.Common?.Label?.toString() ?? this.filterFieldProperty.getTarget().name;
		    	  }
		    	  constructor(filterFieldProperty, filterFieldConfiguration) {
		    	    super(filterFieldProperty, filterFieldConfiguration);
		    	    _initializerDefineProperty(this, "group", _descriptor, this);
		    	    _initializerDefineProperty(this, "groupLabel", _descriptor2, this);
		    	    _initializerDefineProperty(this, "visible", _descriptor3, this);
		    	    _initializerDefineProperty(this, "required", _descriptor4, this);
		    	    this.filterFieldProperty = filterFieldProperty;
		    	  }
		    	  getTarget() {
		    	    return this.filterFieldProperty.getTarget();
		    	  }
		    	}, _descriptor = _applyDecoratedDescriptor(_class.prototype, "group", [_dec], {
		    	  configurable: true,
		    	  enumerable: true,
		    	  writable: true,
		    	  initializer: null
		    	}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "groupLabel", [_dec2], {
		    	  configurable: true,
		    	  enumerable: true,
		    	  writable: true,
		    	  initializer: null
		    	}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "visible", [_dec3], {
		    	  configurable: true,
		    	  enumerable: true,
		    	  writable: true,
		    	  initializer: null
		    	}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "required", [_dec4], {
		    	  configurable: true,
		    	  enumerable: true,
		    	  writable: true,
		    	  initializer: null
		    	}), _applyDecoratedDescriptor(_class.prototype, "name", [_dec5], Object.getOwnPropertyDescriptor(_class.prototype, "name"), _class.prototype), _class);
		    	let FilterBar$1 = class FilterBar {
		    	  constructor(selectionFields, filterBarConfiguration, metaPath) {
		    	    this.selectionFields = selectionFields;
		    	    this.filterBarConfiguration = filterBarConfiguration;
		    	    this.metaPath = metaPath;
		    	  }
		    	  isParameterizedEntitySet() {
		    	    const target = this.metaPath.getTarget();
		    	    if (target._type === 'NavigationProperty' && target.containsTarget) {
		    	      return this.metaPath.getClosestEntitySet().entityType.annotations.Common?.ResultContext !== undefined;
		    	    }
		    	    return false;
		    	  }
		    	  getFilterGroups() {
		    	    const filterFacets = this.metaPath.getClosestEntityType().annotations.UI?.FilterFacets;
		    	    const filterFieldsGroup = {};
		    	    if (!filterFacets) {
		    	      const fieldGroups = Object.keys(this.metaPath.getClosestEntityType().annotations.UI ?? {}).filter(key => {
		    	        return key.startsWith('FieldGroup');
		    	      }).map(key => {
		    	        return this.metaPath.getClosestEntityType().annotations.UI?.[key];
		    	      });
		    	      for (const fieldGroup of fieldGroups) {
		    	        fieldGroup.Data.forEach(fieldGroupEntry => {
		    	          switch (fieldGroupEntry.$Type) {
		    	            case "com.sap.vocabularies.UI.v1.DataField":
		    	              {
		    	                const fieldGroupValue = fieldGroupEntry.Value;
		    	                if ((0, _TypeGuards.isPathAnnotationExpression)(fieldGroupValue) && fieldGroupValue.$target) {
		    	                  filterFieldsGroup[fieldGroupValue.$target.fullyQualifiedName] = {
		    	                    group: fieldGroup.fullyQualifiedName,
		    	                    groupLabel: fieldGroup.Label?.toString() ?? fieldGroup.annotations?.Common?.Label?.toString() ?? fieldGroup.qualifier
		    	                  };
		    	                }
		    	                break;
		    	              }
		    	          }
		    	        });
		    	      }
		    	    } else {
		    	      filterFacets.forEach(filterFacet => {
		    	        const filterFacetTarget = filterFacet.Target.$target;
		    	        if ((0, _TypeGuards.isAnnotationOfType)(filterFacetTarget, "com.sap.vocabularies.UI.v1.FieldGroupType")) {
		    	          filterFacetTarget.Data.forEach(fieldGroupEntry => {
		    	            switch (fieldGroupEntry.$Type) {
		    	              case "com.sap.vocabularies.UI.v1.DataField":
		    	                {
		    	                  const fieldGroupValue = fieldGroupEntry.Value;
		    	                  if ((0, _TypeGuards.isPathAnnotationExpression)(fieldGroupValue) && fieldGroupValue.$target) {
		    	                    filterFieldsGroup[fieldGroupValue.$target.fullyQualifiedName] = {
		    	                      group: filterFacet.ID?.toString(),
		    	                      groupLabel: filterFacet.Label?.toString()
		    	                    };
		    	                  }
		    	                  break;
		    	                }
		    	            }
		    	          });
		    	        }
		    	      });
		    	    }
		    	    return filterFieldsGroup;
		    	  }
		    	  getFilterFields() {
		    	    const filterGroups = this.getFilterGroups();
		    	    const consideredProperties = {};
		    	    let parameterizedFields = [];
		    	    if (this.isParameterizedEntitySet()) {
		    	      const parametrizedEntitySetMetaPath = this.metaPath.getMetaPathForClosestEntitySet();
		    	      parameterizedFields = parametrizedEntitySetMetaPath.getClosestEntityType().entityProperties.map(property => {
		    	        const metaPathForProperty = parametrizedEntitySetMetaPath.getMetaPathForPath(property.name);
		    	        if (metaPathForProperty) {
		    	          consideredProperties[metaPathForProperty.getTarget().fullyQualifiedName] = true;
		    	          return new FilterField(metaPathForProperty, {
		    	            group: filterGroups[metaPathForProperty.getTarget().fullyQualifiedName]?.group,
		    	            groupLabel: filterGroups[metaPathForProperty.getTarget().fullyQualifiedName]?.groupLabel,
		    	            visible: true,
		    	            required: true,
		    	            isParameter: true
		    	          });
		    	        }
		    	      }).filter(field => {
		    	        return !!field;
		    	      });
		    	    }
		    	    const requiredProperties = new _EntitySet2.default(this.metaPath).getRequiredProperties();
		    	    const fromSelectionField = this.selectionFields.filter(_TypeGuards.isValidPropertyPathExpression).map(field => {
		    	      const metaPathForProperty = this.metaPath.getMetaPathForPath(field.value);
		    	      if (metaPathForProperty && !consideredProperties[metaPathForProperty.getTarget().fullyQualifiedName]) {
		    	        consideredProperties[metaPathForProperty.getTarget().fullyQualifiedName] = true;
		    	        return new FilterField(metaPathForProperty, {
		    	          group: filterGroups[metaPathForProperty.getTarget().fullyQualifiedName]?.group,
		    	          groupLabel: filterGroups[metaPathForProperty.getTarget().fullyQualifiedName]?.groupLabel,
		    	          visible: true,
		    	          required: requiredProperties.includes(metaPathForProperty.getTarget())
		    	        });
		    	      }
		    	    }).filter(field => {
		    	      return !!field;
		    	    });
		    	    const nonFilterableProperties = new _EntitySet2.default(this.metaPath).getNonFilterableProperties();
		    	    this.metaPath.getClosestEntityType().entityProperties.forEach(property => {
		    	      if (!consideredProperties[property.fullyQualifiedName] && !nonFilterableProperties.includes(property) && property.targetType === undefined && property.annotations.UI?.Hidden?.valueOf() !== true) {
		    	        consideredProperties[property.fullyQualifiedName] = true;
		    	        fromSelectionField.push(new FilterField(this.metaPath.getMetaPathForPath(property.name), {
		    	          group: filterGroups[property.fullyQualifiedName]?.group,
		    	          groupLabel: filterGroups[property.fullyQualifiedName]?.groupLabel,
		    	          visible: false
		    	        }));
		    	      }
		    	    });
		    	    return [...parameterizedFields, ...fromSelectionField];
		    	  }
		    	  isSearchSupported() {
		    	    return new _EntitySet2.default(this.metaPath).isSearchAllowed();
		    	  }
		    	};
		    	FilterBar.default = FilterBar$1;
		    	
		    	return FilterBar;
		    }

		    var DefinitionPage = {};

		    var _HeaderInfo = {};

		    var _DataField = {};

		    var Expression = {};

		    var hasRequiredExpression;

		    function requireExpression () {
		    	if (hasRequiredExpression) return Expression;
		    	hasRequiredExpression = 1;

		    	Object.defineProperty(Expression, "__esModule", {
		    	  value: true
		    	});
		    	Expression._checkExpressionsAreEqual = _checkExpressionsAreEqual;
		    	Expression.and = and;
		    	Expression.annotationApplyExpression = annotationApplyExpression;
		    	Expression.annotationIfExpression = annotationIfExpression;
		    	Expression.concat = concat;
		    	Expression.constant = constant;
		    	Expression.equal = equal;
		    	Expression.fn = fn;
		    	Expression.formatResult = formatResult;
		    	Expression.getExpressionFromAnnotation = getExpressionFromAnnotation;
		    	Expression.getFiscalType = void 0;
		    	Expression.greaterOrEqual = greaterOrEqual;
		    	Expression.greaterThan = greaterThan;
		    	Expression.hasUnresolvableExpression = hasUnresolvableExpression;
		    	Expression.ifElse = ifElse;
		    	Expression.isComplexTypeExpression = isComplexTypeExpression;
		    	Expression.isConstant = isConstant;
		    	Expression.isEmpty = isEmpty;
		    	Expression.isExpression = isExpression;
		    	Expression.isPathInModelExpression = isPathInModelExpression;
		    	Expression.isTruthy = isTruthy;
		    	Expression.isUndefinedExpression = isUndefinedExpression;
		    	Expression.length = length;
		    	Expression.lessOrEqual = lessOrEqual;
		    	Expression.lessThan = lessThan;
		    	Expression.not = not;
		    	Expression.notEqual = notEqual;
		    	Expression.objectPath = objectPath;
		    	Expression.or = or;
		    	Expression.pathInModel = pathInModel;
		    	Expression.ref = ref;
		    	Expression.resolveBindingString = resolveBindingString;
		    	Expression.transformRecursively = transformRecursively;
		    	Expression.unresolvableExpression = void 0;
		    	Expression.wrapPrimitive = wrapPrimitive;
		    	// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types

		    	/**
		    	 */

		    	/**
		    	 * An expression that evaluates to type T.
		    	 *
		    	 */

		    	/**
		    	 * An expression that evaluates to type T, or a constant value of type T
		    	 */

		    	const unresolvableExpression = Expression.unresolvableExpression = {
		    	  _type: 'Unresolvable'
		    	};
		    	function hasUnresolvableExpression(...expressions) {
		    	  return expressions.find(expr => expr._type === 'Unresolvable') !== undefined;
		    	}
		    	/**
		    	 * Check two expressions for (deep) equality.
		    	 *
		    	 * @param a
		    	 * @param b
		    	 * @returns `true` if the two expressions are equal
		    	 */
		    	function _checkExpressionsAreEqual(a, b) {
		    	  if (!a || !b) {
		    	    return false;
		    	  }
		    	  if (a._type !== b._type) {
		    	    return false;
		    	  }
		    	  switch (a._type) {
		    	    case 'Unresolvable':
		    	      return false;
		    	    // Unresolvable is never equal to anything even itself
		    	    case 'Constant':
		    	    case 'EmbeddedBinding':
		    	    case 'EmbeddedExpressionBinding':
		    	      return a.value === b.value;
		    	    case 'Not':
		    	      return _checkExpressionsAreEqual(a.operand, b.operand);
		    	    case 'Truthy':
		    	      return _checkExpressionsAreEqual(a.operand, b.operand);
		    	    case 'Set':
		    	      return a.operator === b.operator && a.operands.length === b.operands.length && a.operands.every(expression => b.operands.some(otherExpression => _checkExpressionsAreEqual(expression, otherExpression)));
		    	    case 'IfElse':
		    	      return _checkExpressionsAreEqual(a.condition, b.condition) && _checkExpressionsAreEqual(a.onTrue, b.onTrue) && _checkExpressionsAreEqual(a.onFalse, b.onFalse);
		    	    case 'Comparison':
		    	      return a.operator === b.operator && _checkExpressionsAreEqual(a.operand1, b.operand1) && _checkExpressionsAreEqual(a.operand2, b.operand2);
		    	    case 'Concat':
		    	      {
		    	        const aExpressions = a.expressions;
		    	        const bExpressions = b.expressions;
		    	        if (aExpressions.length !== bExpressions.length) {
		    	          return false;
		    	        }
		    	        return aExpressions.every((expression, index) => {
		    	          return _checkExpressionsAreEqual(expression, bExpressions[index]);
		    	        });
		    	      }
		    	    case 'Length':
		    	      return _checkExpressionsAreEqual(a.pathInModel, b.pathInModel);
		    	    case 'PathInModel':
		    	      return a.modelName === b.modelName && a.path === b.path && a.targetEntitySet === b.targetEntitySet;
		    	    case 'Formatter':
		    	      return a.fn === b.fn && a.parameters.length === b.parameters.length && a.parameters.every((value, index) => _checkExpressionsAreEqual(b.parameters[index], value));
		    	    case 'ComplexType':
		    	      return a.type === b.type && a.bindingParameters.length === b.bindingParameters.length && a.bindingParameters.every((value, index) => _checkExpressionsAreEqual(b.bindingParameters[index], value));
		    	    case 'Function':
		    	      const otherFunction = b;
		    	      if (a.obj === undefined || otherFunction.obj === undefined) {
		    	        return a.obj === otherFunction;
		    	      }
		    	      return a.fn === otherFunction.fn && _checkExpressionsAreEqual(a.obj, otherFunction.obj) && a.parameters.length === otherFunction.parameters.length && a.parameters.every((value, index) => _checkExpressionsAreEqual(otherFunction.parameters[index], value));
		    	    case 'Ref':
		    	      return a.ref === b.ref;
		    	  }
		    	  return false;
		    	}

		    	/**
		    	 * Converts a nested SetExpression by inlining operands of type SetExpression with the same operator.
		    	 *
		    	 * @param expression The expression to flatten
		    	 * @returns A new SetExpression with the same operator
		    	 */
		    	function flattenSetExpression(expression) {
		    	  return expression.operands.reduce((result, operand) => {
		    	    const candidatesForFlattening = operand._type === 'Set' && operand.operator === expression.operator ? operand.operands : [operand];
		    	    candidatesForFlattening.forEach(candidate => {
		    	      if (result.operands.every(e => !_checkExpressionsAreEqual(e, candidate))) {
		    	        result.operands.push(candidate);
		    	      }
		    	    });
		    	    return result;
		    	  }, {
		    	    _type: 'Set',
		    	    operator: expression.operator,
		    	    operands: []
		    	  });
		    	}

		    	/**
		    	 * Detects whether an array of boolean expressions contains an expression and its negation.
		    	 *
		    	 * @param expressions Array of expressions
		    	 * @returns `true` if the set of expressions contains an expression and its negation
		    	 */
		    	function hasOppositeExpressions(expressions) {
		    	  const negatedExpressions = expressions.map(not);
		    	  return expressions.some((expression, index) => {
		    	    for (let i = index + 1; i < negatedExpressions.length; i++) {
		    	      if (_checkExpressionsAreEqual(expression, negatedExpressions[i])) {
		    	        return true;
		    	      }
		    	    }
		    	    return false;
		    	  });
		    	}

		    	/**
		    	 * Logical `and` expression.
		    	 *
		    	 * The expression is simplified to false if this can be decided statically (that is, if one operand is a constant
		    	 * false or if the expression contains an operand and its negation).
		    	 *
		    	 * @param operands Expressions to connect by `and`
		    	 * @returns Expression evaluating to boolean
		    	 */
		    	function and(...operands) {
		    	  const expressions = flattenSetExpression({
		    	    operator: '&&',
		    	    operands: operands.map(wrapPrimitive)
		    	  }).operands;
		    	  if (hasUnresolvableExpression(...expressions)) {
		    	    return unresolvableExpression;
		    	  }
		    	  let isStaticFalse = false;
		    	  const nonTrivialExpression = expressions.filter(expression => {
		    	    if (isFalse(expression)) {
		    	      isStaticFalse = true;
		    	    }
		    	    return !isConstant(expression);
		    	  });
		    	  if (isStaticFalse) {
		    	    return constant(false);
		    	  } else if (nonTrivialExpression.length === 0) {
		    	    // Resolve the constant then
		    	    const isValid = expressions.reduce((result, expression) => result && isTrue(expression), true);
		    	    return constant(isValid);
		    	  } else if (nonTrivialExpression.length === 1) {
		    	    return nonTrivialExpression[0];
		    	  } else if (hasOppositeExpressions(nonTrivialExpression)) {
		    	    return constant(false);
		    	  } else {
		    	    return {
		    	      _type: 'Set',
		    	      operator: '&&',
		    	      operands: nonTrivialExpression
		    	    };
		    	  }
		    	}

		    	// let tracer: any;
		    	// export function traceExpression(inTracer: never): void {
		    	// 	tracer = inTracer;
		    	// }
		    	//
		    	// export function pickFirstNonNull(
		    	// 	...operands: ExpressionOrPrimitive<PrimitiveType>[]
		    	// ): ExpressionOrPrimitive<PrimitiveType> {
		    	// 	const result = operands.find((operand) => operand !== undefined);
		    	// 	if (tracer) {
		    	// 		tracer.logConditional("pickFirstNonNull", operands, result);
		    	// 	}
		    	// 	return result;
		    	// }
		    	/**
		    	 * Logical `or` expression.
		    	 *
		    	 * The expression is simplified to true if this can be decided statically (that is, if one operand is a constant
		    	 * true or if the expression contains an operand and its negation).
		    	 *
		    	 * @param operands Expressions to connect by `or`
		    	 * @returns Expression evaluating to boolean
		    	 */
		    	function or(...operands) {
		    	  const expressions = flattenSetExpression({
		    	    operator: '||',
		    	    operands: operands.map(wrapPrimitive)
		    	  }).operands;
		    	  if (hasUnresolvableExpression(...expressions)) {
		    	    return unresolvableExpression;
		    	  }
		    	  let isStaticTrue = false;
		    	  const nonTrivialExpression = expressions.filter(expression => {
		    	    if (isTrue(expression)) {
		    	      isStaticTrue = true;
		    	    }
		    	    return !isConstant(expression) || expression.value;
		    	  });
		    	  if (isStaticTrue) {
		    	    return constant(true);
		    	  } else if (nonTrivialExpression.length === 0) {
		    	    // Resolve the constant then
		    	    const isValid = expressions.reduce((result, expression) => result && isTrue(expression), true);
		    	    return constant(isValid);
		    	  } else if (nonTrivialExpression.length === 1) {
		    	    return nonTrivialExpression[0];
		    	  } else if (hasOppositeExpressions(nonTrivialExpression)) {
		    	    return constant(true);
		    	  } else {
		    	    return {
		    	      _type: 'Set',
		    	      operator: '||',
		    	      operands: nonTrivialExpression
		    	    };
		    	  }
		    	}

		    	/**
		    	 * Logical `not` operator.
		    	 *
		    	 * @param operand The expression to reverse
		    	 * @returns The resulting expression that evaluates to boolean
		    	 */
		    	function not(operand) {
		    	  operand = wrapPrimitive(operand);
		    	  if (hasUnresolvableExpression(operand)) {
		    	    return unresolvableExpression;
		    	  } else if (isConstant(operand)) {
		    	    return constant(!operand.value);
		    	  } else if (typeof operand === 'object' && operand._type === 'Set' && operand.operator === '||' && operand.operands.every(expression => isConstant(expression) || isComparison(expression))) {
		    	    return and(...operand.operands.map(expression => not(expression)));
		    	  } else if (typeof operand === 'object' && operand._type === 'Set' && operand.operator === '&&' && operand.operands.every(expression => isConstant(expression) || isComparison(expression))) {
		    	    return or(...operand.operands.map(expression => not(expression)));
		    	  } else if (isComparison(operand)) {
		    	    // Create the reverse comparison
		    	    switch (operand.operator) {
		    	      case '!==':
		    	        return {
		    	          ...operand,
		    	          operator: '==='
		    	        };
		    	      case '<':
		    	        return {
		    	          ...operand,
		    	          operator: '>='
		    	        };
		    	      case '<=':
		    	        return {
		    	          ...operand,
		    	          operator: '>'
		    	        };
		    	      case '===':
		    	        return {
		    	          ...operand,
		    	          operator: '!=='
		    	        };
		    	      case '>':
		    	        return {
		    	          ...operand,
		    	          operator: '<='
		    	        };
		    	      case '>=':
		    	        return {
		    	          ...operand,
		    	          operator: '<'
		    	        };
		    	    }
		    	  } else if (operand._type === 'Not') {
		    	    return operand.operand;
		    	  }
		    	  return {
		    	    _type: 'Not',
		    	    operand: operand
		    	  };
		    	}

		    	/**
		    	 * Evaluates whether a binding expression is equal to true with a loose equality.
		    	 *
		    	 * @param operand The expression to check
		    	 * @returns The resulting expression that evaluates to boolean
		    	 */
		    	function isTruthy(operand) {
		    	  if (isConstant(operand)) {
		    	    return constant(!!operand.value);
		    	  } else {
		    	    return {
		    	      _type: 'Truthy',
		    	      operand: operand
		    	    };
		    	  }
		    	}

		    	/**
		    	 * Creates a binding expression that will be evaluated by the corresponding model.
		    	 *
		    	 * @param path
		    	 * @param modelName
		    	 * @param visitedNavigationPaths
		    	 * @param pathVisitor
		    	 * @returns An expression representating that path in the model
		    	 */
		    	function objectPath(path, modelName, visitedNavigationPaths = [], pathVisitor) {
		    	  return pathInModel(path, modelName, visitedNavigationPaths, pathVisitor);
		    	}

		    	/**
		    	 * Creates a binding expression that will be evaluated by the corresponding model.
		    	 *
		    	 * @template TargetType
		    	 * @param path The path on the model
		    	 * @param [modelName] The name of the model
		    	 * @param [visitedNavigationPaths] The paths from the root entitySet
		    	 * @param [pathVisitor] A function to modify the resulting path
		    	 * @returns An expression representating that path in the model
		    	 */

		    	function pathInModel(path, modelName, visitedNavigationPaths = [], pathVisitor) {
		    	  if (path === undefined) {
		    	    return unresolvableExpression;
		    	  }
		    	  let targetPath;
		    	  if (pathVisitor) {
		    	    targetPath = pathVisitor(path);
		    	    if (targetPath === undefined) {
		    	      return unresolvableExpression;
		    	    }
		    	  } else {
		    	    const localPath = visitedNavigationPaths.concat();
		    	    localPath.push(path);
		    	    targetPath = localPath.join('/');
		    	  }
		    	  return {
		    	    _type: 'PathInModel',
		    	    modelName: modelName,
		    	    path: targetPath,
		    	    ownPath: path
		    	  };
		    	}
		    	/**
		    	 * Creates a constant expression based on a primitive value.
		    	 *
		    	 * @template T
		    	 * @param value The constant to wrap in an expression
		    	 * @returns The constant expression
		    	 */
		    	function constant(value) {
		    	  let constantValue;
		    	  if (typeof value === 'object' && value !== null && value !== undefined) {
		    	    if (Array.isArray(value)) {
		    	      constantValue = value.map(wrapPrimitive);
		    	    } else if (isPrimitiveObject(value)) {
		    	      constantValue = value.valueOf();
		    	    } else {
		    	      constantValue = Object.entries(value).reduce((plainExpression, [key, val]) => {
		    	        const wrappedValue = wrapPrimitive(val);
		    	        if (wrappedValue._type !== 'Constant' || wrappedValue.value !== undefined) {
		    	          plainExpression[key] = wrappedValue;
		    	        }
		    	        return plainExpression;
		    	      }, {});
		    	    }
		    	  } else {
		    	    constantValue = value;
		    	  }
		    	  return {
		    	    _type: 'Constant',
		    	    value: constantValue
		    	  };
		    	}
		    	function resolveBindingString(value, targetType) {
		    	  if (value !== undefined && typeof value === 'string' && value.startsWith('{')) {
		    	    const pathInModelRegex = /^{(.*)>(.+)}$/; // Matches model paths like "model>path" or ">path" (default model)
		    	    const pathInModelRegexMatch = pathInModelRegex.exec(value);
		    	    if (value.startsWith('{=')) {
		    	      // Expression binding, we can just remove the outer binding things
		    	      return {
		    	        _type: 'EmbeddedExpressionBinding',
		    	        value: value
		    	      };
		    	    } else if (pathInModelRegexMatch) {
		    	      return pathInModel(pathInModelRegexMatch[2] || '', pathInModelRegexMatch[1] || undefined);
		    	    } else {
		    	      return {
		    	        _type: 'EmbeddedBinding',
		    	        value: value
		    	      };
		    	    }
		    	  } else if (targetType === 'boolean' && typeof value === 'string' && (value === 'true' || value === 'false')) {
		    	    return constant(value === 'true');
		    	  } else if (targetType === 'number' && typeof value === 'string' && (!isNaN(Number(value)) || value === 'NaN')) {
		    	    return constant(Number(value));
		    	  } else {
		    	    return constant(value);
		    	  }
		    	}

		    	/**
		    	 * A named reference.
		    	 *
		    	 * @see fn
		    	 * @param reference Reference
		    	 * @returns The object reference binding part
		    	 */
		    	function ref(reference) {
		    	  return {
		    	    _type: 'Ref',
		    	    ref: reference
		    	  };
		    	}

		    	/**
		    	 * Wrap a primitive into a constant expression if it is not already an expression.
		    	 *
		    	 * @template T
		    	 * @param something The object to wrap in a Constant expression
		    	 * @returns Either the original object or the wrapped one depending on the case
		    	 */
		    	function wrapPrimitive(something) {
		    	  if (isExpression(something)) {
		    	    return something;
		    	  }
		    	  return constant(something);
		    	}

		    	/**
		    	 * Checks if the expression or value provided is a binding tooling expression or not.
		    	 *
		    	 * Every object having a property named `_type` of some value is considered an expression, even if there is actually
		    	 * no such expression type supported.
		    	 *
		    	 * @param expression
		    	 * @returns `true` if the expression is a binding toolkit expression
		    	 */
		    	function isExpression(expression) {
		    	  return expression?._type !== undefined;
		    	}

		    	/**
		    	 * Checks if the expression or value provided is constant or not.
		    	 *
		    	 * @template T The target type
		    	 * @param  maybeConstant The expression or primitive value that is to be checked
		    	 * @returns `true` if it is constant
		    	 */
		    	function isConstant(maybeConstant) {
		    	  return typeof maybeConstant !== 'object' || maybeConstant._type === 'Constant';
		    	}
		    	function isTrue(expression) {
		    	  return isConstant(expression) && expression.value === true;
		    	}
		    	function isFalse(expression) {
		    	  return isConstant(expression) && expression.value === false;
		    	}

		    	/**
		    	 * Checks if the expression or value provided is a path in model expression or not.
		    	 *
		    	 * @template T The target type
		    	 * @param  maybeBinding The expression or primitive value that is to be checked
		    	 * @returns `true` if it is a path in model expression
		    	 */
		    	function isPathInModelExpression(maybeBinding) {
		    	  return maybeBinding._type === 'PathInModel';
		    	}

		    	/**
		    	 * Checks if the expression or value provided is a complex type expression.
		    	 *
		    	 * @template T The target type
		    	 * @param  maybeBinding The expression or primitive value that is to be checked
		    	 * @returns `true` if it is a path in model expression
		    	 */
		    	function isComplexTypeExpression(maybeBinding) {
		    	  return maybeBinding._type === 'ComplexType';
		    	}

		    	/**
		    	 * Checks if the expression or value provided is a concat expression or not.
		    	 *
		    	 * @param expression
		    	 * @returns `true` if the expression is a ConcatExpression
		    	 */
		    	function isConcatExpression(expression) {
		    	  return expression._type === 'Concat';
		    	}

		    	/**
		    	 * Checks if the expression or value provided is a IfElse expression or not.
		    	 *
		    	 * @param expression
		    	 * @returns `true` if the expression is a IfElseExpression
		    	 */
		    	function isIfElseExpression(expression) {
		    	  return expression._type === 'IfElse';
		    	}

		    	/**
		    	 * Checks if the expression provided is a comparison or not.
		    	 *
		    	 * @template T The target type
		    	 * @param expression The expression
		    	 * @returns `true` if the expression is a ComparisonExpression
		    	 */
		    	function isComparison(expression) {
		    	  return expression._type === 'Comparison';
		    	}

		    	/**
		    	 * Checks whether the input parameter is a constant expression of type undefined.
		    	 *
		    	 * @param expression The input expression or object in general
		    	 * @returns `true` if the input is constant which has undefined for value
		    	 */
		    	function isUndefinedExpression(expression) {
		    	  const expressionAsExpression = expression;
		    	  return expressionAsExpression._type === 'Constant' && expressionAsExpression.value === undefined;
		    	}
		    	function isPrimitiveObject(objectType) {
		    	  switch (objectType.constructor.name) {
		    	    case 'String':
		    	    case 'Number':
		    	    case 'Boolean':
		    	      return true;
		    	    default:
		    	      return false;
		    	  }
		    	}
		    	/**
		    	 * Check if the passed annotation annotationValue is a ComplexAnnotationExpression.
		    	 *
		    	 * @template T The target type
		    	 * @param  annotationValue The annotation annotationValue to evaluate
		    	 * @returns `true` if the object is a {ComplexAnnotationExpression}
		    	 */
		    	function isComplexAnnotationExpression(annotationValue) {
		    	  return typeof annotationValue === 'object' && !isPrimitiveObject(annotationValue);
		    	}

		    	/**
		    	 * Generate the corresponding annotationValue for a given annotation annotationValue.
		    	 *
		    	 * @template T The target type
		    	 * @param annotationValue The source annotation annotationValue
		    	 * @param visitedNavigationPaths The path from the root entity set
		    	 * @param defaultValue Default value if the annotationValue is undefined
		    	 * @param pathVisitor A function to modify the resulting path
		    	 * @returns The annotationValue equivalent to that annotation annotationValue
		    	 */
		    	function getExpressionFromAnnotation(annotationValue, visitedNavigationPaths = [], defaultValue, pathVisitor) {
		    	  if (annotationValue === undefined) {
		    	    return wrapPrimitive(defaultValue);
		    	  }
		    	  annotationValue = annotationValue.valueOf();
		    	  if (!isComplexAnnotationExpression(annotationValue)) {
		    	    return constant(annotationValue);
		    	  }
		    	  switch (annotationValue.type) {
		    	    case 'Path':
		    	      return pathInModel(annotationValue.path, undefined, visitedNavigationPaths, pathVisitor);
		    	    case 'If':
		    	      return annotationIfExpression(annotationValue.$If, visitedNavigationPaths, pathVisitor);
		    	    case 'Not':
		    	      return not(parseAnnotationCondition(annotationValue.$Not, visitedNavigationPaths, pathVisitor));
		    	    case 'Eq':
		    	      return equal(parseAnnotationCondition(annotationValue.$Eq[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Eq[1], visitedNavigationPaths, pathVisitor));
		    	    case 'Ne':
		    	      return notEqual(parseAnnotationCondition(annotationValue.$Ne[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Ne[1], visitedNavigationPaths, pathVisitor));
		    	    case 'Gt':
		    	      return greaterThan(parseAnnotationCondition(annotationValue.$Gt[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Gt[1], visitedNavigationPaths, pathVisitor));
		    	    case 'Ge':
		    	      return greaterOrEqual(parseAnnotationCondition(annotationValue.$Ge[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Ge[1], visitedNavigationPaths, pathVisitor));
		    	    case 'Lt':
		    	      return lessThan(parseAnnotationCondition(annotationValue.$Lt[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Lt[1], visitedNavigationPaths, pathVisitor));
		    	    case 'Le':
		    	      return lessOrEqual(parseAnnotationCondition(annotationValue.$Le[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Le[1], visitedNavigationPaths, pathVisitor));
		    	    case 'Or':
		    	      return or(...annotationValue.$Or.map(function (orCondition) {
		    	        return parseAnnotationCondition(orCondition, visitedNavigationPaths, pathVisitor);
		    	      }));
		    	    case 'And':
		    	      return and(...annotationValue.$And.map(function (andCondition) {
		    	        return parseAnnotationCondition(andCondition, visitedNavigationPaths, pathVisitor);
		    	      }));
		    	    case 'Apply':
		    	      return annotationApplyExpression(annotationValue, visitedNavigationPaths, pathVisitor);
		    	    case 'Constant':
		    	      return constant(annotationValue.value);
		    	  }
		    	  return unresolvableExpression;
		    	}

		    	/**
		    	 * Parse the annotation condition into an expression.
		    	 *
		    	 * @template T The target type
		    	 * @param annotationValue The condition or value from the annotation
		    	 * @param visitedNavigationPaths The path from the root entity set
		    	 * @param pathVisitor A function to modify the resulting path
		    	 * @returns An equivalent expression
		    	 */
		    	function parseAnnotationCondition(annotationValue, visitedNavigationPaths = [], pathVisitor) {
		    	  if (annotationValue === null || typeof annotationValue !== 'object') {
		    	    return constant(annotationValue);
		    	  } else if (annotationValue.hasOwnProperty('$Or')) {
		    	    return or(...annotationValue.$Or.map(function (orCondition) {
		    	      return parseAnnotationCondition(orCondition, visitedNavigationPaths, pathVisitor);
		    	    }));
		    	  } else if (annotationValue.hasOwnProperty('$And')) {
		    	    return and(...annotationValue.$And.map(function (andCondition) {
		    	      return parseAnnotationCondition(andCondition, visitedNavigationPaths, pathVisitor);
		    	    }));
		    	  } else if (annotationValue.hasOwnProperty('$Not')) {
		    	    return not(parseAnnotationCondition(annotationValue.$Not, visitedNavigationPaths, pathVisitor));
		    	  } else if (annotationValue.hasOwnProperty('$Eq')) {
		    	    return equal(parseAnnotationCondition(annotationValue.$Eq[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Eq[1], visitedNavigationPaths, pathVisitor));
		    	  } else if (annotationValue.hasOwnProperty('$Ne')) {
		    	    return notEqual(parseAnnotationCondition(annotationValue.$Ne[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Ne[1], visitedNavigationPaths, pathVisitor));
		    	  } else if (annotationValue.hasOwnProperty('$Gt')) {
		    	    return greaterThan(parseAnnotationCondition(annotationValue.$Gt[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Gt[1], visitedNavigationPaths, pathVisitor));
		    	  } else if (annotationValue.hasOwnProperty('$Ge')) {
		    	    return greaterOrEqual(parseAnnotationCondition(annotationValue.$Ge[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Ge[1], visitedNavigationPaths, pathVisitor));
		    	  } else if (annotationValue.hasOwnProperty('$Lt')) {
		    	    return lessThan(parseAnnotationCondition(annotationValue.$Lt[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Lt[1], visitedNavigationPaths, pathVisitor));
		    	  } else if (annotationValue.hasOwnProperty('$Le')) {
		    	    return lessOrEqual(parseAnnotationCondition(annotationValue.$Le[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Le[1], visitedNavigationPaths, pathVisitor));
		    	  } else if (annotationValue.hasOwnProperty('$Path')) {
		    	    return pathInModel(annotationValue.$Path, undefined, visitedNavigationPaths, pathVisitor);
		    	  } else if (annotationValue.hasOwnProperty('Path')) {
		    	    return pathInModel(annotationValue.Path, undefined, visitedNavigationPaths, pathVisitor);
		    	  } else if (annotationValue.hasOwnProperty('$Apply')) {
		    	    return getExpressionFromAnnotation({
		    	      type: 'Apply',
		    	      $Function: annotationValue.$Function,
		    	      $Apply: annotationValue.$Apply
		    	    }, visitedNavigationPaths, undefined, pathVisitor);
		    	  } else if (annotationValue.hasOwnProperty('$If')) {
		    	    return getExpressionFromAnnotation({
		    	      type: 'If',
		    	      $If: annotationValue.$If
		    	    }, visitedNavigationPaths, undefined, pathVisitor);
		    	  } else if (annotationValue.hasOwnProperty('$EnumMember')) {
		    	    return constant(annotationValue.$EnumMember);
		    	  } else if (annotationValue.hasOwnProperty('String')) {
		    	    return constant(annotationValue.String);
		    	  } else if (annotationValue.hasOwnProperty('Bool')) {
		    	    return constant(annotationValue.Bool);
		    	  } else if (annotationValue.hasOwnProperty('Int')) {
		    	    return constant(annotationValue.Int);
		    	  } else if (annotationValue.hasOwnProperty('Decimal')) {
		    	    return constant(annotationValue.Decimal);
		    	  } else if (annotationValue.hasOwnProperty('type') && annotationValue.type === 'Null') {
		    	    return constant(null);
		    	  }
		    	  return constant(false);
		    	}

		    	/**
		    	 * Process the {IfAnnotationExpressionValue} into an expression.
		    	 *
		    	 * @template T The target type
		    	 * @param annotationValue An If expression returning the type T
		    	 * @param visitedNavigationPaths The path from the root entity set
		    	 * @param pathVisitor A function to modify the resulting path
		    	 * @returns The equivalent ifElse expression
		    	 */
		    	function annotationIfExpression(annotationValue, visitedNavigationPaths = [], pathVisitor) {
		    	  return ifElse(parseAnnotationCondition(annotationValue[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue[1], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue[2], visitedNavigationPaths, pathVisitor));
		    	}
		    	// This type is not recursively transformed from the metamodel content, as such we have some ugly things there

		    	function convertSubApplyParameters(applyParam) {
		    	  let applyParamConverted = applyParam;
		    	  if (applyParam.hasOwnProperty('$Path')) {
		    	    applyParamConverted = {
		    	      type: 'Path',
		    	      path: applyParam.$Path
		    	    };
		    	  } else if (applyParam.hasOwnProperty('Path')) {
		    	    applyParamConverted = {
		    	      type: 'Path',
		    	      path: applyParam.Path
		    	    };
		    	  } else if (applyParam.hasOwnProperty('$If')) {
		    	    applyParamConverted = {
		    	      type: 'If',
		    	      $If: applyParam.$If
		    	    };
		    	  } else if (applyParam.hasOwnProperty('$Apply')) {
		    	    applyParamConverted = {
		    	      type: 'Apply',
		    	      $Function: applyParam.$Function,
		    	      $Apply: applyParam.$Apply
		    	    };
		    	  }
		    	  return applyParamConverted;
		    	}
		    	function annotationApplyExpression(applyExpression, visitedNavigationPaths = [], pathVisitor) {
		    	  switch (applyExpression.$Function) {
		    	    case 'odata.concat':
		    	      return concat(...applyExpression.$Apply.map(applyParam => {
		    	        return getExpressionFromAnnotation(convertSubApplyParameters(applyParam), visitedNavigationPaths, undefined, pathVisitor);
		    	      }));
		    	    case 'odata.uriEncode':
		    	      const parameter = getExpressionFromAnnotation(convertSubApplyParameters(applyExpression.$Apply[0]), visitedNavigationPaths, undefined, pathVisitor);
		    	      // The second parameter for uriEncode is always a string since the target evaluation is against a formatValue call in ODataUtils which expect the target type as second parameter
		    	      return fn('odata.uriEncode', [parameter, 'Edm.String'], undefined, true);
		    	    case 'odata.fillUriTemplate':
		    	      const template = applyExpression.$Apply[0];
		    	      const templateParams = applyExpression.$Apply.slice(1);
		    	      const targetObject = {};
		    	      templateParams.forEach(applyParam => {
		    	        targetObject[applyParam.$Name] = getExpressionFromAnnotation(convertSubApplyParameters(applyParam.$LabeledElement), visitedNavigationPaths, undefined, pathVisitor);
		    	      });
		    	      return fn('odata.fillUriTemplate', [template, targetObject], undefined, true);
		    	  }
		    	  return unresolvableExpression;
		    	}

		    	/**
		    	 * Generic helper for the comparison operations (equal, notEqual, ...).
		    	 *
		    	 * @template T The target type
		    	 * @param operator The operator to apply
		    	 * @param leftOperand The operand on the left side of the operator
		    	 * @param rightOperand The operand on the right side of the operator
		    	 * @returns An expression representing the comparison
		    	 */
		    	function comparison(operator, leftOperand, rightOperand) {
		    	  const leftExpression = wrapPrimitive(leftOperand);
		    	  const rightExpression = wrapPrimitive(rightOperand);
		    	  if (hasUnresolvableExpression(leftExpression, rightExpression)) {
		    	    return unresolvableExpression;
		    	  }
		    	  if (isConstant(leftExpression) && isConstant(rightExpression)) {
		    	    switch (operator) {
		    	      case '!==':
		    	        return constant(leftExpression.value !== rightExpression.value);
		    	      case '===':
		    	        return constant(leftExpression.value === rightExpression.value);
		    	      case '<':
		    	        if (leftExpression.value === null || leftExpression.value === undefined || rightExpression.value === null || rightExpression.value === undefined) {
		    	          return constant(false);
		    	        }
		    	        return constant(leftExpression.value < rightExpression.value);
		    	      case '<=':
		    	        if (leftExpression.value === null || leftExpression.value === undefined || rightExpression.value === null || rightExpression.value === undefined) {
		    	          return constant(false);
		    	        }
		    	        return constant(leftExpression.value <= rightExpression.value);
		    	      case '>':
		    	        if (leftExpression.value === null || leftExpression.value === undefined || rightExpression.value === null || rightExpression.value === undefined) {
		    	          return constant(false);
		    	        }
		    	        return constant(leftExpression.value > rightExpression.value);
		    	      case '>=':
		    	        if (leftExpression.value === null || leftExpression.value === undefined || rightExpression.value === null || rightExpression.value === undefined) {
		    	          return constant(false);
		    	        }
		    	        return constant(leftExpression.value >= rightExpression.value);
		    	    }
		    	  } else {
		    	    return {
		    	      _type: 'Comparison',
		    	      operator: operator,
		    	      operand1: leftExpression,
		    	      operand2: rightExpression
		    	    };
		    	  }
		    	}

		    	/**
		    	 * Generic helper for the length of an expression.
		    	 *
		    	 * @param expression The input expression pointing to an array
		    	 * @param checkUndefined Is the array potentially undefined
		    	 * @returns An expression representing the length
		    	 */
		    	function length(expression, checkUndefined = false) {
		    	  if (expression._type === 'Unresolvable') {
		    	    return expression;
		    	  }
		    	  if (!checkUndefined) {
		    	    return {
		    	      _type: 'Length',
		    	      pathInModel: expression
		    	    };
		    	  }
		    	  return ifElse(equal(expression, undefined), -1, length(expression));
		    	}

		    	/**
		    	 * Comparison: "equal" (===).
		    	 *
		    	 * @template T The target type
		    	 * @param leftOperand The operand on the left side
		    	 * @param rightOperand The operand on the right side of the comparison
		    	 * @returns An expression representing the comparison
		    	 */
		    	function equal(leftOperand, rightOperand) {
		    	  const leftExpression = wrapPrimitive(leftOperand);
		    	  const rightExpression = wrapPrimitive(rightOperand);
		    	  if (hasUnresolvableExpression(leftExpression, rightExpression)) {
		    	    return unresolvableExpression;
		    	  }
		    	  if (_checkExpressionsAreEqual(leftExpression, rightExpression)) {
		    	    return constant(true);
		    	  }
		    	  function reduce(left, right) {
		    	    if (left._type === 'Comparison' && isTrue(right)) {
		    	      // compare(a, b) === true ~~> compare(a, b)
		    	      return left;
		    	    } else if (left._type === 'Comparison' && isFalse(right)) {
		    	      // compare(a, b) === false ~~> !compare(a, b)
		    	      return not(left);
		    	    } else if (left._type === 'IfElse' && _checkExpressionsAreEqual(left.onTrue, right)) {
		    	      // (if (x) { a } else { b }) === a ~~> x || (b === a)
		    	      return or(left.condition, equal(left.onFalse, right));
		    	    } else if (left._type === 'IfElse' && _checkExpressionsAreEqual(left.onFalse, right)) {
		    	      // (if (x) { a } else { b }) === b ~~> !x || (a === b)
		    	      return or(not(left.condition), equal(left.onTrue, right));
		    	    } else if (left._type === 'IfElse' && isConstant(left.onTrue) && isConstant(left.onFalse) && isConstant(right) && !_checkExpressionsAreEqual(left.onTrue, right) && !_checkExpressionsAreEqual(left.onFalse, right)) {
		    	      return constant(false);
		    	    }
		    	    return undefined;
		    	  }

		    	  // exploit symmetry: a === b <~> b === a
		    	  const reduced = reduce(leftExpression, rightExpression) ?? reduce(rightExpression, leftExpression);
		    	  return reduced ?? comparison('===', leftExpression, rightExpression);
		    	}

		    	/**
		    	 * Comparison: "not equal" (!==).
		    	 *
		    	 * @template T The target type
		    	 * @param leftOperand The operand on the left side
		    	 * @param rightOperand The operand on the right side of the comparison
		    	 * @returns An expression representing the comparison
		    	 */
		    	function notEqual(leftOperand, rightOperand) {
		    	  return not(equal(leftOperand, rightOperand));
		    	}

		    	/**
		    	 * Comparison: "greater or equal" (>=).
		    	 *
		    	 * @template T The target type
		    	 * @param leftOperand The operand on the left side
		    	 * @param rightOperand The operand on the right side of the comparison
		    	 * @returns An expression representing the comparison
		    	 */
		    	function greaterOrEqual(leftOperand, rightOperand) {
		    	  return comparison('>=', leftOperand, rightOperand);
		    	}

		    	/**
		    	 * Comparison: "greater than" (>).
		    	 *
		    	 * @template T The target type
		    	 * @param leftOperand The operand on the left side
		    	 * @param rightOperand The operand on the right side of the comparison
		    	 * @returns An expression representing the comparison
		    	 */
		    	function greaterThan(leftOperand, rightOperand) {
		    	  return comparison('>', leftOperand, rightOperand);
		    	}

		    	/**
		    	 * Comparison: "less or equal" (<=).
		    	 *
		    	 * @template T The target type
		    	 * @param leftOperand The operand on the left side
		    	 * @param rightOperand The operand on the right side of the comparison
		    	 * @returns An expression representing the comparison
		    	 */
		    	function lessOrEqual(leftOperand, rightOperand) {
		    	  return comparison('<=', leftOperand, rightOperand);
		    	}

		    	/**
		    	 * Comparison: "less than" (<).
		    	 *
		    	 * @template T The target type
		    	 * @param leftOperand The operand on the left side
		    	 * @param rightOperand The operand on the right side of the comparison
		    	 * @returns An expression representing the comparison
		    	 */
		    	function lessThan(leftOperand, rightOperand) {
		    	  return comparison('<', leftOperand, rightOperand);
		    	}

		    	/**
		    	 * If-then-else expression.
		    	 *
		    	 * Evaluates to onTrue if the condition evaluates to true, else evaluates to onFalse.
		    	 *
		    	 * @template T The target type
		    	 * @param condition The condition to evaluate
		    	 * @param onTrue Expression result if the condition evaluates to true
		    	 * @param onFalse Expression result if the condition evaluates to false
		    	 * @returns The expression that represents this conditional check
		    	 */
		    	function ifElse(condition, onTrue, onFalse) {
		    	  let conditionExpression = wrapPrimitive(condition);
		    	  let onTrueExpression = wrapPrimitive(onTrue);
		    	  let onFalseExpression = wrapPrimitive(onFalse);

		    	  // swap branches if the condition is a negation
		    	  if (conditionExpression._type === 'Not') {
		    	    // ifElse(not(X), a, b) --> ifElse(X, b, a)
		    	    [onTrueExpression, onFalseExpression] = [onFalseExpression, onTrueExpression];
		    	    conditionExpression = not(conditionExpression);
		    	  }

		    	  // inline nested if-else expressions: onTrue branch
		    	  // ifElse(X, ifElse(X, a, b), c) ==> ifElse(X, a, c)
		    	  if (onTrueExpression._type === 'IfElse' && _checkExpressionsAreEqual(conditionExpression, onTrueExpression.condition)) {
		    	    onTrueExpression = onTrueExpression.onTrue;
		    	  }

		    	  // inline nested if-else expressions: onFalse branch
		    	  // ifElse(X, a, ifElse(X, b, c)) ==> ifElse(X, a, c)
		    	  if (onFalseExpression._type === 'IfElse' && _checkExpressionsAreEqual(conditionExpression, onFalseExpression.condition)) {
		    	    onFalseExpression = onFalseExpression.onFalse;
		    	  }

		    	  // (if true then a else b)  ~~> a
		    	  // (if false then a else b) ~~> b
		    	  if (isConstant(conditionExpression)) {
		    	    return conditionExpression.value ? onTrueExpression : onFalseExpression;
		    	  }

		    	  // if (isConstantBoolean(onTrueExpression) || isConstantBoolean(onFalseExpression)) {
		    	  // 	return or(and(condition, onTrueExpression as Expression<boolean>), and(not(condition), onFalseExpression as Expression<boolean>)) as Expression<T>
		    	  // }

		    	  // (if X then a else a) ~~> a
		    	  if (_checkExpressionsAreEqual(onTrueExpression, onFalseExpression)) {
		    	    return onTrueExpression;
		    	  }

		    	  // if X then a else false ~~> X && a
		    	  if (isFalse(onFalseExpression)) {
		    	    return and(conditionExpression, onTrueExpression);
		    	  }

		    	  // if X then a else true ~~> !X || a
		    	  if (isTrue(onFalseExpression)) {
		    	    return or(not(conditionExpression), onTrueExpression);
		    	  }

		    	  // if X then false else a ~~> !X && a
		    	  if (isFalse(onTrueExpression)) {
		    	    return and(not(conditionExpression), onFalseExpression);
		    	  }

		    	  // if X then true else a ~~> X || a
		    	  if (isTrue(onTrueExpression)) {
		    	    return or(conditionExpression, onFalseExpression);
		    	  }
		    	  if (hasUnresolvableExpression(conditionExpression, onTrueExpression, onFalseExpression)) {
		    	    return unresolvableExpression;
		    	  }
		    	  if (isComplexTypeExpression(condition) || isComplexTypeExpression(onTrue) || isComplexTypeExpression(onFalse)) {
		    	    let pathIdx = 0;
		    	    const myIfElseExpression = formatResult([condition, onTrue, onFalse], 'sap.fe.core.formatters.StandardFormatter#ifElse');
		    	    const allParts = [];
		    	    transformRecursively(myIfElseExpression, 'PathInModel', constantPath => {
		    	      allParts.push(constantPath);
		    	      return pathInModel(`$${pathIdx++}`, '$');
		    	    }, true);
		    	    allParts.unshift(constant(JSON.stringify(myIfElseExpression)));
		    	    return formatResult(allParts, 'sap.fe.core.formatters.StandardFormatter#evaluateComplexExpression', undefined, true);
		    	  }
		    	  return {
		    	    _type: 'IfElse',
		    	    condition: conditionExpression,
		    	    onTrue: onTrueExpression,
		    	    onFalse: onFalseExpression
		    	  };
		    	}

		    	/**
		    	 * Checks whether the current expression has a reference to the default model (undefined).
		    	 *
		    	 * @param expression The expression to evaluate
		    	 * @returns `true` if there is a reference to the default context
		    	 */
		    	function hasReferenceToDefaultContext(expression) {
		    	  switch (expression._type) {
		    	    case 'Constant':
		    	    case 'Formatter':
		    	    case 'ComplexType':
		    	      return false;
		    	    case 'Set':
		    	      return expression.operands.some(hasReferenceToDefaultContext);
		    	    case 'PathInModel':
		    	      return expression.modelName === undefined;
		    	    case 'Comparison':
		    	      return hasReferenceToDefaultContext(expression.operand1) || hasReferenceToDefaultContext(expression.operand2);
		    	    case 'IfElse':
		    	      return hasReferenceToDefaultContext(expression.condition) || hasReferenceToDefaultContext(expression.onTrue) || hasReferenceToDefaultContext(expression.onFalse);
		    	    case 'Not':
		    	    case 'Truthy':
		    	      return hasReferenceToDefaultContext(expression.operand);
		    	    default:
		    	      return false;
		    	  }
		    	}

		    	// This is one case where any does make sense...
		    	// eslint-disable-next-line @typescript-eslint/no-explicit-any

		    	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		    	// @ts-ignore

		    	// So, this works but I cannot get it to compile :D, but it still does what is expected...

		    	/**
		    	 * A function reference or a function name.
		    	 */

		    	/**
		    	 * Function parameters, either derived from the function or an untyped array.
		    	 */

		    	/**
		    	 * Calls a formatter function to process the parameters.
		    	 * If requireContext is set to true and no context is passed a default context will be added automatically.
		    	 *
		    	 * @template T
		    	 * @template U
		    	 * @param parameters The list of parameter that should match the type and number of the formatter function
		    	 * @param formatterFunction The function to call
		    	 * @param [contextEntityType] If no parameter refers to the context then we use this information to add a reference to the keys from the entity type.
		    	 * @param [ignoreComplexType] Whether to ignore the transgformation to the StandardFormatter or not
		    	 * @returns The corresponding expression
		    	 */
		    	function formatResult(parameters, formatterFunction, contextEntityType, ignoreComplexType = false) {
		    	  const parameterExpressions = parameters.map(wrapPrimitive);
		    	  if (hasUnresolvableExpression(...parameterExpressions)) {
		    	    return unresolvableExpression;
		    	  }
		    	  if (contextEntityType) {
		    	    // Otherwise, if the context is required and no context is provided make sure to add the default binding
		    	    if (!parameterExpressions.some(hasReferenceToDefaultContext)) {
		    	      contextEntityType.keys.forEach(key => parameterExpressions.push(pathInModel(key.name, '')));
		    	    }
		    	  }
		    	  let functionName = '';
		    	  if (typeof formatterFunction === 'string') {
		    	    functionName = formatterFunction;
		    	  } else {
		    	    functionName = formatterFunction.__functionName;
		    	  }
		    	  // FormatterName can be of format sap.fe.core.xxx#methodName to have multiple formatter in one class
		    	  const [formatterClass, formatterName] = functionName.split('#');

		    	  // In some case we also cannot call directly a function because of too complex input, in that case we need to convert to a simpler function call
		    	  if (!ignoreComplexType && (parameterExpressions.some(isComplexTypeExpression) || parameterExpressions.some(isConcatExpression) || parameterExpressions.some(isIfElseExpression))) {
		    	    let pathIdx = 0;
		    	    const myFormatExpression = formatResult(parameterExpressions, functionName, undefined, true);
		    	    const allParts = [];
		    	    transformRecursively(myFormatExpression, 'PathInModel', constantPath => {
		    	      allParts.push(constantPath);
		    	      return pathInModel(`$${pathIdx++}`, '$');
		    	    }, true);
		    	    allParts.unshift(constant(JSON.stringify(myFormatExpression)));
		    	    return formatResult(allParts, 'sap.fe.core.formatters.StandardFormatter#evaluateComplexExpression', undefined, true);
		    	  } else if (!!formatterName && formatterName.length > 0) {
		    	    parameterExpressions.unshift(constant(formatterName));
		    	  }
		    	  return {
		    	    _type: 'Formatter',
		    	    fn: formatterClass,
		    	    parameters: parameterExpressions
		    	  };
		    	}
		    	const getFiscalType = function (property) {
		    	  if (property.annotations.Common?.IsFiscalYear) {
		    	    return "com.sap.vocabularies.Common.v1.IsFiscalYear";
		    	  }
		    	  if (property.annotations.Common?.IsFiscalPeriod) {
		    	    return "com.sap.vocabularies.Common.v1.IsFiscalPeriod";
		    	  }
		    	  if (property.annotations.Common?.IsFiscalYearPeriod) {
		    	    return "com.sap.vocabularies.Common.v1.IsFiscalYearPeriod";
		    	  }
		    	  if (property.annotations.Common?.IsFiscalQuarter) {
		    	    return "com.sap.vocabularies.Common.v1.IsFiscalQuarter";
		    	  }
		    	  if (property.annotations.Common?.IsFiscalYearQuarter) {
		    	    return "com.sap.vocabularies.Common.v1.IsFiscalYearQuarter";
		    	  }
		    	  if (property.annotations.Common?.IsFiscalWeek) {
		    	    return "com.sap.vocabularies.Common.v1.IsFiscalWeek";
		    	  }
		    	  if (property.annotations.Common?.IsFiscalYearWeek) {
		    	    return "com.sap.vocabularies.Common.v1.IsFiscalYearWeek";
		    	  }
		    	  if (property.annotations.Common?.IsDayOfFiscalYear) {
		    	    return "com.sap.vocabularies.Common.v1.IsDayOfFiscalYear";
		    	  }
		    	};

		    	/**
		    	 * Function call, optionally with arguments.
		    	 *
		    	 * @param func Function name or reference to function
		    	 * @param parameters Arguments
		    	 * @param on Object to call the function on
		    	 * @param isFormattingFn
		    	 * @returns Expression representing the function call (not the result of the function call!)
		    	 */
		    	Expression.getFiscalType = getFiscalType;
		    	function fn(func, parameters, on, isFormattingFn = false) {
		    	  const functionName = typeof func === 'string' ? func : func.__functionName;
		    	  return {
		    	    _type: 'Function',
		    	    obj: on !== undefined ? wrapPrimitive(on) : undefined,
		    	    fn: functionName,
		    	    isFormattingFn: isFormattingFn,
		    	    parameters: parameters.map(wrapPrimitive)
		    	  };
		    	}

		    	/**
		    	 * Shortcut function to determine if a binding value is null, undefined or empty.
		    	 *
		    	 * @param expression
		    	 * @returns A Boolean expression evaluating the fact that the current element is empty
		    	 */
		    	function isEmpty(expression) {
		    	  const aBindings = [];
		    	  transformRecursively(expression, 'PathInModel', expr => {
		    	    aBindings.push(or(equal(expr, ''), equal(expr, undefined), equal(expr, null)));
		    	    return expr;
		    	  });
		    	  return and(...aBindings);
		    	}
		    	function concat(
		    	//eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
		    	...inExpressions) {
		    	  const expressions = inExpressions.map(wrapPrimitive);
		    	  if (hasUnresolvableExpression(...expressions)) {
		    	    return unresolvableExpression;
		    	  }
		    	  if (expressions.every(isConstant)) {
		    	    return constant(expressions.reduce((concatenated, value) => {
		    	      if (value.value !== undefined && value.value !== null) {
		    	        return concatenated + value.value.toString();
		    	      }
		    	      return concatenated;
		    	    }, ''));
		    	  } else if (expressions.some(isComplexTypeExpression)) {
		    	    let pathIdx = 0;
		    	    const myConcatExpression = formatResult(expressions, 'sap.fe.core.formatters.StandardFormatter#concat', undefined, true);
		    	    const allParts = [];
		    	    transformRecursively(myConcatExpression, 'PathInModel', constantPath => {
		    	      allParts.push(constantPath);
		    	      return pathInModel(`$${pathIdx++}`, '$');
		    	    });
		    	    allParts.unshift(constant(JSON.stringify(myConcatExpression)));
		    	    return formatResult(allParts, 'sap.fe.core.formatters.StandardFormatter#evaluateComplexExpression', undefined, true);
		    	  }
		    	  return {
		    	    _type: 'Concat',
		    	    expressions: expressions
		    	  };
		    	}
		    	function transformRecursively(inExpression, expressionType, transformFunction, includeAllExpression = false) {
		    	  let expression = inExpression;
		    	  switch (expression._type) {
		    	    case 'Function':
		    	    case 'Formatter':
		    	      expression.parameters = expression.parameters.map(parameter => transformRecursively(parameter, expressionType, transformFunction, includeAllExpression));
		    	      break;
		    	    case 'Concat':
		    	      expression.expressions = expression.expressions.map(subExpression => transformRecursively(subExpression, expressionType, transformFunction, includeAllExpression));
		    	      expression = concat(...expression.expressions);
		    	      break;
		    	    case 'ComplexType':
		    	      expression.bindingParameters = expression.bindingParameters.map(bindingParameter => transformRecursively(bindingParameter, expressionType, transformFunction, includeAllExpression));
		    	      break;
		    	    case 'IfElse':
		    	      {
		    	        const onTrue = transformRecursively(expression.onTrue, expressionType, transformFunction, includeAllExpression);
		    	        const onFalse = transformRecursively(expression.onFalse, expressionType, transformFunction, includeAllExpression);
		    	        let condition = expression.condition;
		    	        if (includeAllExpression) {
		    	          condition = transformRecursively(expression.condition, expressionType, transformFunction, includeAllExpression);
		    	        }
		    	        expression = ifElse(condition, onTrue, onFalse);
		    	        break;
		    	      }
		    	    case 'Not':
		    	      if (includeAllExpression) {
		    	        const operand = transformRecursively(expression.operand, expressionType, transformFunction, includeAllExpression);
		    	        expression = not(operand);
		    	      }
		    	      break;
		    	    case 'Truthy':
		    	      break;
		    	    case 'Set':
		    	      if (includeAllExpression) {
		    	        const operands = expression.operands.map(operand => transformRecursively(operand, expressionType, transformFunction, includeAllExpression));
		    	        expression = expression.operator === '||' ? or(...operands) : and(...operands);
		    	      }
		    	      break;
		    	    case 'Comparison':
		    	      if (includeAllExpression) {
		    	        const operand1 = transformRecursively(expression.operand1, expressionType, transformFunction, includeAllExpression);
		    	        const operand2 = transformRecursively(expression.operand2, expressionType, transformFunction, includeAllExpression);
		    	        expression = comparison(expression.operator, operand1, operand2);
		    	      }
		    	      break;
		    	    case 'Constant':
		    	      {
		    	        const constantValue = expression.value;
		    	        if (typeof constantValue === 'object' && constantValue) {
		    	          Object.keys(constantValue).forEach(key => {
		    	            constantValue[key] = transformRecursively(constantValue[key], expressionType, transformFunction, includeAllExpression);
		    	          });
		    	        }
		    	        break;
		    	      }
		    	  }
		    	  if (expressionType === expression._type) {
		    	    expression = transformFunction(inExpression);
		    	  }
		    	  return expression;
		    	}
		    	
		    	return Expression;
		    }

		    var annotationUtils = {};

		    var Formatters = {};

		    var hasRequiredFormatters;

		    function requireFormatters () {
		    	if (hasRequiredFormatters) return Formatters;
		    	hasRequiredFormatters = 1;

		    	Object.defineProperty(Formatters, "__esModule", {
		    	  value: true
		    	});
		    	Formatters.default = Formatters.FORMATTERS_PATH = void 0;
		    	Formatters.formatCurrency = formatCurrency;
		    	Formatters.formatDate = formatDate;
		    	Formatters.formatWithBrackets = formatWithBrackets;
		    	Formatters.formatters = void 0;
		    	Formatters.overrideFormatters = overrideFormatters;
		    	/**
		    	 * Collection of table formatters.
		    	 * @param this The context
		    	 * @param name The inner function name
		    	 * @param args The inner function parameters
		    	 * @returns The value from the inner function
		    	 */
		    	const formatters = function (name, ...args) {
		    	  if (formatters.hasOwnProperty(name)) {
		    	    return formatters[name].apply(this, args);
		    	  } else {
		    	    return '';
		    	  }
		    	};
		    	Formatters.formatters = formatters;
		    	const FORMATTERS_PATH = Formatters.FORMATTERS_PATH = 'sap.fe.definition.formatters';
		    	function formatWithBrackets(firstPart, secondPart) {
		    	  if (firstPart && secondPart) {
		    	    return `${firstPart} (${secondPart})`;
		    	  } else {
		    	    return firstPart || secondPart || '';
		    	  }
		    	}
		    	formatWithBrackets.__functionName = `${FORMATTERS_PATH}#formatWithBrackets`;
		    	formatters.formatWithBrackets = formatWithBrackets;
		    	function formatDate(value, dateType) {
		    	  // thorow exception not implemented
		    	  throw new Error(`Formatter 'formatDate' is not implemented. Please provide a custom implementation.`);
		    	}
		    	formatDate.__functionName = `${FORMATTERS_PATH}#formatDate`;
		    	formatters.formatDate = formatDate;
		    	function formatCurrency(value, measure) {
		    	  // throw exception not implemented
		    	  throw new Error(`Formatter 'formatCurrency' is not implemented. Please provide a custom implementation.`);
		    	}
		    	formatCurrency.__functionName = `${FORMATTERS_PATH}#formatCurrency`;
		    	formatters.formatCurrency = formatCurrency;
		    	/**
		    	 * Overrides the default formatter functions with custom implementations.
		    	 *
		    	 * You can override the following formatter functions by providing them in the `overrides` parameter:
		    	 * - `formatDate`: Function to format date values.
		    	 * - `formatCurrency`: Function to format currency values.
		    	 *
		    	 * If an override is provided, it will replace the corresponding default formatter.
		    	 * The overridden function will also have a `__functionName` property set for debugging or tracing purposes.
		    	 *
		    	 * @param overrides - An object containing optional custom implementations for formatter functions.
		    	 */
		    	function overrideFormatters(overrides = {}) {
		    	  if (overrides.formatDate) {
		    	    overrides.formatDate.__functionName = `${FORMATTERS_PATH}#formatDate`;
		    	    formatters.formatDate = overrides.formatDate;
		    	  }
		    	  if (overrides.formatCurrency) {
		    	    overrides.formatCurrency.__functionName = `${FORMATTERS_PATH}#formatCurrency`;
		    	    formatters.formatCurrency = overrides.formatCurrency;
		    	  }
		    	}
		    	Formatters.default = formatters;
		    	
		    	return Formatters;
		    }

		    var hasRequiredAnnotationUtils;

		    function requireAnnotationUtils () {
		    	if (hasRequiredAnnotationUtils) return annotationUtils;
		    	hasRequiredAnnotationUtils = 1;

		    	Object.defineProperty(annotationUtils, "__esModule", {
		    	  value: true
		    	});
		    	annotationUtils.applyDisplayModeFormatting = applyDisplayModeFormatting;
		    	var _Expression = requireExpression();
		    	var _Formatters = _interopRequireDefault(requireFormatters());
		    	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
		    	/**
		    	 * Applies display mode formatting to a given expression based on the metadata path context.
		    	 *
		    	 * @param targetValue - The expression to transform.
		    	 * @param scopedContextMetaPath - The MetaPath instance to resolve property metadata.
		    	 * @returns A transformed expression with applied display mode formatting.
		    	 */
		    	function applyDisplayModeFormatting(targetValue, scopedContextMetaPath) {
		    	  return (0, _Expression.transformRecursively)(targetValue, 'PathInModel', value => {
		    	    const propertyMetaPath = scopedContextMetaPath.getMetaPathForPath(value.ownPath);
		    	    if (!propertyMetaPath) {
		    	      return _Expression.unresolvableExpression;
		    	    }
		    	    const targetProperty = propertyMetaPath.getTarget();
		    	    const measure = getMeasure(propertyMetaPath);
		    	    if (measure) {
		    	      return (0, _Expression.formatResult)([value, measure], _Formatters.default.formatCurrency);
		    	    }
		    	    if (isDate(propertyMetaPath)) {
		    	      return (0, _Expression.formatResult)([value, targetProperty.type], _Formatters.default.formatDate);
		    	    }
		    	    const displayMode = getDisplayMode(propertyMetaPath);
		    	    if (displayMode !== 'Value') {
		    	      const text = (0, _Expression.getExpressionFromAnnotation)(targetProperty.annotations.Common?.Text, propertyMetaPath.getNavigationProperties().map(navProp => navProp.name));
		    	      switch (displayMode) {
		    	        case 'Description':
		    	          return text;
		    	        case 'DescriptionValue':
		    	          return (0, _Expression.formatResult)([text, value], _Formatters.default.formatWithBrackets);
		    	        case 'ValueDescription':
		    	          return (0, _Expression.formatResult)([value, text], _Formatters.default.formatWithBrackets);
		    	      }
		    	    }
		    	    return value;
		    	  });
		    	}

		    	/**
		    	 * Determines the display mode for a property based on its text arrangement annotation.
		    	 * @param property - The MetaPath instance for the property.
		    	 * @returns The display mode: 'Description', 'Value', 'DescriptionValue', or 'ValueDescription'.
		    	 */
		    	function getDisplayMode(property) {
		    	  const currentEntityType = property.getClosestEntityType();
		    	  const textAnnotation = property.getTarget().annotations.Common?.Text;
		    	  const textArrangement = textAnnotation?.annotations?.UI?.TextArrangement ?? currentEntityType.annotations.UI?.TextArrangement;
		    	  let displayMode = textAnnotation ? 'DescriptionValue' : 'Value';
		    	  if (textAnnotation && textArrangement != null) {
		    	    switch (textArrangement.valueOf()) {
		    	      case "UI.TextArrangementType/TextOnly":
		    	        displayMode = 'Description';
		    	        break;
		    	      case "UI.TextArrangementType/TextLast":
		    	        displayMode = 'ValueDescription';
		    	        break;
		    	      case "UI.TextArrangementType/TextSeparate":
		    	        displayMode = 'Value';
		    	        break;
		    	      default:
		    	        displayMode = 'DescriptionValue';
		    	    }
		    	  }
		    	  return displayMode;
		    	}

		    	/**
		    	 * Checks if the given property is a date type.
		    	 * This includes Edm.Date, Edm.DateTime, and Edm.DateTimeOffset
		    	 *
		    	 * @param property property to check if it is a date
		    	 * @returns true if the property is a date, false otherwise
		    	 */
		    	function isDate(property) {
		    	  return property.getTarget().type === 'Edm.Date' || property.getTarget().type === 'Edm.DateTime' || property.getTarget().type === 'Edm.DateTimeOffset';
		    	}

		    	/**
		    	 * Checks if the given property has a Unit or ISOCurrency annotation and returns it.
		    	 *
		    	 * @param property property to get the measure for
		    	 * @returns the measure annotation or undefined
		    	 */
		    	function getMeasure(property) {
		    	  const measures = property.getTarget().annotations.Measures;
		    	  if (measures) {
		    	    const measure = measures.Unit ?? measures.ISOCurrency;
		    	    if (measure) {
		    	      return (0, _Expression.getExpressionFromAnnotation)(measure);
		    	    }
		    	  }
		    	  return undefined;
		    	}
		    	
		    	return annotationUtils;
		    }

		    var hasRequired_DataField;

		    function require_DataField () {
		    	if (hasRequired_DataField) return _DataField;
		    	hasRequired_DataField = 1;

		    	Object.defineProperty(_DataField, "__esModule", {
		    	  value: true
		    	});
		    	_DataField._DataField = void 0;
		    	var _Expression = requireExpression();
		    	var _TypeGuards = requireTypeGuards();
		    	var _annotationUtils = requireAnnotationUtils();
		    	let _DataField$1 = class _DataField {
		    	  constructor(dataField, scopedContextMetaPath) {
		    	    this.dataField = dataField;
		    	    this.scopedContextMetaPath = scopedContextMetaPath;
		    	  }
		    	  getValue() {
		    	    if (!(0, _TypeGuards.isAnnotationOfType)(this.dataField, "com.sap.vocabularies.UI.v1.DataFieldForAnnotation")) {
		    	      return (0, _Expression.getExpressionFromAnnotation)(this.dataField.Value);
		    	    }
		    	    return _Expression.unresolvableExpression;
		    	  }
		    	  getFormattedValue() {
		    	    if (!(0, _TypeGuards.isAnnotationOfType)(this.dataField, "com.sap.vocabularies.UI.v1.DataFieldForAnnotation")) {
		    	      const targetValue = (0, _Expression.getExpressionFromAnnotation)(this.dataField.Value, this.scopedContextMetaPath.getNavigationProperties().map(navProp => navProp.name));
		    	      return (0, _annotationUtils.applyDisplayModeFormatting)(targetValue, this.scopedContextMetaPath);
		    	    } else {
		    	      const annotation = this.dataField.Target.$target;
		    	      if ((0, _TypeGuards.isAnnotationOfType)(annotation, "com.sap.vocabularies.Communication.v1.ContactType")) {
		    	        const navigationProperty = this.dataField.Target.value.split('/')?.slice(0, -1)?.join() || '';
		    	        const firstName = annotation.fn;
		    	        return (0, _Expression.getExpressionFromAnnotation)(firstName, [navigationProperty]);
		    	      }
		    	    }
		    	    return _Expression.unresolvableExpression;
		    	  }
		    	  getLabel() {
		    	    let label = this.dataField.Label?.toString() ?? this.dataField.annotations?.Common?.Label?.toString();
		    	    if (!label) {
		    	      label = this.dataField.fullyQualifiedName; // Fallback to the fully qualified name
		    	      if ((0, _TypeGuards.isAnnotationOfType)(this.dataField, "com.sap.vocabularies.UI.v1.DataFieldForAnnotation")) {
		    	        const target = this.dataField.Target.$target;
		    	        if ((0, _TypeGuards.isAnnotationOfType)(target, "com.sap.vocabularies.UI.v1.FieldGroupType") && target.Label) {
		    	          label = target.Label.toString();
		    	        }
		    	      } else {
		    	        const valueTarget = this.dataField.Value;
		    	        if (valueTarget && (0, _TypeGuards.isPathAnnotationExpression)(valueTarget)) {
		    	          label = valueTarget.$target?.annotations.Common?.Label?.toString() ?? valueTarget.$target?.name ?? valueTarget.path;
		    	        }
		    	      }
		    	    }
		    	    return label;
		    	  }

		    	  /**
		    	   * Retrieve a property from the data field IF it can be easily determined (no complex exression)
		    	   */
		    	  getProperty() {
		    	    if (!(0, _TypeGuards.isAnnotationOfType)(this.dataField, "com.sap.vocabularies.UI.v1.DataFieldForAnnotation")) {
		    	      const valueTarget = this.dataField.Value;
		    	      if (valueTarget && (0, _TypeGuards.isPathAnnotationExpression)(valueTarget)) {
		    	        return valueTarget.$target;
		    	      }
		    	    }
		    	    return undefined;
		    	  }
		    	  getFullyQualifiedName() {
		    	    return this.dataField.fullyQualifiedName;
		    	  }
		    	  getVisible() {
		    	    if (!(0, _TypeGuards.isAnnotationOfType)(this.dataField, "com.sap.vocabularies.UI.v1.DataFieldForAnnotation")) {
		    	      const valueTarget = this.dataField.Value;
		    	      if (valueTarget && (0, _TypeGuards.isPathAnnotationExpression)(valueTarget)) {
		    	        const targetHiddenAnnotation = valueTarget.$target?.annotations?.UI?.Hidden;
		    	        if (targetHiddenAnnotation) {
		    	          return (0, _Expression.not)((0, _Expression.getExpressionFromAnnotation)(targetHiddenAnnotation, this.scopedContextMetaPath.getNavigationProperties().map(navProp => navProp.name)));
		    	        }
		    	      }
		    	    }
		    	    const fallbackHiddenAnnotation = this.dataField.annotations?.UI?.Hidden;
		    	    if (fallbackHiddenAnnotation) {
		    	      return (0, _Expression.not)((0, _Expression.getExpressionFromAnnotation)(fallbackHiddenAnnotation, this.scopedContextMetaPath.getNavigationProperties().map(navProp => navProp.name)));
		    	    }
		    	    return (0, _Expression.constant)(true);
		    	  }

		    	  /**
		    	   * Return the importance of the data field. If the importance is not defined, it defaults to `UI.ImportanceType/High`.
		    	   *
		    	   * @returns `string` - The `Importance` of the data field.
		    	   */
		    	  getImportance() {
		    	    return this.dataField.annotations?.UI?.Importance?.toString() ?? "UI.ImportanceType/High";
		    	  }
		    	};
		    	_DataField._DataField = _DataField$1;
		    	
		    	return _DataField;
		    }

		    var hasRequired_HeaderInfo;

		    function require_HeaderInfo () {
		    	if (hasRequired_HeaderInfo) return _HeaderInfo;
		    	hasRequired_HeaderInfo = 1;

		    	Object.defineProperty(_HeaderInfo, "__esModule", {
		    	  value: true
		    	});
		    	_HeaderInfo._HeaderInfo = void 0;
		    	var _DataField2 = require_DataField();
		    	let _HeaderInfo$1 = class _HeaderInfo {
		    	  constructor(info, pageMetaPath) {
		    	    this.info = info;
		    	    this.pageMetaPath = pageMetaPath;
		    	  }
		    	  getFullyQualifiedName() {
		    	    return this.info.fullyQualifiedName;
		    	  }
		    	  getTitle() {
		    	    return this.info.Title ? new _DataField2._DataField(this.info.Title, this.pageMetaPath) : undefined;
		    	  }
		    	  getDescription() {
		    	    return this.info.Description ? new _DataField2._DataField(this.info.Description, this.pageMetaPath) : undefined;
		    	  }
		    	  getTypeName() {
		    	    // eslint-disable-next-line @typescript-eslint/no-base-to-string
		    	    return this.info.TypeName.toString();
		    	  }
		    	};
		    	_HeaderInfo._HeaderInfo = _HeaderInfo$1;
		    	
		    	return _HeaderInfo;
		    }

		    var _Identification = {};

		    var hasRequired_Identification;

		    function require_Identification () {
		    	if (hasRequired_Identification) return _Identification;
		    	hasRequired_Identification = 1;

		    	Object.defineProperty(_Identification, "__esModule", {
		    	  value: true
		    	});
		    	_Identification._Identification = void 0;
		    	var _DataField2 = require_DataField();
		    	let _Identification$1 = class _Identification {
		    	  constructor(id, pageMetaPath) {
		    	    this.id = id;
		    	    this.pageMetaPath = pageMetaPath;
		    	  }
		    	  getDataFields(options) {
		    	    return this.id.filter(item => {
		    	      if (options?.restrictTypes && !options.restrictTypes.includes(item.$Type)) {
		    	        return false;
		    	      }
		    	      switch (item.$Type) {
		    	        case "com.sap.vocabularies.UI.v1.DataField":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldWithActionGroup":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldForActionGroup":
		    	          return options?.importance === undefined || options.importance.includes(item.annotations?.UI?.Importance?.toString());
		    	        default:
		    	          return false;
		    	      }
		    	    }).map(item => {
		    	      return new _DataField2._DataField(item, this.pageMetaPath);
		    	    });
		    	  }
		    	};
		    	_Identification._Identification = _Identification$1;
		    	
		    	return _Identification;
		    }

		    var _LineItem = {};

		    var hasRequired_LineItem;

		    function require_LineItem () {
		    	if (hasRequired_LineItem) return _LineItem;
		    	hasRequired_LineItem = 1;

		    	Object.defineProperty(_LineItem, "__esModule", {
		    	  value: true
		    	});
		    	_LineItem._LineItem = void 0;
		    	var _DataField2 = require_DataField();
		    	let _LineItem$1 = class _LineItem {
		    	  constructor(lineItem, pageMetaPath) {
		    	    this.lineItem = lineItem;
		    	    this.pageMetaPath = pageMetaPath;
		    	  }
		    	  static createDefault(pageMetaPath) {
		    	    const fakeLineItemAnnotation = pageMetaPath.getClosestEntityType().entityProperties.map(prop => {
		    	      if (prop.annotations.UI?.DataFieldDefault) {
		    	        return prop.annotations.UI.DataFieldDefault;
		    	      } else {
		    	        return {
		    	          $Type: "com.sap.vocabularies.UI.v1.DataField",
		    	          Value: {
		    	            type: 'Path',
		    	            path: prop.name,
		    	            $target: prop
		    	          }
		    	        };
		    	      }
		    	    });
		    	    fakeLineItemAnnotation.term = "com.sap.vocabularies.UI.v1.LineItem";
		    	    return new _LineItem(fakeLineItemAnnotation, pageMetaPath);
		    	  }
		    	  static fromSPV(spv, pageMetaPath) {
		    	    switch (spv?.term) {
		    	      case "com.sap.vocabularies.UI.v1.LineItem":
		    	        return new _LineItem(spv, pageMetaPath);
		    	      case "com.sap.vocabularies.UI.v1.PresentationVariant":
		    	        return new _LineItem(spv.Visualizations[0].$target, pageMetaPath);
		    	      case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
		    	        return new _LineItem(spv.PresentationVariant.Visualizations[0].$target, pageMetaPath);
		    	      case undefined:
		    	        return undefined;
		    	    }
		    	  }
		    	  getActions() {
		    	    return this.lineItem.filter(item => item.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction");
		    	  }
		    	  getHeaderActions() {
		    	    return this.getActions().filter(action => action.Determining === true);
		    	  }
		    	  getDataFields(options) {
		    	    return this.lineItem.filter(item => {
		    	      if (options?.restrictTypes && !options.restrictTypes.includes(item.$Type)) {
		    	        return false;
		    	      }
		    	      switch (item.$Type) {
		    	        case "com.sap.vocabularies.UI.v1.DataField":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldWithActionGroup":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
		    	        case "com.sap.vocabularies.UI.v1.DataFieldForActionGroup":
		    	          return options?.importance === undefined || options.importance.includes(item.annotations?.UI?.Importance?.toString());
		    	        default:
		    	          return false;
		    	      }
		    	    }).map(item => {
		    	      return new _DataField2._DataField(item, this.pageMetaPath);
		    	    });
		    	  }
		    	};
		    	_LineItem._LineItem = _LineItem$1;
		    	
		    	return _LineItem;
		    }

		    var hasRequiredDefinitionPage;

		    function requireDefinitionPage () {
		    	if (hasRequiredDefinitionPage) return DefinitionPage;
		    	hasRequiredDefinitionPage = 1;

		    	Object.defineProperty(DefinitionPage, "__esModule", {
		    	  value: true
		    	});
		    	DefinitionPage.DefinitionPage = void 0;
		    	var _FilterBar = _interopRequireDefault(requireFilterBar());
		    	var _HeaderInfo2 = require_HeaderInfo();
		    	var _Identification2 = require_Identification();
		    	var _LineItem2 = require_LineItem();
		    	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
		    	let DefinitionPage$1 = class DefinitionPage {
		    	  constructor(metaPath) {
		    	    this.metaPath = metaPath;
		    	  }
		    	  getMetaPath() {
		    	    return this.metaPath;
		    	  }

		    	  /**
		    	   * Gets the target entity set identification annotation if available.
		    	   *
		    	   * @returns Identification annotation wrapper
		    	   */
		    	  getIdentification() {
		    	    const targetEntityType = this.metaPath.getClosestEntityType();
		    	    const idAnnotation = targetEntityType.annotations.UI?.Identification;
		    	    if (idAnnotation) {
		    	      return new _Identification2._Identification(idAnnotation, this.metaPath);
		    	    } else {
		    	      return undefined;
		    	    }
		    	  }
		    	  getHeaderInfo() {
		    	    const targetEntityType = this.metaPath.getClosestEntityType();
		    	    const info = targetEntityType.annotations.UI?.HeaderInfo;
		    	    if (info) {
		    	      return new _HeaderInfo2._HeaderInfo(info, this.metaPath);
		    	    } else {
		    	      return undefined;
		    	    }
		    	  }

		    	  /**
		    	   * Retrieves the LineItem annotation for the target entity set
		    	   * @returns LineItem annotation
		    	   */
		    	  getTableVisualization() {
		    	    return _LineItem2._LineItem.fromSPV(this._getTableVisualizationAnnotation(), this.metaPath);
		    	  }
		    	  getFilterBarDefinition(filterBarConfiguration) {
		    	    const targetEntityType = this.metaPath.getClosestEntityType();
		    	    //this.tracer.markRequest("Page.getFilterBarDefinition", targetEntityType);
		    	    let selectionField = targetEntityType.annotations.UI?.SelectionFields;
		    	    if (!selectionField) {
		    	      selectionField = Object.assign([], {
		    	        term: "com.sap.vocabularies.UI.v1.SelectionFields"
		    	      });
		    	    }
		    	    //this.tracer.endMarkRequest("Page.getFilterBarDefinition");
		    	    return new _FilterBar.default(selectionField, filterBarConfiguration, this.metaPath);
		    	  }

		    	  /**
		    	   * Create a default LineItem annotation for the target entity type based on properties
		    	   * @returns LineItem annotation
		    	   */
		    	  createDefaultTableVisualization() {
		    	    return _LineItem2._LineItem.createDefault(this.metaPath);
		    	  }
		    	  getTitle() {
		    	    let value;
		    	    const headerInfo = this.getHeaderInfo();
		    	    value = headerInfo?.getTitle()?.getFormattedValue() ?? null;
		    	    if (!value || value._type === 'Unresolvable') {
		    	      const path = this.getMetaPath();
		    	      const entityType = path.getClosestEntityType();
		    	      const commonLabel = entityType.annotations.Common?.Label;
		    	      value = headerInfo?.getTypeName() || commonLabel?.toString() || path.getTarget().name;
		    	    }
		    	    return {
		    	      value
		    	    };
		    	  }
		    	  getDescription() {
		    	    let value;
		    	    const headerInfo = this.getHeaderInfo();
		    	    value = headerInfo?.getDescription()?.getValue() ?? null;
		    	    if (value?._type === 'Unresolvable') {
		    	      value = null;
		    	    }
		    	    return {
		    	      value
		    	    };
		    	  }
		    	  _getTableVisualizationAnnotation() {
		    	    const targetEntityType = this.metaPath.getClosestEntityType();
		    	    const spv = targetEntityType.annotations.UI?.SelectionPresentationVariant;
		    	    if (spv) {
		    	      if (spv.PresentationVariant.Visualizations.find(v => v.$target?.term === "com.sap.vocabularies.UI.v1.LineItem")) {
		    	        return spv;
		    	      }
		    	    }
		    	    const pv = targetEntityType.annotations.UI?.PresentationVariant;
		    	    if (pv?.Visualizations) {
		    	      if (pv.Visualizations.find(v => v.$target?.term === "com.sap.vocabularies.UI.v1.LineItem")) {
		    	        return pv;
		    	      }
		    	    }
		    	    return targetEntityType.annotations.UI?.LineItem;
		    	  }
		    	};
		    	DefinitionPage.DefinitionPage = DefinitionPage$1;
		    	
		    	return DefinitionPage;
		    }

		    var _DataPoint = {};

		    var hasRequired_DataPoint;

		    function require_DataPoint () {
		    	if (hasRequired_DataPoint) return _DataPoint;
		    	hasRequired_DataPoint = 1;

		    	Object.defineProperty(_DataPoint, "__esModule", {
		    	  value: true
		    	});
		    	_DataPoint._DataPoint = void 0;
		    	var _Expression = requireExpression();
		    	var _annotationUtils = requireAnnotationUtils();
		    	let _DataPoint$1 = class _DataPoint {
		    	  /**
		    	   * Constructs a _DataPoint instance.
		    	   * @param dataPoint - The DataPoint annotation object.
		    	   * @param scopedContextMetaPath - The MetaPath instance for resolving property metadata in context.
		    	   */
		    	  constructor(dataPoint, scopedContextMetaPath) {
		    	    this.dataPoint = dataPoint;
		    	    this.scopedContextMetaPath = scopedContextMetaPath;
		    	  }

		    	  /**
		    	   * Gets the title for the DataPoint, falling back to Description if Title is not present.
		    	   * @returns The title or description string, or undefined if neither is present.
		    	   */
		    	  getTitle() {
		    	    return this.dataPoint?.Title?.toString() ?? this.dataPoint?.Description?.toString();
		    	  }

		    	  /**
		    	   * Resolves the value expression for the DataPoint, applying display mode logic for referenced properties.
		    	   * @returns The computed value expression, possibly including description or value-description formatting.
		    	   */
		    	  getValue() {
		    	    const targetValue = (0, _Expression.getExpressionFromAnnotation)(this.dataPoint.Value, this.scopedContextMetaPath.getNavigationProperties().map(navProp => navProp.name));
		    	    return (0, _annotationUtils.applyDisplayModeFormatting)(targetValue, this.scopedContextMetaPath);
		    	  }

		    	  /**
		    	   * Gets the criticality expression for the DataPoint annotation.
		    	   * @returns The criticality expression.
		    	   */
		    	  getCriticality() {
		    	    return (0, _Expression.getExpressionFromAnnotation)(this.dataPoint.Criticality);
		    	  }
		    	};
		    	_DataPoint._DataPoint = _DataPoint$1;
		    	
		    	return _DataPoint;
		    }

		    var DefinitionContext = {};

		    var MetaPath = {};

		    var hasRequiredMetaPath;

		    function requireMetaPath () {
		    	if (hasRequiredMetaPath) return MetaPath;
		    	hasRequiredMetaPath = 1;

		    	Object.defineProperty(MetaPath, "__esModule", {
		    	  value: true
		    	});
		    	MetaPath.default = void 0;
		    	var _TypeGuards = requireTypeGuards();
		    	function enhancePath(sBasePath, sPathAddition) {
		    	  if (sPathAddition) {
		    	    if (sPathAddition.startsWith('/')) {
		    	      return sPathAddition;
		    	    } else if (sPathAddition.startsWith('@')) {
		    	      return sBasePath + sPathAddition;
		    	    } else if (!sBasePath.endsWith('/')) {
		    	      return sBasePath + '/' + sPathAddition;
		    	    } else {
		    	      return sBasePath + sPathAddition;
		    	    }
		    	  }
		    	  return sBasePath;
		    	}
		    	/**
		    	 *
		    	 */
		    	let MetaPath$1 = class MetaPath {
		    	  /**
		    	   * Create the MetaPath object.
		    	   * @param convertedMetadata The current model converter output
		    	   * @param metaPath The current object metaPath
		    	   * @param contextPath The current context
		    	   */
		    	  constructor(convertedMetadata, metaPath, contextPath) {
		    	    this.convertedMetadata = convertedMetadata;
		    	    this.metaPath = metaPath;
		    	    this.contextPath = contextPath;
		    	    this.navigationProperties = [];
		    	    this.contextNavigationProperties = [];
		    	    this.absolutePath = enhancePath(contextPath, metaPath);
		    	    this.relativePath = this.absolutePath.replace(contextPath, '');
		    	    if (this.relativePath.startsWith('/')) {
		    	      this.relativePath = this.relativePath.substring(1);
		    	    }
		    	    const resolvedMetaPath = this.convertedMetadata.resolvePath(this.absolutePath);
		    	    const resolvedContextPath = this.convertedMetadata.resolvePath(contextPath);
		    	    if (resolvedMetaPath.target === undefined || resolvedMetaPath.target === null) {
		    	      throw new Error(`No annotation target found for ${metaPath}`);
		    	    }
		    	    this.targetObject = resolvedMetaPath.target;
		    	    let rootEntitySet;
		    	    let currentEntitySet;
		    	    let currentEntityType;
		    	    let navigatedPaths = [];
		    	    resolvedMetaPath.objectPath.forEach(objectPart => {
		    	      if ((0, _TypeGuards.isServiceObject)(objectPart)) {
		    	        switch (objectPart._type) {
		    	          case 'NavigationProperty':
		    	            navigatedPaths.push(objectPart.name);
		    	            this.navigationProperties.push(objectPart);
		    	            currentEntityType = objectPart.targetType;
		    	            if (currentEntitySet?.navigationPropertyBinding.hasOwnProperty(navigatedPaths.join('/'))) {
		    	              currentEntitySet = currentEntitySet.navigationPropertyBinding[navigatedPaths.join('/')];
		    	              navigatedPaths = [];
		    	            }
		    	            break;
		    	          case 'EntitySet':
		    	            if (rootEntitySet === undefined) {
		    	              rootEntitySet = objectPart;
		    	            }
		    	            currentEntitySet = objectPart;
		    	            currentEntityType = currentEntitySet.entityType;
		    	            break;
		    	          case 'EntityType':
		    	            if (currentEntityType === undefined) {
		    	              currentEntityType = objectPart;
		    	            }
		    	            break;
		    	        }
		    	      }
		    	    });
		    	    resolvedContextPath.objectPath.forEach(objectPart => {
		    	      rootEntitySet = this.getResolvedContextPath(objectPart, currentEntityType, rootEntitySet);
		    	    });
		    	    if (rootEntitySet === undefined || currentEntityType === undefined) {
		    	      throw new Error("MetaPath doesn't contain an entitySet -> Should never happen");
		    	    }
		    	    this.serviceObjectPath = '/' + rootEntitySet.name;
		    	    if (this.navigationProperties.length) {
		    	      this.serviceObjectPath += '/' + this.navigationProperties.map(nav => nav.name).join('/');
		    	    }
		    	    this.rootEntitySet = rootEntitySet;
		    	    this.currentEntitySet = currentEntitySet;
		    	    this.currentEntityType = currentEntityType;
		    	  }
		    	  getResolvedContextPath(objectPart, currentEntityType, rootEntitySet) {
		    	    if ((0, _TypeGuards.isServiceObject)(objectPart)) {
		    	      switch (objectPart._type) {
		    	        case 'NavigationProperty':
		    	          this.contextNavigationProperties.push(objectPart);
		    	          break;
		    	        case 'EntitySet':
		    	          if (this.contextRootEntitySet === undefined) {
		    	            this.contextRootEntitySet = objectPart;
		    	          }
		    	          if (rootEntitySet === undefined && objectPart.entityType === currentEntityType) {
		    	            rootEntitySet = objectPart;
		    	          }
		    	          break;
		    	      }
		    	    }
		    	    return rootEntitySet;
		    	  }
		    	  getContextPath() {
		    	    return this.contextPath;
		    	  }

		    	  /**
		    	   * Retrieve the absolute path for this MetaPath.
		    	   * @param sPathPart The path to evaluate
		    	   * @returns The absolute path
		    	   */
		    	  getPath(sPathPart) {
		    	    return enhancePath(this.absolutePath, sPathPart);
		    	  }

		    	  /**
		    	   * Retrieve the path relative to the context for this MetaPath.
		    	   * @param sPathPart The path to evaluate
		    	   * @returns The relative path
		    	   */
		    	  getRelativePath(sPathPart) {
		    	    return enhancePath(this.relativePath, sPathPart);
		    	  }

		    	  /**
		    	   * Retrieve the typed target for this object call.
		    	   * @returns The typed target object
		    	   */
		    	  getTarget() {
		    	    return this.targetObject;
		    	  }

		    	  /**
		    	   * Retrieve the closest entityset in the path.
		    	   * @returns The closest entityset
		    	   */
		    	  getClosestEntitySet() {
		    	    let closestEntitySet = this.rootEntitySet;
		    	    for (const navigationProperty of this.navigationProperties) {
		    	      const navigationPropertyBindingElement = closestEntitySet.navigationPropertyBinding[navigationProperty.name];
		    	      if (navigationPropertyBindingElement) {
		    	        closestEntitySet = navigationPropertyBindingElement;
		    	      }
		    	    }
		    	    return closestEntitySet;
		    	  }
		    	  getClosestEntityType() {
		    	    let closestEntityType = this.rootEntitySet.entityType;
		    	    for (const navigationProperty of this.navigationProperties) {
		    	      closestEntityType = navigationProperty.targetType;
		    	    }
		    	    return closestEntityType;
		    	  }

		    	  /**
		    	   * Retrieve the closest entityset in the path.
		    	   * @returns The closest entityset
		    	   */
		    	  getContextClosestEntitySet() {
		    	    let closestEntitySet = this.contextRootEntitySet;
		    	    if (closestEntitySet === undefined) {
		    	      return closestEntitySet;
		    	    }
		    	    const nonNullEntitySet = closestEntitySet;
		    	    for (const navigationProperty of this.contextNavigationProperties) {
		    	      if (nonNullEntitySet.navigationPropertyBinding[navigationProperty.name]) {
		    	        closestEntitySet = nonNullEntitySet.navigationPropertyBinding[navigationProperty.name];
		    	      }
		    	    }
		    	    return closestEntitySet;
		    	  }
		    	  getNavigationProperties() {
		    	    return this.navigationProperties;
		    	  }
		    	  getMetaPathForClosestEntitySet() {
		    	    return new MetaPath(this.convertedMetadata, '', this.getClosestEntitySet().fullyQualifiedName);
		    	  }
		    	  getMetaPathForPath(targetPath) {
		    	    try {
		    	      return new MetaPath(this.convertedMetadata, enhancePath(this.serviceObjectPath, targetPath), this.contextPath);
		    	    } catch (_error) {
		    	      return undefined;
		    	    }
		    	  }
		    	  getMetaPathForObject(targetObject) {
		    	    if ((0, _TypeGuards.isAnnotationPath)(targetObject)) {
		    	      return this.getMetaPathForPath(targetObject.value);
		    	    } else if ((0, _TypeGuards.isPathAnnotationExpression)(targetObject)) {
		    	      return this.getMetaPathForPath(targetObject.path);
		    	    } else {
		    	      const metaPathApp = targetObject.fullyQualifiedName.replace(this.rootEntitySet.entityType.fullyQualifiedName, this.contextPath);
		    	      return new MetaPath(this.convertedMetadata, metaPathApp, this.contextPath);
		    	    }
		    	  }
		    	  getConvertedMetadata() {
		    	    return this.convertedMetadata;
		    	  }
		    	};
		    	MetaPath.default = MetaPath$1;
		    	
		    	return MetaPath;
		    }

		    var hasRequiredDefinitionContext;

		    function requireDefinitionContext () {
		    	if (hasRequiredDefinitionContext) return DefinitionContext;
		    	hasRequiredDefinitionContext = 1;

		    	Object.defineProperty(DefinitionContext, "__esModule", {
		    	  value: true
		    	});
		    	DefinitionContext.DefinitionContext = void 0;
		    	var _MetaPath = _interopRequireDefault(requireMetaPath());
		    	var _DefinitionPage = requireDefinitionPage();
		    	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
		    	let DefinitionContext$1 = class DefinitionContext {
		    	  constructor(convertedMetadata) {
		    	    this.convertedMetadata = convertedMetadata;
		    	  }
		    	  addApplicationManifest(manifest) {
		    	    this.manifest = manifest;
		    	  }
		    	  getEntitySets() {
		    	    return this.convertedMetadata.entitySets;
		    	  }
		    	  getEntitySet(entitySetName) {
		    	    return this.convertedMetadata.entitySets.by_name(entitySetName);
		    	  }
		    	  getRootEntitySet() {
		    	    if (this.manifest) {
		    	      // Use the ui5 routing config to identify the root entityset
		    	      const initialRoutePattern = ':?query:';
		    	      const initialRoute = (this.manifest['sap.ui5']?.routing?.routes).find(r => r.pattern === initialRoutePattern);
		    	      if (initialRoute?.target && this.manifest['sap.ui5']?.routing?.targets) {
		    	        const target = this.manifest['sap.ui5'].routing.targets[initialRoute.target];
		    	        if (target?.name) {
		    	          const options = target.options;
		    	          const settings = options?.settings;
		    	          const entitySet = this.convertedMetadata.resolvePath(settings?.contextPath ?? `${settings?.entitySet}`);
		    	          return entitySet.target;
		    	        }
		    	      }
		    	    }
		    	    // Try to determine the root entity set from the metadata
		    	  }
		    	  getMetaPath(metaPath, contextPath) {
		    	    return new _MetaPath.default(this.convertedMetadata, metaPath, contextPath);
		    	  }
		    	  getPageFor(contextPath) {
		    	    // A page could point to
		    	    // - An entitySet (/SalesOrder)
		    	    // - A singleton (/Me)
		    	    // - A navigation property (/SalesOrder/Set)
		    	    return new _DefinitionPage.DefinitionPage(new _MetaPath.default(this.convertedMetadata, contextPath, contextPath));
		    	  }
		    	  getVersion() {
		    	    const match = this.convertedMetadata.version.match(/^(\d+)\.(\d+)$/);
		    	    if (!match) {
		    	      throw new Error('Invalid version format');
		    	    }
		    	    return {
		    	      major: parseInt(match[1], 10),
		    	      minor: parseInt(match[2], 10)
		    	    };
		    	  }
		    	};
		    	DefinitionContext.DefinitionContext = DefinitionContext$1;
		    	
		    	return DefinitionContext;
		    }

		    var QueryBuilder = {};

		    var hasRequiredQueryBuilder;

		    function requireQueryBuilder () {
		    	if (hasRequiredQueryBuilder) return QueryBuilder;
		    	hasRequiredQueryBuilder = 1;

		    	Object.defineProperty(QueryBuilder, "__esModule", {
		    	  value: true
		    	});
		    	QueryBuilder.QueryBuilder = void 0;
		    	var _Expression = requireExpression();
		    	function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e; }
		    	function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
		    	function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
		    	let QueryBuilder$1 = class QueryBuilder {
		    	  constructor(contextMetaPath, definitionContext) {
		    	    _defineProperty(this, "paths", new Set());
		    	    this.contextMetaPath = contextMetaPath;
		    	    this.definitionContext = definitionContext;
		    	  }
		    	  addPathsFromExpression(expression) {
		    	    (0, _Expression.transformRecursively)(expression, 'PathInModel', pathExpression => {
		    	      this.addPath(pathExpression.path);
		    	      return pathExpression;
		    	    }, true /*includeAllExpressions*/);
		    	  }
		    	  addPath(path) {
		    	    this.paths.add(path);
		    	  }
		    	  buildQuery() {
		    	    let query;
		    	    if (this.definitionContext.getVersion().major >= 4) {
		    	      query = this.createQueryV4(this.paths);
		    	    } else {
		    	      query = this.createQueryV2(this.paths);
		    	    }
		    	    return query;
		    	  }
		    	  createQueryV2(paths) {
		    	    const select = [];
		    	    const expand = new Set();
		    	    paths.forEach(property => {
		    	      const parts = property.split('/');
		    	      const propertyMetaPath = this.contextMetaPath.getMetaPathForPath(property);
		    	      const name = parts[0];
		    	      if (name && this.isNavigationProperty(name, propertyMetaPath?.getNavigationProperties() ?? [])) {
		    	        expand.add(name);
		    	      } else {
		    	        select.push(property);
		    	      }
		    	    });
		    	    const query = {
		    	      $format: 'json',
		    	      $select: select.join(',')
		    	    };
		    	    if (expand.size > 0) {
		    	      query.$expand = Array.from(expand).join(',');
		    	    }
		    	    return query;
		    	  }
		    	  createQueryV4(paths) {
		    	    const node = {
		    	      name: '',
		    	      $select: new Set(),
		    	      $expand: new Map()
		    	    };
		    	    paths.forEach(property => {
		    	      const parts = property.split('/');
		    	      const propertyMetaPath = this.contextMetaPath.getMetaPathForPath(property);
		    	      const navigationProperties = propertyMetaPath?.getNavigationProperties() ?? [];
		    	      this.processPathRecursiveV4(parts, node, navigationProperties);
		    	    });
		    	    const query = {
		    	      $format: 'json',
		    	      $select: Array.from(node.$select).join(',')
		    	    };
		    	    if (node.$expand.size > 0) {
		    	      query.$expand = Array.from(node.$expand.values()).map(serializeExpandV4Recursive).join(',');
		    	    }
		    	    return query;
		    	  }
		    	  processPathRecursiveV4(parts, parentNode, navigationProperties) {
		    	    let node;
		    	    const name = parts[0];
		    	    if (name && this.isNavigationProperty(name, navigationProperties)) {
		    	      node = parentNode.$expand.get(name);
		    	      if (!node) {
		    	        node = {
		    	          name,
		    	          $select: new Set(),
		    	          $expand: new Map()
		    	        };
		    	      }
		    	      parentNode.$expand.set(name, node);
		    	      if (parts.length === 2) {
		    	        node.$select.add(parts[1] ?? '');
		    	      } else {
		    	        this.processPathRecursiveV4(parts.slice(1), node, navigationProperties.slice(1));
		    	      }
		    	    } else {
		    	      parentNode.$select.add(parts.join('/'));
		    	    }
		    	  }
		    	  isNavigationProperty(property, navigationProperties) {
		    	    const navigationPropertyOffset = this.contextMetaPath.getNavigationProperties().length;
		    	    return navigationProperties.length > navigationPropertyOffset && property === navigationProperties[navigationPropertyOffset]?.name;
		    	  }
		    	};
		    	QueryBuilder.QueryBuilder = QueryBuilder$1;
		    	function serializeExpandV4Recursive(expandNode) {
		    	  const select = serializeSelect(expandNode.$select);
		    	  const expandValue = Array.from(expandNode.$expand.values()).map(serializeExpandV4Recursive).join(',');
		    	  const expand = expandValue.length > 0 ? `$expand=${expandValue}` : '';
		    	  const separator = select.length > 0 && expand.length > 0 ? ';' : '';
		    	  return `${expandNode.name}(${select}${separator}${expand})`;
		    	}
		    	function serializeSelect(fields) {
		    	  return fields.size > 0 ? `$select=${Array.from(fields).join(',')}` : '';
		    	}
		    	
		    	return QueryBuilder;
		    }

		    var hasRequiredDist$3;

		    function requireDist$3 () {
		    	if (hasRequiredDist$3) return dist$3;
		    	hasRequiredDist$3 = 1;
		    	(function (exports) {

		    		Object.defineProperty(exports, "__esModule", {
		    		  value: true
		    		});
		    		var _exportNames = {
		    		  FilterField: true,
		    		  DefinitionPage: true,
		    		  _DataField: true,
		    		  _DataPoint: true,
		    		  _LineItem: true,
		    		  DefinitionContext: true,
		    		  QueryBuilder: true,
		    		  FORMATTERS_PATH: true,
		    		  formatters: true
		    		};
		    		Object.defineProperty(exports, "DefinitionContext", {
		    		  enumerable: true,
		    		  get: function () {
		    		    return _DefinitionContext.DefinitionContext;
		    		  }
		    		});
		    		Object.defineProperty(exports, "DefinitionPage", {
		    		  enumerable: true,
		    		  get: function () {
		    		    return _DefinitionPage.DefinitionPage;
		    		  }
		    		});
		    		Object.defineProperty(exports, "FORMATTERS_PATH", {
		    		  enumerable: true,
		    		  get: function () {
		    		    return _Formatters.FORMATTERS_PATH;
		    		  }
		    		});
		    		Object.defineProperty(exports, "FilterField", {
		    		  enumerable: true,
		    		  get: function () {
		    		    return _FilterBar.FilterField;
		    		  }
		    		});
		    		Object.defineProperty(exports, "QueryBuilder", {
		    		  enumerable: true,
		    		  get: function () {
		    		    return _QueryBuilder.QueryBuilder;
		    		  }
		    		});
		    		Object.defineProperty(exports, "_DataField", {
		    		  enumerable: true,
		    		  get: function () {
		    		    return _DataField._DataField;
		    		  }
		    		});
		    		Object.defineProperty(exports, "_DataPoint", {
		    		  enumerable: true,
		    		  get: function () {
		    		    return _DataPoint._DataPoint;
		    		  }
		    		});
		    		Object.defineProperty(exports, "_LineItem", {
		    		  enumerable: true,
		    		  get: function () {
		    		    return _LineItem._LineItem;
		    		  }
		    		});
		    		Object.defineProperty(exports, "formatters", {
		    		  enumerable: true,
		    		  get: function () {
		    		    return _Formatters.formatters;
		    		  }
		    		});
		    		var _FilterBar = requireFilterBar();
		    		var _DefinitionPage = requireDefinitionPage();
		    		var _DataField = require_DataField();
		    		var _DataPoint = require_DataPoint();
		    		var _LineItem = require_LineItem();
		    		var _DefinitionContext = requireDefinitionContext();
		    		var _QueryBuilder = requireQueryBuilder();
		    		var _Formatters = requireFormatters();
		    		var _TypeGuards = requireTypeGuards();
		    		Object.keys(_TypeGuards).forEach(function (key) {
		    		  if (key === "default" || key === "__esModule") return;
		    		  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
		    		  if (key in exports && exports[key] === _TypeGuards[key]) return;
		    		  Object.defineProperty(exports, key, {
		    		    enumerable: true,
		    		    get: function () {
		    		      return _TypeGuards[key];
		    		    }
		    		  });
		    		});
		    		
		    	} (dist$3));
		    	return dist$3;
		    }

		    var distExports$3 = requireDist$3();

		    var ExpressionExports = requireExpression();

		    var dist$2 = {};

		    var merger = {};

		    var utils$1 = {};

		    var hasRequiredUtils$1;

		    function requireUtils$1 () {
		    	if (hasRequiredUtils$1) return utils$1;
		    	hasRequiredUtils$1 = 1;
		    	Object.defineProperty(utils$1, "__esModule", { value: true });
		    	utils$1.MergedRawMetadata = utils$1.RawMetadataInstance = utils$1.ensureArray = void 0;
		    	/**
		    	 * Either returns the sourceObject or the sourceObject wrapped in an array.
		    	 *
		    	 * @param sourceObject the object you want to check
		    	 * @returns the source object wrapped in an array.
		    	 */
		    	function ensureArray(sourceObject) {
		    	    if (sourceObject === undefined || sourceObject === null) {
		    	        return [];
		    	    }
		    	    if (Array.isArray(sourceObject)) {
		    	        return sourceObject;
		    	    }
		    	    else {
		    	        return [sourceObject];
		    	    }
		    	}
		    	utils$1.ensureArray = ensureArray;
		    	/**
		    	 *
		    	 */
		    	class RawMetadataInstance {
		    	    /**
		    	     * @param fileIdentification the name of the file you are parsing, mostly for reference
		    	     * @param version the version of the metadata currently evaluated
		    	     * @param schema the parsed schema
		    	     * @param references a list of all the references currently used in your file
		    	     */
		    	    constructor(fileIdentification, version, schema, references) {
		    	        this.identification = fileIdentification;
		    	        this.references = references;
		    	        this.version = version;
		    	        this.schema = schema;
		    	    }
		    	}
		    	utils$1.RawMetadataInstance = RawMetadataInstance;
		    	/**
		    	 *
		    	 */
		    	class MergedRawMetadata {
		    	    get references() {
		    	        return this._references;
		    	    }
		    	    get schema() {
		    	        return {
		    	            associations: this._associations,
		    	            associationSets: this._associationSets,
		    	            annotations: this._annotations,
		    	            entityContainer: this._entityContainer,
		    	            namespace: this._namespace,
		    	            entitySets: this._entitySets,
		    	            singletons: this._singletons,
		    	            complexTypes: this._complexTypes,
		    	            typeDefinitions: this._typeDefinitions,
		    	            actions: this._actions,
		    	            actionImports: this._actionImports,
		    	            entityTypes: this._entityTypes
		    	        };
		    	    }
		    	    /**
		    	     * @param initialParserOutput
		    	     */
		    	    constructor(initialParserOutput) {
		    	        this._references = [];
		    	        this._parserOutput = [];
		    	        this._annotations = {};
		    	        this._associations = [];
		    	        this._associationSets = [];
		    	        this._entitySets = [];
		    	        this._singletons = [];
		    	        this._actions = [];
		    	        this._actionImports = [];
		    	        this._entityContainer = {
		    	            _type: 'EntityContainer',
		    	            fullyQualifiedName: ''
		    	        };
		    	        this._entityTypes = [];
		    	        this._complexTypes = [];
		    	        this._typeDefinitions = [];
		    	        this.identification = 'mergedParserInstance';
		    	        this.version = initialParserOutput.version;
		    	        this._namespace = initialParserOutput.schema.namespace;
		    	    }
		    	    /**
		    	     * @param parserOutput
		    	     */
		    	    addParserOutput(parserOutput) {
		    	        this._parserOutput.push(parserOutput);
		    	        this._references = this._references.concat(parserOutput.references);
		    	        this._associations = this._associations.concat(parserOutput.schema.associations);
		    	        this._associationSets = this._associationSets.concat(parserOutput.schema.associationSets);
		    	        this._annotations = Object.assign(this._annotations, parserOutput.schema.annotations);
		    	        this._entitySets = this._entitySets.concat(parserOutput.schema.entitySets);
		    	        this._singletons = this._singletons.concat(parserOutput.schema.singletons);
		    	        this._actions = this._actions.concat(parserOutput.schema.actions);
		    	        this._actionImports = this._actionImports.concat(parserOutput.schema.actionImports);
		    	        this._entityTypes = this._entityTypes.concat(parserOutput.schema.entityTypes);
		    	        this._complexTypes = this._complexTypes.concat(parserOutput.schema.complexTypes);
		    	        this._typeDefinitions = this._typeDefinitions.concat(parserOutput.schema.typeDefinitions);
		    	        if (parserOutput.schema.entityContainer.fullyQualifiedName.length > 0) {
		    	            this._entityContainer = Object.assign(this._entityContainer, parserOutput.schema.entityContainer);
		    	        }
		    	    }
		    	}
		    	utils$1.MergedRawMetadata = MergedRawMetadata;
		    	
		    	return utils$1;
		    }

		    var hasRequiredMerger;

		    function requireMerger () {
		    	if (hasRequiredMerger) return merger;
		    	hasRequiredMerger = 1;
		    	Object.defineProperty(merger, "__esModule", { value: true });
		    	merger.merge = void 0;
		    	const utils_1 = requireUtils$1();
		    	/**
		    	 * Merges multiple metadata output from the parser together into one.
		    	 *
		    	 * @param parserOutputs the different output from the parser
		    	 * @returns The merge metadata output
		    	 */
		    	function merge(...parserOutputs) {
		    	    const outParserOutput = new utils_1.MergedRawMetadata(parserOutputs[0]);
		    	    parserOutputs.forEach((parserOutput) => {
		    	        outParserOutput.addParserOutput(parserOutput);
		    	    });
		    	    return outParserOutput;
		    	}
		    	merger.merge = merge;
		    	
		    	return merger;
		    }

		    var parser = {};

		    var sax = {};

		    var hasRequiredSax;

		    function requireSax () {
		    	if (hasRequiredSax) return sax;
		    	hasRequiredSax = 1;
		    	(function (exports) {
		    (function (sax) { // wrapper for non-node envs
		    		  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) };
		    		  sax.SAXParser = SAXParser;
		    		  sax.SAXStream = SAXStream;
		    		  sax.createStream = createStream;

		    		  // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
		    		  // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
		    		  // since that's the earliest that a buffer overrun could occur.  This way, checks are
		    		  // as rare as required, but as often as necessary to ensure never crossing this bound.
		    		  // Furthermore, buffers are only tested at most once per write(), so passing a very
		    		  // large string into write() might have undesirable effects, but this is manageable by
		    		  // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
		    		  // edge case, result in creating at most one complete copy of the string passed in.
		    		  // Set to Infinity to have unlimited buffers.
		    		  sax.MAX_BUFFER_LENGTH = 64 * 1024;

		    		  var buffers = [
		    		    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
		    		    'procInstName', 'procInstBody', 'entity', 'attribName',
		    		    'attribValue', 'cdata', 'script'
		    		  ];

		    		  sax.EVENTS = [
		    		    'text',
		    		    'processinginstruction',
		    		    'sgmldeclaration',
		    		    'doctype',
		    		    'comment',
		    		    'opentagstart',
		    		    'attribute',
		    		    'opentag',
		    		    'closetag',
		    		    'opencdata',
		    		    'cdata',
		    		    'closecdata',
		    		    'error',
		    		    'end',
		    		    'ready',
		    		    'script',
		    		    'opennamespace',
		    		    'closenamespace'
		    		  ];

		    		  function SAXParser (strict, opt) {
		    		    if (!(this instanceof SAXParser)) {
		    		      return new SAXParser(strict, opt)
		    		    }

		    		    var parser = this;
		    		    clearBuffers(parser);
		    		    parser.q = parser.c = '';
		    		    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
		    		    parser.opt = opt || {};
		    		    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
		    		    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase';
		    		    parser.tags = [];
		    		    parser.closed = parser.closedRoot = parser.sawRoot = false;
		    		    parser.tag = parser.error = null;
		    		    parser.strict = !!strict;
		    		    parser.noscript = !!(strict || parser.opt.noscript);
		    		    parser.state = S.BEGIN;
		    		    parser.strictEntities = parser.opt.strictEntities;
		    		    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
		    		    parser.attribList = [];

		    		    // namespaces form a prototype chain.
		    		    // it always points at the current tag,
		    		    // which protos to its parent tag.
		    		    if (parser.opt.xmlns) {
		    		      parser.ns = Object.create(rootNS);
		    		    }

		    		    // disallow unquoted attribute values if not otherwise configured
		    		    // and strict mode is true
		    		    if (parser.opt.unquotedAttributeValues === undefined) {
		    		      parser.opt.unquotedAttributeValues = !strict;
		    		    }

		    		    // mostly just for error reporting
		    		    parser.trackPosition = parser.opt.position !== false;
		    		    if (parser.trackPosition) {
		    		      parser.position = parser.line = parser.column = 0;
		    		    }
		    		    emit(parser, 'onready');
		    		  }

		    		  if (!Object.create) {
		    		    Object.create = function (o) {
		    		      function F () {}
		    		      F.prototype = o;
		    		      var newf = new F();
		    		      return newf
		    		    };
		    		  }

		    		  if (!Object.keys) {
		    		    Object.keys = function (o) {
		    		      var a = [];
		    		      for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
		    		      return a
		    		    };
		    		  }

		    		  function checkBufferLength (parser) {
		    		    var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
		    		    var maxActual = 0;
		    		    for (var i = 0, l = buffers.length; i < l; i++) {
		    		      var len = parser[buffers[i]].length;
		    		      if (len > maxAllowed) {
		    		        // Text/cdata nodes can get big, and since they're buffered,
		    		        // we can get here under normal conditions.
		    		        // Avoid issues by emitting the text node now,
		    		        // so at least it won't get any bigger.
		    		        switch (buffers[i]) {
		    		          case 'textNode':
		    		            closeText(parser);
		    		            break

		    		          case 'cdata':
		    		            emitNode(parser, 'oncdata', parser.cdata);
		    		            parser.cdata = '';
		    		            break

		    		          case 'script':
		    		            emitNode(parser, 'onscript', parser.script);
		    		            parser.script = '';
		    		            break

		    		          default:
		    		            error(parser, 'Max buffer length exceeded: ' + buffers[i]);
		    		        }
		    		      }
		    		      maxActual = Math.max(maxActual, len);
		    		    }
		    		    // schedule the next check for the earliest possible buffer overrun.
		    		    var m = sax.MAX_BUFFER_LENGTH - maxActual;
		    		    parser.bufferCheckPosition = m + parser.position;
		    		  }

		    		  function clearBuffers (parser) {
		    		    for (var i = 0, l = buffers.length; i < l; i++) {
		    		      parser[buffers[i]] = '';
		    		    }
		    		  }

		    		  function flushBuffers (parser) {
		    		    closeText(parser);
		    		    if (parser.cdata !== '') {
		    		      emitNode(parser, 'oncdata', parser.cdata);
		    		      parser.cdata = '';
		    		    }
		    		    if (parser.script !== '') {
		    		      emitNode(parser, 'onscript', parser.script);
		    		      parser.script = '';
		    		    }
		    		  }

		    		  SAXParser.prototype = {
		    		    end: function () { end(this); },
		    		    write: write,
		    		    resume: function () { this.error = null; return this },
		    		    close: function () { return this.write(null) },
		    		    flush: function () { flushBuffers(this); }
		    		  };

		    		  var Stream;
		    		  try {
		    		    Stream = require$$2.Stream;
		    		  } catch (ex) {
		    		    Stream = function () {};
		    		  }
		    		  if (!Stream) Stream = function () {};

		    		  var streamWraps = sax.EVENTS.filter(function (ev) {
		    		    return ev !== 'error' && ev !== 'end'
		    		  });

		    		  function createStream (strict, opt) {
		    		    return new SAXStream(strict, opt)
		    		  }

		    		  function SAXStream (strict, opt) {
		    		    if (!(this instanceof SAXStream)) {
		    		      return new SAXStream(strict, opt)
		    		    }

		    		    Stream.apply(this);

		    		    this._parser = new SAXParser(strict, opt);
		    		    this.writable = true;
		    		    this.readable = true;

		    		    var me = this;

		    		    this._parser.onend = function () {
		    		      me.emit('end');
		    		    };

		    		    this._parser.onerror = function (er) {
		    		      me.emit('error', er);

		    		      // if didn't throw, then means error was handled.
		    		      // go ahead and clear error, so we can write again.
		    		      me._parser.error = null;
		    		    };

		    		    this._decoder = null;

		    		    streamWraps.forEach(function (ev) {
		    		      Object.defineProperty(me, 'on' + ev, {
		    		        get: function () {
		    		          return me._parser['on' + ev]
		    		        },
		    		        set: function (h) {
		    		          if (!h) {
		    		            me.removeAllListeners(ev);
		    		            me._parser['on' + ev] = h;
		    		            return h
		    		          }
		    		          me.on(ev, h);
		    		        },
		    		        enumerable: true,
		    		        configurable: false
		    		      });
		    		    });
		    		  }

		    		  SAXStream.prototype = Object.create(Stream.prototype, {
		    		    constructor: {
		    		      value: SAXStream
		    		    }
		    		  });

		    		  SAXStream.prototype.write = function (data) {
		    		    if (typeof Buffer === 'function' &&
		    		      typeof Buffer.isBuffer === 'function' &&
		    		      Buffer.isBuffer(data)) {
		    		      if (!this._decoder) {
		    		        var SD = require$$1.StringDecoder;
		    		        this._decoder = new SD('utf8');
		    		      }
		    		      data = this._decoder.write(data);
		    		    }

		    		    this._parser.write(data.toString());
		    		    this.emit('data', data);
		    		    return true
		    		  };

		    		  SAXStream.prototype.end = function (chunk) {
		    		    if (chunk && chunk.length) {
		    		      this.write(chunk);
		    		    }
		    		    this._parser.end();
		    		    return true
		    		  };

		    		  SAXStream.prototype.on = function (ev, handler) {
		    		    var me = this;
		    		    if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
		    		      me._parser['on' + ev] = function () {
		    		        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
		    		        args.splice(0, 0, ev);
		    		        me.emit.apply(me, args);
		    		      };
		    		    }

		    		    return Stream.prototype.on.call(me, ev, handler)
		    		  };

		    		  // this really needs to be replaced with character classes.
		    		  // XML allows all manner of ridiculous numbers and digits.
		    		  var CDATA = '[CDATA[';
		    		  var DOCTYPE = 'DOCTYPE';
		    		  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
		    		  var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';
		    		  var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };

		    		  // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
		    		  // This implementation works on strings, a single character at a time
		    		  // as such, it cannot ever support astral-plane characters (10000-EFFFF)
		    		  // without a significant breaking change to either this  parser, or the
		    		  // JavaScript language.  Implementation of an emoji-capable xml parser
		    		  // is left as an exercise for the reader.
		    		  var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;

		    		  var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;

		    		  var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
		    		  var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;

		    		  function isWhitespace (c) {
		    		    return c === ' ' || c === '\n' || c === '\r' || c === '\t'
		    		  }

		    		  function isQuote (c) {
		    		    return c === '"' || c === '\''
		    		  }

		    		  function isAttribEnd (c) {
		    		    return c === '>' || isWhitespace(c)
		    		  }

		    		  function isMatch (regex, c) {
		    		    return regex.test(c)
		    		  }

		    		  function notMatch (regex, c) {
		    		    return !isMatch(regex, c)
		    		  }

		    		  var S = 0;
		    		  sax.STATE = {
		    		    BEGIN: S++, // leading byte order mark or whitespace
		    		    BEGIN_WHITESPACE: S++, // leading whitespace
		    		    TEXT: S++, // general stuff
		    		    TEXT_ENTITY: S++, // &amp and such.
		    		    OPEN_WAKA: S++, // <
		    		    SGML_DECL: S++, // <!BLARG
		    		    SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
		    		    DOCTYPE: S++, // <!DOCTYPE
		    		    DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
		    		    DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
		    		    DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
		    		    COMMENT_STARTING: S++, // <!-
		    		    COMMENT: S++, // <!--
		    		    COMMENT_ENDING: S++, // <!-- blah -
		    		    COMMENT_ENDED: S++, // <!-- blah --
		    		    CDATA: S++, // <![CDATA[ something
		    		    CDATA_ENDING: S++, // ]
		    		    CDATA_ENDING_2: S++, // ]]
		    		    PROC_INST: S++, // <?hi
		    		    PROC_INST_BODY: S++, // <?hi there
		    		    PROC_INST_ENDING: S++, // <?hi "there" ?
		    		    OPEN_TAG: S++, // <strong
		    		    OPEN_TAG_SLASH: S++, // <strong /
		    		    ATTRIB: S++, // <a
		    		    ATTRIB_NAME: S++, // <a foo
		    		    ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
		    		    ATTRIB_VALUE: S++, // <a foo=
		    		    ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
		    		    ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
		    		    ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
		    		    ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
		    		    ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
		    		    CLOSE_TAG: S++, // </a
		    		    CLOSE_TAG_SAW_WHITE: S++, // </a   >
		    		    SCRIPT: S++, // <script> ...
		    		    SCRIPT_ENDING: S++ // <script> ... <
		    		  };

		    		  sax.XML_ENTITIES = {
		    		    'amp': '&',
		    		    'gt': '>',
		    		    'lt': '<',
		    		    'quot': '"',
		    		    'apos': "'"
		    		  };

		    		  sax.ENTITIES = {
		    		    'amp': '&',
		    		    'gt': '>',
		    		    'lt': '<',
		    		    'quot': '"',
		    		    'apos': "'",
		    		    'AElig': 198,
		    		    'Aacute': 193,
		    		    'Acirc': 194,
		    		    'Agrave': 192,
		    		    'Aring': 197,
		    		    'Atilde': 195,
		    		    'Auml': 196,
		    		    'Ccedil': 199,
		    		    'ETH': 208,
		    		    'Eacute': 201,
		    		    'Ecirc': 202,
		    		    'Egrave': 200,
		    		    'Euml': 203,
		    		    'Iacute': 205,
		    		    'Icirc': 206,
		    		    'Igrave': 204,
		    		    'Iuml': 207,
		    		    'Ntilde': 209,
		    		    'Oacute': 211,
		    		    'Ocirc': 212,
		    		    'Ograve': 210,
		    		    'Oslash': 216,
		    		    'Otilde': 213,
		    		    'Ouml': 214,
		    		    'THORN': 222,
		    		    'Uacute': 218,
		    		    'Ucirc': 219,
		    		    'Ugrave': 217,
		    		    'Uuml': 220,
		    		    'Yacute': 221,
		    		    'aacute': 225,
		    		    'acirc': 226,
		    		    'aelig': 230,
		    		    'agrave': 224,
		    		    'aring': 229,
		    		    'atilde': 227,
		    		    'auml': 228,
		    		    'ccedil': 231,
		    		    'eacute': 233,
		    		    'ecirc': 234,
		    		    'egrave': 232,
		    		    'eth': 240,
		    		    'euml': 235,
		    		    'iacute': 237,
		    		    'icirc': 238,
		    		    'igrave': 236,
		    		    'iuml': 239,
		    		    'ntilde': 241,
		    		    'oacute': 243,
		    		    'ocirc': 244,
		    		    'ograve': 242,
		    		    'oslash': 248,
		    		    'otilde': 245,
		    		    'ouml': 246,
		    		    'szlig': 223,
		    		    'thorn': 254,
		    		    'uacute': 250,
		    		    'ucirc': 251,
		    		    'ugrave': 249,
		    		    'uuml': 252,
		    		    'yacute': 253,
		    		    'yuml': 255,
		    		    'copy': 169,
		    		    'reg': 174,
		    		    'nbsp': 160,
		    		    'iexcl': 161,
		    		    'cent': 162,
		    		    'pound': 163,
		    		    'curren': 164,
		    		    'yen': 165,
		    		    'brvbar': 166,
		    		    'sect': 167,
		    		    'uml': 168,
		    		    'ordf': 170,
		    		    'laquo': 171,
		    		    'not': 172,
		    		    'shy': 173,
		    		    'macr': 175,
		    		    'deg': 176,
		    		    'plusmn': 177,
		    		    'sup1': 185,
		    		    'sup2': 178,
		    		    'sup3': 179,
		    		    'acute': 180,
		    		    'micro': 181,
		    		    'para': 182,
		    		    'middot': 183,
		    		    'cedil': 184,
		    		    'ordm': 186,
		    		    'raquo': 187,
		    		    'frac14': 188,
		    		    'frac12': 189,
		    		    'frac34': 190,
		    		    'iquest': 191,
		    		    'times': 215,
		    		    'divide': 247,
		    		    'OElig': 338,
		    		    'oelig': 339,
		    		    'Scaron': 352,
		    		    'scaron': 353,
		    		    'Yuml': 376,
		    		    'fnof': 402,
		    		    'circ': 710,
		    		    'tilde': 732,
		    		    'Alpha': 913,
		    		    'Beta': 914,
		    		    'Gamma': 915,
		    		    'Delta': 916,
		    		    'Epsilon': 917,
		    		    'Zeta': 918,
		    		    'Eta': 919,
		    		    'Theta': 920,
		    		    'Iota': 921,
		    		    'Kappa': 922,
		    		    'Lambda': 923,
		    		    'Mu': 924,
		    		    'Nu': 925,
		    		    'Xi': 926,
		    		    'Omicron': 927,
		    		    'Pi': 928,
		    		    'Rho': 929,
		    		    'Sigma': 931,
		    		    'Tau': 932,
		    		    'Upsilon': 933,
		    		    'Phi': 934,
		    		    'Chi': 935,
		    		    'Psi': 936,
		    		    'Omega': 937,
		    		    'alpha': 945,
		    		    'beta': 946,
		    		    'gamma': 947,
		    		    'delta': 948,
		    		    'epsilon': 949,
		    		    'zeta': 950,
		    		    'eta': 951,
		    		    'theta': 952,
		    		    'iota': 953,
		    		    'kappa': 954,
		    		    'lambda': 955,
		    		    'mu': 956,
		    		    'nu': 957,
		    		    'xi': 958,
		    		    'omicron': 959,
		    		    'pi': 960,
		    		    'rho': 961,
		    		    'sigmaf': 962,
		    		    'sigma': 963,
		    		    'tau': 964,
		    		    'upsilon': 965,
		    		    'phi': 966,
		    		    'chi': 967,
		    		    'psi': 968,
		    		    'omega': 969,
		    		    'thetasym': 977,
		    		    'upsih': 978,
		    		    'piv': 982,
		    		    'ensp': 8194,
		    		    'emsp': 8195,
		    		    'thinsp': 8201,
		    		    'zwnj': 8204,
		    		    'zwj': 8205,
		    		    'lrm': 8206,
		    		    'rlm': 8207,
		    		    'ndash': 8211,
		    		    'mdash': 8212,
		    		    'lsquo': 8216,
		    		    'rsquo': 8217,
		    		    'sbquo': 8218,
		    		    'ldquo': 8220,
		    		    'rdquo': 8221,
		    		    'bdquo': 8222,
		    		    'dagger': 8224,
		    		    'Dagger': 8225,
		    		    'bull': 8226,
		    		    'hellip': 8230,
		    		    'permil': 8240,
		    		    'prime': 8242,
		    		    'Prime': 8243,
		    		    'lsaquo': 8249,
		    		    'rsaquo': 8250,
		    		    'oline': 8254,
		    		    'frasl': 8260,
		    		    'euro': 8364,
		    		    'image': 8465,
		    		    'weierp': 8472,
		    		    'real': 8476,
		    		    'trade': 8482,
		    		    'alefsym': 8501,
		    		    'larr': 8592,
		    		    'uarr': 8593,
		    		    'rarr': 8594,
		    		    'darr': 8595,
		    		    'harr': 8596,
		    		    'crarr': 8629,
		    		    'lArr': 8656,
		    		    'uArr': 8657,
		    		    'rArr': 8658,
		    		    'dArr': 8659,
		    		    'hArr': 8660,
		    		    'forall': 8704,
		    		    'part': 8706,
		    		    'exist': 8707,
		    		    'empty': 8709,
		    		    'nabla': 8711,
		    		    'isin': 8712,
		    		    'notin': 8713,
		    		    'ni': 8715,
		    		    'prod': 8719,
		    		    'sum': 8721,
		    		    'minus': 8722,
		    		    'lowast': 8727,
		    		    'radic': 8730,
		    		    'prop': 8733,
		    		    'infin': 8734,
		    		    'ang': 8736,
		    		    'and': 8743,
		    		    'or': 8744,
		    		    'cap': 8745,
		    		    'cup': 8746,
		    		    'int': 8747,
		    		    'there4': 8756,
		    		    'sim': 8764,
		    		    'cong': 8773,
		    		    'asymp': 8776,
		    		    'ne': 8800,
		    		    'equiv': 8801,
		    		    'le': 8804,
		    		    'ge': 8805,
		    		    'sub': 8834,
		    		    'sup': 8835,
		    		    'nsub': 8836,
		    		    'sube': 8838,
		    		    'supe': 8839,
		    		    'oplus': 8853,
		    		    'otimes': 8855,
		    		    'perp': 8869,
		    		    'sdot': 8901,
		    		    'lceil': 8968,
		    		    'rceil': 8969,
		    		    'lfloor': 8970,
		    		    'rfloor': 8971,
		    		    'lang': 9001,
		    		    'rang': 9002,
		    		    'loz': 9674,
		    		    'spades': 9824,
		    		    'clubs': 9827,
		    		    'hearts': 9829,
		    		    'diams': 9830
		    		  };

		    		  Object.keys(sax.ENTITIES).forEach(function (key) {
		    		    var e = sax.ENTITIES[key];
		    		    var s = typeof e === 'number' ? String.fromCharCode(e) : e;
		    		    sax.ENTITIES[key] = s;
		    		  });

		    		  for (var s in sax.STATE) {
		    		    sax.STATE[sax.STATE[s]] = s;
		    		  }

		    		  // shorthand
		    		  S = sax.STATE;

		    		  function emit (parser, event, data) {
		    		    parser[event] && parser[event](data);
		    		  }

		    		  function emitNode (parser, nodeType, data) {
		    		    if (parser.textNode) closeText(parser);
		    		    emit(parser, nodeType, data);
		    		  }

		    		  function closeText (parser) {
		    		    parser.textNode = textopts(parser.opt, parser.textNode);
		    		    if (parser.textNode) emit(parser, 'ontext', parser.textNode);
		    		    parser.textNode = '';
		    		  }

		    		  function textopts (opt, text) {
		    		    if (opt.trim) text = text.trim();
		    		    if (opt.normalize) text = text.replace(/\s+/g, ' ');
		    		    return text
		    		  }

		    		  function error (parser, er) {
		    		    closeText(parser);
		    		    if (parser.trackPosition) {
		    		      er += '\nLine: ' + parser.line +
		    		        '\nColumn: ' + parser.column +
		    		        '\nChar: ' + parser.c;
		    		    }
		    		    er = new Error(er);
		    		    parser.error = er;
		    		    emit(parser, 'onerror', er);
		    		    return parser
		    		  }

		    		  function end (parser) {
		    		    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag');
		    		    if ((parser.state !== S.BEGIN) &&
		    		      (parser.state !== S.BEGIN_WHITESPACE) &&
		    		      (parser.state !== S.TEXT)) {
		    		      error(parser, 'Unexpected end');
		    		    }
		    		    closeText(parser);
		    		    parser.c = '';
		    		    parser.closed = true;
		    		    emit(parser, 'onend');
		    		    SAXParser.call(parser, parser.strict, parser.opt);
		    		    return parser
		    		  }

		    		  function strictFail (parser, message) {
		    		    if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
		    		      throw new Error('bad call to strictFail')
		    		    }
		    		    if (parser.strict) {
		    		      error(parser, message);
		    		    }
		    		  }

		    		  function newTag (parser) {
		    		    if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]();
		    		    var parent = parser.tags[parser.tags.length - 1] || parser;
		    		    var tag = parser.tag = { name: parser.tagName, attributes: {} };

		    		    // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
		    		    if (parser.opt.xmlns) {
		    		      tag.ns = parent.ns;
		    		    }
		    		    parser.attribList.length = 0;
		    		    emitNode(parser, 'onopentagstart', tag);
		    		  }

		    		  function qname (name, attribute) {
		    		    var i = name.indexOf(':');
		    		    var qualName = i < 0 ? [ '', name ] : name.split(':');
		    		    var prefix = qualName[0];
		    		    var local = qualName[1];

		    		    // <x "xmlns"="http://foo">
		    		    if (attribute && name === 'xmlns') {
		    		      prefix = 'xmlns';
		    		      local = '';
		    		    }

		    		    return { prefix: prefix, local: local }
		    		  }

		    		  function attrib (parser) {
		    		    if (!parser.strict) {
		    		      parser.attribName = parser.attribName[parser.looseCase]();
		    		    }

		    		    if (parser.attribList.indexOf(parser.attribName) !== -1 ||
		    		      parser.tag.attributes.hasOwnProperty(parser.attribName)) {
		    		      parser.attribName = parser.attribValue = '';
		    		      return
		    		    }

		    		    if (parser.opt.xmlns) {
		    		      var qn = qname(parser.attribName, true);
		    		      var prefix = qn.prefix;
		    		      var local = qn.local;

		    		      if (prefix === 'xmlns') {
		    		        // namespace binding attribute. push the binding into scope
		    		        if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
		    		          strictFail(parser,
		    		            'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
		    		            'Actual: ' + parser.attribValue);
		    		        } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
		    		          strictFail(parser,
		    		            'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
		    		            'Actual: ' + parser.attribValue);
		    		        } else {
		    		          var tag = parser.tag;
		    		          var parent = parser.tags[parser.tags.length - 1] || parser;
		    		          if (tag.ns === parent.ns) {
		    		            tag.ns = Object.create(parent.ns);
		    		          }
		    		          tag.ns[local] = parser.attribValue;
		    		        }
		    		      }

		    		      // defer onattribute events until all attributes have been seen
		    		      // so any new bindings can take effect. preserve attribute order
		    		      // so deferred events can be emitted in document order
		    		      parser.attribList.push([parser.attribName, parser.attribValue]);
		    		    } else {
		    		      // in non-xmlns mode, we can emit the event right away
		    		      parser.tag.attributes[parser.attribName] = parser.attribValue;
		    		      emitNode(parser, 'onattribute', {
		    		        name: parser.attribName,
		    		        value: parser.attribValue
		    		      });
		    		    }

		    		    parser.attribName = parser.attribValue = '';
		    		  }

		    		  function openTag (parser, selfClosing) {
		    		    if (parser.opt.xmlns) {
		    		      // emit namespace binding events
		    		      var tag = parser.tag;

		    		      // add namespace info to tag
		    		      var qn = qname(parser.tagName);
		    		      tag.prefix = qn.prefix;
		    		      tag.local = qn.local;
		    		      tag.uri = tag.ns[qn.prefix] || '';

		    		      if (tag.prefix && !tag.uri) {
		    		        strictFail(parser, 'Unbound namespace prefix: ' +
		    		          JSON.stringify(parser.tagName));
		    		        tag.uri = qn.prefix;
		    		      }

		    		      var parent = parser.tags[parser.tags.length - 1] || parser;
		    		      if (tag.ns && parent.ns !== tag.ns) {
		    		        Object.keys(tag.ns).forEach(function (p) {
		    		          emitNode(parser, 'onopennamespace', {
		    		            prefix: p,
		    		            uri: tag.ns[p]
		    		          });
		    		        });
		    		      }

		    		      // handle deferred onattribute events
		    		      // Note: do not apply default ns to attributes:
		    		      //   http://www.w3.org/TR/REC-xml-names/#defaulting
		    		      for (var i = 0, l = parser.attribList.length; i < l; i++) {
		    		        var nv = parser.attribList[i];
		    		        var name = nv[0];
		    		        var value = nv[1];
		    		        var qualName = qname(name, true);
		    		        var prefix = qualName.prefix;
		    		        var local = qualName.local;
		    		        var uri = prefix === '' ? '' : (tag.ns[prefix] || '');
		    		        var a = {
		    		          name: name,
		    		          value: value,
		    		          prefix: prefix,
		    		          local: local,
		    		          uri: uri
		    		        };

		    		        // if there's any attributes with an undefined namespace,
		    		        // then fail on them now.
		    		        if (prefix && prefix !== 'xmlns' && !uri) {
		    		          strictFail(parser, 'Unbound namespace prefix: ' +
		    		            JSON.stringify(prefix));
		    		          a.uri = prefix;
		    		        }
		    		        parser.tag.attributes[name] = a;
		    		        emitNode(parser, 'onattribute', a);
		    		      }
		    		      parser.attribList.length = 0;
		    		    }

		    		    parser.tag.isSelfClosing = !!selfClosing;

		    		    // process the tag
		    		    parser.sawRoot = true;
		    		    parser.tags.push(parser.tag);
		    		    emitNode(parser, 'onopentag', parser.tag);
		    		    if (!selfClosing) {
		    		      // special case for <script> in non-strict mode.
		    		      if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
		    		        parser.state = S.SCRIPT;
		    		      } else {
		    		        parser.state = S.TEXT;
		    		      }
		    		      parser.tag = null;
		    		      parser.tagName = '';
		    		    }
		    		    parser.attribName = parser.attribValue = '';
		    		    parser.attribList.length = 0;
		    		  }

		    		  function closeTag (parser) {
		    		    if (!parser.tagName) {
		    		      strictFail(parser, 'Weird empty close tag.');
		    		      parser.textNode += '</>';
		    		      parser.state = S.TEXT;
		    		      return
		    		    }

		    		    if (parser.script) {
		    		      if (parser.tagName !== 'script') {
		    		        parser.script += '</' + parser.tagName + '>';
		    		        parser.tagName = '';
		    		        parser.state = S.SCRIPT;
		    		        return
		    		      }
		    		      emitNode(parser, 'onscript', parser.script);
		    		      parser.script = '';
		    		    }

		    		    // first make sure that the closing tag actually exists.
		    		    // <a><b></c></b></a> will close everything, otherwise.
		    		    var t = parser.tags.length;
		    		    var tagName = parser.tagName;
		    		    if (!parser.strict) {
		    		      tagName = tagName[parser.looseCase]();
		    		    }
		    		    var closeTo = tagName;
		    		    while (t--) {
		    		      var close = parser.tags[t];
		    		      if (close.name !== closeTo) {
		    		        // fail the first time in strict mode
		    		        strictFail(parser, 'Unexpected close tag');
		    		      } else {
		    		        break
		    		      }
		    		    }

		    		    // didn't find it.  we already failed for strict, so just abort.
		    		    if (t < 0) {
		    		      strictFail(parser, 'Unmatched closing tag: ' + parser.tagName);
		    		      parser.textNode += '</' + parser.tagName + '>';
		    		      parser.state = S.TEXT;
		    		      return
		    		    }
		    		    parser.tagName = tagName;
		    		    var s = parser.tags.length;
		    		    while (s-- > t) {
		    		      var tag = parser.tag = parser.tags.pop();
		    		      parser.tagName = parser.tag.name;
		    		      emitNode(parser, 'onclosetag', parser.tagName);

		    		      var x = {};
		    		      for (var i in tag.ns) {
		    		        x[i] = tag.ns[i];
		    		      }

		    		      var parent = parser.tags[parser.tags.length - 1] || parser;
		    		      if (parser.opt.xmlns && tag.ns !== parent.ns) {
		    		        // remove namespace bindings introduced by tag
		    		        Object.keys(tag.ns).forEach(function (p) {
		    		          var n = tag.ns[p];
		    		          emitNode(parser, 'onclosenamespace', { prefix: p, uri: n });
		    		        });
		    		      }
		    		    }
		    		    if (t === 0) parser.closedRoot = true;
		    		    parser.tagName = parser.attribValue = parser.attribName = '';
		    		    parser.attribList.length = 0;
		    		    parser.state = S.TEXT;
		    		  }

		    		  function parseEntity (parser) {
		    		    var entity = parser.entity;
		    		    var entityLC = entity.toLowerCase();
		    		    var num;
		    		    var numStr = '';

		    		    if (parser.ENTITIES[entity]) {
		    		      return parser.ENTITIES[entity]
		    		    }
		    		    if (parser.ENTITIES[entityLC]) {
		    		      return parser.ENTITIES[entityLC]
		    		    }
		    		    entity = entityLC;
		    		    if (entity.charAt(0) === '#') {
		    		      if (entity.charAt(1) === 'x') {
		    		        entity = entity.slice(2);
		    		        num = parseInt(entity, 16);
		    		        numStr = num.toString(16);
		    		      } else {
		    		        entity = entity.slice(1);
		    		        num = parseInt(entity, 10);
		    		        numStr = num.toString(10);
		    		      }
		    		    }
		    		    entity = entity.replace(/^0+/, '');
		    		    if (isNaN(num) || numStr.toLowerCase() !== entity) {
		    		      strictFail(parser, 'Invalid character entity');
		    		      return '&' + parser.entity + ';'
		    		    }

		    		    return String.fromCodePoint(num)
		    		  }

		    		  function beginWhiteSpace (parser, c) {
		    		    if (c === '<') {
		    		      parser.state = S.OPEN_WAKA;
		    		      parser.startTagPosition = parser.position;
		    		    } else if (!isWhitespace(c)) {
		    		      // have to process this as a text node.
		    		      // weird, but happens.
		    		      strictFail(parser, 'Non-whitespace before first tag.');
		    		      parser.textNode = c;
		    		      parser.state = S.TEXT;
		    		    }
		    		  }

		    		  function charAt (chunk, i) {
		    		    var result = '';
		    		    if (i < chunk.length) {
		    		      result = chunk.charAt(i);
		    		    }
		    		    return result
		    		  }

		    		  function write (chunk) {
		    		    var parser = this;
		    		    if (this.error) {
		    		      throw this.error
		    		    }
		    		    if (parser.closed) {
		    		      return error(parser,
		    		        'Cannot write after close. Assign an onready handler.')
		    		    }
		    		    if (chunk === null) {
		    		      return end(parser)
		    		    }
		    		    if (typeof chunk === 'object') {
		    		      chunk = chunk.toString();
		    		    }
		    		    var i = 0;
		    		    var c = '';
		    		    while (true) {
		    		      c = charAt(chunk, i++);
		    		      parser.c = c;

		    		      if (!c) {
		    		        break
		    		      }

		    		      if (parser.trackPosition) {
		    		        parser.position++;
		    		        if (c === '\n') {
		    		          parser.line++;
		    		          parser.column = 0;
		    		        } else {
		    		          parser.column++;
		    		        }
		    		      }

		    		      switch (parser.state) {
		    		        case S.BEGIN:
		    		          parser.state = S.BEGIN_WHITESPACE;
		    		          if (c === '\uFEFF') {
		    		            continue
		    		          }
		    		          beginWhiteSpace(parser, c);
		    		          continue

		    		        case S.BEGIN_WHITESPACE:
		    		          beginWhiteSpace(parser, c);
		    		          continue

		    		        case S.TEXT:
		    		          if (parser.sawRoot && !parser.closedRoot) {
		    		            var starti = i - 1;
		    		            while (c && c !== '<' && c !== '&') {
		    		              c = charAt(chunk, i++);
		    		              if (c && parser.trackPosition) {
		    		                parser.position++;
		    		                if (c === '\n') {
		    		                  parser.line++;
		    		                  parser.column = 0;
		    		                } else {
		    		                  parser.column++;
		    		                }
		    		              }
		    		            }
		    		            parser.textNode += chunk.substring(starti, i - 1);
		    		          }
		    		          if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
		    		            parser.state = S.OPEN_WAKA;
		    		            parser.startTagPosition = parser.position;
		    		          } else {
		    		            if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
		    		              strictFail(parser, 'Text data outside of root node.');
		    		            }
		    		            if (c === '&') {
		    		              parser.state = S.TEXT_ENTITY;
		    		            } else {
		    		              parser.textNode += c;
		    		            }
		    		          }
		    		          continue

		    		        case S.SCRIPT:
		    		          // only non-strict
		    		          if (c === '<') {
		    		            parser.state = S.SCRIPT_ENDING;
		    		          } else {
		    		            parser.script += c;
		    		          }
		    		          continue

		    		        case S.SCRIPT_ENDING:
		    		          if (c === '/') {
		    		            parser.state = S.CLOSE_TAG;
		    		          } else {
		    		            parser.script += '<' + c;
		    		            parser.state = S.SCRIPT;
		    		          }
		    		          continue

		    		        case S.OPEN_WAKA:
		    		          // either a /, ?, !, or text is coming next.
		    		          if (c === '!') {
		    		            parser.state = S.SGML_DECL;
		    		            parser.sgmlDecl = '';
		    		          } else if (isWhitespace(c)) ; else if (isMatch(nameStart, c)) {
		    		            parser.state = S.OPEN_TAG;
		    		            parser.tagName = c;
		    		          } else if (c === '/') {
		    		            parser.state = S.CLOSE_TAG;
		    		            parser.tagName = '';
		    		          } else if (c === '?') {
		    		            parser.state = S.PROC_INST;
		    		            parser.procInstName = parser.procInstBody = '';
		    		          } else {
		    		            strictFail(parser, 'Unencoded <');
		    		            // if there was some whitespace, then add that in.
		    		            if (parser.startTagPosition + 1 < parser.position) {
		    		              var pad = parser.position - parser.startTagPosition;
		    		              c = new Array(pad).join(' ') + c;
		    		            }
		    		            parser.textNode += '<' + c;
		    		            parser.state = S.TEXT;
		    		          }
		    		          continue

		    		        case S.SGML_DECL:
		    		          if (parser.sgmlDecl + c === '--') {
		    		            parser.state = S.COMMENT;
		    		            parser.comment = '';
		    		            parser.sgmlDecl = '';
		    		            continue;
		    		          }

		    		          if (parser.doctype && parser.doctype !== true && parser.sgmlDecl) {
		    		            parser.state = S.DOCTYPE_DTD;
		    		            parser.doctype += '<!' + parser.sgmlDecl + c;
		    		            parser.sgmlDecl = '';
		    		          } else if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
		    		            emitNode(parser, 'onopencdata');
		    		            parser.state = S.CDATA;
		    		            parser.sgmlDecl = '';
		    		            parser.cdata = '';
		    		          } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
		    		            parser.state = S.DOCTYPE;
		    		            if (parser.doctype || parser.sawRoot) {
		    		              strictFail(parser,
		    		                'Inappropriately located doctype declaration');
		    		            }
		    		            parser.doctype = '';
		    		            parser.sgmlDecl = '';
		    		          } else if (c === '>') {
		    		            emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl);
		    		            parser.sgmlDecl = '';
		    		            parser.state = S.TEXT;
		    		          } else if (isQuote(c)) {
		    		            parser.state = S.SGML_DECL_QUOTED;
		    		            parser.sgmlDecl += c;
		    		          } else {
		    		            parser.sgmlDecl += c;
		    		          }
		    		          continue

		    		        case S.SGML_DECL_QUOTED:
		    		          if (c === parser.q) {
		    		            parser.state = S.SGML_DECL;
		    		            parser.q = '';
		    		          }
		    		          parser.sgmlDecl += c;
		    		          continue

		    		        case S.DOCTYPE:
		    		          if (c === '>') {
		    		            parser.state = S.TEXT;
		    		            emitNode(parser, 'ondoctype', parser.doctype);
		    		            parser.doctype = true; // just remember that we saw it.
		    		          } else {
		    		            parser.doctype += c;
		    		            if (c === '[') {
		    		              parser.state = S.DOCTYPE_DTD;
		    		            } else if (isQuote(c)) {
		    		              parser.state = S.DOCTYPE_QUOTED;
		    		              parser.q = c;
		    		            }
		    		          }
		    		          continue

		    		        case S.DOCTYPE_QUOTED:
		    		          parser.doctype += c;
		    		          if (c === parser.q) {
		    		            parser.q = '';
		    		            parser.state = S.DOCTYPE;
		    		          }
		    		          continue

		    		        case S.DOCTYPE_DTD:
		    		          if (c === ']') {
		    		            parser.doctype += c;
		    		            parser.state = S.DOCTYPE;
		    		          } else if (c === '<') {
		    		            parser.state = S.OPEN_WAKA;
		    		            parser.startTagPosition = parser.position;
		    		          } else if (isQuote(c)) {
		    		            parser.doctype += c;
		    		            parser.state = S.DOCTYPE_DTD_QUOTED;
		    		            parser.q = c;
		    		          } else {
		    		            parser.doctype += c;
		    		          }
		    		          continue

		    		        case S.DOCTYPE_DTD_QUOTED:
		    		          parser.doctype += c;
		    		          if (c === parser.q) {
		    		            parser.state = S.DOCTYPE_DTD;
		    		            parser.q = '';
		    		          }
		    		          continue

		    		        case S.COMMENT:
		    		          if (c === '-') {
		    		            parser.state = S.COMMENT_ENDING;
		    		          } else {
		    		            parser.comment += c;
		    		          }
		    		          continue

		    		        case S.COMMENT_ENDING:
		    		          if (c === '-') {
		    		            parser.state = S.COMMENT_ENDED;
		    		            parser.comment = textopts(parser.opt, parser.comment);
		    		            if (parser.comment) {
		    		              emitNode(parser, 'oncomment', parser.comment);
		    		            }
		    		            parser.comment = '';
		    		          } else {
		    		            parser.comment += '-' + c;
		    		            parser.state = S.COMMENT;
		    		          }
		    		          continue

		    		        case S.COMMENT_ENDED:
		    		          if (c !== '>') {
		    		            strictFail(parser, 'Malformed comment');
		    		            // allow <!-- blah -- bloo --> in non-strict mode,
		    		            // which is a comment of " blah -- bloo "
		    		            parser.comment += '--' + c;
		    		            parser.state = S.COMMENT;
		    		          } else if (parser.doctype && parser.doctype !== true) {
		    		            parser.state = S.DOCTYPE_DTD;
		    		          } else {
		    		            parser.state = S.TEXT;
		    		          }
		    		          continue

		    		        case S.CDATA:
		    		          if (c === ']') {
		    		            parser.state = S.CDATA_ENDING;
		    		          } else {
		    		            parser.cdata += c;
		    		          }
		    		          continue

		    		        case S.CDATA_ENDING:
		    		          if (c === ']') {
		    		            parser.state = S.CDATA_ENDING_2;
		    		          } else {
		    		            parser.cdata += ']' + c;
		    		            parser.state = S.CDATA;
		    		          }
		    		          continue

		    		        case S.CDATA_ENDING_2:
		    		          if (c === '>') {
		    		            if (parser.cdata) {
		    		              emitNode(parser, 'oncdata', parser.cdata);
		    		            }
		    		            emitNode(parser, 'onclosecdata');
		    		            parser.cdata = '';
		    		            parser.state = S.TEXT;
		    		          } else if (c === ']') {
		    		            parser.cdata += ']';
		    		          } else {
		    		            parser.cdata += ']]' + c;
		    		            parser.state = S.CDATA;
		    		          }
		    		          continue

		    		        case S.PROC_INST:
		    		          if (c === '?') {
		    		            parser.state = S.PROC_INST_ENDING;
		    		          } else if (isWhitespace(c)) {
		    		            parser.state = S.PROC_INST_BODY;
		    		          } else {
		    		            parser.procInstName += c;
		    		          }
		    		          continue

		    		        case S.PROC_INST_BODY:
		    		          if (!parser.procInstBody && isWhitespace(c)) {
		    		            continue
		    		          } else if (c === '?') {
		    		            parser.state = S.PROC_INST_ENDING;
		    		          } else {
		    		            parser.procInstBody += c;
		    		          }
		    		          continue

		    		        case S.PROC_INST_ENDING:
		    		          if (c === '>') {
		    		            emitNode(parser, 'onprocessinginstruction', {
		    		              name: parser.procInstName,
		    		              body: parser.procInstBody
		    		            });
		    		            parser.procInstName = parser.procInstBody = '';
		    		            parser.state = S.TEXT;
		    		          } else {
		    		            parser.procInstBody += '?' + c;
		    		            parser.state = S.PROC_INST_BODY;
		    		          }
		    		          continue

		    		        case S.OPEN_TAG:
		    		          if (isMatch(nameBody, c)) {
		    		            parser.tagName += c;
		    		          } else {
		    		            newTag(parser);
		    		            if (c === '>') {
		    		              openTag(parser);
		    		            } else if (c === '/') {
		    		              parser.state = S.OPEN_TAG_SLASH;
		    		            } else {
		    		              if (!isWhitespace(c)) {
		    		                strictFail(parser, 'Invalid character in tag name');
		    		              }
		    		              parser.state = S.ATTRIB;
		    		            }
		    		          }
		    		          continue

		    		        case S.OPEN_TAG_SLASH:
		    		          if (c === '>') {
		    		            openTag(parser, true);
		    		            closeTag(parser);
		    		          } else {
		    		            strictFail(parser, 'Forward-slash in opening tag not followed by >');
		    		            parser.state = S.ATTRIB;
		    		          }
		    		          continue

		    		        case S.ATTRIB:
		    		          // haven't read the attribute name yet.
		    		          if (isWhitespace(c)) {
		    		            continue
		    		          } else if (c === '>') {
		    		            openTag(parser);
		    		          } else if (c === '/') {
		    		            parser.state = S.OPEN_TAG_SLASH;
		    		          } else if (isMatch(nameStart, c)) {
		    		            parser.attribName = c;
		    		            parser.attribValue = '';
		    		            parser.state = S.ATTRIB_NAME;
		    		          } else {
		    		            strictFail(parser, 'Invalid attribute name');
		    		          }
		    		          continue

		    		        case S.ATTRIB_NAME:
		    		          if (c === '=') {
		    		            parser.state = S.ATTRIB_VALUE;
		    		          } else if (c === '>') {
		    		            strictFail(parser, 'Attribute without value');
		    		            parser.attribValue = parser.attribName;
		    		            attrib(parser);
		    		            openTag(parser);
		    		          } else if (isWhitespace(c)) {
		    		            parser.state = S.ATTRIB_NAME_SAW_WHITE;
		    		          } else if (isMatch(nameBody, c)) {
		    		            parser.attribName += c;
		    		          } else {
		    		            strictFail(parser, 'Invalid attribute name');
		    		          }
		    		          continue

		    		        case S.ATTRIB_NAME_SAW_WHITE:
		    		          if (c === '=') {
		    		            parser.state = S.ATTRIB_VALUE;
		    		          } else if (isWhitespace(c)) {
		    		            continue
		    		          } else {
		    		            strictFail(parser, 'Attribute without value');
		    		            parser.tag.attributes[parser.attribName] = '';
		    		            parser.attribValue = '';
		    		            emitNode(parser, 'onattribute', {
		    		              name: parser.attribName,
		    		              value: ''
		    		            });
		    		            parser.attribName = '';
		    		            if (c === '>') {
		    		              openTag(parser);
		    		            } else if (isMatch(nameStart, c)) {
		    		              parser.attribName = c;
		    		              parser.state = S.ATTRIB_NAME;
		    		            } else {
		    		              strictFail(parser, 'Invalid attribute name');
		    		              parser.state = S.ATTRIB;
		    		            }
		    		          }
		    		          continue

		    		        case S.ATTRIB_VALUE:
		    		          if (isWhitespace(c)) {
		    		            continue
		    		          } else if (isQuote(c)) {
		    		            parser.q = c;
		    		            parser.state = S.ATTRIB_VALUE_QUOTED;
		    		          } else {
		    		            if (!parser.opt.unquotedAttributeValues) {
		    		              error(parser, 'Unquoted attribute value');
		    		            }
		    		            parser.state = S.ATTRIB_VALUE_UNQUOTED;
		    		            parser.attribValue = c;
		    		          }
		    		          continue

		    		        case S.ATTRIB_VALUE_QUOTED:
		    		          if (c !== parser.q) {
		    		            if (c === '&') {
		    		              parser.state = S.ATTRIB_VALUE_ENTITY_Q;
		    		            } else {
		    		              parser.attribValue += c;
		    		            }
		    		            continue
		    		          }
		    		          attrib(parser);
		    		          parser.q = '';
		    		          parser.state = S.ATTRIB_VALUE_CLOSED;
		    		          continue

		    		        case S.ATTRIB_VALUE_CLOSED:
		    		          if (isWhitespace(c)) {
		    		            parser.state = S.ATTRIB;
		    		          } else if (c === '>') {
		    		            openTag(parser);
		    		          } else if (c === '/') {
		    		            parser.state = S.OPEN_TAG_SLASH;
		    		          } else if (isMatch(nameStart, c)) {
		    		            strictFail(parser, 'No whitespace between attributes');
		    		            parser.attribName = c;
		    		            parser.attribValue = '';
		    		            parser.state = S.ATTRIB_NAME;
		    		          } else {
		    		            strictFail(parser, 'Invalid attribute name');
		    		          }
		    		          continue

		    		        case S.ATTRIB_VALUE_UNQUOTED:
		    		          if (!isAttribEnd(c)) {
		    		            if (c === '&') {
		    		              parser.state = S.ATTRIB_VALUE_ENTITY_U;
		    		            } else {
		    		              parser.attribValue += c;
		    		            }
		    		            continue
		    		          }
		    		          attrib(parser);
		    		          if (c === '>') {
		    		            openTag(parser);
		    		          } else {
		    		            parser.state = S.ATTRIB;
		    		          }
		    		          continue

		    		        case S.CLOSE_TAG:
		    		          if (!parser.tagName) {
		    		            if (isWhitespace(c)) {
		    		              continue
		    		            } else if (notMatch(nameStart, c)) {
		    		              if (parser.script) {
		    		                parser.script += '</' + c;
		    		                parser.state = S.SCRIPT;
		    		              } else {
		    		                strictFail(parser, 'Invalid tagname in closing tag.');
		    		              }
		    		            } else {
		    		              parser.tagName = c;
		    		            }
		    		          } else if (c === '>') {
		    		            closeTag(parser);
		    		          } else if (isMatch(nameBody, c)) {
		    		            parser.tagName += c;
		    		          } else if (parser.script) {
		    		            parser.script += '</' + parser.tagName;
		    		            parser.tagName = '';
		    		            parser.state = S.SCRIPT;
		    		          } else {
		    		            if (!isWhitespace(c)) {
		    		              strictFail(parser, 'Invalid tagname in closing tag');
		    		            }
		    		            parser.state = S.CLOSE_TAG_SAW_WHITE;
		    		          }
		    		          continue

		    		        case S.CLOSE_TAG_SAW_WHITE:
		    		          if (isWhitespace(c)) {
		    		            continue
		    		          }
		    		          if (c === '>') {
		    		            closeTag(parser);
		    		          } else {
		    		            strictFail(parser, 'Invalid characters in closing tag');
		    		          }
		    		          continue

		    		        case S.TEXT_ENTITY:
		    		        case S.ATTRIB_VALUE_ENTITY_Q:
		    		        case S.ATTRIB_VALUE_ENTITY_U:
		    		          var returnState;
		    		          var buffer;
		    		          switch (parser.state) {
		    		            case S.TEXT_ENTITY:
		    		              returnState = S.TEXT;
		    		              buffer = 'textNode';
		    		              break

		    		            case S.ATTRIB_VALUE_ENTITY_Q:
		    		              returnState = S.ATTRIB_VALUE_QUOTED;
		    		              buffer = 'attribValue';
		    		              break

		    		            case S.ATTRIB_VALUE_ENTITY_U:
		    		              returnState = S.ATTRIB_VALUE_UNQUOTED;
		    		              buffer = 'attribValue';
		    		              break
		    		          }

		    		          if (c === ';') {
		    		            var parsedEntity = parseEntity(parser);
		    		            if (parser.opt.unparsedEntities && !Object.values(sax.XML_ENTITIES).includes(parsedEntity)) {
		    		              parser.entity = '';
		    		              parser.state = returnState;
		    		              parser.write(parsedEntity);
		    		            } else {
		    		              parser[buffer] += parsedEntity;
		    		              parser.entity = '';
		    		              parser.state = returnState;
		    		            }
		    		          } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
		    		            parser.entity += c;
		    		          } else {
		    		            strictFail(parser, 'Invalid character in entity name');
		    		            parser[buffer] += '&' + parser.entity + c;
		    		            parser.entity = '';
		    		            parser.state = returnState;
		    		          }

		    		          continue

		    		        default: /* istanbul ignore next */ {
		    		          throw new Error(parser, 'Unknown state: ' + parser.state)
		    		        }
		    		      }
		    		    } // while

		    		    if (parser.position >= parser.bufferCheckPosition) {
		    		      checkBufferLength(parser);
		    		    }
		    		    return parser
		    		  }

		    		  /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
		    		  /* istanbul ignore next */
		    		  if (!String.fromCodePoint) {
		    		    (function () {
		    		      var stringFromCharCode = String.fromCharCode;
		    		      var floor = Math.floor;
		    		      var fromCodePoint = function () {
		    		        var MAX_SIZE = 0x4000;
		    		        var codeUnits = [];
		    		        var highSurrogate;
		    		        var lowSurrogate;
		    		        var index = -1;
		    		        var length = arguments.length;
		    		        if (!length) {
		    		          return ''
		    		        }
		    		        var result = '';
		    		        while (++index < length) {
		    		          var codePoint = Number(arguments[index]);
		    		          if (
		    		            !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
		    		            codePoint < 0 || // not a valid Unicode code point
		    		            codePoint > 0x10FFFF || // not a valid Unicode code point
		    		            floor(codePoint) !== codePoint // not an integer
		    		          ) {
		    		            throw RangeError('Invalid code point: ' + codePoint)
		    		          }
		    		          if (codePoint <= 0xFFFF) { // BMP code point
		    		            codeUnits.push(codePoint);
		    		          } else { // Astral code point; split in surrogate halves
		    		            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
		    		            codePoint -= 0x10000;
		    		            highSurrogate = (codePoint >> 10) + 0xD800;
		    		            lowSurrogate = (codePoint % 0x400) + 0xDC00;
		    		            codeUnits.push(highSurrogate, lowSurrogate);
		    		          }
		    		          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
		    		            result += stringFromCharCode.apply(null, codeUnits);
		    		            codeUnits.length = 0;
		    		          }
		    		        }
		    		        return result
		    		      };
		    		      /* istanbul ignore next */
		    		      if (Object.defineProperty) {
		    		        Object.defineProperty(String, 'fromCodePoint', {
		    		          value: fromCodePoint,
		    		          configurable: true,
		    		          writable: true
		    		        });
		    		      } else {
		    		        String.fromCodePoint = fromCodePoint;
		    		      }
		    		    }());
		    		  }
		    		})(exports); 
		    	} (sax));
		    	return sax;
		    }

		    var arrayHelper;
		    var hasRequiredArrayHelper;

		    function requireArrayHelper () {
		    	if (hasRequiredArrayHelper) return arrayHelper;
		    	hasRequiredArrayHelper = 1;
		    	arrayHelper = {

		    	  isArray: function(value) {
		    	    if (Array.isArray) {
		    	      return Array.isArray(value);
		    	    }
		    	    // fallback for older browsers like  IE 8
		    	    return Object.prototype.toString.call( value ) === '[object Array]';
		    	  }

		    	};
		    	return arrayHelper;
		    }

		    var optionsHelper;
		    var hasRequiredOptionsHelper;

		    function requireOptionsHelper () {
		    	if (hasRequiredOptionsHelper) return optionsHelper;
		    	hasRequiredOptionsHelper = 1;
		    	var isArray = requireArrayHelper().isArray;

		    	optionsHelper = {

		    	  copyOptions: function (options) {
		    	    var key, copy = {};
		    	    for (key in options) {
		    	      if (options.hasOwnProperty(key)) {
		    	        copy[key] = options[key];
		    	      }
		    	    }
		    	    return copy;
		    	  },

		    	  ensureFlagExists: function (item, options) {
		    	    if (!(item in options) || typeof options[item] !== 'boolean') {
		    	      options[item] = false;
		    	    }
		    	  },

		    	  ensureSpacesExists: function (options) {
		    	    if (!('spaces' in options) || (typeof options.spaces !== 'number' && typeof options.spaces !== 'string')) {
		    	      options.spaces = 0;
		    	    }
		    	  },

		    	  ensureAlwaysArrayExists: function (options) {
		    	    if (!('alwaysArray' in options) || (typeof options.alwaysArray !== 'boolean' && !isArray(options.alwaysArray))) {
		    	      options.alwaysArray = false;
		    	    }
		    	  },

		    	  ensureKeyExists: function (key, options) {
		    	    if (!(key + 'Key' in options) || typeof options[key + 'Key'] !== 'string') {
		    	      options[key + 'Key'] = options.compact ? '_' + key : key;
		    	    }
		    	  },

		    	  checkFnExists: function (key, options) {
		    	    return key + 'Fn' in options;
		    	  }

		    	};
		    	return optionsHelper;
		    }

		    var xml2js;
		    var hasRequiredXml2js;

		    function requireXml2js () {
		    	if (hasRequiredXml2js) return xml2js;
		    	hasRequiredXml2js = 1;
		    	var sax = requireSax();
		    	var helper = requireOptionsHelper();
		    	var isArray = requireArrayHelper().isArray;

		    	var options;
		    	var currentElement;

		    	function validateOptions(userOptions) {
		    	  options = helper.copyOptions(userOptions);
		    	  helper.ensureFlagExists('ignoreDeclaration', options);
		    	  helper.ensureFlagExists('ignoreInstruction', options);
		    	  helper.ensureFlagExists('ignoreAttributes', options);
		    	  helper.ensureFlagExists('ignoreText', options);
		    	  helper.ensureFlagExists('ignoreComment', options);
		    	  helper.ensureFlagExists('ignoreCdata', options);
		    	  helper.ensureFlagExists('ignoreDoctype', options);
		    	  helper.ensureFlagExists('compact', options);
		    	  helper.ensureFlagExists('alwaysChildren', options);
		    	  helper.ensureFlagExists('addParent', options);
		    	  helper.ensureFlagExists('trim', options);
		    	  helper.ensureFlagExists('nativeType', options);
		    	  helper.ensureFlagExists('nativeTypeAttributes', options);
		    	  helper.ensureFlagExists('sanitize', options);
		    	  helper.ensureFlagExists('instructionHasAttributes', options);
		    	  helper.ensureFlagExists('captureSpacesBetweenElements', options);
		    	  helper.ensureAlwaysArrayExists(options);
		    	  helper.ensureKeyExists('declaration', options);
		    	  helper.ensureKeyExists('instruction', options);
		    	  helper.ensureKeyExists('attributes', options);
		    	  helper.ensureKeyExists('text', options);
		    	  helper.ensureKeyExists('comment', options);
		    	  helper.ensureKeyExists('cdata', options);
		    	  helper.ensureKeyExists('doctype', options);
		    	  helper.ensureKeyExists('type', options);
		    	  helper.ensureKeyExists('name', options);
		    	  helper.ensureKeyExists('elements', options);
		    	  helper.ensureKeyExists('parent', options);
		    	  helper.checkFnExists('doctype', options);
		    	  helper.checkFnExists('instruction', options);
		    	  helper.checkFnExists('cdata', options);
		    	  helper.checkFnExists('comment', options);
		    	  helper.checkFnExists('text', options);
		    	  helper.checkFnExists('instructionName', options);
		    	  helper.checkFnExists('elementName', options);
		    	  helper.checkFnExists('attributeName', options);
		    	  helper.checkFnExists('attributeValue', options);
		    	  helper.checkFnExists('attributes', options);
		    	  return options;
		    	}

		    	function nativeType(value) {
		    	  var nValue = Number(value);
		    	  if (!isNaN(nValue)) {
		    	    return nValue;
		    	  }
		    	  var bValue = value.toLowerCase();
		    	  if (bValue === 'true') {
		    	    return true;
		    	  } else if (bValue === 'false') {
		    	    return false;
		    	  }
		    	  return value;
		    	}

		    	function addField(type, value) {
		    	  var key;
		    	  if (options.compact) {
		    	    if (
		    	      !currentElement[options[type + 'Key']] &&
		    	      (isArray(options.alwaysArray) ? options.alwaysArray.indexOf(options[type + 'Key']) !== -1 : options.alwaysArray)
		    	    ) {
		    	      currentElement[options[type + 'Key']] = [];
		    	    }
		    	    if (currentElement[options[type + 'Key']] && !isArray(currentElement[options[type + 'Key']])) {
		    	      currentElement[options[type + 'Key']] = [currentElement[options[type + 'Key']]];
		    	    }
		    	    if (type + 'Fn' in options && typeof value === 'string') {
		    	      value = options[type + 'Fn'](value, currentElement);
		    	    }
		    	    if (type === 'instruction' && ('instructionFn' in options || 'instructionNameFn' in options)) {
		    	      for (key in value) {
		    	        if (value.hasOwnProperty(key)) {
		    	          if ('instructionFn' in options) {
		    	            value[key] = options.instructionFn(value[key], key, currentElement);
		    	          } else {
		    	            var temp = value[key];
		    	            delete value[key];
		    	            value[options.instructionNameFn(key, temp, currentElement)] = temp;
		    	          }
		    	        }
		    	      }
		    	    }
		    	    if (isArray(currentElement[options[type + 'Key']])) {
		    	      currentElement[options[type + 'Key']].push(value);
		    	    } else {
		    	      currentElement[options[type + 'Key']] = value;
		    	    }
		    	  } else {
		    	    if (!currentElement[options.elementsKey]) {
		    	      currentElement[options.elementsKey] = [];
		    	    }
		    	    var element = {};
		    	    element[options.typeKey] = type;
		    	    if (type === 'instruction') {
		    	      for (key in value) {
		    	        if (value.hasOwnProperty(key)) {
		    	          break;
		    	        }
		    	      }
		    	      element[options.nameKey] = 'instructionNameFn' in options ? options.instructionNameFn(key, value, currentElement) : key;
		    	      if (options.instructionHasAttributes) {
		    	        element[options.attributesKey] = value[key][options.attributesKey];
		    	        if ('instructionFn' in options) {
		    	          element[options.attributesKey] = options.instructionFn(element[options.attributesKey], key, currentElement);
		    	        }
		    	      } else {
		    	        if ('instructionFn' in options) {
		    	          value[key] = options.instructionFn(value[key], key, currentElement);
		    	        }
		    	        element[options.instructionKey] = value[key];
		    	      }
		    	    } else {
		    	      if (type + 'Fn' in options) {
		    	        value = options[type + 'Fn'](value, currentElement);
		    	      }
		    	      element[options[type + 'Key']] = value;
		    	    }
		    	    if (options.addParent) {
		    	      element[options.parentKey] = currentElement;
		    	    }
		    	    currentElement[options.elementsKey].push(element);
		    	  }
		    	}

		    	function manipulateAttributes(attributes) {
		    	  if ('attributesFn' in options && attributes) {
		    	    attributes = options.attributesFn(attributes, currentElement);
		    	  }
		    	  if ((options.trim || 'attributeValueFn' in options || 'attributeNameFn' in options || options.nativeTypeAttributes) && attributes) {
		    	    var key;
		    	    for (key in attributes) {
		    	      if (attributes.hasOwnProperty(key)) {
		    	        if (options.trim) attributes[key] = attributes[key].trim();
		    	        if (options.nativeTypeAttributes) {
		    	          attributes[key] = nativeType(attributes[key]);
		    	        }
		    	        if ('attributeValueFn' in options) attributes[key] = options.attributeValueFn(attributes[key], key, currentElement);
		    	        if ('attributeNameFn' in options) {
		    	          var temp = attributes[key];
		    	          delete attributes[key];
		    	          attributes[options.attributeNameFn(key, attributes[key], currentElement)] = temp;
		    	        }
		    	      }
		    	    }
		    	  }
		    	  return attributes;
		    	}

		    	function onInstruction(instruction) {
		    	  var attributes = {};
		    	  if (instruction.body && (instruction.name.toLowerCase() === 'xml' || options.instructionHasAttributes)) {
		    	    var attrsRegExp = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\w+))\s*/g;
		    	    var match;
		    	    while ((match = attrsRegExp.exec(instruction.body)) !== null) {
		    	      attributes[match[1]] = match[2] || match[3] || match[4];
		    	    }
		    	    attributes = manipulateAttributes(attributes);
		    	  }
		    	  if (instruction.name.toLowerCase() === 'xml') {
		    	    if (options.ignoreDeclaration) {
		    	      return;
		    	    }
		    	    currentElement[options.declarationKey] = {};
		    	    if (Object.keys(attributes).length) {
		    	      currentElement[options.declarationKey][options.attributesKey] = attributes;
		    	    }
		    	    if (options.addParent) {
		    	      currentElement[options.declarationKey][options.parentKey] = currentElement;
		    	    }
		    	  } else {
		    	    if (options.ignoreInstruction) {
		    	      return;
		    	    }
		    	    if (options.trim) {
		    	      instruction.body = instruction.body.trim();
		    	    }
		    	    var value = {};
		    	    if (options.instructionHasAttributes && Object.keys(attributes).length) {
		    	      value[instruction.name] = {};
		    	      value[instruction.name][options.attributesKey] = attributes;
		    	    } else {
		    	      value[instruction.name] = instruction.body;
		    	    }
		    	    addField('instruction', value);
		    	  }
		    	}

		    	function onStartElement(name, attributes) {
		    	  var element;
		    	  if (typeof name === 'object') {
		    	    attributes = name.attributes;
		    	    name = name.name;
		    	  }
		    	  attributes = manipulateAttributes(attributes);
		    	  if ('elementNameFn' in options) {
		    	    name = options.elementNameFn(name, currentElement);
		    	  }
		    	  if (options.compact) {
		    	    element = {};
		    	    if (!options.ignoreAttributes && attributes && Object.keys(attributes).length) {
		    	      element[options.attributesKey] = {};
		    	      var key;
		    	      for (key in attributes) {
		    	        if (attributes.hasOwnProperty(key)) {
		    	          element[options.attributesKey][key] = attributes[key];
		    	        }
		    	      }
		    	    }
		    	    if (
		    	      !(name in currentElement) &&
		    	      (isArray(options.alwaysArray) ? options.alwaysArray.indexOf(name) !== -1 : options.alwaysArray)
		    	    ) {
		    	      currentElement[name] = [];
		    	    }
		    	    if (currentElement[name] && !isArray(currentElement[name])) {
		    	      currentElement[name] = [currentElement[name]];
		    	    }
		    	    if (isArray(currentElement[name])) {
		    	      currentElement[name].push(element);
		    	    } else {
		    	      currentElement[name] = element;
		    	    }
		    	  } else {
		    	    if (!currentElement[options.elementsKey]) {
		    	      currentElement[options.elementsKey] = [];
		    	    }
		    	    element = {};
		    	    element[options.typeKey] = 'element';
		    	    element[options.nameKey] = name;
		    	    if (!options.ignoreAttributes && attributes && Object.keys(attributes).length) {
		    	      element[options.attributesKey] = attributes;
		    	    }
		    	    if (options.alwaysChildren) {
		    	      element[options.elementsKey] = [];
		    	    }
		    	    currentElement[options.elementsKey].push(element);
		    	  }
		    	  element[options.parentKey] = currentElement; // will be deleted in onEndElement() if !options.addParent
		    	  currentElement = element;
		    	}

		    	function onText(text) {
		    	  if (options.ignoreText) {
		    	    return;
		    	  }
		    	  if (!text.trim() && !options.captureSpacesBetweenElements) {
		    	    return;
		    	  }
		    	  if (options.trim) {
		    	    text = text.trim();
		    	  }
		    	  if (options.nativeType) {
		    	    text = nativeType(text);
		    	  }
		    	  if (options.sanitize) {
		    	    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		    	  }
		    	  addField('text', text);
		    	}

		    	function onComment(comment) {
		    	  if (options.ignoreComment) {
		    	    return;
		    	  }
		    	  if (options.trim) {
		    	    comment = comment.trim();
		    	  }
		    	  addField('comment', comment);
		    	}

		    	function onEndElement(name) {
		    	  var parentElement = currentElement[options.parentKey];
		    	  if (!options.addParent) {
		    	    delete currentElement[options.parentKey];
		    	  }
		    	  currentElement = parentElement;
		    	}

		    	function onCdata(cdata) {
		    	  if (options.ignoreCdata) {
		    	    return;
		    	  }
		    	  if (options.trim) {
		    	    cdata = cdata.trim();
		    	  }
		    	  addField('cdata', cdata);
		    	}

		    	function onDoctype(doctype) {
		    	  if (options.ignoreDoctype) {
		    	    return;
		    	  }
		    	  doctype = doctype.replace(/^ /, '');
		    	  if (options.trim) {
		    	    doctype = doctype.trim();
		    	  }
		    	  addField('doctype', doctype);
		    	}

		    	function onError(error) {
		    	  error.note = error; //console.error(error);
		    	}

		    	xml2js = function (xml, userOptions) {

		    	  var parser = sax.parser(true, {}) ;
		    	  var result = {};
		    	  currentElement = result;

		    	  options = validateOptions(userOptions);

		    	  {
		    	    parser.opt = {strictEntities: true};
		    	    parser.onopentag = onStartElement;
		    	    parser.ontext = onText;
		    	    parser.oncomment = onComment;
		    	    parser.onclosetag = onEndElement;
		    	    parser.onerror = onError;
		    	    parser.oncdata = onCdata;
		    	    parser.ondoctype = onDoctype;
		    	    parser.onprocessinginstruction = onInstruction;
		    	  }

		    	  {
		    	    parser.write(xml).close();
		    	  }

		    	  if (result[options.elementsKey]) {
		    	    var temp = result[options.elementsKey];
		    	    delete result[options.elementsKey];
		    	    result[options.elementsKey] = temp;
		    	    delete result.text;
		    	  }

		    	  return result;

		    	};
		    	return xml2js;
		    }

		    var xml2json;
		    var hasRequiredXml2json;

		    function requireXml2json () {
		    	if (hasRequiredXml2json) return xml2json;
		    	hasRequiredXml2json = 1;
		    	var helper = requireOptionsHelper();
		    	var xml2js = requireXml2js();

		    	function validateOptions (userOptions) {
		    	  var options = helper.copyOptions(userOptions);
		    	  helper.ensureSpacesExists(options);
		    	  return options;
		    	}

		    	xml2json = function(xml, userOptions) {
		    	  var options, js, json, parentKey;
		    	  options = validateOptions(userOptions);
		    	  js = xml2js(xml, options);
		    	  parentKey = 'compact' in options && options.compact ? '_parent' : 'parent';
		    	  // parentKey = ptions.compact ? '_parent' : 'parent'; // consider this
		    	  if ('addParent' in options && options.addParent) {
		    	    json = JSON.stringify(js, function (k, v) { return k === parentKey? '_' : v; }, options.spaces);
		    	  } else {
		    	    json = JSON.stringify(js, null, options.spaces);
		    	  }
		    	  return json.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
		    	};
		    	return xml2json;
		    }

		    var js2xml;
		    var hasRequiredJs2xml;

		    function requireJs2xml () {
		    	if (hasRequiredJs2xml) return js2xml;
		    	hasRequiredJs2xml = 1;
		    	var helper = requireOptionsHelper();
		    	var isArray = requireArrayHelper().isArray;

		    	var currentElement, currentElementName;

		    	function validateOptions(userOptions) {
		    	  var options = helper.copyOptions(userOptions);
		    	  helper.ensureFlagExists('ignoreDeclaration', options);
		    	  helper.ensureFlagExists('ignoreInstruction', options);
		    	  helper.ensureFlagExists('ignoreAttributes', options);
		    	  helper.ensureFlagExists('ignoreText', options);
		    	  helper.ensureFlagExists('ignoreComment', options);
		    	  helper.ensureFlagExists('ignoreCdata', options);
		    	  helper.ensureFlagExists('ignoreDoctype', options);
		    	  helper.ensureFlagExists('compact', options);
		    	  helper.ensureFlagExists('indentText', options);
		    	  helper.ensureFlagExists('indentCdata', options);
		    	  helper.ensureFlagExists('indentAttributes', options);
		    	  helper.ensureFlagExists('indentInstruction', options);
		    	  helper.ensureFlagExists('fullTagEmptyElement', options);
		    	  helper.ensureFlagExists('noQuotesForNativeAttributes', options);
		    	  helper.ensureSpacesExists(options);
		    	  if (typeof options.spaces === 'number') {
		    	    options.spaces = Array(options.spaces + 1).join(' ');
		    	  }
		    	  helper.ensureKeyExists('declaration', options);
		    	  helper.ensureKeyExists('instruction', options);
		    	  helper.ensureKeyExists('attributes', options);
		    	  helper.ensureKeyExists('text', options);
		    	  helper.ensureKeyExists('comment', options);
		    	  helper.ensureKeyExists('cdata', options);
		    	  helper.ensureKeyExists('doctype', options);
		    	  helper.ensureKeyExists('type', options);
		    	  helper.ensureKeyExists('name', options);
		    	  helper.ensureKeyExists('elements', options);
		    	  helper.checkFnExists('doctype', options);
		    	  helper.checkFnExists('instruction', options);
		    	  helper.checkFnExists('cdata', options);
		    	  helper.checkFnExists('comment', options);
		    	  helper.checkFnExists('text', options);
		    	  helper.checkFnExists('instructionName', options);
		    	  helper.checkFnExists('elementName', options);
		    	  helper.checkFnExists('attributeName', options);
		    	  helper.checkFnExists('attributeValue', options);
		    	  helper.checkFnExists('attributes', options);
		    	  helper.checkFnExists('fullTagEmptyElement', options);
		    	  return options;
		    	}

		    	function writeIndentation(options, depth, firstLine) {
		    	  return (!firstLine && options.spaces ? '\n' : '') + Array(depth + 1).join(options.spaces);
		    	}

		    	function writeAttributes(attributes, options, depth) {
		    	  if (options.ignoreAttributes) {
		    	    return '';
		    	  }
		    	  if ('attributesFn' in options) {
		    	    attributes = options.attributesFn(attributes, currentElementName, currentElement);
		    	  }
		    	  var key, attr, attrName, quote, result = [];
		    	  for (key in attributes) {
		    	    if (attributes.hasOwnProperty(key) && attributes[key] !== null && attributes[key] !== undefined) {
		    	      quote = options.noQuotesForNativeAttributes && typeof attributes[key] !== 'string' ? '' : '"';
		    	      attr = '' + attributes[key]; // ensure number and boolean are converted to String
		    	      attr = attr.replace(/"/g, '&quot;');
		    	      attrName = 'attributeNameFn' in options ? options.attributeNameFn(key, attr, currentElementName, currentElement) : key;
		    	      result.push((options.spaces && options.indentAttributes? writeIndentation(options, depth+1, false) : ' '));
		    	      result.push(attrName + '=' + quote + ('attributeValueFn' in options ? options.attributeValueFn(attr, key, currentElementName, currentElement) : attr) + quote);
		    	    }
		    	  }
		    	  if (attributes && Object.keys(attributes).length && options.spaces && options.indentAttributes) {
		    	    result.push(writeIndentation(options, depth, false));
		    	  }
		    	  return result.join('');
		    	}

		    	function writeDeclaration(declaration, options, depth) {
		    	  currentElement = declaration;
		    	  currentElementName = 'xml';
		    	  return options.ignoreDeclaration ? '' :  '<?' + 'xml' + writeAttributes(declaration[options.attributesKey], options, depth) + '?>';
		    	}

		    	function writeInstruction(instruction, options, depth) {
		    	  if (options.ignoreInstruction) {
		    	    return '';
		    	  }
		    	  var key;
		    	  for (key in instruction) {
		    	    if (instruction.hasOwnProperty(key)) {
		    	      break;
		    	    }
		    	  }
		    	  var instructionName = 'instructionNameFn' in options ? options.instructionNameFn(key, instruction[key], currentElementName, currentElement) : key;
		    	  if (typeof instruction[key] === 'object') {
		    	    currentElement = instruction;
		    	    currentElementName = instructionName;
		    	    return '<?' + instructionName + writeAttributes(instruction[key][options.attributesKey], options, depth) + '?>';
		    	  } else {
		    	    var instructionValue = instruction[key] ? instruction[key] : '';
		    	    if ('instructionFn' in options) instructionValue = options.instructionFn(instructionValue, key, currentElementName, currentElement);
		    	    return '<?' + instructionName + (instructionValue ? ' ' + instructionValue : '') + '?>';
		    	  }
		    	}

		    	function writeComment(comment, options) {
		    	  return options.ignoreComment ? '' : '<!--' + ('commentFn' in options ? options.commentFn(comment, currentElementName, currentElement) : comment) + '-->';
		    	}

		    	function writeCdata(cdata, options) {
		    	  return options.ignoreCdata ? '' : '<![CDATA[' + ('cdataFn' in options ? options.cdataFn(cdata, currentElementName, currentElement) : cdata.replace(']]>', ']]]]><![CDATA[>')) + ']]>';
		    	}

		    	function writeDoctype(doctype, options) {
		    	  return options.ignoreDoctype ? '' : '<!DOCTYPE ' + ('doctypeFn' in options ? options.doctypeFn(doctype, currentElementName, currentElement) : doctype) + '>';
		    	}

		    	function writeText(text, options) {
		    	  if (options.ignoreText) return '';
		    	  text = '' + text; // ensure Number and Boolean are converted to String
		    	  text = text.replace(/&amp;/g, '&'); // desanitize to avoid double sanitization
		    	  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		    	  return 'textFn' in options ? options.textFn(text, currentElementName, currentElement) : text;
		    	}

		    	function hasContent(element, options) {
		    	  var i;
		    	  if (element.elements && element.elements.length) {
		    	    for (i = 0; i < element.elements.length; ++i) {
		    	      switch (element.elements[i][options.typeKey]) {
		    	      case 'text':
		    	        if (options.indentText) {
		    	          return true;
		    	        }
		    	        break; // skip to next key
		    	      case 'cdata':
		    	        if (options.indentCdata) {
		    	          return true;
		    	        }
		    	        break; // skip to next key
		    	      case 'instruction':
		    	        if (options.indentInstruction) {
		    	          return true;
		    	        }
		    	        break; // skip to next key
		    	      case 'doctype':
		    	      case 'comment':
		    	      case 'element':
		    	        return true;
		    	      default:
		    	        return true;
		    	      }
		    	    }
		    	  }
		    	  return false;
		    	}

		    	function writeElement(element, options, depth) {
		    	  currentElement = element;
		    	  currentElementName = element.name;
		    	  var xml = [], elementName = 'elementNameFn' in options ? options.elementNameFn(element.name, element) : element.name;
		    	  xml.push('<' + elementName);
		    	  if (element[options.attributesKey]) {
		    	    xml.push(writeAttributes(element[options.attributesKey], options, depth));
		    	  }
		    	  var withClosingTag = element[options.elementsKey] && element[options.elementsKey].length || element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve';
		    	  if (!withClosingTag) {
		    	    if ('fullTagEmptyElementFn' in options) {
		    	      withClosingTag = options.fullTagEmptyElementFn(element.name, element);
		    	    } else {
		    	      withClosingTag = options.fullTagEmptyElement;
		    	    }
		    	  }
		    	  if (withClosingTag) {
		    	    xml.push('>');
		    	    if (element[options.elementsKey] && element[options.elementsKey].length) {
		    	      xml.push(writeElements(element[options.elementsKey], options, depth + 1));
		    	      currentElement = element;
		    	      currentElementName = element.name;
		    	    }
		    	    xml.push(options.spaces && hasContent(element, options) ? '\n' + Array(depth + 1).join(options.spaces) : '');
		    	    xml.push('</' + elementName + '>');
		    	  } else {
		    	    xml.push('/>');
		    	  }
		    	  return xml.join('');
		    	}

		    	function writeElements(elements, options, depth, firstLine) {
		    	  return elements.reduce(function (xml, element) {
		    	    var indent = writeIndentation(options, depth, firstLine && !xml);
		    	    switch (element.type) {
		    	    case 'element': return xml + indent + writeElement(element, options, depth);
		    	    case 'comment': return xml + indent + writeComment(element[options.commentKey], options);
		    	    case 'doctype': return xml + indent + writeDoctype(element[options.doctypeKey], options);
		    	    case 'cdata': return xml + (options.indentCdata ? indent : '') + writeCdata(element[options.cdataKey], options);
		    	    case 'text': return xml + (options.indentText ? indent : '') + writeText(element[options.textKey], options);
		    	    case 'instruction':
		    	      var instruction = {};
		    	      instruction[element[options.nameKey]] = element[options.attributesKey] ? element : element[options.instructionKey];
		    	      return xml + (options.indentInstruction ? indent : '') + writeInstruction(instruction, options, depth);
		    	    }
		    	  }, '');
		    	}

		    	function hasContentCompact(element, options, anyContent) {
		    	  var key;
		    	  for (key in element) {
		    	    if (element.hasOwnProperty(key)) {
		    	      switch (key) {
		    	      case options.parentKey:
		    	      case options.attributesKey:
		    	        break; // skip to next key
		    	      case options.textKey:
		    	        if (options.indentText || anyContent) {
		    	          return true;
		    	        }
		    	        break; // skip to next key
		    	      case options.cdataKey:
		    	        if (options.indentCdata || anyContent) {
		    	          return true;
		    	        }
		    	        break; // skip to next key
		    	      case options.instructionKey:
		    	        if (options.indentInstruction || anyContent) {
		    	          return true;
		    	        }
		    	        break; // skip to next key
		    	      case options.doctypeKey:
		    	      case options.commentKey:
		    	        return true;
		    	      default:
		    	        return true;
		    	      }
		    	    }
		    	  }
		    	  return false;
		    	}

		    	function writeElementCompact(element, name, options, depth, indent) {
		    	  currentElement = element;
		    	  currentElementName = name;
		    	  var elementName = 'elementNameFn' in options ? options.elementNameFn(name, element) : name;
		    	  if (typeof element === 'undefined' || element === null || element === '') {
		    	    return 'fullTagEmptyElementFn' in options && options.fullTagEmptyElementFn(name, element) || options.fullTagEmptyElement ? '<' + elementName + '></' + elementName + '>' : '<' + elementName + '/>';
		    	  }
		    	  var xml = [];
		    	  if (name) {
		    	    xml.push('<' + elementName);
		    	    if (typeof element !== 'object') {
		    	      xml.push('>' + writeText(element,options) + '</' + elementName + '>');
		    	      return xml.join('');
		    	    }
		    	    if (element[options.attributesKey]) {
		    	      xml.push(writeAttributes(element[options.attributesKey], options, depth));
		    	    }
		    	    var withClosingTag = hasContentCompact(element, options, true) || element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve';
		    	    if (!withClosingTag) {
		    	      if ('fullTagEmptyElementFn' in options) {
		    	        withClosingTag = options.fullTagEmptyElementFn(name, element);
		    	      } else {
		    	        withClosingTag = options.fullTagEmptyElement;
		    	      }
		    	    }
		    	    if (withClosingTag) {
		    	      xml.push('>');
		    	    } else {
		    	      xml.push('/>');
		    	      return xml.join('');
		    	    }
		    	  }
		    	  xml.push(writeElementsCompact(element, options, depth + 1, false));
		    	  currentElement = element;
		    	  currentElementName = name;
		    	  if (name) {
		    	    xml.push((indent ? writeIndentation(options, depth, false) : '') + '</' + elementName + '>');
		    	  }
		    	  return xml.join('');
		    	}

		    	function writeElementsCompact(element, options, depth, firstLine) {
		    	  var i, key, nodes, xml = [];
		    	  for (key in element) {
		    	    if (element.hasOwnProperty(key)) {
		    	      nodes = isArray(element[key]) ? element[key] : [element[key]];
		    	      for (i = 0; i < nodes.length; ++i) {
		    	        switch (key) {
		    	        case options.declarationKey: xml.push(writeDeclaration(nodes[i], options, depth)); break;
		    	        case options.instructionKey: xml.push((options.indentInstruction ? writeIndentation(options, depth, firstLine) : '') + writeInstruction(nodes[i], options, depth)); break;
		    	        case options.attributesKey: case options.parentKey: break; // skip
		    	        case options.textKey: xml.push((options.indentText ? writeIndentation(options, depth, firstLine) : '') + writeText(nodes[i], options)); break;
		    	        case options.cdataKey: xml.push((options.indentCdata ? writeIndentation(options, depth, firstLine) : '') + writeCdata(nodes[i], options)); break;
		    	        case options.doctypeKey: xml.push(writeIndentation(options, depth, firstLine) + writeDoctype(nodes[i], options)); break;
		    	        case options.commentKey: xml.push(writeIndentation(options, depth, firstLine) + writeComment(nodes[i], options)); break;
		    	        default: xml.push(writeIndentation(options, depth, firstLine) + writeElementCompact(nodes[i], key, options, depth, hasContentCompact(nodes[i], options)));
		    	        }
		    	        firstLine = firstLine && !xml.length;
		    	      }
		    	    }
		    	  }
		    	  return xml.join('');
		    	}

		    	js2xml = function (js, options) {
		    	  options = validateOptions(options);
		    	  var xml = [];
		    	  currentElement = js;
		    	  currentElementName = '_root_';
		    	  if (options.compact) {
		    	    xml.push(writeElementsCompact(js, options, 0, true));
		    	  } else {
		    	    if (js[options.declarationKey]) {
		    	      xml.push(writeDeclaration(js[options.declarationKey], options, 0));
		    	    }
		    	    if (js[options.elementsKey] && js[options.elementsKey].length) {
		    	      xml.push(writeElements(js[options.elementsKey], options, 0, !xml.length));
		    	    }
		    	  }
		    	  return xml.join('');
		    	};
		    	return js2xml;
		    }

		    var json2xml;
		    var hasRequiredJson2xml;

		    function requireJson2xml () {
		    	if (hasRequiredJson2xml) return json2xml;
		    	hasRequiredJson2xml = 1;
		    	var js2xml = requireJs2xml();

		    	json2xml = function (json, options) {
		    	  if (json instanceof Buffer) {
		    	    json = json.toString();
		    	  }
		    	  var js = null;
		    	  if (typeof (json) === 'string') {
		    	    try {
		    	      js = JSON.parse(json);
		    	    } catch (e) {
		    	      throw new Error('The JSON structure is invalid');
		    	    }
		    	  } else {
		    	    js = json;
		    	  }
		    	  return js2xml(js, options);
		    	};
		    	return json2xml;
		    }

		    /*jslint node:true */

		    var lib;
		    var hasRequiredLib;

		    function requireLib () {
		    	if (hasRequiredLib) return lib;
		    	hasRequiredLib = 1;
		    	var xml2js = requireXml2js();
		    	var xml2json = requireXml2json();
		    	var js2xml = requireJs2xml();
		    	var json2xml = requireJson2xml();

		    	lib = {
		    	  xml2js: xml2js,
		    	  xml2json: xml2json,
		    	  js2xml: js2xml,
		    	  json2xml: json2xml
		    	};
		    	return lib;
		    }

		    var v2annotationsSupport = {};

		    var hasRequiredV2annotationsSupport;

		    function requireV2annotationsSupport () {
		    	if (hasRequiredV2annotationsSupport) return v2annotationsSupport;
		    	hasRequiredV2annotationsSupport = 1;
		    	Object.defineProperty(v2annotationsSupport, "__esModule", { value: true });
		    	v2annotationsSupport.convertEntityTypeAnnotations = v2annotationsSupport.convertPropertyAnnotations = v2annotationsSupport.convertNavigationPropertyAnnotations = v2annotationsSupport.convertEntitySetAnnotations = v2annotationsSupport.convertGenericAnnotations = v2annotationsSupport.convertV2Annotations = void 0;
		    	/**
		    	 * Convert v2 annotation that were defined on the schema as standard v4 annotations.
		    	 *
		    	 * @param attributes the attribute of the current object
		    	 * @param objectType the object type
		    	 * @param objectName the object name
		    	 * @returns the converted annotations
		    	 */
		    	function convertV2Annotations(attributes, objectType, objectName) {
		    	    const annotations = [];
		    	    switch (objectType) {
		    	        case 'EntitySet':
		    	            convertEntitySetAnnotations(attributes, annotations);
		    	            break;
		    	        case 'EntityType':
		    	            convertEntityTypeAnnotations(attributes, annotations);
		    	            break;
		    	        case 'NavigationProperty':
		    	            convertNavigationPropertyAnnotations(attributes, objectName, annotations);
		    	            break;
		    	        case 'Property':
		    	            convertPropertyAnnotations(attributes, objectName, annotations);
		    	            break;
		    	    }
		    	    convertGenericAnnotations(attributes, objectName, annotations);
		    	    return annotations;
		    	}
		    	v2annotationsSupport.convertV2Annotations = convertV2Annotations;
		    	/**
		    	 * Convert annotation that can apply to all kind of objects.
		    	 *
		    	 * @param attributes the attribute of the current object
		    	 * @param objectName the object name
		    	 * @param annotations the raw annotation array
		    	 */
		    	function convertGenericAnnotations(attributes, objectName, annotations) {
		    	    /**
		    	     * Push to annotation if the condition evaluates to true.
		    	     *
		    	     * @param condition the condition to evaluate
		    	     * @param value the target value
		    	     */
		    	    function pushToAnnotations(condition, value) {
		    	        if (condition) {
		    	            annotations.push(value);
		    	        }
		    	    }
		    	    pushToAnnotations(attributes['sap:schema-version'] !== undefined, {
		    	        term: "Org.OData.Core.V1.SchemaVersion" /* CoreAnnotationTerms.SchemaVersion */,
		    	        value: {
		    	            type: 'String',
		    	            String: attributes['sap:schema-version']
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:searchable'] !== undefined, {
		    	        term: "Org.OData.Capabilities.V1.SearchRestrictions" /* CapabilitiesAnnotationTerms.SearchRestrictions */,
		    	        record: {
		    	            propertyValues: [
		    	                {
		    	                    name: 'Searchable',
		    	                    value: {
		    	                        type: 'Bool',
		    	                        Bool: attributes['sap:searchable'] === 'true'
		    	                    }
		    	                }
		    	            ]
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:pageable'] !== undefined, {
		    	        term: "Org.OData.Capabilities.V1.TopSupported" /* CapabilitiesAnnotationTerms.TopSupported */,
		    	        value: {
		    	            type: 'Bool',
		    	            Bool: attributes['sap:pageable'] === 'true'
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:pageable'] !== undefined, {
		    	        term: "Org.OData.Capabilities.V1.SkipSupported" /* CapabilitiesAnnotationTerms.SkipSupported */,
		    	        value: {
		    	            type: 'Bool',
		    	            Bool: attributes['sap:pageable'] === 'true'
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:topable'] !== undefined, {
		    	        term: "Org.OData.Capabilities.V1.TopSupported" /* CapabilitiesAnnotationTerms.TopSupported */,
		    	        value: {
		    	            type: 'Bool',
		    	            Bool: attributes['sap:topable'] === 'true'
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:requires-filter'] !== undefined, {
		    	        term: "Org.OData.Capabilities.V1.FilterRestrictions" /* CapabilitiesAnnotationTerms.FilterRestrictions */,
		    	        record: {
		    	            propertyValues: [
		    	                {
		    	                    name: 'RequiresFilter',
		    	                    value: {
		    	                        type: 'Bool',
		    	                        Bool: attributes['sap:requires-filter'] === 'true'
		    	                    }
		    	                }
		    	            ]
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:required-in-filter'] !== undefined, {
		    	        term: "Org.OData.Capabilities.V1.FilterRestrictions" /* CapabilitiesAnnotationTerms.FilterRestrictions */,
		    	        record: {
		    	            propertyValues: [
		    	                {
		    	                    name: 'RequiredProperties',
		    	                    value: {
		    	                        type: 'Collection',
		    	                        Collection: [
		    	                            {
		    	                                type: 'PropertyPath',
		    	                                PropertyPath: objectName
		    	                            }
		    	                        ]
		    	                    }
		    	                }
		    	            ]
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:filter-restricton'] !== undefined, {
		    	        term: "Org.OData.Capabilities.V1.FilterRestrictions" /* CapabilitiesAnnotationTerms.FilterRestrictions */,
		    	        record: {
		    	            propertyValues: [
		    	                {
		    	                    name: 'FilterExpressionRestrictions',
		    	                    value: {
		    	                        type: 'Collection',
		    	                        Collection: [
		    	                            {
		    	                                type: 'Record',
		    	                                propertyValues: [
		    	                                    {
		    	                                        name: 'FilterExpressionRestrictions',
		    	                                        value: {
		    	                                            type: 'String',
		    	                                            String: attributes['sap:filter-restricton']
		    	                                        }
		    	                                    },
		    	                                    {
		    	                                        name: 'Property',
		    	                                        value: {
		    	                                            type: 'PropertyPath',
		    	                                            PropertyPath: objectName
		    	                                        }
		    	                                    }
		    	                                ]
		    	                            }
		    	                        ]
		    	                    }
		    	                }
		    	            ]
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:sortable'] === 'false', {
		    	        term: "Org.OData.Capabilities.V1.SortRestrictions" /* CapabilitiesAnnotationTerms.SortRestrictions */,
		    	        record: {
		    	            propertyValues: [
		    	                {
		    	                    name: 'NonSortableProperties',
		    	                    value: {
		    	                        type: 'PropertyPath',
		    	                        PropertyPath: objectName
		    	                    }
		    	                }
		    	            ]
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:visible'] === 'false', {
		    	        term: "com.sap.vocabularies.UI.v1.Hidden" /* UIAnnotationTerms.Hidden */,
		    	        value: {
		    	            type: 'Bool',
		    	            Bool: true
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:label'] !== undefined, {
		    	        term: "com.sap.vocabularies.Common.v1.Label" /* CommonAnnotationTerms.Label */,
		    	        value: {
		    	            type: 'String',
		    	            String: attributes['sap:label']
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:heading'] !== undefined, {
		    	        term: "com.sap.vocabularies.Common.v1.Heading" /* CommonAnnotationTerms.Heading */,
		    	        value: {
		    	            type: 'String',
		    	            String: attributes['sap:heading']
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:quickinfo'] !== undefined, {
		    	        term: "com.sap.vocabularies.Common.v1.QuickInfo" /* CommonAnnotationTerms.QuickInfo */,
		    	        value: {
		    	            type: 'String',
		    	            String: attributes['sap:quickinfo']
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:text'] !== undefined, {
		    	        term: "com.sap.vocabularies.Common.v1.Text" /* CommonAnnotationTerms.Text */,
		    	        value: {
		    	            type: 'Path',
		    	            Path: attributes['sap:text']
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:unit'] !== undefined, {
		    	        term: "Org.OData.Measures.V1.Unit" /* MeasuresAnnotationTerms.Unit */,
		    	        value: {
		    	            type: 'Path',
		    	            Path: attributes['sap:unit']
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:unit'] !== undefined, {
		    	        term: "Org.OData.Measures.V1.ISOCurrency" /* MeasuresAnnotationTerms.ISOCurrency */,
		    	        value: {
		    	            type: 'Path',
		    	            Path: attributes['sap:unit']
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:precision'] !== undefined, {
		    	        term: "Org.OData.Measures.V1.Scale" /* MeasuresAnnotationTerms.Scale */,
		    	        value: {
		    	            type: 'Int',
		    	            Int: parseInt(attributes['sap:precision'], 10)
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:value-list'] === 'fixed-value', {
		    	        term: "com.sap.vocabularies.Common.v1.ValueListWithFixedValues" /* CommonAnnotationTerms.ValueListWithFixedValues */,
		    	        value: {
		    	            type: 'Bool',
		    	            Bool: true
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:display-format'] === 'NonNegative', {
		    	        term: "com.sap.vocabularies.Common.v1.IsDigitSequence" /* CommonAnnotationTerms.IsDigitSequence */,
		    	        value: {
		    	            type: 'Bool',
		    	            Bool: true
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:display-format'] === 'UpperCase', {
		    	        term: "com.sap.vocabularies.Common.v1.IsUpperCase" /* CommonAnnotationTerms.IsUpperCase */,
		    	        value: {
		    	            type: 'Bool',
		    	            Bool: true
		    	        }
		    	    });
		    	    if (attributes['sap:lower-boundary'] || attributes['sap:upper-boundary']) {
		    	        const pv = [];
		    	        if (attributes['sap:lower-boundary']) {
		    	            pv.push({
		    	                name: 'LowerBoundary',
		    	                value: {
		    	                    type: 'PropertyPath',
		    	                    PropertyPath: attributes['sap:lower-boundary']
		    	                }
		    	            });
		    	        }
		    	        if (attributes['sap:upper-boundary']) {
		    	            pv.push({
		    	                name: 'UpperBoundary',
		    	                value: {
		    	                    type: 'PropertyPath',
		    	                    PropertyPath: attributes['sap:upper-boundary']
		    	                }
		    	            });
		    	        }
		    	        annotations.push({
		    	            term: "com.sap.vocabularies.Common.v1.Interval" /* CommonAnnotationTerms.Interval */,
		    	            record: {
		    	                propertyValues: pv
		    	            }
		    	        });
		    	    }
		    	    pushToAnnotations(attributes['sap:field-control'] !== undefined, {
		    	        term: "com.sap.vocabularies.Common.v1.FieldControl" /* CommonAnnotationTerms.FieldControl */,
		    	        value: {
		    	            type: 'Path',
		    	            Path: attributes['sap:field-control']
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:applicable-path'] !== undefined, {
		    	        term: "Org.OData.Core.V1.OperationAvailable" /* CoreAnnotationTerms.OperationAvailable */,
		    	        value: {
		    	            type: 'Path',
		    	            Path: attributes['sap:applicable-path']
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:minoccurs'] !== undefined, {
		    	        term: "com.sap.vocabularies.Common.v1.MinOccurs" /* CommonAnnotationTerms.MinOccurs */,
		    	        value: {
		    	            type: 'Int',
		    	            Int: parseInt(attributes['sap:minoccurs'], 10)
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:maxoccurs'] !== undefined, {
		    	        term: "com.sap.vocabularies.Common.v1.MaxOccurs" /* CommonAnnotationTerms.MaxOccurs */,
		    	        value: {
		    	            type: 'Int',
		    	            Int: parseInt(attributes['sap:maxoccurs'], 10)
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:parameter'] === 'mandatory', {
		    	        term: "com.sap.vocabularies.Common.v1.FieldControl" /* CommonAnnotationTerms.FieldControl */,
		    	        value: {
		    	            type: 'EnumMember',
		    	            EnumMember: "Common.FieldControlType/Mandatory" /* FieldControlType.Mandatory */
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:parameter'] === 'optional', {
		    	        term: "com.sap.vocabularies.Common.v1.FieldControl" /* CommonAnnotationTerms.FieldControl */,
		    	        value: {
		    	            type: 'EnumMember',
		    	            EnumMember: "Common.FieldControlType/Optional" /* FieldControlType.Optional */
		    	        }
		    	    });
		    	    pushToAnnotations(attributes['sap:attribute-for'] !== undefined, {
		    	        term: "com.sap.vocabularies.Common.v1.Attributes" /* CommonAnnotationTerms.Attributes */,
		    	        value: {
		    	            type: 'Collection',
		    	            Collection: [
		    	                {
		    	                    type: 'PropertyPath',
		    	                    PropertyPath: objectName
		    	                }
		    	            ]
		    	        }
		    	    });
		    	}
		    	v2annotationsSupport.convertGenericAnnotations = convertGenericAnnotations;
		    	/**
		    	 * Convert annotations specific to entityset.
		    	 *
		    	 * @param attributes The V2 Annotations to evaluate
		    	 * @param annotations The raw annotation array
		    	 */
		    	function convertEntitySetAnnotations(attributes, annotations) {
		    	    if (attributes['sap:creatable']) {
		    	        annotations.push({
		    	            term: "Org.OData.Capabilities.V1.InsertRestrictions" /* CapabilitiesAnnotationTerms.InsertRestrictions */,
		    	            record: {
		    	                propertyValues: [
		    	                    {
		    	                        name: 'Insertable',
		    	                        value: {
		    	                            type: 'Bool',
		    	                            Bool: attributes['sap:creatable'] === 'true'
		    	                        }
		    	                    }
		    	                ]
		    	            }
		    	        });
		    	    }
		    	    if (attributes['sap:updatable']) {
		    	        annotations.push({
		    	            term: "Org.OData.Capabilities.V1.UpdateRestrictions" /* CapabilitiesAnnotationTerms.UpdateRestrictions */,
		    	            record: {
		    	                propertyValues: [
		    	                    {
		    	                        name: 'Updatable',
		    	                        value: {
		    	                            type: 'Bool',
		    	                            Bool: attributes['sap:updatable'] === 'true'
		    	                        }
		    	                    }
		    	                ]
		    	            }
		    	        });
		    	    }
		    	    if (attributes['sap:updatable-path']) {
		    	        annotations.push({
		    	            term: "Org.OData.Capabilities.V1.UpdateRestrictions" /* CapabilitiesAnnotationTerms.UpdateRestrictions */,
		    	            record: {
		    	                propertyValues: [
		    	                    {
		    	                        name: 'Updatable',
		    	                        value: {
		    	                            type: 'Path',
		    	                            Path: attributes['sap:updatable-path']
		    	                        }
		    	                    }
		    	                ]
		    	            }
		    	        });
		    	    }
		    	    if (attributes['sap:deletable']) {
		    	        annotations.push({
		    	            term: "Org.OData.Capabilities.V1.DeleteRestrictions" /* CapabilitiesAnnotationTerms.DeleteRestrictions */,
		    	            record: {
		    	                propertyValues: [
		    	                    {
		    	                        name: 'Deletable',
		    	                        value: {
		    	                            type: 'Bool',
		    	                            Bool: attributes['sap:updatable'] === 'true'
		    	                        }
		    	                    }
		    	                ]
		    	            }
		    	        });
		    	    }
		    	    if (attributes['sap:deletable-path']) {
		    	        annotations.push({
		    	            term: "Org.OData.Capabilities.V1.DeleteRestrictions" /* CapabilitiesAnnotationTerms.DeleteRestrictions */,
		    	            record: {
		    	                propertyValues: [
		    	                    {
		    	                        name: 'Deletable',
		    	                        value: {
		    	                            type: 'Path',
		    	                            Path: attributes['sap:deletable-path']
		    	                        }
		    	                    }
		    	                ]
		    	            }
		    	        });
		    	    }
		    	}
		    	v2annotationsSupport.convertEntitySetAnnotations = convertEntitySetAnnotations;
		    	/**
		    	 * Convert annotations specific to navigation properties.
		    	 *
		    	 * @param attributes The V2 Annotations to evaluate
		    	 * @param objectName The name of the navigation property
		    	 * @param annotations The raw annotation array
		    	 */
		    	function convertNavigationPropertyAnnotations(attributes, objectName, annotations) {
		    	    if (attributes['sap:creatable']) {
		    	        annotations.push({
		    	            term: "Org.OData.Capabilities.V1.NavigationRestrictions" /* CapabilitiesAnnotationTerms.NavigationRestrictions */,
		    	            record: {
		    	                propertyValues: [
		    	                    {
		    	                        name: 'RestrictedProperties',
		    	                        value: {
		    	                            type: 'Record',
		    	                            Record: {
		    	                                propertyValues: [
		    	                                    {
		    	                                        name: 'InsertRestrictrions',
		    	                                        value: {
		    	                                            type: 'Record',
		    	                                            Record: {
		    	                                                propertyValues: [
		    	                                                    {
		    	                                                        name: 'Insertable',
		    	                                                        value: {
		    	                                                            type: 'Bool',
		    	                                                            Bool: attributes['sap:creatable'] === 'true'
		    	                                                        }
		    	                                                    }
		    	                                                ]
		    	                                            }
		    	                                        }
		    	                                    }
		    	                                ]
		    	                            }
		    	                        }
		    	                    }
		    	                ]
		    	            }
		    	        });
		    	    }
		    	    if (attributes['sap:creatable-path']) {
		    	        annotations.push({
		    	            term: "Org.OData.Capabilities.V1.NavigationRestrictions" /* CapabilitiesAnnotationTerms.NavigationRestrictions */,
		    	            record: {
		    	                propertyValues: [
		    	                    {
		    	                        name: 'RestrictedProperties',
		    	                        value: {
		    	                            type: 'Record',
		    	                            Record: {
		    	                                propertyValues: [
		    	                                    {
		    	                                        name: 'InsertRestrictrions',
		    	                                        value: {
		    	                                            type: 'Record',
		    	                                            Record: {
		    	                                                propertyValues: [
		    	                                                    {
		    	                                                        name: 'Insertable',
		    	                                                        value: {
		    	                                                            type: 'Path',
		    	                                                            Path: attributes['sap:creatable-path']
		    	                                                        }
		    	                                                    }
		    	                                                ]
		    	                                            }
		    	                                        }
		    	                                    }
		    	                                ]
		    	                            }
		    	                        }
		    	                    }
		    	                ]
		    	            }
		    	        });
		    	    }
		    	    if (attributes['sap:filterable'] === 'false') {
		    	        annotations.push({
		    	            term: "Org.OData.Capabilities.V1.NavigationRestrictions" /* CapabilitiesAnnotationTerms.NavigationRestrictions */,
		    	            record: {
		    	                propertyValues: [
		    	                    {
		    	                        name: 'RestrictedProperties',
		    	                        value: {
		    	                            type: 'Collection',
		    	                            Collection: [
		    	                                {
		    	                                    type: 'Record',
		    	                                    propertyValues: [
		    	                                        {
		    	                                            name: 'NavigationProperty',
		    	                                            value: {
		    	                                                type: 'NavigationPropertyPath',
		    	                                                NavigationPropertyPath: objectName
		    	                                            }
		    	                                        },
		    	                                        {
		    	                                            name: 'FilterRestrictions',
		    	                                            value: {
		    	                                                type: 'Record',
		    	                                                Record: {
		    	                                                    propertyValues: [
		    	                                                        {
		    	                                                            name: 'Filterable',
		    	                                                            value: {
		    	                                                                type: 'Bool',
		    	                                                                Bool: false
		    	                                                            }
		    	                                                        }
		    	                                                    ]
		    	                                                }
		    	                                            }
		    	                                        }
		    	                                    ]
		    	                                }
		    	                            ]
		    	                        }
		    	                    }
		    	                ]
		    	            }
		    	        });
		    	    }
		    	}
		    	v2annotationsSupport.convertNavigationPropertyAnnotations = convertNavigationPropertyAnnotations;
		    	/**
		    	 * Convert annotations specific to properties.
		    	 *
		    	 * @param attributes The V2 Annotations to evaluate
		    	 * @param objectName The name of the property
		    	 * @param annotations The raw annotation array
		    	 */
		    	function convertPropertyAnnotations(attributes, objectName, annotations) {
		    	    if (attributes['sap:creatable'] === 'true' && attributes['sap:updatable'] === 'false') {
		    	        annotations.push({
		    	            term: "Org.OData.Core.V1.Immutable" /* CoreAnnotationTerms.Immutable */,
		    	            value: {
		    	                type: 'Bool',
		    	                Bool: true
		    	            }
		    	        });
		    	    }
		    	    if (attributes['sap:creatable'] === 'false' && attributes['sap:updatable'] === 'false') {
		    	        annotations.push({
		    	            term: "Org.OData.Core.V1.Computed" /* CoreAnnotationTerms.Computed */,
		    	            value: {
		    	                type: 'Bool',
		    	                Bool: true
		    	            }
		    	        });
		    	    }
		    	    if (attributes['sap:updatable-path']) {
		    	        annotations.push({
		    	            term: "com.sap.vocabularies.Common.v1.FieldControl" /* CommonAnnotationTerms.FieldControl */,
		    	            value: {
		    	                type: 'Path',
		    	                Path: attributes['sap:updatable-path']
		    	            }
		    	        });
		    	    }
		    	    if (attributes['sap:filterable'] === 'false') {
		    	        annotations.push({
		    	            term: "Org.OData.Capabilities.V1.FilterRestrictions" /* CapabilitiesAnnotationTerms.FilterRestrictions */,
		    	            record: {
		    	                propertyValues: [
		    	                    {
		    	                        name: 'NonFilterableProperties',
		    	                        value: {
		    	                            type: 'Collection',
		    	                            Collection: [
		    	                                {
		    	                                    type: 'PropertyPath',
		    	                                    PropertyPath: objectName
		    	                                }
		    	                            ]
		    	                        }
		    	                    }
		    	                ]
		    	            }
		    	        });
		    	    }
		    	}
		    	v2annotationsSupport.convertPropertyAnnotations = convertPropertyAnnotations;
		    	/**
		    	 * Convert annotations specific to properties.
		    	 *
		    	 * @param attributes The V2 Annotations to evaluate
		    	 * @param annotations The raw annotation array
		    	 */
		    	function convertEntityTypeAnnotations(attributes, annotations) {
		    	    if (attributes['sap:semantics'] === 'aggregate') {
		    	        annotations.push({
		    	            term: "Org.OData.Aggregation.V1.ApplySupported" /* AggregationAnnotationTerms.ApplySupported */,
		    	            record: {
		    	                propertyValues: [
		    	                    {
		    	                        /**
		    	                         Only properties marked as `Groupable` can be used in the `groupby` transformation, and only those marked as `Aggregatable` can be used in the  `aggregate` transformation
		    	                         */
		    	                        name: 'PropertyRestrictions',
		    	                        value: {
		    	                            type: 'Collection',
		    	                            Collection: []
		    	                        }
		    	                    },
		    	                    {
		    	                        /**
		    	                         A non-empty collection indicates that only the listed properties of the annotated target are supported by the `groupby` transformation
		    	                         */
		    	                        name: 'GroupableProperties',
		    	                        value: {
		    	                            type: 'Collection',
		    	                            Collection: []
		    	                        }
		    	                    },
		    	                    {
		    	                        /**
		    	                         A non-empty collection indicates that only the listed properties of the annotated target can be used in the `aggregate` transformation, optionally restricted to the specified aggregation methods
		    	                         */
		    	                        name: 'AggregatableProperties',
		    	                        value: {
		    	                            type: 'Collection',
		    	                            Collection: []
		    	                        }
		    	                    }
		    	                ]
		    	            }
		    	        });
		    	    }
		    	}
		    	v2annotationsSupport.convertEntityTypeAnnotations = convertEntityTypeAnnotations;
		    	
		    	return v2annotationsSupport;
		    }

		    var hasRequiredParser;

		    function requireParser () {
		    	if (hasRequiredParser) return parser;
		    	hasRequiredParser = 1;
		    	Object.defineProperty(parser, "__esModule", { value: true });
		    	parser.parse = void 0;
		    	const xml_js_1 = requireLib();
		    	const utils_1 = requireUtils$1();
		    	const v2annotationsSupport_1 = requireV2annotationsSupport();
		    	const collectionRegexp = /^Collection\((.+)\)$/;
		    	// Type guards
		    	/**
		    	 * Check whether the navigation property is a v4 navigation property.
		    	 *
		    	 * @param navPropertyAttributes
		    	 * @returns true if the navigationProperty is a v4 one
		    	 */
		    	function isV4NavProperty(navPropertyAttributes) {
		    	    return (navPropertyAttributes.Type !== null &&
		    	        navPropertyAttributes.Type !== undefined);
		    	}
		    	// Parser Methods
		    	/**
		    	 * Retrieves the name of the keys for that entity type.
		    	 *
		    	 * @param propertyRefs {EDMX.PropertyRef} property reference
		    	 * @returns the entityType keys name
		    	 */
		    	function getEntityTypeKeys(propertyRefs) {
		    	    return propertyRefs.map((propertyRef) => propertyRef._attributes.Name);
		    	}
		    	/**
		    	 * Parse the EDMX.Property to retrieve the property.
		    	 *
		    	 * @param entityProperties
		    	 * @param entityKeys
		    	 * @param entityTypeFQN
		    	 * @param annotationLists
		    	 * @returns the properties
		    	 */
		    	function parseProperties(entityProperties, entityKeys, entityTypeFQN, annotationLists) {
		    	    return entityProperties.reduce((outObject, entityProperty) => {
		    	        const edmProperty = {
		    	            _type: 'Property',
		    	            name: entityProperty._attributes.Name,
		    	            fullyQualifiedName: `${entityTypeFQN}/${entityProperty._attributes.Name}`,
		    	            type: unaliasType(entityProperty._attributes.Type).type
		    	        };
		    	        if (entityProperty._attributes.MaxLength) {
		    	            edmProperty.maxLength = parseInt(entityProperty._attributes.MaxLength, 10);
		    	        }
		    	        if (entityProperty._attributes.Precision) {
		    	            edmProperty.precision = parseInt(entityProperty._attributes.Precision, 10);
		    	        }
		    	        if (entityProperty._attributes.Scale) {
		    	            edmProperty.scale = parseInt(entityProperty._attributes.Scale, 10);
		    	        }
		    	        edmProperty.nullable = entityProperty._attributes.Nullable !== 'false';
		    	        if (entityProperty._attributes.DefaultValue) {
		    	            switch (edmProperty.type) {
		    	                case 'Edm.Int16':
		    	                case 'Edm.Byte':
		    	                case 'Edm.Int32':
		    	                case 'Edm.Int64':
		    	                    edmProperty.defaultValue = parseInt(entityProperty._attributes.DefaultValue, 10);
		    	                    break;
		    	                case 'Edm.Decimal':
		    	                case 'Edm.Double':
		    	                    edmProperty.defaultValue = parseFloat(entityProperty._attributes.DefaultValue);
		    	                    break;
		    	                case 'Edm.Boolean':
		    	                    edmProperty.defaultValue = entityProperty._attributes.DefaultValue === 'true';
		    	                    break;
		    	                default:
		    	                    edmProperty.defaultValue = entityProperty._attributes.DefaultValue;
		    	                    break;
		    	            }
		    	        }
		    	        outObject.entityProperties.push(edmProperty);
		    	        if (entityKeys.indexOf(edmProperty.name) !== -1) {
		    	            outObject.entityKeys.push(edmProperty);
		    	        }
		    	        const v2Annotations = (0, v2annotationsSupport_1.convertV2Annotations)(entityProperty._attributes, 'Property', entityProperty._attributes.Name);
		    	        if (v2Annotations.length > 0) {
		    	            annotationLists.push(createAnnotationList(edmProperty.fullyQualifiedName, v2Annotations));
		    	        }
		    	        return outObject;
		    	    }, { entityProperties: [], entityKeys: [] });
		    	}
		    	/**
		    	 * Parse the referential constraint from the EDMX into an object structure.
		    	 *
		    	 * @param referentialConstraints the EDMX referential constraints
		    	 * @param sourceTypeName the name of the source type
		    	 * @param targetTypeName the name of the target type
		    	 * @returns the object representation of the referential constraint.
		    	 */
		    	function parseReferentialConstraint(referentialConstraints, sourceTypeName, targetTypeName) {
		    	    return referentialConstraints.reduce((outArray, refCon) => {
		    	        outArray.push({
		    	            sourceTypeName: sourceTypeName,
		    	            sourceProperty: refCon._attributes.Property,
		    	            targetTypeName: targetTypeName,
		    	            targetProperty: refCon._attributes.ReferencedProperty
		    	        });
		    	        return outArray;
		    	    }, []);
		    	}
		    	/**
		    	 * Parse the v2 referential constraint from the EDMX into an object structure.
		    	 *
		    	 * @param referentialConstraints the v2 referential constraint data
		    	 * @param associationEnds the associations of the service to find the involved EntitySets.
		    	 * @returns the object representation of the referential constraint.
		    	 */
		    	function parseV2ReferentialConstraint(referentialConstraints, associationEnds) {
		    	    return referentialConstraints.reduce((outArray, refCon) => {
		    	        let sourceEnd = associationEnds.find((assEnd) => assEnd.role === refCon.Principal._attributes.Role);
		    	        let targetEnd = associationEnds.find((assEnd) => assEnd.role === refCon.Dependent._attributes.Role);
		    	        if (sourceEnd !== undefined && targetEnd !== undefined) {
		    	            let sourceProperties = (0, utils_1.ensureArray)(refCon.Principal.PropertyRef);
		    	            let targetProperties = (0, utils_1.ensureArray)(refCon.Dependent.PropertyRef);
		    	            if (sourceEnd.multiplicity !== '1') {
		    	                targetEnd = sourceEnd;
		    	                sourceEnd = associationEnds.find((assEnd) => assEnd.role === refCon.Dependent._attributes.Role); // We're reversing them so it will exist for sure
		    	                targetProperties = sourceProperties;
		    	                sourceProperties = (0, utils_1.ensureArray)(refCon.Dependent.PropertyRef);
		    	            }
		    	            for (const sourceProperty of sourceProperties) {
		    	                const propertyIndex = sourceProperties.indexOf(sourceProperty);
		    	                outArray.push({
		    	                    sourceTypeName: sourceEnd.type,
		    	                    sourceProperty: sourceProperty._attributes.Name,
		    	                    targetTypeName: targetEnd.type,
		    	                    targetProperty: targetProperties[propertyIndex]._attributes.Name
		    	                });
		    	            }
		    	        }
		    	        return outArray;
		    	    }, []);
		    	}
		    	/**
		    	 * Parse the EDMX representation of the navigation property in an object structure.
		    	 *
		    	 * @param navigationProperties the navigation property definition
		    	 * @param currentEntityType the current entity type
		    	 * @param entityTypeFQN the name of the current entity type
		    	 * @param annotationLists the list of annotations
		    	 * @returns all the navigation properties from the service
		    	 */
		    	function parseNavigationProperties(navigationProperties, currentEntityType, entityTypeFQN, annotationLists) {
		    	    return navigationProperties.reduce((outArray, navigationProperty) => {
		    	        // V4
		    	        const attributes = navigationProperty._attributes;
		    	        if (isV4NavProperty(attributes)) {
		    	            const matches = attributes.Type.match(collectionRegexp);
		    	            const isCollection = matches !== null;
		    	            const typeName = unalias(matches ? matches[1] : attributes.Type);
		    	            outArray.push({
		    	                _type: 'NavigationProperty',
		    	                name: attributes.Name,
		    	                fullyQualifiedName: `${entityTypeFQN}/${attributes.Name}`,
		    	                partner: attributes.Partner,
		    	                containsTarget: attributes.ContainsTarget === 'true',
		    	                isCollection,
		    	                targetTypeName: typeName,
		    	                referentialConstraint: parseReferentialConstraint((0, utils_1.ensureArray)(navigationProperty.ReferentialConstraint), currentEntityType._attributes.Name, typeName)
		    	            });
		    	        }
		    	        else {
		    	            // V2
		    	            const { Relationship, ToRole, FromRole } = attributes;
		    	            outArray.push({
		    	                _type: 'NavigationProperty',
		    	                name: attributes.Name,
		    	                fullyQualifiedName: `${entityTypeFQN}/${attributes.Name}`,
		    	                relationship: Relationship,
		    	                toRole: ToRole,
		    	                fromRole: FromRole
		    	            });
		    	            const v2Annotations = (0, v2annotationsSupport_1.convertV2Annotations)(attributes, 'NavigationProperty', attributes.Name);
		    	            if (v2Annotations.length > 0) {
		    	                annotationLists.push(createAnnotationList(`${entityTypeFQN}/${attributes.Name}`, v2Annotations));
		    	            }
		    	        }
		    	        return outArray;
		    	    }, []);
		    	}
		    	function parseAssociationSets(associations, namespace, entityContainer) {
		    	    return associations.map((association) => {
		    	        const associationFQN = `${namespace}.${association._attributes.Name}`;
		    	        const associationEnd = (0, utils_1.ensureArray)(association.End).map((endValue) => {
		    	            return {
		    	                entitySet: `${namespace}.${entityContainer._attributes.Name}/${endValue._attributes.EntitySet}`,
		    	                role: endValue._attributes.Role
		    	            };
		    	        });
		    	        return {
		    	            fullyQualifiedName: associationFQN,
		    	            name: association._attributes.Name,
		    	            association: association._attributes.Association,
		    	            associationEnd: associationEnd
		    	        };
		    	    });
		    	}
		    	function parseAssociations(associations, namespace) {
		    	    return associations.map((association) => {
		    	        const associationFQN = `${namespace}.${association._attributes.Name}`;
		    	        const associationEnd = (0, utils_1.ensureArray)(association.End).map((endValue) => {
		    	            return {
		    	                type: endValue._attributes.Type,
		    	                role: endValue._attributes.Role,
		    	                multiplicity: endValue._attributes.Multiplicity
		    	            };
		    	        });
		    	        return {
		    	            fullyQualifiedName: associationFQN,
		    	            name: association._attributes.Name,
		    	            associationEnd: associationEnd,
		    	            referentialConstraints: parseV2ReferentialConstraint((0, utils_1.ensureArray)(association.ReferentialConstraint), associationEnd)
		    	        };
		    	    });
		    	}
		    	function parseEntityTypes(entityTypes, annotationLists, namespace) {
		    	    return entityTypes.reduce((outArray, entityType) => {
		    	        const entityKeyNames = entityType.Key ? getEntityTypeKeys((0, utils_1.ensureArray)(entityType.Key.PropertyRef)) : [];
		    	        const entityTypeFQN = `${namespace}.${entityType._attributes.Name}`;
		    	        const { entityProperties, entityKeys } = parseProperties((0, utils_1.ensureArray)(entityType.Property), entityKeyNames, entityTypeFQN, annotationLists);
		    	        const navigationProperties = parseNavigationProperties((0, utils_1.ensureArray)(entityType.NavigationProperty), entityType, entityTypeFQN, annotationLists);
		    	        const outEntityType = {
		    	            _type: 'EntityType',
		    	            name: entityType._attributes.Name,
		    	            fullyQualifiedName: entityTypeFQN,
		    	            keys: entityKeys,
		    	            entityProperties,
		    	            actions: {},
		    	            navigationProperties: navigationProperties
		    	        };
		    	        const v2Annotations = (0, v2annotationsSupport_1.convertV2Annotations)(entityType._attributes, 'EntityType', entityType._attributes.Name);
		    	        if (v2Annotations.length > 0) {
		    	            annotationLists.push(createAnnotationList(outEntityType.fullyQualifiedName, v2Annotations));
		    	        }
		    	        outArray.push(outEntityType);
		    	        return outArray;
		    	    }, []);
		    	}
		    	function parseComplexTypes(complexTypes, annotationLists, namespace) {
		    	    return complexTypes.reduce((outArray, complexType) => {
		    	        const complexTypeFQN = `${namespace}.${complexType._attributes.Name}`;
		    	        const { entityProperties } = parseProperties((0, utils_1.ensureArray)(complexType.Property), [], complexTypeFQN, annotationLists);
		    	        const navigationProperties = parseNavigationProperties((0, utils_1.ensureArray)(complexType.NavigationProperty), complexType, complexTypeFQN, annotationLists);
		    	        outArray.push({
		    	            _type: 'ComplexType',
		    	            name: complexType._attributes.Name,
		    	            fullyQualifiedName: complexTypeFQN,
		    	            properties: entityProperties,
		    	            navigationProperties
		    	        });
		    	        return outArray;
		    	    }, []);
		    	}
		    	function parseTypeDefinitions(typeDefinitions, namespace) {
		    	    return typeDefinitions.reduce((outArray, typeDefinition) => {
		    	        const typeDefinitionFQN = `${namespace}.${typeDefinition._attributes.Name}`;
		    	        outArray.push({
		    	            _type: 'TypeDefinition',
		    	            name: typeDefinition._attributes.Name,
		    	            fullyQualifiedName: typeDefinitionFQN,
		    	            underlyingType: typeDefinition._attributes.UnderlyingType
		    	        });
		    	        return outArray;
		    	    }, []);
		    	}
		    	function parseEntitySets(entitySets, namespace, entityContainerName, annotationLists) {
		    	    const outEntitySets = entitySets.map((entitySet) => {
		    	        const navigationPropertyBinding = Object.fromEntries((0, utils_1.ensureArray)(entitySet.NavigationPropertyBinding).map((navPropertyBinding) => {
		    	            return [
		    	                navPropertyBinding._attributes.Path,
		    	                `${namespace}.${entityContainerName}/${navPropertyBinding._attributes.Target}`
		    	            ];
		    	        }));
		    	        const outEntitySet = {
		    	            _type: 'EntitySet',
		    	            name: entitySet._attributes.Name,
		    	            entityTypeName: unalias(entitySet._attributes.EntityType),
		    	            navigationPropertyBinding,
		    	            fullyQualifiedName: `${namespace}.${entityContainerName}/${entitySet._attributes.Name}`
		    	        };
		    	        const v2Annotations = (0, v2annotationsSupport_1.convertV2Annotations)(entitySet._attributes, 'EntitySet', entitySet._attributes.Name);
		    	        if (v2Annotations.length > 0) {
		    	            annotationLists.push(createAnnotationList(outEntitySet.fullyQualifiedName, v2Annotations));
		    	        }
		    	        return outEntitySet;
		    	    });
		    	    return outEntitySets;
		    	}
		    	function parseSingletons(singletons, namespace, entityContainerName, annotationLists) {
		    	    const outSingletons = singletons.map((singleton) => {
		    	        const navigationPropertyBinding = Object.fromEntries((0, utils_1.ensureArray)(singleton.NavigationPropertyBinding).map((navPropertyBinding) => {
		    	            return [
		    	                navPropertyBinding._attributes.Path,
		    	                `${namespace}.${entityContainerName}/${navPropertyBinding._attributes.Target}`
		    	            ];
		    	        }));
		    	        const outSingleton = {
		    	            _type: 'Singleton',
		    	            name: singleton._attributes.Name,
		    	            entityTypeName: unalias(singleton._attributes.Type),
		    	            nullable: singleton._attributes.Nullable !== 'false',
		    	            navigationPropertyBinding,
		    	            fullyQualifiedName: `${namespace}.${entityContainerName}/${singleton._attributes.Name}`
		    	        };
		    	        const v2Annotations = (0, v2annotationsSupport_1.convertV2Annotations)(singleton._attributes, 'Singleton', singleton._attributes.Name);
		    	        if (v2Annotations.length > 0) {
		    	            annotationLists.push(createAnnotationList(outSingleton.fullyQualifiedName, v2Annotations));
		    	        }
		    	        return outSingleton;
		    	    });
		    	    return outSingletons;
		    	}
		    	function parseActions(actions, namespace, isFunction) {
		    	    return actions.map((action) => {
		    	        const parameters = (0, utils_1.ensureArray)(action.Parameter);
		    	        const isBound = action._attributes.IsBound === 'true';
		    	        let overload;
		    	        if (isFunction) {
		    	            // function
		    	            // https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_FunctionOverloads
		    	            // Unbound: "The combination of function name and ordered set of parameter types MUST be unique within a schema."
		    	            // Bound:   "The combination of function name, binding parameter type, and ordered set of parameter types MUST be unique within a schema."
		    	            //  ==> consider all parameters for the FQN
		    	            overload = parameters.map((parameter) => unaliasType(parameter._attributes.Type).type).join(',');
		    	        }
		    	        else {
		    	            // action
		    	            overload = isBound ? unaliasType(parameters[0]._attributes.Type).type : ''; // '' = the unbound overload
		    	        }
		    	        const fullyQualifiedName = `${namespace}.${action._attributes.Name}(${overload})`;
		    	        return {
		    	            _type: 'Action',
		    	            name: action._attributes.Name,
		    	            isBound: isBound,
		    	            sourceType: isBound ? unaliasType(parameters[0]._attributes.Type).type : '',
		    	            fullyQualifiedName: fullyQualifiedName,
		    	            isFunction: isFunction,
		    	            parameters: parameters.map((param) => {
		    	                const { isCollection, type } = unaliasType(param._attributes.Type);
		    	                const edmActionParameter = {
		    	                    _type: 'ActionParameter',
		    	                    fullyQualifiedName: `${fullyQualifiedName}/${param._attributes.Name}`,
		    	                    name: `${param._attributes.Name}`,
		    	                    type,
		    	                    isCollection
		    	                };
		    	                if (param._attributes.MaxLength) {
		    	                    edmActionParameter.maxLength = parseInt(param._attributes.MaxLength, 10);
		    	                }
		    	                if (param._attributes.Precision) {
		    	                    edmActionParameter.precision = parseInt(param._attributes.Precision, 10);
		    	                }
		    	                if (param._attributes.Scale) {
		    	                    edmActionParameter.scale = parseInt(param._attributes.Scale, 10);
		    	                }
		    	                edmActionParameter.nullable = param._attributes.Nullable !== 'false';
		    	                return edmActionParameter;
		    	            }),
		    	            returnType: action.ReturnType ? unaliasType(action.ReturnType._attributes.Type).type : '',
		    	            returnCollection: action.ReturnType
		    	                ? action.ReturnType._attributes.Type.match(collectionRegexp) !== null
		    	                : false
		    	        };
		    	    });
		    	}
		    	function parseV2FunctionImport(actions, entitySets, namespace) {
		    	    return actions.map((action) => {
		    	        const targetEntitySet = entitySets.find((et) => et.name === action._attributes.EntitySet);
		    	        const actionFQN = `${namespace}/${action._attributes.Name}`;
		    	        return {
		    	            _type: 'Action',
		    	            name: action._attributes.Name,
		    	            isBound: false,
		    	            sourceType: targetEntitySet ? targetEntitySet.entityTypeName : '',
		    	            fullyQualifiedName: actionFQN,
		    	            isFunction: false,
		    	            parameters: (0, utils_1.ensureArray)(action.Parameter).map((param) => {
		    	                return {
		    	                    _type: 'ActionParameter',
		    	                    name: param._attributes.Name,
		    	                    fullyQualifiedName: `${actionFQN}/${param._attributes.Name}`,
		    	                    type: param._attributes.Type,
		    	                    isCollection: param._attributes.Type.match(/^Collection\(.+\)$/) !== null
		    	                };
		    	            }),
		    	            returnType: action._attributes.ReturnType ? action._attributes.ReturnType : '',
		    	            returnCollection: action._attributes.ReturnType
		    	                ? action._attributes.ReturnType.match(collectionRegexp) !== null
		    	                : false
		    	        };
		    	    });
		    	}
		    	function parseActionImports(imports, namespace) {
		    	    return imports.map((actionOrFunctionImport) => {
		    	        var _a;
		    	        const action = (_a = actionOrFunctionImport._attributes.Function) !== null && _a !== void 0 ? _a : actionOrFunctionImport._attributes.Action;
		    	        return {
		    	            _type: 'ActionImport',
		    	            name: unalias(actionOrFunctionImport._attributes.Name),
		    	            fullyQualifiedName: `${namespace}/${actionOrFunctionImport._attributes.Name}`,
		    	            actionName: unalias(action)
		    	        };
		    	    });
		    	}
		    	function parsePropertyValues(propertyValues, currentTarget, annotationsLists) {
		    	    return propertyValues.map((propertyValue) => {
		    	        // I don't care about the first part but need the rest and the spread operator
		    	        // eslint-disable-next-line @typescript-eslint/no-unused-vars
		    	        const { Annotation, _attributes, ...properties } = propertyValue;
		    	        const outPropertyValue = {};
		    	        if (_attributes) {
		    	            const attributeKey = Object.keys(_attributes).find((keyName) => keyName !== 'Property');
		    	            outPropertyValue.name = _attributes.Property;
		    	            const currentPropertyTarget = `${currentTarget}/${outPropertyValue.name}`;
		    	            if (properties && Object.keys(properties).length > 0) {
		    	                outPropertyValue.value = parseExpression(properties, currentPropertyTarget, annotationsLists, false);
		    	            }
		    	            else if (attributeKey) {
		    	                outPropertyValue.value = parseInlineExpression({ [attributeKey]: _attributes[attributeKey] }, currentPropertyTarget, annotationsLists);
		    	            }
		    	            if (propertyValue.Annotation) {
		    	                const propertyAnnotations = parseAnnotations((0, utils_1.ensureArray)(propertyValue.Annotation), currentPropertyTarget, annotationsLists);
		    	                if (propertyAnnotations && propertyAnnotations.length > 0) {
		    	                    annotationsLists.push(createAnnotationList(currentPropertyTarget, propertyAnnotations));
		    	                }
		    	            }
		    	        }
		    	        return outPropertyValue;
		    	    });
		    	}
		    	function parseRecord(record, currentTarget, annotationsLists) {
		    	    const recordAnnotations = parseAnnotations((0, utils_1.ensureArray)(record.Annotation), currentTarget, annotationsLists);
		    	    const outRecord = {
		    	        type: record._attributes ? unalias(record._attributes.Type) : undefined,
		    	        propertyValues: parsePropertyValues((0, utils_1.ensureArray)(record.PropertyValue), currentTarget, annotationsLists)
		    	    };
		    	    if (recordAnnotations && recordAnnotations.length > 0) {
		    	        outRecord.annotations = recordAnnotations;
		    	    }
		    	    return outRecord;
		    	}
		    	/**
		    	 * Type Guard for the type of the current collection.
		    	 *
		    	 * @param annotation
		    	 * @param propertyNameToCheck
		    	 * @returns true if the collection if of the right type
		    	 */
		    	function isExpressionOfType(annotation, propertyNameToCheck) {
		    	    return annotation[propertyNameToCheck] != null;
		    	}
		    	function parseModelPath(propertyPath, modelPathType) {
		    	    switch (modelPathType) {
		    	        case 'NavigationPropertyPath':
		    	            return { type: 'NavigationPropertyPath', NavigationPropertyPath: propertyPath._text };
		    	        case 'PropertyPath':
		    	            return { type: 'PropertyPath', PropertyPath: propertyPath._text };
		    	        case 'AnnotationPath':
		    	            return { type: 'AnnotationPath', AnnotationPath: propertyPath._text };
		    	        case 'Path':
		    	            return { type: 'Path', Path: propertyPath._text };
		    	    }
		    	}
		    	function parseCollection(collection, currentTarget, annotationsLists) {
		    	    if (isExpressionOfType(collection, 'Record')) {
		    	        const recordArray = (0, utils_1.ensureArray)(collection.Record).map((record, recordIndex) => parseRecord(record, currentTarget + '/' + recordIndex, annotationsLists));
		    	        recordArray.type = 'Record';
		    	        return recordArray;
		    	    }
		    	    else if (isExpressionOfType(collection, 'PropertyPath')) {
		    	        const propertyPathArray = (0, utils_1.ensureArray)(collection.PropertyPath).map((propertyPath) => parseModelPath(propertyPath, 'PropertyPath'));
		    	        propertyPathArray.type = 'PropertyPath';
		    	        return propertyPathArray;
		    	    }
		    	    else if (isExpressionOfType(collection, 'NavigationPropertyPath')) {
		    	        const navPropertyPathArray = (0, utils_1.ensureArray)(collection.NavigationPropertyPath).map((navPropertyPath) => parseModelPath(navPropertyPath, 'NavigationPropertyPath'));
		    	        navPropertyPathArray.type = 'NavigationPropertyPath';
		    	        return navPropertyPathArray;
		    	    }
		    	    else if (isExpressionOfType(collection, 'String')) {
		    	        const stringArray = (0, utils_1.ensureArray)(collection.String).map((stringValue) => ({
		    	            type: 'String',
		    	            String: stringValue._text
		    	        }));
		    	        stringArray.type = 'String';
		    	        return stringArray;
		    	    }
		    	    else if (isExpressionOfType(collection, 'AnnotationPath')) {
		    	        const annotationPathArray = (0, utils_1.ensureArray)(collection.AnnotationPath).map((annotationPath) => parseModelPath(annotationPath, 'AnnotationPath'));
		    	        annotationPathArray.type = 'AnnotationPath';
		    	        return annotationPathArray;
		    	    }
		    	    else if (isExpressionOfType(collection, 'Path')) {
		    	        const pathArray = (0, utils_1.ensureArray)(collection.Path).map((pathDefinition) => parseModelPath(pathDefinition, 'Path'));
		    	        pathArray.type = 'Path';
		    	        return pathArray;
		    	    }
		    	    else if (isExpressionOfType(collection, 'If')) {
		    	        const stringArray = (0, utils_1.ensureArray)(collection.If).map((stringValue) => stringValue._text);
		    	        stringArray.type = 'String';
		    	        return stringArray;
		    	    }
		    	    else if (Object.keys(collection).length === 0) {
		    	        return [];
		    	    }
		    	    else {
		    	        console.error(`Cannot parse ${JSON.stringify(collection)}, collection type is not supported`);
		    	    }
		    	    return [];
		    	}
		    	function parseChildren(expressionWithChild) {
		    	    const keys = Object.keys(expressionWithChild).filter((keyValue) => keyValue !== '_attributes' && keyValue !== 'Annotation');
		    	    let outObj = [];
		    	    keys.forEach((key) => {
		    	        if (Array.isArray(expressionWithChild[key])) {
		    	            outObj = outObj.concat(expressionWithChild[key].map((child) => {
		    	                return parseExpression({ [key]: child }, '', [], true);
		    	            }));
		    	        }
		    	        else {
		    	            outObj.push(parseExpression({ [key]: expressionWithChild[key] }, '', [], true));
		    	        }
		    	    });
		    	    return outObj;
		    	}
		    	function parseInlineExpression(expression, currentTarget, annotationsLists) {
		    	    const expressionKeys = Object.keys(expression);
		    	    if (expressionKeys.length > 1) {
		    	        throw new Error(`Too many expressions defined on a single object ${JSON.stringify(expression)}`);
		    	    }
		    	    const expressionKey = expressionKeys[0];
		    	    switch (expressionKey) {
		    	        case 'String':
		    	            return {
		    	                type: 'String',
		    	                String: expression[expressionKey]
		    	            };
		    	        case 'Bool':
		    	            return {
		    	                type: 'Bool',
		    	                Bool: expression.Bool === 'true'
		    	            };
		    	        case 'Decimal':
		    	            return {
		    	                type: 'Decimal',
		    	                Decimal: parseFloat(expression.Decimal)
		    	            };
		    	        case 'Double':
		    	            return {
		    	                type: 'Double',
		    	                Double: parseFloat(expression.Double)
		    	            };
		    	        case 'Date':
		    	            return {
		    	                type: 'Date',
		    	                Date: expression.Date
		    	            };
		    	        case 'Int':
		    	            return {
		    	                type: 'Int',
		    	                Int: parseInt(expression.Int, 10)
		    	            };
		    	        case 'Float':
		    	            return {
		    	                type: 'Float',
		    	                Float: parseFloat(expression.Float)
		    	            };
		    	        case 'Path':
		    	            return {
		    	                type: 'Path',
		    	                Path: expression.Path
		    	            };
		    	        case 'PropertyPath':
		    	            return {
		    	                type: 'PropertyPath',
		    	                PropertyPath: expression.PropertyPath
		    	            };
		    	        case 'AnnotationPath':
		    	            return {
		    	                type: 'AnnotationPath',
		    	                AnnotationPath: expression.AnnotationPath
		    	            };
		    	        case 'NavigationPropertyPath':
		    	            return {
		    	                type: 'NavigationPropertyPath',
		    	                NavigationPropertyPath: expression.NavigationPropertyPath
		    	            };
		    	        case 'EnumMember':
		    	            return {
		    	                type: 'EnumMember',
		    	                EnumMember: expression[expressionKey]
		    	            };
		    	        case 'Collection':
		    	            return {
		    	                type: 'Collection',
		    	                Collection: parseCollection(expression.Collection, currentTarget, annotationsLists)
		    	            };
		    	        case 'Record':
		    	            return {
		    	                type: 'Record',
		    	                Record: parseRecord(expression.Record, currentTarget, annotationsLists)
		    	            };
		    	        case 'Apply':
		    	            return {
		    	                type: 'Apply',
		    	                $Apply: parseChildren(expression.Apply),
		    	                $Function: parseChildren(expression.Function)
		    	            };
		    	        case 'And':
		    	            return {
		    	                type: 'And',
		    	                $And: parseChildren(expression.And)
		    	            };
		    	        case 'Or':
		    	            return {
		    	                type: 'Or',
		    	                $Or: parseChildren(expression.Or)
		    	            };
		    	        case 'Eq':
		    	            return {
		    	                type: 'Eq',
		    	                $Eq: parseChildren(expression.Eq)
		    	            };
		    	        case 'Gt':
		    	            return {
		    	                type: 'Gt',
		    	                $Gt: parseChildren(expression.Gt)
		    	            };
		    	        case 'Ge':
		    	            return {
		    	                type: 'Ge',
		    	                $Ge: parseChildren(expression.Ge)
		    	            };
		    	        case 'Lt':
		    	            return {
		    	                type: 'Lt',
		    	                $Lt: parseChildren(expression.Lt)
		    	            };
		    	        case 'Le':
		    	            return {
		    	                type: 'Le',
		    	                $Le: parseChildren(expression.Le)
		    	            };
		    	        case 'If':
		    	            return {
		    	                type: 'If',
		    	                $If: parseChildren(expression.If)
		    	            };
		    	        case 'Null':
		    	            return {
		    	                type: 'Null'
		    	            };
		    	        default:
		    	            console.error('Unsupported inline expression type ' + expressionKey);
		    	            return {
		    	                type: 'Unknown'
		    	            };
		    	    }
		    	}
		    	function parseExpression(expression, currentTarget, annotationsLists, simplifyPrimitive) {
		    	    const expressionKeys = Object.keys(expression);
		    	    if (expressionKeys.length > 1) {
		    	        throw new Error(`Too many expressions defined on a single object ${JSON.stringify(expression)}`);
		    	    }
		    	    const expressionKey = expressionKeys[0];
		    	    switch (expressionKey) {
		    	        case 'String':
		    	            if (simplifyPrimitive) {
		    	                return expression[expressionKey]._text;
		    	            }
		    	            return {
		    	                type: 'String',
		    	                String: expression[expressionKey]._text
		    	            };
		    	        case 'LabeledElement':
		    	            return {
		    	                type: 'LabeledElement',
		    	                $Name: expression.LabeledElement._attributes.Name,
		    	                $LabeledElement: parseChildren(expression.LabeledElement)[0]
		    	            };
		    	        case 'Bool':
		    	            if (simplifyPrimitive) {
		    	                return expression.Bool._text === 'true';
		    	            }
		    	            return {
		    	                type: 'Bool',
		    	                Bool: expression.Bool._text === 'true'
		    	            };
		    	        case 'Int':
		    	            if (simplifyPrimitive) {
		    	                return parseInt(expression.Int._text, 10);
		    	            }
		    	            return {
		    	                type: 'Int',
		    	                Int: parseInt(expression.Int._text, 10)
		    	            };
		    	        case 'Decimal':
		    	            if (simplifyPrimitive) {
		    	                return parseFloat(expression.Decimal._text);
		    	            }
		    	            return {
		    	                type: 'Decimal',
		    	                Decimal: parseFloat(expression.Decimal._text)
		    	            };
		    	        case 'Double':
		    	            if (simplifyPrimitive) {
		    	                return parseFloat(expression.Double._text);
		    	            }
		    	            return {
		    	                type: 'Double',
		    	                Decimal: parseFloat(expression.Double._text)
		    	            };
		    	        case 'Path':
		    	            return {
		    	                type: 'Path',
		    	                Path: expression.Path._text
		    	            };
		    	        case 'PropertyPath':
		    	            return {
		    	                type: 'PropertyPath',
		    	                PropertyPath: expression.PropertyPath._text
		    	            };
		    	        case 'NavigationPropertyPath':
		    	            return {
		    	                type: 'NavigationPropertyPath',
		    	                NavigationPropertyPath: expression.NavigationPropertyPath._text
		    	            };
		    	        case 'AnnotationPath':
		    	            return {
		    	                type: 'AnnotationPath',
		    	                AnnotationPath: expression.AnnotationPath._text
		    	            };
		    	        case 'EnumMember':
		    	            return {
		    	                type: 'EnumMember',
		    	                EnumMember: expression[expressionKey]._text
		    	            };
		    	        case 'Collection':
		    	            return {
		    	                type: 'Collection',
		    	                Collection: parseCollection(expression.Collection, currentTarget, annotationsLists)
		    	            };
		    	        case 'Record':
		    	            return {
		    	                type: 'Record',
		    	                Record: parseRecord(expression.Record, currentTarget, annotationsLists)
		    	            };
		    	        case 'Apply':
		    	            return {
		    	                type: 'Apply',
		    	                $Apply: parseChildren(expression.Apply),
		    	                $Function: expression.Apply._attributes.Function
		    	            };
		    	        case 'Null':
		    	            if (simplifyPrimitive) {
		    	                return null;
		    	            }
		    	            return {
		    	                type: 'Null'
		    	            };
		    	        case 'And':
		    	            return {
		    	                type: 'And',
		    	                $And: parseChildren(expression.And)
		    	            };
		    	        case 'Ne':
		    	            return {
		    	                type: 'Ne',
		    	                $Ne: parseChildren(expression.Ne)
		    	            };
		    	        case 'Not':
		    	            return {
		    	                type: 'Not',
		    	                $Not: parseChildren(expression.Not)[0]
		    	            };
		    	        case 'Or':
		    	            return {
		    	                type: 'Or',
		    	                $Or: parseChildren(expression.Or)
		    	            };
		    	        case 'Eq':
		    	            return {
		    	                type: 'Eq',
		    	                $Eq: parseChildren(expression.Eq)
		    	            };
		    	        case 'If':
		    	            return {
		    	                type: 'If',
		    	                $If: parseChildren(expression.If)
		    	            };
		    	        case 'Gt':
		    	            return {
		    	                type: 'Gt',
		    	                $Gt: parseChildren(expression.Gt)
		    	            };
		    	        case 'Ge':
		    	            return {
		    	                type: 'Ge',
		    	                $Ge: parseChildren(expression.Ge)
		    	            };
		    	        case 'Lt':
		    	            return {
		    	                type: 'Lt',
		    	                $Lt: parseChildren(expression.Lt)
		    	            };
		    	        case 'Le':
		    	            return {
		    	                type: 'Le',
		    	                $Le: parseChildren(expression.Le)
		    	            };
		    	        default:
		    	            console.error('Unsupported expression type ' + expressionKey);
		    	            return {
		    	                type: 'Unknown'
		    	            };
		    	    }
		    	}
		    	function parseAnnotation(annotation, currentTarget, annotationsLists) {
		    	    const { Term, Qualifier, ...others } = annotation._attributes;
		    	    const outAnnotation = {
		    	        term: unalias(Term),
		    	        qualifier: Qualifier
		    	    };
		    	    let currentAnnotationTarget = `${currentTarget}@${unalias(Term)}`;
		    	    if (Qualifier !== '' && Qualifier !== undefined) {
		    	        currentAnnotationTarget += `#${Qualifier}`;
		    	    }
		    	    if (others && Object.keys(others).length > 0) {
		    	        outAnnotation.value = parseInlineExpression(others, currentAnnotationTarget, annotationsLists);
		    	    }
		    	    if (annotation.Annotation) {
		    	        const annotationAnnotations = parseAnnotations((0, utils_1.ensureArray)(annotation.Annotation), currentAnnotationTarget, annotationsLists);
		    	        if (annotationAnnotations && annotationAnnotations.length > 0) {
		    	            outAnnotation.annotations = annotationAnnotations;
		    	        }
		    	    }
		    	    const keys = Object.keys(annotation).filter((keyValue) => keyValue !== '_attributes' && keyValue !== 'Annotation');
		    	    if (isExpressionOfType(annotation, 'Record')) {
		    	        outAnnotation.record = parseRecord(annotation.Record, currentAnnotationTarget, annotationsLists);
		    	    }
		    	    else if (isExpressionOfType(annotation, 'Collection')) {
		    	        outAnnotation.collection = parseCollection(annotation.Collection, currentAnnotationTarget, annotationsLists);
		    	    }
		    	    else if (keys.length === 1) {
		    	        outAnnotation.value = parseExpression({ [keys[0]]: annotation[keys[0]] }, currentAnnotationTarget, annotationsLists, false);
		    	    }
		    	    else if (keys.length > 1) {
		    	        console.error(`Cannot parse ${JSON.stringify(annotation)}, expression type is not supported`);
		    	    }
		    	    return outAnnotation;
		    	}
		    	function parseAnnotations(annotations, currentTarget, annotationsLists) {
		    	    return annotations.map((annotation) => parseAnnotation(annotation, currentTarget, annotationsLists));
		    	}
		    	function createAnnotationList(target, annotations) {
		    	    return {
		    	        target: target,
		    	        annotations: annotations
		    	    };
		    	}
		    	/**
		    	 * @param annotationLists
		    	 * @param annotationsLists
		    	 */
		    	function parseAnnotationLists(annotationLists, annotationsLists) {
		    	    annotationLists
		    	        .filter((annotationList) => annotationList._attributes !== undefined)
		    	        .forEach((annotationList) => {
		    	        annotationsLists.push(createAnnotationList(unalias(annotationList._attributes.Target), parseAnnotations((0, utils_1.ensureArray)(annotationList.Annotation), annotationList._attributes.Target, annotationsLists)));
		    	    });
		    	}
		    	function parseSchema(edmSchema, edmVersion, identification) {
		    	    const namespace = edmSchema._attributes.Namespace;
		    	    const annotations = [];
		    	    const entityTypes = parseEntityTypes((0, utils_1.ensureArray)(edmSchema.EntityType), annotations, namespace);
		    	    const complexTypes = parseComplexTypes((0, utils_1.ensureArray)(edmSchema.ComplexType), annotations, namespace);
		    	    const typeDefinitions = parseTypeDefinitions((0, utils_1.ensureArray)(edmSchema.TypeDefinition), namespace);
		    	    let entitySets = [];
		    	    let singletons = [];
		    	    let associationSets = [];
		    	    let entityContainer = {
		    	        _type: 'EntityContainer',
		    	        fullyQualifiedName: ''
		    	    };
		    	    let actions = [];
		    	    let actionImports = [];
		    	    if (edmSchema.EntityContainer) {
		    	        entitySets = parseEntitySets((0, utils_1.ensureArray)(edmSchema.EntityContainer.EntitySet), namespace, edmSchema.EntityContainer._attributes.Name, annotations);
		    	        singletons = parseSingletons((0, utils_1.ensureArray)(edmSchema.EntityContainer.Singleton), namespace, edmSchema.EntityContainer._attributes.Name, annotations);
		    	        associationSets = parseAssociationSets((0, utils_1.ensureArray)(edmSchema.EntityContainer.AssociationSet), namespace, edmSchema.EntityContainer);
		    	        entityContainer = {
		    	            _type: 'EntityContainer',
		    	            name: edmSchema.EntityContainer._attributes.Name,
		    	            fullyQualifiedName: `${namespace}.${edmSchema.EntityContainer._attributes.Name}`
		    	        };
		    	        if (edmVersion === '1.0') {
		    	            actions = actions.concat(parseV2FunctionImport((0, utils_1.ensureArray)(edmSchema.EntityContainer.FunctionImport), entitySets, entityContainer.fullyQualifiedName));
		    	        }
		    	        else if (edmVersion === '4.0') {
		    	            // FunctionImports
		    	            actionImports = actionImports.concat(parseActionImports((0, utils_1.ensureArray)(edmSchema.EntityContainer.FunctionImport), entityContainer.fullyQualifiedName));
		    	            // ActionImports
		    	            actionImports = actionImports.concat(parseActionImports((0, utils_1.ensureArray)(edmSchema.EntityContainer.ActionImport), entityContainer.fullyQualifiedName));
		    	        }
		    	        else {
		    	            throw new Error(`Unsupported EDMX version: ${edmVersion}`);
		    	        }
		    	    }
		    	    if (edmVersion === '4.0') {
		    	        actions = actions.concat(parseActions((0, utils_1.ensureArray)(edmSchema.Action), namespace, false));
		    	        actions = actions.concat(parseActions((0, utils_1.ensureArray)(edmSchema.Function), namespace, true));
		    	    }
		    	    const associations = parseAssociations((0, utils_1.ensureArray)(edmSchema.Association), namespace);
		    	    parseAnnotationLists((0, utils_1.ensureArray)(edmSchema.Annotations), annotations);
		    	    const annotationMap = {};
		    	    annotationMap[identification] = annotations;
		    	    return {
		    	        associations,
		    	        associationSets,
		    	        annotations: annotationMap,
		    	        entityContainer,
		    	        namespace: namespace,
		    	        entitySets,
		    	        singletons,
		    	        complexTypes,
		    	        typeDefinitions,
		    	        actions,
		    	        actionImports,
		    	        entityTypes
		    	    };
		    	}
		    	function parseReferences(references) {
		    	    return references.reduce((referencesArray, reference) => {
		    	        const includes = (0, utils_1.ensureArray)(reference['edmx:Include']);
		    	        includes.forEach((include) => {
		    	            referencesArray.push({
		    	                uri: reference._attributes.Uri,
		    	                alias: include._attributes.Alias,
		    	                namespace: include._attributes.Namespace
		    	            });
		    	        });
		    	        return referencesArray;
		    	    }, []);
		    	}
		    	let aliases = {};
		    	function unaliasType(type) {
		    	    const collection = type.match(collectionRegexp);
		    	    const _type = collection ? collection[1] : type;
		    	    const unaliasedType = unalias(_type);
		    	    return {
		    	        type: collection ? `Collection(${unaliasedType})` : unaliasedType,
		    	        isCollection: collection !== null
		    	    };
		    	}
		    	function unalias(aliasedValue) {
		    	    var _a;
		    	    if (!aliasedValue) {
		    	        return aliasedValue;
		    	    }
		    	    const separators = ['@', '/', '('];
		    	    const unaliased = [];
		    	    let start = 0;
		    	    for (let end = 0, maybeAlias = true; end < aliasedValue.length; end++) {
		    	        const char = aliasedValue[end];
		    	        if (maybeAlias && char === '.') {
		    	            const alias = aliasedValue.substring(start, end);
		    	            unaliased.push((_a = aliases[alias]) !== null && _a !== void 0 ? _a : alias);
		    	            start = end;
		    	            maybeAlias = false;
		    	        }
		    	        if (separators.includes(char)) {
		    	            unaliased.push(aliasedValue.substring(start, end + 1));
		    	            start = end + 1;
		    	            maybeAlias = true;
		    	        }
		    	    }
		    	    unaliased.push(aliasedValue.substring(start));
		    	    return unaliased.join('');
		    	}
		    	function mergeSchemas(schemas) {
		    	    const associations = schemas.reduce((associationsToReduce, schema) => {
		    	        return associationsToReduce.concat(schema.associations);
		    	    }, []);
		    	    const associationSets = schemas.reduce((associationSetsToReduce, schema) => {
		    	        return associationSetsToReduce.concat(schema.associationSets);
		    	    }, []);
		    	    const entitySets = schemas.reduce((entitySetsToReduce, schema) => {
		    	        return entitySetsToReduce.concat(schema.entitySets);
		    	    }, []);
		    	    const singletons = schemas.reduce((singletonsToReduce, schema) => {
		    	        return singletonsToReduce.concat(schema.singletons);
		    	    }, []);
		    	    const entityTypes = schemas.reduce((entityTypesToReduce, schema) => {
		    	        return entityTypesToReduce.concat(schema.entityTypes);
		    	    }, []);
		    	    const actions = schemas.reduce((actionsToReduce, schema) => {
		    	        return actionsToReduce.concat(schema.actions);
		    	    }, []);
		    	    const actionImports = schemas.reduce((actionImportsToReduce, schema) => {
		    	        return actionImportsToReduce.concat(schema.actionImports);
		    	    }, []);
		    	    const complexTypes = schemas.reduce((complexTypesToReduces, schema) => {
		    	        return complexTypesToReduces.concat(schema.complexTypes);
		    	    }, []);
		    	    const typeDefinitions = schemas.reduce((typeDefinitionsToReduce, schema) => {
		    	        return typeDefinitionsToReduce.concat(schema.typeDefinitions);
		    	    }, []);
		    	    let annotationMap = {};
		    	    schemas.forEach((schema) => {
		    	        annotationMap = Object.assign(annotationMap, schema.annotations);
		    	    });
		    	    let entityContainer;
		    	    let namespace;
		    	    schemas.forEach((schema) => {
		    	        if (schema.entityContainer && Object.keys(schema.entityContainer).length > 0) {
		    	            entityContainer = schema.entityContainer;
		    	            namespace = schema.namespace;
		    	        }
		    	    });
		    	    // V2 case
		    	    entitySets.forEach((entitySet) => {
		    	        const entityType = entityTypes.find((rawEntityType) => rawEntityType.fullyQualifiedName === entitySet.entityTypeName);
		    	        entityType === null || entityType === void 0 ? void 0 : entityType.navigationProperties.forEach((navProp) => {
		    	            const v2NavProp = navProp;
		    	            const associationSet = associationSets.find((assoc) => assoc.association === v2NavProp.relationship);
		    	            if (associationSet) {
		    	                const targetEntitySet = associationSet.associationEnd.find((associationEnd) => associationEnd.entitySet !== entitySet.fullyQualifiedName);
		    	                if (targetEntitySet) {
		    	                    entitySet.navigationPropertyBinding[navProp.name] = targetEntitySet.entitySet;
		    	                }
		    	            }
		    	        });
		    	    });
		    	    entityTypes.forEach((entityType) => {
		    	        entityType.navigationProperties.forEach((navProp) => {
		    	            const v2NavProp = navProp;
		    	            const association = associations.find((assoc) => assoc.fullyQualifiedName === v2NavProp.relationship);
		    	            if (association && association.referentialConstraints && association.referentialConstraints.length > 0) {
		    	                if (association.referentialConstraints[0].sourceTypeName === entityType.fullyQualifiedName) {
		    	                    v2NavProp.referentialConstraint = association.referentialConstraints;
		    	                }
		    	                else {
		    	                    v2NavProp.referentialConstraint = association.referentialConstraints.map((refConstraint) => {
		    	                        return {
		    	                            sourceTypeName: refConstraint.targetTypeName,
		    	                            sourceProperty: refConstraint.targetProperty,
		    	                            targetTypeName: refConstraint.sourceTypeName,
		    	                            targetProperty: refConstraint.sourceProperty
		    	                        };
		    	                    });
		    	                }
		    	            }
		    	        });
		    	    });
		    	    return {
		    	        associations,
		    	        associationSets,
		    	        annotations: annotationMap,
		    	        entityContainer,
		    	        namespace: namespace,
		    	        entitySets,
		    	        singletons,
		    	        complexTypes,
		    	        typeDefinitions,
		    	        actions,
		    	        actionImports,
		    	        entityTypes
		    	    };
		    	}
		    	function createAliasMap(references, schemas) {
		    	    aliases = references.reduce((map, reference) => {
		    	        map[reference.alias] = reference.namespace;
		    	        return map;
		    	    }, {});
		    	    schemas
		    	        .filter((schema) => schema._attributes.Alias)
		    	        .forEach((schema) => {
		    	        aliases[schema._attributes.Alias] = schema._attributes.Namespace;
		    	    });
		    	}
		    	/**
		    	 * Parse an edmx file and return an object structure representing the service definition.
		    	 *
		    	 * @param xml {string} the original XML string
		    	 * @param fileIdentification {string} a way to identify this file
		    	 * @returns the parsed metadata definition
		    	 */
		    	function parse(xml, fileIdentification = 'serviceFile') {
		    	    const jsonObj = (0, xml_js_1.xml2js)(xml, { compact: true });
		    	    const version = jsonObj['edmx:Edmx']._attributes.Version;
		    	    const schemas = (0, utils_1.ensureArray)(jsonObj['edmx:Edmx']['edmx:DataServices'].Schema);
		    	    const references = parseReferences((0, utils_1.ensureArray)(jsonObj['edmx:Edmx']['edmx:Reference']));
		    	    createAliasMap(references, schemas);
		    	    const parsedSchemas = schemas.map((schema) => {
		    	        return parseSchema(schema, version, fileIdentification);
		    	    });
		    	    const edmxDocument = new utils_1.RawMetadataInstance(fileIdentification, version, mergeSchemas(parsedSchemas), references);
		    	    return edmxDocument;
		    	}
		    	parser.parse = parse;
		    	
		    	return parser;
		    }

		    var hasRequiredDist$2;

		    function requireDist$2 () {
		    	if (hasRequiredDist$2) return dist$2;
		    	hasRequiredDist$2 = 1;
		    	(function (exports) {
		    		Object.defineProperty(exports, "__esModule", { value: true });
		    		exports.parse = exports.merge = void 0;
		    		var merger_1 = requireMerger();
		    		Object.defineProperty(exports, "merge", { enumerable: true, get: function () { return merger_1.merge; } });
		    		var parser_1 = requireParser();
		    		Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return parser_1.parse; } });
		    		
		    	} (dist$2));
		    	return dist$2;
		    }

		    var distExports$2 = requireDist$2();

		    var dist$1 = {};

		    var converter = {};

		    var VocabularyReferences = {};

		    var hasRequiredVocabularyReferences;

		    function requireVocabularyReferences () {
		    	if (hasRequiredVocabularyReferences) return VocabularyReferences;
		    	hasRequiredVocabularyReferences = 1;
		    	Object.defineProperty(VocabularyReferences, "__esModule", { value: true });
		    	VocabularyReferences.VocabularyReferences = void 0;
		    	/**
		    	 * The list of vocabularies with default aliases.
		    	 */
		    	VocabularyReferences.VocabularyReferences = [
		    	    { alias: "Authorization", namespace: "Org.OData.Authorization.V1", uri: "https://oasis-tcs.github.io/odata-vocabularies/vocabularies/Org.OData.Authorization.V1.xml" },
		    	    { alias: "Core", namespace: "Org.OData.Core.V1", uri: "https://oasis-tcs.github.io/odata-vocabularies/vocabularies/Org.OData.Core.V1.xml" },
		    	    { alias: "Capabilities", namespace: "Org.OData.Capabilities.V1", uri: "https://oasis-tcs.github.io/odata-vocabularies/vocabularies/Org.OData.Capabilities.V1.xml" },
		    	    { alias: "Aggregation", namespace: "Org.OData.Aggregation.V1", uri: "https://oasis-tcs.github.io/odata-vocabularies/vocabularies/Org.OData.Aggregation.V1.xml" },
		    	    { alias: "Validation", namespace: "Org.OData.Validation.V1", uri: "https://oasis-tcs.github.io/odata-vocabularies/vocabularies/Org.OData.Validation.V1.xml" },
		    	    { alias: "Measures", namespace: "Org.OData.Measures.V1", uri: "https://oasis-tcs.github.io/odata-vocabularies/vocabularies/Org.OData.Measures.V1.xml" },
		    	    { alias: "Analytics", namespace: "com.sap.vocabularies.Analytics.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/Analytics.xml" },
		    	    { alias: "Common", namespace: "com.sap.vocabularies.Common.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/Common.xml" },
		    	    { alias: "CodeList", namespace: "com.sap.vocabularies.CodeList.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/CodeList.xml" },
		    	    { alias: "Communication", namespace: "com.sap.vocabularies.Communication.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/Communication.xml" },
		    	    { alias: "Hierarchy", namespace: "com.sap.vocabularies.Hierarchy.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/Hierarchy.xml" },
		    	    { alias: "PersonalData", namespace: "com.sap.vocabularies.PersonalData.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/PersonalData.xml" },
		    	    { alias: "Session", namespace: "com.sap.vocabularies.Session.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/Session.xml" },
		    	    { alias: "UI", namespace: "com.sap.vocabularies.UI.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/UI.xml" },
		    	    { alias: "HTML5", namespace: "com.sap.vocabularies.HTML5.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/HTML5.xml" }
		    	];
		    	return VocabularyReferences;
		    }

		    var utils = {};

		    var EnumIsFlag = {};

		    var hasRequiredEnumIsFlag;

		    function requireEnumIsFlag () {
		    	if (hasRequiredEnumIsFlag) return EnumIsFlag;
		    	hasRequiredEnumIsFlag = 1;
		    	Object.defineProperty(EnumIsFlag, "__esModule", { value: true });
		    	EnumIsFlag.EnumIsFlag = void 0;
		    	EnumIsFlag.EnumIsFlag = {
		    	    "Authorization.KeyLocation": false,
		    	    "Core.RevisionKind": false,
		    	    "Core.DataModificationOperationKind": false,
		    	    "Core.Permission": true,
		    	    "Capabilities.ConformanceLevelType": false,
		    	    "Capabilities.IsolationLevel": true,
		    	    "Capabilities.NavigationType": false,
		    	    "Capabilities.SearchExpressions": true,
		    	    "Capabilities.HttpMethod": true,
		    	    "Aggregation.RollupType": false,
		    	    "Common.TextFormatType": false,
		    	    "Common.FilterExpressionType": false,
		    	    "Common.FieldControlType": false,
		    	    "Common.EffectType": true,
		    	    "Communication.KindType": false,
		    	    "Communication.ContactInformationType": true,
		    	    "Communication.PhoneType": true,
		    	    "Communication.GenderType": false,
		    	    "UI.VisualizationType": false,
		    	    "UI.CriticalityType": false,
		    	    "UI.ImprovementDirectionType": false,
		    	    "UI.TrendType": false,
		    	    "UI.ChartType": false,
		    	    "UI.ChartAxisScaleBehaviorType": false,
		    	    "UI.ChartAxisAutoScaleDataScopeType": false,
		    	    "UI.ChartDimensionRoleType": false,
		    	    "UI.ChartMeasureRoleType": false,
		    	    "UI.SelectionRangeSignType": false,
		    	    "UI.SelectionRangeOptionType": false,
		    	    "UI.TextArrangementType": false,
		    	    "UI.ImportanceType": false,
		    	    "UI.CriticalityRepresentationType": false,
		    	    "UI.OperationGroupingType": false,
		    	};
		    	return EnumIsFlag;
		    }

		    var TermToTypes = {};

		    var hasRequiredTermToTypes;

		    function requireTermToTypes () {
		    	if (hasRequiredTermToTypes) return TermToTypes;
		    	hasRequiredTermToTypes = 1;
		    	(function (exports) {
		    		Object.defineProperty(exports, "__esModule", { value: true });
		    		exports.TermToTypes = void 0;
		    		(function (TermToTypes) {
		    		    TermToTypes["Org.OData.Authorization.V1.SecuritySchemes"] = "Org.OData.Authorization.V1.SecurityScheme";
		    		    TermToTypes["Org.OData.Authorization.V1.Authorizations"] = "Org.OData.Authorization.V1.Authorization";
		    		    TermToTypes["Org.OData.Core.V1.Revisions"] = "Org.OData.Core.V1.RevisionType";
		    		    TermToTypes["Org.OData.Core.V1.Links"] = "Org.OData.Core.V1.Link";
		    		    TermToTypes["Org.OData.Core.V1.Example"] = "Org.OData.Core.V1.ExampleValue";
		    		    TermToTypes["Org.OData.Core.V1.Messages"] = "Org.OData.Core.V1.MessageType";
		    		    TermToTypes["Org.OData.Core.V1.ValueException"] = "Org.OData.Core.V1.ValueExceptionType";
		    		    TermToTypes["Org.OData.Core.V1.ResourceException"] = "Org.OData.Core.V1.ResourceExceptionType";
		    		    TermToTypes["Org.OData.Core.V1.DataModificationException"] = "Org.OData.Core.V1.DataModificationExceptionType";
		    		    TermToTypes["Org.OData.Core.V1.IsLanguageDependent"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.AppliesViaContainer"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.DereferenceableIDs"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.ConventionalIDs"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.Permissions"] = "Org.OData.Core.V1.Permission";
		    		    TermToTypes["Org.OData.Core.V1.DefaultNamespace"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.Immutable"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.Computed"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.ComputedDefaultValue"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.IsURL"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.IsMediaType"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.ContentDisposition"] = "Org.OData.Core.V1.ContentDispositionType";
		    		    TermToTypes["Org.OData.Core.V1.OptimisticConcurrency"] = "Edm.PropertyPath";
		    		    TermToTypes["Org.OData.Core.V1.AdditionalProperties"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.AutoExpand"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.AutoExpandReferences"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.MayImplement"] = "Org.OData.Core.V1.QualifiedTypeName";
		    		    TermToTypes["Org.OData.Core.V1.Ordered"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.PositionalInsert"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.AlternateKeys"] = "Org.OData.Core.V1.AlternateKey";
		    		    TermToTypes["Org.OData.Core.V1.OptionalParameter"] = "Org.OData.Core.V1.OptionalParameterType";
		    		    TermToTypes["Org.OData.Core.V1.OperationAvailable"] = "Edm.Boolean";
		    		    TermToTypes["Org.OData.Core.V1.RequiresExplicitBinding"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.ExplicitOperationBindings"] = "Org.OData.Core.V1.QualifiedBoundOperationName";
		    		    TermToTypes["Org.OData.Core.V1.SymbolicName"] = "Org.OData.Core.V1.SimpleIdentifier";
		    		    TermToTypes["Org.OData.Core.V1.GeometryFeature"] = "Org.OData.Core.V1.GeometryFeatureType";
		    		    TermToTypes["Org.OData.Core.V1.AnyStructure"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Core.V1.IsDelta"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Capabilities.V1.ConformanceLevel"] = "Org.OData.Capabilities.V1.ConformanceLevelType";
		    		    TermToTypes["Org.OData.Capabilities.V1.AsynchronousRequestsSupported"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Capabilities.V1.BatchContinueOnErrorSupported"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Capabilities.V1.IsolationSupported"] = "Org.OData.Capabilities.V1.IsolationLevel";
		    		    TermToTypes["Org.OData.Capabilities.V1.CrossJoinSupported"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Capabilities.V1.CallbackSupported"] = "Org.OData.Capabilities.V1.CallbackType";
		    		    TermToTypes["Org.OData.Capabilities.V1.ChangeTracking"] = "Org.OData.Capabilities.V1.ChangeTrackingType";
		    		    TermToTypes["Org.OData.Capabilities.V1.CountRestrictions"] = "Org.OData.Capabilities.V1.CountRestrictionsType";
		    		    TermToTypes["Org.OData.Capabilities.V1.NavigationRestrictions"] = "Org.OData.Capabilities.V1.NavigationRestrictionsType";
		    		    TermToTypes["Org.OData.Capabilities.V1.IndexableByKey"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Capabilities.V1.TopSupported"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Capabilities.V1.SkipSupported"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Capabilities.V1.ComputeSupported"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Capabilities.V1.SelectSupport"] = "Org.OData.Capabilities.V1.SelectSupportType";
		    		    TermToTypes["Org.OData.Capabilities.V1.BatchSupported"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Capabilities.V1.BatchSupport"] = "Org.OData.Capabilities.V1.BatchSupportType";
		    		    TermToTypes["Org.OData.Capabilities.V1.FilterRestrictions"] = "Org.OData.Capabilities.V1.FilterRestrictionsType";
		    		    TermToTypes["Org.OData.Capabilities.V1.SortRestrictions"] = "Org.OData.Capabilities.V1.SortRestrictionsType";
		    		    TermToTypes["Org.OData.Capabilities.V1.ExpandRestrictions"] = "Org.OData.Capabilities.V1.ExpandRestrictionsType";
		    		    TermToTypes["Org.OData.Capabilities.V1.SearchRestrictions"] = "Org.OData.Capabilities.V1.SearchRestrictionsType";
		    		    TermToTypes["Org.OData.Capabilities.V1.KeyAsSegmentSupported"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Capabilities.V1.QuerySegmentSupported"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Capabilities.V1.InsertRestrictions"] = "Org.OData.Capabilities.V1.InsertRestrictionsType";
		    		    TermToTypes["Org.OData.Capabilities.V1.DeepInsertSupport"] = "Org.OData.Capabilities.V1.DeepInsertSupportType";
		    		    TermToTypes["Org.OData.Capabilities.V1.UpdateRestrictions"] = "Org.OData.Capabilities.V1.UpdateRestrictionsType";
		    		    TermToTypes["Org.OData.Capabilities.V1.DeepUpdateSupport"] = "Org.OData.Capabilities.V1.DeepUpdateSupportType";
		    		    TermToTypes["Org.OData.Capabilities.V1.DeleteRestrictions"] = "Org.OData.Capabilities.V1.DeleteRestrictionsType";
		    		    TermToTypes["Org.OData.Capabilities.V1.CollectionPropertyRestrictions"] = "Org.OData.Capabilities.V1.CollectionPropertyRestrictionsType";
		    		    TermToTypes["Org.OData.Capabilities.V1.OperationRestrictions"] = "Org.OData.Capabilities.V1.OperationRestrictionsType";
		    		    TermToTypes["Org.OData.Capabilities.V1.AnnotationValuesInQuerySupported"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Capabilities.V1.ModificationQueryOptions"] = "Org.OData.Capabilities.V1.ModificationQueryOptionsType";
		    		    TermToTypes["Org.OData.Capabilities.V1.ReadRestrictions"] = "Org.OData.Capabilities.V1.ReadRestrictionsType";
		    		    TermToTypes["Org.OData.Capabilities.V1.CustomHeaders"] = "Org.OData.Capabilities.V1.CustomParameter";
		    		    TermToTypes["Org.OData.Capabilities.V1.CustomQueryOptions"] = "Org.OData.Capabilities.V1.CustomParameter";
		    		    TermToTypes["Org.OData.Capabilities.V1.MediaLocationUpdateSupported"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Capabilities.V1.DefaultCapabilities"] = "Org.OData.Capabilities.V1.DefaultCapabilitiesType";
		    		    TermToTypes["Org.OData.Aggregation.V1.ApplySupported"] = "Org.OData.Aggregation.V1.ApplySupportedType";
		    		    TermToTypes["Org.OData.Aggregation.V1.ApplySupportedDefaults"] = "Org.OData.Aggregation.V1.ApplySupportedBase";
		    		    TermToTypes["Org.OData.Aggregation.V1.Groupable"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Aggregation.V1.Aggregatable"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Aggregation.V1.ContextDefiningProperties"] = "Edm.PropertyPath";
		    		    TermToTypes["Org.OData.Aggregation.V1.LeveledHierarchy"] = "Edm.PropertyPath";
		    		    TermToTypes["Org.OData.Aggregation.V1.RecursiveHierarchy"] = "Org.OData.Aggregation.V1.RecursiveHierarchyType";
		    		    TermToTypes["Org.OData.Aggregation.V1.AvailableOnAggregates"] = "Org.OData.Aggregation.V1.AvailableOnAggregatesType";
		    		    TermToTypes["Org.OData.Validation.V1.Minimum"] = "Edm.PrimitiveType";
		    		    TermToTypes["Org.OData.Validation.V1.Maximum"] = "Edm.PrimitiveType";
		    		    TermToTypes["Org.OData.Validation.V1.Exclusive"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["Org.OData.Validation.V1.AllowedValues"] = "Org.OData.Validation.V1.AllowedValue";
		    		    TermToTypes["Org.OData.Validation.V1.MultipleOf"] = "Edm.Decimal";
		    		    TermToTypes["Org.OData.Validation.V1.Constraint"] = "Org.OData.Validation.V1.ConstraintType";
		    		    TermToTypes["Org.OData.Validation.V1.ItemsOf"] = "Org.OData.Validation.V1.ItemsOfType";
		    		    TermToTypes["Org.OData.Validation.V1.OpenPropertyTypeConstraint"] = "Org.OData.Validation.V1.SingleOrCollectionType";
		    		    TermToTypes["Org.OData.Validation.V1.DerivedTypeConstraint"] = "Org.OData.Validation.V1.SingleOrCollectionType";
		    		    TermToTypes["Org.OData.Validation.V1.AllowedTerms"] = "Org.OData.Core.V1.QualifiedTermName";
		    		    TermToTypes["Org.OData.Validation.V1.ApplicableTerms"] = "Org.OData.Core.V1.QualifiedTermName";
		    		    TermToTypes["Org.OData.Validation.V1.MaxItems"] = "Edm.Int64";
		    		    TermToTypes["Org.OData.Validation.V1.MinItems"] = "Edm.Int64";
		    		    TermToTypes["Org.OData.Measures.V1.Scale"] = "Edm.Byte";
		    		    TermToTypes["Org.OData.Measures.V1.DurationGranularity"] = "Org.OData.Measures.V1.DurationGranularityType";
		    		    TermToTypes["com.sap.vocabularies.Analytics.v1.Dimension"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Analytics.v1.Measure"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Analytics.v1.AccumulativeMeasure"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Analytics.v1.RolledUpPropertyCount"] = "Edm.Int16";
		    		    TermToTypes["com.sap.vocabularies.Analytics.v1.PlanningAction"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Analytics.v1.AggregatedProperties"] = "com.sap.vocabularies.Analytics.v1.AggregatedPropertyType";
		    		    TermToTypes["com.sap.vocabularies.Analytics.v1.AggregatedProperty"] = "com.sap.vocabularies.Analytics.v1.AggregatedPropertyType";
		    		    TermToTypes["com.sap.vocabularies.Analytics.v1.AnalyticalContext"] = "com.sap.vocabularies.Analytics.v1.AnalyticalContextType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.ServiceVersion"] = "Edm.Int32";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.ServiceSchemaVersion"] = "Edm.Int32";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.TextFor"] = "Edm.PropertyPath";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsLanguageIdentifier"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.TextFormat"] = "com.sap.vocabularies.Common.v1.TextFormatType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsTimezone"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsDigitSequence"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsUpperCase"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsCurrency"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsUnit"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.UnitSpecificScale"] = "Edm.PrimitiveType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.UnitSpecificPrecision"] = "Edm.PrimitiveType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.SecondaryKey"] = "Edm.PropertyPath";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.MinOccurs"] = "Edm.Int64";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.MaxOccurs"] = "Edm.Int64";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.AssociationEntity"] = "Edm.NavigationPropertyPath";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.DerivedNavigation"] = "Edm.NavigationPropertyPath";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.Masked"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.RevealOnDemand"] = "Edm.Boolean";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.SemanticObjectMapping"] = "com.sap.vocabularies.Common.v1.SemanticObjectMappingAbstract";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsInstanceAnnotation"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"] = "com.sap.vocabularies.Common.v1.FilterExpressionRestrictionType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.FieldControl"] = "com.sap.vocabularies.Common.v1.FieldControlType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.Application"] = "com.sap.vocabularies.Common.v1.ApplicationType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.Timestamp"] = "Edm.DateTimeOffset";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.ErrorResolution"] = "com.sap.vocabularies.Common.v1.ErrorResolutionType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.Messages"] = "Edm.ComplexType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.numericSeverity"] = "com.sap.vocabularies.Common.v1.NumericMessageSeverityType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.MaximumNumericMessageSeverity"] = "com.sap.vocabularies.Common.v1.NumericMessageSeverityType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsActionCritical"] = "Edm.Boolean";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.Attributes"] = "Edm.PropertyPath";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.RelatedRecursiveHierarchy"] = "Edm.AnnotationPath";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.Interval"] = "com.sap.vocabularies.Common.v1.IntervalType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.ResultContext"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.SAPObjectNodeType"] = "com.sap.vocabularies.Common.v1.SAPObjectNodeTypeType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.Composition"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsNaturalPerson"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.ValueList"] = "com.sap.vocabularies.Common.v1.ValueListType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"] = "Org.OData.Core.V1.SimpleIdentifier";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.ValueListWithFixedValues"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.ValueListShowValuesImmediately"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.ValueListMapping"] = "com.sap.vocabularies.Common.v1.ValueListMappingType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYear"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarHalfyear"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarQuarter"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarMonth"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarWeek"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfCalendarMonth"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfCalendarYear"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearHalfyear"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearQuarter"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearMonth"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearWeek"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarDate"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYear"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalPeriod"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearPeriod"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalQuarter"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearQuarter"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalWeek"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearWeek"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfFiscalYear"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearVariant"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.MutuallyExclusiveTerm"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.DraftRoot"] = "com.sap.vocabularies.Common.v1.DraftRootType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.DraftNode"] = "com.sap.vocabularies.Common.v1.DraftNodeType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.DraftActivationVia"] = "Org.OData.Core.V1.SimpleIdentifier";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.EditableFieldFor"] = "Edm.PropertyPath";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.SemanticKey"] = "Edm.PropertyPath";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.SideEffects"] = "com.sap.vocabularies.Common.v1.SideEffectsType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.DefaultValuesFunction"] = "com.sap.vocabularies.Common.v1.QualifiedName";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.FilterDefaultValue"] = "Edm.PrimitiveType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.FilterDefaultValueHigh"] = "Edm.PrimitiveType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.SortOrder"] = "com.sap.vocabularies.Common.v1.SortOrderType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.RecursiveHierarchy"] = "com.sap.vocabularies.Common.v1.RecursiveHierarchyType";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.CreatedAt"] = "Edm.DateTimeOffset";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.CreatedBy"] = "com.sap.vocabularies.Common.v1.UserID";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.ChangedAt"] = "Edm.DateTimeOffset";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.ChangedBy"] = "com.sap.vocabularies.Common.v1.UserID";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.ApplyMultiUnitBehaviorForSortingAndFiltering"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Common.v1.PrimitivePropertyPath"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.CodeList.v1.CurrencyCodes"] = "com.sap.vocabularies.CodeList.v1.CodeListSource";
		    		    TermToTypes["com.sap.vocabularies.CodeList.v1.UnitsOfMeasure"] = "com.sap.vocabularies.CodeList.v1.CodeListSource";
		    		    TermToTypes["com.sap.vocabularies.CodeList.v1.StandardCode"] = "Edm.PropertyPath";
		    		    TermToTypes["com.sap.vocabularies.CodeList.v1.ExternalCode"] = "Edm.PropertyPath";
		    		    TermToTypes["com.sap.vocabularies.CodeList.v1.IsConfigurationDeprecationCode"] = "Edm.Boolean";
		    		    TermToTypes["com.sap.vocabularies.Communication.v1.Contact"] = "com.sap.vocabularies.Communication.v1.ContactType";
		    		    TermToTypes["com.sap.vocabularies.Communication.v1.Address"] = "com.sap.vocabularies.Communication.v1.AddressType";
		    		    TermToTypes["com.sap.vocabularies.Communication.v1.IsEmailAddress"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Communication.v1.IsPhoneNumber"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Communication.v1.Event"] = "com.sap.vocabularies.Communication.v1.EventData";
		    		    TermToTypes["com.sap.vocabularies.Communication.v1.Task"] = "com.sap.vocabularies.Communication.v1.TaskData";
		    		    TermToTypes["com.sap.vocabularies.Communication.v1.Message"] = "com.sap.vocabularies.Communication.v1.MessageData";
		    		    TermToTypes["com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchy"] = "com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchyType";
		    		    TermToTypes["com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchyActions"] = "com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchyActionsType";
		    		    TermToTypes["com.sap.vocabularies.Hierarchy.v1.MatchCount"] = "Edm.Int64";
		    		    TermToTypes["com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchySupported"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.PersonalData.v1.EntitySemantics"] = "com.sap.vocabularies.PersonalData.v1.EntitySemanticsType";
		    		    TermToTypes["com.sap.vocabularies.PersonalData.v1.FieldSemantics"] = "com.sap.vocabularies.PersonalData.v1.FieldSemanticsType";
		    		    TermToTypes["com.sap.vocabularies.PersonalData.v1.IsPotentiallyPersonal"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.Session.v1.StickySessionSupported"] = "com.sap.vocabularies.Session.v1.StickySessionSupportedType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.HeaderInfo"] = "com.sap.vocabularies.UI.v1.HeaderInfoType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.Identification"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.Badge"] = "com.sap.vocabularies.UI.v1.BadgeType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.LineItem"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.StatusInfo"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.FieldGroup"] = "com.sap.vocabularies.UI.v1.FieldGroupType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.ConnectedFields"] = "com.sap.vocabularies.UI.v1.ConnectedFieldsType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.GeoLocations"] = "com.sap.vocabularies.UI.v1.GeoLocationType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.GeoLocation"] = "com.sap.vocabularies.UI.v1.GeoLocationType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.Contacts"] = "Edm.AnnotationPath";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.MediaResource"] = "com.sap.vocabularies.UI.v1.MediaResourceType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.DataPoint"] = "com.sap.vocabularies.UI.v1.DataPointType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.KPI"] = "com.sap.vocabularies.UI.v1.KPIType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.Chart"] = "com.sap.vocabularies.UI.v1.ChartDefinitionType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.ValueCriticality"] = "com.sap.vocabularies.UI.v1.ValueCriticalityType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.CriticalityLabels"] = "com.sap.vocabularies.UI.v1.CriticalityLabelType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.SelectionFields"] = "Edm.PropertyPath";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.Facets"] = "com.sap.vocabularies.UI.v1.Facet";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.HeaderFacets"] = "com.sap.vocabularies.UI.v1.Facet";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.QuickViewFacets"] = "com.sap.vocabularies.UI.v1.Facet";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.QuickCreateFacets"] = "com.sap.vocabularies.UI.v1.Facet";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.FilterFacets"] = "com.sap.vocabularies.UI.v1.ReferenceFacet";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.OperationParameterFacets"] = "com.sap.vocabularies.UI.v1.ReferenceFacet";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.SelectionPresentationVariant"] = "com.sap.vocabularies.UI.v1.SelectionPresentationVariantType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.PresentationVariant"] = "com.sap.vocabularies.UI.v1.PresentationVariantType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.SelectionVariant"] = "com.sap.vocabularies.UI.v1.SelectionVariantType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.ThingPerspective"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.IsSummary"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.PartOfPreview"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.Map"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.Gallery"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.IsImageURL"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.IsImage"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.MultiLineText"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.InputMask"] = "com.sap.vocabularies.UI.v1.InputMaskType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.TextArrangement"] = "com.sap.vocabularies.UI.v1.TextArrangementType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.Note"] = "com.sap.vocabularies.UI.v1.NoteType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.Importance"] = "com.sap.vocabularies.UI.v1.ImportanceType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.Hidden"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.IsCopyAction"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.IsAIOperation"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.CreateHidden"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.UpdateHidden"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.DeleteHidden"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.HiddenFilter"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.AdaptationHidden"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.DataFieldDefault"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.Criticality"] = "com.sap.vocabularies.UI.v1.CriticalityType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.CriticalityCalculation"] = "com.sap.vocabularies.UI.v1.CriticalityCalculationType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.Emphasized"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.OrderBy"] = "Edm.PropertyPath";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.ParameterDefaultValue"] = "Edm.PrimitiveType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.RecommendationState"] = "com.sap.vocabularies.UI.v1.RecommendationStateType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.RecommendationList"] = "com.sap.vocabularies.UI.v1.RecommendationListType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.Recommendations"] = "Edm.ComplexType";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] = "Org.OData.Core.V1.Tag";
		    		    TermToTypes["com.sap.vocabularies.UI.v1.DoNotCheckScaleOfMeasuredQuantity"] = "Edm.Boolean";
		    		    TermToTypes["com.sap.vocabularies.HTML5.v1.CssDefaults"] = "com.sap.vocabularies.HTML5.v1.CssDefaultsType";
		    		    TermToTypes["com.sap.vocabularies.HTML5.v1.LinkTarget"] = "com.sap.vocabularies.HTML5.v1.LinkTargetType";
		    		    TermToTypes["com.sap.vocabularies.HTML5.v1.RowSpanForDuplicateValues"] = "Org.OData.Core.V1.Tag";
		    		})(exports.TermToTypes || (exports.TermToTypes = {})); 
		    	} (TermToTypes));
		    	return TermToTypes;
		    }

		    var hasRequiredUtils;

		    function requireUtils () {
		    	if (hasRequiredUtils) return utils;
		    	hasRequiredUtils = 1;
		    	(function (exports) {
		    		Object.defineProperty(exports, "__esModule", { value: true });
		    		exports.mergeAnnotations = exports.addGetByValue = exports.createIndexedFind = exports.lazy = exports.Decimal = exports.Double = exports.isComplexTypeDefinition = exports.unalias = exports.alias = exports.substringBeforeLast = exports.substringBeforeFirst = exports.splitAtLast = exports.splitAtFirst = exports.defaultReferences = exports.TermToTypes = exports.EnumIsFlag = void 0;
		    		var EnumIsFlag_1 = requireEnumIsFlag();
		    		Object.defineProperty(exports, "EnumIsFlag", { enumerable: true, get: function () { return EnumIsFlag_1.EnumIsFlag; } });
		    		var TermToTypes_1 = requireTermToTypes();
		    		Object.defineProperty(exports, "TermToTypes", { enumerable: true, get: function () { return TermToTypes_1.TermToTypes; } });
		    		var VocabularyReferences_1 = requireVocabularyReferences();
		    		Object.defineProperty(exports, "defaultReferences", { enumerable: true, get: function () { return VocabularyReferences_1.VocabularyReferences; } });
		    		function splitAt(string, index) {
		    		    return index < 0 ? [string, ''] : [string.substring(0, index), string.substring(index + 1)];
		    		}
		    		function substringAt(string, index) {
		    		    return index < 0 ? string : string.substring(0, index);
		    		}
		    		/**
		    		 * Splits a string at the first occurrence of a separator.
		    		 *
		    		 * @param string    The string to split
		    		 * @param separator Separator, e.g. a single character.
		    		 * @returns An array consisting of two elements: the part before the first occurrence of the separator and the part after it. If the string does not contain the separator, the second element is the empty string.
		    		 */
		    		function splitAtFirst(string, separator) {
		    		    return splitAt(string, string.indexOf(separator));
		    		}
		    		exports.splitAtFirst = splitAtFirst;
		    		/**
		    		 * Splits a string at the last occurrence of a separator.
		    		 *
		    		 * @param string    The string to split
		    		 * @param separator Separator, e.g. a single character.
		    		 * @returns An array consisting of two elements: the part before the last occurrence of the separator and the part after it. If the string does not contain the separator, the second element is the empty string.
		    		 */
		    		function splitAtLast(string, separator) {
		    		    return splitAt(string, string.lastIndexOf(separator));
		    		}
		    		exports.splitAtLast = splitAtLast;
		    		/**
		    		 * Returns the substring before the first occurrence of a separator.
		    		 *
		    		 * @param string    The string
		    		 * @param separator Separator, e.g. a single character.
		    		 * @returns The substring before the first occurrence of the separator, or the input string if it does not contain the separator.
		    		 */
		    		function substringBeforeFirst(string, separator) {
		    		    return substringAt(string, string.indexOf(separator));
		    		}
		    		exports.substringBeforeFirst = substringBeforeFirst;
		    		/**
		    		 * Returns the substring before the last occurrence of a separator.
		    		 *
		    		 * @param string    The string
		    		 * @param separator Separator, e.g. a single character.
		    		 * @returns The substring before the last occurrence of the separator, or the input string if it does not contain the separator.
		    		 */
		    		function substringBeforeLast(string, separator) {
		    		    return substringAt(string, string.lastIndexOf(separator));
		    		}
		    		exports.substringBeforeLast = substringBeforeLast;
		    		/**
		    		 * Transform an unaliased string representation annotation to the aliased version.
		    		 *
		    		 * @param references currentReferences for the project
		    		 * @param unaliasedValue the unaliased value
		    		 * @returns the aliased string representing the same
		    		 */
		    		function alias(references, unaliasedValue) {
		    		    if (!references.reverseReferenceMap) {
		    		        references.reverseReferenceMap = references.reduce((map, ref) => {
		    		            map[ref.namespace] = ref;
		    		            return map;
		    		        }, {});
		    		    }
		    		    if (!unaliasedValue) {
		    		        return unaliasedValue;
		    		    }
		    		    const [namespace, value] = splitAtLast(unaliasedValue, '.');
		    		    const reference = references.reverseReferenceMap[namespace];
		    		    if (reference) {
		    		        return `${reference.alias}.${value}`;
		    		    }
		    		    else if (unaliasedValue.includes('@')) {
		    		        // Try to see if it's an annotation Path like to_SalesOrder/@UI.LineItem
		    		        const [preAlias, postAlias] = splitAtFirst(unaliasedValue, '@');
		    		        return `${preAlias}@${alias(references, postAlias)}`;
		    		    }
		    		    else {
		    		        return unaliasedValue;
		    		    }
		    		}
		    		exports.alias = alias;
		    		/**
		    		 * Transform an aliased string to its unaliased version given a set of references.
		    		 *
		    		 * @param references The references to use for unaliasing.
		    		 * @param aliasedValue The aliased value
		    		 * @param namespace The fallback namespace
		    		 * @returns The equal unaliased string.
		    		 */
		    		function unalias(references, aliasedValue, namespace) {
		    		    var _a;
		    		    const _unalias = (value) => {
		    		        if (!references.referenceMap) {
		    		            references.referenceMap = Object.fromEntries(references.map((ref) => [ref.alias, ref]));
		    		        }
		    		        // Aliases are of type 'SimpleIdentifier' and must not contain dots
		    		        const [maybeAlias, rest] = splitAtFirst(value, '.');
		    		        if (!rest || rest.includes('.')) {
		    		            // either there is no dot in the value or there is more than one --> nothing to do
		    		            return value;
		    		        }
		    		        const isAnnotation = maybeAlias.startsWith('@');
		    		        const valueToUnalias = isAnnotation ? maybeAlias.substring(1) : maybeAlias;
		    		        const knownReference = references.referenceMap[valueToUnalias];
		    		        if (knownReference) {
		    		            return isAnnotation ? `@${knownReference.namespace}.${rest}` : `${knownReference.namespace}.${rest}`;
		    		        }
		    		        // The alias could not be resolved using the references. Assume it is the "global" alias (= namespace)
		    		        return namespace && !isAnnotation ? `${namespace}.${rest}` : value;
		    		    };
		    		    return (_a = aliasedValue === null || aliasedValue === void 0 ? void 0 : aliasedValue.split('/').reduce((segments, segment) => {
		    		        // the segment could be an action, like "doSomething(foo.bar)"
		    		        const [first, rest] = splitAtFirst(segment, '(');
		    		        const subSegment = [_unalias(first)];
		    		        if (rest) {
		    		            const parameter = rest.slice(0, -1); // remove trailing ")"
		    		            subSegment.push(`(${_unalias(parameter)})`);
		    		        }
		    		        segments.push(subSegment.join(''));
		    		        return segments;
		    		    }, [])) === null || _a === void 0 ? void 0 : _a.join('/');
		    		}
		    		exports.unalias = unalias;
		    		/**
		    		 * Differentiate between a ComplexType and a TypeDefinition.
		    		 *
		    		 * @param complexTypeDefinition
		    		 * @returns true if the value is a complex type
		    		 */
		    		function isComplexTypeDefinition(complexTypeDefinition) {
		    		    return (!!complexTypeDefinition && complexTypeDefinition._type === 'ComplexType' && !!complexTypeDefinition.properties);
		    		}
		    		exports.isComplexTypeDefinition = isComplexTypeDefinition;
		    		function Double(value) {
		    		    return {
		    		        isDouble() {
		    		            return true;
		    		        },
		    		        valueOf() {
		    		            return value;
		    		        },
		    		        toString() {
		    		            return value.toString();
		    		        }
		    		    };
		    		}
		    		exports.Double = Double;
		    		function Decimal(value) {
		    		    return {
		    		        isDecimal() {
		    		            return true;
		    		        },
		    		        valueOf() {
		    		            return value;
		    		        },
		    		        toString() {
		    		            return value.toString();
		    		        }
		    		    };
		    		}
		    		exports.Decimal = Decimal;
		    		/**
		    		 * Defines a lazy property.
		    		 *
		    		 * The property is initialized by calling the init function on the first read access, or by directly assigning a value.
		    		 *
		    		 * @param object    The host object
		    		 * @param property  The lazy property to add
		    		 * @param init      The function that initializes the property's value
		    		 */
		    		function lazy(object, property, init) {
		    		    const initial = Symbol('initial');
		    		    let _value = initial;
		    		    Object.defineProperty(object, property, {
		    		        enumerable: true,
		    		        get() {
		    		            if (_value === initial) {
		    		                _value = init();
		    		            }
		    		            return _value;
		    		        },
		    		        set(value) {
		    		            _value = value;
		    		        }
		    		    });
		    		}
		    		exports.lazy = lazy;
		    		/**
		    		 * Creates a function that allows to find an array element by property value.
		    		 *
		    		 * @param array     The array
		    		 * @param property  Elements in the array are searched by this property
		    		 * @returns A function that can be used to find an element of the array by property value.
		    		 */
		    		function createIndexedFind(array, property) {
		    		    const index = new Map();
		    		    return function find(value) {
		    		        const element = index.get(value);
		    		        if ((element === null || element === void 0 ? void 0 : element[property]) === value) {
		    		            return element;
		    		        }
		    		        return array.find((element) => {
		    		            if (!(element === null || element === void 0 ? void 0 : element.hasOwnProperty(property))) {
		    		                return false;
		    		            }
		    		            const propertyValue = element[property];
		    		            index.set(propertyValue, element);
		    		            return propertyValue === value;
		    		        });
		    		    };
		    		}
		    		exports.createIndexedFind = createIndexedFind;
		    		/**
		    		 * Adds a 'get by value' function to an array.
		    		 *
		    		 * If this function is called with addIndex(myArray, 'name'), a new function 'by_name(value)' will be added that allows to
		    		 * find a member of the array by the value of its 'name' property.
		    		 *
		    		 * @param array      The array
		    		 * @param property   The property that will be used by the 'by_{property}()' function
		    		 * @returns The array with the added function
		    		 */
		    		function addGetByValue(array, property) {
		    		    const indexName = `by_${property}`;
		    		    if (!array.hasOwnProperty(indexName)) {
		    		        Object.defineProperty(array, indexName, { writable: false, value: createIndexedFind(array, property) });
		    		    }
		    		    else {
		    		        throw new Error(`Property '${indexName}' already exists`);
		    		    }
		    		    return array;
		    		}
		    		exports.addGetByValue = addGetByValue;
		    		/**
		    		 * Merge annotations from different sources together by overwriting at the term level.
		    		 *
		    		 * @param references        References, used to resolve aliased annotation targets and aliased annotation terms.
		    		 * @param annotationSources Annotation sources
		    		 * @returns the resulting merged annotations
		    		 */
		    		function mergeAnnotations(references, ...annotationSources) {
		    		    return annotationSources.reduceRight((result, { name, annotationList }) => {
		    		        var _a;
		    		        for (const { target, annotations } of annotationList) {
		    		            const annotationTarget = (_a = unalias(references, target)) !== null && _a !== void 0 ? _a : target;
		    		            if (!result[annotationTarget]) {
		    		                result[annotationTarget] = [];
		    		            }
		    		            const annotationsOnTarget = annotations
		    		                .map((rawAnnotation) => {
		    		                var _a;
		    		                rawAnnotation.term = (_a = unalias(references, rawAnnotation.term)) !== null && _a !== void 0 ? _a : rawAnnotation.term;
		    		                rawAnnotation.fullyQualifiedName = rawAnnotation.qualifier
		    		                    ? `${annotationTarget}@${rawAnnotation.term}#${rawAnnotation.qualifier}`
		    		                    : `${annotationTarget}@${rawAnnotation.term}`;
		    		                rawAnnotation.__source = name;
		    		                return rawAnnotation;
		    		            })
		    		                .filter((annotation) => !result[annotationTarget].some((existingAnnotation) => existingAnnotation.term === annotation.term &&
		    		                existingAnnotation.qualifier === annotation.qualifier));
		    		            result[annotationTarget].push(...annotationsOnTarget);
		    		        }
		    		        return result;
		    		    }, {});
		    		}
		    		exports.mergeAnnotations = mergeAnnotations;
		    		
		    	} (utils));
		    	return utils;
		    }

		    var hasRequiredConverter;

		    function requireConverter () {
		    	if (hasRequiredConverter) return converter;
		    	hasRequiredConverter = 1;
		    	Object.defineProperty(converter, "__esModule", { value: true });
		    	converter.convert = void 0;
		    	const VocabularyReferences_1 = requireVocabularyReferences();
		    	const utils_1 = requireUtils();
		    	/**
		    	 * Symbol to extend an annotation with the reference to its target.
		    	 */
		    	const ANNOTATION_TARGET = Symbol('Annotation Target');
		    	/**
		    	 * Append an object to the list of visited objects if it is different from the last object in the list.
		    	 *
		    	 * @param objectPath    The list of visited objects
		    	 * @param visitedObject The object
		    	 * @returns The list of visited objects
		    	 */
		    	function appendObjectPath(objectPath, visitedObject) {
		    	    if (objectPath[objectPath.length - 1] !== visitedObject) {
		    	        objectPath.push(visitedObject);
		    	    }
		    	    return objectPath;
		    	}
		    	/**
		    	 * Resolves a (possibly relative) path.
		    	 *
		    	 * @param converter         Converter
		    	 * @param startElement      The starting point in case of relative path resolution
		    	 * @param path              The path to resolve
		    	 * @param annotationsTerm   Only for error reporting: The annotation term
		    	 * @returns An object containing the resolved target and the elements that were visited while getting to the target.
		    	 */
		    	function resolveTarget(converter, startElement, path, annotationsTerm) {
		    	    var _a, _b, _c, _d, _e;
		    	    if (path === undefined) {
		    	        return { target: undefined, objectPath: [], messages: [] };
		    	    }
		    	    // absolute paths always start at the entity container
		    	    if (path.startsWith('/')) {
		    	        path = path.substring(1);
		    	        startElement = undefined; // will resolve to the entity container (see below)
		    	    }
		    	    const pathSegments = path.split('/').reduce((targetPath, segment) => {
		    	        if (segment.includes('@')) {
		    	            // Separate out the annotation
		    	            const [pathPart, annotationPart] = (0, utils_1.splitAtFirst)(segment, '@');
		    	            targetPath.push(pathPart);
		    	            targetPath.push(`@${annotationPart}`);
		    	        }
		    	        else {
		    	            targetPath.push(segment);
		    	        }
		    	        return targetPath;
		    	    }, []);
		    	    // determine the starting point for the resolution
		    	    if (startElement === undefined) {
		    	        // no starting point given: start at the entity container
		    	        if (pathSegments[0].startsWith(`${converter.rawSchema.namespace}.`) &&
		    	            pathSegments[0] !== ((_a = converter.getConvertedEntityContainer()) === null || _a === void 0 ? void 0 : _a.fullyQualifiedName)) {
		    	            // We have a fully qualified name in the path that is not the entity container.
		    	            startElement =
		    	                (_d = (_c = (_b = converter.getConvertedEntityType(pathSegments[0])) !== null && _b !== void 0 ? _b : converter.getConvertedComplexType(pathSegments[0])) !== null && _c !== void 0 ? _c : converter.getConvertedAction(pathSegments[0])) !== null && _d !== void 0 ? _d : converter.getConvertedAction(`${pathSegments[0]}()`); // unbound action
		    	            pathSegments.shift(); // Let's remove the first path element
		    	        }
		    	        else {
		    	            startElement = converter.getConvertedEntityContainer();
		    	        }
		    	    }
		    	    else if (startElement[ANNOTATION_TARGET] !== undefined) {
		    	        // annotation: start at the annotation target
		    	        startElement = startElement[ANNOTATION_TARGET];
		    	    }
		    	    else if (startElement._type === 'Property') {
		    	        // property: start at the entity type or complex type the property belongs to
		    	        const parentElementFQN = (0, utils_1.substringBeforeFirst)(startElement.fullyQualifiedName, '/');
		    	        startElement =
		    	            (_e = converter.getConvertedEntityType(parentElementFQN)) !== null && _e !== void 0 ? _e : converter.getConvertedComplexType(parentElementFQN);
		    	    }
		    	    const result = pathSegments.reduce((current, segment) => {
		    	        var _a, _b, _c, _d, _e;
		    	        const error = (message) => {
		    	            current.messages.push({ message });
		    	            current.target = undefined;
		    	            return current;
		    	        };
		    	        if (current.target === undefined) {
		    	            return current;
		    	        }
		    	        current.objectPath = appendObjectPath(current.objectPath, current.target);
		    	        // Annotation
		    	        if (segment.startsWith('@') && segment !== '@$ui5.overload') {
		    	            const [vocabularyAlias, term] = converter.splitTerm(segment);
		    	            const annotation = (_a = current.target.annotations[vocabularyAlias.substring(1)]) === null || _a === void 0 ? void 0 : _a[term];
		    	            if (annotation !== undefined) {
		    	                current.target = annotation;
		    	                return current;
		    	            }
		    	            return error(`Annotation '${segment.substring(1)}' not found on ${current.target._type} '${current.target.fullyQualifiedName}'`);
		    	        }
		    	        // $Path / $AnnotationPath syntax
		    	        if (current.target.$target) {
		    	            let subPath;
		    	            if (segment === '$AnnotationPath') {
		    	                subPath = current.target.value;
		    	            }
		    	            else if (segment === '$Path') {
		    	                subPath = current.target.path;
		    	            }
		    	            if (subPath !== undefined) {
		    	                const subTarget = resolveTarget(converter, current.target[ANNOTATION_TARGET], subPath);
		    	                subTarget.objectPath.forEach((visitedSubObject) => {
		    	                    if (!current.objectPath.includes(visitedSubObject)) {
		    	                        current.objectPath = appendObjectPath(current.objectPath, visitedSubObject);
		    	                    }
		    	                });
		    	                current.target = subTarget.target;
		    	                current.objectPath = appendObjectPath(current.objectPath, current.target);
		    	                return current;
		    	            }
		    	        }
		    	        // traverse based on the element type
		    	        switch ((_b = current.target) === null || _b === void 0 ? void 0 : _b._type) {
		    	            case 'Schema':
		    	                // next element: EntityType, ComplexType, Action, EntityContainer ?
		    	                break;
		    	            case 'EntityContainer':
		    	                {
		    	                    const thisElement = current.target;
		    	                    if (segment === '' || converter.unalias(segment) === thisElement.fullyQualifiedName) {
		    	                        return current;
		    	                    }
		    	                    // next element: EntitySet, Singleton or ActionImport?
		    	                    const nextElement = (_d = (_c = thisElement.entitySets.by_name(segment)) !== null && _c !== void 0 ? _c : thisElement.singletons.by_name(segment)) !== null && _d !== void 0 ? _d : thisElement.actionImports.by_name(segment);
		    	                    if (nextElement) {
		    	                        current.target = nextElement;
		    	                        return current;
		    	                    }
		    	                }
		    	                break;
		    	            case 'EntitySet':
		    	            case 'Singleton': {
		    	                const thisElement = current.target;
		    	                if (segment === '' || segment === '$Type') {
		    	                    // Empty Path after an EntitySet or Singleton means EntityType
		    	                    current.target = thisElement.entityType;
		    	                    return current;
		    	                }
		    	                if (segment === '$') {
		    	                    return current;
		    	                }
		    	                if (segment === '$NavigationPropertyBinding') {
		    	                    const navigationPropertyBindings = thisElement.navigationPropertyBinding;
		    	                    current.target = navigationPropertyBindings;
		    	                    return current;
		    	                }
		    	                // continue resolving at the EntitySet's or Singleton's type
		    	                const result = resolveTarget(converter, thisElement.entityType, segment);
		    	                current.target = result.target;
		    	                current.objectPath = result.objectPath.reduce(appendObjectPath, current.objectPath);
		    	                return current;
		    	            }
		    	            case 'EntityType':
		    	                {
		    	                    const thisElement = current.target;
		    	                    if (segment === '' || segment === '$Type') {
		    	                        return current;
		    	                    }
		    	                    const property = thisElement.entityProperties.by_name(segment);
		    	                    if (property) {
		    	                        current.target = property;
		    	                        return current;
		    	                    }
		    	                    const navigationProperty = thisElement.navigationProperties.by_name(segment);
		    	                    if (navigationProperty) {
		    	                        current.target = navigationProperty;
		    	                        return current;
		    	                    }
		    	                    const actionName = (0, utils_1.substringBeforeFirst)(converter.unalias(segment), '(');
		    	                    const action = thisElement.actions[actionName];
		    	                    if (action) {
		    	                        current.target = action;
		    	                        return current;
		    	                    }
		    	                }
		    	                break;
		    	            case 'ActionImport': {
		    	                // continue resolving at the Action
		    	                const result = resolveTarget(converter, current.target.action, segment);
		    	                current.target = result.target;
		    	                current.objectPath = result.objectPath.reduce(appendObjectPath, current.objectPath);
		    	                return current;
		    	            }
		    	            case 'Action': {
		    	                const thisElement = current.target;
		    	                if (segment === '') {
		    	                    return current;
		    	                }
		    	                if (segment === '@$ui5.overload' || segment === '0') {
		    	                    return current;
		    	                }
		    	                if (segment === '$Parameter' && thisElement.isBound) {
		    	                    current.target = thisElement.parameters;
		    	                    return current;
		    	                }
		    	                const nextElement = (_e = thisElement.parameters[segment]) !== null && _e !== void 0 ? _e : thisElement.parameters.find((param) => param.name === segment);
		    	                if (nextElement) {
		    	                    current.target = nextElement;
		    	                    return current;
		    	                }
		    	                break;
		    	            }
		    	            case 'Property':
		    	                {
		    	                    const thisElement = current.target;
		    	                    // Property or NavigationProperty of the ComplexType
		    	                    const type = thisElement.targetType;
		    	                    if (type !== undefined) {
		    	                        const property = type.properties.by_name(segment);
		    	                        if (property) {
		    	                            current.target = property;
		    	                            return current;
		    	                        }
		    	                        const navigationProperty = type.navigationProperties.by_name(segment);
		    	                        if (navigationProperty) {
		    	                            current.target = navigationProperty;
		    	                            return current;
		    	                        }
		    	                    }
		    	                }
		    	                break;
		    	            case 'ActionParameter':
		    	                const referencedType = current.target.typeReference;
		    	                if (referencedType !== undefined) {
		    	                    const result = resolveTarget(converter, referencedType, segment);
		    	                    current.target = result.target;
		    	                    current.objectPath = result.objectPath.reduce(appendObjectPath, current.objectPath);
		    	                    return current;
		    	                }
		    	                break;
		    	            case 'NavigationProperty':
		    	                // continue at the NavigationProperty's target type
		    	                const result = resolveTarget(converter, current.target.targetType, segment);
		    	                current.target = result.target;
		    	                current.objectPath = result.objectPath.reduce(appendObjectPath, current.objectPath);
		    	                return current;
		    	            default:
		    	                if (segment === '') {
		    	                    return current;
		    	                }
		    	                if (current.target[segment]) {
		    	                    current.target = current.target[segment];
		    	                    current.objectPath = appendObjectPath(current.objectPath, current.target);
		    	                    return current;
		    	                }
		    	        }
		    	        return error(`Element '${segment}' not found at ${current.target._type} '${current.target.fullyQualifiedName}'`);
		    	    }, { target: startElement, objectPath: [], messages: [] });
		    	    // Diagnostics
		    	    result.messages.forEach((message) => converter.logError(message.message));
		    	    if (!result.target) {
		    	        if (annotationsTerm) {
		    	            const annotationType = inferTypeFromTerm(converter, annotationsTerm, startElement.fullyQualifiedName);
		    	            converter.logError('Unable to resolve the path expression: ' +
		    	                '\n' +
		    	                path +
		    	                '\n' +
		    	                '\n' +
		    	                'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' +
		    	                '<Annotation Term = ' +
		    	                annotationsTerm +
		    	                '>' +
		    	                '\n' +
		    	                '<Record Type = ' +
		    	                annotationType +
		    	                '>' +
		    	                '\n' +
		    	                '<AnnotationPath = ' +
		    	                path +
		    	                '>');
		    	        }
		    	        else {
		    	            converter.logError('Unable to resolve the path expression: ' +
		    	                path +
		    	                '\n' +
		    	                '\n' +
		    	                'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' +
		    	                '<Annotation Term = ' +
		    	                pathSegments[0] +
		    	                '>' +
		    	                '\n' +
		    	                '<PropertyValue  Path= ' +
		    	                pathSegments[1] +
		    	                '>');
		    	        }
		    	    }
		    	    return result;
		    	}
		    	/**
		    	 * Typeguard to check if the path contains an annotation.
		    	 *
		    	 * @param pathStr the path to evaluate
		    	 * @returns true if there is an annotation in the path.
		    	 */
		    	function isAnnotationPath(pathStr) {
		    	    return pathStr.includes('@');
		    	}
		    	function mapPropertyPath(converter, propertyPath, fullyQualifiedName, currentTarget, currentTerm) {
		    	    const result = {
		    	        type: 'PropertyPath',
		    	        value: propertyPath.PropertyPath,
		    	        fullyQualifiedName: fullyQualifiedName,
		    	        [ANNOTATION_TARGET]: currentTarget
		    	    };
		    	    (0, utils_1.lazy)(result, '$target', () => resolveTarget(converter, currentTarget, propertyPath.PropertyPath, currentTerm).target);
		    	    return result;
		    	}
		    	function mapAnnotationPath(converter, annotationPath, fullyQualifiedName, currentTarget, currentTerm) {
		    	    const result = {
		    	        type: 'AnnotationPath',
		    	        value: converter.unalias(annotationPath.AnnotationPath),
		    	        fullyQualifiedName: fullyQualifiedName,
		    	        [ANNOTATION_TARGET]: currentTarget
		    	    };
		    	    (0, utils_1.lazy)(result, '$target', () => resolveTarget(converter, currentTarget, result.value, currentTerm).target);
		    	    return result;
		    	}
		    	function mapNavigationPropertyPath(converter, navigationPropertyPath, fullyQualifiedName, currentTarget, currentTerm) {
		    	    var _a;
		    	    const result = {
		    	        type: 'NavigationPropertyPath',
		    	        value: (_a = navigationPropertyPath.NavigationPropertyPath) !== null && _a !== void 0 ? _a : '',
		    	        fullyQualifiedName: fullyQualifiedName,
		    	        [ANNOTATION_TARGET]: currentTarget
		    	    };
		    	    (0, utils_1.lazy)(result, '$target', () => resolveTarget(converter, currentTarget, navigationPropertyPath.NavigationPropertyPath, currentTerm).target);
		    	    return result;
		    	}
		    	function mapPath(converter, path, fullyQualifiedName, currentTarget, currentTerm) {
		    	    const result = {
		    	        type: 'Path',
		    	        path: path.Path,
		    	        fullyQualifiedName: fullyQualifiedName,
		    	        getValue() {
		    	            return undefined; // TODO: Required according to the type...
		    	        },
		    	        [ANNOTATION_TARGET]: currentTarget
		    	    };
		    	    (0, utils_1.lazy)(result, '$target', () => resolveTarget(converter, currentTarget, path.Path, currentTerm).target);
		    	    return result;
		    	}
		    	function parseValue(converter, currentTarget, currentTerm, currentProperty, currentSource, propertyValue, valueFQN) {
		    	    if (propertyValue === undefined) {
		    	        return undefined;
		    	    }
		    	    switch (propertyValue.type) {
		    	        case 'String':
		    	            return propertyValue.String;
		    	        case 'Int':
		    	            return propertyValue.Int;
		    	        case 'Bool':
		    	            return propertyValue.Bool;
		    	        case 'Double':
		    	            return (0, utils_1.Double)(propertyValue.Double);
		    	        case 'Decimal':
		    	            return (0, utils_1.Decimal)(propertyValue.Decimal);
		    	        case 'Date':
		    	            return propertyValue.Date;
		    	        case 'EnumMember':
		    	            const splitEnum = propertyValue.EnumMember.split(' ').map((enumValue) => {
		    	                var _a;
		    	                const unaliased = (_a = converter.unalias(enumValue)) !== null && _a !== void 0 ? _a : '';
		    	                return (0, utils_1.alias)(VocabularyReferences_1.VocabularyReferences, unaliased);
		    	            });
		    	            if (splitEnum[0] !== undefined && utils_1.EnumIsFlag[(0, utils_1.substringBeforeFirst)(splitEnum[0], '/')]) {
		    	                return splitEnum;
		    	            }
		    	            return splitEnum[0];
		    	        case 'PropertyPath':
		    	            return mapPropertyPath(converter, propertyValue, valueFQN, currentTarget, currentTerm);
		    	        case 'NavigationPropertyPath':
		    	            return mapNavigationPropertyPath(converter, propertyValue, valueFQN, currentTarget, currentTerm);
		    	        case 'AnnotationPath':
		    	            return mapAnnotationPath(converter, propertyValue, valueFQN, currentTarget, currentTerm);
		    	        case 'Path': {
		    	            if (isAnnotationPath(propertyValue.Path)) {
		    	                // inline the target
		    	                return resolveTarget(converter, currentTarget, propertyValue.Path, currentTerm).target;
		    	            }
		    	            else {
		    	                return mapPath(converter, propertyValue, valueFQN, currentTarget, currentTerm);
		    	            }
		    	        }
		    	        case 'Record':
		    	            return parseRecord(converter, currentTerm, currentTarget, currentProperty, currentSource, propertyValue.Record, valueFQN);
		    	        case 'Collection':
		    	            return parseCollection(converter, currentTarget, currentTerm, currentProperty, currentSource, propertyValue.Collection, valueFQN);
		    	        case 'Apply':
		    	        case 'Null':
		    	        case 'Not':
		    	        case 'Eq':
		    	        case 'Ne':
		    	        case 'Gt':
		    	        case 'Ge':
		    	        case 'Lt':
		    	        case 'Le':
		    	        case 'If':
		    	        case 'And':
		    	        case 'Or':
		    	        default:
		    	            return propertyValue;
		    	    }
		    	}
		    	/**
		    	 * Infer the type of a term based on its type.
		    	 *
		    	 * @param converter         Converter
		    	 * @param annotationsTerm   The annotation term
		    	 * @param annotationTarget  The annotation target
		    	 * @param currentProperty   The current property of the record
		    	 * @returns The inferred type.
		    	 */
		    	function inferTypeFromTerm(converter, annotationsTerm, annotationTarget, currentProperty) {
		    	    let targetType = utils_1.TermToTypes[annotationsTerm];
		    	    if (currentProperty) {
		    	        annotationsTerm = `${(0, utils_1.substringBeforeLast)(annotationsTerm, '.')}.${currentProperty}`;
		    	        targetType = utils_1.TermToTypes[annotationsTerm];
		    	    }
		    	    converter.logError(`The type of the record used within the term ${annotationsTerm} was not defined and was inferred as ${targetType}.
Hint: If possible, try to maintain the Type property for each Record.
<Annotations Target="${annotationTarget}">
	<Annotation Term="${annotationsTerm}">
		<Record>...</Record>
	</Annotation>
</Annotations>`);
		    	    return targetType;
		    	}
		    	function isDataFieldWithForAction(annotationContent) {
		    	    return (annotationContent.hasOwnProperty('Action') &&
		    	        (annotationContent.$Type === 'com.sap.vocabularies.UI.v1.DataFieldForAction' ||
		    	            annotationContent.$Type === 'com.sap.vocabularies.UI.v1.DataFieldWithAction'));
		    	}
		    	function parseRecordType(converter, currentTerm, currentTarget, currentProperty, recordDefinition) {
		    	    let targetType;
		    	    if (!recordDefinition.type && currentTerm) {
		    	        targetType = inferTypeFromTerm(converter, currentTerm, currentTarget.fullyQualifiedName, currentProperty);
		    	    }
		    	    else {
		    	        targetType = converter.unalias(recordDefinition.type);
		    	    }
		    	    return targetType;
		    	}
		    	function parseRecord(converter, currentTerm, currentTarget, currentProperty, currentSource, annotationRecord, currentFQN) {
		    	    const record = {
		    	        $Type: parseRecordType(converter, currentTerm, currentTarget, currentProperty, annotationRecord),
		    	        fullyQualifiedName: currentFQN,
		    	        [ANNOTATION_TARGET]: currentTarget,
		    	        __source: currentSource
		    	    };
		    	    for (const propertyValue of annotationRecord.propertyValues) {
		    	        (0, utils_1.lazy)(record, propertyValue.name, () => parseValue(converter, currentTarget, currentTerm, propertyValue.name, currentSource, propertyValue.value, `${currentFQN}/${propertyValue.name}`));
		    	    }
		    	    // annotations on the record
		    	    (0, utils_1.lazy)(record, 'annotations', resolveAnnotationsOnAnnotation(converter, annotationRecord, record));
		    	    if (isDataFieldWithForAction(record)) {
		    	        (0, utils_1.lazy)(record, 'ActionTarget', () => {
		    	            var _a, _b;
		    	            const actionName = converter.unalias((_a = record.Action) === null || _a === void 0 ? void 0 : _a.toString());
		    	            // (1) Bound action of the annotation target?
		    	            let actionTarget = currentTarget.actions[actionName];
		    	            if (!actionTarget) {
		    	                // (2) ActionImport (= unbound action)?
		    	                actionTarget = (_b = converter.getConvertedActionImport(actionName)) === null || _b === void 0 ? void 0 : _b.action;
		    	            }
		    	            if (!actionTarget) {
		    	                // (3) Bound action of a different EntityType (the actionName is fully qualified in this case)
		    	                actionTarget = converter.getConvertedAction(actionName);
		    	                if (!(actionTarget === null || actionTarget === void 0 ? void 0 : actionTarget.isBound)) {
		    	                    actionTarget = undefined;
		    	                }
		    	            }
		    	            if (!actionTarget) {
		    	                converter.logError(`${record.fullyQualifiedName}: Unable to resolve '${record.Action}' ('${actionName}')`);
		    	            }
		    	            return actionTarget;
		    	        });
		    	    }
		    	    return record;
		    	}
		    	/**
		    	 * Retrieve or infer the collection type based on its content.
		    	 *
		    	 * @param collectionDefinition
		    	 * @returns the type of the collection
		    	 */
		    	function getOrInferCollectionType(collectionDefinition) {
		    	    let type = collectionDefinition.type;
		    	    if (type === undefined && collectionDefinition.length > 0) {
		    	        const firstColItem = collectionDefinition[0];
		    	        if (firstColItem.hasOwnProperty('PropertyPath')) {
		    	            type = 'PropertyPath';
		    	        }
		    	        else if (firstColItem.hasOwnProperty('Path')) {
		    	            type = 'Path';
		    	        }
		    	        else if (firstColItem.hasOwnProperty('AnnotationPath')) {
		    	            type = 'AnnotationPath';
		    	        }
		    	        else if (firstColItem.hasOwnProperty('NavigationPropertyPath')) {
		    	            type = 'NavigationPropertyPath';
		    	        }
		    	        else if (typeof firstColItem === 'object' &&
		    	            (firstColItem.hasOwnProperty('type') || firstColItem.hasOwnProperty('propertyValues'))) {
		    	            type = 'Record';
		    	        }
		    	        else if (typeof firstColItem === 'string') {
		    	            type = 'String';
		    	        }
		    	    }
		    	    else if (type === undefined) {
		    	        type = 'EmptyCollection';
		    	    }
		    	    return type;
		    	}
		    	function parseCollection(converter, currentTarget, currentTerm, currentProperty, currentSource, collectionDefinition, parentFQN) {
		    	    const collectionDefinitionType = getOrInferCollectionType(collectionDefinition);
		    	    switch (collectionDefinitionType) {
		    	        case 'PropertyPath':
		    	            return collectionDefinition.map((path, index) => mapPropertyPath(converter, path, `${parentFQN}/${index}`, currentTarget, currentTerm));
		    	        case 'Path':
		    	            // TODO: make lazy?
		    	            return collectionDefinition.map((pathValue) => {
		    	                return resolveTarget(converter, currentTarget, pathValue.Path, currentTerm).target;
		    	            });
		    	        case 'AnnotationPath':
		    	            return collectionDefinition.map((path, index) => mapAnnotationPath(converter, path, `${parentFQN}/${index}`, currentTarget, currentTerm));
		    	        case 'NavigationPropertyPath':
		    	            return collectionDefinition.map((path, index) => mapNavigationPropertyPath(converter, path, `${parentFQN}/${index}`, currentTarget, currentTerm));
		    	        case 'Record':
		    	            return collectionDefinition.map((recordDefinition, recordIdx) => {
		    	                return parseRecord(converter, currentTerm, currentTarget, currentProperty, currentSource, recordDefinition, `${parentFQN}/${recordIdx}`);
		    	            });
		    	        case 'Apply':
		    	        case 'Null':
		    	        case 'If':
		    	        case 'Eq':
		    	        case 'Ne':
		    	        case 'Lt':
		    	        case 'Gt':
		    	        case 'Le':
		    	        case 'Ge':
		    	        case 'Not':
		    	        case 'And':
		    	        case 'Or':
		    	            return collectionDefinition.map((ifValue) => ifValue);
		    	        case 'String':
		    	            return collectionDefinition.map((stringValue) => {
		    	                if (typeof stringValue === 'string' || stringValue === undefined) {
		    	                    return stringValue;
		    	                }
		    	                else {
		    	                    return stringValue.String;
		    	                }
		    	            });
		    	        default:
		    	            if (collectionDefinition.length === 0) {
		    	                return [];
		    	            }
		    	            throw new Error('Unsupported case');
		    	    }
		    	}
		    	function isV4NavigationProperty(navProp) {
		    	    return !!navProp.targetTypeName;
		    	}
		    	function convertAnnotation(converter, target, rawAnnotation) {
		    	    var _a;
		    	    let annotation;
		    	    if (rawAnnotation.record) {
		    	        annotation = parseRecord(converter, rawAnnotation.term, target, '', rawAnnotation.__source, rawAnnotation.record, rawAnnotation.fullyQualifiedName);
		    	    }
		    	    else if (rawAnnotation.collection === undefined) {
		    	        annotation = parseValue(converter, target, rawAnnotation.term, '', rawAnnotation.__source, (_a = rawAnnotation.value) !== null && _a !== void 0 ? _a : { type: 'Bool', Bool: true }, rawAnnotation.fullyQualifiedName);
		    	    }
		    	    else if (rawAnnotation.collection) {
		    	        annotation = parseCollection(converter, target, rawAnnotation.term, '', rawAnnotation.__source, rawAnnotation.collection, rawAnnotation.fullyQualifiedName);
		    	    }
		    	    else {
		    	        throw new Error('Unsupported case');
		    	    }
		    	    switch (typeof annotation) {
		    	        case 'string':
		    	            // eslint-disable-next-line no-new-wrappers
		    	            annotation = new String(annotation);
		    	            break;
		    	        case 'boolean':
		    	            // eslint-disable-next-line no-new-wrappers
		    	            annotation = new Boolean(annotation);
		    	            break;
		    	        case 'number':
		    	            annotation = new Number(annotation);
		    	            break;
		    	    }
		    	    annotation.fullyQualifiedName = rawAnnotation.fullyQualifiedName;
		    	    annotation[ANNOTATION_TARGET] = target;
		    	    const [vocAlias, vocTerm] = converter.splitTerm(rawAnnotation.term);
		    	    annotation.term = converter.unalias(`${vocAlias}.${vocTerm}`, VocabularyReferences_1.VocabularyReferences);
		    	    annotation.qualifier = rawAnnotation.qualifier;
		    	    annotation.__source = rawAnnotation.__source;
		    	    try {
		    	        (0, utils_1.lazy)(annotation, 'annotations', resolveAnnotationsOnAnnotation(converter, rawAnnotation, annotation));
		    	    }
		    	    catch (e) {
		    	        // not an error: parseRecord() already adds annotations, but the other parseXXX functions don't, so this can happen
		    	    }
		    	    return annotation;
		    	}
		    	class Converter {
		    	    /**
		    	     * Get preprocessed annotations on the specified target.
		    	     *
		    	     * @param target    The annotation target
		    	     * @returns An array of annotations
		    	     */
		    	    getAnnotations(target) {
		    	        var _a;
		    	        if (this.annotationsByTarget === undefined) {
		    	            const annotationSources = Object.keys(this.rawSchema.annotations).map((source) => ({
		    	                name: source,
		    	                annotationList: this.rawSchema.annotations[source]
		    	            }));
		    	            this.annotationsByTarget = (0, utils_1.mergeAnnotations)(this.rawMetadata.references, ...annotationSources);
		    	        }
		    	        return (_a = this.annotationsByTarget[target]) !== null && _a !== void 0 ? _a : [];
		    	    }
		    	    getConvertedEntityContainer() {
		    	        return this.getConvertedElement(this.rawMetadata.schema.entityContainer.fullyQualifiedName, this.rawMetadata.schema.entityContainer, convertEntityContainer);
		    	    }
		    	    getConvertedEntitySet(fullyQualifiedName) {
		    	        return this.convertedOutput.entitySets.by_fullyQualifiedName(fullyQualifiedName);
		    	    }
		    	    getConvertedSingleton(fullyQualifiedName) {
		    	        return this.convertedOutput.singletons.by_fullyQualifiedName(fullyQualifiedName);
		    	    }
		    	    getConvertedEntityType(fullyQualifiedName) {
		    	        return this.convertedOutput.entityTypes.by_fullyQualifiedName(fullyQualifiedName);
		    	    }
		    	    getConvertedComplexType(fullyQualifiedName) {
		    	        return this.convertedOutput.complexTypes.by_fullyQualifiedName(fullyQualifiedName);
		    	    }
		    	    getConvertedTypeDefinition(fullyQualifiedName) {
		    	        return this.convertedOutput.typeDefinitions.by_fullyQualifiedName(fullyQualifiedName);
		    	    }
		    	    getConvertedActionImport(fullyQualifiedName) {
		    	        let actionImport = this.convertedOutput.actionImports.by_fullyQualifiedName(fullyQualifiedName);
		    	        if (!actionImport) {
		    	            actionImport = this.convertedOutput.actionImports.by_name(fullyQualifiedName);
		    	        }
		    	        return actionImport;
		    	    }
		    	    getConvertedAction(fullyQualifiedName) {
		    	        return this.convertedOutput.actions.by_fullyQualifiedName(fullyQualifiedName);
		    	    }
		    	    convert(rawValue, map) {
		    	        if (Array.isArray(rawValue)) {
		    	            return () => {
		    	                const converted = rawValue.reduce((convertedElements, rawElement) => {
		    	                    const convertedElement = this.getConvertedElement(rawElement.fullyQualifiedName, rawElement, map);
		    	                    if (convertedElement) {
		    	                        convertedElements.push(convertedElement);
		    	                    }
		    	                    return convertedElements;
		    	                }, []);
		    	                (0, utils_1.addGetByValue)(converted, 'name');
		    	                (0, utils_1.addGetByValue)(converted, 'fullyQualifiedName');
		    	                return converted;
		    	            };
		    	        }
		    	        else {
		    	            return () => this.getConvertedElement(rawValue.fullyQualifiedName, rawValue, map);
		    	        }
		    	    }
		    	    constructor(rawMetadata, convertedOutput) {
		    	        this.convertedElements = new Map();
		    	        this.rawMetadata = rawMetadata;
		    	        this.rawSchema = rawMetadata.schema;
		    	        this.convertedOutput = convertedOutput;
		    	    }
		    	    getConvertedElement(fullyQualifiedName, rawElement, map) {
		    	        let converted = this.convertedElements.get(fullyQualifiedName);
		    	        if (converted === undefined) {
		    	            const rawMetadata = typeof rawElement === 'function' ? rawElement.apply(undefined, [fullyQualifiedName]) : rawElement;
		    	            if (rawMetadata !== undefined) {
		    	                converted = map.apply(undefined, [this, rawMetadata]);
		    	                this.convertedElements.set(fullyQualifiedName, converted);
		    	            }
		    	        }
		    	        return converted;
		    	    }
		    	    logError(message) {
		    	        this.convertedOutput.diagnostics.push({ message });
		    	    }
		    	    /**
		    	     * Split the alias from the term value.
		    	     *
		    	     * @param term the value of the term
		    	     * @returns the term alias and the actual term value
		    	     */
		    	    splitTerm(term) {
		    	        const aliased = (0, utils_1.alias)(VocabularyReferences_1.VocabularyReferences, term);
		    	        return (0, utils_1.splitAtLast)(aliased, '.');
		    	    }
		    	    unalias(value, references = this.rawMetadata.references) {
		    	        var _a;
		    	        return (_a = (0, utils_1.unalias)(references, value, this.rawSchema.namespace)) !== null && _a !== void 0 ? _a : '';
		    	    }
		    	}
		    	function resolveEntityType(converter, fullyQualifiedName) {
		    	    return () => {
		    	        let entityType = converter.getConvertedEntityType(fullyQualifiedName);
		    	        if (!entityType) {
		    	            converter.logError(`EntityType '${fullyQualifiedName}' not found`);
		    	            entityType = {};
		    	        }
		    	        return entityType;
		    	    };
		    	}
		    	function resolveNavigationPropertyBindings(converter, rawNavigationPropertyBindings) {
		    	    return () => Object.keys(rawNavigationPropertyBindings).reduce((navigationPropertyBindings, bindingPath) => {
		    	        const rawBindingTarget = rawNavigationPropertyBindings[bindingPath];
		    	        (0, utils_1.lazy)(navigationPropertyBindings, bindingPath, () => {
		    	            var _a;
		    	            // the NavigationPropertyBinding will lead to either an EntitySet or a Singleton, it cannot be undefined
		    	            return (((_a = converter.getConvertedEntitySet(rawBindingTarget)) !== null && _a !== void 0 ? _a : converter.getConvertedSingleton(rawBindingTarget)));
		    	        });
		    	        return navigationPropertyBindings;
		    	    }, {});
		    	}
		    	function resolveAnnotations(converter, rawAnnotationTarget) {
		    	    const nestedAnnotations = rawAnnotationTarget.annotations;
		    	    return () => createAnnotationsObject(converter, rawAnnotationTarget, nestedAnnotations !== null && nestedAnnotations !== void 0 ? nestedAnnotations : converter.getAnnotations(rawAnnotationTarget.fullyQualifiedName));
		    	}
		    	function resolveAnnotationsOnAnnotation(converter, annotationRecord, annotationTerm) {
		    	    return () => {
		    	        const currentFQN = annotationTerm.fullyQualifiedName;
		    	        // be graceful when resolving annotations on annotations: Sometimes they are referenced directly, sometimes they
		    	        // are part of the global annotations list
		    	        let annotations;
		    	        if (annotationRecord.annotations && annotationRecord.annotations.length > 0) {
		    	            annotations = annotationRecord.annotations;
		    	        }
		    	        else {
		    	            annotations = converter.getAnnotations(currentFQN);
		    	        }
		    	        annotations === null || annotations === void 0 ? void 0 : annotations.forEach((annotation) => {
		    	            annotation.target = currentFQN;
		    	            annotation.__source = annotationTerm.__source;
		    	            annotation[ANNOTATION_TARGET] = annotationTerm[ANNOTATION_TARGET];
		    	            annotation.fullyQualifiedName = `${currentFQN}@${annotation.term}`;
		    	        });
		    	        return createAnnotationsObject(converter, annotationTerm, annotations !== null && annotations !== void 0 ? annotations : []);
		    	    };
		    	}
		    	function createAnnotationsObject(converter, target, rawAnnotations) {
		    	    return rawAnnotations.reduce((vocabularyAliases, annotation) => {
		    	        const [vocAlias, vocTerm] = converter.splitTerm(annotation.term);
		    	        const vocTermWithQualifier = `${vocTerm}${annotation.qualifier ? '#' + annotation.qualifier : ''}`;
		    	        if (vocabularyAliases[vocAlias] === undefined) {
		    	            vocabularyAliases[vocAlias] = {};
		    	        }
		    	        if (!vocabularyAliases[vocAlias].hasOwnProperty(vocTermWithQualifier)) {
		    	            (0, utils_1.lazy)(vocabularyAliases[vocAlias], vocTermWithQualifier, () => converter.getConvertedElement(annotation.fullyQualifiedName, annotation, (converter, rawAnnotation) => convertAnnotation(converter, target, rawAnnotation)));
		    	        }
		    	        return vocabularyAliases;
		    	    }, {});
		    	}
		    	/**
		    	 * Converts an EntityContainer.
		    	 *
		    	 * @param converter     Converter
		    	 * @param rawEntityContainer    Unconverted EntityContainer
		    	 * @returns The converted EntityContainer
		    	 */
		    	function convertEntityContainer(converter, rawEntityContainer) {
		    	    const convertedEntityContainer = rawEntityContainer;
		    	    (0, utils_1.lazy)(convertedEntityContainer, 'annotations', resolveAnnotations(converter, rawEntityContainer));
		    	    (0, utils_1.lazy)(convertedEntityContainer, 'entitySets', converter.convert(converter.rawSchema.entitySets, convertEntitySet));
		    	    (0, utils_1.lazy)(convertedEntityContainer, 'singletons', converter.convert(converter.rawSchema.singletons, convertSingleton));
		    	    (0, utils_1.lazy)(convertedEntityContainer, 'actionImports', converter.convert(converter.rawSchema.actionImports, convertActionImport));
		    	    return convertedEntityContainer;
		    	}
		    	/**
		    	 * Converts a Singleton.
		    	 *
		    	 * @param converter   Converter
		    	 * @param rawSingleton  Unconverted Singleton
		    	 * @returns The converted Singleton
		    	 */
		    	function convertSingleton(converter, rawSingleton) {
		    	    const convertedSingleton = rawSingleton;
		    	    (0, utils_1.lazy)(convertedSingleton, 'entityType', resolveEntityType(converter, rawSingleton.entityTypeName));
		    	    (0, utils_1.lazy)(convertedSingleton, 'annotations', resolveAnnotations(converter, convertedSingleton));
		    	    const _rawNavigationPropertyBindings = rawSingleton.navigationPropertyBinding;
		    	    (0, utils_1.lazy)(convertedSingleton, 'navigationPropertyBinding', resolveNavigationPropertyBindings(converter, _rawNavigationPropertyBindings));
		    	    return convertedSingleton;
		    	}
		    	/**
		    	 * Converts an EntitySet.
		    	 *
		    	 * @param converter   Converter
		    	 * @param rawEntitySet  Unconverted EntitySet
		    	 * @returns The converted EntitySet
		    	 */
		    	function convertEntitySet(converter, rawEntitySet) {
		    	    const convertedEntitySet = rawEntitySet;
		    	    (0, utils_1.lazy)(convertedEntitySet, 'entityType', resolveEntityType(converter, rawEntitySet.entityTypeName));
		    	    (0, utils_1.lazy)(convertedEntitySet, 'annotations', resolveAnnotations(converter, convertedEntitySet));
		    	    const _rawNavigationPropertyBindings = rawEntitySet.navigationPropertyBinding;
		    	    (0, utils_1.lazy)(convertedEntitySet, 'navigationPropertyBinding', resolveNavigationPropertyBindings(converter, _rawNavigationPropertyBindings));
		    	    return convertedEntitySet;
		    	}
		    	/**
		    	 * Converts an EntityType.
		    	 *
		    	 * @param converter   Converter
		    	 * @param rawEntityType  Unconverted EntityType
		    	 * @returns The converted EntityType
		    	 */
		    	function convertEntityType(converter, rawEntityType) {
		    	    const convertedEntityType = rawEntityType;
		    	    rawEntityType.keys.forEach((keyProp) => {
		    	        keyProp.isKey = true;
		    	    });
		    	    (0, utils_1.lazy)(convertedEntityType, 'annotations', resolveAnnotations(converter, rawEntityType));
		    	    (0, utils_1.lazy)(convertedEntityType, 'keys', converter.convert(rawEntityType.keys, convertProperty));
		    	    (0, utils_1.lazy)(convertedEntityType, 'entityProperties', converter.convert(rawEntityType.entityProperties, convertProperty));
		    	    (0, utils_1.lazy)(convertedEntityType, 'navigationProperties', converter.convert(rawEntityType.navigationProperties, convertNavigationProperty));
		    	    (0, utils_1.lazy)(convertedEntityType, 'actions', () => converter.rawSchema.actions
		    	        .filter((rawAction) => rawAction.isBound &&
		    	        (rawAction.sourceType === rawEntityType.fullyQualifiedName ||
		    	            rawAction.sourceType === `Collection(${rawEntityType.fullyQualifiedName})`))
		    	        .reduce((actions, rawAction) => {
		    	        const name = `${converter.rawSchema.namespace}.${rawAction.name}`;
		    	        actions[name] = converter.getConvertedAction(rawAction.fullyQualifiedName);
		    	        return actions;
		    	    }, {}));
		    	    convertedEntityType.resolvePath = (relativePath, includeVisitedObjects) => {
		    	        const resolved = resolveTarget(converter, rawEntityType, relativePath);
		    	        if (includeVisitedObjects) {
		    	            return { target: resolved.target, visitedObjects: resolved.objectPath, messages: resolved.messages };
		    	        }
		    	        else {
		    	            return resolved.target;
		    	        }
		    	    };
		    	    return convertedEntityType;
		    	}
		    	/**
		    	 * Converts a Property.
		    	 *
		    	 * @param converter   Converter
		    	 * @param rawProperty  Unconverted Property
		    	 * @returns The converted Property
		    	 */
		    	function convertProperty(converter, rawProperty) {
		    	    const convertedProperty = rawProperty;
		    	    (0, utils_1.lazy)(convertedProperty, 'annotations', resolveAnnotations(converter, rawProperty));
		    	    (0, utils_1.lazy)(convertedProperty, 'targetType', () => {
		    	        var _a;
		    	        const type = rawProperty.type;
		    	        const typeName = type.startsWith('Collection') ? type.substring(11, type.length - 1) : type;
		    	        return (_a = converter.getConvertedComplexType(typeName)) !== null && _a !== void 0 ? _a : converter.getConvertedTypeDefinition(typeName);
		    	    });
		    	    return convertedProperty;
		    	}
		    	/**
		    	 * Converts a NavigationProperty.
		    	 *
		    	 * @param converter   Converter
		    	 * @param rawNavigationProperty  Unconverted NavigationProperty
		    	 * @returns The converted NavigationProperty
		    	 */
		    	function convertNavigationProperty(converter, rawNavigationProperty) {
		    	    var _a, _b, _c;
		    	    const convertedNavigationProperty = rawNavigationProperty;
		    	    convertedNavigationProperty.referentialConstraint = (_a = convertedNavigationProperty.referentialConstraint) !== null && _a !== void 0 ? _a : [];
		    	    if (!isV4NavigationProperty(rawNavigationProperty)) {
		    	        const associationEnd = (_b = converter.rawSchema.associations
		    	            .find((association) => association.fullyQualifiedName === rawNavigationProperty.relationship)) === null || _b === void 0 ? void 0 : _b.associationEnd.find((end) => end.role === rawNavigationProperty.toRole);
		    	        convertedNavigationProperty.isCollection = (associationEnd === null || associationEnd === void 0 ? void 0 : associationEnd.multiplicity) === '*';
		    	        convertedNavigationProperty.targetTypeName = (_c = associationEnd === null || associationEnd === void 0 ? void 0 : associationEnd.type) !== null && _c !== void 0 ? _c : '';
		    	    }
		    	    (0, utils_1.lazy)(convertedNavigationProperty, 'targetType', resolveEntityType(converter, rawNavigationProperty.targetTypeName));
		    	    (0, utils_1.lazy)(convertedNavigationProperty, 'annotations', resolveAnnotations(converter, rawNavigationProperty));
		    	    return convertedNavigationProperty;
		    	}
		    	/**
		    	 * Converts an ActionImport.
		    	 *
		    	 * @param converter   Converter
		    	 * @param rawActionImport  Unconverted ActionImport
		    	 * @returns The converted ActionImport
		    	 */
		    	function convertActionImport(converter, rawActionImport) {
		    	    const convertedActionImport = rawActionImport;
		    	    (0, utils_1.lazy)(convertedActionImport, 'annotations', resolveAnnotations(converter, rawActionImport));
		    	    (0, utils_1.lazy)(convertedActionImport, 'action', () => {
		    	        const rawActions = converter.rawSchema.actions.filter((rawAction) => !rawAction.isBound && rawAction.fullyQualifiedName.startsWith(rawActionImport.actionName));
		    	        // this always resolves to a unique unbound action, but resolution of unbound functions can be ambiguous:
		    	        // unbound function FQNs have overloads depending on all of their parameters
		    	        if (rawActions.length > 1) {
		    	            converter.logError(`Ambiguous reference in action import: ${rawActionImport.fullyQualifiedName}`);
		    	        }
		    	        // return the first matching action or function
		    	        return converter.getConvertedAction(rawActions[0].fullyQualifiedName);
		    	    });
		    	    return convertedActionImport;
		    	}
		    	/**
		    	 * Converts an Action.
		    	 *
		    	 * @param converter   Converter
		    	 * @param rawAction  Unconverted Action
		    	 * @returns The converted Action
		    	 */
		    	function convertAction(converter, rawAction) {
		    	    const convertedAction = rawAction;
		    	    if (convertedAction.sourceType) {
		    	        (0, utils_1.lazy)(convertedAction, 'sourceEntityType', resolveEntityType(converter, rawAction.sourceType));
		    	    }
		    	    if (convertedAction.returnType) {
		    	        (0, utils_1.lazy)(convertedAction, 'returnEntityType', resolveEntityType(converter, rawAction.returnType));
		    	    }
		    	    (0, utils_1.lazy)(convertedAction, 'parameters', converter.convert(rawAction.parameters, convertActionParameter));
		    	    (0, utils_1.lazy)(convertedAction, 'annotations', () => {
		    	        /*
		    	            Annotation resolution rule for actions:

		    	            (1) annotation target: the specific unbound or bound overload, e.g.
		    	                    - for actions:   "x.y.z.unboundAction()" / "x.y.z.boundAction(x.y.z.Entity)"
		    	                    - for functions: "x.y.z.unboundFunction(Edm.String)" / "x.y.z.unboundFunction(x.y.z.Entity,Edm.String)"
		    	            (2) annotation target: unspecified overload, e.g.
		    	                - for actions:   "x.y.z.unboundAction" / "x.y.z.boundAction"
		    	                - for functions: "x.y.z.unboundFunction" / "x.y.z.unboundFunction"

		    	            When resolving (1) takes precedence over (2). That is, annotations on the specific overload overwrite
		    	            annotations on the unspecific overload, on term/qualifier level.
		    	        */
		    	        const unspecificOverloadTarget = (0, utils_1.substringBeforeFirst)(rawAction.fullyQualifiedName, '(');
		    	        const specificOverloadTarget = rawAction.fullyQualifiedName;
		    	        const effectiveAnnotations = converter.getAnnotations(specificOverloadTarget);
		    	        const unspecificAnnotations = converter.getAnnotations(unspecificOverloadTarget);
		    	        for (const unspecificAnnotation of unspecificAnnotations) {
		    	            if (!effectiveAnnotations.some((annotation) => annotation.term === unspecificAnnotation.term &&
		    	                annotation.qualifier === unspecificAnnotation.qualifier)) {
		    	                effectiveAnnotations.push(unspecificAnnotation);
		    	            }
		    	        }
		    	        return createAnnotationsObject(converter, rawAction, effectiveAnnotations);
		    	    });
		    	    return convertedAction;
		    	}
		    	/**
		    	 * Converts an ActionParameter.
		    	 *
		    	 * @param converter   Converter
		    	 * @param rawActionParameter  Unconverted ActionParameter
		    	 * @returns The converted ActionParameter
		    	 */
		    	function convertActionParameter(converter, rawActionParameter) {
		    	    const convertedActionParameter = rawActionParameter;
		    	    (0, utils_1.lazy)(convertedActionParameter, 'typeReference', () => {
		    	        var _a, _b;
		    	        return (_b = (_a = converter.getConvertedEntityType(rawActionParameter.type)) !== null && _a !== void 0 ? _a : converter.getConvertedComplexType(rawActionParameter.type)) !== null && _b !== void 0 ? _b : converter.getConvertedTypeDefinition(rawActionParameter.type);
		    	    });
		    	    (0, utils_1.lazy)(convertedActionParameter, 'annotations', () => {
		    	        // annotations on action parameters are resolved following the rules for actions
		    	        const unspecificOverloadTarget = rawActionParameter.fullyQualifiedName.substring(0, rawActionParameter.fullyQualifiedName.indexOf('(')) +
		    	            rawActionParameter.fullyQualifiedName.substring(rawActionParameter.fullyQualifiedName.lastIndexOf(')') + 1);
		    	        const specificOverloadTarget = rawActionParameter.fullyQualifiedName;
		    	        const effectiveAnnotations = converter.getAnnotations(specificOverloadTarget);
		    	        const unspecificAnnotations = converter.getAnnotations(unspecificOverloadTarget);
		    	        for (const unspecificAnnotation of unspecificAnnotations) {
		    	            if (!effectiveAnnotations.some((annotation) => annotation.term === unspecificAnnotation.term &&
		    	                annotation.qualifier === unspecificAnnotation.qualifier)) {
		    	                effectiveAnnotations.push(unspecificAnnotation);
		    	            }
		    	        }
		    	        return createAnnotationsObject(converter, rawActionParameter, effectiveAnnotations);
		    	    });
		    	    return convertedActionParameter;
		    	}
		    	/**
		    	 * Converts a ComplexType.
		    	 *
		    	 * @param converter   Converter
		    	 * @param rawComplexType  Unconverted ComplexType
		    	 * @returns The converted ComplexType
		    	 */
		    	function convertComplexType(converter, rawComplexType) {
		    	    const convertedComplexType = rawComplexType;
		    	    (0, utils_1.lazy)(convertedComplexType, 'properties', converter.convert(rawComplexType.properties, convertProperty));
		    	    (0, utils_1.lazy)(convertedComplexType, 'navigationProperties', converter.convert(rawComplexType.navigationProperties, convertNavigationProperty));
		    	    (0, utils_1.lazy)(convertedComplexType, 'annotations', resolveAnnotations(converter, rawComplexType));
		    	    return convertedComplexType;
		    	}
		    	/**
		    	 * Converts a TypeDefinition.
		    	 *
		    	 * @param converter   Converter
		    	 * @param rawTypeDefinition  Unconverted TypeDefinition
		    	 * @returns The converted TypeDefinition
		    	 */
		    	function convertTypeDefinition(converter, rawTypeDefinition) {
		    	    const convertedTypeDefinition = rawTypeDefinition;
		    	    (0, utils_1.lazy)(convertedTypeDefinition, 'annotations', resolveAnnotations(converter, rawTypeDefinition));
		    	    return convertedTypeDefinition;
		    	}
		    	/**
		    	 * Convert a RawMetadata into an object representation to be used to easily navigate a metadata object and its annotation.
		    	 *
		    	 * @param rawMetadata
		    	 * @returns the converted representation of the metadata.
		    	 */
		    	function convert(rawMetadata) {
		    	    // Converter Output
		    	    const convertedOutput = {
		    	        version: rawMetadata.version,
		    	        namespace: rawMetadata.schema.namespace,
		    	        annotations: rawMetadata.schema.annotations,
		    	        references: VocabularyReferences_1.VocabularyReferences,
		    	        diagnostics: []
		    	    };
		    	    // Converter
		    	    const converter = new Converter(rawMetadata, convertedOutput);
		    	    (0, utils_1.lazy)(convertedOutput, 'entityContainer', converter.convert(converter.rawSchema.entityContainer, convertEntityContainer));
		    	    (0, utils_1.lazy)(convertedOutput, 'entitySets', converter.convert(converter.rawSchema.entitySets, convertEntitySet));
		    	    (0, utils_1.lazy)(convertedOutput, 'singletons', converter.convert(converter.rawSchema.singletons, convertSingleton));
		    	    (0, utils_1.lazy)(convertedOutput, 'entityTypes', converter.convert(converter.rawSchema.entityTypes, convertEntityType));
		    	    (0, utils_1.lazy)(convertedOutput, 'actions', converter.convert(converter.rawSchema.actions, convertAction));
		    	    (0, utils_1.lazy)(convertedOutput, 'complexTypes', converter.convert(converter.rawSchema.complexTypes, convertComplexType));
		    	    (0, utils_1.lazy)(convertedOutput, 'actionImports', converter.convert(converter.rawSchema.actionImports, convertActionImport));
		    	    (0, utils_1.lazy)(convertedOutput, 'typeDefinitions', converter.convert(converter.rawSchema.typeDefinitions, convertTypeDefinition));
		    	    convertedOutput.resolvePath = function resolvePath(path) {
		    	        const targetResolution = resolveTarget(converter, undefined, path);
		    	        if (targetResolution.target) {
		    	            appendObjectPath(targetResolution.objectPath, targetResolution.target);
		    	        }
		    	        return targetResolution;
		    	    };
		    	    return convertedOutput;
		    	}
		    	converter.convert = convert;
		    	
		    	return converter;
		    }

		    var writeback = {};

		    var hasRequiredWriteback;

		    function requireWriteback () {
		    	if (hasRequiredWriteback) return writeback;
		    	hasRequiredWriteback = 1;
		    	Object.defineProperty(writeback, "__esModule", { value: true });
		    	writeback.revertTermToGenericType = void 0;
		    	const utils_1 = requireUtils();
		    	/**
		    	 * Revert an object to its raw type equivalent.
		    	 *
		    	 * @param references the current reference
		    	 * @param value the value to revert
		    	 * @returns the raw value
		    	 */
		    	function revertObjectToRawType(references, value) {
		    	    var _a, _b, _c, _d, _e, _f, _g;
		    	    let result;
		    	    if (Array.isArray(value)) {
		    	        // Special case of flag enum type
		    	        const firstValue = value[0];
		    	        let isEnumFlags = false;
		    	        if (firstValue && typeof firstValue === 'string') {
		    	            const valueMatches = firstValue.valueOf().split('.');
		    	            if (valueMatches.length > 1 && references.find((ref) => ref.alias === valueMatches[0])) {
		    	                isEnumFlags = utils_1.EnumIsFlag[(0, utils_1.substringBeforeFirst)(firstValue, '/')];
		    	            }
		    	        }
		    	        if (isEnumFlags) {
		    	            result = {
		    	                type: 'EnumMember',
		    	                EnumMember: value.map((val) => val.valueOf()).join(' ')
		    	            };
		    	        }
		    	        else {
		    	            result = {
		    	                type: 'Collection',
		    	                Collection: value.map((anno) => revertCollectionItemToRawType(references, anno))
		    	            };
		    	        }
		    	    }
		    	    else if ((_a = value.isDecimal) === null || _a === void 0 ? void 0 : _a.call(value)) {
		    	        result = {
		    	            type: 'Decimal',
		    	            Decimal: value.valueOf()
		    	        };
		    	    }
		    	    else if ((_b = value.isDouble) === null || _b === void 0 ? void 0 : _b.call(value)) {
		    	        result = {
		    	            type: 'Double',
		    	            Double: value.valueOf()
		    	        };
		    	    }
		    	    else if ((_c = value.isString) === null || _c === void 0 ? void 0 : _c.call(value)) {
		    	        const valueMatches = value.valueOf().split('.');
		    	        if (valueMatches.length > 1 && references.find((ref) => ref.alias === valueMatches[0])) {
		    	            result = {
		    	                type: 'EnumMember',
		    	                EnumMember: value.valueOf()
		    	            };
		    	        }
		    	        else {
		    	            result = {
		    	                type: 'String',
		    	                String: value.valueOf()
		    	            };
		    	        }
		    	    }
		    	    else if ((_d = value.isInt) === null || _d === void 0 ? void 0 : _d.call(value)) {
		    	        result = {
		    	            type: 'Int',
		    	            Int: value.valueOf()
		    	        };
		    	    }
		    	    else if ((_e = value.isFloat) === null || _e === void 0 ? void 0 : _e.call(value)) {
		    	        result = {
		    	            type: 'Float',
		    	            Float: value.valueOf()
		    	        };
		    	    }
		    	    else if ((_f = value.isDate) === null || _f === void 0 ? void 0 : _f.call(value)) {
		    	        result = {
		    	            type: 'Date',
		    	            Date: value.valueOf()
		    	        };
		    	    }
		    	    else if ((_g = value.isBoolean) === null || _g === void 0 ? void 0 : _g.call(value)) {
		    	        result = {
		    	            type: 'Bool',
		    	            Bool: value.valueOf()
		    	        };
		    	    }
		    	    else if (value.type === 'Path') {
		    	        result = {
		    	            type: 'Path',
		    	            Path: value.path
		    	        };
		    	    }
		    	    else if (value.type === 'AnnotationPath') {
		    	        result = {
		    	            type: 'AnnotationPath',
		    	            AnnotationPath: value.value
		    	        };
		    	    }
		    	    else if (value.type === 'Apply') {
		    	        result = {
		    	            type: 'Apply',
		    	            $Apply: value.$Apply,
		    	            $Function: value.$Function
		    	        };
		    	    }
		    	    else if (value.type === 'Null') {
		    	        result = {
		    	            type: 'Null'
		    	        };
		    	    }
		    	    else if (value.type === 'PropertyPath') {
		    	        result = {
		    	            type: 'PropertyPath',
		    	            PropertyPath: value.value
		    	        };
		    	    }
		    	    else if (value.type === 'NavigationPropertyPath') {
		    	        result = {
		    	            type: 'NavigationPropertyPath',
		    	            NavigationPropertyPath: value.value
		    	        };
		    	    }
		    	    else if (Object.prototype.hasOwnProperty.call(value, '$Type')) {
		    	        result = {
		    	            type: 'Record',
		    	            Record: revertCollectionItemToRawType(references, value)
		    	        };
		    	    }
		    	    return result;
		    	}
		    	/**
		    	 * Revert a value to its raw value depending on its type.
		    	 *
		    	 * @param references the current set of reference
		    	 * @param value the value to revert
		    	 * @returns the raw expression
		    	 */
		    	function revertValueToRawType(references, value) {
		    	    let result;
		    	    if (value.type === 'Constant') {
		    	        value = value.value;
		    	    }
		    	    const valueConstructor = value === null || value === void 0 ? void 0 : value.constructor.name;
		    	    switch (valueConstructor) {
		    	        case 'String':
		    	        case 'string':
		    	            const valueMatches = value.toString().split('.');
		    	            if (valueMatches.length > 1 && references.find((ref) => ref.alias === valueMatches[0])) {
		    	                result = {
		    	                    type: 'EnumMember',
		    	                    EnumMember: value.toString()
		    	                };
		    	            }
		    	            else {
		    	                result = {
		    	                    type: 'String',
		    	                    String: value.toString()
		    	                };
		    	            }
		    	            break;
		    	        case 'Boolean':
		    	        case 'boolean':
		    	            result = {
		    	                type: 'Bool',
		    	                Bool: value.valueOf()
		    	            };
		    	            break;
		    	        case 'Number':
		    	        case 'number':
		    	            if (value.toString() === value.toFixed()) {
		    	                result = {
		    	                    type: 'Int',
		    	                    Int: value.valueOf()
		    	                };
		    	            }
		    	            else {
		    	                result = {
		    	                    type: 'Decimal',
		    	                    Decimal: value.valueOf()
		    	                };
		    	            }
		    	            break;
		    	        case 'object':
		    	        default:
		    	            result = revertObjectToRawType(references, value);
		    	            break;
		    	    }
		    	    return result;
		    	}
		    	const restrictedKeys = ['$Type', 'term', '__source', 'qualifier', 'ActionTarget', 'fullyQualifiedName', 'annotations'];
		    	/**
		    	 * Revert the current embedded annotations to their raw type.
		    	 *
		    	 * @param references the current set of reference
		    	 * @param currentAnnotations the collection item to evaluate
		    	 * @param targetAnnotations the place where we need to add the annotation
		    	 */
		    	function revertAnnotationsToRawType(references, currentAnnotations, targetAnnotations) {
		    	    Object.keys(currentAnnotations)
		    	        .filter((key) => key !== '_annotations')
		    	        .forEach((key) => {
		    	        Object.keys(currentAnnotations[key]).forEach((term) => {
		    	            const parsedAnnotation = revertTermToGenericType(references, currentAnnotations[key][term]);
		    	            if (!parsedAnnotation.term) {
		    	                const unaliasedTerm = (0, utils_1.unalias)(references, `${key}.${term}`);
		    	                if (unaliasedTerm) {
		    	                    const qualifiedSplit = unaliasedTerm.split('#');
		    	                    parsedAnnotation.term = qualifiedSplit[0];
		    	                    if (qualifiedSplit.length > 1) {
		    	                        // Sub Annotation with a qualifier, not sure when that can happen in real scenarios
		    	                        parsedAnnotation.qualifier = qualifiedSplit[1];
		    	                    }
		    	                }
		    	            }
		    	            targetAnnotations.push(parsedAnnotation);
		    	        });
		    	    });
		    	}
		    	/**
		    	 * Revert the current collection item to the corresponding raw annotation.
		    	 *
		    	 * @param references the current set of reference
		    	 * @param collectionItem the collection item to evaluate
		    	 * @returns the raw type equivalent
		    	 */
		    	function revertCollectionItemToRawType(references, collectionItem) {
		    	    if (typeof collectionItem === 'string') {
		    	        return {
		    	            type: 'String',
		    	            String: collectionItem
		    	        };
		    	    }
		    	    else if (typeof collectionItem === 'object') {
		    	        if (collectionItem.hasOwnProperty('$Type')) {
		    	            // Annotation Record
		    	            const outItem = {
		    	                type: collectionItem.$Type,
		    	                propertyValues: []
		    	            };
		    	            // Could validate keys and type based on $Type
		    	            Object.keys(collectionItem).forEach((collectionKey) => {
		    	                if (restrictedKeys.indexOf(collectionKey) === -1) {
		    	                    const value = collectionItem[collectionKey];
		    	                    outItem.propertyValues.push({
		    	                        name: collectionKey,
		    	                        value: revertValueToRawType(references, value)
		    	                    });
		    	                }
		    	                else if (collectionKey === 'annotations' && Object.keys(collectionItem[collectionKey]).length > 0) {
		    	                    outItem.annotations = [];
		    	                    revertAnnotationsToRawType(references, collectionItem[collectionKey], outItem.annotations);
		    	                }
		    	            });
		    	            return outItem;
		    	        }
		    	        else if (collectionItem.type === 'PropertyPath') {
		    	            return {
		    	                type: 'PropertyPath',
		    	                PropertyPath: collectionItem.value
		    	            };
		    	        }
		    	        else if (collectionItem.type === 'AnnotationPath') {
		    	            return {
		    	                type: 'AnnotationPath',
		    	                AnnotationPath: collectionItem.value
		    	            };
		    	        }
		    	        else if (collectionItem.type === 'NavigationPropertyPath') {
		    	            return {
		    	                type: 'NavigationPropertyPath',
		    	                NavigationPropertyPath: collectionItem.value
		    	            };
		    	        }
		    	        else if (collectionItem.type === 'Constant') {
		    	            return collectionItem.value;
		    	        }
		    	    }
		    	    return undefined;
		    	}
		    	/**
		    	 * Revert an annotation term to it's generic or raw equivalent.
		    	 *
		    	 * @param references the reference of the current context
		    	 * @param annotation the annotation term to revert
		    	 * @returns the raw annotation
		    	 */
		    	function revertTermToGenericType(references, annotation) {
		    	    const baseAnnotation = {
		    	        term: annotation.term,
		    	        qualifier: annotation.qualifier
		    	    };
		    	    if (Array.isArray(annotation)) {
		    	        // Collection
		    	        if (annotation.hasOwnProperty('annotations') && Object.keys(annotation.annotations).length > 0) {
		    	            // Annotation on a collection itself, not sure when that happens if at all
		    	            baseAnnotation.annotations = [];
		    	            revertAnnotationsToRawType(references, annotation.annotations, baseAnnotation.annotations);
		    	        }
		    	        return {
		    	            ...baseAnnotation,
		    	            collection: annotation.map((anno) => revertCollectionItemToRawType(references, anno))
		    	        };
		    	    }
		    	    else if (annotation.hasOwnProperty('$Type')) {
		    	        return { ...baseAnnotation, record: revertCollectionItemToRawType(references, annotation) };
		    	    }
		    	    else {
		    	        return { ...baseAnnotation, value: revertValueToRawType(references, annotation) };
		    	    }
		    	}
		    	writeback.revertTermToGenericType = revertTermToGenericType;
		    	
		    	return writeback;
		    }

		    var hasRequiredDist$1;

		    function requireDist$1 () {
		    	if (hasRequiredDist$1) return dist$1;
		    	hasRequiredDist$1 = 1;
		    	(function (exports) {
		    		var __createBinding = (dist$1 && dist$1.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    		    if (k2 === undefined) k2 = k;
		    		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		    		      desc = { enumerable: true, get: function() { return m[k]; } };
		    		    }
		    		    Object.defineProperty(o, k2, desc);
		    		}) : (function(o, m, k, k2) {
		    		    if (k2 === undefined) k2 = k;
		    		    o[k2] = m[k];
		    		}));
		    		var __exportStar = (dist$1 && dist$1.__exportStar) || function(m, exports) {
		    		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
		    		};
		    		Object.defineProperty(exports, "__esModule", { value: true });
		    		__exportStar(requireConverter(), exports);
		    		__exportStar(requireUtils(), exports);
		    		__exportStar(requireWriteback(), exports);
		    		
		    	} (dist$1));
		    	return dist$1;
		    }

		    var distExports$1 = requireDist$1();

		    /**
		     * Extracts and converts OData metadata and annotations from the provided manifest and metadata strings.
		     *
		     * @param manifest - The application manifest containing data source definitions.
		     * @param metadataString - The main OData service metadata as an XML string.
		     * @param annotations - An array of annotation XML strings to be merged with the main metadata.
		     * @returns The converted metadata object.
		     * @throws Will throw an error if no valid OData service is found or if parsing fails.
		     */
		    const getMetadata = (manifest, metadataString, annotations) => {
		        const rawMetadata = [];
		        const dataSources = manifest['sap.app']?.['dataSources'] ?? {};
		        const serviceName = Object.keys(dataSources).find((name) => dataSources[name].type !== 'ODataAnnotation' && dataSources[name].uri);
		        if (!serviceName) {
		            throw new Error(`No valid OData service found in the manifest data sources, Data sources content: ${JSON.stringify(dataSources, null, 2)}`);
		        }
		        try {
		            rawMetadata.push(distExports$2.parse(metadataString, serviceName));
		            for (const annotation of annotations) {
		                rawMetadata.push(distExports$2.parse(annotation));
		            }
		        }
		        catch (error) {
		            throw new Error(`Failed to parse metadata: ${error}`);
		        }
		        return distExports$1.convert(distExports$2.merge(...rawMetadata));
		    };

		    exports.TargetCardType = void 0;
		    (function (TargetCardType) {
		        TargetCardType["AdaptiveCard"] = "adaptive-card";
		        TargetCardType["UI5IntegrationCard"] = "ui5-integration-card";
		    })(exports.TargetCardType || (exports.TargetCardType = {}));
		    exports.CardType = void 0;
		    (function (CardType) {
		        CardType["Object"] = "object";
		        CardType["List"] = "list";
		        CardType["Table"] = "table";
		    })(exports.CardType || (exports.CardType = {}));
		    const sapLogo = 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBoZWlnaHQ9IjMwIiB3aWR0aD0iNjAuOTM3NSIgdmlld0JveD0iMCAwIDQxMi4zOCAyMDQiPjxkZWZzPjxzdHlsZT4uY2xzLTEsLmNscy0ye2ZpbGwtcnVsZTpldmVub2RkO30uY2xzLTF7ZmlsbDp1cmwoI2xpbmVhci1ncmFkaWVudCk7fS5jbHMtMntmaWxsOiNmZmY7fTwvc3R5bGU+PGxpbmVhckdyYWRpZW50IGlkPSJsaW5lYXItZ3JhZGllbnQiIHgxPSIyMDYuMTkiIHgyPSIyMDYuMTkiIHkyPSIyMDQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMwMGI4ZjEiLz48c3RvcCBvZmZzZXQ9IjAuMDIiIHN0b3AtY29sb3I9IiMwMWI2ZjAiLz48c3RvcCBvZmZzZXQ9IjAuMzEiIHN0b3AtY29sb3I9IiMwZDkwZDkiLz48c3RvcCBvZmZzZXQ9IjAuNTgiIHN0b3AtY29sb3I9IiMxNzc1YzgiLz48c3RvcCBvZmZzZXQ9IjAuODIiIHN0b3AtY29sb3I9IiMxYzY1YmYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxZTVmYmIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cG9seWxpbmUgY2xhc3M9ImNscy0xIiBwb2ludHM9IjAgMjA0IDIwOC40MSAyMDQgNDEyLjM4IDAgMCAwIDAgMjA0Ii8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjQ0LjczLDM4LjM2bC00MC42LDB2OTYuNTJMMTY4LjY3LDM4LjMzSDEzMy41MWwtMzAuMjcsODAuNzJDMTAwLDk4LjcsNzksOTEuNjcsNjIuNCw4Ni40LDUxLjQ2LDgyLjg5LDM5Ljg1LDc3LjcyLDQwLDcyYy4wOS00LjY4LDYuMjMtOSwxOC4zOC04LjM4LDguMTcuNDMsMTUuMzcsMS4wOSwyOS43MSw4bDE0LjEtMjQuNTVDODkuMDYsNDAuNDIsNzEsMzYuMjEsNTYuMTcsMzYuMTloLS4wOWMtMTcuMjgsMC0zMS42OCw1LjYtNDAuNiwxNC44M0EzNC4yMywzNC4yMywwLDAsMCw1Ljc3LDc0LjdDNS41NCw4Ny4xNSwxMC4xMSw5NiwxOS43MSwxMDNjOC4xLDUuOTQsMTguNDYsOS43OSwyNy42LDEyLjYyLDExLjI3LDMuNDksMjAuNDcsNi41MywyMC4zNiwxM0E5LjU3LDkuNTcsMCwwLDEsNjUsMTM1Yy0yLjgxLDIuOS03LjEzLDQtMTMuMDksNC4xLTExLjQ5LjI0LTIwLTEuNTYtMzMuNjEtOS41OUw1Ljc3LDE1NC40MmE5My43Nyw5My43NywwLDAsMCw0NiwxMi4yMmwyLjExLDBjMTQuMjQtLjI1LDI1Ljc0LTQuMzEsMzQuOTItMTEuNzEuNTMtLjQxLDEtLjg0LDEuNDktMS4yOEw4Ni4xNywxNjQuNUgxMjNsNi4xOS0xOC44MmE2Ny40Niw2Ny40NiwwLDAsMCwyMS42OCwzLjQzLDY4LjMzLDY4LjMzLDAsMCwwLDIxLjE2LTMuMjVsNiwxOC42NGg2MC4xNHYtMzloMTMuMTFjMzEuNzEsMCw1MC40Ni0xNi4xNSw1MC40Ni00My4yQzMwMS43NCw1Mi4xOSwyODMuNTIsMzguMzYsMjQ0LjczLDM4LjM2Wk0xNTAuOTEsMTIxYTM2LjkzLDM2LjkzLDAsMCwxLTEzLTIuMjhsMTIuODctNDAuNTlIMTUxbDEyLjY1LDQwLjcxQTM4LjUsMzguNSwwLDAsMSwxNTAuOTEsMTIxWm05Ni4yLTIzLjMzaC04Ljk0VjY0LjkxaDguOTRjMTEuOTMsMCwyMS40NCw0LDIxLjQ0LDE2LjE0LDAsMTIuNi05LjUxLDE2LjU3LTIxLjQ0LDE2LjU3Ii8+PC9zdmc+Cg==';

		    const formatKeyValue = (value, type, targetCardType) => {
		        let parameter;
		        if (targetCardType) {
		            parameter = targetCardType === exports.TargetCardType.UI5IntegrationCard ? `{{parameters.${value}}}` : `{{${value}}}`;
		        }
		        else {
		            parameter = value;
		        }
		        return type === 'Edm.String' ? `'${parameter}'` : `${parameter}`;
		    };
		    /**
		     * Builds the object context path based on the keys and query
		     *
		     * @param app
		     * @param query
		     * @param entitySetPath
		     * @returns
		     */
		    const buildObjectContextPath = (app, query, entitySetPath, targetCardType) => {
		        const keys = app.objectKeys;
		        if (keys.length === 1 && app.fe === 'v4') {
		            const formattedKey = formatKeyValue(keys[0].name, keys[0].type, targetCardType);
		            return `${entitySetPath}(${formattedKey})?${query}`;
		        }
		        const key = keys.map((key) => `${key.name}=${formatKeyValue(key.name, key.type, targetCardType)}`).join(',');
		        return `${entitySetPath}(${key})?${query}`;
		    };
		    function buildQuery(queryComponents) {
		        return Object.entries(queryComponents)
		            .map(([key, value]) => `${key}=${value}`)
		            .join('&');
		    }
		    /**
		     * Build the context path for the card based on the card type and query
		     *
		     * @param app
		     * @param cardType
		     * @param query
		     * @returns
		     */
		    const buildContextPath = (app, cardType, targetCardType, { query }) => {
		        if (!app.objectEntitySet || !app.objectKeys) {
		            throw new Error('EntitySet or Keys not found');
		        }
		        const entitySetPath = `${app.servicePath}${app.objectEntitySet}`;
		        if (cardType === exports.CardType.Object) {
		            return buildObjectContextPath(app, buildQuery(query), entitySetPath, targetCardType);
		        }
		        else {
		            query['$top'] = '6';
		            if (app.fe === 'v4') {
		                query['$count'] = 'true';
		            }
		            else {
		                query['$inlinecount'] = 'allpages';
		            }
		            return `${entitySetPath}?${buildQuery(query)}`;
		        }
		    };

		    /**
		     * Retrieves footer information for a given page definition, including actions metadata,
		     * function imports, and main service annotations.
		     *
		     * @param page - The page definition object containing metadata and annotations.
		     * @returns An object containing:
		     *   - `actionsMetadata`: Array of unique action metadata from LineItem and Identification.
		     *   - `functionImports`: Array of function imports from the converted metadata.
		     *   - `mainService`: Array of main service annotations.
		     */
		    const getFooterInfo = (page) => {
		        const entityType = page.getMetaPath()?.getClosestEntityType();
		        if (!entityType || !entityType.annotations?.UI) {
		            return { actionsMetadata: [], functionImports: [], mainService: [] };
		        }
		        const lineItemActionFields = entityType.annotations.UI.LineItem?.filter((lineItemDataField) => {
		            return lineItemDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" /* UIAnnotationTypes.DataFieldForAction */;
		        });
		        const identificationActionFields = entityType.annotations.UI.Identification?.filter((identificationDataField) => {
		            return identificationDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" /* UIAnnotationTypes.DataFieldForAction */;
		        });
		        const collectActionEnableConfig = (actionTarget) => {
		            const operationAvailable = actionTarget.annotations?.Core?.OperationAvailable;
		            return {
		                operationAvailable: operationAvailable?.type === 'Path' ? operationAvailable?.path : operationAvailable?.Bool
		            };
		        };
		        const collectParameterInfo = (parameter) => {
		            return {
		                name: parameter.name,
		                type: parameter.type,
		                fullyQualifiedName: parameter.fullyQualifiedName,
		                keys: parameter.typeReference?.keys?.map((key) => ({
		                    name: key.name,
		                    type: key.type,
		                    nullable: key.nullable
		                })) || []
		            };
		        };
		        const collectActionInfo = (field) => {
		            return {
		                action: field.Action,
		                label: field.Label,
		                id: field.fullyQualifiedName,
		                enableConfig: field.ActionTarget ? collectActionEnableConfig(field.ActionTarget) : {},
		                parameters: field.ActionTarget?.parameters.map(collectParameterInfo) ?? []
		            };
		        };
		        const lineItemActions = lineItemActionFields?.map(collectActionInfo) ?? [];
		        const identicationActions = identificationActionFields?.map(collectActionInfo) ?? [];
		        let actionsMetadata = [...lineItemActions, ...identicationActions];
		        actionsMetadata = getUniqueEntries(actionsMetadata);
		        const convertedMetadata = page.getMetaPath().getConvertedMetadata();
		        const functionImports = convertedMetadata.actions;
		        const mainService = page?.getMetaPath()?.getConvertedMetadata().annotations?.mainService;
		        return { actionsMetadata, functionImports, mainService };
		    };
		    /**
		     * Filters an array of actionItems to return only unique entries based on the `action` property.
		     *
		     * @param actionItems - An array of actionItems to be filtered.
		     * @returns An array containing only unique entries, determined by the `action` property.
		     */
		    const getUniqueEntries = (actionItems) => {
		        const uniqueActions = new Set();
		        return actionItems.filter((actionItem) => {
		            if (!uniqueActions.has(actionItem.action)) {
		                uniqueActions.add(actionItem.action);
		                return true;
		            }
		            return false;
		        });
		    };
		    /**
		     * Normalizes action data by handling V2/V4 differences and returning version-agnostic action data
		     * @param page - Definition page containing metadata
		     * @param metadata - Card metadata containing context information
		     * @returns Normalized action data ready for card generation
		     */
		    const getNormalizedActionData = (page, metadata) => {
		        const { actionsMetadata, functionImports, mainService } = getFooterInfo(page);
		        const fe = metadata?.context?.fe;
		        const contextKeys = metadata?.context?.keys ?? [];
		        const contextPath = metadata?.context?.path ?? '';
		        const normalizedActions = [];
		        for (const actionItem of actionsMetadata) {
		            const normalizedAction = normalizeActionItem(actionItem, functionImports, mainService, fe, contextKeys, contextPath);
		            if (normalizedAction) {
		                normalizedActions.push(normalizedAction);
		            }
		        }
		        // Separate parameterized and simple actions
		        const parameterizedActions = normalizedActions.filter(action => action.parameters.length > 0);
		        const simpleActions = normalizedActions.filter(action => action.parameters.length === 0);
		        return {
		            parameterizedActions,
		            simpleActions
		        };
		    };
		    /**
		     * Normalizes a single action item based on OData V2/V4 logic differences.
		     *
		     * @param actionItem - The action item to normalize, containing action, label, and parameters.
		     * @param functionImports - Array of function imports from the converted metadata (used for V2).
		     * @param mainService - Array of main service annotations for parameter label resolution.
		     * @param fe - The OData version indicator ("v2" or "v4").
		     * @param contextKeys - Array of context key names to exclude from parameters (V2 only).
		     * @param contextPath - The context path for the action execution.
		     * @returns A NormalizedAction object with verb, label, parameters, contextKeys, and contextPath.
		     */
		    function normalizeActionItem(actionItem, functionImports, mainService, fe, contextKeys, contextPath) {
		        const verb = extractActionVerb(actionItem, fe);
		        const label = extractActionLabel(actionItem, fe);
		        // Enrich parameters based on version
		        const enrichedParameters = enrichActionParameters(actionItem, functionImports, fe, contextKeys);
		        // Normalize parameters
		        const normalizedParameters = normalizeParameters(enrichedParameters, mainService, fe);
		        return {
		            verb,
		            label,
		            parameters: normalizedParameters,
		            contextKeys,
		            contextPath
		        };
		    }
		    /**
		     * Extracts the action verb from an action item, handling OData V2/V4 differences.
		     *
		     * @param actionItem - The action item containing the action string.
		     * @param fe - The OData version indicator ("v2" or "v4").
		     * @returns The extracted action verb as a string, or empty string if not found.
		     */
		    function extractActionVerb(actionItem, fe) {
		        const dataFieldAction = fe === 'v4' ? actionItem.action : actionItem.action?.toString().split("/")?.[1];
		        return dataFieldAction?.indexOf("(") > -1 ? dataFieldAction?.split("(")?.[0] : dataFieldAction || '';
		    }
		    /**
		     * Extracts the action label from an action item, handling OData V2/V4 differences.
		     *
		     * @param actionItem - The action item containing the label.
		     * @param fe - The OData version indicator ("v2" or "v4").
		     * @returns The extracted action label as a string.
		     */
		    function extractActionLabel(actionItem, fe) {
		        return fe === 'v4' ? actionItem?.label : actionItem?.label?.toString();
		    }
		    /**
		     * Enriches action parameters based on OData V2/V4 logic differences.
		     *
		     * @param actionItem - The action item containing the base parameters.
		     * @param functionImports - Array of function imports from converted metadata (used for V2).
		     * @param fe - The OData version indicator ("v2" or "v4").
		     * @param contextKeys - Array of context key names to exclude from V2 parameters.
		     * @returns Array of enriched ActionParameter or ActionParameterV2 objects.
		     */
		    function enrichActionParameters(actionItem, functionImports, fe, contextKeys) {
		        let parameters = actionItem.parameters ?? [];
		        if (fe === 'v2') {
		            const actionName = actionItem.action?.toString().split('/')?.[1] ?? '';
		            const funcImport = functionImports?.find((functionImport) => functionImport.name === actionName);
		            let funcImportParameters = funcImport?.parameters;
		            if (!funcImport || !Array.isArray(funcImportParameters))
		                return parameters;
		            // Exclude context keys from action parameters as they are supposed to be passed in the contextUrl. (Value for these parameters need not be provided by user)
		            parameters = funcImportParameters.filter((param) => {
		                return !contextKeys.includes(param.name);
		            });
		        }
		        else if (fe === 'v4') {
		            // For V4, remove the first parameter ("/_it")
		            parameters = parameters.slice(1);
		        }
		        return parameters;
		    }
		    /**
		     * Normalizes parameters from V2/V4 specific formats to a version-agnostic format.
		     *
		     * @param parameters - Array of ActionParameter or ActionParameterV2 objects to normalize.
		     * @param mainService - Array of main service annotations for label resolution.
		     * @param fe - The OData version indicator ("v2" or "v4").
		     * @returns Array of NormalizedActionParameter objects with consistent structure.
		     */
		    function normalizeParameters(parameters, mainService, fe) {
		        return parameters.map(parameter => ({
		            name: parameter.name,
		            label: getParameterLabel(parameter, mainService, fe),
		            type: parameter.type,
		            isRequired: true
		        }));
		    }
		    /**
		     * Gets the parameter label from annotations, handling OData V2/V4 differences.
		     *
		     * @param parameter - The ActionParameter or ActionParameterV2 object.
		     * @param mainService - Array of main service annotations for V4 label lookup.
		     * @param fe - The OData version indicator ("v2" or "v4").
		     * @returns The parameter label as a string, or parameter name if no label found.
		     */
		    function getParameterLabel(parameter, mainService, fe) {
		        if (fe === 'v4') {
		            const fullyQualifiedName = parameter.fullyQualifiedName;
		            const indexOfOpeningBrace = fullyQualifiedName?.lastIndexOf('(');
		            const target = fullyQualifiedName?.slice(indexOfOpeningBrace + 1).replaceAll(')', '') || '';
		            const targetAnnotation = mainService.filter((item) => item?.target?.endsWith(target) || item?.target?.endsWith(fullyQualifiedName));
		            const labelAnnotation = targetAnnotation[0]?.annotations?.find((annotation) => annotation.term === "com.sap.vocabularies.Common.v1.Label" /* CommonAnnotationTerms.Label */);
		            return (labelAnnotation?.value?.type === 'String') ? labelAnnotation.value.String : parameter.name;
		        }
		        return parameter.label || parameter.name;
		    }

		    /**
		     * Specification of abstract functions that a concrete card factory must implement.
		     */
		    class AbstractCardFactory {
		    }
		    /**
		     * Common implementation of a card factory returns the generated card.
		     */
		    class CardFactory extends AbstractCardFactory {
		        /**
		         * Constructor intitializing the card factory.
		         */
		        targetCardType;
		        constructor() {
		            super();
		        }
		        /**
		         * Generates a card for the given application.
		         *
		         * @param manifest - manifest of the app
		         * @param metadata - metadata of the app
		         * @param annotations - annotations of the app
		         * @param options - options for the card generation
		         * @param options.cardType - type of the card to be generated
		         * @returns The generated card in the target-specific format.
		         * @throws Will throw an error if card generation fails.
		         */
		        generateAppCard(manifest, metadata, annotations = [], options) {
		            const cardType = options?.cardType ?? exports.CardType.Object;
		            const enableFooterActions = options?.enableFooterActions ?? false;
		            if (this.supportedCards().indexOf(cardType) === -1) {
		                throw new Error(`Card type ${cardType} is not supported by ${this.targetCardType}`);
		            }
		            const parsedMetadata = getMetadata(manifest, metadata, annotations);
		            const app = new App();
		            app.addManifest(manifest);
		            app.addMetadata(parsedMetadata);
		            try {
		                if (!app.objectEntitySet) {
		                    throw new Error('Object entity set is missing.');
		                }
		                if (!app.isUI5()) {
		                    throw new Error('UI5 check failed.');
		                }
		                return this.generateFECard(app, {
		                    cardType,
		                    enableFooterActions
		                });
		            }
		            catch (error) {
		                throw new Error(`Card generation failed: ${error.message}`);
		            }
		        }
		        createDefinitionContext(app) {
		            const definitionContext = new distExports$3.DefinitionContext(app.getMetadata());
		            definitionContext.addApplicationManifest(app.manifest);
		            return definitionContext;
		        }
		        /**
		         * Generate a card for a UI5 application using the same annotation interpretation as SAP Fiori Elements.
		         *
		         * @param app - source app for the card generation
		         * @param options - options for the card generation
		         * @returns a card in the target specifc format
		         */
		        generateFECard(app, options) {
		            const { cardType, enableFooterActions } = options;
		            const definitionContext = this.createDefinitionContext(app);
		            const page = definitionContext.getPageFor(`/${app.objectEntitySet}`);
		            const queryBuilder = new distExports$3.QueryBuilder(page.getMetaPath(), definitionContext);
		            const { header, headerDFs } = this.convertHeaderInfo(page, queryBuilder, app.objectEntitySet);
		            const tableVisualization = page.getTableVisualization() || page.createDefaultTableVisualization();
		            const facts = this.convertTableVisualizationToFacts(queryBuilder, tableVisualization, headerDFs);
		            if (!app.objectKeys || app.objectKeys.length === 0) {
		                throw new Error('Object keys are missing');
		            }
		            const query = queryBuilder.buildQuery();
		            const path = buildContextPath(app, cardType, this.targetCardType, { query });
		            const cardMetadata = {
		                key: {
		                    app: app.componentId,
		                    object: app.objectEntitySet
		                },
		                context: {
		                    type: 'fe',
		                    service: app.servicePath ?? '',
		                    fe: app.fe ?? '',
		                    path,
		                    entitySet: app.objectEntitySet,
		                    keys: app.objectKeys.map((key) => key.name),
		                    filters: app.filters ?? []
		                },
		                footer: {
		                    simpleActions: [],
		                    parameterizedActions: []
		                }
		            };
		            let simpleActions, parameterizedActions;
		            if (enableFooterActions) {
		                ({ simpleActions, parameterizedActions } = getNormalizedActionData(page, cardMetadata));
		                cardMetadata.footer.simpleActions.push(...simpleActions);
		                cardMetadata.footer.parameterizedActions.push(...parameterizedActions);
		            }
		            const cardContent = { header, facts };
		            switch (cardType) {
		                case exports.CardType.Table:
		                    return this.generateTableCard(cardContent, cardMetadata);
		                case exports.CardType.List:
		                    return this.generateListCard(cardContent, cardMetadata);
		                case exports.CardType.Object:
		                    return this.generateObjectCard(cardContent, cardMetadata);
		                default:
		                    throw new Error(`Unsupported card type: ${cardType}`);
		            }
		        }
		        /**
		         * Checks if a property is marked as potentially sensitive or personal
		         * using the PersonalData annotation.
		         *
		         * @param {Property | undefined} property - The OData property to check.
		         * @returns {boolean} True if marked sensitive or personal, else false.
		         */
		        isPotentiallySensitive(property) {
		            if (!property) {
		                return false;
		            }
		            const personalData = property.annotations?.PersonalData;
		            return (personalData?.IsPotentiallySensitive?.valueOf() === true ||
		                personalData?.IsPotentiallyPersonal?.valueOf() === true);
		        }
		        /**
		         * Extract the header information from the page and convert it to displayable content.
		         *
		         * @param page - the page
		         * @param queryBuilder
		         * @param entitySet - name of the object entity set
		         * @returns header object and used header fields
		         */
		        convertHeaderInfo(page, queryBuilder, entitySet) {
		            const header = {
		                type: 'SAP S/4HANA Cloud',
		                title: entitySet
		            };
		            const headerDFs = [];
		            const headerInfo = page.getHeaderInfo();
		            if (!headerInfo) {
		                return { header, headerDFs };
		            }
		            const typeName = headerInfo.getTypeName();
		            if (typeName) {
		                header.type = typeName;
		            }
		            const titleDF = headerInfo.getTitle();
		            const titleProp = titleDF?.getProperty();
		            if (titleDF && titleProp && !this.isPotentiallySensitive(titleProp)) {
		                headerDFs.push(titleDF);
		                const titleExpression = titleDF.getFormattedValue();
		                header.title = this.compileExpression(titleExpression);
		                queryBuilder.addPathsFromExpression(titleExpression);
		                const descDF = headerInfo.getDescription();
		                const descProp = descDF?.getProperty();
		                if (descDF && descProp) {
		                    headerDFs.push(descDF);
		                    const descExpression = descDF.getFormattedValue();
		                    header.description = this.compileExpression(descExpression);
		                    queryBuilder.addPathsFromExpression(descExpression);
		                }
		            }
		            return { header, headerDFs };
		        }
		        /**
		         * Converts the table visualization to a list of max. 7 facts.
		         *
		         * @param queryBuilder
		         * @param tableVisualization - the table visualization
		         * @param ignore
		         * @returns the facts
		         */
		        convertTableVisualizationToFacts(queryBuilder, tableVisualization, ignore = []) {
		            const filterFn = (df) => ignore.findIndex((ignDf) => ignDf.getProperty()?.name === df.getProperty()?.name) === -1;
		            const getFilteredDataFields = (importance) => {
		                const dataFields = importance
		                    ? tableVisualization.getDataFields({ importance, restrictTypes: ["com.sap.vocabularies.UI.v1.DataField" /* UIAnnotationTypes.DataField */] })
		                    : tableVisualization.getDataFields({ restrictTypes: ["com.sap.vocabularies.UI.v1.DataField" /* UIAnnotationTypes.DataField */] });
		                return dataFields.filter(filterFn);
		            };
		            let dfs = getFilteredDataFields(["UI.ImportanceType/High" /* ImportanceType.High */]);
		            if (dfs.length < 7) {
		                dfs.push(...getFilteredDataFields(["UI.ImportanceType/Medium" /* ImportanceType.Medium */]));
		            }
		            if (dfs.length < 7) {
		                dfs = getFilteredDataFields();
		            }
		            const facts = [];
		            while (dfs.length > 0 && facts.length < 7) {
		                const dataField = dfs.shift();
		                const property = dataField.getProperty();
		                if (property && !this.isPotentiallySensitive(property)) {
		                    const name = property.name;
		                    const value = dataField.getFormattedValue();
		                    if (name && value !== ExpressionExports.unresolvableExpression) {
		                        queryBuilder.addPathsFromExpression(value);
		                        facts.push({
		                            label: dataField.getLabel(),
		                            value: this.compileExpression(value)
		                        });
		                    }
		                }
		            }
		            return facts;
		        }
		    }

		    /**
		     * Recursively compile an expression to an expression string valid for adaptive cards.
		     * More usable functions: https://learn.microsoft.com/en-us/azure/bot-service/adaptive-expressions/adaptive-expressions-prebuilt-functions?view=azure-bot-service-4.0#logical-comparison-functions
		     *
		     * @param expression The expression to compile
		     * @param embeddedInBinding Whether the expression to compile is embedded into another expression
		     * @param overrideDefaultModel The name of the model to use instead of the default `undefined one
		     *
		     * @returns The corresponding expression binding
		     */
		    const MAX_COLUMNS = 3; //Maximum number of columns in a row for Adaptive (Object) Cards
		    function compileExpression(expression, embeddedInBinding = false, overrideDefaultModel) {
		        switch (expression._type) {
		            case 'PathInModel':
		                const model = expression.modelName ?? overrideDefaultModel;
		                const prefix = model ? `${model}.` : '';
		                let value;
		                if (expression.path.includes('/')) {
		                    const objName = expression.path.split('/')[0];
		                    value = `${prefix}${objName} ? string(${prefix}${expression.path.replaceAll('/', '.')}) : ''`;
		                }
		                else {
		                    value = `string(${prefix}${expression.path})`;
		                }
		                return embeddedInBinding ? value : `$\{${value}}`;
		            case 'IfElse':
		                const conditionExpr = compileExpression(expression.condition, true, overrideDefaultModel);
		                const trueExpr = compileExpression(expression.onTrue, true, overrideDefaultModel);
		                const falseExpr = compileExpression(expression.onFalse, true, overrideDefaultModel);
		                return `$\{if(${conditionExpr}, ${trueExpr}, ${falseExpr})}`;
		            case 'Comparison':
		                const left = compileExpression(expression.operand1, embeddedInBinding, overrideDefaultModel);
		                const right = compileExpression(expression.operand2, embeddedInBinding, overrideDefaultModel);
		                return `${left} ${expression.operator} ${right}`;
		            case 'Set':
		                return expression.operands
		                    .map((part) => compileExpression(part, embeddedInBinding, overrideDefaultModel))
		                    .join(` ${expression.operator} `);
		            case 'Concat':
		                return `${expression.expressions.map((part) => compileExpression(part, embeddedInBinding, overrideDefaultModel)).join('')}`;
		            case 'Truthy':
		                // we are only working with string in adaptive cards
		                const truth = `length(${compileExpression(expression.operand, true, overrideDefaultModel)}) > 0`;
		                return embeddedInBinding ? truth : `$\{${truth}}`;
		            case 'Constant':
		                if (typeof expression.value === 'string') {
		                    return expression.value?.toString() ?? 'undefined';
		                }
		                return expression.value?.toString() ?? 'undefined';
		            case 'Formatter':
		                const parameters = expression.parameters;
		                const formatter = compileExpression(parameters[0] /* formatter name */, true, overrideDefaultModel);
		                const args = parameters.slice(1).map((param) => compileExpression(param, true, overrideDefaultModel));
		                if (formatter === 'formatWithBrackets') {
		                    return compileExpression(ExpressionExports.concat('${', formatter, '(', ...args.join(','), ')}'));
		                }
		                else {
		                    return `$\{${args[0]}}`;
		                }
		        }
		        return "''";
		    }
		    class AdaptiveCardFactory extends CardFactory {
		        targetCardType;
		        constructor() {
		            super();
		            this.targetCardType = exports.TargetCardType.AdaptiveCard;
		        }
		        supportedCards() {
		            return [exports.CardType.Object, exports.CardType.Table];
		        }
		        compileExpression(expression) {
		            return compileExpression(expression, false);
		        }
		        generateBaseCard(title, metadata) {
		            return {
		                $schema: 'https://adaptivecards.io/schemas/adaptive-card.json',
		                type: 'AdaptiveCard',
		                version: '1.6',
		                body: [
		                    {
		                        type: 'ColumnSet',
		                        columns: [
		                            {
		                                'type': 'Column',
		                                'items': [
		                                    {
		                                        'type': 'Image',
		                                        'url': sapLogo,
		                                        'altText': 'SAP',
		                                        'size': 'Small'
		                                    }
		                                ],
		                                'width': 'auto'
		                            },
		                            {
		                                'type': 'Column',
		                                'items': [
		                                    {
		                                        'type': 'TextBlock',
		                                        'weight': 'Bolder',
		                                        'text': title,
		                                        'wrap': true
		                                    }
		                                ],
		                                'width': 'auto'
		                            }
		                        ]
		                    }
		                ],
		                actions: [],
		                metadata: {
		                    context: metadata.context
		                }
		            };
		        }
		        /**
		         * Generates an adaptive card object for displaying structured information with a header and facts.
		         *
		         * @param {ObjectCardContent} content - The content of the card, including the header and facts.
		         * @param {CardMetadata} metadata - Metadata associated with the card, such as theme or context.
		         * @returns The generated adaptive card object.
		         *
		         * The card includes:
		         * - A header section with a title.
		         * - A body section containing facts organized into columns.
		         * - Columns are dynamically created based on the number of facts, with empty columns added to maintain a consistent layout.
		         *
		         * Facts are displayed as pairs of labels and values, with styling applied for readability.
		         */
		        generateObjectCard({ header, facts }, metadata) {
		            const card = this.generateBaseCard(header.type, metadata);
		            const columnSetItems = this.chunkObjectFacts(facts, MAX_COLUMNS).map((objectFactItems) => ({
		                type: 'ColumnSet',
		                columns: objectFactItems
		                    .map((objectFactItem) => ({
		                    type: 'Column',
		                    width: 'stretch',
		                    items: [
		                        {
		                            type: 'TextBlock',
		                            wrap: false,
		                            isSubtle: true,
		                            maxLines: 1,
		                            size: 'small',
		                            weight: 'default',
		                            spacing: 'default',
		                            color: 'Default',
		                            text: objectFactItem.label
		                        },
		                        {
		                            type: 'TextBlock',
		                            wrap: true,
		                            maxLines: 2,
		                            size: 'small',
		                            weight: 'default',
		                            spacing: 'none',
		                            color: 'Default',
		                            text: objectFactItem.value
		                        }
		                    ]
		                }))
		                    .concat(Array(MAX_COLUMNS - objectFactItems.length).fill({
		                    type: 'Column',
		                    width: 'stretch'
		                }))
		            }));
		            if (header.title || header.description) {
		                card.body.push({
		                    type: 'Container',
		                    spacing: 'large',
		                    items: [
		                        {
		                            type: 'Container',
		                            spacing: 'medium',
		                            items: [
		                                header.title && {
		                                    type: 'TextBlock',
		                                    wrap: true,
		                                    weight: 'bolder',
		                                    size: 'small',
		                                    maxLines: 2,
		                                    spacing: 'medium',
		                                    color: 'Default',
		                                    text: header.title
		                                },
		                                header.description && {
		                                    type: 'TextBlock',
		                                    wrap: true,
		                                    weight: 'default',
		                                    size: 'small',
		                                    maxLines: 2,
		                                    spacing: 'none',
		                                    color: 'Default',
		                                    text: header.description
		                                },
		                                {
		                                    type: 'Container',
		                                    spacing: 'small',
		                                    items: columnSetItems
		                                }
		                            ].filter(Boolean) // Filters out any falsy values (e.g., undefined) from the array.
		                            // This prevents invalid items from being included if header.title or header.description are missing.
		                        }
		                    ]
		                });
		            }
		            this.addActionSets(card, metadata);
		            return card;
		        }
		        /**
		         * Splits an array of facts into smaller arrays, each containing a maximum number of columns.
		         *
		         * @param facts - The array of facts to be divided.
		         * @param maxColumns - The maximum number of columns in each sub-array.
		         * @returns An array of sub-arrays, where each sub-array contains up to `maxColumns` elements from the original `facts` array.
		         */
		        chunkObjectFacts(facts, maxColumns) {
		            const objectFactItems = [];
		            for (let i = 0; i < facts.length; i += maxColumns) {
		                objectFactItems.push(facts.slice(i, i + maxColumns));
		            }
		            return objectFactItems;
		        }
		        generateTableCard({ header, facts }, metadata) {
		            const card = this.generateBaseCard(header.type, metadata);
		            const table = {
		                type: 'Table',
		                firstRowAsHeaders: true,
		                showGridLines: true,
		                columns: [],
		                rows: []
		            };
		            const columns = facts.length > 3 ? facts.slice(0, 3) : facts;
		            table.columns = columns.map(() => ({ width: 1 }));
		            table.rows.push({
		                type: 'TableRow',
		                cells: columns.map((column) => ({
		                    type: 'TableCell',
		                    items: [
		                        {
		                            type: 'TextBlock',
		                            text: column.label,
		                            wrap: true,
		                            weight: 'Bolder'
		                        }
		                    ]
		                }))
		            });
		            // add cells
		            table.rows.push({
		                type: 'TableRow',
		                $data: metadata.context?.fe === 'v4' ? '${value}' : '${d.results}',
		                cells: columns.map((column) => ({
		                    type: 'TableCell',
		                    items: [
		                        {
		                            type: 'TextBlock',
		                            text: column.value,
		                            wrap: true
		                        }
		                    ]
		                }))
		            });
		            card.body.push(table);
		            return card;
		        }
		        generateListCard(content, metadata) {
		            // Not implemented for adaptive cards
		            throw new Error('List card is not supported for Adaptive Card.');
		        }
		        /**
		         * Adds action sets to the adaptive card based on the provided metadata. Get normalized action data that handles V2/V4 differences upstream
		         *
		         * @param card - The adaptive card instance to add action sets to
		         * @param metadata - The card metadata containing footer actions configuration
		         * @returns void
		         */
		        addActionSets(card, metadata) {
		            const normalizedActionData = metadata.footer;
		            for (const action of normalizedActionData.parameterizedActions) {
		                this.processNormalizedAction(card, action, metadata, true);
		            }
		            for (const action of normalizedActionData.simpleActions) {
		                this.processNormalizedAction(card, action, metadata, false);
		            }
		        }
		        /**
		         * Processes a normalized action and adds the corresponding action set to the card body.
		         * This method works with version-agnostic normalized action data.
		         *
		         * @param card - The card object to which the action set will be added
		         * @param action - The normalized action to process
		         * @param metadata - Card metadata containing additional information
		         * @param isParameterized - Whether this action has parameters
		         * @returns void
		         */
		        processNormalizedAction(card, action, metadata, isParameterized) {
		            let actionSet;
		            if (isParameterized) {
		                actionSet = this.createShowCardActionFromNormalized(action, metadata);
		            }
		            else {
		                actionSet = this.createExecuteAction(action, metadata);
		            }
		            card.body.push(actionSet);
		        }
		        /**
		         * Creates a ShowCard action from normalized action data
		         *
		         * @param action - The normalized action containing all necessary data
		         * @param metadata - Card metadata containing additional information
		         * @returns The ShowCard action set
		         */
		        createShowCardActionFromNormalized(action, metadata) {
		            const actionSet = {
		                type: 'ActionSet',
		                actions: [
		                    {
		                        type: 'Action.ShowCard',
		                        title: action.label,
		                        card: {
		                            type: 'AdaptiveCard',
		                            $schema: 'https://adaptivecards.io/schemas/adaptive-card.json',
		                            version: '1.6',
		                            body: action.parameters.map((param) => ({
		                                type: 'Input.Text',
		                                id: param.name,
		                                label: param.label,
		                                errorMessage: 'Enter the required input',
		                                placeholder: 'Enter the required input',
		                                isRequired: true,
		                                isMultiline: false
		                            })),
		                            actions: [
		                                {
		                                    type: 'Action.Execute',
		                                    title: 'OK',
		                                    verb: action.verb,
		                                    data: {
		                                        isConfirmationRequired: false,
		                                        actionParams: {
		                                            keys: metadata?.context?.keys
		                                        },
		                                        contextURL: metadata?.context?.path
		                                    },
		                                    style: 'positive'
		                                }
		                            ]
		                        },
		                        style: 'positive'
		                    }
		                ]
		            };
		            return actionSet;
		        }
		        /**
		         * Creates a simple ActionSet containing a single Execute action.
		         *
		         * @param actionVerb - The verb identifier for the action to be executed
		         * @param actionLabel - The display text shown on the action button
		         * @param metadata - Card metadata containing context information
		         * @returns An ActionSet object with a single Execute action
		         */
		        createExecuteAction(action, metadata) {
		            return {
		                type: 'ActionSet',
		                actions: [
		                    {
		                        type: 'Action.Execute',
		                        title: action.label,
		                        verb: action.verb,
		                        data: {
		                            isConfirmationRequired: false,
		                            contextURL: metadata?.context?.path
		                        },
		                        style: 'positive'
		                    }
		                ]
		            };
		        }
		    }

		    var dist = {};

		    var hasRequiredDist;

		    function requireDist () {
		    	if (hasRequiredDist) return dist;
		    	hasRequiredDist = 1;
		    	Object.defineProperty(dist, "__esModule", { value: true });
		    	dist.escapeXmlAttribute = escapeXmlAttribute;
		    	dist.compileConstant = compileConstant;
		    	dist.wrapBindingExpression = wrapBindingExpression;
		    	dist.compileExpression = compileExpression;
		    	const Expression_1 = requireExpression();
		    	function escapeXmlAttribute(inputString) {
		    	    return inputString.replace(/'/g, "\\'");
		    	}
		    	const needParenthesis = function (expr) {
		    	    return (!(0, Expression_1.isConstant)(expr) &&
		    	        !(0, Expression_1.isPathInModelExpression)(expr) &&
		    	        (0, Expression_1.isExpression)(expr) &&
		    	        expr._type !== 'IfElse' &&
		    	        expr._type !== 'Function');
		    	};
		    	/**
		    	 * Compiles a constant object to a string.
		    	 *
		    	 * @param expr
		    	 * @param isNullable
		    	 * @returns The compiled string
		    	 */
		    	function compileConstantObject(expr, isNullable = false) {
		    	    if (isNullable && Object.keys(expr.value).length === 0) {
		    	        return '';
		    	    }
		    	    const objects = expr.value;
		    	    const properties = [];
		    	    Object.keys(objects).forEach((key) => {
		    	        const value = objects[key];
		    	        const childResult = compileExpression(value, true, false, isNullable);
		    	        if (childResult && childResult.length > 0) {
		    	            properties.push(`${key}: ${childResult}`);
		    	        }
		    	    });
		    	    return `{${properties.join(', ')}}`;
		    	}
		    	function compileConstant(expr, embeddedInBinding, isNullable = false, doNotStringify = false) {
		    	    if (expr.value === null) {
		    	        return doNotStringify ? null : 'null';
		    	    }
		    	    if (expr.value === undefined) {
		    	        return doNotStringify ? undefined : 'undefined';
		    	    }
		    	    if (typeof expr.value === 'object') {
		    	        if (Array.isArray(expr.value)) {
		    	            const entries = expr.value.map((expression) => compileExpression(expression, true));
		    	            return `[${entries.join(', ')}]`;
		    	        }
		    	        else {
		    	            return compileConstantObject(expr, isNullable);
		    	        }
		    	    }
		    	    if (embeddedInBinding) {
		    	        switch (typeof expr.value) {
		    	            case 'number':
		    	            case 'bigint':
		    	            case 'boolean':
		    	                return expr.value.toString();
		    	            case 'string':
		    	                return `'${escapeXmlAttribute(expr.value.toString())}'`;
		    	            default:
		    	                return '';
		    	        }
		    	    }
		    	    else {
		    	        return doNotStringify ? expr.value : expr.value.toString();
		    	    }
		    	}
		    	/**
		    	 * Generates the binding string for a Binding expression.
		    	 *
		    	 * @param expressionForBinding The expression to compile
		    	 * @param embeddedInBinding Whether the expression to compile is embedded into another expression
		    	 * @param embeddedSeparator The binding value evaluator ($ or % depending on whether we want to force the type or not)
		    	 * @param overrideDefaultModel The name of the model to use instead of the default `undefined one
		    	 * @returns The corresponding expression binding
		    	 */
		    	function compilePathInModelExpression(expressionForBinding, embeddedInBinding, embeddedSeparator, overrideDefaultModel) {
		    	    if (expressionForBinding.type ||
		    	        expressionForBinding.parameters ||
		    	        expressionForBinding.targetType ||
		    	        expressionForBinding.formatOptions
		    	    // expressionForBinding.constraints
		    	    ) {
		    	        // This is now a complex binding definition, let's prepare for it
		    	        const complexBindingDefinition = {
		    	            path: compilePathInModel(expressionForBinding),
		    	            type: expressionForBinding.type,
		    	            targetType: expressionForBinding.targetType,
		    	            parameters: expressionForBinding.parameters,
		    	            formatOptions: expressionForBinding.formatOptions
		    	            // constraints: expressionForBinding.constraints
		    	        };
		    	        const outBinding = compileExpression(complexBindingDefinition, false, false, true);
		    	        if (embeddedInBinding) {
		    	            //const separator = expressionForBinding.alwaysKeepTargetType ? "$" : embeddedSeparator;
		    	            return `${embeddedSeparator}${outBinding}`;
		    	        }
		    	        return outBinding;
		    	    }
		    	    else if (embeddedInBinding) {
		    	        return `${embeddedSeparator}{${compilePathInModel(expressionForBinding, overrideDefaultModel)}}`;
		    	    }
		    	    else {
		    	        return `{${compilePathInModel(expressionForBinding, overrideDefaultModel)}}`;
		    	    }
		    	}
		    	function compileComplexTypeExpression(expression) {
		    	    if (expression.bindingParameters.length === 1) {
		    	        return `{${compilePathParameter(expression.bindingParameters[0], true)}, type: '${expression.type}'}`;
		    	    }
		    	    let outputEnd = `], type: '${expression.type}'`;
		    	    if (hasElements(expression.formatOptions)) {
		    	        outputEnd += `, formatOptions: ${compileExpression(expression.formatOptions)}`;
		    	    }
		    	    if (hasElements(expression.parameters)) {
		    	        outputEnd += `, parameters: ${compileExpression(expression.parameters)}`;
		    	    }
		    	    outputEnd += '}';
		    	    return `{mode:'TwoWay', parts:[${expression.bindingParameters
		        .map((param) => compilePathParameter(param))
		        .join(',')}${outputEnd}`;
		    	}
		    	/**
		    	 * Wrap the compiled binding string as required depending on its context.
		    	 *
		    	 * @param expression The compiled expression
		    	 * @param embeddedInBinding True if the compiled expression is to be embedded in a binding
		    	 * @param parenthesisRequired True if the embedded binding needs to be wrapped in parethesis so that it is evaluated as one
		    	 * @returns Finalized compiled expression
		    	 */
		    	function wrapBindingExpression(expression, embeddedInBinding, parenthesisRequired = false) {
		    	    if (embeddedInBinding) {
		    	        if (parenthesisRequired) {
		    	            return `(${expression})`;
		    	        }
		    	        else {
		    	            return expression;
		    	        }
		    	    }
		    	    else {
		    	        return `{= ${expression}}`;
		    	    }
		    	}
		    	/**
		    	 * Compile an expression into an expression binding.
		    	 *
		    	 * @template T The target type
		    	 * @param expression The expression to compile
		    	 * @param embeddedInBinding Whether the expression to compile is embedded into another expression
		    	 * @param keepTargetType Keep the target type of the embedded bindings instead of casting them to any
		    	 * @param isNullable Whether binding expression can resolve to empty string or not
		    	 * @param overrideDefaultModel The name of the model to use instead of the default `undefined one
		    	 *
		    	 * @returns The corresponding expression binding
		    	 */
		    	function compileExpression(expression, embeddedInBinding = false, keepTargetType = false, isNullable = false, overrideDefaultModel) {
		    	    const expr = (0, Expression_1.wrapPrimitive)(expression);
		    	    const embeddedSeparator = keepTargetType ? '$' : '%';
		    	    switch (expr._type) {
		    	        case 'Unresolvable':
		    	            return undefined;
		    	        case 'Constant':
		    	            return compileConstant(expr, embeddedInBinding, isNullable);
		    	        case 'Ref':
		    	            return expr.ref || 'null';
		    	        case 'Function':
		    	            let hasEmbeddedFunctionCallOrBinding = false;
		    	            if (expr.isFormattingFn) {
		    	                (0, Expression_1.transformRecursively)(expr, 'Function', (subFn) => {
		    	                    if (subFn !== expr && subFn.obj === undefined) {
		    	                        hasEmbeddedFunctionCallOrBinding = true;
		    	                    }
		    	                    return subFn;
		    	                }, true);
		    	                (0, Expression_1.transformRecursively)(expr, 'Constant', (subFn) => {
		    	                    if (subFn !== expr && typeof subFn.value === 'object') {
		    	                        (0, Expression_1.transformRecursively)(subFn, 'PathInModel', (subSubFn) => {
		    	                            hasEmbeddedFunctionCallOrBinding = true;
		    	                            return subSubFn;
		    	                        });
		    	                    }
		    	                    return subFn;
		    	                }, true);
		    	            }
		    	            const argumentString = `${expr.parameters.map((arg) => compileExpression(arg, true, false, false, overrideDefaultModel)).join(', ')}`;
		    	            let fnCall = expr.obj === undefined
		    	                ? `${expr.fn}(${argumentString})`
		    	                : `${compileExpression(expr.obj, true, false, false, overrideDefaultModel)}.${expr.fn}(${argumentString})`;
		    	            if (!embeddedInBinding && hasEmbeddedFunctionCallOrBinding) {
		    	                fnCall = `{= ${fnCall}}`;
		    	            }
		    	            return fnCall;
		    	        case 'EmbeddedExpressionBinding':
		    	            return embeddedInBinding ? `(${expr.value.substring(2, expr.value.length - 1)})` : `${expr.value}`;
		    	        case 'EmbeddedBinding':
		    	            return embeddedInBinding ? `${embeddedSeparator}${expr.value}` : `${expr.value}`;
		    	        case 'PathInModel':
		    	            return compilePathInModelExpression(expr, embeddedInBinding, embeddedSeparator, overrideDefaultModel);
		    	        case 'Comparison':
		    	            const comparisonExpression = compileComparisonExpression(expr, overrideDefaultModel);
		    	            return wrapBindingExpression(comparisonExpression, embeddedInBinding);
		    	        case 'IfElse':
		    	            const ifElseExpression = `${compileExpression(expr.condition, true, false, false, overrideDefaultModel)} ? ${compileExpression(expr.onTrue, true, keepTargetType, false, overrideDefaultModel)} : ${compileExpression(expr.onFalse, true, keepTargetType, false, overrideDefaultModel)}`;
		    	            return wrapBindingExpression(ifElseExpression, embeddedInBinding, true);
		    	        case 'Set':
		    	            const setExpression = expr.operands
		    	                .map((operand) => compileExpression(operand, true, false, false, overrideDefaultModel))
		    	                .join(` ${expr.operator} `);
		    	            return wrapBindingExpression(setExpression, embeddedInBinding, true);
		    	        case 'Concat':
		    	            const concatExpression = expr.expressions
		    	                .map((nestedExpression) => compileExpression(nestedExpression, true, true, false, overrideDefaultModel))
		    	                .join(' + ');
		    	            return wrapBindingExpression(concatExpression, embeddedInBinding);
		    	        case 'Length':
		    	            const lengthExpression = `${compileExpression(expr.pathInModel, true, false, false, overrideDefaultModel)}.length`;
		    	            return wrapBindingExpression(lengthExpression, embeddedInBinding);
		    	        case 'Not':
		    	            const notExpression = `!${compileExpression(expr.operand, true, false, false, overrideDefaultModel)}`;
		    	            return wrapBindingExpression(notExpression, embeddedInBinding);
		    	        case 'Truthy':
		    	            const truthyExpression = `!!${compileExpression(expr.operand, true, false, false, overrideDefaultModel)}`;
		    	            return wrapBindingExpression(truthyExpression, embeddedInBinding);
		    	        case 'Formatter':
		    	            const formatterExpression = compileFormatterExpression(expr, overrideDefaultModel);
		    	            return embeddedInBinding ? `$${formatterExpression}` : formatterExpression;
		    	        case 'ComplexType':
		    	            const complexTypeExpression = compileComplexTypeExpression(expr);
		    	            return embeddedInBinding ? `$${complexTypeExpression}` : complexTypeExpression;
		    	        default:
		    	            return '';
		    	    }
		    	}
		    	/**
		    	 * Compile a comparison expression.
		    	 *
		    	 * @param expression The comparison expression.
		    	 * @param overrideDefaultModel
		    	 * @returns The compiled expression. Needs wrapping before it can be used as an expression binding.
		    	 */
		    	function compileComparisonExpression(expression, overrideDefaultModel) {
		    	    function compileOperand(operand) {
		    	        const compiledOperand = compileExpression(operand, true, false, false, overrideDefaultModel) ?? 'undefined';
		    	        return wrapBindingExpression(compiledOperand, true, needParenthesis(operand));
		    	    }
		    	    return `${compileOperand(expression.operand1)} ${expression.operator} ${compileOperand(expression.operand2)}`;
		    	}
		    	/**
		    	 * Compile a formatter expression.
		    	 *
		    	 * @param expression The formatter expression.
		    	 * @param overrideDefaultModel
		    	 * @returns The compiled expression.
		    	 */
		    	function compileFormatterExpression(expression, overrideDefaultModel) {
		    	    if (expression.parameters.length === 1) {
		    	        return `{${compilePathParameter(expression.parameters[0], true, overrideDefaultModel)}, formatter: '${expression.fn}'}`;
		    	    }
		    	    else {
		    	        const parts = expression.parameters.map((param) => {
		    	            if (param._type === 'ComplexType') {
		    	                return compileComplexTypeExpression(param);
		    	            }
		    	            else {
		    	                return compilePathParameter(param, false, overrideDefaultModel);
		    	            }
		    	        });
		    	        return `{parts: [${parts.join(', ')}], formatter: '${expression.fn}'}`;
		    	    }
		    	}
		    	/**
		    	 * Compile the path parameter of a formatter call.
		    	 *
		    	 * @param expression The binding part to evaluate
		    	 * @param singlePath Whether there is one or multiple path to consider
		    	 * @param overrideDefaultModel
		    	 * @returns The string snippet to include in the overall binding definition
		    	 */
		    	function compilePathParameter(expression, singlePath = false, overrideDefaultModel) {
		    	    let outValue = '';
		    	    if (expression._type === 'Constant') {
		    	        if (expression.value === undefined) {
		    	            // Special case otherwise the JSTokenizer complains about incorrect content
		    	            outValue = `value: 'undefined'`;
		    	        }
		    	        else {
		    	            outValue = `value: ${compileConstant(expression, true)}`;
		    	        }
		    	    }
		    	    else if (expression._type === 'PathInModel') {
		    	        outValue = `path: '${compilePathInModel(expression, overrideDefaultModel)}'`;
		    	        outValue += expression.type ? `, type: '${expression.type}'` : `, targetType: 'any'`;
		    	        if (expression.mode) {
		    	            outValue += `, mode: '${compileExpression(expression.mode)}'`;
		    	        }
		    	        // if (hasElements(expression.constraints)) {
		    	        //     outValue += `, constraints: ${compileExpression(expression.constraints)}`;
		    	        // }
		    	        if (hasElements(expression.formatOptions)) {
		    	            outValue += `, formatOptions: ${compileExpression(expression.formatOptions)}`;
		    	        }
		    	        if (hasElements(expression.parameters)) {
		    	            outValue += `, parameters: ${compileExpression(expression.parameters)}`;
		    	        }
		    	    }
		    	    else {
		    	        return '';
		    	    }
		    	    return singlePath ? outValue : `{${outValue}}`;
		    	}
		    	function hasElements(obj) {
		    	    return !!obj && Object.keys(obj).length > 0;
		    	}
		    	/**
		    	 * Compile a binding expression path.
		    	 *
		    	 * @param expression The expression to compile.
		    	 * @param overrideDefaultModel The name of the model to use instead of the default `undefined one
		    	 *
		    	 * @returns The compiled path.
		    	 */
		    	function compilePathInModel(expression, overrideDefaultModel) {
		    	    if (expression.modelName) {
		    	        return `${expression.modelName}>${expression.path}`;
		    	    }
		    	    else if (overrideDefaultModel) {
		    	        return `${overrideDefaultModel}>${expression.path}`;
		    	    }
		    	    else {
		    	        return `${expression.path}`;
		    	    }
		    	}
		    	
		    	return dist;
		    }

		    var distExports = requireDist();

		    class Ui5CardFactory extends CardFactory {
		        targetCardType;
		        extensionPath = 'module:sap/insights/CardExtension';
		        constructor() {
		            super();
		            this.targetCardType = exports.TargetCardType.UI5IntegrationCard;
		        }
		        supportedCards() {
		            return [exports.CardType.Object, exports.CardType.List, exports.CardType.Table];
		        }
		        compileExpression(expression) {
		            if (expression._type === 'Formatter') {
		                const parameters = expression.parameters;
		                const formatter = distExports.compileExpression(parameters[0] /* formatter name */);
		                const args = parameters.slice(1).map((param) => distExports.compileExpression(param, false, true));
		                if (formatter === 'formatWithBrackets') {
		                    return (distExports.compileExpression(ExpressionExports.concat('{= extension.formatters.', `${formatter}(`, ...args.map((arg) => `$${arg}`).join(','), ') }')) ?? '');
		                }
		                else {
		                    return distExports.compileExpression(args[0]) ?? '';
		                }
		            }
		            return distExports.compileExpression(expression) ?? '';
		        }
		        generateBaseCard(metadata, cardTemplate) {
		            return {
		                _version: '1.15.0',
		                'sap.app': {
		                    id: `${metadata.key.app}.${cardTemplate}`,
		                    type: 'card'
		                },
		                'sap.ui': {
		                    technology: 'UI5'
		                },
		                'sap.insights': {
		                    'cardType': 'GEN_CARD',
		                    'parentAppId': `${metadata.key.app}`,
		                    'templateName': cardTemplate
		                }
		            };
		        }
		        getDestinations() {
		            return {
		                destinations: {
		                    service: {
		                        name: '(default)',
		                        defaultUrl: '/'
		                    }
		                }
		            };
		        }
		        getCSRFToken(metadata) {
		            return {
		                csrfTokens: {
		                    token1: {
		                        data: {
		                            request: {
		                                url: `{{destinations.service}}${metadata.context?.service}`,
		                                method: 'HEAD',
		                                headers: {
		                                    'X-CSRF-Token': 'Fetch'
		                                }
		                            }
		                        }
		                    }
		                }
		            };
		        }
		        getDataConfig(metadata) {
		            const path = metadata.context.path;
		            const serviceUrl = path.replace(metadata.context.service, '');
		            return {
		                data: {
		                    request: {
		                        url: `{{destinations.service}}${metadata.context?.service}$batch`,
		                        method: 'POST',
		                        headers: {
		                            'Accept-Language': '{{parameters.LOCALE}}',
		                            'X-CSRF-Token': '{{csrfTokens.token1}}'
		                        },
		                        batch: {
		                            header: {
		                                method: 'GET',
		                                url: serviceUrl,
		                                headers: {
		                                    Accept: 'application/json',
		                                    'Accept-Language': '{{parameters.LOCALE}}'
		                                }
		                            },
		                            content: {
		                                method: 'GET',
		                                url: serviceUrl,
		                                headers: {
		                                    Accept: 'application/json',
		                                    'Accept-Language': '{{parameters.LOCALE}}'
		                                }
		                            }
		                        }
		                    }
		                }
		            };
		        }
		        generateObjectCard({ header, facts }, metadata) {
		            const card = this.generateBaseCard(metadata, 'Object');
		            const dataPath = metadata.context.fe === 'v2' ? '/content/d/' : '/content/';
		            const keys = metadata.context.keys;
		            const objectKeys = keys.reduce((acc, key) => {
		                acc[key] = { value: '', type: 'string' };
		                return acc;
		            }, {});
		            card['sap.card'] = {
		                type: 'Object',
		                extension: this.extensionPath,
		                configuration: {
		                    parameters: {
		                        ...objectKeys,
		                        _entitySet: {
		                            'value': metadata.context?.entitySet || '',
		                            'type': 'string'
		                        },
		                        _mandatoryODataParameters: {
		                            value: keys
		                        },
		                        logo: {
		                            value: sapLogo,
		                            type: 'string'
		                        }
		                    },
		                    ...this.getCSRFToken(metadata),
		                    ...this.getDestinations()
		                },
		                ...this.getDataConfig(metadata),
		                header: {
		                    icon: {
		                        src: '{{parameters.logo}}',
		                        fitType: 'Contain',
		                        shape: 'Square'
		                    },
		                    data: {
		                        path: dataPath
		                    },
		                    title: header.title,
		                    subTitle: header.description || ''
		                },
		                content: {
		                    data: {
		                        path: dataPath
		                    },
		                    groups: [
		                        {
		                            title: header.type,
		                            items: facts
		                        }
		                    ]
		                },
		                footer: {
		                    actionsStrip: this.createActionsStrip(metadata)
		                }
		            };
		            return card;
		        }
		        generateListCard({ header, facts }, metadata) {
		            const card = this.generateBaseCard(metadata, 'List');
		            const dataPath = metadata.context.fe === 'v2' ? '/d/results/' : '/value/';
		            const count = metadata.context.fe === 'v2' ? '${/content/d/__count}' : '${/content/@odata.count}';
		            const maxItems = 5;
		            card['sap.card'] = {
		                extension: this.extensionPath,
		                configuration: {
		                    parameters: {
		                        _entitySet: {
		                            'value': metadata.context?.entitySet || '',
		                            'type': 'string'
		                        },
		                        logo: {
		                            value: sapLogo,
		                            type: 'string'
		                        },
		                        metadata: {
		                            context: {
		                                applicationType: 'fe',
		                                oDataType: metadata.context.fe,
		                                service: metadata.context.service,
		                                path: metadata.context.path,
		                                filters: metadata.context.filters || []
		                            }
		                        }
		                    },
		                    ...this.getDestinations(),
		                    ...this.getCSRFToken(metadata)
		                },
		                ...this.getDataConfig(metadata),
		                type: 'List',
		                header: {
		                    icon: {
		                        src: '{{parameters.logo}}',
		                        fitType: 'Contain',
		                        shape: 'Square'
		                    },
		                    data: {
		                        path: `/header${dataPath}0`
		                    },
		                    title: header.title,
		                    subTitle: header.type,
		                    status: {
		                        text: `{= Math.min(${maxItems}, ${count}) + ' of ' + ${count} }`
		                    }
		                },
		                content: {
		                    data: {
		                        path: `/content${dataPath}`
		                    },
		                    maxItems: maxItems,
		                    item: {
		                        attributes: facts.map((fact) => {
		                            return { value: fact.value };
		                        })
		                    }
		                },
		                footer: {
		                    actionsStrip: []
		                }
		            };
		            return card;
		        }
		        generateTableCard({ header, facts }, metadata) {
		            const context = metadata.context;
		            const dataPath = context.fe === 'v2' ? '/d/results/' : '/value/';
		            const count = context.fe === 'v2' ? '${/content/d/__count}' : '${/content/@odata.count}';
		            const maxItems = 5;
		            const maxColumns = 3;
		            const columns = (facts || []).slice(0, maxColumns).map((fact) => ({
		                title: this.compileExpression((fact.label ?? '')),
		                value: this.compileExpression((fact.value ?? ''))
		            }));
		            const card = this.generateBaseCard(metadata, 'Table');
		            card['sap.card'] = {
		                type: 'Table',
		                extension: this.extensionPath,
		                configuration: {
		                    parameters: {
		                        _entitySet: {
		                            value: context?.entitySet || '',
		                            type: 'string'
		                        },
		                        logo: {
		                            value: sapLogo,
		                            type: 'string'
		                        },
		                        metadata: {
		                            context: {
		                                applicationType: 'fe',
		                                oDataType: context.fe,
		                                service: context.service,
		                                path: context.path,
		                                filters: context.filters || []
		                            }
		                        }
		                    },
		                    ...this.getCSRFToken(metadata),
		                    ...this.getDestinations()
		                },
		                ...this.getDataConfig(metadata),
		                header: {
		                    icon: {
		                        src: '{{parameters.logo}}',
		                        fitType: 'Contain',
		                        shape: 'Square'
		                    },
		                    data: {
		                        path: `/header${dataPath}0`
		                    },
		                    title: header?.title || '',
		                    subTitle: header?.description || '',
		                    status: {
		                        text: `{= Math.min(${maxItems}, ${count}) + ' of ' + ${count} }`
		                    }
		                },
		                content: {
		                    data: {
		                        path: `/content${dataPath}`
		                    },
		                    maxItems,
		                    row: { columns }
		                }
		            };
		            return card;
		        }
		        /**
		         * Creates actions strip for UI5 Integration Cards based on normalized action data
		         * @param metadata - Card metadata containing normalized action data
		         * @returns Array of action strip items for UI5 Integration Cards
		         */
		        createActionsStrip(metadata) {
		            const actionsStrip = [];
		            const normalizedActionData = metadata?.footer;
		            if (!normalizedActionData) {
		                return actionsStrip;
		            }
		            // Add simple actions (no parameters required)
		            for (const action of normalizedActionData.simpleActions) {
		                actionsStrip.push({
		                    text: action.label,
		                    buttonType: 'Default',
		                    actions: [
		                        {
		                            type: 'Custom',
		                            parameters: {
		                                verb: action.verb,
		                                contextURL: action.contextPath,
		                                contextKeys: action.contextKeys
		                            }
		                        }
		                    ]
		                });
		            }
		            return actionsStrip;
		        }
		    }

		    function createCardFactory(type) {
		        return type === exports.TargetCardType.UI5IntegrationCard ? new Ui5CardFactory() : new AdaptiveCardFactory();
		    }

		    const generateAppCard = (manifest, metadata, annotations, options) => {
		        const target = options.target ?? exports.TargetCardType.UI5IntegrationCard;
		        const cardFactory = createCardFactory(target);
		        return cardFactory.generateAppCard(manifest, metadata, annotations, { ...options });
		    };

		    exports.generateAppCard = generateAppCard;

		}));
		
	} (dist, dist.exports));

	var distExports = dist.exports;

	Object.defineProperty(distExports, "__" + "esModule", { value: true });

	return distExports;

}));
