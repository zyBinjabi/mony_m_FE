sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "moneym/Controller/Helper/CRUD_z",
    "moneym/Controller/Helper/Validation_z",
    "moneym/Controller/Helper/Config",
    "moneym/Controller/Helper/CRUDService",
    "moneym/Controller/Helper/UiTableFSG",

  ],
  function (BaseController, JSONModel, CRUD_z, Validation_z, Config, CRUDService, UiTableFSG) {
    "use strict";

    return BaseController.extend("moneym.controller.Helper.BaseController", {
      onInit: function () {
        this.config = Config
        this.apiBaseUrl = this.config.apiBaseUrl
        this.access_token = localStorage.getItem("access_token")

        this.crudService = new CRUDService(this.apiBaseUrl, this.access_token)
        this.crud_z = new CRUD_z(this)
        this.validation_z = new Validation_z()
        this.uiTableFSG = new UiTableFSG(this)

        this.mainOModel = this.crud_z.oModel;


        this.helperModel = 'helperModel'
        this.getView().setModel(new sap.ui.model.json.JSONModel({}), this.helperModel)
        this.helpderModelInstase = this.getView().getModel(this.helperModel)
        this.setMode('Create')

        this._mViewSettingsDialogs = {};

      },
      // ================================== # xxxxx Functions # ==================================

      setMode: function (mode) {
        this.helpderModelInstase.setProperty('/Mode', mode)
      },

      getMode: function () {
        return this.helpderModelInstase.getData().Mode
      },

      // ================================== # xxxxx Functions # ==================================
      oPayload_modify_parent: function (oPayload) {
        const isEdit = this.getMode() == "Edit" ? true : false

        oPayload.Id = isEdit ? oPayload.Id : "0000000000"
        oPayload.CreatedDate = isEdit ? new Date(oPayload.CreatedDate) : new Date()
        oPayload.UpdatedDate = new Date()

        if ('__metadata' in oPayload) {
          delete oPayload['__metadata'];
        }

        return oPayload
      },

      test22: function () { console.log("from Test22!") },

      // ================================== # Dialog Functions # ==================================
      setDialogData: function (oDialog, dialogData) {
        // Custom logic to set data to the dialog
        if (oDialog && dialogData) {
          // Create a JSON model for the dialog data if not already present
          var oModel = oDialog.getModel("dialogModel");
          if (!oModel) {
            oModel = new sap.ui.model.json.JSONModel();
            oDialog.setModel(oModel, "dialogModel");
          }
          // Set the provided data to the dialog model
          oModel.setData(dialogData);
        }
      },

      getViewSettingsDialog: function (sDialogFragmentName, dialogData) {
        var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

        if (!pDialog) {
          pDialog = sap.ui.core.Fragment.load({
            id: this.getView().getId(),
            name: sDialogFragmentName,
            controller: this
          }).then(function (oDialog) {
            if (sap.ui.Device.system.desktop) {
              oDialog.addStyleClass("sapUiSizeCompact");
            }
            // Set values to the dialog using the provided data
            this.setDialogData(oDialog, dialogData);
            return oDialog;
          }.bind(this));  // `bind` is used to maintain the context of `this`
          this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
        } else {
          // Dialog is already loaded, set values directly
          pDialog.then(function (oDialog) {
            this.setDialogData(oDialog, dialogData);
          }.bind(this));
        }
        return pDialog;
      },

      // ================================== # xxxxx Functions # ==================================
      // ================================== # xxxxx Functions # ==================================
      // ================================== # xxxxx Functions # ==================================
      // ================================== # xxxxx Functions # ==================================
      // ================================== # xxxxx Functions # ==================================

    });
  }
);


