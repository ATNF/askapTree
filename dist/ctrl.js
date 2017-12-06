'use strict';

System.register(['app/plugins/sdk', 'lodash', 'jquery', './external/d3.min', './css/tree.css!', './external/tree'], function (_export, _context) {
	"use strict";

	var MetricsPanelCtrl, _, $, d3, _createClass, treePanelCtrl;

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
			MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
		}, function (_lodash) {
			_ = _lodash.default;
		}, function (_jquery) {
			$ = _jquery.default;
		}, function (_externalD3Min) {
			d3 = _externalD3Min;
		}, function (_cssTreeCss) {}, function (_externalTree) {}],
		execute: function () {
			_createClass = function () {
				function defineProperties(target, props) {
					for (var i = 0; i < props.length; i++) {
						var descriptor = props[i];
						descriptor.enumerable = descriptor.enumerable || false;
						descriptor.configurable = true;
						if ("value" in descriptor) descriptor.writable = true;
						Object.defineProperty(target, descriptor.key, descriptor);
					}
				}

				return function (Constructor, protoProps, staticProps) {
					if (protoProps) defineProperties(Constructor.prototype, protoProps);
					if (staticProps) defineProperties(Constructor, staticProps);
					return Constructor;
				};
			}();

			// Include the d3 library
			window.d3 = d3;
			console.log(d3);

			_export('MetricsPanelCtrl', _export('treePanelCtrl', treePanelCtrl = function (_MetricsPanelCtrl) {
				_inherits(treePanelCtrl, _MetricsPanelCtrl);

				function treePanelCtrl($scope, $injector) {
					_classCallCheck(this, treePanelCtrl);

					var _this = _possibleConstructorReturn(this, (treePanelCtrl.__proto__ || Object.getPrototypeOf(treePanelCtrl)).call(this, $scope, $injector));

					//		_.defaults(this.panel, panelDefaults);
					_this.panelContainer = null;
					_this.panel.svgContainer = null;
					_this.treeObj = null;
					_this.panel.treeDivId = 'tree_svg_' + _this.panel.id;
					_this.containerDivId = 'container_' + _this.panel.treeDivId;
					return _this;
				}

				_createClass(treePanelCtrl, [{
					key: 'setContainer',
					value: function setContainer(container) {
						this.panelContainer = container;
						this.panel.svgContainer = container;
					}
				}, {
					key: 'link',
					value: function link(scope, elem) {
						var treeByClass = elem.find('.grafana-d3-tree');
						treeByClass.append('<div if="' + this.containerDivId + '"></div>');
						var container = treeByClass[0].childNodes[0];
						this.setContainer(container);
						//console.log("Calling makeTree function");
						this.treeObj = new makeTree(this.panelContainer);
					}
				}]);

				return treePanelCtrl;
			}(MetricsPanelCtrl)));

			treePanelCtrl.templateUrl = 'partials/template.html';

			_export('treePanelCtrl', treePanelCtrl);

			_export('MetricsPanelCtrl', treePanelCtrl);
		}
	};
});
//# sourceMappingURL=ctrl.js.map
