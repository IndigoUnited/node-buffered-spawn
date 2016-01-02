var spawn = require('cross-spawn-async');
var createError = require('err-code');

function execute(command, args, options) {
    var cp;
    var promise = new Promise(function (resolve, reject) {
        var stderr = new Buffer('');
        var stdout = new Buffer('');

        // Buffer output, reporting progress
        cp = spawn(command, args, options);

        if (cp.stdout) {
            cp.stdout.on('data', function (data) {
                stdout = Buffer.concat([stdout, data]);
            });
        }
        if (cp.stderr) {
            cp.stderr.on('data', function (data) {
                stderr = Buffer.concat([stderr, data]);
            });
        }

        // If there is an error spawning the command, reject the promise
        cp.on('error', reject);

        // Listen to the close event instead of exit
        // They are similar but close ensures that streams are flushed
        cp.on('close', function (code) {
            var fullCommand;
            var error;

            stdout = stdout.toString();
            stderr = stderr.toString();

            if (!code) {
                return resolve({ stdout: stdout, stderr: stderr });
            }

            // Generate the full command to be presented in the error message
            args = args || [];
            fullCommand = command;
            fullCommand += args.length ? ' ' + args.join(' ') : '';

            // Build the error instance
            error = createError('Failed to execute "' + fullCommand + '", exit code of #' + code, 'ECMDERR', {
                stderr: stderr,
                stdout: stdout,
                details: stderr,
                status: code
            });

            return reject(error);
        });
    });

    promise.cp = cp;

    return promise;
}

function buffered(command, args, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }
    if (typeof args === 'function') {
        callback = args;
        args = options = null;
    }
    if (args && !Array.isArray(args)) {
        options = args;
        args = null;
    }

    var promise = execute(command, args, options);

    if (!callback) {
        return promise;
    }

    promise
    .then(function (io) {
        callback(null, io.stdout, io.stderr);
    }, callback)
    .then(null, function (err) {
        setTimeout(function () {
            throw err;
        }, 1);
    });

    return promise.cp;
}

module.exports = buffered;
