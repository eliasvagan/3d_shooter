const SETTINGS =  {
    renderScale: 1,
    fov: 80
};
const WEAPONS_DIR = "res/guns/";

const canv = document.getElementById("canv");
const guiCanvas = document.getElementById("guiCanvas");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( SETTINGS.fov, window.innerWidth/window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({canvas:canv});

//TODO: FIX LoadObjects
async function loadAssets() {

    const paths = [
        "res/guns/gun1",
        "res/guns/gun2",
    ];

    async function loadPaths(){
        let loadedObjects = [];
        return await paths.forEach(async (path) => {
            await loadObject(path).then(function (object) {
                loadedObjects.push(object);
                console.log("added ", object);
            });
        }).then(function () {
            return(loadedObjects);
        });
    }
    return await loadPaths;
}


async function loadObject(path) {

    let loadMTLPromise = new Promise(function(resolve, reject){
        async function loadMTLDone(materials) {

            materials.preload();

            let loadOBJPromise = new Promise(function (resolve, reject) {
                function loadOBJDone(object) {
                    console.log('Successfully loaded from ', path);

                    resolve(object);
                }

                function loadOBJProgress(xhr) {
                    //console.log((xhr.loaded / xhr.total * 100) + '% loaded .obj');
                }

                function loadOBJFailed(error) {
                    reject('Failed to load from ' + path);
                }

                const objLoader = new THREE.OBJLoader();
                objLoader.setPath("res/guns/");
                objLoader.setMaterials(materials);
                return objLoader.load(path + ".obj", loadOBJDone, loadOBJProgress, loadOBJFailed);
            });

            resolve(await loadOBJPromise);
        }
        function loadMTLProgress(xhr){
            //console.log((xhr.loaded / xhr.total * 100) + '% loaded .mtl');
        }
        function loadMTLFailed(error) {
            reject('Failed to load from ' + path);
        }
        const mtlLoader = new THREE.MTLLoader();
        mtlLoader.setTexturePath("res/guns/");
        mtlLoader.setPath("res/guns/");
        return mtlLoader.load(path + ".mtl", loadMTLDone, loadMTLProgress, loadMTLFailed);
    });

    return await loadMTLPromise;

}

class Player extends THREE.LineSegments{
    constructor(geometry = null, material = null) {
        if (geometry == null) geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1,2,1));
        if (material == null) material = new THREE.LineBasicMaterial( {
            color: 0xff00ff,
            linewidth: 1,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin:  'round' //ignored by WebGLRenderer
        });
        super(geometry,material);

        this.velocityX = 0;
        this.velocityY = 0;
        this.velocityZ = 0;

        // Values between 0 and 10:
        this.moveSpeed = 5;
        this.slowness = 0;
        this.accelleration = 1; //TODO: Fiks accelleration
        this.deaccelleration = 0.18;
        this.maxSpeed = 10;

        this.weapon = null;
        this.weaponOffset = {
            x: 0.3,
            y: -0.4 + 1,
            z: -0.2
        };

        this.camera = null;
        this.camOffset = {
            x: 0,
            y: 0.5,
            z: 0
        };

    }
    setWeapon(object) {
       this.weapon = object;
       this.camera.add(object);
       this.weapon.position.set(this.weaponOffset.x, this.weaponOffset.y, this.weaponOffset.z);
    }
    setCamera(object) {
        this.camera = object;
        this.add(object);
        this.camera.position.set(this.camOffset.x, this.camOffset.y, this.camOffset.z);
    }
    update(dt) {
        //if (this.camera != null) {
        //    this.camera.position.x = this.camPosition.x + this.position.x;
        //    this.camera.position.y = this.camPosition.y + this.position.y;
        //    this.camera.position.z = this.camPosition.z + this.position.z;
        //    this.camera.rotation.y = this.rotation.y;
        //}
        { // User inputs
            let sumx = 0.00,
                sumz = 0.00,
                sumy = 0.00;

            for (const key of keys) {
                let name = key[0],
                    pressed = key[1].pressed,
                    newPress = key[1].newPress;
                if (pressed) {
                    if (name === "ArrowUp") {
                        sumz -= 1
                    }
                    if (name === "ArrowDown") {
                        sumz += 1
                    }
                    if (name === "ArrowRight") {
                        sumx += 1
                    }
                    if (name === "ArrowLeft") {
                        sumx -= 1
                    }
                }
                if (pressed && newPress) {


                }
            }

            this.velocityX = this.velocityX * (1 - this.deaccelleration) + (sumx * this.moveSpeed * this.accelleration);
            this.velocityZ = this.velocityZ * (1 - this.deaccelleration) + (sumz * this.moveSpeed * this.accelleration);

            //Speed cap
            this.velocityX = Math.max(Math.min(this.velocityX, this.maxSpeed), -this.maxSpeed);
            this.velocityZ = Math.max(Math.min(this.velocityZ, this.maxSpeed), -this.maxSpeed);
        }


        //Update position
        {
            debug.addText("Player rotation X: " + this.rotation.x);
            debug.addText("Player rotation Y: " + this.rotation.y);
            debug.addText("Player rotation Z: " + this.rotation.z);
            debug.addText("Camera rotation X: " + camera.rotation.x);
            debug.addText("Camera rotation Y: " + camera.rotation.y);
            debug.addText("Camera rotation Z: " + camera.rotation.z);

            this.translateZ(this.velocityZ * dt);
            this.translateX(this.velocityX * dt);

        }
    }
}

