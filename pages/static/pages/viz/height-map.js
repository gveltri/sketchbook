var scene,
    renderer,
    canvas,
    plane,
    counter = 1;

var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var _vector = new THREE.Vector3();

var init = function() {

    renderer = new THREE.WebGLRenderer({
        antialias : false,
        alpha: true
    });

    canvas = renderer.domElement;

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
    	  1100
    );

    camera.position.set(200,200,300);
    camera.position.x = camera.position.x * Math.cos(.2) + camera.position.z * Math.sin(.2);
    camera.position.z = camera.position.z * Math.cos(.2) - camera.position.x * Math.sin(.2);
    camera.lookAt({'x':scene.position.x, 'y':scene.position.y+20, 'z':scene.position.z});

    am_light = new THREE.AmbientLight( 0x404040 );
    scene.add( am_light );

    fill = new THREE.DirectionalLight( 0x202020, 2.25 );
    fill.position.set( -100, 200, -100 );
    fill.target.position.copy( scene.position );
    fill.castShadow = true;
    fill.shadowCameraVisible = true;
    scene.add( fill );

    var hemLight = new THREE.HemisphereLight(0x505054, 0xd4e2f9, .99);
    scene.add(hemLight);

    var coords = {
        x: -200,
        y: -100,
        z: -200
    },
        size = 0.1,
        repeat_x = 500,
        repeat_y = 500,
        heightFunction = function(i,j) { return perlin(i/7,j/7) * 50 };

    createHeightMap(coords, repeat_x, repeat_y, size, 0x9DE7D7, heightFunction);

    window.addEventListener('resize', resize);
    requestAnimationFrame( render );


    function createHeightMap(ini_coords, size_x, size_y, size_coeff, color, heightFunction) {
        var rotation = Math.PI/2;

        var geometry = new THREE.PlaneBufferGeometry(size_x, size_y, size_x*size_coeff, size_y*size_coeff),
            mesh = new THREE.MeshLambertMaterial({
                color: color,
                side: THREE.DoubleSide,
                wireframe: true
            });
        plane = new THREE.Mesh(geometry, mesh)
        plane.position.set(ini_coords.x, ini_coords.y, ini_coords.z);
        var vertices = geometry.attributes.position.clone().array;
        for (i=0;i<vertices.length;i+=3) {
            var j = i/3,
                x = j%(size_x*size_coeff+1),
                y = j/(size_y*size_coeff);
            vertices[i+2] = vertices[i+2]+ heightFunction(x,y);
        }

        mesh.needsUpdate = true;
        geometry.buffersNeedUpdate = true;
        plane.geometry.attributes.position.array = vertices;
        plane.geometry.computeVertexNormals();

        plane.castShadow = true;
        plane.receiveShadow = true;

        plane.rotation.x += rotation;

        scene.add(plane);

    }
}

var render = function() {

    plane.rotation.z += Math.PI / 360;

    heightFunction = function(i,j) { return perlin(i/7,j/7) * 50 };

    var size_x = 500,
        size_y = 500,
        size_coeff = 0.1;

    var vertices = plane.geometry.attributes.position.clone().array;
    for (i=0;i<vertices.length;i+=3) {
        var j = i/3,
            x = (j+counter)%(size_x*size_coeff+1),
            y = (j/(size_y*size_coeff));
        vertices[i+2] = heightFunction(x,y);
    }
    plane.geometry.attributes.position.needsUpdate = true;
    plane.geometry.attributes.position.array = vertices;
    counter+=1;

    renderer.render( scene, camera); // render the scene
    setTimeout( function() {

        requestAnimationFrame( render );

    }, 1000 / 30 );
    //requestAnimationFrame( render );
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

var randomArray = function(length, max) {
    var array = [];
    for (i=0;i<length;i++) {
        array.push(Math.floor(Math.random()*max));
    }
    return array;
}


var p = randomArray(512, 255);

var perlin = function(x,y) {

    var min_x = Math.floor(x),
        min_y = Math.floor(y),
        max_x = min_x + 1,
        max_y = min_y + 1,
        aa    = p[p[ min_x ] + min_y],
        ab    = p[p[ min_x ] + max_y],
        ba    = p[p[ max_x ] + min_y],
        bb    = p[p[ max_x ] + max_y];

    var xf = x-min_x,
        yf = y-min_y;

    var u = fade(xf),
        v = fade(yf);

    var n0 = dotGridGradient(aa, xf, yf),
        n1 = dotGridGradient(ba, xf-1, yf),
        ix0 = lerp(n0, n1, u),
        n0 = dotGridGradient(ab, xf, yf-1),
        n1 = dotGridGradient(bb, xf-1, yf-1),
        ix1 = lerp(n0, n1, u),
        value = (lerp(ix0, ix1, v)+1)/2;

    return value;

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);         // 6t^5 - 15t^4 + 10t^3
    }

    function dotGridGradient(hash, xf, yf) {

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

        return (xf*x_grad) + (yf*y_grad)
    }

    function lerp(a0, a1, w) {
        return (1.0 - w)*a0 + w*a1;
    }

}



function writeCoordsAt(vec) {

    var pos = toXYCoords(vec);

    var text2 = document.createElement('div');
    text2.style.position = 'absolute';
    text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
    text2.style.width = 100;
    text2.style.height = 100;
    text2.style.fontSize = "xx-small";
    text2.style.color = "blue";
    text2.innerHTML = vec.z.toFixed(2).toString();
    text2.style.top = pos.x + 'px';
    text2.style.left = pos.y + 'px';
    document.body.appendChild(text2);

    function toXYCoords (pos) {
        var vector = pos.project(camera);
        vector.x = (vector.x + 1)/2 * window.innerWidth;
        vector.y = -(vector.y - 1)/2 * window.innerHeight;
        return vector;
    }
}


init();
