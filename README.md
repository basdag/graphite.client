Graphite Client
=====================
[![Build Status](https://travis-ci.org/brandingbrand/graphite.client.svg?branch=master)](https://travis-ci.org/brandingbrand/graphite.client)
[![Coverage Status](https://coveralls.io/repos/basdag/graphite.client/badge.svg?branch=master)](https://coveralls.io/r/basdag/graphite.client)

Standardizes and storages metrics into Graphite monitoring tool

Install
---------------
```
npm install git+https://brandingbrand@github.com/brandingbrand/graphite.client.git#v1.1 --save
```

Format
---------------
Graphite metrics are standardizes in the following form

```
environment.application.serverName.client.event
```

In the Graphite Client initialization `environment - application - serverName` are fixed for the entire following metrics ingestion, since it should be constant across the project

**Note**: The server name could be retrieve using the follow command

```
var os = require('os');

os.hostname().replace(/\./g, '-')
```

**Warning**: None of the metric format components should contain **dots**, since this is use by Graphite for separation of concerns. A violation of this standard will cause an exception on the **initialization** or an error in the **write** process


Usage
---------------
```
var Graphite = require('graphite.client');

var graphite = new Graphite(environment, application, serverName);

graphite.write(client, event, value, function didUploadMetric(err) {
    // If err is null, your data was sent to graphite!
    // Result Ex.: <production>.<server-name>.<client-name>.<event-name> <value> <timestamp> 
});

graphite.writeBucket(client, event, timestamp, value, function didUploadMetric(err) {
    // If err is null, your data was sent to graphite!
    // Result Ex.: <production>.<server-name>.<client-name>.<event-name>.<year>.<month>.<day>.<hour> <value> <timestamp>
});

```

Configuration
---------------
The module requires the following environment variables to configure its behavior

| Variable | Description |
| -------- | ----------- |
| GRAPHITE_HOST | Graphite storage hostname |
| GRAPHITE_PORT | Graphite storage port |
