extern crate console_error_panic_hook;
use std::panic;

use hycol::{H99,SRGB};
use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;
use web_sys::{CanvasRenderingContext2d, ImageData};

#[wasm_bindgen]
pub fn my_init_function() {
    panic::set_hook(Box::new(console_error_panic_hook::hook));
}


#[wasm_bindgen]
pub struct JSCol{r:u8,g:u8,b:u8}

#[wasm_bindgen]
impl JSCol{
    #[wasm_bindgen(constructor)]
    pub fn new(r:u8,g:u8,b:u8)->JSCol{
        JSCol{r,g,b}
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

    let c1 : H99 = vrgb1.into();
    let c2 : H99 = vrgb2.into();
    let c3 : H99 = vrgb3.into();

    for i in 0..size{
        for j in 0..(size.checked_sub(i).unwrap()){
            let idx = 4*(i + size*j) as usize;
            
            let l1 = (i as f64)/(size as f64 - 1.0);
            let l2 = (j as f64)/(size as f64 - 1.0);

            assert!((0.0..=1.).contains(&l1));
            assert!((0.0..=1.).contains(&l2));

            let blend = H99::hlerp3(c1, c2, c3, l1, l2);

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