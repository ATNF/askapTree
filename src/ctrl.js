import {PanelCtrl} from 'app/plugins/sdk';
import './tree'; // Include the sample d3 hierarchy code
import * as d3 from './d3'; // Include the d3 library
import './css/tree.css' // Import the css for the tree

export class treePanelCtrl extends PanelCtrl {
	constructor($scope, $injector) {
		super($scope, $injector);
		_.defaults(this.panel, panelDefaults);
	}
}

treePanelCtrl.templateUrl = 'partials/template.html';