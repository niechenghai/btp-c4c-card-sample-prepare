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
                // c4c: "/svc/c4c/createCustomer"
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
                var notNull = function(arr) {
                    return arr && arr.length > 0 ? arr[0] : "";
                }
                var customer = {
                    name: notNull(card.NAME),
                    title: notNull(card.TITLE),
                    company: notNull(card.COMPANY),
                    addr: notNull(card.ADDR),
                    pc: notNull(card.PC),
                    mobile: notNull(card.MOBILE),
                    tel: notNull(card.TEL),
                    fax: notNull(card.FAX),
                    email: notNull(card.EMAIL),
                    url: notNull(card.URL),
                };

                this.oUIModel.setProperty("/savingCustomer", true);

                // this.getAccessToken(function(csrfToken) {
                //     jQuery.ajax({
                //         async: true,
                //         url: this.api.c4c,
                //         type: "post",
                //         headers: {"X-CSRF-Token": csrfToken},
                //         data: JSON.stringify(customer),
                //         contentType: "application/json; charset=utf-8",
                //         dataType: "json"
                //     }).done(function(data, textStatus, jqXHR) {
                //         console.log(data, textStatus);
                //         if (data) {
                //             MessageToast.show("创建成功！", {duration: 2000});
                //         } else {
                //             MessageToast.show("创建失败！", {duration: 2000});
                //         }
                //     }.bind(this)).always(function(jqXHR, textStatus) {
                //         console.log(jqXHR, textStatus);
                //         this.oUIModel.setProperty("/savingCustomer", false);
                //     }.bind(this));
                // }.bind(this));

                // For C4C request
                var oDataModel = this.getOwnerComponent().getModel();
                var postData = {
                    "LastName": customer.name,
                    "FirstName": customer.name,
                    "Phone": customer.tel,
                    "Email": customer.email,
                    "Fax": customer.fax,
                    "Mobile": customer.mobile,
                    "WebSite": customer.url
                };
                
                oDataModel.create("/IndividualCustomerCollection", postData, {
                    success: function(data, oRes) {
                        console.log(data);
                        this.oUIModel.setProperty("/savingCustomer", false);
                        MessageToast.show("Create success!");
                        
                    }.bind(this),
                    error: function(oError) {
                        console.log(oError);
                        this.oUIModel.setProperty("/savingCustomer", false);
                        MessageToast.show("Create failed!");
                    }.bind(this)
                });

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
