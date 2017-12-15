/* global _ */
 
/*
 * Complex scripted dashboard
 * This script generates a dashboard object that Grafana can load. It also takes a number of user
 * supplied URL parameters (in the ARGS variable)
 *
 * Global accessable variables
 * window, document, $, jQuery, ARGS, moment
 *
 * Return a dashboard object, or a function
 *
 * For async scripts, return a function, this function must take a single callback function,
 * call this function with the dashboard object
 */
 
'use strict';
 
// accessible variables in this scope
var window, document, ARGS, $, jQuery, moment, kbn;
 
return function(callback) {
 
  var unitsToFormat = {"C" : "celcius"};
 
  // Setup some variables
  var dashboard;
 
  // Intialize a skeleton with nothing but a rows array and service object
  dashboard = {
    rows : [],
    services : {}
  };
 
  // Set default time
  // time can be overriden in the url using from/to parameters, but this is
  // handled automatically in grafana core during dashboard initialization
  dashboard.time = {
      from: "now-7d",
      to: "now"
  };
  dashboard.timezone = "browser";
 
  var pvName = "";
  var antenna = "";
  var sourceType = "auto";
  var dataSource = "auto";
  var format = "short";
  var pointMode = "null";
  var pointRadius = 1;
 
  if(!_.isUndefined(ARGS.pvname)) {
    pvName = ARGS.pvname;
  }
 
  if(!_.isUndefined(ARGS.antenna)) {
    antenna = ARGS.antenna;
  }
 
  if(!_.isUndefined(ARGS.sourceType)) {
    sourceType = ARGS.sourceType;
  }
 
  if(!_.isUndefined(ARGS.dataSource)) {
    dataSource = ARGS.dataSource;
  }
 
  if(!_.isUndefined(ARGS.pointMode)) {
    pointMode = ARGS.pointMode;
  }
 
  if(!_.isUndefined(ARGS.pointRadius)) {
    pointRadius = ARGS.pointRadius;
  }
 
  $.ajax( {
      method: 'GET',
      url:    'http://akingest01.atnf.csiro.au:5000/pv/' + pvName.replace("ch90", "ak01"),
      dataType: 'json'
  }
  ).done(function(result) {
 
      if (antenna.length == 0) {
          // single antenna by default
          antenna = pvName.substring(0,4)
      }
      var antTitle = "";
      var antTemplateText = antenna;
      var antTemplateValue = antenna;
      var tags = result.tags.slice();
      var groupBy = [];
      var alias;
 
      groupBy.push({"params": [ "$ti" ], "type": "time" });
 
      // setup templates
      dashboard.templating = { "list": [
              {
                "auto": true,
                "auto_count": 500,
                "auto_min": "10s",
                "current": {
                  "text": "auto",
                  "value": "$__auto_interval"
                },
                "datasource": null,
                "hide": 0,
                "includeAll": false,
                "label": "Time Interval",
                "multi": false,
                "name": "ti",
                "options": [
                  {
                    "selected": true,
                    "text": "auto",
                    "value": "$__auto_interval"
                  },
                  {
                    "selected": false,
                    "text": "1m",
                    "value": "1m"
                  },
                  {
                    "selected": false,
                    "text": "10m",
                    "value": "10m"
                  },
                  {
                    "selected": false,
                    "text": "30m",
                    "value": "30m"
                  },
                  {
                    "selected": false,
                    "text": "1h",
                    "value": "1h"
                  },
                  {
                    "selected": false,
                    "text": "6h",
                    "value": "6h"
                  },
                  {
                    "selected": false,
                    "text": "12h",
                    "value": "12h"
                  },
                  {
                    "selected": false,
                    "text": "1d",
                    "value": "1d"
                  },
                  {
                    "selected": false,
                    "text": "7d",
                    "value": "7d"
                  },
                  {
                    "selected": false,
                    "text": "14d",
                    "value": "14d"
                  },
                  {
                    "selected": false,
                    "text": "30d",
                    "value": "30d"
                  }
                ],
                "query": "1m,10m,30m,1h,6h,12h,1d,7d,14d,30d",
                "refresh": 2,
                "type": "interval"
              }
            ]
          };
 
      // autodetect source type
      if (sourceType = "auto") {
          if (pvName.includes(":acx:")) {
              sourceType = "corr";
          }
          else if (pvName.includes(":stn")) {
              sourceType = "env";
          }
          else {
              sourceType = "ant";
          }
      }
 
      // autodetect database source
      if (dataSource = "auto") {
          if (pvName.startsWith("co")) {
              dataSource = "commissioning";
          }
          else {
              dataSource = "ASKAP";
          }
      }
 
      // setup query based on PV source type
      if (sourceType == "ant") {
          dashboard.templating.list.push ({
            "allValue": null,
            "current": {
              "tags": [],
              "text": antTemplateText,
              "value": [
                antTemplateValue
              ]
            },
            "datasource": dataSource,
            "hide": 0,
            "includeAll": true,
            "label": "Antennas",
            "multi": true,
            "name": "antennas",
            "options": [],
            "query": "show tag values from \"ade.paf.current\" with key = \"antenna\"",
            "refresh": 1,
            "regex": "",
            "sort": 0,
            "tagValuesQuery": "",
            "tags": [],
            "tagsQuery": "",
            "type": "query",
            "useTags": false
          });
          if (antenna == "all") {
              antTemplateText = "All";
              antTemplateValue = "$__all";
          }
          else {
              antTitle = antenna;
          }
          tags.push( {"operator" : '=~',
                      "key"       : "antenna",
                      "value"     : "/^$antennas$/"
                     });
          groupBy.push({"params": [ "antenna" ], "type": "tag" });
          alias =  "[[tag_antenna]]";
      }
      else if (sourceType == "corr") {
          tags.push( {"operator" : '=~',
                      "key"       : "s???",
                      "value"     : "/^$blocks$/"
                     });
          groupBy.push({ "params": [ "s???" ], "type": "tag" });
          alias =  "[[tag_s???]]";
          dashboard.templating.list.push ({
            "allValue": null,
            "current": {
              "tags": [],
              "text": "all",
              "value": [
                "all",
              ]
            },
            "datasource": dataSource,
            "hide": 0,
            "includeAll": true,
            "label": "Blocks",
            "multi": true,
            "name": "blocks",
            "options": [],
            "query": "show tag values from \"ade.cor.current\" with key = \"s???\"",
            "refresh": 1,
            "regex": "",
            "sort": 0,
            "tagValuesQuery": "",
            "tags": [],
            "tagsQuery": "",
            "type": "query",
            "useTags": false
          });
      }
 
      groupBy.push({"params": [ "null" ], "type": "fill" });
 
      // set a title
      dashboard.title = pvName;
      dashboard.hideControls = true;
 
      // set units if available
      //if (result.units in unitsToFormat) {
      //  format = unitsToFormat[result.units];
      //}
 
      dashboard.rows.push({
          "collapse": false,
          "height": "250px",
          "panels": [
            {
              "aliasColors": {},
              "bars": false,
              "datasource": dataSource,
              "editable": true,
              "error": false,
              "fill": 0,
              "grid": {},
              "id": 1,
              "legend": {
                "avg": false,
                "current": false,
                "max": true,
                "min": true,
                "show": true,
                "total": false,
                "values": true
              },
              "lines": true,
              "line1idth": 1,
              "links": [],
              "nullPointMode": pointMode,
              "percentage": false,
              "pointradius": pointRadius,
              "points": (pointRadius>0),
              "renderer": "flot",
              "seriesOverrides": [
                    {
                      "alias": "Ambient Temp",
                      "yaxis": 2
                    }
              ],
              "span": 12,
              "stack": false,
              "steppedLine": false,
              "targets": [
                {
                  "alias": alias,
                  "dsType": "influxdb",
                  "groupBy": groupBy,
                  "measurement": result.measurement,
                  "policy": "default",
                  "refId": "A",
                  "resultFormat": "time_series",
                  "select": [
                    [
                      {
                        "params": [
                          result.field
                        ],
                        "type": "field"
                      },
                      {
                        "params": [],
                        "type": "mean"
                      },
                    ]
                  ],
                  "tags": tags
                },
                {
                  "alias" : "Ambient Temp",
                  "dsType": "influxdb",
                  "groupBy": [
                    {
                      "params": [
                        "$ti"
                      ],
                      "type": "time"
                    },
                    {
                      "params": [
                        "null"
                      ],
                      "type": "fill"
                    }
                  ],
                  "measurement": "environment.weather",
                  "policy": "default",
                  "refId": "B",
                  "resultFormat": "time_series",
                  "select": [
                    [
                      {
                        "params": [
                          "Temperature"
                        ],
                        "type": "field"
                      },
                      {
                        "params": [],
                        "type": "mean"
                      }
                    ]
                  ],
                  "tags": []
                }
              ],
              "thresholds": [],
              "timeFrom": null,
              "timeShift": null,
              "title": antTitle + " " + result.desc + " (" + result.units + ")",
              "tooltip": {
                "msResolution": true,
                "shared": true,
                "sort": 0,
                "value_type": "cumulative"
              },
              "type": "graph",
              "xaxis": {
                "mode": "time",
                "name": null,
                "show": true,
                "values": []
              },
              "yaxes": [
                {
                  "format": format,
                  "label": null,
                  "logBase": 1,
                  "max": null,
                  "min": null,
                  "show": true
                },
                {
                  "format": "short",
                  "label": null,
                  "logBase": 1,
                  "max": null,
                  "min": null,
                  "show": true
                }
              ]
            }
          ],
          "repeat": null,
          "repeatIteration": null,
          "repeatRowId": null,
          "showTitle": false,
          "title": "Row",
          "titleSize": "h6",
      });
      // when dashboard is composed call the callback
      // function and pass the dashboard
      callback(dashboard);
    }).fail(function(result) {
        dashboard.rows.push({
          title: 'Chart',
          height: '300px',
          panels: [
            {
              title: pvName,
              type: 'text',
              span: 12,
              fill: 1,
              content: 'Failed to lookup PV name, check pv2influx service is running'
            }
          ]
        });
 
    // when dashboard is composed call the callback
    // function and pass the dashboard
    callback(dashboard);
 
  });
}
