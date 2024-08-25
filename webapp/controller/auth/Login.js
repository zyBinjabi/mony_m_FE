sap.ui.define(
  [
    "moneym/Controller/Helper/BaseController",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",

  ],
  function (BaseController,
    Fragment,
    MessageToast,
  ) {
    "use strict";

    return BaseController.extend("moneym.controller.auth.Login", {
      onInit: function () {
      },

      constructor: function (currentController) {
        for (var key in currentController) {
          if (currentController.hasOwnProperty(key)) {
            this[key] = currentController[key];
          }
        }
        BaseController.prototype.onInit.apply(this, [currentController]);

        this.pageName = 'Login'
        this.mainFromModel = 'mainFormModel'
        this.mainFormErrModel = "mainFormErrModel"
        this.mainTableId = 'mainTableId' + this.pageName
        this.mainFormId = 'mainFormId' + this.pageName

        //--------------------
        var oUserModel = new sap.ui.model.json.JSONModel({
          isLoggedIn: false,
          email: "",
          password: ""
        });

        this.getView().setModel(oUserModel, "userModel");

        this._checkAuthentication();

        this.oView = this.getView();
        this.oMyAvatar = this.oView.byId("Avatar_id");
        this._oPopover = Fragment.load({
          id: this.oView.getId(),
          name: "moneym.fragment.auth.Popover",
          controller: this
        }).then(function (oPopover) {
          this.oView.addDependent(oPopover);
          this._oPopover = oPopover;
        }.bind(this));
        //--------------------

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
      // ================================== # Helper Functions # ==================================

      openNotification: function (oEvent) {
        var oButton = oEvent.getParameter("button");
        var oView = this.getView();
        var _pPopover;

        // create popover
        if (!_pPopover && oView) {
          _pPopover = Fragment.load({
            id: oView.getId(),
            name: "moneym.fragment.notification",
            controller: this
          }).then(function (oPopover) {
            oView.addDependent(oPopover);
            return oPopover;
          });
        }

        _pPopover.then(function (oPopover) {
          oPopover.openBy(oButton);
        });
      },

      onLoginPress: async function () {
        var oUserModel = this.getView().getModel("userModel");

        // let transaction = await this.crudService.read('transaction/byFilter')
        // console.log("transaction: ", transaction)

        this.onLogin({
          username: oUserModel.getProperty("/email"),
          password: oUserModel.getProperty("/password")
        })
      },

      onLogin: async function (oPayload) {
        try {
          const result = await this.crudService.create("users/login", oPayload, true);
          sap.m.MessageToast.show("Login successful!");

          // Store the token and set it for future requests
          localStorage.setItem("access_token", result.access_token);
          this.crudService.setAccessToken(result.access_token);
          this._checkAuthentication()
        } catch (error) {
          sap.m.MessageToast.show(error.message || "Login failed.");
        }
      },

      logout: function () {
        // Implement any other necessary cleanup
        localStorage.removeItem("access_token");
        this._checkAuthentication()
        // Navigate to the login view
      },

      _checkAuthentication: function () {
        const sToken = localStorage.getItem("access_token");
        var oUserModel = this.getView().getModel("userModel");
        if (sToken) {
          // User is authenticated, proceed with app initialization
          oUserModel.setProperty("/isLoggedIn", true);
          MessageToast.show("Login successful!");
        } else {
          oUserModel.setProperty("/isLoggedIn", false);
          MessageToast.show("Logout successful!");
        }
      },

      onPressAvatar: function (oEvent) {
        var oEventSource = oEvent.getSource(),
          bActive = this.oMyAvatar.getActive();

        this.oMyAvatar.setActive(!bActive);

        if (bActive) {
          this._oPopover.close();
        } else {
          this._oPopover.openBy(oEventSource);
        }
      },

      onPopoverClose: function () {
        this.oMyAvatar.setActive(false);
      },

      onListItemPress: function () {
        this.oMyAvatar.setActive(false);
        this._oPopover.close();
      },

    });
  }
);
