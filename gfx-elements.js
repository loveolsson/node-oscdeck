const sync = require('synchronize');
const sharp = require('sharp');

const paths = require('material-design-icons-svg/paths');
const icons = require('material-design-icons-svg')(paths);
var parseColor = require('parse-color');


function Bitmap(data, info) {
  this.data = data;
  this.info = info;

  this.ctorDesc = {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  };
}

var getIcon = sync(function(id, large, cb) {
  var svg = icons.getSVG(id);
  if (!svg) svg = icons.getSVG("help");

  var d = (large) ? 200 : 150;

  var b = Buffer(svg);
  sharp(b, {density: d})
  .raw()
  .toBuffer(function (err, data, info) {
    cb(null, new Bitmap(data, info));
  });
});

var getText = sync(function(text, cb) {
  var svg = Buffer('<svg width="72" height="72"><text x="35" y="64" font-family="sans-serif" font-size="13" fill="white" text-anchor="middle">' + text + '</text></svg>');
  sharp(svg, {})
  .raw()
  .toBuffer(function (err, data, info) {
    cb(null, new Bitmap(data, info));
  });
});

var getComposite = sync(function(bg, fg, cutout, cb) {
  sharp(bg.data, bg.ctorDesc)
  .overlayWith(fg.data, {
    gravity: "north",
    cutout: cutout,
    raw: fg.ctorDesc.raw
  })
  .raw()
  .toBuffer(function (err, data, info) {
    cb(null, new Bitmap(data, info));
  });
});

var getBackground = sync(function(color, cb) {
  sharp({
    create: {
      width: 72,
      height: 72,
      channels: 3,
      background: color
    }
  })
  .raw()
  .toBuffer(function (err, data, info) {
    cb(null, new Bitmap(data, info));
  });
});

var flatten = sync(function (img, cb) {
  sharp(img.data, img.ctorDesc)
  .flatten()
  .raw()
  .toBuffer(function (err, data, info) {
    cb(null, new Bitmap(data, info));
  });
  //.png().toFile("./examples/foo.png");

});


var self = module.exports = {
  Bitmap: Bitmap,

  Color: function (c) {
    var p = parseColor(c).rgb;

    if (!p) p = parseColor("white").rgb;

    return {
      r: p[0],
      g: p[1],
      b: p[2]
    };
  },

  Button: function (color, id, text) {
    var bg = getBackground(color);
    var icon = getIcon(id, text == "");
    var text = getText(text);

    var temp = getComposite(bg, icon, true);
    temp = getComposite(temp, text, false);
    this.stateOff = flatten(temp).data;


    temp = getComposite(bg, icon, false);
    temp = getComposite(temp, text, false);

    this.stateOn = flatten(temp).data;
  }
};
