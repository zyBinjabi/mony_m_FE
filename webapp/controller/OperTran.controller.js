sap.ui.define(
  [
    "moneym/Controller/Helper/BaseController",
    'sap/ui/Device'

  ],
  function (BaseController, Device) {
    "use strict";

    return BaseController.extend("moneym.controller.OperTran", {
      onInit: async function () {
        BaseController.prototype.onInit.apply(this, []);

        this.pageName = 'OperTran'

        this.mainFormModel = 'mainFormModel'
        this.mainFormErrModel = "mainFormErrModel"
        this.mainFormId = 'mainFormId' + this.pageName

        this.mainTableId = 'mainTableId' + this.pageName
        this.mainTableModel = 'mainTableModel'

        this._oDSC = this.byId("DynamicSideContent");
        this._oToggleButton = this.byId("toggleButton");

        let transaction = await this.crudService.read('transaction/byFilter', {
          in_out: true
        })

        let newList = transaction.results.map(el => ({ OperTran: el[0] }));

        this.getView().setModel(new sap.ui.model.json.JSONModel(newList), this.mainTableModel)
      },

      // ================================== # On Functions # ==================================

      onMainSubmit: async function (ev) {
        this.setBusy(this.mainFormId, true)

        let data = this.getView().getModel(this.mainFormModel).getData()

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

        this.getView().setModel(new sap.ui.model.json.JSONModel(this.getMainObj()), this.mainFormModel)// Reset
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

      // ================================== # Dynmcily Side Functions # ==================================
      onBeforeRendering: function () {
        this.byId("DSCWidthSlider").setVisible(!Device.system.phone);
        this.byId("DSCWidthHintText").setVisible(!Device.system.phone);
      },
      onAfterRendering: function () {
        var sCurrentBreakpoint = this._oDSC.getCurrentBreakpoint();
        this._updateToggleButtonState(sCurrentBreakpoint);
      },
      handleSliderChange: function (ev) {
        var iValue = ev.getParameter("value");
        this.updateControlWidth(iValue);
      },
      updateControlWidth: function (iValue) {
        var $DSCContainer = this.byId("sideContentContainer").$();
        if (iValue) {
          $DSCContainer.width(iValue + "%");
        }
      },
      handleBreakpointChanged: function (ev) {
        var sCurrentBreakpoint = ev.getParameter("currentBreakpoint");
        this._updateToggleButtonState(sCurrentBreakpoint);
      },
      handleToggleClick: function () {
        this._oDSC.toggle();
      },
      _updateToggleButtonState: function (sCurrentBreakpoint) {
        if (sCurrentBreakpoint === "S") {
          this._oToggleButton.setEnabled(true);
        } else {
          this._oToggleButton.setEnabled(false);
        }
      },

      // ================================== # Table FSG Functions # ==================================
      getDataXkeysAItems: function () {
        const data = this.getView().getModel(this.mainTableModel).getData();
        const xkeys = Object.keys(data[0]);
        var aItems = xkeys.map(el => ({ text: el, key: el }))
        return { data, xkeys, aItems }
      },
      // ======

      handleSortButtonPressed: function (ev) {
        this.uiTableFSG.handleSortButtonPressed(ev)
      },

      handleFilterButtonPressed: function (ev) {
        this.uiTableFSG.handleFilterButtonPressed(ev)
      },

      handleGroupButtonPressed: function (ev) {
        this.uiTableFSG.handleGroupButtonPressed(ev)

      },
      // ======
      onSearch: function (oEvent) {
        this.uiTableFSG.onSearch(oEvent)
      }
    });
  }
);
