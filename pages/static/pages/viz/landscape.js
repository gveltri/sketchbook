var scene,
    renderer,
    canvas,
    plane,
    counter = 1,
    vectors = [];

var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var _vector = new THREE.Vector3();

var coords = {
    x: -50,
    y: 50,
    z: -100
},
    size_coeff = 0.1,
    size_x = 1000,
    size_y = 1000,
    max_val = 100,
    resolution = 15,
    heightFunction = function(i,j) { return perlin(i/resolution,j/resolution, max_val) * 150; },
    perlin_grid;

var init = function() {

    perlin_grid = buildPerlinGrid(max_val*resolution, heightFunction);

    renderer = new THREE.WebGLRenderer({
        antialias : false,
        alpha: true
    });

    canvas = renderer.domElement;

    renderer.setPixelRatio(2);
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.soft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMapAutoUpdate = true;
    renderer.setClearColor(0xffffff , 1); //0xADDC91

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

    fill = new THREE.DirectionalLight( 0xeeeeee, 0.75 );
    fill.position.set( 500, 200, 500 );
    fill.target.position.copy( scene.position );
    fill.castShadow = true;

    scene.add( fill );


    var height_map = createHeightMap(coords, size_x, size_y, size_coeff, 0x9DE7D7, heightFunction);
    scene.add(height_map);

    for (i=0;i<5;i++) {
        vectors[i]= [];
        for (j=0;j<5;j++) {
            var _v = new THREE.Mesh(new THREE.BoxGeometry(3,50,3),
                                    new THREE.MeshPhongMaterial({color: 0x44FFFF}));
            _v.position.set(_v.position.x+(i*20), _v.position.y,_v.position.z+(j*20))
            vectors[i].push(_v);
            _v.castShadow = true;
            _v.receiveShadow = true;
            scene.add(_v);
        }
    }

    scene.fog = new THREE.FogExp2( 0xffffff, 0.001 );

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', mouseMove);
    requestAnimationFrame( render );


    function createHeightMap(ini_coords, size_x, size_y, size_coeff, color, heightFunction) {
        var rotation = Math.PI/2;

        var geometry = new THREE.PlaneBufferGeometry(size_x, size_y, size_x*size_coeff, size_y*size_coeff),
            mesh = new THREE.MeshPhongMaterial({
                color: color,
                side: THREE.DoubleSide
            });
        plane = new THREE.Mesh(geometry, mesh)

        plane.rotation.x += rotation;
        plane.rotation.z += (Math.PI / 4.5) + (Math.PI);

        plane.position.set(ini_coords.x, ini_coords.y, ini_coords.z);

        return plane;

    }
}

var render = function() {

    var vertices = plane.geometry.attributes.position.clone().array;
    for (i=0;i<vertices.length;i+=3) {
        var j = i/3,
            x = (j%(size_x*size_coeff+1)+counter)%(max_val*resolution),
            y = (Math.floor(j/(size_y*size_coeff+1)))%(max_val*resolution);
        vertices[i+2] = perlin_grid[x][y];
    }
    plane.material.needsUpdate = true;
    plane.material.overdraw=true;
    plane.geometry.attributes.position.needsUpdate = true;
    plane.geometry.attributes.position.array = vertices;
    plane.geometry.computeVertexNormals();
    plane.geometry.computeFaceNormals();
    counter+=1;

    scene.updateMatrixWorld();

    renderer.render( scene, camera); // render the scene
    setTimeout( function() {

        requestAnimationFrame( render );

    }, 1000 / 30 );
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
    var intersections = raycaster.intersectObject(plane);
    if (intersections.length > 0) {
        var point = intersections[0].point;
        for (i=0;i<vectors.length;i++) {
            for (j=0;j<vectors[i].length;j++) {
                vectors[i][j].position.set(point.x+(i*20),point.y+27,point.z+(j*20));
                vectors[i][j].quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), intersections[0].face.normal);
            }
        }
    }
    else if (intersections.length == 0) {
    }

}

var randomArray = function(max) {
    var array = [],
        length = max*2+2;
    for (i=0;i<length;i++) {
        array.push(Math.floor(Math.random()*max));
    }
    return array;
}

var p = randomArray(512);

var perlin = function(x, y, max_val) {

    var x     = repeat(x),
        y     = repeat(y),
        min_x = Math.floor(x),
        min_y = Math.floor(y),
        max_x = repeat(min_x + 1),
        max_y = repeat(min_y + 1),
        aa    = p[p[ min_x ] + min_y],
        ab    = p[p[ min_x ] + max_y],
        ba    = p[p[ max_x ] + min_y],
        bb    = p[p[ max_x ] + max_y];

    var xf = x-min_x,
        yf = y-min_y;

    var u = fade(xf),
        v = fade(yf);

    var n0    = dotGridGradient(aa, xf, yf),
        n1    = dotGridGradient(ba, xf-1, yf),
        ix0   = lerp(n0, n1, u),
        n0    = dotGridGradient(ab, xf, yf-1),
        n1    = dotGridGradient(bb, xf-1, yf-1),
        ix1   = lerp(n0, n1, u),
        value = (lerp(ix0, ix1, v)+1)/2;

    return value;

    function repeat(val) {
        if (val > max_val) {
            console.log(val%max_val);
        }
        return val%max_val;
    }

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

function buildPerlinGrid(max_val, heightFunction) {
    var output = [];
    for (i=0;i<max_val;i+=1) {
        output.push([]);
        for (j=0;j<max_val;j+=1) {
            output[i].push(heightFunction(i,j));
        }
    }
    return output;
}

function buildAxes( length ) {
    var axes = new THREE.Object3D();

    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

    return axes;


}

function buildAxis( src, dst, colorHex, dashed ) {
    var geom = new THREE.Geometry(),
        mat;
    if(dashed) {
        mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
    } else {
        mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
    }
    geom.vertices.push( src.clone() );
    geom.vertices.push( dst.clone() );
    geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines
    var axis = new THREE.Line( geom, mat, THREE.LineSegments );
    return axis;
}

init();
