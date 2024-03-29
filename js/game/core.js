const SETTINGS =  {
    renderScale: 1,
    fov: 80,
    debug: true
};
const WEAPONS_DIR = "/assets/guns/";
const KEY_LISTENERS = [
    
];

const canv = document.getElementById("canv");
const guiCanvas = document.getElementById("guiCanvas");
const loadingScreen = document.getElementById("loadingScreen");
const loadingBar = document.getElementById("loadingBar");



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( SETTINGS.fov, window.innerWidth/window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({canvas:canv});
//const colliderSystem  = new THREEx.ColliderSystem();

async function loadAssets() {

    const loadedObjects = [];
    let loadedIndex = 0;
    let loadedLength = weapons.length; //TODO: Expand for loading bar

    for (const weapon of weapons) {
        await loadObject(weapon.name).then(function (result) {
            loadedIndex ++;
            loadingBar.style.width = (loadedIndex / loadedLength) * 100 + '%';

            result.scale.set(weapon.scale, weapon.scale, weapon.scale);
            const weaponObject = new Weapon(result);
            weaponObject.offset = weapon.offset;
            loadedObjects.push(weaponObject);
        });
    }


    return Promise.all(loadedObjects);
}


async function loadObject(path) {

    let loadMTLPromise = new Promise(function(resolve, reject){
        async function loadMTLDone(materials) {
            materials.preload();

            let loadOBJPromise = new Promise(function (resolve, reject) {
                function loadOBJDone(object) {
                    // console.log('Successfully loaded from ', path);
                    //object.children[0].material.side = 2;
                    resolve(object);
                }

                function loadOBJProgress(xhr) {
                    //console.log((xhr.loaded / xhr.total * 100) + '% loaded .obj');

                }

                function loadOBJFailed(error) {
                    reject('Failed to load from ' + path);
                }

                const objLoader = new THREE.OBJLoader();
                objLoader.setPath("/3d_shooter/assets/models/");
                objLoader.setMaterials(materials);
                return objLoader.load(path + ".obj", loadOBJDone, loadOBJProgress, loadOBJFailed);
            });

            resolve(await loadOBJPromise);
        }
        function loadMTLProgress(xhr){
            //console.log((xhr.loaded / xhr.total * 100) + '% loaded .mtl');
            //loadingBar.style.width = xhr.loaded / xhr.total * 100 + '%';
        }
        function loadMTLFailed(error) {
            console.log(error);
            reject('Failed to load from ' + error.target.responseURL);
        }
        const mtlLoader = new THREE.MTLLoader();
        //mtlLoader.setTexturePath("/3d_shooter/assets/textures/"); //TODO: Finn ut om denne er nødvendig
        mtlLoader.setPath("/3d_shooter/assets/models/");
        return mtlLoader.load(path + ".mtl", loadMTLDone, loadMTLProgress, loadMTLFailed);
    });

    return await loadMTLPromise;

}

class Gameobject {
    constructor(model) {
        this.model = model;
        this.velocity = {
            x: 0,
            y: 0,
            z: 0,
        };
    }
    addToScene(specifiedScene = scene) {
        specifiedScene.add(this.model);
    }
    removeFromScene() {
        scene.remove(this.model);
    }
    update(dt) {
        // Careful with this one
    }
}

class Weapon extends Gameobject {
    constructor(model) {
        super(model);
        this.model.layers.set(1);
        this.matrixAutoUpdate = true;
        this.recoil = 10;
        this.offset = {
            x: 0,
            y: 0,
            z: 0
        };
        this.swayPos = {
            x: 0,
            y: 0,
            z: 0
        };
    }
    sway(vx, vy, vz) {
        const swayConstant = 0.01;
        this.velocity.x += -vx * swayConstant;
        this.velocity.y += -vy * swayConstant * 2;
        this.velocity.z += -vz * swayConstant;
    }
    fire() {
        this.sway(0,0,-this.recoil);
    }
    update(dt) {
        super.update(dt);
        let rs = dt * 10;
        rs = Math.min(rs, 0.8);

        this.velocity.x *= (1 - rs);
        this.velocity.y *= (1 - rs);
        this.velocity.z *= (1 - rs);

        const fixSpeed = 9;

        this.swayPos.x += (this.velocity.x - this.swayPos.x) * dt * fixSpeed;
        this.swayPos.y += (this.velocity.y - this.swayPos.y) * dt * fixSpeed;
        this.swayPos.z += (this.velocity.z - this.swayPos.z) * dt * fixSpeed;

        this.model.position.set(
            this.offset.x + this.swayPos.x,
            this.offset.y + this.swayPos.y,
            this.offset.z + this.swayPos.z
        );
    }

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

        //this.collider = THREEx.Collider.createFromObject3d(this);

        this.velocity = {
            x: 0,
            y: 0,
            z: 0,
            x0: 0,
            y0: 0,
            z0: 0,
        };

        // Values between 0 and 10:
        this.moveSpeed = 5;
        this.slowness = 0;
        this.accelleration = 1; //TODO: Fiks accelleration
        this.deaccelleration = 0.18;
        this.maxSpeed = 10;
        this.jumpSpeed = 12;
        this.isOnGround = false;
        this.keys = [];

        this.weapon = null;

        this.camera = null;
        this.camOffset = {
            x: 0,
            y: 0.5,
            z: 0
        };

    }
    setWeapon(weapon) {
       this.weapon = weapon;
       //console.log("Set weapon to", weapon);
       this.camera.add(weapon.model);
    }
    setCamera(object) {
        this.camera = object;
        this.add(object);
        this.camera.position.set(this.camOffset.x, this.camOffset.y, this.camOffset.z);
    }

    update(dt) {
        { // User inputs
            let sumx = 0.00,
                sumz = 0.00,
                sumy = 0.00;

            this.velocity.x0 = this.velocity.x;
            this.velocity.y0 = this.velocity.y;
            this.velocity.z0 = this.velocity.z;

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

                    key[1].newPress = false;
                }
                if (pressed && newPress) {
                    if (name === 'Space' && this.isOnGround) {
                        this.velocity.y += this.jumpSpeed;
                    }
                    if (name === 'MouseLeft') {
                        this.weapon.fire();
                    }
                }
            }

            this.velocity.x = this.velocity.x * (1 - this.deaccelleration) + (sumx * this.moveSpeed * this.accelleration);
            this.velocity.z = this.velocity.z * (1 - this.deaccelleration) + (sumz * this.moveSpeed * this.accelleration);

            //Speed cap
            this.velocity.x = Math.max(Math.min(this.velocity.x, this.maxSpeed), -this.maxSpeed);
            this.velocity.z = Math.max(Math.min(this.velocity.z, this.maxSpeed), -this.maxSpeed);
        }

        // TODO: Gravity
        {
            this.isOnGround = this.position.y -1 < 0; // Predicate for not falling

            if (this.isOnGround) {
                this.velocity.y = Math.max(this.velocity.y, 0);
            } else {
                this.velocity.y -= dt * 20;
            }
        }


        //Update position
        {
            this.translateZ(this.velocity.z * dt);
            this.translateX(this.velocity.x * dt);
            this.translateY(this.velocity.y * dt);
        }

        //Update weapon
        if (this.weapon != null) {
            this.weapon.sway(
                this.velocity.x - this.velocity.x0,
                this.velocity.y - this.velocity.y0,
                this.velocity.z - this.velocity.z0,
            );
            this.weapon.update(dt);
        }

        // DEBUG
        {
            debug.addText("Player speed X: " + this.velocity.x);
            debug.addText("Player speed Y: " + this.velocity.y);
            debug.addText("Player speed Z: " + this.velocity.z);
            debug.addText("Player position X: " + this.position.x);
            debug.addText("Player position Y: " + this.position.y);
            debug.addText("Player position Z: " + this.position.z);
            debug.addText("Camera rotation X: " + camera.rotation.x);
            debug.addText("Camera rotation Y: " + camera.rotation.y);
            debug.addText("Camera rotation Z: " + camera.rotation.z);
        }
    }
}

