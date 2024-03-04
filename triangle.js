import init, {my_init_function, make_jscol, draw_triangle} from './pkg/hycol_tool.js';


init().then((_exports) => {
    my_init_function();

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const picker1 = document.getElementById('pkr_v1');
    const picker2 = document.getElementById('pkr_v2');
    const picker3 = document.getElementById('pkr_v3');

    const renderBtn = document.getElementById("render");

    renderBtn.addEventListener('click', () => {
        function hex2JSCol(hex){
            const r = parseInt(hex.substr(1,2), 16);
            const g = parseInt(hex.substr(3,2), 16);
            const b = parseInt(hex.substr(5,2), 16);
    
            return make_jscol(r,g,b);
        }
        const c1 = hex2JSCol(picker1.value);
        const c2 = hex2JSCol(picker2.value);
        const c3 = hex2JSCol(picker3.value);
        

        draw_triangle(ctx,canvas.width,c1,c2,c3);
    });

})
.catch(console.error);