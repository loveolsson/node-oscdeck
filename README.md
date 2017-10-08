# node-oscdeck
node.js app to send OSC messages from a Elgato Stream Deck.

**Project is experimental, untested and might change completely at any moment.**

node-oscdeck is based on [node-elgato-stream-deck](https://github.com/Lange/node-elgato-stream-deck) by Lange. 
Check that repository for button map and install instructions.

## Icons
The icons for the Stream Deck buttons are created from SVG versions of the https://materialdesignicons.com/ icon set.

The symbols are currently rendered synchronously at startup and is really slow.

## Settings file
The settings are loaded from the settings.json file.

### Targets
targets is an array of OSC targets that can be used in the button assignments. Targets are refered to by index in this array.
```
"targets": [
    { "host": "localhost", "port": 53000 }
  ]
```

### Buttons
"buttons" is an array of objects describing each button on the Stream Deck.

![](examples/skip.png)


```
  {
    "key": 0,                 // The key to assign to, check node-elgato-stream-deck button map
    "symbol": "skip-forward", // The icon rendered on the key, 
                              // referring to the names from https://materialdesignicons.com/
    "color": "green",           // Color of symbol; "red", "#FF0000", "rgb(255, 0, 0)" 
    "text": "SKIP",          // Text rendered on button. If left blank, the icon is rendered bigger.
    "osc": [0, "/skip", 1]    // The OSC message to send when button is pressed. [target, path, value]
  }
```