class Floor extends Gameobject {
    constructor(model) {
        super(model);
    }
    update(dt) {
        super.update(dt);
    }
    isColliding(object) {
        // TODO: Return if colliding.
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

function loadLevel(seed) {
    const scale = 4;
    const dungeon = generateDungeon(seed);
    const geom = new THREE.PlaneGeometry(scale,scale,0);
    const hasCeiling = true;
    const wallHeight = 1;
    for (const tile of dungeon.floor) {
        const tile3d = new THREE.Mesh(geom, materials[0]);
        tile3d.position.set(tile.x * scale, tile.z * scale , tile.y * scale);
        tile3d.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(tile3d);
        if (hasCeiling) {
            const tileCeil = new THREE.Mesh(geom, materials[3]);
            tileCeil.position.set(tile.x * scale, (tile.z + wallHeight) * scale , tile.y * scale);
            tileCeil.rotation.set(Math.PI / 2, 0, 0);
            scene.add(tileCeil);
        }
    }
    for (const wall of dungeon.walls) {
        const wall3d = new THREE.Mesh(
            new THREE.PlaneGeometry(scale, scale * wallHeight, 0),
            materials[1]
        );
        let offset = {x: 0, y: 0, z: 0.5 * wallHeight};
        let rotation = 0;
        switch(wall.dir) {
            case 0: offset.x =  0.5; rotation =  Math.PI / 2; break;
            case 1: offset.x = -0.5; rotation = -Math.PI / 2; break;
            case 2: offset.y =  0.5; rotation = 0           ; break;
            case 3: offset.y = -0.5; rotation = Math.PI     ; break;
        }
        wall3d.position.set((wall.x + offset.x) * scale, (wall.z + offset.z) * scale, (wall.y + offset.y) * scale);
        wall3d.rotation.set(0, rotation, 0);
        scene.add(wall3d);
    }
}

renderer.setPixelRatio( SETTINGS.renderScale );
renderer.setSize(window.innerWidth, window.innerHeight);
guiCanvas.width = window.innerWidth;
guiCanvas.height = window.innerHeight;
const gui = new GUI(guiCanvas);


const materials = [
    new THREE.MeshLambertMaterial( { color: 0x202020 }),
    new THREE.MeshLambertMaterial( { color: 0x004545 }),
    new THREE.MeshToonMaterial( {color: 0x001010}),
    new THREE.MeshPhongMaterial({color: 0x303030})
];
const player = new Player();

const cube = new THREE.Mesh(
    new THREE.BoxGeometry( 1, 1, 1 )
    , materials[1]
);
const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry( 1, 2, 1 )
    , materials[2]
);
const debug = new Debugger(document.getElementById('debug'));

async function setup() {
    loadAssets().then(function (result) {
        // Close loadingScreen
        {
            loadingScreen.style.display = 'collapse';
            loadingScreen.style.opacity = '0';
            loadingScreen.style.visibility = 'hidden';

        }
        // Load level
        {
            const seed = '1194102954224635865693711207655333565708828110232161419435682251143507696248049725972329618274334262';
            console.log('Seed:',  seed);

            loadLevel(seed);
        }

        // scene.fog = new THREE.Fog(0x000000, 0, 25);
        const weapon = result[1];
        camera.layers.enable(1);

        scene.add(player);
        player.position.set(0,10,0).normalize();
        player.setCamera(camera);
        player.setWeapon(weapon);

        cube2.position.y = 0.5;

        const keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
        keyLight.position.set(-100, 0, 100);

        const fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
        fillLight.position.set(100, 0, 100);

        const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
        backLight.position.set(100, 0, -100).normalize();

        const playerLight = new THREE.DirectionalLight(0xffffff, 1.0); //todo: FIX
        playerLight.position.set(15,1,-10);
        //scene.add(playerLight);
        player.add(playerLight);

        scene.add(keyLight);
        scene.add(fillLight);
        scene.add(backLight);

        scene.add(cube2);

        guiCanvas.onclick = function() {
            guiCanvas.requestPointerLock();
        };
        KEY_LISTENERS.push(player);

        // collider2 = new THREEx.Collider.createFromObject3d(cube);
        // onCollideEnter = player.collider.addEventListener('contactEnter', function (otherCollider) {
        //     console.log(otherCollider);
        // });

        camera.rotation.order = "YXZ";
        document.addEventListener('mousemove', updateCameraRotation);

        animate();
    });
}

let globalTime = {
    lastTime: Date.now(),
    dt: 0.0,
    dtSum: 0.0,
    timeScale: 1.0
};

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

    // Global time slow experimenting
    for (const key of keys) {
        let name = key[0],
            pressed = key[1].pressed,
            newPress = key[1].newPress;

        if (name === "KeyX") {
            globalTime.timeScale = pressed ? 0.0 : 1.0;
        }
    }

    // Global time calculation
    const fps = Math.floor(1000 / (Date.now() - globalTime.lastTime));
    globalTime.dt = (Date.now() - globalTime.lastTime) * globalTime.timeScale;
    globalTime.dtSum += globalTime.dt;
    if (globalTime.dtSum > 500) {
        globalTime.dtSum = 0;
        gui.setFps(fps);
    }

    globalTime.lastTime = Date.now();

    player.update(globalTime.dt / 1000);
    //colliderSystem.computeAndNotify([player.collider, collider2]);

    renderer.render(scene, camera);
    gui.render();

    debug.update();
}
setup();