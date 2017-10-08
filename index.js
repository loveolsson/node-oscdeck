const gfx = require('./btn-render.js');
const streamDeck = require('elgato-stream-deck');
const _ = require('lodash');
const osc = require('node-osc');

const settings = require('./settings.json');

var buttons = [];
var clients = [];


function ControllerButton(b) {
  var self = this;

  if (!_.isString(b.text)) {
    b.text = "";
  }

  if (_.isString(b.symbol)) {
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
    var o = state ? self.desc.oscDown : self.desc.oscUp;

    if (o) {
      var client = clients[o[0]];

      if (client) {
        var path = o[1];
        var val = o[2];

        client.send(path, val);
        console.log("Sent", client.host + ":" + client.port, path, val);
      }
    }
  }

  this.down = function () {
    self.sendOsc(true);

    self.setImage(true);
  }

  this.up = function () {
    self.sendOsc(false);

    self.setImage(false);
  }

  self.setImage(false);
}

// Clear button displays
_.forEach(_.range(0, 15), function (i) {
  streamDeck.fillColor(i, 0, 0, 0);
});

// Set up buttons from settings file
_.forEach(settings.buttons, function (b) {
  if (_.isNumber(b.key) && _.inRange(b.key, 0, 15)) {
    buttons[b.key] = new ControllerButton(b);
  }
});

// Set up targets from settings file
_.forEach(settings.targets, function (c) {
  clients.push(new osc.Client(c.host, c.port));
});

// Set up Stream Deck callbacks
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
