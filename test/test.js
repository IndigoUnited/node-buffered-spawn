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

        it('should handle optional options', function (next) {
            buffspawn('node', [
                __dirname + '/fixtures/echo',
                'foo'
            ], function (err, stdout) {
                expect(err).to.not.be.ok();
                expect(stdout.trim()).to.equal('foo');

                next();
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

        it('should work with promises', function (next) {
            var progressCount = 0;

            buffspawn('node', [
                __dirname + '/fixtures/echo',
                'foo'
            ])
            .progress(function (data) {
                expect(data).to.be.an(Buffer);
                expect(data.length).to.be.greaterThan(0);
                expect(data.type).to.equal('stdout');
                progressCount += 1;
            })
            .spread(function (stdout) {
                expect(stdout.trim()).to.equal('foo');
                expect(progressCount).to.equal(1);

                next();
            })
            .done();
        });

        it('should give access to the underlying child process', function () {
            var cp = buffspawn('echo', function () {});

            expect(cp.kill).to.be.a('function');

            var promise = buffspawn('echo');
            expect(promise.cp.kill).to.be.a('function');
        });
    });

    it('should buffer stdout & stderr', function (next) {
        buffspawn('node', [__dirname + '/fixtures/simple'])
        .spread(function (stdout, stderr) {
            expect(stdout).to.equal('i am being printed on stdout');
            expect(stderr).to.equal('i am being printed on stderr');

            next();
        })
        .done();
    });

    it('should expand using PATH_EXT properly', function (next) {
        if (!isWin) {
            return next();
        }

        buffspawn(__dirname + '/fixtures/foo')  // Should expand to foo.bat
        .spread(function (stdout) {
            expect(stdout.trim()).to.equal('foo');

            next();
        })
        .done();
    });

    it('should handle multibyte properly', function (next) {
        buffspawn('node', [__dirname + '/fixtures/multibyte'])
        .spread(function (stdout, stderr) {
            expect(stdout).to.equal('こんにちは');
            expect(stderr).to.equal('こんにちは');

            next();
        })
        .done();
    });

    it('should not swallow callback errors', function (next) {
        buffspawn('echo', function () {
            var d = require('domain').create();

            d.on('error', function (err) {
                expect(err.message).to.be('foo');
                next();
            });

            d.run(function () {
                buffspawn('echo', function () {
                    throw new Error('foo');
                });
            });
        });
    });

    it('should fail on error code != 0 and still give stdout/stderr', function (next) {
        buffspawn('node', [__dirname + '/fixtures/fail'])
        .done(function () {
            next(new Error('Should have failed'));
        }, function (err) {
            expect(err).to.be.an(Error);
            expect(err.status).to.equal(25);
            expect(err.stdout).to.equal('stdout fail');
            expect(err.stderr).to.equal('stderr fail');
            expect(err.details).to.equal(err.stderr);

            next();
        });
    });
});
