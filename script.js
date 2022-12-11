import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.module.js";

import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";

const base_year = 0.01
const base_day = base_year * 365

function year(day) {
	return 365 / day * base_year
}

function day(day) {
	return base_day / day
}
const vertexShader = /*glsl*/`
void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /*glsl*/`
void main() {
	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

const shadermaterial = new THREE.ShaderMaterial({
	fragmentShader: fragmentShader,
	vertexShader: vertexShader
});
let scene, camera, renderer, raycaster, mouse, INTERSECTED;
let objects = [], //  [sun, mercury, venus, earth, mars, jupiter, saturn, saturn's ring, uranus, neptune]
	rotation =        [ 0,  day(58),  -day(116),  base_day,  day(1),  day(0.26),  day(0.24), 0, -day(0.14),  day(0.15)],
	position =        [    0,   300,   600,   900,  1200,  1500,  1800,  1800,  2100,  2400],
	revolute =        [  0.0,   0.0,   0.0,   0.0,   0.0,   0.0,   0.0,   0.0,   0.0,   0.0],
	revolutionSpeed = [    0, year(88), year(225), base_year, year(687), year(4330), year(10755), year(10755), year(30687), year(60190)],
	moon, moonRevolute = 0.0;

class Planet {
	constructor(src, radius, position, axialTilt){
		const geo = new THREE.SphereGeometry(radius, 64, 32);
		const texture = new THREE.TextureLoader().load(src);
		const material = new THREE.MeshStandardMaterial({
			map: texture
		});
		// this.initialPosition = position;
		const planet = new THREE.Mesh(geo, material, shadermaterial);
		planet.position.set(position, 0, position);
		planet.castShadow = true;
		planet.receiveShadow = true;
		planet.rotation.x = -axialTilt * Math.PI / 180;
		return planet;
	}
}

function hideOutline(obj){
	if (obj.children.length != 0) {
		const outlineObject = obj.children[0];
		outlineObject.visible = false;
	}
}

function showOutline(obj){
	if (obj.children.length != 0) {
		const outlineObject = obj.children[0];
		outlineObject.visible = true;
	}
}

function outline(obj) {
	const geo = obj.geometry;
	var outlineMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide} );
	var outlineMesh = new THREE.Mesh( geo, outlineMaterial );
	// outlineMesh.position.copy(obj.position);
	outlineMesh.scale.multiplyScalar(1.05);
	obj.add(outlineMesh);
	hideOutline(obj);
	return outlineMesh;
}

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		55,
		window.innerWidth / window.innerHeight,
		45,
		30000
	);
	mouse = new THREE.Vector2();
	raycaster = new THREE.Raycaster();
	camera.position.set(-900, 0, 0);

	renderer = new THREE.WebGLRenderer({ 
		antialias: true 
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	let controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener("change", renderer);
	controls.minDistance = 50;
	controls.maxDistance = 3000;

	let skyboxTexture = new THREE.TextureLoader().load("src/space.jpg");
	skyboxTexture.wrapS = THREE.RepeatWrapping;
	skyboxTexture.repeat.x = -1;
	const skyboxMaterial = new THREE.MeshBasicMaterial({
		map: skyboxTexture
	});
	skyboxMaterial.side = THREE.BackSide;
	let skyboxGeo = new THREE.SphereGeometry(5000, 64, 32);
	let skybox = new THREE.Mesh(skyboxGeo, skyboxMaterial);
	scene.add(skybox);


	const sunGeo = new THREE.SphereGeometry(100, 64, 32);
	const sunTexture = new THREE.TextureLoader().load("src/sun/sun.jpg");
	const sunMaterial = new THREE.MeshBasicMaterial({
		map: sunTexture
	});
	const sun = new THREE.Mesh(sunGeo, sunMaterial);
	sun.rotation.x = -7.25 * Math.PI / 180;
	sun.castShadow = false;
	sun.receiveShadow = false;
	outline(sun);
	objects.push(sun);
	scene.add(sun);

	var sunlight = new THREE.PointLight(0xffffff, 1, 100000);
	sunlight.position.set(0,0,0);
	scene.add(sunlight);
	
	const mercury = new Planet("src/mercury/mercury.jpg", 50, 150, 0.03);
	outline(mercury);
	objects.push(mercury);
	scene.add(mercury);

	const venus = new Planet("src/venus/venus.jpg", 50, 250, 2.64);
	outline(venus);
	objects.push(venus);
	scene.add(venus);

	const earth = new Planet("src/earth/earth.png", 50, 350, 23.44);
	outline(earth);
	objects.push(earth);
	scene.add(earth);

	moon = new Planet("src/earth/moon.jpg", 20, 500, 6.68);
	scene.add(moon);

	const mars = new Planet("src/mars/mars.jpg", 50, 450, 25.19);
	outline(mars);
	objects.push(mars);
	scene.add(mars);

	const jupiter = new Planet("src/jupiter/jupiter.jpg", 50, 550, 3.13);
	outline(jupiter);
	objects.push(jupiter);
	scene.add(jupiter);

	const saturn = new Planet("src/saturn/saturn.jpg", 50, 650, 26.73);
	outline(saturn);
	objects.push(saturn);
	scene.add(saturn);
	const ringGeo = new THREE.RingGeometry(65, 115, 64);
	const ringTexture = new THREE.TextureLoader().load("src/saturn/ring.png");
	const ringMaterial = new THREE.MeshBasicMaterial({
		map: ringTexture,
		side: THREE.DoubleSide,
		transparent: true
	});
	const ring = new THREE.Mesh(ringGeo, ringMaterial);
	ring.rotation.x = Math.PI/2;
	ring.rotation.x = (90 - 26.73) * Math.PI / 180;
	objects.push(ring);
	scene.add(ring);

	const uranus = new Planet("src/uranus/uranus.jpg", 50, 750, 82.23);
	outline(uranus);
	objects.push(uranus);
	scene.add(uranus);

	const neptune = new Planet("src/neptune/neptune.jpg", 50, 850, 28.32);
	outline(neptune);
	objects.push(neptune);
	scene.add(neptune);

	var galaxy_light = new THREE.AmbientLight(0xffffff, 0.3);
	scene.add(galaxy_light);

	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	  }, false);

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

	animate();
}

