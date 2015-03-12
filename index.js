'use strict';

// Third party libraries
var graphite = require('graphite');


// Graphite source
var HOST = process.env.GRAPHITE_HOST;
var PORT = process.env.GRAPHITE_PORT;

// Error messages
var PARAM_ERROR_MSG = 'Graphite initialization parameters are missing or malformed';
var METRIC_ERROR_MSG = 'Unable to upload metric into Graphite because ' +
                       'some parameters were missing or malformed';

// Constants
var DEFAULT_SERVER_NAME = 'bbserver';


/**
 *  Initializes Graphite client
 *
 *  @{param} (String) metricEnvironment First generic metric path hierarchy component
 *  @{param} (String) metricApplication Second generic metric path hierarchy component
 *  @{param} (String) metricServerName Third generic metric path hierarchy component
 *  @{param} (function) callback A callback function in the form of callback(err)
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
    self.metricPathPrefix = [metricEnvironment, metricApplication, metricServerName].join('.');
}

/**
 *  Uploads metric into Graphite
 *
 *  @{param} (String) metricClient Metric client path
 *  @{param} (String) metricEvent Metric event path
 *  @{param} (String) metricYear Metric record year
 *  @{param} (String) metricMonth Metric record month
 *  @{param} (String) metricDay Metric record day
 *  @{param} (String) metricHour Metric record hour
 *  @{param} (String) metricValue Metric value
 *  @{param} (Number) metricTimestamp Server epoch time metric timestamp in milliseconds
 *  Default: method execution current time
 *  @{param} (function) callback A callback function in the form of callback(err)
 */
GraphiteClient.prototype.writeBucket = function write(
    metricClient,
    metricEvent,
    metricYear,
    metricMonth,
    metricDay,
    metricHour,
    metricValue,
    metricTimestamp,
    callback
) {
    if (!callback) {
        throw new Error(METRIC_ERROR_MSG);
    }

    if (!metricTimestamp) {
        metricTimestamp = Date.now();
    }

    if (!metricClient || metricClient.indexOf('.') >= 0 ||
        !metricEvent || metricEvent.indexOf('.') >= 0 ||
        typeof metricYear !== 'number' ||
        typeof metricMonth !== 'number' ||
        typeof metricDay !== 'number' ||
        typeof metricHour !== 'number' ||
        typeof metricValue !== 'number') {
        return callback(METRIC_ERROR_MSG);
    }

    var self = this;
    var metric = {};
    var path = [
        self.metricPathPrefix,
        metricClient,
        metricEvent,
        metricYear,
        metricMonth,
        metricDay,
        metricHour
    ].join('.');

    metric[path] = metricValue;

    return self.client.write(metric, metricTimestamp, callback);
};

/**
 *  Uploads metric into Graphite
 *
 *  @{param} (String) metricClient Metric client path
 *  @{param} (String) metricEvent Metric event path
 *  @{param} (String) metricValue Metric value
 *  @{param} (Number) metricTimestamp Server epoch time metric timestamp in milliseconds
 *  Default: method execution current time
 *  @{param} (function) callback A callback function in the form of callback(err)
 */
GraphiteClient.prototype.write = function write(
    metricClient,
    metricEvent,
    metricValue,
    metricTimestamp,
    callback
) {
    if (!callback) {
        throw new Error(METRIC_ERROR_MSG);
    }

    if (!metricTimestamp) {
        metricTimestamp = Date.now();
    }

    if (!metricClient || metricClient.indexOf('.') >= 0 ||
        !metricEvent || metricEvent.indexOf('.') >= 0 ||
        typeof metricValue !== 'number') {
        return callback(METRIC_ERROR_MSG);
    }

    var self = this;
    var metric = {};
    var path = [
        self.metricPathPrefix,
        metricClient,
        metricEvent
    ].join('.');

    metric[path] = metricValue;

    return self.client.write(metric, metricTimestamp, callback);
};

module.exports = GraphiteClient;
