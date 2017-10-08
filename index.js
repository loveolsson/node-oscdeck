const gfx = require('./btn-render.js');
const streamDeck = require('elgato-stream-deck');
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

  this.desc = b;

  this.imgLoaded = gfx.Load(b.color, b.symbol, b.text);

  this.setImage = function (state) {
    var index = state ? 1 : 0;

    this.imgLoaded.then(function(x) {
      streamDeck.fillImage(self.desc.key, x[index].data);
    });
  }

  this.sendOsc = function (state) {
    if (self.desc.osc) {
      var client = clients[self.desc.osc[0]];

      if (client) {
        var path = self.desc.osc[1];
        var val = self.desc.osc[2];

        client.send(path, val);
        console.log("Sent", client.host + ":" + client.port, path, val);
      }
    }
  }

  this.down = function () {
    self.sendOsc();

    self.setImage(true);
  }

  this.up = function () {
    self.setImage(false);
  }

  self.setImage(false);
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
