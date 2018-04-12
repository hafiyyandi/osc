var objects = [];
var selectedObject;


// Three.js variables
var width = window.innerWidth;
var height = window.innerHeight;
var camera3D;  //be careful because p5.js might have something named camera
var scene;  //be careful because our sketch has something named scene
var renderer;
var mixer;

var video;
var vidObject;

var current_BG = 0;
var next_BG = 1;

//key pressed won't work unless you wake up p5 but we are using three.js's "init" funciton instead
function setup(){
}


function keyPressed(){
  if(selectedObject){
    if (keyCode == 37){
      selectedObject.rotation.y =   selectedObject.rotation.y  + Math.PI/18;
    }else if (keyCode == 39){
      selectedObject.rotation.y =   selectedObject.rotation.y  - Math.PI/18;
    }if (keyCode == 38){
      selectedObject.position.z =   selectedObject.position.z  + 10;
    }else if (keyCode == 40){
      selectedObject.position.z =   selectedObject.position.z - 10;
    }
    saveKeying(selectedObject);
  }

}

//Three.js version of p5's "setup"
function init() {
  scene = new THREE.Scene();
  clock = new THREE.Clock();

  camera3D = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, .1, 1000 );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.getElementById( 'container' ).appendChild( renderer.domElement );

  camera3D.position.z = 5;
  //create a sphere to put the panoramic video on
  var geometry = new THREE.SphereGeometry( 500, 60, 40 );
  geometry.scale( -1, 1, 1 );
  video = document.createElement( 'video' );
  video.crossOrigin = 'anonymous';
  video.width = 640;
  video.height = 360;
  video.loop = true;
  video.muted = true;
  video.src = footages[current_BG].path;
  video.setAttribute( 'webkit-playsinline', 'webkit-playsinline' );
  video.play();
  var texture = new THREE.VideoTexture( video );
  texture.minFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;
  var material   = new THREE.MeshBasicMaterial( { map : texture } );
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );


  //video
   vidObject = addVideo(footages[next_BG].path);
   scene.add(vidObject);
   objects.push(vidObject);

 htmlInterface();
  //key KINECTRON
  // var keyObject = setupKey(); //connect to kinectron an get a keyed image
  // scene.add(keyObject );
  // objects.push(keyObject );  //put it in the list of things that you check for mouse clicks on

  ///UI
  document.addEventListener( 'mousedown', onDocumentMouseDownCheckObject, false); //check for clicks
  activatePanoControl(camera3D); //field mouse dragggin to move camera

  ///THROW IN A LIGHT
  var ambient = new THREE.AmbientLight( 0x333333 );
  scene.add( ambient );
  var directionalLight = new THREE.DirectionalLight( 0xffffff );
  directionalLight.position.set(1, 1, 10 );
  scene.add( directionalLight );

  ///START LOADING MODELS
   
   var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };
    var onProgress = function ( xhr ) {
            if ( xhr.lengthComputable ) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log(  Math.round(percentComplete, 2) + '% downloaded' );
           }
        };
        var onError = function ( xhr ) {
        };

  //LOAD TEXTURE
  var texture = new THREE.Texture();

  var imageLoader = new THREE.ImageLoader( manager );
  imageLoader.load( 'assets/textures/UV_Grid_Sm_2.jpg', function ( image ) {
      texture.image = image;
      texture.needsUpdate = true;
  } );

///// LOAD IN OBJ
        // model
      var bustLoader = new THREE.OBJLoader( manager );
      bustLoader.load( 'assets/net.obj', function ( object ) {
      //loader.load( 'male02/male02.obj', function ( object ) {
          object.traverse( function ( child ) {
              if ( child instanceof THREE.Mesh ) {
                  child.material.map = texture;
              }
          } );
          object.position.y = -200;
          object.position.z = -200;
          object.position.x = -100;
          //object.rotation.y = Math.PI/2;
          object.rotation.x = -Math.PI/2;
          //object.rotation.z= Math.PI/1;
          object.scale.y = 1.5;
          object.scale.z = 1.5;
          object.scale.x = 1.5;
          scene.add( object );
      }, onProgress, onError );

    // collada
      var loader = new THREE.ColladaLoader();
      loader.load( 'assets/collada/stormtrooper/stormtrooper.dae', function ( collada ) {
        var animations = collada.animations;
        var avatar = collada.scene;

        avatar.position.y = -5;
        avatar.position.z = -2;
        avatar.position.x = 0;
        avatar.rotation.z = -Math.PI;
        mixer = new THREE.AnimationMixer( avatar );
        var action = mixer.clipAction( animations[ 0 ] ).play();
        scene.add( avatar );
      } );


}

//Three.js version of p5's "draw"
function animate() {
  requestAnimationFrame(animate);
  // Update the textures for each animate frame
  //animateKey();
  animateVideo();
  var delta = clock.getDelta();

  if ( mixer !== undefined ) {
     mixer.update( delta );
  }
  renderer.render(scene,   camera3D);
}

init();
animate();
updateBGLabel(current_BG);

//checks against the list of objects for what you have clicked on to make it the "selectedObject"
function onDocumentMouseDownCheckObject( e ) {
  console.log("clicked object", selectedObject);
  var raycaster = new THREE.Raycaster(); // create once
  var mouse = new THREE.Vector2(); // create once
  mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
  raycaster.setFromCamera( mouse, camera3D );
  var intersects = raycaster.intersectObjects( objects, true );
  var tempobj;
  for( var i = 0; i < intersects.length; i++ ) {
    var intersection = intersects[ i ],
    tempobj = intersection.object;
    //break;
  }
  if (tempobj) selectedObject = tempobj
  console.log("clicked object", selectedObject);

}

function prevBG(){
  var bgCount = footages.length;
  if (current_BG == 0){
    current_BG = bgCount - 1;
  } else {
    current_BG--;
  }

  if (current_BG == bgCount-1){
    next_BG = 0;
  } else {
      next_BG = current_BG+1;
  }
  console.log ("current BG: " + current_BG);

  video.src = footages[current_BG].path;
  video.play();

  scene.remove(vidObject);
  vidObject = addVideo(footages[next_BG].path);
  scene.add(vidObject);

  updateBGLabel(current_BG);

}

function nextBG(){
  var bgCount = footages.length;
  if (current_BG == bgCount-1){
    current_BG = 0;
    next_BG = 1;
  } else if (current_BG == bgCount-2){
    current_BG++;
    next_BG = 0;
  } else {
    current_BG++; 
    next_BG++; 
  }
  console.log ("current BG: " + current_BG);

  video.src = footages[current_BG].path;
  video.play();

  scene.remove(vidObject);
  vidObject = addVideo(footages[next_BG].path);
  scene.add(vidObject);

  updateBGLabel(current_BG);
}

function updateBGLabel(num){
  document.getElementById("nameBG").value = footages[current_BG].name;
}