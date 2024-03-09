import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import SpriteText from 'three-spritetext';

import Picker from 'vanilla-picker';


import init,{
	my_init_function,get_neutral,temp_boost, 
	JSCol, get_meshed_triangle,color_to_dot,
	get_gamut_cage} from './pkg/hycol_tool.js';


init().then(()=>{

	my_init_function();


	const scene = new THREE.Scene();
	const fsize = 1.5;
	let aspect = window.innerWidth / window.innerHeight;
	const camera = new THREE.OrthographicCamera(
		-aspect * fsize, aspect * fsize,
		fsize, -fsize,
		0.1,1000
	) 

	const N0label = new SpriteText("N0",0.05,"#000");
	scene.add(N0label);
	const N0dot = get_neutral(0.0);
	
	const NWlabel = new SpriteText("NW",0.05,"#200");
	scene.add(NWlabel);
	const NWdot = get_neutral(0.25);

	var temperature = 0.0;

	var polar_pickers = [];
	var poles = [
		
	];
	var pole_labels = [];
	var fields = [];
	//var field_selectors = [];


	function add_field(){
		console.log("adding field");
		let idx = fields.length;

		fields.push([0,1,2]);

		var field_selector = document.createElement("div");
		field_selector.setAttribute('class','field-selector');
		for(let cidx = 0; cidx<3; cidx++){
			let csel = document.createElement('select');
			csel.setAttribute('class','field-corner-selector');
			
			csel.addEventListener("change",function(){
				fields[idx][cidx] = this.value;
				updateDots();
			});
			
			field_selector.appendChild(csel);

		}

		document.querySelector("#fields").appendChild(field_selector);

		updateDots();
	}
	document.querySelector("#add_field").addEventListener("click",add_field);

	function add_pole(){
		let i = poles.length;
		var polpick = document.createElement("div");
		polpick.setAttribute('class','pole-picker');
		document.querySelector("#poles").appendChild(polpick);
		
		var pckr = new Picker(polpick);
		pckr.setOptions({popup:'down'});
		pckr.setColor("#aaaaaa");
		pckr.onChange = function(pp,color){
			pp.style.background = color.rgbaString;
			

			//let arr = color.rgba;
			poles[i] = color;

			updateDots();
			
		}.bind(null,polpick);

		poles.push(pckr.color);
		polpick.style.background = pckr.color.rgbaString;
		polar_pickers.push(polpick);

		let pole_label = new SpriteText(i,0.05,'#000');
		scene.add(pole_label);
		pole_labels.push(pole_label);

		updateDots();
	}



	document.querySelector("#add_pole").addEventListener("click",add_pole);
	

	const dots_geometry = new THREE.BufferGeometry();
	const material = new THREE.PointsMaterial( { 
		size: 40, 
		vertexColors: true, fog: false, color:0xffffff, sizeAttenuation : false } );
	var points = new THREE.Points( dots_geometry, material );
	scene.add( points );

	const lines_material = new THREE.LineBasicMaterial( {color: 0x000000});
	const lines_geometry = new THREE.BufferGeometry();
	const lines = new THREE.LineSegments(lines_geometry,lines_material);
	scene.add(lines);


	const gamut_material = new THREE.LineBasicMaterial({
		vertexColors:true
	})
	const gamut_geom = new THREE.BufferGeometry();
	const gamut = new THREE.LineSegments(gamut_geom,gamut_material);
	scene.add(gamut);

	document.querySelector("#display_cage").addEventListener("change",function(){
		gamut.visible = this.checked;
	});


	function pkdcol_to_jscol(pkdcol){
		let rgba = pkdcol.rgba;
		return new JSCol(rgba[0],rgba[1],rgba[2]);
	}

	
	add_pole();

	


	function updateDots(){
		
		let boosted_N0 = temp_boost(N0dot,temperature);
		N0label.position.set(boosted_N0.posx,0,boosted_N0.posz);
		let boosted_NW = temp_boost(NWdot,temperature);
		NWlabel.position.set(boosted_NW.posx,0,boosted_NW.posz);


		let verts = [];
		let cols = [];
		let lineverts = [];

		for(const [pidx,pole] of poles.entries()){
			const pb = temp_boost(color_to_dot(pkdcol_to_jscol(pole)),temperature);
			lineverts.push(pb.posx);
			lineverts.push(pb.posy);
			lineverts.push(pb.posz);
			lineverts.push(pb.posx);
			lineverts.push(0.0);
			lineverts.push(pb.posz);

			pole_labels[pidx].position.set(pb.posx,pb.posy,pb.posz);
		}


		for(const field of fields){
			const p1 = poles[field[0]];
			const p2 = poles[field[1]];
			const p3 = poles[field[2]];

			if ((p1 === undefined) | (p2 === undefined) | (p3 === undefined)){
				continue;
			}

			
			var triangle = get_meshed_triangle(
				pkdcol_to_jscol(p1),
				pkdcol_to_jscol(p2),
				pkdcol_to_jscol(p3),7);

			for(const col of triangle){
				const cb = temp_boost(col,temperature);

				verts.push(cb.posx);
				verts.push(cb.posy);
				verts.push(cb.posz);

				
				cols.push(cb.color.rfloat());
				cols.push(cb.color.gfloat());
				cols.push(cb.color.bfloat());
				
			}
		}

		dots_geometry.setAttribute( 'position', new THREE.BufferAttribute( 
			new Float32Array(verts), 3 ) );
		dots_geometry.setAttribute( 'color', new THREE.BufferAttribute( 
			new Float32Array(cols), 3 ) );
		dots_geometry.getAttribute('position').needsUpdate = true;
		dots_geometry.getAttribute('color').needsUpdate = true;
		dots_geometry.computeBoundingBox();
		dots_geometry.computeBoundingSphere();


		lines_geometry.setAttribute('position', new THREE.BufferAttribute(
			new Float32Array(lineverts),3
			));
		lines_geometry.getAttribute('position').needsUpdate = true;
		lines_geometry.computeBoundingBox();
		lines_geometry.computeBoundingSphere();

		document.querySelectorAll('.field-corner-selector').forEach((element,_) => {
			let val = element.value;
			element.innerHTML = "";
			for(const [pidx,pole] of poles.entries()){
				let option = document.createElement("option");
				option.innerText = pidx;
				option.style.backgroundColor = pole.rgbaString;
				option.setAttribute('value',pidx);
				element.appendChild(option);
			}

			if (val < poles.length){
				element.value = val;
			}
		});
	}

	function update_neutral(){
		var neut_dot = get_neutral(temperature);
		var neutral = neut_dot.color.to_hex();
		document.querySelector("#neutral-temp-lbl").innerHTML = temperature;
		scene.background = new THREE.Color(neutral);

		
		let gamut_verts = [];
		let gamut_cols = [];
		for(let k=0; k<12;k++){
			let seg = get_gamut_cage(k,temperature,16);
			for(let i=0; i<seg.length-1; i++){
				let pa = seg[i];
				let pb = seg[i+1];
				gamut_verts.push(pa.posx,pa.posy,pa.posz);
				gamut_verts.push(pb.posx,pb.posy,pb.posz);

				gamut_cols.push(pa.color.rfloat(),pa.color.gfloat(),pa.color.bfloat());
				gamut_cols.push(pb.color.rfloat(),pb.color.gfloat(),pb.color.bfloat());
			}
		}
		gamut_geom.setAttribute('position', new THREE.BufferAttribute(
			new Float32Array(gamut_verts),3
		));
		gamut_geom.setAttribute('color', new THREE.BufferAttribute(
			new Float32Array(gamut_cols),3
		));
		gamut_geom.getAttribute('position').needsUpdate = true;
		gamut_geom.getAttribute('color').needsUpdate = true;
		gamut_geom.computeBoundingBox();
		gamut_geom.computeBoundingSphere();


		updateDots();
	}

	function set_neutral(temp){
		temperature = temp;
		update_neutral();
	}

	set_neutral(0.0);

	const neutempsldr = document.querySelector("#neutral-temp");

	

	neutempsldr.addEventListener("change",(event)=>{
			var temp = event.target.value
			set_neutral(temp);
		});

	const renderer = new THREE.WebGLRenderer();
	renderer.outputEncoding = THREE.sRGBEncoding;
	THREE.ColorManagement.enabled = true;
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
	renderer.gammaOutput = true;
	renderer.setSize( window.innerWidth, window.innerHeight );
	addEventListener("resize",(_)=>{
		
		let aspect = window.innerWidth / window.innerHeight;
		camera.left = -aspect * fsize;
		camera.right = aspect * fsize;
		
    	camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	
	});
	document.querySelector("#canvas-container").appendChild( renderer.domElement );

	const controls = new OrbitControls( camera, renderer.domElement );
				controls.target.set( 0, 0.0, 0 );
				controls.update();
				controls.enablePan = false;
				controls.enableDamping = true;



	var hue_grid = undefined;
	var hue_divs = 14;

	function update_hue_grid(){
		if(hue_grid != undefined){
			scene.remove(hue_grid);
		}

		hue_grid = new THREE.PolarGridHelper( 0.75, hue_divs, 6, 64 );
		scene.add( hue_grid );
	}

	document.querySelector("#hue_divisions").addEventListener("change",function(){
		document.querySelector("#hue-divisions-lbl").innerText = this.value;
		if (hue_divs != this.value){
			hue_divs = this.value;
			update_hue_grid();
		}
	});

	update_hue_grid();


	camera.position.z = 3;


	function draw() {
		requestAnimationFrame( draw );

		controls.update();
		renderer.render( scene, camera );
	}

	draw();

});