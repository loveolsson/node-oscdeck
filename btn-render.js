const sharp = require('sharp');

const paths = require('material-design-icons-svg/paths');
const icons = require('material-design-icons-svg')(paths);
var parseColor = require('parse-color');

function Color (c) {
  var p = parseColor(c).rgb;

  if (!p) p = parseColor("white").rgb;

  return {
    r: p[0],
    g: p[1],
    b: p[2]
  };
}

var imgDesc = function (obj) {
  return {
    width: obj.info.width,
    height: obj.info.height,
    channels: obj.info.channels
  };
}

var getIcon = function(id, large) {
  var svg = icons.getSVG(id);
  if (!svg) svg = icons.getSVG("help");
  var b = Buffer(svg);

  var d = (large) ? 200 : 150;

  return sharp(b, {density: d})
  .raw()
  .toBuffer({resolveWithObject: true});
}

var getText = function(text) {
  var svg = Buffer('<svg width="72" height="72"><text x="35" y="64" font-family="sans-serif" font-size="13" fill="white" text-anchor="middle">' + text + '</text></svg>');
  return sharp(svg, {})
  .raw()
  .toBuffer({resolveWithObject: true});
}

var getComposite = function(bg, fg, cutout) {
  return sharp(bg.data, { raw: imgDesc(bg) })
  .overlayWith(fg.data, {
    gravity: "north",
    cutout: cutout,
    raw: imgDesc(fg)
  })
  .raw()
  .toBuffer({resolveWithObject: true});
}

var getBackground = function(color) {
  return sharp({
    create: {
      width: 72,
      height: 72,
      channels: 3,
      background: color
    }
  })
  .raw()
  .toBuffer({resolveWithObject: true});
}

var flatten = function (img, cb) {
  return sharp(img.data, {raw: imgDesc(img)})
  .flatten()
  .raw()
  .toBuffer({resolveWithObject: true});
  //.png().toFile("./examples/foo.png");
}


module.exports = {
  Load: function (color, id, text) {
    var self = this;
    var bg = getBackground(Color(color));
    var icon = getIcon(id, text == "");
    var text = getText(text);

    var prom = [];

    prom[0] = Promise.all([bg, icon, text])
    .then(
      function (x) {
        return Promise.all([getComposite(x[0], x[1], true), text]);
      }
    )
    .then(
      function (x) {
        return getComposite(x[0], x[1], false);
      }
    ).then(flatten);

    prom[1] = Promise.all([bg, icon])
    .then(
      function (x) {
        return Promise.all([getComposite(x[0], x[1], false), text]);
      }
    )
    .then(
      function (x) {
        return getComposite(x[0], x[1], false);
      }
    ).then(flatten);

    return Promise.all(prom);
  }
};
