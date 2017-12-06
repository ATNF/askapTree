# askapTree

This panel plugin for Grafana allows the user to graphically drill down to the exact measurement point desired in the ASKAP influxDB database. It is intended to be used with scripted dashboards, and hence a node with no sprouting children will link to a scripted dashboard to view the desired measurement.

## To Be Implemented:

* Dynamically allocate child nodes to the corresponding parent as a result of a call to influxDB upon rendering the panel.
* Implement linking to scripted dashboard on lowest node click.
* Add editor tab to customise look of tree.

#### Acknowledgments

This plugin heavily relies on code from the following d3 example:

* https://bl.ocks.org/d3noob/43a860bc0024792f8803bba8ca0d5ecd#index.html