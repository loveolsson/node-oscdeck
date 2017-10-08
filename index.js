const path = require('path');
const gfx = require('./gfx-elements.js');
const streamDeck = require('elgato-stream-deck');
const sync = require('synchronize');
const _ = require('lodash');
const osc = require('node-osc');


const settings = require('./settings.json');



var buttons = [];
var clients = [];


function ControllerButton(b) {

  if (typeof b.text != "string") {
    b.text = "";
  }

  if (typeof b.symbol != "string") {
    b.name = "help";
  }

  if (!b.color) {
    b.color = "white";
  }

  this.desc = b;



  this.g = new gfx.Button(gfx.Color(b.color), b.symbol, b.text);


  this.down = function () {
    if (this.desc.osc) {
      if (clients[this.desc.osc[0]]) {
        clients[this.desc.osc[0]].send(this.desc.osc[1], this.desc.osc[2]);
        console.log("Sent", clients[this.desc.osc[0]].host + ":" + clients[this.desc.osc[0]].port, this.desc.osc[1], this.desc.osc[2]);
      }
    }

    streamDeck.fillImage(this.desc.key, this.g.stateOn);
  }

  this.up = function () {
    streamDeck.fillImage(this.desc.key, this.g.stateOff);
  }

  this.up();
}


// Load button images sync
sync.fiber(function () {
  _.forEach(_.range(0, 15), function (i) {
      streamDeck.fillColor(i, 0, 0, 0);
  });

  _.forEach(settings.buttons, function (b) {
    if (typeof b.key == "number" && b.key >= 0 && b.key < 15) {
      buttons[b.key] = new ControllerButton(b);
    }
  });



  _.forEach(settings.targets, function (c) {
      clients.push(new osc.Client(c.host, c.port));
  });


});


streamDeck.on('down', keyIndex => {
    if (buttons[keyIndex]) {
      buttons[keyIndex].down();
    }
});

streamDeck.on('up', keyIndex => {
    if (buttons[keyIndex]) {
      buttons[keyIndex].up();
    }
});

streamDeck.on('error', error => {
    console.error(error);
});
