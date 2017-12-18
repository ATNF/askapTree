<p >
	<h1 align="center">Australian Square Kilometer Array Pathfinder Telescope</h1>
</p>
<p >
	<h2 align="center">Hierarchy Representation</h2>
</p>
This panel plugin for Grafana allows the user to graphically drill down to the exact measurement point desired in the ASKAP influxDB database. It is intended to be used with scripted dashboards, and hence a node with no sprouting children will link to a scripted dashboard to view the desired measurement.

## Functionality

The panel currently upon startup uses a jquery request to grab the metadata for the tag values of the ASKAP array. With this, it generates three levels of nodes, allowing the user to drill down to a measurement. It then uses another jquery request to grab all the field key values for the measurements, allowing the user to select the field key to plot. As the nodes are dynamically allocated, as elements change in the database, so too will the hierarchy.

## To Be Implemented:

* Add editor tab to customise look of tree.

## Usage

* Navigate into src/externals and open tree.js in your text editor. At the end of the file, the Grafana port number will need to be changed to the port number the user specified in their Grafana installation. Following this, run grunt in the root directory to move everything over to the dist directory.
* The file askapMonitor.js is used for generating the scripted dashboard specified by clicking the lowest leaf node in the hierarchy. In order to launch, the js file needs to be moved to the Grafana installation directory, placed in public/dashboards/.

## Acknowledgments

This plugin relies on source code from the following d3 example:

* https://bl.ocks.org/d3noob/43a860bc0024792f8803bba8ca0d5ecd#index.html
