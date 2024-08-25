sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/tnt/ToolPage",
    "sap/ui/core/routing/Router",
    "sap/ui/core/Fragment",
    "sap/ui/core/Configuration",
    "sap/m/MessageToast",
    "moneym/controller/auth/Login",
  ],
  function (Controller,
    UIComponent,
    ToolPage,
    Router,
    Fragment,
    Configuration,
    MessageToast,
    Login) {
    "use strict";

    return Controller.extend("moneym.controller.App", {
      onInit: async function () {
        this.login = await new Login(this)

        this.isDarkMode = true
        this.onToggleTheme({})

      },

      onToggleTheme: function (ev) {
        if (!this.isDarkMode) {
          Configuration.setTheme("sap_horizon"); // Set to normal theme
          this.byId("themeToggleButton").setTooltip("Switch to Dark Mode");
          this.byId("themeToggleButton").setIcon("sap-icon://light-mode");
        } else {
          Configuration.setTheme("sap_horizon_dark"); // Set to dark theme
          this.byId("themeToggleButton").setTooltip("Switch to Light Mode");
          this.byId("themeToggleButton").setIcon("sap-icon://dark-mode");
        }
        this.isDarkMode = !this.isDarkMode;
      },

      onMenuButtonPress: function () {
        var toolPage = this.byId('toolPage');
        if (toolPage) {
          toolPage.setSideExpanded(!toolPage.getSideExpanded());
        }
      },

      onItemSelect: function (ev) {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo(ev.getParameter('item').getKey())
      },

      //---------------------------------
      openNotification: function (oEvent) {
        this.login.openNotification(oEvent)
      },

      onLoginPress: function () {
        this.login.onLoginPress()
      },

      logout: function () {
        this.login.logout()
      },

      _checkAuthentication: function () {
        this.login._checkAuthentication()
      },

      onPressAvatar: function (oEvent) {
        this.login.onPressAvatar(oEvent)
      },

      onPopoverClose: function () {
        this.login.onPopoverClose();
      },

      onListItemPress: function () {
        this.login.onListItemPress(false);
      }
      //---------------------------------

    });
  }
); 