function onDocumentMouseMove( event ) 
{
	mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
}

function animate() {
	let index = 0;
	objects.forEach( Element => {
		Element.rotation.y -= rotation[index];
		Element.position.x = position[index] * Math.sin(revolute[index]);
		Element.position.z = position[index] * Math.cos(revolute[index]);
		revolute[index] += revolutionSpeed[index];
		let day = document
		.getElementById('days_info')
		.innerHTML.match(/\d+/)[0]

		// gatau kenapa tapi full rotation kalo mod 6
		if (index == 3 && parseFloat(Math.abs(Element.rotation.y)) >= (6) * (Number(day) + 1)) {
			document.getElementById('days_info').innerHTML = (Number(day) + 1) + " days elapsed on earth";
		}
		index++;
	});
	moon.rotation.y += day(30);
	moon.position.x = objects[3].position.x + (100 * Math.sin(moonRevolute));
	moon.position.z = objects[3].position.z + (100 * Math.cos(moonRevolute));
	moonRevolute += 27 * base_year;
	renderer.render(scene, camera);
	requestAnimationFrame(animate);

	console.log(mouse);
	
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects(scene.children);

	if ( intersects.length > 0 )
	{
		if ( intersects[ 0 ].object != INTERSECTED ) 
		{
			if ( INTERSECTED ) 
				hideOutline(INTERSECTED);
			INTERSECTED = intersects[ 0 ].object;
			showOutline(INTERSECTED);
		}
	} 
	else // there are no intersections
	{
		if ( INTERSECTED ) 
			hideOutline(INTERSECTED);
		INTERSECTED = null;
	}
}
var text2 = document.createElement('div');
text2.style.position = 'absolute';
text2.style.width = 100;
text2.style.height = 100;
text2.style.fontSize = 50 + "px";
text2.style.backgroundColor = "white";
text2.innerHTML = "0 days elapsed on earth";
text2.style.top = 100 + 'px';
text2.style.left = 100 + 'px';
text2.id = 'days_info'
document.body.appendChild(text2);
init();
