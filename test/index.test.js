'use strict';

// Third party libraries
var expect = require('chai').expect;
var rewire = require('rewire');


// Rewire libraries
var Graphite = rewire('../index');
var GraphiteClient = rewire('../node_modules/graphite/lib/GraphiteClient');

// Constants
var ENV = 'stage';
var APPLICATION = 'appName';
var SERVER = 'serverName';
var CLIENT = 'clientName';
var EVENT = 'eventType';
var VALUE = 5;

var SERVER_DEFAULT = 'bbserver';

var SERVER_VIOLATION = 'server.name';
var CLIENT_VIOLATION = 'client.name';


describe('index.js', function () {
    describe('#Graphite(metricEnvironment, metricApplication, metricServerName)', function () {
        it('should initialize Graphite properly', function (done) {
            var graphite;

            try {
                graphite = new Graphite(ENV, APPLICATION, SERVER);
            } catch (exp) {
                expect(exp).to.not.exist;
            }

            expect(graphite.client).to.exist;
            expect(graphite.metricPathPrefix).to.equal([ENV, APPLICATION, SERVER].join('.'));

            return done();
        });

        it('should initialize Graphite without passing a server name properly', function (done) {
            var graphite;

            try {
                graphite = new Graphite(ENV, APPLICATION, null);
            } catch (exp) {
                expect(exp).to.not.exist;
            }

            expect(graphite.client).to.exist;
            expect(graphite.metricPathPrefix).to.equal([ENV, APPLICATION, SERVER_DEFAULT].join('.'));

            return done();
        });

        it('should error when trying to initialize Graphite with empty require environment variable', function (done) {
            var graphite;

            var graphiteMock = Graphite.__set__('HOST', null);

            try {
                graphite = new Graphite(ENV, APPLICATION, SERVER_VIOLATION);
            } catch (exp) {
                expect(exp).to.exist;

                // Reverts Rewire changes
                graphiteMock();

                return done();
            }
        });

        it('should error when trying to initialize Graphite with empty parameters', function (done) {
            var graphite;

            try {
                graphite = new Graphite(null, APPLICATION, SERVER);
            } catch (exp) {
                expect(exp).to.exist;

                return done();
            }
        });

        it('should error when trying to initialize Graphite with wrong parameters standard', function (done) {
            var graphite;

            try {
                graphite = new Graphite(ENV, APPLICATION, SERVER_VIOLATION);
            } catch (exp) {
                expect(exp).to.exist;

                return done();
            }
        });
    });

    describe('#write(metricClient, metricEvent, metricValue, metricTimestamp, callback)', function () {
        it('should upload metric into Graphite properly', function (done) {
            var GraphiteClientMock = GraphiteClient.__get__('GraphiteClient');

            GraphiteClientMock.prototype.write = function (metrics, timestamp, cb) {
                var key = [ENV, APPLICATION, SERVER, CLIENT, EVENT].join('.');
                var metric = {};

                metric[key] = VALUE;

                expect(metrics).to.eql(metric);
                expect(timestamp).to.exist;
                expect(typeof timestamp).to.equal('number');
                expect(cb).to.exist;

                // Reverts Rewire changes
                graphiteMock();

                return done();
            };

            var graphite;

            var graphiteMock = Graphite.__set__('graphite', GraphiteClientMock);

            try {
                graphite = new Graphite(ENV, APPLICATION, SERVER);
            } catch (exp) {
                expect(exp).to.not.exist;
            }

            graphite.write(CLIENT, EVENT, VALUE, Date.now(), function (err) {
                expect(err).to.not.exist;
            });
        });

        it('should upload metric into Graphite with an empty timestamp properly', function (done) {
            var GraphiteClientMock = GraphiteClient.__get__('GraphiteClient');

            GraphiteClientMock.prototype.write = function (metrics, timestamp, cb) {
                var key = [ENV, APPLICATION, SERVER, CLIENT, EVENT].join('.');
                var metric = {};

                metric[key] = VALUE;

                expect(metrics).to.eql(metric);
                expect(timestamp).to.exist;
                expect(typeof timestamp).to.equal('number');
                expect(cb).to.exist;

                // Reverts Rewire changes
                graphiteMock();

                return done();
            };

            var graphite;

            var graphiteMock = Graphite.__set__('graphite', GraphiteClientMock);

            try {
                graphite = new Graphite(ENV, APPLICATION, SERVER);
            } catch (exp) {
                expect(exp).to.not.exist;
            }

            graphite.write(CLIENT, EVENT, VALUE, null, function (err) {
                expect(err).to.not.exist;
            });
        });

        it('should error uploading a invalid metric component into Graphite', function (done) {
            var graphite;

            try {
                graphite = new Graphite(ENV, APPLICATION, SERVER);
            } catch (exp) {
                expect(exp).to.not.exist;
            }

            graphite.write(CLIENT_VIOLATION, EVENT, VALUE, Date.now(), function (err) {
                expect(err).to.exist;

                return done();
            });
        });
    });
});