class Debugger {
    constructor(DOMElement) {
        this.tag = DOMElement;
        this.text = "";
    }
    addText(text) {
        this.text += text + "\n";
    }
    clear() {
        this.text = "";
    }
    update() {
        this.tag.innerText = this.text;
    }
}

renderer.setPixelRatio( SETTINGS.renderScale );
renderer.setSize(window.innerWidth, window.innerHeight);
guiCanvas.width = window.innerWidth;
guiCanvas.height = window.innerHeight;
const gui = new GUI(guiCanvas);


const materials = [
    new THREE.MeshBasicMaterial( { color: 0x009023 }),
    new THREE.MeshBasicMaterial( { color: 0x004545 }),

    new THREE.MeshToonMaterial( {color: 0x001010}),
];
const player = new Player();

const cube = new THREE.Mesh(
    new THREE.BoxGeometry( 1, 1, 1 )
    , materials[1]
);
const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry( 1, 1, 1 )
    , materials[2]
);
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(5,10,32),
    materials[2]
);
const debug = new Debugger(document.getElementById('debug'));

floor.receiveShadow = true;
floor.castShadow = true;
const sun = new THREE.DirectionalLight(0xffffff, 10);

async function setup() {
    loadObject('gun2').then(function (result) {
        const weapon = result;

        scene.add(player);
        player.position.set(0,1,0);
        player.setCamera(camera);
        player.setWeapon(weapon);

        scene.add(result);

        sun.position.y = 30;

        floor.rotation.x = -Math.PI / 2;

        scene.add(cube2);
        camera.add(cube);
        scene.add(floor);
        scene.add(sun);

        cube.position.set(0,0,-10);

        guiCanvas.onclick = function() {
            guiCanvas.requestPointerLock();
        };

        camera.rotation.order = "YXZ";
        document.addEventListener('mousemove', updateCameraRotation);
    });


}

let lastTime = Date.now();
let dt = 0.0;
let dtsum = 0.0;

function updateCameraRotation(e) {
    const eulerP = new THREE.Euler( 0, 0, 0, 'YXZ' );
    const eulerC = new THREE.Euler( 0, 0, 0, 'YXZ' );
    const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

    eulerP.setFromQuaternion( player.quaternion );
    eulerC.setFromQuaternion( camera.quaternion );

    eulerP.y -= movementX * 0.002;
    eulerC.x -= movementY * 0.002;

    eulerC.x = Math.max( - Math.PI/2, Math.min( Math.PI/2, eulerC.x ) );
    player.quaternion.setFromEuler( eulerP );
    camera.quaternion.setFromEuler( eulerC );

}

function animate() {
    requestAnimationFrame( animate );
    debug.clear();
    // TIME
    dt = Date.now() - lastTime;
    const fps = Math.floor(1000 / dt);
    dtsum += dt;
    if (dtsum > 500) {
        dtsum = 0;
        gui.setFps(fps);

    }

    lastTime = Date.now();

    player.update(dt / 1000);

    renderer.render(scene, camera);
    gui.render();

    debug.update();
}
setup().then(animate);
