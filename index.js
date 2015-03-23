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
 *  Creates a Graphite path base on a timestamp
 *
 *  @{param} (number|string) timestamp The tiemstamp to be transform into a path
 *  @{return} (String) A partial path to be use it inside the Graphite final path
 */
function getTimestampPath(timestamp) {
    timestamp = parseInt(timestamp, 10);

    // Makes sure that is a Number
    if (timestamp !== timestamp) {
        return null;
    }

    var recordDate = new Date(timestamp);

    var path = [
        recordDate.getUTCFullYear(),
        recordDate.getUTCMonth(),
        recordDate.getUTCDate(),
        recordDate.getUTCHours()
    ].join('.');

    return path;
}

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
 *  @{param} (String) metricClient Metric client path
 *  @{param} (String) metricEvent Metric event path
 *  @{param} (String) metricTimestamp Record epoch time metric timestamp in milliseconds
 *  @{param} (String) metricValue Metric value
 *  @{param} (function) callback A callback function in the form of callback(err)
 */
GraphiteClient.prototype.writeBucket = function write(
    metricClient,
    metricEvent,
    metricTimestamp,
    metricValue,
    callback
) {
    var self = this;

    if (!callback) {
        throw new Error(METRIC_ERROR_MSG);
    }

    if (!metricClient || metricClient.indexOf('.') >= 0 ||
        !metricEvent || metricEvent.indexOf('.') >= 0 ||
        typeof metricTimestamp !== 'number' ||
        typeof metricValue !== 'number') {
        return callback(METRIC_ERROR_MSG);
    }

    var timestampPath = getTimestampPath(metricTimestamp);

    if (!timestampPath) {
        return callback(METRIC_ERROR_MSG);
    }

    var metric = {};

    var path = [
        self.metricPathPrefix,
        metricClient,
        metricEvent,
        timestampPath
    ].join('.');

    metric[path] = metricValue;

    return self.client.write(metric, Date.now(), callback);
};

/**
 *  Uploads metric into Graphite
 *
 *  @{param} (String) metricClient Metric client path
 *  @{param} (String) metricEvent Metric event path
 *  @{param} (String) metricValue Metric value
 *  @{param} (function) callback A callback function in the form of callback(err)
 */
GraphiteClient.prototype.write = function write(
    metricClient,
    metricEvent,
    metricValue,
    callback
) {
    var self = this;

    if (!callback) {
        throw new Error(METRIC_ERROR_MSG);
    }

    if (!metricClient || metricClient.indexOf('.') >= 0 ||
        !metricEvent || metricEvent.indexOf('.') >= 0 ||
        typeof metricValue !== 'number') {
        return callback(METRIC_ERROR_MSG);
    }

    var metric = {};

    var path = [
        self.metricPathPrefix,
        metricClient,
        metricEvent
    ].join('.');

    metric[path] = metricValue;

    return self.client.write(metric, Date.now(), callback);
};

module.exports = GraphiteClient;
