extern crate console_error_panic_hook;
use std::panic;

use hycol::{Hycol,SRGB,meshed_triangle, HYPER_R};
use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;
use web_sys::{CanvasRenderingContext2d, ImageData};
use num_complex::Complex;

#[wasm_bindgen]
pub fn my_init_function() {
    panic::set_hook(Box::new(console_error_panic_hook::hook));
}


#[wasm_bindgen]
#[derive(Clone,Copy)]
pub struct JSCol{r:u8,g:u8,b:u8}



#[wasm_bindgen]
impl JSCol{
    #[wasm_bindgen(constructor)]
    pub fn new(r:u8,g:u8,b:u8)->JSCol{
        JSCol{r,g,b}
    }

    pub fn to_hex(&self)->String{
        format!("rgb({},{},{})",self.r,self.g,self.b)
    }

    #[wasm_bindgen]
    pub fn rfloat(&self)->f64{
        (self.r as f64)/255.
    }
    #[wasm_bindgen]
    pub fn gfloat(&self)->f64{
        (self.g as f64)/255.
    }
    #[wasm_bindgen]
    pub fn bfloat(&self)->f64{
        (self.b as f64)/255.
    }
}



//why do I FUCKING need to do this.
#[wasm_bindgen]
pub fn make_jscol(r:u8,g:u8,b:u8)->JSCol{
    return JSCol{r,g,b}
}
 
impl Into<SRGB> for JSCol{
    fn into(self) -> SRGB {
        SRGB{
            r : (self.r as f64)/255.,
            g : (self.g as f64)/255.,
            b : (self.b as f64)/255.
        }
    }
}
impl From<SRGB> for JSCol{
    fn from(value: SRGB) -> Self {
        let (r,g,b) = value.to_u8().into();
        JSCol{
            r,g,b
        }
    }
}

impl Into<Hycol> for JSCol{
    fn into(self) -> Hycol {
        let srgb : SRGB= self.into();
        assert!(srgb.in_gamut());
        srgb.into()
    }
}


#[wasm_bindgen]
pub struct ColorDot{
    pub color : JSCol,
    pub posx : f64,
    pub posy : f64,
    pub posz : f64
}



impl From<Hycol> for ColorDot{
    fn from(value: Hycol) -> Self {
        ColorDot{
            color : SRGB::from(value).into(),
            posx : value.chroma.0.re,
            posy : (value.luma-50.) / (2.*HYPER_R),
            posz : value.chroma.0.im
        }
    }
}


#[wasm_bindgen]
pub fn draw_triangle(
    ctx: &CanvasRenderingContext2d,
    size: u32,
    v1 : JSCol,
    v2 : JSCol,
    v3 : JSCol
){
    let mut data : Vec<u8> = vec![0; (4*size*size).try_into().unwrap()];

    let vrgb1 : SRGB = v1.into();
    let vrgb2 : SRGB = v2.into();
    let vrgb3 : SRGB = v3.into();

    assert!(vrgb1.in_gamut());
    assert!(vrgb2.in_gamut());
    assert!(vrgb3.in_gamut());

    let c1 : Hycol = vrgb1.into();
    let c2 : Hycol = vrgb2.into();
    let c3 : Hycol = vrgb3.into();

    for i in 0..size{
        for j in 0..(size.checked_sub(i).unwrap()){
            let idx = 4*(i + size*j) as usize;
            
            let l1 = (i as f64)/(size as f64 - 1.0);
            let l2 = (j as f64)/(size as f64 - 1.0);

            assert!((0.0..=1.).contains(&l1));
            assert!((0.0..=1.).contains(&l2));

            let blend = Hycol::hlerp3(c1, c2, c3, l1, l2);

            let blend_rgb : SRGB = blend.into();

            let (r,g,b) = blend_rgb.to_u8().into();

            data[idx] = r;
            data[idx+1] = g;
            data[idx+2] = b;
            data[idx+3] = 255;
            

        }
    }
    let data = ImageData::new_with_u8_clamped_array_and_sh(Clamped(&data), size,size).unwrap();
    ctx.put_image_data(&data, 0.0, 0.0).unwrap();


}

