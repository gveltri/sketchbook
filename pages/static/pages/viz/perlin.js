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
    	  1000
    );

    camera.position.set(200,200,300);
    camera.position.x = camera.position.x * Math.cos(.2) + camera.position.z * Math.sin(.2);
    camera.position.z = camera.position.z * Math.cos(.2) - camera.position.x * Math.sin(.2);
    camera.lookAt({'x':scene.position.x, 'y':scene.position.y+20, 'z':scene.position.z});

    am_light = new THREE.AmbientLight( 0x404040 );
    scene.add( am_light );

    fill = new THREE.DirectionalLight( 0x202020, 2.25 );
    fill.position.set( 40, 100, 70 );
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
        heightFunction = function(i,j) { return perlin(i/7,j/7) * 30 };

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
            new_height = perlin(x_in/7,y_in/7) * 30,
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

var p = [151,160,137,91,90,15,
         131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
         190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
         88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
         77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
         102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
         135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
         5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
         223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
         129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
         251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
         49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
         138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

var perlin = function(x,y) {

    var min_x = Math.floor(x),
        min_y = Math.floor(y),
        max_x = Math.floor(x) + 1,
        max_y = Math.floor(y) + 1,
        aa    = p[p[ min_x ] + min_y],
        ab    = p[p[ min_x ] + max_y],
        ba    = p[p[ max_x ] + min_y],
        bb    = p[p[ max_x ] + max_y];

    var u = fade(x-min_x),
        v = fade(y-min_y);

    var n0 = dotGridGradient(x, y, min_x, min_y, aa),
        n1 = dotGridGradient(x, y, max_x, min_y, ba),
        ix0 = lerp(n0, n1, u),
        n0 = dotGridGradient(x, y, min_x, max_y, ab),
        n1 = dotGridGradient(x, y, max_x, max_y, bb),
        ix1 = lerp(n0, n1, u),
        value = (lerp(ix0, ix1, v)+1)/2;

    return value;

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);         // 6t^5 - 15t^4 + 10t^3
    }

    function dotGridGradient(x, y, ix, iy, hash) {

        if (hash % 4 == 0) {
            x_grad = 1;
            y_grad = 1;
        }
        else if (hash % 4 == 1) {
            x_grad = 1;
            y_grad = -1;
        }
        else if (hash % 4 == 2) {
            x_grad = -1;
            y_grad = 1;
        }
        else if (hash % 4 == 3) {
            x_grad = -1;
            y_grad = -1;
        }

        var dx = x - ix,
            dy = y - iy;
        return (dx*x_grad + dy*y_grad)
    }

    function lerp(a0, a1, w) {
        return (1.0 - w)*a0 + w*a1;
    }

}

var randomArray = function(length, max) {
    var array = [];
    for (i=0;i<length;i++) {
        array.push(Math.floor(Math.random()*max));
    }
    return array;
}


init();
