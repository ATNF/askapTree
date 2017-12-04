import {PanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import * as d3 from './d3'; // Include the d3 library
import './css/tree.css!';
import './tree'; // Include the sample d3 hierarchy code

class treePanelCtrl extends PanelCtrl {
	
	constructor($scope, $injector) {
		super($scope, $injector);
//		_.defaults(this.panel, panelDefaults);
//		this.treeObj = new makeTree(); // Test line
	}
}

treePanelCtrl.templateUrl = 'partials/template.html';
export {
	treePanelCtrl,
	treePanelCtrl as PanelCtrl
};
