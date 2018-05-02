var objects = [];
var selectedObject;


// Three.js variables
var width = window.innerWidth;
var height = window.innerHeight;
var camera3D; //be careful because p5.js might have something named camera
var scene; //be careful because our sketch has something named scene
var renderer;
var mixer;

var video;
var vidObject;

var current_BG = 0;
var next_BG = 1;

var p5Texture;

//key pressed won't work unless you wake up p5 but we are using three.js's "init" funciton instead
function setup() {}


function keyPressed() {
  if (selectedObject) {
    if (keyCode == 37) {
      selectedObject.rotation.y = selectedObject.rotation.y + Math.PI / 18;
    } else if (keyCode == 39) {
      selectedObject.rotation.y = selectedObject.rotation.y - Math.PI / 18;
    }
    if (keyCode == 38) {
      selectedObject.position.z = selectedObject.position.z + 10;
    } else if (keyCode == 40) {
      selectedObject.position.z = selectedObject.position.z - 10;
    }
    saveKeying(selectedObject);
  }

}

//Three.js version of p5's "setup"
function init() {
  scene = new THREE.Scene();
  clock = new THREE.Clock();

  camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('container').appendChild(renderer.domElement);

  camera3D.position.z = 5;

  var geometry = new THREE.SphereBufferGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);

  var material = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('bright.jpg')
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);


  //video
  //vidObject = addVideo(footages[next_BG].path);
  //scene.add(vidObject);
  //objects.push(vidObject);

  htmlInterface();

  ///UI
  document.addEventListener('mousedown', onDocumentMouseDownCheckObject, false); //check for clicks
  activatePanoControl(camera3D); //field mouse dragggin to move camera

  ///THROW IN A LIGHT
  var ambient = new THREE.AmbientLight(0x333333);
  scene.add(ambient);
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 10);
  scene.add(directionalLight);

  ///START LOADING MODELS

  // COLLADA OBJECT
  var loader = new THREE.ColladaLoader();
  loader.load('assets/boy/Idle.dae', function(collada) {
    //loader.load( 'assets/collada/stormtrooper/stormtrooper.dae', function ( collada ) {
    var animations = collada.animations;
    var avatar = collada.scene;

    avatar.position.y = -5;
    avatar.position.z = -2;
    avatar.position.x = 0;


    avatar.scale.y = 0.04;
    avatar.scale.z = 0.04;
    avatar.scale.x = 0.04;
    //avatar.rotation.z = -Math.PI;
    mixer = new THREE.AnimationMixer(avatar);
    var action = mixer.clipAction(animations[0]).play();
    scene.add(avatar);
  });


  //P5 LAYER
  var rect = new THREE.PlaneGeometry(80, 60);
  p5Texture = new THREE.Texture(p5cs.elt);
  rect.scale(0.06, 0.06, 0.06);

  var rect_mat = new THREE.MeshBasicMaterial({
      // map: new THREE.TextureLoader().load('assets/textures/UV_Grid_Sm.jpg')
    map: p5Texture,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
  });

  var rect_mesh = new THREE.Mesh(rect, rect_mat);
  rect_mesh.position.y = 0.3;
  rect_mesh.position.x = 1;
  scene.add(rect_mesh);

  animate();
}

//Three.js version of p5's "draw"
function animate() {
  requestAnimationFrame(animate);
  // Update the textures for each animate frame
  //animateVideo();
  var delta = clock.getDelta();

  if (mixer !== undefined) {
    mixer.update(delta);
  }
  renderer.render(scene, camera3D);

  // P5 ANIMATION
  clear();
  drawFace();
  p5Texture.needsUpdate = true;

}

//init();
//animate();


// updateBGLabel(current_BG);
//checks against the list of objects for what you have clicked on to make it the "selectedObject"
function onDocumentMouseDownCheckObject(e) {
  console.log("clicked object", selectedObject);
  var raycaster = new THREE.Raycaster(); // create once
  var mouse = new THREE.Vector2(); // create once
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera3D);
  var intersects = raycaster.intersectObjects(objects, true);
  var tempobj;
  for (var i = 0; i < intersects.length; i++) {
    var intersection = intersects[i],
      tempobj = intersection.object;
    //break;
  }
  if (tempobj) selectedObject = tempobj
  console.log("clicked object", selectedObject);

}

//LEGACY FUNCTIONS TO CHANGE BG
// function prevBG(){
//   var bgCount = footages.length;
//   if (current_BG == 0){
//     current_BG = bgCount - 1;
//   } else {
//     current_BG--;
//   }

//   if (current_BG == bgCount-1){
//     next_BG = 0;
//   } else {
//       next_BG = current_BG+1;
//   }
//   console.log ("current BG: " + current_BG);

//   video.src = footages[current_BG].path;
//   video.play();

//   scene.remove(vidObject);
//   vidObject = addVideo(footages[next_BG].path);
//   scene.add(vidObject);

//   updateBGLabel(current_BG);

// }

// function nextBG(){
//   var bgCount = footages.length;
//   if (current_BG == bgCount-1){
//     current_BG = 0;
//     next_BG = 1;
//   } else if (current_BG == bgCount-2){
//     current_BG++;
//     next_BG = 0;
//   } else {
//     current_BG++; 
//     next_BG++; 
//   }
//   console.log ("current BG: " + current_BG);

//   video.src = footages[current_BG].path;
//   video.play();

//   scene.remove(vidObject);
//   vidObject = addVideo(footages[next_BG].path);
//   scene.add(vidObject);

//   updateBGLabel(current_BG);
// }

// function updateBGLabel(num){
//   document.getElementById("nameBG").value = footages[current_BG].name;
// }