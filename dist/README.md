# Australian Square Kilometer Array Pathfinder Telescope Tree

This panel plugin for Grafana allows the user to graphically drill down to the exact measurement point desired in the ASKAP influxDB database. It is intended to be used with scripted dashboards, and hence a node with no sprouting children will link to a scripted dashboard to view the desired measurement.

## Functionality

The panel currently upon startup uses a jquery request to grab the metadata for the tag values of the ASKAP array. With this, it generates three levels of nodes, allowing the user to drill down to a measurement. It then uses another jquery request to grab all the field key values for the measurements, allowing the user to select the field key to plot. As the nodes are dynamically allocated, as elements change in the database, so too will the hierarchy.

## To Be Implemented:

* Implement jquery request in the scripted dashboard file to grab all of the tag keys associated with the measurement.
* Add editor tab to customise look of tree.
* Create a shell script to move the scripted dashboard file to the public/dashboards directory in the users Grafana installation.

## Usage

* Navigate into src/externals and open tree.js in your text editor. At the end of the file, the Grafana port number will need to be changed to the port number the user specified in their Grafana installation.

#### Acknowledgments

This plugin heavily relies on code from the following d3 example:

* https://bl.ocks.org/d3noob/43a860bc0024792f8803bba8ca0d5ecd#index.html
