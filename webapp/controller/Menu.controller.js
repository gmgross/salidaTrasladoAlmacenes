sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"cozzuolsalidaTrasladoAlmacenes/model/formatter",
	"sap/ndc/BarcodeScanner",
	'sap/ui/core/library'
], function(Controller, formatter, BarcodeScanner, coreLibrary) {
	"use strict";
	var ValueState = coreLibrary.ValueState;
	var centro, almacen1, almacen2, desCentro, desAlmacen1, desAlmacen2, pasos;
	return Controller.extend("cozzuolsalidaTrasladoAlmacenes.controller.Menu", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf cozzuol.salidaTrasladoAlmacenes.view.Menu
		 */
		formatter: formatter,
		onInit: function() {
			// this.getOwnerComponent().getModel("ViewModel").setProperty("/pic", "images/logo.png");
			this.setDataCentro();
		},
		setDataCentro: async function() {
			
			this.getOwnerComponent().getModel("TableModel").setData({
				"items": [{
					"Material": "123456",
					"Descripcion": "Tarugo 12x3",
					"Cantidad": "10",
					"UME": "CM",
					"Lote": "101381",
					"CIValor": "1113"
				},{
					"Material": "481246",
					"Descripcion": "Tornillo 12x3",
					"Cantidad": "16",
					"UME": "CM",
					"Lote": "712941",
					"CIValor": "1119"
				},{
					"Material": "937819",
					"Descripcion": "Arandela 1/4",
					"Cantidad": "9000",
					"UME": "CM",
					"Lote": "646901",
					"CIValor": "4413"
				},{
					"Material": "473434",
					"Descripcion": "Grower 1/4",
					"Cantidad": "9600",
					"UME": "CM",
					"Lote": "333444",
					"CIValor": "3137"
				}]
			});	
				
			this.getOwnerComponent().getModel("CantidadPasos").setData({
				"items": [{
					"CantidadPasos": "1",
					"Descripcion": "Un Paso"
				}, {
					"CantidadPasos": "2",
					"Descripcion": "Dos Pasos"
				}]
			});

			// debugger;
			try {
				var aData = await this.readService();
				this.getOwnerComponent().getModel("CentrosCollection").setData(aData.results[0].NAVCENTRO.results);
				this.getOwnerComponent().getModel("AlmacenesCollection").setData(aData.results[0].NAVALMACEN.results);
			} catch (err) {
				if (err.responseText !== undefined) {
					var error = JSON.parse(err.responseText).error.message.value;
					sap.m.MessageBox.error(error);
				} else {
					sap.m.MessageToast.show("Error al consultar oData");
				}
			}

		},
		readService: function () {
			return new Promise((res, rej) => {
				this.getOwnerComponent().getModel("ODataSalida").read("/DatosAyudaSet()", {
					urlParameters: {
						"$expand": "NAVCENTRO,NAVALMACEN"
					},
					success: res,
					error: rej
				});
			});
		},
		cargarCombos: function(tipo, var1,var2,var3){
			if(tipo = "centro"){
				this.getOwnerComponent().getModel("CentrosCollection").setData({
				"items": [{
					"Centro": var1,
					"Descripcion": var2
				}]
			});
			}
		},
		
		onQRScan: function(oEvent) {
			var that = this;
			sap.ndc.BarcodeScanner.scan(
				function(mResult) {
					sap.ui.core.BusyIndicator.show(0);
					that.lecturaValida(mResult);
				},
				function(Error) {
					var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
					sap.m.MessageBox.error(
						"No se Pudo Leer el código de barras " + Error, {
							styleClass: bCompact ? "sapUiSizeCompact" : ""
						}
					);
				}
			);
		},

		lecturaValida: function(sCode) {
			sap.ui.core.BusyIndicator.hide();
			this.getOwnerComponent().getRouter().navTo("mercaderia", {
				"Centro": centro,
				"DesCentro": desCentro,
				"Almacen1": almacen1,
				"DesAlmacen1": desAlmacen1,
				"Almacen2": almacen2,
				"DesAlmacen2": desAlmacen2,
				"Pasos": pasos
			}, true);
			//{},true);
		},

		navToMenu: function() {
			this.getOwnerComponent().getRouter().navTo("Menu", {}, true);
		},

		handleChange: function(oEvent) {
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState(ValueState.Error);
				oValidatedComboBox.setValueStateText("Ingrese una opcion valida");
			} else {
				oValidatedComboBox.setValueState(ValueState.None);
			}
		},

		handleCentro: function(oEvent) {
			centro = oEvent.getParameter("selectedItem").getKey();
			desCentro = oEvent.getParameter("selectedItem").getText();
			this.getView().byId("origen").getBinding("items").filter([
				new sap.ui.model.Filter(
					"Werks",
					"EQ",
					oEvent.getParameter("selectedItem").getKey())
			]);
			this.getView().byId("destino").getBinding("items").filter([
				new sap.ui.model.Filter(
					"Werks",
					"EQ",
					oEvent.getParameter("selectedItem").getKey())
			]);
		},
		handleAlmacen1: function(oEvent) {
			almacen1 = oEvent.getParameter("selectedItem").getKey();
			desAlmacen1 = oEvent.getParameter("selectedItem").getText();
		},
		handleAlmacen2: function(oEvent) {
			almacen2 = oEvent.getParameter("selectedItem").getKey();
			desAlmacen2 = oEvent.getParameter("selectedItem").getText();
		},
		handlePasos: function(oEvent) {
				pasos = oEvent.getParameter("selectedItem").getText();
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf cozzuol.salidaTrasladoAlmacenes.view.Menu
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf cozzuol.salidaTrasladoAlmacenes.view.Menu
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf cozzuol.salidaTrasladoAlmacenes.view.Menu
		 */
		//	onExit: function() {
		//
		//	}

	});

});