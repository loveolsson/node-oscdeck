const gfx = require('./gfx-elements.js');
const streamDeck = require('elgato-stream-deck');
const sync = require('synchronize');
const _ = require('lodash');
const osc = require('node-osc');


const settings = require('./settings.json');



var buttons = [];
var clients = [];


function ControllerButton(b) {
  var self = this;

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
    this.g.done.then(function() {
      if (self.desc.osc) {
        if (clients[self.desc.osc[0]]) {
          clients[self.desc.osc[0]].send(self.desc.osc[1], self.desc.osc[2]);
          console.log("Sent", clients[self.desc.osc[0]].host + ":" + clients[self.desc.osc[0]].port, self.desc.osc[1], self.desc.osc[2]);
        }
      }

      streamDeck.fillImage(self.desc.key, self.g.stateOn.data);
    });
  }

  this.up = function () {
    this.g.done.then(function() {

      streamDeck.fillImage(self.desc.key, self.g.stateOff.data);
    });
  }

  this.up();
}


// Load button images
_.forEach(_.range(0, 15), function (i) {
  streamDeck.fillColor(i, 0, 0, 0);
});

_.forEach(settings.buttons, function (b) {
  if (typeof b.key == "number" && b.key >= 0 && b.key < 15) {
    buttons[b.key] = new ControllerButton(b);
  }
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

_.forEach(settings.targets, function (c) {
  clients.push(new osc.Client(c.host, c.port));
});
