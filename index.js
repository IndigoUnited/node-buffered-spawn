'use strict';

const spawn = require('cross-spawn-async');
const errcode = require('err-code');

function execute(command, args, options) {
    let cp;
    const promise = new Promise((resolve, reject) => {
        let stderr = new Buffer('');
        let stdout = new Buffer('');

        // Buffer output, reporting progress
        cp = spawn(command, args, options);

        if (cp.stdout) {
            cp.stdout.on('data', (data) => {
                stdout = Buffer.concat([stdout, data]);
            });
        }
        if (cp.stderr) {
            cp.stderr.on('data', (data) => {
                stderr = Buffer.concat([stderr, data]);
            });
        }

        // If there is an error spawning the command, reject the promise
        cp.on('error', reject);

        // Listen to the close event instead of exit
        // They are similar but close ensures that streams are flushed
        cp.on('close', (code) => {
            stdout = stdout.toString();
            stderr = stderr.toString();

            if (!code) {
                return resolve({ stdout, stderr });
            }

            // Generate the full command to be presented in the error message
            args = args || [];

            const fullCommand = command + (args.length ? ` ${args.join(' ')}` : '');

            // Build the error instance
            const error = errcode(`Failed to execute "${fullCommand}", exit code of #${code}`, 'ECMDERR', {
                stderr,
                stdout,
                details: stderr,
                status: code,
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

    const promise = execute(command, args, options);

    if (!callback) {
        return promise;
    }

    promise
    .then((io) => {
        callback(null, io.stdout, io.stderr);
    }, callback)
    .then(null, (err) => {
        setTimeout(() => {
            throw err;
        }, 1);
    });

    return promise.cp;
}

module.exports = buffered;
