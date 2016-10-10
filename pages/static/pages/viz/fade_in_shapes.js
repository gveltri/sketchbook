var scene, camera, renderer;
var geometry, material, mesh;
var pyramid, dir_light,pyramids = [],pyramid_buffer = [], finished_pyramids = [], disappearing_pyramids = [];
var eventHandling, initScene, intersect_plane;


initScene = function() {

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMapType = THREE.PCFShadowMap;
    renderer.shadowMapAutoUpdate = true;
    renderer.setClearColor( 0x6f7883 );

    document.getElementById('viz').appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set(0,75,0);
    camera.lookAt(scene.position);

    var light = new THREE.AmbientLight( 0xeeeeee ); // soft white light
    scene.add( light );

    dir_light = new THREE.DirectionalLight( 0xd6d49f );
    dir_light.position.set( 20, 20, 30 );
    dir_light.target.position.copy( scene.position );
    dir_light.castShadow = true;
    dir_light.shadowCameraLeft = -200;
    dir_light.shadowCameraTop = -200;
    dir_light.shadowCameraRight = 200;
    dir_light.shadowCameraBottom = 200;
    dir_light.shadowCameraNear = 0;
    dir_light.shadowCameraFar = 500;
    dir_light.shadowBias = -.001
    dir_light.shadowMapWidth = dir_light.shadowMapHeight = 5000;
    dir_light.shadowDarkness = .5;

    scene.add(dir_light);

    intersect_plane = new THREE.Mesh(
	      new THREE.PlaneBufferGeometry( 400, 400 ),
	      new THREE.MeshBasicMaterial({ opacity: 0 , transparent: true })
    );
    intersect_plane.rotation.x = Math.PI / -2;
    intersect_plane.position.set(0,20,0);
    scene.add( intersect_plane );

    drawPyramid();

    eventHandling();
    requestAnimationFrame( animate );

}

function drawPyramid() {

    pyramid = new THREE.Mesh(
    	  new THREE.CylinderGeometry(3,10,15,4,1),
    	  new THREE.MeshLambertMaterial({color: 0x6f7883, opacity: 0.1, transparent: true})
    );

    pyramid.rotation.y=Math.PI/4;
    pyramid.geometry.computeVertexNormals();
    pyramid.position.set(-100,-20,160);

    buildField(pyramid,24);

}

function buildField(obj,n) {

    var pyramid,pyramid1 = obj, pyramid2,pyramid3;
    for (var i = 0; i < n; i++) {
	      pyramid = pyramid1.clone();
	      pyramid.geometry.computeBoundingBox();
	      pyramid.position.x += pyramid.geometry.boundingBox.max.x*1.4;
	      pyramid.receiveShadow = true;
	      pyramid.castShadow = true;
	      pyramid.material = new THREE.MeshLambertMaterial({color: 0x6f7883, opacity: 0.1, transparent: true});
	      pyramids.push(pyramid);
	      pyramid3 = pyramid;
	      for (var j = 0; j < n; j++) {
	          pyramid2 = pyramid3.clone();
	          pyramid2.geometry.computeBoundingBox();
	          pyramid2.position.z -= pyramid2.geometry.boundingBox.max.z*1.4;
	          pyramid2.receiveShadow = true;
	          pyramid2.castShadow = true;
	          pyramid2.material = new THREE.MeshLambertMaterial({color: 0x6f7883, opacity: 0.1, transparent: true});
	          pyramids.push(pyramid2);
	          pyramid3 = pyramid2;
	      }
	      pyramid1 = pyramid;
    }


};

function popAndShow() {
    var random_num = Math.floor((Math.random() * pyramids.length));
    var pyramid = pyramids.splice(random_num,1)[0];
    scene.add(pyramid)
    pyramid_buffer.push(pyramid);
}

function animatePyramids() {
    pyramid_buffer.forEach(function(pyramid) {
	      if (pyramid.material.opacity >= 1) {
	          var n = pyramid_buffer.indexOf(pyramid);
	          pyramid_buffer.splice(n,1);
	          finished_pyramids.push(pyramid);
	      }
	      else {
	          pyramid.material.opacity += 0.05;
	          pyramid.position.y += .5;
	      }
    })
}

function animate() {
    requestAnimationFrame(animate);

    if (pyramids.length > 0) popAndShow();
    if (pyramid_buffer.length > 0) animatePyramids();

    renderer.render(scene,camera);
}



eventHandling = function() {
    var handleMouseMove, handleMouseDown, resize, scroll;
    var raycaster = new THREE.Raycaster(), intersection;

    resize = function() {
	      camera.aspect = window.innerWidth / window.innerHeight;
	      camera.updateProjectionMatrix();
	      renderer.setSize( window.innerWidth, window.innerHeight );
    }

    scroll = function() {
	      var x = dir_light.position.x,
	          y = dir_light.position.y,
	          z = dir_light.position.z;

	      var rotSpeed = 0.02;

	      dir_light.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
	      dir_light.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);

    }

    handleMouseMove = function( evt ) {

	      var mouse = new THREE.Vector3((evt.clientX / window.innerWidth) * 2 - 1,
				                              -(evt.clientY / window.innerHeight ) * 2 + 1,
				                              1);

	      raycaster.setFromCamera(mouse,camera);
	      intersection = raycaster.intersectObject( intersect_plane );

	      dir_light.position.set(intersection[0].point.x,intersection[0].point.y,intersection[0].point.z);
    }

    return function() {
	      document.getElementById('viz').addEventListener('mousemove',handleMouseMove );
	      window.addEventListener('scroll', scroll );
	      window.addEventListener('resize', resize);
    }
}();



window.onload = initScene;
