'use strict';

// Third party libraries
var graphite = require('graphite');


// Error messages
var PARAM_ERROR_MSG = 'Graphite initialization parameters are missing or malformed';
var METRIC_ERROR_MSG = 'Unable to upload metric into Graphite because ' +
                       'some parameters were missing or malformed';

// Constants
var HOST = process.env.GRAPHITE_HOST;
var PORT = process.env.GRAPHITE_PORT;

var DEFAULT_SERVER_NAME = 'bbserver';


/**
 *  Initializes Graphite client
 *
 *  @param {string} metricEnvironment - First generic metric path hierarchy component
 *  @param {string} metricApplication - Second generic metric path hierarchy component
 *  @param {string} metricServerName - Third generic metric path hierarchy component
 *  @param {function} callback - A callback function in the form of callback(err)
 */
function GraphiteClient(metricEnvironment, metricApplication, metricServerName) {
    if (!(this instanceof GraphiteClient)) {
        return new GraphiteClient(metricEnvironment, metricApplication, metricServerName);
    }

    var self = this;

    if (!metricServerName) {
        metricServerName = DEFAULT_SERVER_NAME;
    }

    if (!metricEnvironment || metricEnvironment.indexOf('.') >= 0 ||
        !metricApplication || metricApplication.indexOf('.') >= 0 ||
        !metricServerName || metricServerName.indexOf('.') >= 0) {
        throw new Error(PARAM_ERROR_MSG);
    }

    var clientPath = 'plaintext://' + HOST + ':' + PORT + '/';

    self.client = graphite.createClient(clientPath);
    self.metricPathPrefix = [
        'apps',
        metricEnvironment,
        metricApplication,
        metricServerName
    ].join('.');
}

/**
 *  Uploads metric into Graphite
 *
 *  @param {string} metricSource - Metric source
 *  @param {string} metricType - Metric event
 *  @param {string} metricClient - Metric client
 *  @param {string} metricValue - Metric value
 *  @param {function} callback - A callback function in the form of callback(err)
 */
GraphiteClient.prototype.write = function write(
    metricSource,
    metricType,
    metricClient,
    metricValue,
    callback
) {
    var self = this;

    if (!callback) {
        throw new Error(METRIC_ERROR_MSG);
    }

    if (!metricClient || metricClient.indexOf('.') >= 0 ||
        !metricType || metricType.indexOf('.') >= 0 ||
        typeof metricValue !== 'number') {
        return callback(METRIC_ERROR_MSG);
    }

    var metric = {};

    var path = [
        self.metricPathPrefix,
        metricSource,
        metricType,
        metricClient
    ].join('.');

    metric[path] = metricValue;

    return self.client.write(metric, Date.now(), callback);
};

module.exports = GraphiteClient;
