import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import $ from 'jquery';
import * as d3 from './external/d3.min'; // Include the d3 library
window.d3 = d3;
//console.log(d3);
import './css/tree.css!';
import './external/tree'; // Include the sample d3 hierarchy code

class treePanelCtrl extends MetricsPanelCtrl {
    constructor($scope, $injector) {
        super($scope, $injector);
//        _.defaults(this.panel, panelDefaults);
        this.panelContainer = null;
        this.panel.svgContainer = null;
        this.treeObj = null;
        this.panel.treeDivId = 'tree_svg_' + this.panel.id;
        this.containerDivId = 'container_' + this.panel.treeDivId;
    }

    setContainer(container) {
        this.panelContainer = container;
        this.panel.svgContainer = container;
    }

    link(scope, elem) {    
        var treeByClass = elem.find('.grafana-d3-tree');
        treeByClass.append('<div if="'+this.containerDivId+'"></div>');
        var container = treeByClass[0].childNodes[0];
        this.setContainer(container);
        //console.log("Calling makeTree function");
        this.treeObj = new makeTree(this.panelContainer);
    }
}

treePanelCtrl.templateUrl = 'partials/template.html';
export {
    treePanelCtrl,
    treePanelCtrl as MetricsPanelCtrl
};
