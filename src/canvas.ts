'use strict';
document.addEventListener('DOMContentLoaded', () => {

// event handlers
const optbtn = document.getElementById('optionsBtn'),
dimbg = document.getElementById('dimBg'),
optdiv = document.getElementById('optionsDiv'),
optclose = document.getElementById('closeOptions');

// options button
optbtn.addEventListener('click', () => {
    dimbg.hidden = false;
    optdiv.hidden = false;
});

// dim background, closes options menu
dimbg.addEventListener('click', () => {
    dimbg.hidden = true;
    optdiv.hidden = true;
});

// close options
optclose.addEventListener('click', () => {
    dimbg.hidden = true;
    optdiv.hidden = true;
});

const Phaser = require('phaser');

var config = {
    type: Phaser.CANVAS,
    canvas: document.getElementById('canvas'),
    width: 500,
    height: 500,
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

var game = new Phaser.Game(config);

function preload ()
{
    this.load.setBaseURL('https://labs.phaser.io');

    this.load.image('sky', 'assets/skies/space3.png');
    this.load.image('logo', 'assets/sprites/phaser3-logo.png');
    this.load.image('red', 'assets/particles/red.png');
}

function create ()
{
    this.add.image(400, 300, 'sky');

    var particles = this.add.particles('red');

    var emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
    });

    var logo = this.physics.add.image(400, 100, 'logo');

    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    emitter.startFollow(logo);
}

}); /*ends domcontentloaded*/