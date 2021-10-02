

import * as THREE from '../build/three.module.js';

import { DDSLoader } from './jsm/loaders/DDSLoader.js';
import { MTLLoader } from './jsm/loaders/MTLLoader.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';

import { GUI } from './jsm/libs/dat.gui.module.js';

const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );
let camera, scene, renderer, controls;
let renderScene, bloomPass;
let finalPass, finalComposer, bloomComposer;
let bg;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
var raycaster;
const materials = {};

let darkMaterial;
init();
animate();


function init() {
  darkMaterial = new THREE.MeshBasicMaterial( { color: "black" } );
  
  raycaster = new THREE.Raycaster();
  const container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.z = 250;

  // scene

  scene = new THREE.Scene();

  bg = new THREE.CubeTextureLoader()
	.setPath( './public/cube/' )
	.load( [
		'px.jpg',
		'nx.jpg',
		'py.jpg',
		'ny.jpg',
		'pz.jpg',
		'nz.jpg'
	] );

  const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
  scene.add( ambientLight );

  const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
  camera.add( pointLight );
  scene.add( camera );

  // bloom
  renderScene = new RenderPass( scene, camera );
  bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
  bloomPass.threshold = 0;
  bloomPass.strength = 1;
  bloomPass.radius = 0;

  // model

  const onProgress = function ( xhr ) {

    if ( xhr.lengthComputable ) {

      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

    }

  };

  const onError = function () { };

  const manager = new THREE.LoadingManager();
  manager.addHandler( /\.dds$/i, new DDSLoader() );

  // comment in the following line and import TGALoader if your asset uses TGA textures
  // manager.addHandler( /\.tga$/i, new TGALoader() );

  const loader = new GLTFLoader();

  /*
  loader.load( './ensamble/auriga/auriga.gltf', function ( gltf ) {

    console.log(gltf);
    gltf.scene.children.forEach(child => {
      child.scale.x = 0.05;
      child.scale.y = 0.05;
      child.scale.z = 0.05;
    });
    scene.add( gltf.scene );

  }, undefined, function ( error ) {

    console.error( error );

  } );*/

  loader.load( './ensamble/fenix/fenix.gltf', function ( gltf ) {

    //console.log(gltf);
    gltf.scene.children.forEach(child => {
      child.scale.x = 60;
      child.scale.y = 60;
      child.scale.z = 60;
    });
    scene.add( gltf.scene );

  }, undefined, function ( error ) {

    console.error( error );

  } );

  //
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  controls = new OrbitControls( camera, renderer.domElement ); 

  //document.addEventListener( 'mousemove', onDocumentMouseMove );

  //
  bloomComposer = new EffectComposer( renderer );
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass( renderScene );
  bloomComposer.addPass( bloomPass );
  finalPass = new ShaderPass(
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
  finalComposer = new EffectComposer( renderer );
  finalComposer.addPass( renderScene );
  finalComposer.addPass( finalPass );

  window.addEventListener('pointermove', onClick, true);
  window.addEventListener( 'resize', onWindowResize );
  window.addEventListener('dblclick', clickObject, true );

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

  mouseX = ( event.clientX - windowHalfX ) / 2;
  mouseY = ( event.clientY - windowHalfY ) / 2;

}

//

function animate() {

  requestAnimationFrame( animate );
  render();

}

function render() {

  //camera.position.x += ( mouseX - camera.position.x ) * .05;
  //camera.position.y += ( - mouseY - camera.position.y ) * .05;

  //camera.lookAt( scene.position );
  controls.update();

  scene.background = new THREE.Color(0x000000);
  //renderer.render( scene, camera );
  scene.traverse( darkenNonBloomed );
  bloomComposer.render();

  scene.background = bg;

  scene.traverse( restoreMaterial );
  finalComposer.render();
}

var last_intersected;

function clickObject() {
  event.preventDefault();
  const cb = document.getElementById("container");
  let evt = new MouseEvent("mouseup", {});

// Send the event to the checkbox element
  cb.dispatchEvent(evt)
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  let mouse = new THREE.Vector2(mouseX, mouseY) ;
  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObject(scene, true);
  //console.log(intersects);
  if (intersects.length > 0) {
    
		var object = intersects[0].object;
    //console.log("click objeto ", object.userData.name);
    if(object.userData.name === "Solido1") {
      window.open("https://www.google.com");
    }
    else if(object.userData.name === "Solido6") {
      window.open("https://www.google.com");
    }
    else if(object.userData.name === "Solido7") {
      window.open("https://www.google.com");
    }
    else if(object.userData.name === "Solido10") {
      window.open("https://www.google.com");
    }
    else if(object.userData.name === "Solido11") {
      window.open("https://www.google.com");
    }
  }
	render();
}

function onClick() {

  event.preventDefault();

  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  let mouse = new THREE.Vector2(mouseX, mouseY) ;
  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObject(scene, true);
  //console.log(intersects);
  if (intersects.length > 0) {
    
		var object = intersects[0].object;
    //console.log("objeto intersectado!");
    //console.log(object);
    //debugger;
    //object.material.color.set( Math.random() * 0xffffff );
    if(last_intersected) {
      if(last_intersected.uuid != object.uuid) {
        object.layers.toggle( BLOOM_SCENE );
        last_intersected.layers.toggle( BLOOM_SCENE );
        last_intersected.material.color.set( last_intersected.userData.originalColor );
        object.userData.originalColor = object.material.color.getHex();
        object.material.color.set( 0xffffff );
      }
    }
    else {
      object.userData.originalColor = object.material.color.getHex();
      object.material.color.set( 0xffffff );
      object.layers.toggle( BLOOM_SCENE );
    }
    last_intersected = object;
  }
	render();

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