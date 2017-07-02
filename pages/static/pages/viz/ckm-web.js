var scene,
    renderer,

    counter_left = 1,
    counter_center = 1,
    counter_right = 1,

    boxes_left = [],
    boxes_right = [],
    boxes_center = [],

    boxes_left_heights = [],
    boxes_right_heights = [],
    boxes_center_heights = [],

    group_left = new THREE.Mesh(),
    group_center = new THREE.Mesh(),
    group_right = new THREE.Mesh(),

    left_animated = false,
    center_animated = false,
    right_animated = false;


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
    renderer.setClearColor( 0x22222, 1);

    document.getElementById('viz').appendChild(renderer.domElement);

    renderer.sortObjects = true;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
    	  35,
    	  window.innerWidth / window.innerHeight,
    	  1,
    	  350
    );

    camera.position.set(70,40,110);
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
        x:0,
        y:0,
        z:0
    },
        repeat_x = 20,
        repeat_y = 20,
        size = 1,
        heightFunction = function(i,j) { return (Math.cos(i/5) * 2) + (Math.cos(j/5) * 2) + 6 };

    createBoxes(coords, repeat_x, repeat_y, size, 0xBB2244, heightFunction, boxes_center, group_center);
    scene.add( group_center );

    var coords = {
        x:30,
        y:0,
        z:-30
    },
        heightFunction = function(i,j) { return (Math.cos(i/5) * 3) + (Math.sin(j/5) * 3) + 6 };

    createBoxes(coords, repeat_x, repeat_y, size, 0xBB2244, heightFunction, boxes_right, group_right);
    scene.add( group_right );

    var coords = {
        x:-30,
        y:0,
        z:30
    },
        size = 0.5,
        repeat_x = 40,
        repeat_y = 40,
        heightFunction = function(i,j) { return (Math.cos(i/4) * 2) + (Math.cos(j/4) * 2) + 6 };

    createBoxes(coords, repeat_x, repeat_y, size, 0xBB2244, heightFunction, boxes_left, group_left);
    scene.add( group_left );

    // generate arrays of heights


    for (idx in boxes_left) {
        boxes_left_heights.push(Math.abs(boxes_left[idx].geometry.vertices[0].y ) +
                                Math.abs(boxes_left[idx].geometry.vertices[2].y ));

    }

    for (idx in boxes_center) {
        boxes_center_heights.push(Math.abs(boxes_center[idx].geometry.vertices[0].y ) +
                                  Math.abs(boxes_center[idx].geometry.vertices[2].y ));
    }

    for (idx in boxes_right) {
        boxes_right_heights.push(Math.abs(boxes_right[idx].geometry.vertices[0].y ) +
                                  Math.abs(boxes_right[idx].geometry.vertices[2].y ));
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', mouseMove);

    requestAnimationFrame( render );


    function createBoxes(ini_coords, repeat_x, repeat_y, size, color, heightFunction, boxes, group) {
        var buffer = size / 5;
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

    if (left_animated) {
        for (idx=0;idx<boxes_left.length;idx++) {
            var x_in = (idx % 40) + counter_left,
                y_in = (idx / 40),
                new_height = (Math.cos(x_in/4) * 2 + Math.cos(y_in/4) * 2) + 6,
                new_scale = new_height / boxes_left_heights[idx];

            boxes_left[idx].scale.y = new_scale;
            boxes_left[idx].position.y = new_height/2;
        }
        counter_left++;
    }

    if (center_animated) {
        for (idx=0;idx<boxes_center.length;idx++) {
            var x_in = (idx % 20) + counter_center,
                y_in = (idx / 20) + counter_center,
                new_height = (Math.cos(x_in/5) * 2) + (Math.cos(y_in/5) * 2) + 6,
                new_scale = new_height / boxes_center_heights[idx];

            boxes_center[idx].scale.y = new_scale;
            boxes_center[idx].position.y = new_height/2;
        }
        counter_center++;
    }

    if (right_animated) {
        for (idx=0;idx<boxes_right.length;idx++) {
            var x_in = (idx % 20),
                y_in = (idx / 20),
                new_height = (Math.cos(y_in/5) * 3) + (Math.sin(x_in/5) * 3) + 6 + (Math.random()-0.5)*0.5,
                new_scale = new_height / boxes_right_heights[idx];

            boxes_right[idx].scale.y = new_scale;
            boxes_right[idx].position.y = new_height/2;
        }
        counter_right++;
    }

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

    intersections = raycaster.intersectObjects( boxes_center );
    if (intersections.length > 0) {
        center_animated = true;
        right_animated = false;
        left_animated = false;
        return
    }
    else if (intersections.length == 0) {
        center_animated = false;
    }

    intersections = raycaster.intersectObjects( boxes_right );
    if (intersections.length > 0) {
        right_animated = true;
        center_animated = false;
        left_animated = false;
        return
    }
    else if (intersections.length == 0) {
        right_animated = false;
        for (idx in boxes_right){
            boxes_right[idx].scale.y = 1;
            boxes_right[idx].position.y = boxes_right_heights[idx]/2;
        }
    }
}


init();
