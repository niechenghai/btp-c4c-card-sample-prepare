sap.ui.define([
	"sap/base/Log",
    "uipart/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast'
],
	/**
     * 
     * @param {*} Log 
     * @param {*} Controller 
     * @param {*} JSONModel 
     * @param {*} MessageToast 
     */
	function (Log, Controller, JSONModel, MessageToast) {
		"use strict";

		return Controller.extend("uipart.controller.Main", {

            api: {
                card: "/svc/card/recognition",
                c4c: "/svc/c4c/createCustomer"
            },


			onInit: function () {
                this.oUIModel = new JSONModel({
                    showCamera: false,
                    snapshot: "",
                    busy: false,
                    loadingImage: false,
                    savingCustomers: false,
                    cardInfo: {
                    }
                });

                this.setModel(this.oUIModel, "UIModel");
            },
            
            onSnapshot: function (oEvent) {
                // The image is inside oEvent, on the image parameter,
                // let's grab it.
                var sSnapshot = oEvent.getParameter("image");
                console.log(sSnapshot);
                this.oUIModel.setProperty("/snapshot", sSnapshot);

                // sent to baidu API to get card info
                // var param = sSnapshot.slice(22); //{"image": sSnapshot.slice(22)}; //remove "data:image/png;base64,"
                this.recognize(sSnapshot);
            },

            getAccessToken: function(callback) {
                return jQuery.ajax({
                    async: false,
                    url: this.api.card,
                    type: "get",
                    data: "",
                    headers: {"X-CSRF-Token": "fetch"},
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).done(function(data, textStatus, jqXHR) {

                    var csrfToken = jqXHR.getResponseHeader("X-CSRF-Token");
                    console.log("csrfToken=" + csrfToken);
                    if (csrfToken && callback) {
                        callback(csrfToken);
                    }
                });
            },

            recognize: function(dataUrl) {

                //var param = dataUrl.slice(22); //{"image": sSnapshot.slice(22)}; //remove "data:image/png;base64,"
                var param = dataUrl.slice(dataUrl.indexOf(";base64,") + 8);
                this.oUIModel.setProperty("/busy", true);
                // this.getAccessToken(function(csrfToken) {
                    jQuery.ajax({
                        async: true,
                        url: this.api.card,
                        type: "post",
                        data: param,
                        // headers: {"X-CSRF-Token": csrfToken},
                        contentType: "application/json; charset=utf-8",
                        dataType: "json"
                    }).done(function(data, textStatus, jqXHR) {
                        if (data.words_result_num > 0) {
                            data.words_result && this.oUIModel.setProperty("/cardInfo", data.words_result);
                        } else {
                            MessageToast.show("Please retry!", {duration: 3000});
                            console.error("can not recognize the card, please retry!");
                        }
                    }.bind(this)).always(function(jqXHR, textStatus) {
                        this.oUIModel.setProperty("/showCamera", false);
                        this.oUIModel.setProperty("/busy", false);
                        var oCamera = this.getView().byId("idCamera");
                        oCamera.stopCamera();
                    }.bind(this));
                // }.bind(this));
            },

            onStartScan: function(oEvent) {
                this.oUIModel.setProperty("/snapshot", "");
                this.oUIModel.setProperty("/showCamera", true);
            },

            onSaveCard: function(oEvent) {
                var card = this.oUIModel.getData().cardInfo;
                Log.info("=========card info: ", card);

                var customer = {
                    name: card.NAME && card.NAME.length > 0 ? card.NAME[0] : "",
                    title: card.TITLE && card.TITLE.length > 0 ? card.TITLE[0] : "",
                    company: card.COMPANY && card.COMPANY.length > 0 ? card.COMPANY[0] : "",
                    addr: card.ADDR && card.ADDR.length > 0 ? card.ADDR[0] : "",
                    pc: card.PC && card.PC.length > 0 ? card.PC[0] : "",
                    mobile: card.MOBILE && card.MOBILE.length > 0 ? card.MOBILE[0] : "",
                    tel: card.TEL && card.TEL.length > 0 ? card.TEL[0] : "",
                    fax: card.FAX && card.FAX.length > 0 ? card.FAX[0] : "",
                    email: card.EMAIL && card.EMAIL.length > 0 ? card.EMAIL[0] : "",
                    url: card.URL && card.URL.length > 0 ? card.URL[0] : "",
                };

                this.oUIModel.setProperty("/savingCustomer", true);

                this.getAccessToken(function(csrfToken) {
                    jQuery.ajax({
                        async: true,
                        url: this.api.c4c,
                        type: "post",
                        headers: {"X-CSRF-Token": csrfToken},
                        data: JSON.stringify(customer),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json"
                    }).done(function(data, textStatus, jqXHR) {
                        console.log(data, textStatus);
                        if (data) {
                            MessageToast.show("创建成功！", {duration: 2000});
                        } else {
                            MessageToast.show("创建失败！", {duration: 2000});
                        }
                    }.bind(this)).always(function(jqXHR, textStatus) {
                        console.log(jqXHR, textStatus);
                        this.oUIModel.setProperty("/savingCustomer", false);
                    }.bind(this));
                }.bind(this));

            },

            handleValueChange: function(oEvent) {
                this.oUIModel.setProperty("/loadingImage", true);
                this.oUIModel.setProperty("/snapshot", "");
                var that = this;
                var file = oEvent.getParameters().files[0];
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function(e){
                    that.oUIModel.setProperty("/snapshot", e.target.result);
                    that.oUIModel.setProperty("/loadingImage", false);
                    that.recognize(e.target.result);
                }

            }


		});
	});
