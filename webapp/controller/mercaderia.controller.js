sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ndc/BarcodeScanner",
	"sap/ui/core/Fragment"
], function (Controller, Filter, FilterOperator,BarcodeScanner,Fragment) {
	"use strict";

	return Controller.extend("cozzuolsalidaTrasladoAlmacenes.controller.mercaderia", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf cozzuol.salidaTrasladoAlmacenes.view.mercaderia
		 */
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();	
			oRouter.getRoute("mercaderia").attachMatched(this._onRouteMatched, this);
		},
		
		onSelectMateriales: function () {
			var oView = this.getView();
			this._oDialogMats = Fragment.load({
				name: "cozzuol.salidaTrasladoAlmacenes.fragments.MaterialesDialog",
				controller: this
			}).then(function (oValueHelpDialog) {
				oView.addDependent(oValueHelpDialog);
				return oValueHelpDialog;
			});
			this._oDialogMats.then(function (oValueHelpDialog) {
				oValueHelpDialog.open();
			}.bind(this));
		},
		
		onDelete: function(oEvent){
			//get the index of the selected row
			var array = oEvent.oSource.sId.split('-')
			var index = array[array.length - 1];
			 //get the model 
			   this.getModel("Periods").YourListItemsOBJECTorArray.splice(index, 2);
			 //refresh the model to let the UI know that there's change in the data.
			   sap.ui.getCore().getModel("Periods").refresh(true);		
    		},
		
		_onRouteMatched: function (oEvent) {
			var oArgs, oView, texto, header;
			oArgs = oEvent.getParameter("arguments");
			oView = this.getView();
			header = oView.byId("Header");
			texto = "Centro: " + oArgs.Centro + " - " + oArgs.DesCentro;
			header.setTitle(texto);
			//header.setIntro(oArgs.DesCentro);
			header = oView.byId("origen");
			texto = "Origen: " + oArgs.Almacen1 + " - " + oArgs.DesAlmacen1;
			header.setText(texto);
			header = oView.byId("destino");
			texto = "Destino: " + oArgs.Almacen2 + " - " + oArgs.DesAlmacen2;
			header.setText(texto);
			header = oView.byId("pasos");
			texto = "Tipo de traslado: " + oArgs.Pasos;
			header.setText(texto);
		},
		onSearchMaterial: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				aFilters.push(new Filter([
					new sap.ui.model.Filter("Material", FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("Descripcion", FilterOperator.Contains, sQuery)
				], false));
			}
			// update list binding
			var oList = this.byId("tableDetail");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters, "Application");
		},

		onPressDetailBack: function () {
			this.getOwnerComponent().getRouter().navTo("Menu", {}, true);
		},
		onQRScan: function (oEvent) {
			var that = this;
			sap.ndc.BarcodeScanner.scan(
				function (mResult) {
					sap.ui.core.BusyIndicator.show(0);
					that.lecturaValida(mResult);
				},
				function (Error) {
					jQuery.sap.require("sap.m.MessageBox");
					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						sap.m.MessageBox.error(
							"No se Pudo Leer el código de barras " + Error, {
								styleClass: bCompact ? "sapUiSizeCompact" : ""
							}
						);
				}
			);
		},

		lecturaValida: function (sCode) {
			sap.m.MessageToast.show(sCode);
			sap.ui.core.BusyIndicator.hide();
			var oModel = this.getOwnerComponent().getModel("TableModel");
			var json = oModel.getJSON();
			var aTable = this.onAddRow(sCode);
			json .push(aTable);
			var oJSONseg = new sap.m.JSONModel();
			oJSONseg.setData(json);
			this.getView().setModel(oJSONseg, "TableModel");
			this.getOwnerComponent().getModel("TableModel").setData(json);
			
		},
		onAddRow: function (sCode) {
			var oNewRow = { "Material"	:sCode.text,
							"Descripcion": "Tarugo 12x3",
							"Cantidad"	: "10",
							"UME": "CM",
							"Lote": "101381",
							"CIValor": "1113"};
			return oNewRow;
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf cozzuol.salidaTrasladoAlmacenes.view.mercaderia
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf cozzuol.salidaTrasladoAlmacenes.view.mercaderia
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf cozzuol.salidaTrasladoAlmacenes.view.mercaderia
		 */
		//	onExit: function() {
		//
		//	}

	});

});