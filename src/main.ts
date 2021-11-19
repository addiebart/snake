//! main.ts for gh:edbart/snake | https://edbart.github.io/snake/, https://github.com/edbart/ | (c) 2020 edbart.
'use strict';

import Phaser = require('phaser');

document.addEventListener('DOMContentLoaded', () => {

const getCookie = (name: String) => {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
}

const setCookie = (key: String, value: String) => {
    document.cookie = key+'='+value+';max-age=31536000'
}

// event handlers
const optbtn = document.getElementById('optionsBtn'),
aboutBtn = document.getElementById('aboutBtn'),
dimBg = document.getElementById('dimBg'),
optDiv = document.getElementById('optionsDiv'),
closeBtns = Array.from(document.getElementsByClassName('closePopup')) as HTMLElement[],
aboutDiv = document.getElementById('aboutDiv'),
sfxInput = document.getElementById('sfxVolume') as HTMLInputElement,
sfxLbl = document.getElementById('sfxVolumePct');

const closeAll = (dimBgOff = true) => {
    const toClose = Array.from(document.getElementsByClassName('popupMenu')) as HTMLElement[];
    toClose.forEach(element => {
        element.hidden = true;
    });
    if (dimBgOff) {
        dimBg.hidden = true;
    }
}

// options button
optbtn.addEventListener('click', () => {
    dimBg.hidden = false;
    optDiv.hidden = false;
});

// about button
aboutBtn.addEventListener('click', () => {
    dimBg.hidden = false;
    aboutDiv.hidden = false;
});

// dim background, closes menus
dimBg.addEventListener('click', () => {
    closeAll();
});

// close buttons
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {closeAll();});
});

// sfx volume 
sfxInput.addEventListener('input', () => {
    sfxLbl.textContent = sfxInput.value;
    setCookie('sfxVolume', sfxInput.value); // read cookie later
    game.sfxVolumeStr = sfxInput.value;
    game.sfxVolume = Number(sfxInput.value);
});

// end event handlers

interface Coord {
    x: number,
    y: number
}

var game = {
    sfxVolume: Number(getCookie('sfxVolume')) || 50,
    sfxVolumeStr: getCookie('sfxVolume') || '50',
    gamepad: {
        flag: Number(getCookie('gamepadFlag')) === 1 || false, //change from cookie to autodetect presence of controller with GameControllerAPI
        type: getCookie('gamepadType') || null
    },
    input: {
        up: 'up',
        down: 'down',
        left: 'left',
        right: 'right'
    },
    gameSpeed: Number(getCookie('gameSpeed')) || 2, // 1, 2, 3, 4
    gridSize: Number(getCookie('gridSize')) || 2, // 1, 2, 3
    darkmode: (() => { // true, false, undefined
        const cookie = getCookie('snakeDarkMode');
        switch (cookie) {case '0': return false; case '1': return true; default: return null;}
    })(),
    highScore: {
        overall: Number(getCookie('snakeOvHs')) || 0
    },
    stdTiles: Number(getCookie('stdTiles')) === 1 || false,
    getPoint: (x?: integer, y?: integer): Coord => {
        var out: Coord = {x: null, y: null};
        out.x = ((phaserConfig.width as number)/10)*(x);
        out.y = ((phaserConfig.height as number)/10)*(y);
        return out;
    },
    obj: {
        bgTiles: {},
        layers: {
            bg: null as Phaser.GameObjects.Layer
        }
    },
    handle: () => {
        sfxInput.value = game.sfxVolumeStr;
        sfxLbl.textContent = game.sfxVolumeStr;
    }
}

var phaserConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.CANVAS,
    canvas: document.getElementById('canvas') as HTMLCanvasElement,
    width: 1600,
    height: 1600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

game.handle();

var phaserGame = new Phaser.Game(phaserConfig);

function preload (this: Phaser.Scene) {
    
    this.load.setBaseURL(location.protocol+'//'+location.host+location.pathname+'/phaser/');
    this.load.spritesheet('snake', '16x16.png', {
        frameWidth: 16,
        frameHeight: 16,
        startFrame: 0,
        endFrame: 24
    });
    this.load.spritesheet('playBtn', '32x16.png', {
        frameWidth: 32,
        frameHeight: 16,
        startFrame: 0,
        endFrame: 9
    });
}

function create (this: Phaser.Scene) {

    for (var x = 0; x < 10; x++) {
        for (var y = 0; y < 10; y++) {
            game.obj.bgTiles['t'+x.toString()+'_'+y.toString()] = this.add.sprite(game.getPoint(x,y).x, game.getPoint(x,y).y, 'snake', (() => { // tile (0, 0) stored as game.bgTiles.t0_0
                if (game.stdTiles) {return 15;} else {return Phaser.Math.Between(14, 19);}
            })()).setOrigin(0, 0).setScale(10, 10);
            game.obj.bgTiles['t'+x.toString()+'_'+y.toString()].setDepth(-1);
        }
    }

    this.anims.create({
        key: 'blaze',
        frameRate: 8,
        frames: this.anims.generateFrameNumbers('playBtn', { start: 0, end: 5 }),
        repeat: -1
    });

    var start = this.add.sprite(game.getPoint(3,6).x, game.getPoint(3,6).y, 'playBtn', 0).setOrigin(0, 0).setScale(20, 20).setInteractive();
    start.setDepth(1);
    start.on('pointerover', () => {start.play('blaze');}).on('pointerout', () => {start.stop();});

    var startLbl = this.add.sprite(game.getPoint(4,8).x, game.getPoint(4,8).y, 'playBtn', (() => {
        switch (game.gamepad.type) {
            case 'xinput': return 8;
            case 'standard': return 9;
            default: return 6;
        }
    })()).setOrigin(0, 0).setScale(10, 10);
    startLbl.setDepth(1);
    if (!game.gamepad.flag) {
        this.anims.create({
            key: 'startBlink',
            frameRate: 4,
            frames: this.anims.generateFrameNumbers('playBtn', { start: 6, end: 7 }),
            repeat: -1
        });
        startLbl.play('startBlink');
    }

    function startBtn() {
        start.destroy();
        startLbl.destroy();
        gameProcess();
    }

    start.on('click', startBtn);
    // controller.addListener()

    function gameProcess() {

    }
}

function update() {
    
}

global.$__game = game;
}); // ends DOMContentLoaded