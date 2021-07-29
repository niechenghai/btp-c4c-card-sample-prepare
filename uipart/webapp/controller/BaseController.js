/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Button",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/ui/model/json/JSONModel"
], function (Controller, Button, History, MessageToast, Dialog, Text, JSONModel) {
	"use strict";

	return Controller.extend("uipart.controller.BaseController", {

		onInit: function () {
			this._oModel = this.getOwnerComponent().getModel();
			this._modelChanged = false;
		},

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		}

	});

});