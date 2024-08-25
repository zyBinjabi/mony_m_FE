sap.ui.define(
      [
          "moneym/Controller/Helper/BaseController"
      ],
      function(BaseController) {
        "use strict";
    
        return BaseController.extend("moneym.controller.Home", {
          onInit: function() {
            BaseController.prototype.onInit.apply(this,[]);

             
         this.pageName = 'Settings'
         this.mainFromModel = 'mainFormModel'
         this.mainFormErrModel = "mainFormErrModel"
         this.mainTableId = 'mainTableId'+ this.pageName
         this.mainFormId = 'mainFormId'+ this.pageName
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

        });
      }
    );
    