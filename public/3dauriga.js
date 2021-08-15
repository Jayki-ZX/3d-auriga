

import * as THREE from '../build/three.module.js';

import { DDSLoader } from './jsm/loaders/DDSLoader.js';
import { MTLLoader } from './jsm/loaders/MTLLoader.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;

let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
var raycaster;

init();
animate();


function init() {
  raycaster = new THREE.Raycaster();
  const container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.z = 250;

  // scene

  scene = new THREE.Scene();

  const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
  scene.add( ambientLight );

  const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
  camera.add( pointLight );
  scene.add( camera );

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

  } );

  /* FENIX
  loader.load( './ensamble/fenix/fenix.gltf', function ( gltf ) {

    console.log(gltf);
    gltf.scene.children.forEach(child => {
      child.scale.x = 60;
      child.scale.y = 60;
      child.scale.z = 60;
    });
    scene.add( gltf.scene );

  }, undefined, function ( error ) {

    console.error( error );

  } );

  */

  //
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  document.addEventListener( 'mousemove', onDocumentMouseMove );

  //
  window.addEventListener('mousemove', onClick, true);
  window.addEventListener( 'resize', onWindowResize );

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

  camera.position.x += ( mouseX - camera.position.x ) * .05;
  camera.position.y += ( - mouseY - camera.position.y ) * .05;

  camera.lookAt( scene.position );

  renderer.render( scene, camera );

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

    object.material.color.set( Math.random() * 0xffffff );

  }
	
	render();

}