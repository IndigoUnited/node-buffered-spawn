# buffered-spawn

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/buffered-spawn
[downloads-image]:http://img.shields.io/npm/dm/buffered-spawn.svg
[npm-image]:http://img.shields.io/npm/v/buffered-spawn.svg
[travis-url]:https://travis-ci.org/IndigoUnited/node-buffered-spawn
[travis-image]:http://img.shields.io/travis/IndigoUnited/node-buffered-spawn.svg
[david-dm-url]:https://david-dm.org/IndigoUnited/node-buffered-spawn
[david-dm-image]:https://img.shields.io/david/IndigoUnited/node-buffered-spawn.svg
[david-dm-dev-url]:https://david-dm.org/IndigoUnited/node-buffered-spawn#info=devDependencies
[david-dm-dev-image]:https://img.shields.io/david/dev/IndigoUnited/node-buffered-spawn.svg

Buffered child_process#spawn.


## Installation

`$ npm install buffered-spawn`


## Why

- Easy to use
- Uses [cross-spawn](http://github.com/IndigoUnited/node-cross-spawn) that fixes windows [issues](https://github.com/joyent/node/issues/2318)
- Supports callback & promise style


## Usage

In terms of arguments, they are equal to node's [spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options).

```js
var bufferedSpawn = require('buffered-spawn');

// Callback style
bufferedSpawn('git', ['clone', 'git@github.com/bower/bower'], { cwd: '~/foo' }, function (err, stdout, stderr) {
    if (err) {
        // Both stdout and stderr are also set on the error object
        return console.err('Command failed with error code of #'  + err.status);
    }

    console.log(stdout);
    console.log(stderr);
});

// Promise style
bufferedSpawn('git', ['clone', 'git@github.com/bower/bower'], { cwd: '~/foo' })
.then(function (io) {
    console.log(io.stdout);
    console.log(io.stderr);
}, function (err) {
    // Both stdout and stderr are also set on the error object
    console.err('Command failed with error code of #'  + err.status);
});
```

The actual child process is available if necessary:

```js
var buffspawn('buffered-spawn');

// Callback style
var cp = buffspawn('git', ['clone', 'git@github.com/bower/bower'], function () {}};

// Promise style
var promise = buffspawn('git', ['clone', 'git@github.com/bower/bower']);
var cp = promise.cp;
```


## Tests

`$ npm test`


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
