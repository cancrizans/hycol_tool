let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}
/**
*/
export function my_init_function() {
    wasm.my_init_function();
}

/**
* @param {number} r
* @param {number} g
* @param {number} b
* @returns {JSCol}
*/
export function make_jscol(r, g, b) {
    const ret = wasm.jscol_new(r, g, b);
    return JSCol.__wrap(ret);
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let stack_pointer = 128;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
* @param {CanvasRenderingContext2D} ctx
* @param {number} size
* @param {JSCol} v1
* @param {JSCol} v2
* @param {JSCol} v3
*/
export function draw_triangle(ctx, size, v1, v2, v3) {
    try {
        _assertClass(v1, JSCol);
        var ptr0 = v1.__destroy_into_raw();
        _assertClass(v2, JSCol);
        var ptr1 = v2.__destroy_into_raw();
        _assertClass(v3, JSCol);
        var ptr2 = v3.__destroy_into_raw();
        wasm.draw_triangle(addBorrowedObject(ctx), size, ptr0, ptr1, ptr2);
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* @param {CanvasRenderingContext2D} ctx
* @param {number} size
* @param {JSCol} v1
* @param {JSCol} v2
* @param {JSCol} v3
*/
export function draw_meshed_triangle(ctx, size, v1, v2, v3) {
    try {
        _assertClass(v1, JSCol);
        var ptr0 = v1.__destroy_into_raw();
        _assertClass(v2, JSCol);
        var ptr1 = v2.__destroy_into_raw();
        _assertClass(v3, JSCol);
        var ptr2 = v3.__destroy_into_raw();
        wasm.draw_meshed_triangle(addBorrowedObject(ctx), size, ptr0, ptr1, ptr2);
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* @param {number} temperature
* @returns {ColorDot}
*/
export function get_neutral(temperature) {
    const ret = wasm.get_neutral(temperature);
    return ColorDot.__wrap(ret);
}

/**
* @param {JSCol} col
* @returns {ColorDot}
*/
export function color_to_dot(col) {
    _assertClass(col, JSCol);
    var ptr0 = col.__destroy_into_raw();
    const ret = wasm.color_to_dot(ptr0);
    return ColorDot.__wrap(ret);
}

/**
* @param {ColorDot} d
* @param {number} t
* @returns {ColorDot}
*/
export function temp_boost(d, t) {
    _assertClass(d, ColorDot);
    const ret = wasm.temp_boost(d.__wbg_ptr, t);
    return ColorDot.__wrap(ret);
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}
/**
* @param {JSCol} v1
* @param {JSCol} v2
* @param {JSCol} v3
* @param {number} n
* @returns {(ColorDot)[]}
*/
export function get_meshed_triangle(v1, v2, v3, n) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(v1, JSCol);
        var ptr0 = v1.__destroy_into_raw();
        _assertClass(v2, JSCol);
        var ptr1 = v2.__destroy_into_raw();
        _assertClass(v3, JSCol);
        var ptr2 = v3.__destroy_into_raw();
        wasm.get_meshed_triangle(retptr, ptr0, ptr1, ptr2, n);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 4, 4);
        return v4;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* @param {number} seg_idx
* @param {number} temperature
* @param {number} subd
* @returns {(ColorDot)[]}
*/
export function get_gamut_cage(seg_idx, temperature, subd) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.get_gamut_cage(retptr, seg_idx, temperature, subd);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 4, 4);
        return v1;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

let cachedUint8ClampedMemory0 = null;

function getUint8ClampedMemory0() {
    if (cachedUint8ClampedMemory0 === null || cachedUint8ClampedMemory0.byteLength === 0) {
        cachedUint8ClampedMemory0 = new Uint8ClampedArray(wasm.memory.buffer);
    }
    return cachedUint8ClampedMemory0;
}

function getClampedArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ClampedMemory0().subarray(ptr / 1, ptr / 1 + len);
}

const ColorDotFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_colordot_free(ptr >>> 0));
/**
*/
export class ColorDot {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ColorDot.prototype);
        obj.__wbg_ptr = ptr;
        ColorDotFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ColorDotFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_colordot_free(ptr);
    }
    /**
    * @returns {JSCol}
    */
    get color() {
        const ret = wasm.__wbg_get_colordot_color(this.__wbg_ptr);
        return JSCol.__wrap(ret);
    }
    /**
    * @param {JSCol} arg0
    */
    set color(arg0) {
        _assertClass(arg0, JSCol);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_colordot_color(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {number}
    */
    get posx() {
        const ret = wasm.__wbg_get_colordot_posx(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set posx(arg0) {
        wasm.__wbg_set_colordot_posx(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get posy() {
        const ret = wasm.__wbg_get_colordot_posy(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set posy(arg0) {
        wasm.__wbg_set_colordot_posy(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get posz() {
        const ret = wasm.__wbg_get_colordot_posz(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set posz(arg0) {
        wasm.__wbg_set_colordot_posz(this.__wbg_ptr, arg0);
    }
}

const JSColFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jscol_free(ptr >>> 0));
/**
*/
export class JSCol {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JSCol.prototype);
        obj.__wbg_ptr = ptr;
        JSColFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JSColFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jscol_free(ptr);
    }
    /**
    * @param {number} r
    * @param {number} g
    * @param {number} b
    */
    constructor(r, g, b) {
        const ret = wasm.jscol_new(r, g, b);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @returns {string}
    */
    to_hex() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jscol_to_hex(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {number}
    */
    rfloat() {
        const ret = wasm.jscol_rfloat(this.__wbg_ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    gfloat() {
        const ret = wasm.jscol_gfloat(this.__wbg_ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    bfloat() {
        const ret = wasm.jscol_bfloat(this.__wbg_ptr);
        return ret;
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_colordot_new = function(arg0) {
        const ret = ColorDot.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setfillStyle_59f426135f52910f = function(arg0, arg1) {
        getObject(arg0).fillStyle = getObject(arg1);
    };
    imports.wbg.__wbg_putImageData_29991a01cd314e71 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).putImageData(getObject(arg1), arg2, arg3);
    }, arguments) };
    imports.wbg.__wbg_clearRect_25dc6164fd51d5c0 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearRect(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_fillRect_4dd28e628381d240 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).fillRect(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_newwithu8clampedarrayandsh_321e0772441dd074 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = new ImageData(getClampedArrayU8FromWasm0(arg0, arg1), arg2 >>> 0, arg3 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedInt32Memory0 = null;
    cachedUint32Memory0 = null;
    cachedUint8Memory0 = null;
    cachedUint8ClampedMemory0 = null;


    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('hycol_tool_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
