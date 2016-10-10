var scene,
    renderer,
    boxes_large = [],
    boxes_small = [],
    solo_box = [],
    counter = 0,
    forward = true;

var init = function() {

    renderer = new THREE.WebGLRenderer({
        antialias : false,
        alpha: true
    });

    renderer.setPixelRatio(2);
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.soft = true;
    renderer.shadowMap.type = THREE.SoftShadowMap;
    renderer.shadowMapAutoUpdate = true;
    renderer.setClearColor( 0xFFFFFF, 0);

    document.getElementById('viz').appendChild(renderer.domElement);

    renderer.sortObjects = true;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
    	  35,
    	  window.innerWidth / window.innerHeight,
    	  1,
    	  350
    );

    camera.position.set(120,50,90);
    camera.position.x = camera.position.x * Math.cos(.2) + camera.position.z * Math.sin(.2);
    camera.position.z = camera.position.z * Math.cos(.2) - camera.position.x * Math.sin(.2);
    camera.lookAt(scene.position);

    am_light = new THREE.AmbientLight( 0x404040 );
    scene.add( am_light );

    fill = new THREE.DirectionalLight( 0x202020, 2.25 );
    fill.position.set( 40, 45, 70 );
    fill.target.position.copy( scene.position );
    fill.castShadow = true;
    scene.add( fill );

    var hemLight = new THREE.HemisphereLight(0x505054, 0xd4e2f9, .99);
    scene.add(hemLight);

    var coords = {
        x:-120,
        y:-50,
        z:10
    },
        repeat_x = 20,
        repeat_z = 20,
        size = 10;

    createBoxes(coords,repeat_x, repeat_z, size, boxes_large, 0xBB2244);

    var coords = {
        x:-120,
        y:-50,
        z:10
    },
        repeat_x = 40,
        repeat_z = 40,
        size = 5;

    createBoxes(coords, repeat_x, repeat_z, size, boxes_small, 0x99BBFF);

    var coords = {
        x:0,
        y:0,
        z:50
    },
        repeat_x = 1,
        repeat_z = 1,
        size = 7;

    createBoxes(coords, repeat_x, repeat_z, size, solo_box, 0xFF77FF);

    scene.fog = new THREE.FogExp2( 0xefd1b5, 0.005 );

    window.addEventListener('resize', resize);

    requestAnimationFrame( render );


    function createBoxes(ini_coords, repeat_x, repeat_z, size, boxes, color) {
        var buffer = size / 5;
        var rotation = -Math.PI / 128;

        var geometry = new THREE.BoxGeometry( size, size, size ),
            mesh = new THREE.MeshLambertMaterial({ color: color });

        var coords = {
            x: ini_coords.x,
            y: ini_coords.y,
            z: ini_coords.z
        }

        for (i = 0; i < repeat_x; i++) {
            coords.x = ini_coords.x;
            coords.z = ini_coords.z;
            for (j = 0; j < repeat_z; j++) {
                createBox(coords, size)
                coords.x += size + buffer;
                coords.z += Math.cos(i+j) * 5;
            }
            coords.y += size + buffer;
        }

        function createBox(coords, size) {
            rotation += -Math.PI / 128;
            var box = new THREE.Mesh(
	              geometry,
                mesh
            );

            box.position.set(coords.x, coords.y, coords.z);
            box.rotation.x += rotation;
            box.castShadow = true;
            box.receiveShadow = true;

            scene.add( box );
            boxes.push( box );
        }
    }
}

var render = function() {
    counter += 1;

    for (i=0;i<boxes_small.length;i++) {
        boxes_small[i].rotation.x += -Math.PI / 128;
        boxes_small[i].rotation.y += -Math.PI / 128;
    }

    for (i=0;i<boxes_large.length;i++) {
        boxes_large[i].rotation.x += Math.PI / 254;
    }

    for (i=0;i<solo_box.length;i++) {
        solo_box[i].rotation.y += Math.PI / 90;
    }

    renderer.render( scene, camera); // render the scene
    requestAnimationFrame( render );
};

var resize = function() {
	  camera.aspect = window.innerWidth / window.innerHeight;
	  camera.updateProjectionMatrix();
	  renderer.setSize( window.innerWidth, window.innerHeight );
}


init();
