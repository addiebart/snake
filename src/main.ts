//! main.ts | https://edbart.github.io/snake/, https://github.com/edbart/ | Eddie Bart.
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
    fileConfig.sfxVolumeStr = sfxInput.value;
    fileConfig.sfxVolume = Number(sfxInput.value);
});

// end event handlers

let fileConfig = {
    sfxVolume: Number(getCookie('sfxVolume')) || 50,
    sfxVolumeStr: getCookie('sfxVolume') || '50',
    gamepad: {
        flag: Number(getCookie('snakeUsingGamepad')) === 1 || false,
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
    handle: () => {
        sfxInput.value = fileConfig.sfxVolumeStr;
        sfxLbl.textContent = fileConfig.sfxVolumeStr;
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
        create: create
    }
};

fileConfig.handle();

var game = new Phaser.Game(phaserConfig);

function preload (this: Phaser.Scene) {
    
    this.load.setBaseURL(location.protocol+'//'+location.host+location.pathname+'/phaser/');
    this.load.spritesheet('snake', 'snake.png', {
        frameWidth: 16,
        frameHeight: 16,
        startFrame: 0,
        endFrame: 23
    });
}

function create (this: Phaser.Scene) {
    this.add.image(0, 0, 'snake', 16).setOrigin(0, 0).setScale(10, 10);
    this.add.image(0, 160*1, 'snake', 16).setOrigin(0, 0).setScale(10, 10);
    this.add.image(0, 160*2, 'snake', 16).setOrigin(0, 0).setScale(10, 10);
    this.add.image(0, 160*3, 'snake', 16).setOrigin(0, 0).setScale(10, 10);
    this.add.image(0, 160*4, 'snake', 16).setOrigin(0, 0).setScale(10, 10);
    this.add.image(0, 160*5, 'snake', 16).setOrigin(0, 0).setScale(10, 10);
    this.add.image(0, 160*6, 'snake', 16).setOrigin(0, 0).setScale(10, 10);
    this.add.image(0, 160*7, 'snake', 16).setOrigin(0, 0).setScale(10, 10);
    this.add.image(0, 160*8, 'snake', 16).setOrigin(0, 0).setScale(10, 10);
    this.add.image(0, 160*9, 'snake', 16).setOrigin(0, 0).setScale(10, 10);
}

}); /*ends domcontentloaded*/