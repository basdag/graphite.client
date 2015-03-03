'use strict';

// Third party libraries
var graphite = require('graphite');


// Graphite source
var HOST = process.env.GRAPHITE_HOST;
var PORT = process.env.GRAPHITE_PORT;

// Error messages
var ENV_VAR_ERROR_MSG = 'Graphite environment variables were not defined';
var PARAM_ERROR_MSG = 'Graphite initialization parameters are missing';
var METRIC_ERROR_MSG = 'Unable to write metric into Graphite because some parameters were missing';

// Constants
var DEFAULT_SERVER_NAME = 'bbserver';


/**
 *  Initializes Graphite client
 *
 *  @{param} (String) environment First generic metric path hierarchy component
 *  @{param} (String) application Second generic metric path hierarchy component
 *  @{param} (String) serverName Third generic metric path hierarchy component
 *  @{param} (function) callback A callback function in the form of callback(err)
 */
function GraphiteClient(environment, application, serverName, callback) {
    if (!(this instanceof GraphiteClient)) {
        return new GraphiteClient(environment, application, serverName, callback);
    }

    var self = this;

    if (!HOST || !PORT) {
        return callback(ENV_VAR_ERROR_MSG);
    }

    if (!environment || !application) {
        return callback(PARAM_ERROR_MSG);
    }

    if (!serverName) {
        serverName = DEFAULT_SERVER_NAME;
    }

    var clientPath = 'plaintext://' + HOST + ':' + PORT + '/';

    self.client = graphite.createClient(clientPath);
    self.metricPathPrefix = [environment, application, serverName].join('.');

    return callback();
}

/**
 *  Uploads metric into Graphite
 *
 *  @{param} (String) metricPathPostfix Specific metric path components
 *  @{param} (String) metricValue Metric value
 *  @{param} (Number) metricTimestamp Unix epoch time metric timestamp in milliseconds
 *  Default: method execution current time
 *  @{param} (function) callback A callback function in the form of callback(err)
 */
GraphiteClient.prototype.write = function write(metricPathPostfix, metricValue, metricTimestamp, callback) {
    if (!metricPathPostfix || !metricValue || !callback) {
        return callback(METRIC_ERROR_MSG);
    }

    if (!metricTimestamp) {
        metricTimestamp = Date.now();
    }

    var self = this;
    var metric = {};
    var path = self.metricPathPrefix + '.' + metricPathPostfix;

    metric[path] = metricValue;

    return self.client.write(metric, metricTimestamp, callback);
};

module.exports = GraphiteClient;