#[wasm_bindgen]
pub fn draw_meshed_triangle(
    ctx: &CanvasRenderingContext2d,
    size: u32,
    v1 : JSCol,
    v2 : JSCol,
    v3 : JSCol
){
    ctx.clear_rect(0., 0., size as f64, size as f64);

    let vrgb1 : SRGB = v1.into();
    let vrgb2 : SRGB = v2.into();
    let vrgb3 : SRGB = v3.into();

    assert!(vrgb1.in_gamut());
    assert!(vrgb2.in_gamut());
    assert!(vrgb3.in_gamut());

    let c1 : Hycol = vrgb1.into();
    let c2 : Hycol = vrgb2.into();
    let c3 : Hycol = vrgb3.into();

    let points = meshed_triangle(c1,c2,c3,7);


    let scale = (size as f64)/4.0;
    let hsize = (size as f64)/2.0;
    for point in points{
        let ((px,py),col) = point;

        let rs = 20.0;
        let x = scale * px + hsize - rs;
        let y = scale * py + hsize - rs;
        
        let rgb : SRGB = col.into();

        ctx.set_fill_style(&rgb.to_html().into());
        ctx.fill_rect(x, y, rs*2.0, rs*2.0);


    }

}

#[wasm_bindgen]
pub fn get_neutral(
    temperature : f64) -> ColorDot{
    Hycol::neutral(temperature).into()
}

#[wasm_bindgen]
pub fn color_to_dot(col:JSCol) -> ColorDot{
    //there's a roundtrip here...
    let srgb : SRGB = col.into();
    Hycol::from(srgb).into()

}

#[wasm_bindgen]
pub fn temp_boost(d:&ColorDot, t:f64)->ColorDot{

    let w : Complex<f64> = Complex{re:d.posx,im:d.posz};
    let c = (t/2.).cosh();
    let s = (t/2.).sinh();
    let wboost = (c*w-s)/(-s*w+c);

    ColorDot{
        posx:wboost.re,posy:d.posy,posz:wboost.im,color:d.color
    }
}

#[wasm_bindgen]
pub fn get_meshed_triangle(
            v1 : JSCol,
            v2 : JSCol,
            v3 : JSCol,
            n : u32) -> Vec<ColorDot>{
                
    meshed_triangle(
        v1.into(),v2.into(),v3.into(),n as usize).iter().map(|(_,c)|
        ColorDot::from(*c)
    ).collect()
}

#[wasm_bindgen]
pub fn get_gamut_cage(seg_idx: usize,temperature : f64, subd:usize) -> Vec<ColorDot>{
    let (c1,c2) = [
        (SRGB::BLACK, SRGB::RED),
        (SRGB::BLACK, SRGB::GREEN),
        (SRGB::BLACK, SRGB::BLUE),

        (SRGB::RED, SRGB::YELLOW),
        (SRGB::GREEN, SRGB::YELLOW),
        (SRGB::GREEN, SRGB::CYAN),
        (SRGB::BLUE, SRGB::CYAN),
        (SRGB::BLUE, SRGB::MAGENTA),
        (SRGB::RED, SRGB::MAGENTA),

        (SRGB::YELLOW,SRGB::WHITE),
        (SRGB::MAGENTA,SRGB::WHITE),
        (SRGB::CYAN,SRGB::WHITE)
    ][seg_idx];

    

    (0..subd).map(|i| 
        temp_boost(
            &Hycol::from(SRGB::gamma_lerp2(c1,c2,(i as f64)/((subd-1) as f64))).into(), 
            temperature)
    ).collect()
}


#[wasm_bindgen]
pub struct Point2{
    pub x : f64,
    pub y : f64
}

#[wasm_bindgen]
pub fn get_isotherm(temperature : f64) -> Vec<Point2>{
    const M : i32 = 8;
    let exp_t = temperature.exp();
    let x = (-M..=M).map(|i| 2.*exp_t*(i as f64)/(M as f64));
    let z = x.map(|xx| Complex{re:xx,im:exp_t});
    let w = z.map(|zz| (zz - Complex::i())/(zz + Complex::i()));

    w.map(|w|Point2{x:w.re,y:w.im}).collect()
}


#[wasm_bindgen]
pub fn get_luma_steps() -> Vec<ColorDot>{
    let lumas = (0..=8).filter(|&i|i!=4).map(
        |i|   100./8.*(i as f64));

    lumas.map(|l|ColorDot::from(Hycol::new(l,0.0.into()))).collect()
}