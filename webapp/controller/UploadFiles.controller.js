sap.ui.define(
  [
    "moneym/Controller/Helper/BaseController",
    "sap/m/MessageToast"

  ],
  function (BaseController, MessageToast) {
    "use strict";

    return BaseController.extend("moneym.controller.UploadPDF", {
      onInit: function () {
        BaseController.prototype.onInit.apply(this, []);


        this.pageName = 'UploadPDF'
        this.mainFromModel = 'mainFormModel'
        this.mainFormErrModel = "mainFormErrModel"
        this.mainTableId = 'mainTableId' + this.pageName
        this.mainFormId = 'mainFormId' + this.pageName
      },

      // ================================== # On Functions # ==================================

      onMainSubmit: async function (ev) {
        this.setBusy(this.mainFormId, true)

        let data = this.getView().getModel(this.mainFromModel).getData()

        let isErr = this.startValidation(data)
        if (isErr) {
          return false
        }

        data = this.oPayload_modify(data);

        if (this.getMode() == 'Create') {
          let res = await this.crud_z.post_record(this.mainEndPoint, data)
        } else {
          let res = await this.crud_z.update_record(this.mainEndPoint, data, data.Id)
        }

        this.setBusy(this.mainFormId, false)

        this.getView().setModel(new sap.ui.model.json.JSONModel(this.getMainObj()), this.mainFromModel)// Reset
      },

      // ================================== # Get Functions # ==================================

      getMainObj: function () {
        return {}
      },

      // ================================== # Helper Functions # ==================================

      startValidation: function (oPayload) {
        let fieldsName = Object.keys(this.getMainObj());
        let requiredList = fieldsName.filter(field => field);

        const rulesArrName = [
          { arr: requiredList, name: 'required' },
        ];

        let { isErr, setvalueStateValues } = this.validation_z.startValidation(fieldsName, rulesArrName, oPayload)
        console.log(setvalueStateValues)
        this.getView().setModel(new sap.ui.model.json.JSONModel(setvalueStateValues), this.mainFormErrModel);
        return isErr
      },


      oPayload_modify: function (oPayload) {
        oPayload = this.oPayload_modify_parent(oPayload)
        return oPayload
      },


      setBusy: function (id, status) {
        this.getView().byId(id).setBusy(status);
      },

      onFileChange: function (oEvent) {
        // Get the selected file from the FileUploader control
        this.oFileUploader = oEvent.getSource();
        const oFile = oEvent.getParameter("files") && oEvent.getParameter("files")[0];

        console.log("oFileUploader", this.oFileUploader)
        console.log("oFile", oFile)

        if (oFile) {
          this._selectedFile = oFile; // Store the selected file for later use
          MessageToast.show("File selected: " + oFile.name);
        } else {
          this._selectedFile = null;
          MessageToast.show("No file selected.");
        }
      },

      // handleUploadPress: async function () {
      //   console.log("Start Handel Press!")
      //   if (this._selectedFile) {
      //     const oFormData = new FormData();
      //     oFormData.append("file", this._selectedFile);

      //     const result = await this.crudService.create("transaction/upload-pdf", oFormData);
      //     sap.m.MessageToast.show("Login successful!");
      //     console.log(result)
      //   } else {
      //     MessageToast.show("Please select a file first.");
      //   }
      // },

      handleUploadPress: async function (oEvent) {

        console.log("Start Handle Press!");

        if (!this._selectedFile) {
          sap.m.MessageToast.show("Please select a file first.");
          return;
        }

        try {
          // Create FormData and append the selected file
          const oFormData = this._prepareFormData(this._selectedFile);

          // Perform the file upload
          const result = await this._uploadFile(oFormData);

          this.oFileUploader.clear(); // Reset the FileUploader input
          this._selectedFile = null; // Clear the stored file
          sap.m.MessageToast.show("File upload input reset.");

          // Show success message
          sap.m.MessageToast.show("File uploaded successfully!");
          console.log(result);
        } catch (error) {
          // Show error message
          sap.m.MessageToast.show("File upload failed. Please try again.");
          console.error("File upload error:", error);
        }
      },

      _prepareFormData: function (file) {
        const oFormData = new FormData();
        oFormData.append("file", file);
        return oFormData;
      },

      _uploadFile: async function (oFormData) {
        return await this.crudService.create("transaction/upload-pdf", oFormData);
      }



    });
  }
);
