<p >
	<h1 align="center">Australian Square Kilometer Array Pathfinder Telescope</h1>
</p>
<p >
	<h2 align="center">Hierarchy Representation</h2>
</p>
This panel plugin for Grafana allows the user to graphically drill down to the exact measurement point desired in the ASKAP influxDB database. It is intended to be used with scripted dashboards, and hence a node with no sprouting children will link to a scripted dashboard to view the desired measurement.

## Features

* The panel currently upon startup uses a jquery request to grab the metadata for the tag values of the ASKAP array. With this, it generates three levels of nodes, allowing the user to drill down to a measurement. It then uses another jquery request to grab all the field key values for the measurements, allowing the user to select the field key to plot. As the nodes are dynamically allocated, as elements change in the database, so too will the hierarchy.
* When the user clicks through all a branch of the ASKAP hierarchy, they will be presented with a field measurement which when clicked will launch a Grafana scripted dashboard to view the plot. Left clicking on the node will open the standard Grafana graph panel. Right clicking on the node will open a discrete time chart developed by CorpGlory. The scripted dashboard generated also has hyperlinks beneath the generated panel the allows the user to easily jump between the two types of plot for ease of access.
* When the user right clicks on a node that has children which are collapsed at that moment, an alert will open presenting the user with a URL which they can copy to their clipboard specifying the location in the tree they are currently examining. Pasting this URL into their browser will automatically open the node branch to the specified point. This feature allows users to share tree locations, or even to store the path of frequently visited nodes.
* A drop down box located at the top of the ASKAP Tree dashboard allows the user to select how they wish the graph panel to be displayed. The user has the option between displaying plots with only data points, with only data point connecting lines, or with both data points and connecting lines.

## To Be Implemented:

* Add editor tab to customise look of tree.

## Known Bugs:

* If the user right clicks on a leaf node to open a discrete time plot, then uses the hyperlink beneath the plot to redirect to a graph instead, their display options will not be recognised.

## Usage

* The file askapMonitor.js is used for generating the scripted dashboard specified by clicking the lowest leaf node in the hierarchy. In order to launch, the js file needs to be moved to the Grafana installation directory, placed in public/dashboards/.
* For functionality with the "Display Options" templated value, the main hierarchy is itself a scripted dashboard. Therefore the file treeDash.js needs to also be moved to the Grafana installation directory, placed in public/dashboards/.
* With the Grafana server running, go to the following address: **_YourGrafanaServer_**/dashboard/script/treeDash.js

## Acknowledgments

This plugin relies on source code from the following d3 example:

* https://bl.ocks.org/d3noob/43a860bc0024792f8803bba8ca0d5ecd#index.html
