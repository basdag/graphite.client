'use strict';

// Third party libraries
var expect = require('chai').expect;
var rewire = require('rewire');


// Rewire libraries
var Graphite = rewire('../index');
var GraphiteClient = rewire('../node_modules/graphite/lib/GraphiteClient');

// Constants
var ENV = 'stage';
var APPLICATION = 'bbApp';
var SERVER_NAME = 'bbServer';
var DETAIL_METRIC_PATH = 'bb.eventsCounte';


describe('index.js', function () {
    describe('#Graphite(environment, application, serverName, callback)', function () {
        it('should initialize Graphite properly', function (done) {
            try {
                var graphite = new Graphite(ENV, APPLICATION, SERVER_NAME);
            } catch (exp) {
                expect(exp).to.not.exist;
            }

            return done();
        });

        it('should error when trying to initialize Graphite with empty parameters', function (done) {
            try {
                var graphite = new Graphite(null, APPLICATION, SERVER_NAME);
            } catch (exp) {
                expect(exp).to.exist;
            }

            return done();
        });
    });
});
