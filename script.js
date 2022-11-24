import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";

import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer;
let objects = [], 
	rotation = [0, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01],
	position = [0, 0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000],
	revolute = [0.0 , 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
	revolutionSpeed = [0.01, 0.009, 0.008, 0.007, 0.006, 0.005, 0.004, 0.003, 0.002, 0.001];

class Planet {
	constructor(src, radius, position){
		const geo = new THREE.SphereGeometry(radius, 64, 32);
		const texture = new THREE.TextureLoader().load(src);
		const material = new THREE.MeshBasicMaterial({
			map: texture
		});
		// this.initialPosition = position;
		const planet = new THREE.Mesh(geo, material);
		planet.position.set(position, 0, position);
		planet.castShadow = false;
		planet.receiveShadow = true;
		return planet;
	}
}

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		55,
		window.innerWidth / window.innerHeight,
		45,
		30000
	);
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
	objects.push(skybox);
	scene.add(skybox);

	const sunGeo = new THREE.SphereGeometry(100, 64, 32);
	const sunTexture = new THREE.TextureLoader().load("src/sun/sun.jpg");
	const sunMaterial = new THREE.MeshBasicMaterial({
		map: sunTexture
	});
	const sun = new THREE.Mesh(sunGeo, sunMaterial);
	objects.push(sun);
	scene.add(sun);
	
	const mercury = new Planet("src/mercury/mercury.jpg", 50, 150);
	objects.push(mercury);
	scene.add(mercury);

	const venus = new Planet("src/venus/venus.jpg", 50, 250);
	objects.push(venus);
	scene.add(venus);

	const earth = new Planet("src/earth/earth.png", 50, 350);
	objects.push(earth);
	scene.add(earth);

	const mars = new Planet("src/mars/mars.jpg", 50, 450);
	objects.push(mars);
	scene.add(mars);

	const jupiter = new Planet("src/jupiter/jupiter.jpg", 50, 550);
	objects.push(jupiter);
	scene.add(jupiter);

	const saturn = new Planet("src/saturn/saturn.jpg", 50, 650);
	objects.push(saturn);
	scene.add(saturn);

	const uranus = new Planet("src/uranus/uranus.jpg", 50, 750);
	objects.push(uranus);
	scene.add(uranus);

	const neptune = new Planet("src/neptune/neptune.jpg", 50, 850);
	objects.push(neptune);
	scene.add(neptune);

	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	  }, false);

	animate();
}
function animate() {
	let index = 0;
	objects.forEach( Element => {
		Element.rotation.y += rotation[index];
		Element.position.x = position[index] * Math.sin(revolute[index]);
		Element.position.z = position[index] * Math.cos(revolute[index]);
		revolute[index] += revolutionSpeed[index];
		index++;
	});
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}
init();
