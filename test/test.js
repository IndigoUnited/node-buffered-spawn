'use strict';

var buffspawn = require('../index');
var expect = require('expect.js');

var isWin = process.platform === 'win32';

describe('buffered-spawn', function () {
    describe('api', function (next) {
        it('should handle optional args & options', function (next) {
            buffspawn('echo', function (err) {
                expect(err).to.not.be.ok();
                next();
            });
        });

        it('should handle optional args', function (next) {
            buffspawn(__dirname + '/fixtures/hello', { stdio: ['pipe', 'ignore', 'ignore'] }, function (err, stdout) {
                expect(err).to.not.be.ok();
                expect(stdout).to.be('');

                buffspawn(__dirname + '/fixtures/hello', null, { stdio: ['pipe', 'ignore', 'ignore'] }, function (err, stdout) {
                    expect(err).to.not.be.ok();
                    expect(stdout).to.be('');

                    next();
                });
            });
        });

        it('should handle optional options', function (next) {
            buffspawn('node', [
                __dirname + '/fixtures/echo',
                'foo'
            ], function (err, stdout) {
                expect(err).to.not.be.ok();
                expect(stdout.trim()).to.equal('foo');

                buffspawn('node', [
                    __dirname + '/fixtures/echo',
                    'foo'
                ], null, function (err, stdout) {
                    expect(err).to.not.be.ok();
                    expect(stdout.trim()).to.equal('foo');

                    next();
                });
            });
        });

        it('should pass arguments to node\'s spawn', function (next) {
            buffspawn('node', ['simple'], { cwd: __dirname + '/fixtures' }, function (err, stdout, stderr) {
                expect(err).to.not.be.ok();
                expect(stdout).to.equal('i am being printed on stdout');
                expect(stderr).to.equal('i am being printed on stderr');

                next();
            });
        });

        it('should allow node\'s spawn\'s stdout to be ignored & inherited', function (next) {
            buffspawn('node', ['simple'], {
                cwd: __dirname + '/fixtures',
                stdio: ['pipe', 'ignore', 'pipe']
            }, function (err, stdout, stderr) {
                expect(err).to.not.be.ok();
                expect(stdout).to.equal('');
                expect(stderr).to.equal('i am being printed on stderr');

                buffspawn('node', ['simple'], {
                    cwd: __dirname + '/fixtures',
                    stdio: ['pipe', 1, 'pipe']
                }, function (err, stdout, stderr) {
                    expect(err).to.not.be.ok();
                    expect(stdout).to.equal('');
                    expect(stderr).to.equal('i am being printed on stderr');

                    next();
                });
            });
        });

        it('should allow node\'s spawn\'s stderr to be ignored & inherited', function (next) {
            buffspawn('node', ['simple'], {
                cwd: __dirname + '/fixtures',
                stdio: ['pipe', 'pipe', 'ignore']
            }, function (err, stdout, stderr) {
                expect(err).to.not.be.ok();
                expect(stdout).to.equal('i am being printed on stdout');
                expect(stderr).to.equal('');

                buffspawn('node', ['simple'], {
                    cwd: __dirname + '/fixtures',
                    stdio: ['pipe', 'pipe', 2]
                }, function (err, stdout, stderr) {
                    expect(err).to.not.be.ok();
                    expect(stdout).to.equal('i am being printed on stdout');
                    expect(stderr).to.equal('');

                    next();
                });
            });
        });

        it('should work with promises', function () {
            return buffspawn('node', [
                __dirname + '/fixtures/echo',
                'foo'
            ])
            .then(function (io) {
                expect(io.stdout.trim()).to.equal('foo');
                expect(io.stderr.trim()).to.equal('');

                return buffspawn('node', [__dirname + '/fixtures/fail']);
            })
            .then(function () {
                throw next(new Error('Should have failed'));
            }, function (err) {
                expect(err).to.be.an(Error);
                expect(err.status).to.equal(25);
                expect(err.stdout).to.equal('stdout fail');
                expect(err.stderr).to.equal('stderr fail');
                expect(err.details).to.equal(err.stderr);
            });
        });

        it('should give access to the underlying child process', function () {
            var cp = buffspawn('echo', function () {});

            expect(cp.kill).to.be.a('function');

            var promise = buffspawn('echo');
            expect(promise.cp.kill).to.be.a('function');
        });
    });

    it('should buffer stdout & stderr', function () {
        return buffspawn('node', [__dirname + '/fixtures/simple'])
        .then(function (io) {
            expect(io.stdout).to.equal('i am being printed on stdout');
            expect(io.stderr).to.equal('i am being printed on stderr');
        });
    });

    it('should expand using PATH_EXT properly', function () {
        if (!isWin) {
            return Promise.resolve();
        }

        return buffspawn(__dirname + '/fixtures/foo')  // Should expand to foo.bat
        .then(function (io) {
            expect(io.stdout.trim()).to.equal('foo');
        });
    });

    it('should handle multibyte properly', function () {
        return buffspawn('node', [__dirname + '/fixtures/multibyte'])
        .then(function (io) {
            expect(io.stdout).to.equal('こんにちは');
            expect(io.stderr).to.equal('こんにちは');
        });
    });

    it.skip('should not swallow callback errors');

    it('should fail on error code != 0 and still give stdout/stderr', function () {
        return buffspawn('node', [__dirname + '/fixtures/fail'])
        .then(function () {
            throw new Error('Should have failed');
        }, function (err) {
            expect(err).to.be.an(Error);
            expect(err.status).to.equal(25);
            expect(err.stdout).to.equal('stdout fail');
            expect(err.stderr).to.equal('stderr fail');
            expect(err.details).to.equal(err.stderr);
        });
    });
});
