'use strict';

// event handlers
document.addEventListener('DOMContentLoaded', () => {

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
});


