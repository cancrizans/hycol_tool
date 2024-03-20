import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import SpriteText from 'three-spritetext';

import Picker from 'vanilla-picker';
import '@simonwep/pickr/dist/themes/nano.min.css';
import Pickr from '@simonwep/pickr';


import init,{
	my_init_function, 
	JSCol, get_meshed_triangle,color_to_dot,
	get_gamut_cage, get_isotherm, get_luma_steps,
	skin_frame_boost,Frame} from './pkg/hycol_tool.js';


init().then(()=>{

	my_init_function();

	const vcol_lines_material = new THREE.LineBasicMaterial({
		vertexColors:true
	})


	const scene = new THREE.Scene();
	const fsize = 1.5;
	let aspect = window.innerWidth / window.innerHeight;
	const camera = new THREE.OrthographicCamera(
		-aspect * fsize, aspect * fsize,
		fsize, -fsize,
		0.1,1000
	) 


	const named_frames = {
		'D65': Frame.get_d65(),
		'D50': Frame.get_d50(),
		'SKN': Frame.get_skin()
	};

	var frame = named_frames['D65'];

	const wp_luma = 80.;
	var frame_labels = {};
	for(const [name,_] of Object.entries(named_frames)){
		frame_labels[name] = new SpriteText(name,0.05,"#000");
		scene.add(frame_labels[name]);
	}

	


	const infinity_points = new THREE.EllipseCurve(
		0,  0,            // ax, aY
		1, 1,           // xRadius, yRadius
		0,  2 * Math.PI,  // aStartAngle, aEndAngle
		true,            // aClockwise
		0                 // aRotation
	).getPoints( 64 );

	infinity_points.push(new THREE.Vector2(-1,0));
	const infinity = new THREE.Line( 
		new THREE.BufferGeometry().setFromPoints( infinity_points ),
		new THREE.LineDashedMaterial( { color: 0x444444 , gapSize:0.06,dashSize:0.04} )
		 );
	infinity.computeLineDistances();
	
	infinity.setRotationFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2.);
	scene.add(infinity);

	for(let i=0; i<4; i++){
		let idtxt = (i==0)? "W∞" : "∞";
		let st = new SpriteText(idtxt,0.05,"#444");
		let ang = Math.PI * i / 2;
		st.position.set(Math.cos(ang),0.04,Math.sin(ang));
		scene.add(st);
	}


	const value_pts = [];
	const value_cols = [];
	for(let grey of get_luma_steps()){

		let y = grey.posy;
		let col = grey.color;

		const thstep = Math.PI / 12;
		const valr = 0.2;
		
		value_pts.push(-valr,y,0);
		value_pts.push(valr,y,0);
		value_pts.push(0,y,-valr);
		value_pts.push(0,y,valr);
		

		for(let i = 0; i<4;i++){
			value_cols.push(col.rfloat(),col.gfloat(),col.bfloat());
		}
		
	}
	const values_geom = new THREE.BufferGeometry();
	values_geom.setAttribute('position',new THREE.BufferAttribute(new Float32Array(value_pts),3));
	values_geom.setAttribute('color',new THREE.BufferAttribute(new Float32Array(value_cols),3));
	const values = new THREE.LineSegments(
		values_geom,
		vcol_lines_material
	);
	scene.add(values);



	// const N0label = new SpriteText("N0",0.05,"#000");
	// scene.add(N0label);
	// const N0dot = get_neutral(0.0);
	
	// const NWlabel = new SpriteText("NW",0.05,"#200");
	// scene.add(NWlabel);
	// const NWdot = get_neutral(0.25);

	
	var in_skinframe = false;

	var polar_pickers = [];
	var poles = [
		
	];
	var pole_labels = [];
	var fields = [];
	//var field_selectors = [];


	function add_field(){
		console.log("adding field");
		let idx = fields.length;

		fields.push([0,0,0]);

		var field_selector = document.createElement("div");
		field_selector.setAttribute('class','field-selector');
		for(let cidx = 0; cidx<3; cidx++){
			let csel = document.createElement('select');
			csel.setAttribute('class','field-corner-selector');
			
			csel.addEventListener("change",function(){
				fields[idx][cidx] = this.value;
				updateDots();
			});

			csel.value = 0;
			
			field_selector.appendChild(csel);

		}

		document.querySelector("#fields").appendChild(field_selector);

		updateDots();

		
	}
	document.querySelector("#add_field").addEventListener("click",add_field);


	function make_pickr(el){
		return  Pickr.create({
			el:el,
			container:document.body,
			theme:'nano',
			inline:false,
			components: {
				preview: true,
				opacity: false,
				hue: true,
				// Input / output Options
				interaction: {
				  hex: true,
				  rgba: true,
				  
				  input: true
				  
				}
			  },

			position:'left-middle',
			autoReposition:false
		});
	}


	function add_pole(){
		let i = poles.length;
		var polpick = document.createElement("div");
		polpick.setAttribute('class','pole-picker');
		document.querySelector("#poles").appendChild(polpick);

		
		
		// var pckr = new Picker(polpick);
		// pckr.setOptions({popup:'down'});
		// pckr.setColor("#aaaaaa");

		let pckr_el = document.createElement("div");
		pckr_el.setAttribute('id','replacepickr');
		polpick.appendChild(pckr_el);

		const pckr = make_pickr("#replacepickr")

		pckr.on('change', function(color,_,__){
			//polpick.style.background = color.rgbaString;
			pckr.applyColor();
			
			//let arr = color.rgba;
			poles[i] = color;

			updateDots();
			
		});

		pckr.on("show", (color, instance) => { 
			const style = instance.getRoot().app.style;
			style.left = "150px";
		});

		poles.push(pckr.getColor());
		//polpick.style.background = pckr.getColor().toRGBA().toString();
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


	
	const gamut_geom = new THREE.BufferGeometry();
	const gamut = new THREE.LineSegments(gamut_geom,vcol_lines_material);
	scene.add(gamut);

	document.querySelector("#display_cage").addEventListener("change",function(){
		gamut.visible = this.checked;
	});
	document.querySelector("#display_hue").addEventListener("change",function(){
		hue_grid.visible = this.checked;
	});
	document.querySelector("#display_isotherms").addEventListener("change",function(){
		isotherms.visible = this.checked;
	});
	document.querySelector("#display_values").addEventListener("change",function(){
		values.visible = this.checked;
	});
	// document.querySelector("#skinframe").addEventListener("change",function(){
	// 	in_skinframe = this.checked;
	// 	updateDots();
	// });


	function pkdcol_to_jscol(pkdcol){
		let rgba = pkdcol.toRGBA();
		return new JSCol(rgba[0],rgba[1],rgba[2]);
	}

	
	add_pole();

	
	function to_frame_boost(dot){
		if(in_skinframe){
			return skin_frame_boost(dot);
		}
		else{
			return dot;
		}
	}

	function updateDots(){
		let dotsbuff = [];


		for(const [name,fr] of Object.entries(named_frames)){
			let dot = fr.center_dot(wp_luma);
			let trdot = frame.transform_to(dot);

			frame_labels[name].position.set(trdot.posx,0,trdot.posz);
		}
		
		// let boosted_N0 = to_frame_boost(N0dot);
		// N0label.position.set(boosted_N0.posx,0,boosted_N0.posz);
		// let boosted_NW = to_frame_boost(NWdot);
		// NWlabel.position.set(boosted_NW.posx,0,boosted_NW.posz);


		
		let lineverts = [];

		for(const [pidx,pole] of poles.entries()){
			let poledot = color_to_dot(pkdcol_to_jscol(pole));
			const pb = frame.transform_to(poledot);
			lineverts.push(pb.posx);
			lineverts.push(pb.posy);
			lineverts.push(pb.posz);
			lineverts.push(pb.posx);
			lineverts.push(0.0);
			lineverts.push(pb.posz);

			pole_labels[pidx].position.set(pb.posx,pb.posy,pb.posz);

			dotsbuff.push(poledot);
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

			dotsbuff.push(...triangle);
			
			
		}

		const boosted_dotsbuff = frame.transform_to_array(dotsbuff);
		let verts = [];
		let cols = [];
		for(const cb of boosted_dotsbuff){

			verts.push(cb.posx);
			verts.push(cb.posy);
			verts.push(cb.posz);

			
			cols.push(cb.color.rfloat());
			cols.push(cb.color.gfloat());
			cols.push(cb.color.bfloat());
				
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

	const isotherms_geom = new THREE.BufferGeometry();
	const isoth_material = new THREE.LineBasicMaterial({color:'#888'});
	const isotherms = new THREE.LineSegments(isotherms_geom,isoth_material);
	scene.add(isotherms);


	function update_frame(){
		var neut_dot = frame.center_dot(wp_luma);
		var neutral = neut_dot.color;
		//console.log(neutral);
		// document.querySelector("#neutral-temp-lbl").innerHTML = temperature;
		scene.background = new THREE.Color(
			neutral.rfloat(),neutral.gfloat(),neutral.bfloat());

		
		let gamut_verts = [];
		let gamut_cols = [];
		for(let k=0; k<12;k++){
			let seg = get_gamut_cage(k,frame,16);
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


		let isoth_verts = [];

		for(let temp = -1.2; temp <= 1.75; temp += 0.25){
			let deltatemp = temp;
			let isopts = get_isotherm(deltatemp);
			
			for(let i = 0; i<isopts.length-1;i++){
				let p1 = isopts[i];
				let p2 = isopts[i+1];
				isoth_verts.push(p1.x,0,p1.y);
				isoth_verts.push(p2.x,0,p2.y);
			}
		}
		isotherms_geom.setAttribute('position',new THREE.BufferAttribute(
			new Float32Array(isoth_verts),3
		));
		isotherms_geom.getAttribute('position').needsUpdate=true;
		isotherms_geom.computeBoundingBox();
		isotherms_geom.computeBoundingSphere();


		updateDots();
	}

	function set_frame(new_frame){
		frame = new_frame;
		update_frame();
	}

	const fselect_container = document.querySelector("#frame-selectors");
	for(const [name,fr] of Object.entries(named_frames)){
		let but = document.createElement('button');
		but.innerText = name;
		but.addEventListener('click',()=>{
			frame = fr;
			update_frame();
		});
		fselect_container.appendChild(but);
	}

	let framefrompckr = make_pickr("#frame-from-picker");
	document.querySelector("#get-frame-from-picked").addEventListener("click",()=>{
		
		let color = pkdcol_to_jscol(framefrompckr.getColor());
		set_frame(Frame.from_neutral(color));
		
	});

	set_frame(named_frames['D65']);

	// const neutempsldr = document.querySelector("#neutral-temp");

	

	// neutempsldr.addEventListener("change",(event)=>{
	// 		var temp = event.target.value
	// 		set_frame(temp);
	// 	});

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



	const hue_grid_geom = new THREE.BufferGeometry();
	const hue_grid = new THREE.LineSegments(hue_grid_geom,new THREE.LineBasicMaterial( {color: 0x000000}));
	var hue_divs = 14;
	scene.add(hue_grid)

	function update_hue_grid_rotation(){
		let val = document.querySelector("#hue_rotation").value;
		hue_grid.setRotationFromEuler(new THREE.Euler(0,Math.PI*2/hue_divs*val,0));


	}


	function update_hue_grid(){

		let hue_pts = [];
		for(let k = 0; k<hue_divs;k++){
			let theta = Math.PI*2*k/hue_divs;
			let s = Math.sin(theta);
			let c = Math.cos(theta);

			const smur = 0.1;
			hue_pts.push(smur*c,0,smur*s);
			const hur = 0.7;
			hue_pts.push(hur*c,0,hur*s);
		}

		hue_grid_geom.setAttribute('position',new THREE.BufferAttribute(new Float32Array(hue_pts),3));

		hue_grid_geom.getAttribute('position').needsUpdate = true;
		hue_grid_geom.computeBoundingBox();
		hue_grid_geom.computeBoundingSphere();

		update_hue_grid_rotation();
		console.log("Grid update");
	}

	document.querySelector("#hue_divisions").addEventListener("change",function(){
		document.querySelector("#hue-divisions-lbl").innerText = this.value;
		if (hue_divs != this.value){
			hue_divs = this.value;
			update_hue_grid();
		}
	});

	update_hue_grid();

	document.querySelector("#hue_rotation").addEventListener("change",update_hue_grid_rotation);


	camera.position.z = 3;


	function draw() {
		requestAnimationFrame( draw );

		controls.update();
		renderer.render( scene, camera );
	}

	draw();

});