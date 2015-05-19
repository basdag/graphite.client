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
var TYPE = 'eventType';
var SOURCE = 'bbx';
var TIMESTAMP = 1426172831551;
var YEAR = 2015;
var MONTH = 2;
var DAY = 12;
var HOUR = 15;
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
            expect(graphite.metricPathPrefix).to.equal(['apps', ENV, APPLICATION, SERVER].join('.'));

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
            expect(graphite.metricPathPrefix).to.equal(['apps', ENV, APPLICATION, SERVER_DEFAULT].join('.'));

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

    describe('#writeBucket(metricClient, metricEvent, metricValue, metricTimestamp, callback)', function () {
        it('should upload metric into Graphite properly', function (done) {
            var GraphiteClientMock = GraphiteClient.__get__('GraphiteClient');

            GraphiteClientMock.prototype.write = function (metrics, timestamp, cb) {
                var key = ['apps', ENV, APPLICATION, SERVER, SOURCE, TYPE, CLIENT, YEAR, MONTH, DAY, HOUR].join('.');
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

            graphite.writeBucket(SOURCE, TYPE, CLIENT, VALUE, TIMESTAMP, function (err) {
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

            graphite.writeBucket(SOURCE, TYPE, CLIENT_VIOLATION, VALUE, TIMESTAMP, function (err) {
                expect(err).to.exist;

                return done();
            });
        });
    });

    describe('#write(metricClient, metricEvent, metricValue, metricTimestamp, callback)', function () {
        it('should upload metric into Graphite properly', function (done) {
            var GraphiteClientMock = GraphiteClient.__get__('GraphiteClient');

            GraphiteClientMock.prototype.write = function (metrics, timestamp, cb) {
                var key = ['apps', ENV, APPLICATION, SERVER, SOURCE, TYPE, CLIENT].join('.');
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

            graphite.write(SOURCE, TYPE, CLIENT, VALUE, function (err) {
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

            graphite.write(SOURCE, TYPE, CLIENT_VIOLATION, VALUE, function (err) {
                expect(err).to.exist;

                return done();
            });
        });
    });
});
