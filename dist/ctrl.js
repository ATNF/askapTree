'use strict';

System.register(['app/plugins/sdk', './d3', './tree'], function (_export, _context) {
	"use strict";

	var PanelCtrl, d3, treePanelCtrl;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _possibleConstructorReturn(self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return call && (typeof call === "object" || typeof call === "function") ? call : self;
	}

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	return {
		setters: [function (_appPluginsSdk) {
			PanelCtrl = _appPluginsSdk.PanelCtrl;
		}, function (_d) {
			d3 = _d;
		}, function (_tree) {}],
		execute: function () {
			_export('treePanelCtrl', treePanelCtrl = function (_PanelCtrl) {
				_inherits(treePanelCtrl, _PanelCtrl);

				function treePanelCtrl($scope, $injector) {
					_classCallCheck(this, treePanelCtrl);

					var _this = _possibleConstructorReturn(this, (treePanelCtrl.__proto__ || Object.getPrototypeOf(treePanelCtrl)).call(this, $scope, $injector));

					_.defaults(_this.panel, panelDefaults);
					return _this;
				}

				return treePanelCtrl;
			}(PanelCtrl));

			_export('treePanelCtrl', treePanelCtrl);

			treePanelCtrl.templateUrl = 'partials/template.html';
		}
	};
});
//# sourceMappingURL=ctrl.js.map
