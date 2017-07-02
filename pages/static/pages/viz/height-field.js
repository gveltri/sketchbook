var scene,
    renderer,

    counter = 1,

    boxes_left = [],

    boxes_left_heights = [],

    group_left = new THREE.Mesh();

var raycaster = new THREE.Raycaster();
var _vector = new THREE.Vector3();

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
    renderer.setClearColor( 0xADDC91, 1);

    document.getElementById('viz').appendChild(renderer.domElement);

    renderer.sortObjects = true;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
    	  35,
    	  window.innerWidth / window.innerHeight,
    	  1,
    	  350
    );

    camera.position.set(100,40,150);
    camera.position.x = camera.position.x * Math.cos(.2) + camera.position.z * Math.sin(.2);
    camera.position.z = camera.position.z * Math.cos(.2) - camera.position.x * Math.sin(.2);
    camera.lookAt({'x':scene.position.x, 'y':scene.position.y+20, 'z':scene.position.z});

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
        x: -200,
        y: 0,
        z: -200
    },
        size = 5,
        repeat_x = 50,
        repeat_y = 50,
        heightFunction = function(i,j) { return (Math.cos(i/5) * 5) + (Math.cos(j/5) * 5) + 15 };

    createBoxes(coords, repeat_x, repeat_y, size, 0x9DE7D7, heightFunction, boxes_left, group_left);
    scene.add( group_left );

    // generate arrays of heights


    for (idx in boxes_left) {
        boxes_left_heights.push(Math.abs(boxes_left[idx].geometry.vertices[0].y ) +
                                Math.abs(boxes_left[idx].geometry.vertices[2].y ));

    }

    window.addEventListener('resize', resize);

    requestAnimationFrame( render );


    function createBoxes(ini_coords, repeat_x, repeat_y, size, color, heightFunction, boxes, group) {
        var buffer = size / 2;
        var rotation = -Math.PI / 128;

        var coords = {
            x: ini_coords.x,
            y: ini_coords.y,
            z: ini_coords.z
        }

        for (i = 0; i < repeat_x; i++) {
            coords.x = ini_coords.x;
            coords.y = ini_coords.y;
            for (j = 0; j < repeat_y; j++) {
                createBox(coords, size, heightFunction(i,j))
                coords.x += size + buffer;
            }
            coords.z += size + buffer;
        }

        function createBox(coords, size, size_z) {
            var box = new THREE.Mesh(
	              new THREE.BoxGeometry( size, size_z, size ),
                new THREE.MeshLambertMaterial({ color: color })
            );

            box.position.set(coords.x, coords.y + (size_z/2), coords.z);
            box.rotation.x += rotation;
            box.castShadow = true;
            box.receiveShadow = true;
            boxes.push( box );
            group.add( box );
        }
    }
}

var render = function() {

    for (idx=0;idx<boxes_left.length;idx++) {
        var x_in = (idx % 50) + counter,
            y_in = (idx / 50),
            new_height = (Math.cos(x_in/5) * 5) + (Math.cos(y_in/5) * 5) + 15,
            new_scale = new_height / boxes_left_heights[idx];

        boxes_left[idx].scale.y = new_scale;
        boxes_left[idx].position.y = new_height/2;
    }
    counter++;
    renderer.render( scene, camera); // render the scene
    requestAnimationFrame( render );
};

var resize = function() {
	  camera.aspect = window.innerWidth / window.innerHeight;
	  camera.updateProjectionMatrix();
	  renderer.setSize( window.innerWidth, window.innerHeight );
}

var mouseMove = function(evt) {
    _vector.set(
        ( evt.clientX / window.innerWidth ) * 2 - 1,
            -( evt.clientY / window.innerHeight ) * 2 + 1,
        1);
    camera.updateProjectionMatrix();
    raycaster.setFromCamera(_vector, camera);
    var intersections = raycaster.intersectObjects( boxes_left );
    if (intersections.length > 0) {
        left_animated = true;
        right_animated = false;
        center_animated = false;
        return
    }
    else if (intersections.length == 0) {
        left_animated = false;
    }

}


init();
