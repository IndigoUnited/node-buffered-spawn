# buffered-spawn [![Build Status](https://travis-ci.org/bower/buffered-spawn.svg?branch=master)](https://travis-ci.org/bower/buffered-spawn)

Buffered child_process#spawn.


## Installation

`$ npm install buffered-spawn`


## Why

- Simplify executing commands on node
- Easy to use
- Fixes Windows [issues](https://github.com/joyent/node/issues/2318) with some commands
- Supports callback & promise style


## Usage

In terms of arguments, they are equal to node's [spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options).

```js
var buffspawn('buffered-spawn');

// Callback style
buffspawn('git', ['clone', 'git@github.com/bower/bower'], { cwd: '~/foo' }, function (err, output) {
    if (err) {
        return console.err('Command failed with error code of #'  + err.status);
    }

    console.log(output.stdout);
    console.log(output.stderr);
});

// Promise style
buffspawn('git', ['clone', 'git@github.com/bower/bower'], { cwd: '~/foo' })
.spread(function (stdout, stderr) {
    console.log(output.stdout);
    console.log(output.stderr);
}, function (err) {
    console.err('Command failed with error code of #'  + err.status);
});

// Promise style with progress
buffspawn('git', ['clone', 'git@github.com/bower/bower'], { cwd: '~/foo' })
.progress(function (buff) {
    console.log(buff.toString());
})
.spread(function (stdout, stderr) {
    console.log('---------------------------');
    console.log(output.stdout);
    console.log(output.stderr);
}, function (err) {
    console.err('Command failed with error code of #'  + err.status);
});

```


## Tests

`$ npm test`


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
