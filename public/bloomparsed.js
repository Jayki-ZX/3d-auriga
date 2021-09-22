import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';
const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );
const params = {
	exposure: 1,
	bloomStrength: 5,
	bloomThreshold: 0,
	bloomRadius: 0,
	scene: "Scene with Glow"
};
const darkMaterial = new THREE.MeshBasicMaterial( { color: "black" } );
const materials = {};

const renderScene = new RenderPass( scene, camera );
const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;
const bloomComposer = new EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );
const finalPass = new ShaderPass(
	new THREE.ShaderMaterial( {
		uniforms: {
			baseTexture: { value: null },
			bloomTexture: { value: bloomComposer.renderTarget2.texture }
		},
		vertexShader: document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
		defines: {}
	} ), "baseTexture"
);
finalPass.needsSwap = true;
const finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass );

window.addEventListener( 'pointerdown', onPointerDown );

setupScene();
function onPointerDown( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	const intersects = raycaster.intersectObjects( scene.children );
	if ( intersects.length > 0 ) {
		const object = intersects[ 0 ].object;
		object.layers.toggle( BLOOM_SCENE );
		render();
	}
}
function setupScene() {
	scene.traverse( disposeMaterial );
	scene.children.length = 0;
	const geometry = new THREE.IcosahedronGeometry( 1, 15 );
	for ( let i = 0; i < 50; i ++ ) {
		const color = new THREE.Color();
		color.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 );
		const material = new THREE.MeshBasicMaterial( { color: color } );
		const sphere = new THREE.Mesh( geometry, material );
		sphere.position.x = Math.random() * 10 - 5;
		sphere.position.y = Math.random() * 10 - 5;
		sphere.position.z = Math.random() * 10 - 5;
		sphere.position.normalize().multiplyScalar( Math.random() * 4.0 + 2.0 );
		sphere.scale.setScalar( Math.random() * Math.random() + 0.5 );
		scene.add( sphere );
		if ( Math.random() < 0.25 ) sphere.layers.enable( BLOOM_SCENE );
	}
	render();
}
function disposeMaterial( obj ) {
	if ( obj.material ) {
		obj.material.dispose();
	}
}
function render() {
	switch ( params.scene ) {
		case 'Scene only':
			renderer.render( scene, camera );
			break;
		case 'Glow only':
			renderBloom( false );
			break;
		case 'Scene with Glow':
		default:
			// render scene with bloom
			renderBloom( true );
			// render the entire scene, then render bloom scene on top
			finalComposer.render();
			break;
	}
}
function renderBloom( mask ) {
	if ( mask === true ) {
		scene.traverse( darkenNonBloomed );
		bloomComposer.render();
		scene.traverse( restoreMaterial );
	} else {
		camera.layers.set( BLOOM_SCENE );
		bloomComposer.render();
		camera.layers.set( ENTIRE_SCENE );
	}
}
function darkenNonBloomed( obj ) {
	if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
		materials[ obj.uuid ] = obj.material;
		obj.material = darkMaterial;
	}
}
function restoreMaterial( obj ) {
	if ( materials[ obj.uuid ] ) {
		obj.material = materials[ obj.uuid ];
		delete materials[ obj.uuid ];
	}
}