const keys = [
    ['ArrowLeft', {
        pressed: false,
        newPress: true
    }],
    ['ArrowRight', {
        pressed: false,
        newPress: true
    }],
    ['ArrowUp', {
        pressed: false,
        newPress: true
    }],
    ['ArrowDown', {
        pressed: false,
        newPress: true
    }],
    ['KeyQ', {
        pressed: false,
        newPress: true
    }],
    ['KeyE', {
        pressed: false,
        newPress: true
    }],
    ['KeyX', {
        pressed: false,
        newPress: true
    }],
    ['KeyM', {
        pressed: false,
        newPress: true
    }],
    ['Space', {
        pressed: false,
        newPress: true
    }]
    ,['MouseLeft', {
        pressed: false,
        newPress: true
    }]
];
const keysAlternate = {
    'KeyJ' : 'ArrowLeft' ,
    'KeyA' : 'ArrowLeft' ,
    'KeyL' : 'ArrowRight',
    'KeyD' : 'ArrowRight',
    'KeyI' : 'ArrowUp'   ,
    'KeyW' : 'ArrowUp'   ,
    'KeyK' : 'ArrowDown' ,
    'KeyS' : 'ArrowDown' ,
    'KeyU' : 'KeyQ'      ,
    'KeyO' : 'KeyE'      ,
};

const mouse = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0
};

document.addEventListener('keydown', function (evt) {
    let key = evt.code;
    if (keysAlternate.hasOwnProperty(evt.code)) {
        key = keysAlternate[evt.code];
    }
    for ([keyname,keydata] of keys){
        if(key === keyname){
            keydata.pressed = true;
        }
    }
});
document.addEventListener('mousedown', function (evt) {
    let key = 'MouseLeft';
    for ([keyname,keydata] of keys){
        if(key === keyname){
            keydata.pressed = true;
        }
    }
});

document.addEventListener('mouseup', function (evt) {
    let key = 'MouseLeft';
    for ([keyname,keydata] of keys){
        if(key === keyname){
            keydata.pressed = false;
            keydata.newPress = true;
        }
    }
});


document.addEventListener('keyup', function (evt) {
    let key = evt.code;
    //Check alternate keys
    if (keysAlternate.hasOwnProperty(evt.code)) {
        key = keysAlternate[evt.code];
    }
    for ([keyname,keydata] of keys){
        if(key === keyname){
            keydata.pressed = false;
            keydata.newPress = true;
            //console.log(key, 'released')
        }
    }
});