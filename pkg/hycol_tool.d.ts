/* tslint:disable */
/* eslint-disable */
/**
*/
export function my_init_function(): void;
/**
* @param {number} r
* @param {number} g
* @param {number} b
* @returns {JSCol}
*/
export function make_jscol(r: number, g: number, b: number): JSCol;
/**
* @param {CanvasRenderingContext2D} ctx
* @param {number} size
* @param {JSCol} v1
* @param {JSCol} v2
* @param {JSCol} v3
*/
export function draw_triangle(ctx: CanvasRenderingContext2D, size: number, v1: JSCol, v2: JSCol, v3: JSCol): void;
/**
* @param {CanvasRenderingContext2D} ctx
* @param {number} size
* @param {JSCol} v1
* @param {JSCol} v2
* @param {JSCol} v3
*/
export function draw_meshed_triangle(ctx: CanvasRenderingContext2D, size: number, v1: JSCol, v2: JSCol, v3: JSCol): void;
/**
*/
export class JSCol {
  free(): void;
/**
* @param {number} r
* @param {number} g
* @param {number} b
*/
  constructor(r: number, g: number, b: number);
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly my_init_function: () => void;
  readonly __wbg_jscol_free: (a: number) => void;
  readonly jscol_new: (a: number, b: number, c: number) => number;
  readonly draw_triangle: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly draw_meshed_triangle: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly make_jscol: (a: number, b: number, c: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
