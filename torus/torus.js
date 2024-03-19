import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import SpriteText from 'three-spritetext';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

const reptones = [
	new THREE.Color(0.9704985068190063,0.4241217849368674,0.2510999836225335).convertSRGBToLinear(),
	new THREE.Color(0.9421958722083317,0.5032831800475263,0.18556582898003263).convertSRGBToLinear(),
	new THREE.Color(0.9026515930707073,0.5723822081668266,0.13179817477438405).convertSRGBToLinear(),
	new THREE.Color(0.8456066536961028,0.6358404766333924,0.07329684437785453).convertSRGBToLinear(),
	new THREE.Color(0.7528556874643795,0.6917360157166653,0.1439899963843628).convertSRGBToLinear(),
	new THREE.Color(0.6356832823951674,0.7311945050063094,0.2985232771968612).convertSRGBToLinear(),
	new THREE.Color(0.5215114123875259,0.7527711366156655,0.4847346246978195).convertSRGBToLinear(),
	new THREE.Color(0.4495777013318574,0.7537228645590975,0.6642782722073709).convertSRGBToLinear(),
	new THREE.Color(0.47335149409269534,0.7329152901721514,0.7927793954174855).convertSRGBToLinear(),
	new THREE.Color(0.5837862163977611,0.6870521968517252,0.8502429107662064).convertSRGBToLinear(),
	new THREE.Color(0.7410553244711798,0.6118485402950712,0.8284492311855239).convertSRGBToLinear(),
	new THREE.Color(0.8928852817828451,0.5155717912038639,0.7205414832653255).convertSRGBToLinear(),
	new THREE.Color(0.9843616268372534,0.42842367228199735,0.5545676035266918).convertSRGBToLinear(),
	new THREE.Color(0.997411472660268,0.39030784401776986,0.3810472357347947).convertSRGBToLinear(),
]

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 
    75, window.innerWidth/window.innerHeight, 0.1, 1000 );
const canvas = document.querySelector('#torus_canvas');


const renderer = new THREE.WebGLRenderer( 
    { canvas: canvas } 
    );

function resizeCanvasToDisplaySize() {
    const canvas = renderer.domElement;
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    // update any render target sizes here
    }
const resizeObserver = new ResizeObserver(resizeCanvasToDisplaySize);
resizeObserver.observe(canvas, {box: 'content-box'});



const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0.0, 0 );
controls.update();
controls.enablePan = false;
controls.enableDamping = true;



const torus_material = new THREE.MeshBasicMaterial( { color: 
    new THREE.Color(0.4809389334951016, 0.3848914661542852, 0.3141002686355735)
} );

const R1 = 0.25;
const torus_geometry = new THREE.TorusGeometry( 1.0, R1*0.9, 16, 100 ); 
const torus = new THREE.Mesh(torus_geometry,torus_material)
torus.rotateX(Math.PI/2.);

scene.add(torus);



function torpos(toroidal,poloidal, scaler = 1){
    let rad = R1*scaler;
    let rho = 1 + rad*Math.cos(poloidal)
    return new THREE.Vector3(
        Math.cos(toroidal) * rho,
        rad * Math.sin(poloidal),
        Math.sin(toroidal) * rho
    );
}

const twopi = Math.PI*2;

for(let i = 0; i<14; i++){
    let tor = - 5 * i / 14. * (twopi);
    let pol = - 3 * i / 14. * (twopi);

    let xyz = torpos(tor,pol);

    let sphere_geom = new THREE.SphereGeometry(0.1,16,8);
    let material = new THREE.MeshBasicMaterial({color:reptones[i]});
    let sphere = new THREE.Mesh(sphere_geom,material);
    sphere.position.set(xyz.x,xyz.y,xyz.z);
    
    scene.add(sphere)


    let label = new SpriteText("vcohyxgtnblmpr"[i],0.15,"#000");
    let xyzlab = torpos(tor,pol,1.5);
    label.position.set(xyzlab.x,xyzlab.y,xyzlab.z);
    scene.add(label);
}

const N = 128;
const lpos_reso = [];
const lpos_reso2 = [];

const lpos_semi = [];
const lpos_adj = [];
for(let i = 0; i<=N; i++){
    let t = (twopi / N) * i;

    let xyz = torpos(t,2*t);
    lpos_reso.push(xyz.x,xyz.y,xyz.z);

    let res2 = torpos(t,2*t + Math.PI);
    lpos_reso2.push(res2.x,res2.y,res2.z);

    let semi = torpos(3*t,-t);
    lpos_semi.push(semi.x,semi.y,semi.z);

    let adj = torpos(-t,5*t);
    lpos_adj.push(adj.x,adj.y,adj.z);
}



function add_line(positions, material){
    const reso_geom = new LineGeometry();
    reso_geom.setPositions(positions);
    const reso = new Line2(reso_geom,material);
    reso.computeLineDistances();
    scene.add(reso);
}

const reso_mat = new LineMaterial({color : "#333",linewidth:0.003});
const dashed_mat = new LineMaterial({color: "#333", dashed:true, dashScale:20., linewidth:0.003});

add_line(lpos_reso,reso_mat);
add_line(lpos_reso2,reso_mat);
add_line(lpos_semi,reso_mat);
add_line(lpos_adj,dashed_mat);




// const reso_geom2 = new THREE.BufferGeometry().setFromPoints(lpos_reso2);
// scene.add(new THREE.Line(reso_geom2,reso_mat));




scene.background = new THREE.Color(0.9872231682830229, 0.8703913273915482, 0.7884421702744475);


camera.position.z = 3;

var draw = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    requestAnimationFrame( draw );
    controls.update();
    renderer.render(scene, camera);

    
};

draw();