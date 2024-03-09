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
* @param {number} temperature
* @returns {ColorDot}
*/
export function get_neutral(temperature: number): ColorDot;
/**
* @param {JSCol} col
* @returns {ColorDot}
*/
export function color_to_dot(col: JSCol): ColorDot;
/**
* @param {ColorDot} d
* @param {number} t
* @returns {ColorDot}
*/
export function temp_boost(d: ColorDot, t: number): ColorDot;
/**
* @param {JSCol} v1
* @param {JSCol} v2
* @param {JSCol} v3
* @param {number} n
* @returns {(ColorDot)[]}
*/
export function get_meshed_triangle(v1: JSCol, v2: JSCol, v3: JSCol, n: number): (ColorDot)[];
/**
* @param {number} seg_idx
* @param {number} temperature
* @param {number} subd
* @returns {(ColorDot)[]}
*/
export function get_gamut_cage(seg_idx: number, temperature: number, subd: number): (ColorDot)[];
/**
*/
export class ColorDot {
  free(): void;
/**
*/
  color: JSCol;
/**
*/
  posx: number;
/**
*/
  posy: number;
/**
*/
  posz: number;
}
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
/**
* @returns {string}
*/
  to_hex(): string;
/**
* @returns {number}
*/
  rfloat(): number;
/**
* @returns {number}
*/
  gfloat(): number;
/**
* @returns {number}
*/
  bfloat(): number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly my_init_function: () => void;
  readonly __wbg_jscol_free: (a: number) => void;
  readonly jscol_new: (a: number, b: number, c: number) => number;
  readonly jscol_to_hex: (a: number, b: number) => void;
  readonly jscol_rfloat: (a: number) => number;
  readonly jscol_gfloat: (a: number) => number;
  readonly jscol_bfloat: (a: number) => number;
  readonly __wbg_colordot_free: (a: number) => void;
  readonly __wbg_get_colordot_color: (a: number) => number;
  readonly __wbg_set_colordot_color: (a: number, b: number) => void;
  readonly __wbg_get_colordot_posx: (a: number) => number;
  readonly __wbg_set_colordot_posx: (a: number, b: number) => void;
  readonly __wbg_get_colordot_posy: (a: number) => number;
  readonly __wbg_set_colordot_posy: (a: number, b: number) => void;
  readonly __wbg_get_colordot_posz: (a: number) => number;
  readonly __wbg_set_colordot_posz: (a: number, b: number) => void;
  readonly draw_triangle: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly draw_meshed_triangle: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly get_neutral: (a: number) => number;
  readonly color_to_dot: (a: number) => number;
  readonly temp_boost: (a: number, b: number) => number;
  readonly get_meshed_triangle: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly get_gamut_cage: (a: number, b: number, c: number, d: number) => void;
  readonly make_jscol: (a: number, b: number, c: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
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
