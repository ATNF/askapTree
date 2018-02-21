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

// callback function runs when jquery call to grab plot information returns
return function(callback) {
 
    var dashboard; // Variable to be pushed to Grafana

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

    var meas = ""; // Used to hold the measurement argument passed in via the URL
    var field = ""; // Used to hold the field argument passed in via the URL
    var plotType = ""; // Used to hold the argument specifying what type of panel to make
    var dispOpt = ""; // Used ot hold the argument specifying how the user wishes to view the plot
    var tags = []; // Used to hold the valid tag keys for the measurement grabbed from the jquery call
    var groupBy = []; // Populated later in this file to be pushed to the dashboard
    var sourceType = "auto";
    var dataSource = "auto";
    var format = "short";
    var points = true; // Default to having points displayed
    var pointMode = "null"; // Default to not having the points connected
    var pointRadius = 1;
    var tagKeys = null; // Used to hold the array of tag keys returned from the jquery call
    var element = null; // Used to iterate through the tagKeys array to check for badly named keys that can cause errors while plotting
    var dropDown; // Temp object used to hold the templating information for the Grafana dashboard
    var aliasString = ""; // Used to store the aliases for the tag keys pushed to the dashboard
    var newType = ""; // Used to hold the string dictating the new plot type to redirect to when the user clicks the hyperlink below the graph
    var otherPlotName = ""; // Used to provide the user with information on what the other type of plot will show them
    var url = ''; // Used to hold the value of the Grafana server for redirecting the user to the other plot type when the link is clicked
    var meanObj = null; // Used to tell Grafana to include mean() in the select field of the metrics tab when the plot type is a graph

    // This section checks to see if the arguments for the measurement and field have been passed in via the URL.
    // If they have been defined, they are passed into the corresponding vars.
    if(!_.isUndefined(ARGS.meas)) {
        meas = ARGS.meas;
    }

    if(!_.isUndefined(ARGS.field)) {
        field = ARGS.field;
    }

    if(!_.isUndefined(ARGS.plotType)) {
        plotType = ARGS.plotType;
    }

    if(!_.isUndefined(ARGS.dispOpt)) {
        dispOpt = ARGS.dispOpt;
    }

    // Switch based on the display option parameter passed in via the URL. Following the convention stated in tree.js, 0 signifies points only. 1 signifies lines only.
    // 2 signifies both points and lines.
    switch(dispOpt) {
        case "0":
            points = true;
            pointMode = "null";
            break;
        case "1":
            points = false;
            pointMode = "connected";
            break;
        case "2":
            points = true;
            pointMode = "connected";
            break;
        default:
            break;
    }

    // If the plot type is graph, group the measurements by time. Doesn't make sense to include this in discrete plots.
    if(plotType == "graph") {
        groupBy.push({"params": [ "$ti" ], "type": "time" }); // time($ti) Group By parameter for the dashboard.    
    }

    // Makes a call to the akingest01 server, passing in the measurement and field for the desired plot.
    // Returns a JSON object containing units, description and valid tag set.
    $.ajax( {
        method: 'GET',
        url: "http://akingest01.atnf.csiro.au:5000/influx?",
        type: 'POST',
        data: { measurement: meas, field: field},
        datatype: 'json'
    }).done(function(result) {

        tagKeys = result["tags"]; // Stores the array of valid tag keys for the measurement

        // Creates a dropdown list on top of the generated plot allowing the user to select the time to plot over.
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
        ]};

        // set a title
        dashboard.title = result["desc"];
        dashboard.hideControls = true;

        // Need to push all of the dropdown lists to the dashboard on top of the plot.
        // It returns an array of three elements - the first is to be pushed to dashboard, the second to tags and the third to groupBy.
        for(var i=0; i<tagKeys.length; i++) {
            dropDown = dropDownGen(tagKeys[i], meas, i); // Pass control to dropDownGen function to make needed elements.
            dashboard.templating.list.push (dropDown[0]); // Push drop down list to top of dashboard.
            tags.push (dropDown[1]); // Push information to Grafana telling it to update tags based on dropdown list value.
            groupBy.push (dropDown[2]); // Push information to Grafana telling it to group by the valid tag set returned by the jquery.
        }    

        dashboard.rows.push({
            "collapse": false,
            "height": "250px",
            "panels": [
                {
                    "aliasColors": {},
                    "bars": false,
                    "datasource": "ASKAP",
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
                    "points": points,
                    "renderer": "flot",
                    "seriesOverrides": [
                        {
                            "yaxis": 2
                        }
                    ],
                    "span": 12,
                    "stack": false,
                    "steppedLine": false,
                    "targets": [
                        {
                            "alias" : "", // Populate this field later
                            "dsType": "influxdb",
                            "groupBy": groupBy,
                            "measurement": meas,
                            "policy": "default",
                            "refId": "A",
                            "resultFormat": "time_series",
                            "select": [
                                [
                                    {
                                        "params": [
                                            field
                                        ],
                                        "type": "field"
                                    }
                                ]
                            ],
                            "tags": tags
                        }
                    ],
                    "thresholds": [],
                    "timeFrom": null,
                    "timeShift": null,
                    "title": result["desc"],
                    "tooltip": {
                        "msResolution": true,
                        "shared": true,
                        "sort": 0,
                        "value_type": "cumulative"
                    },
                    "type": plotType,
                    "xaxis": {
                        "mode": "time",
                        "name": null,
                        "show": true,
                        "values": []
                    },
                    "yaxes": [
                        {
                            "format": format,
                            "label": result["units"],
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

        // If the plot type is graph, add mean() to the select field
        if(plotType == "graph") {
            dashboard.rows[0]["panels"][0]["targets"][0]["groupBy"].push({"params": [ "null" ], "type": "fill" }); // Push the fill(null) Group By to Grafana
            meanObj = new Object();
            meanObj.params = [];
            meanObj.type = "mean";
            dashboard.rows[0]["panels"][0]["targets"][0]["select"][0].push(meanObj);
        }

        // Make a comma seperated string for the tag aliases to increase readability of the plot
        for(i=0; i<tagKeys.length; i++) {
            aliasString += "[[tag_"+tagKeys[i]+"]]";

            if(i != (tagKeys.length-1)) { // If there are multiple tag keys, include a comma and a space until the last one is read
                aliasString += ", ";
            }
        }

        dashboard.rows[0]["panels"][0]["targets"][0].alias = aliasString; // Populate empty field with the generate alias string

        // Push a panel beneath the plot allowing the user to quickly jump to a discrete plot of the same measurement
        if(plotType == "graph") {
            newType = "coprglory-discrete-panel";
            otherPlotName = "discrete time plot";
        }

        else if(plotType == "coprglory-discrete-panel") {
            newType = "graph";
            otherPlotName = "time series graph"
        }
        
        url = window.location.href; // Grab the URL as a string
        url = url.substring(0, url.indexOf('/dash')); // Get rid of everything after the port number as it is not needed.

        dashboard.rows.push({ // Simply create a panel displaying the text "Failed to lookup name"
            title: 'Chart',
            height: '20px',
            panels: [
                {
                    title: "",
                    type: 'text',
                    span: 12,
                    fill: 1,
                    mode: "html",
                    content: "<p>\n\t<a target=\"_blank\" href=\""+url+"/dashboard/script/askapMonitor.js?meas="+meas+"&field="+field+"&plotType="+newType+"&dispOpt="+dispOpt+"\"><h4 align=\"center\">View this measurement as a "+otherPlotName+" instead</h4></a>\n</p>"
                }
            ]
        });;
        callback(dashboard); // Return the completed dashboard

    }).fail(function(result) { // If the call to the database failed, handle the error
        dashboard.rows.push({ // Simply create a panel displaying the text "Failed to lookup name"
            title: 'Chart',
            height: '300px',
            panels: [
                {
                    title: "Error",
                    type: 'text',
                    span: 12,
                    fill: 1,
                    content: 'Failed to lookup name'
                }
            ]
        });

        callback(dashboard); // Return the error dashboard

    })
};

// dropDownGen takes three arguments - the tag key to select values from, the measurement value, and the status of the
// incrementor loop this function is called from. It returns an object with three elements. Descriptions for these 
// elements can be seen in their usage in the above function.
function dropDownGen(key, meas, i) {
    var withoutQs = key; // Used to hold the altered keyname without question marks for the templating name
    // Strip ??? from badly named tag keys until a workaround is made
    if(key.includes("?")) {
        withoutQs = key.replace(/\?/g, "");
    } 

    var retVal = [
        // Generate the dropdown
        {
            "allValue": null,
            "current": {
                "text": "", //All
                "value": [ "ak01" ] // Default to display all keys on page load $_all
            },
            "datasource": "ASKAP",
            "hide": 0,
            "includeAll": true,
            "label": withoutQs,
            "multi": true,
            "name": withoutQs,
            "options": [],
            "query": "show tag values from \""+meas+"\" with key =\""+key+"\"", // database query
            "refresh": 1,
            "regex": "",
            "sort": 0,
            "tagValuesQuery": "",
            "tags": [],
            "tagsQuery": "",
            "type": "query",
            "useTags": false
        },
        // Tell Grafana to update the information being displayed based on the drop down value
        {
            "operator" : '=~',
            "key"       : key,
            "value"     : "/^$"+withoutQs+"$/"
        },
        // Tell Grafana how to group the data
        {
            "params": [ key ], 
            "type": "tag"
        }];

    // If there are multiple valid keys in the tag set, Grafana needs to logical AND them together to display on the same plot.
    // Therefore, on each iteration of the for loop this function is called in after the first, string together with an AND.
    if(i != 0) {
        retVal[1].condition = "AND";
    }
    
    if(key == "d???") {
        retVal[0].label = "dom";
        retVal[0].name = "dom";
        retVal[1].value = "/^$dom$/";
    }

    if(key == "s???") {
        retVal[0].label = "blocks";
        retVal[0].name = "blocks";
        retVal[1].value = "/^$blocks$/";
    }

    return retVal; // Return the object
}
