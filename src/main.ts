//! main.ts for gh:addiebart/snake | https://addiebart.github.io/snake/, https://github.com/addiebart/ | (c) 2020 addiebart.
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
    snake: [] as Phaser.GameObjects.Sprite[],
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
    obj: {
        bgTiles: {},
        layers: {
            bg: null as Phaser.GameObjects.Layer
        }
    },
    updateCycle: 0,
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
        endFrame: 13
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
            game.obj.bgTiles['t'+x.toString()+'_'+y.toString()] = this.add.sprite(x*160, y*160, 'snake', (() => { // tile (0, 0) stored as game.bgTiles.t0_0
                if (game.stdTiles) {return 15;} else {return Phaser.Math.Between(4, 9);}
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

    var start = this.add.sprite(3*160, 6*160, 'playBtn', 0).setOrigin(0, 0).setScale(20, 20).setInteractive();
    start.setDepth(1);
    start.on('pointerover', () => {start.play('blaze');}).on('pointerout', () => {start.stop();});

    var startLbl = this.add.sprite(4*160, 8*160, 'playBtn', (() => {
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

    start.on('pointerup', startBtn);
    // controller.addListener()

    var gameProcess = () => {
        var head = this.add.sprite(4*160, 3*160, 'snake', 0);
        var body = this.add.sprite(4*160, 4*160, 'snake', 1);
        var tail = this.add.sprite(4*160, 5*160, 'snake', 3);
        var snake = game.snake;
        snake.splice(0, 0, head, body, tail);
        snake.forEach(it => it.setDepth(10).setOrigin(0, 0).setScale(10, 10));
    }
}

function update() {
    var snake = game.snake;
    if (game.updateCycle%10 === 2) {
        snake.forEach(it => {
            var step1 = (((it.y/160)-1)*160); // -1 for 0
            var step2: number;
            if (step1 < 0) step2 = 9*160;
            else step2 = step1;
            it.y = step2;
        });
    }
    game.updateCycle++;
}

global.$__game = game;
}); // ends DOMContentLoaded