sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (
    Controller
) {
    "use strict";

    return Controller.extend("practice.controller.Helper.UiTableFSG", {
        constructor: function (currentController) {
            Controller.apply(this, currentController);

            this._currentController = currentController
            // Define your grouping functions
        },

        onInit: function () {

        },
        // ================================== # Tables Functions # ==================================
        // ------
        handleSortButtonPressed: function (ev) {
            const { data, xkeys, aItems } = this._currentController.getDataXkeysAItems();

            if (!this._currentController._mViewSettingsDialogs['sort_sug']) {
                // Get the dialog model data

                // Create the ViewSettingsDialog
                var oViewSettingsDialog = new sap.m.ViewSettingsDialog({
                    confirm: this.handleSortDialogConfirm.bind(this)
                });

                // Loop through the dialogModel data and create ViewSettingsItem for each entry
                aItems.forEach(function (item, index) {
                    var oViewSettingsItem = new sap.m.ViewSettingsItem({
                        text: item.text,
                        key: item.key,
                        selected: true // Set the first item as selected (or adjust based on your logic)
                    });
                    oViewSettingsDialog.addSortItem(oViewSettingsItem);
                });
                this._currentController._mViewSettingsDialogs['sort_sug'] = oViewSettingsDialog
            }

            this._currentController._mViewSettingsDialogs['sort_sug'].open();

        },

        handleSortDialogConfirm: function (ev) {
            var oTable = this._currentController.byId(this._currentController.mainTableId),
                mParams = ev.getParameters(),
                oBinding = oTable ? oTable.getBinding("rows") : null, // For sap.ui.table.Table, binding is on "rows"
                sPath,
                bDescending,
                aSorters = [];

            if (mParams.sortItem) {
                sPath = mParams.sortItem.getKey();
                bDescending = mParams.sortDescending;
                aSorters.push(new sap.ui.model.Sorter(sPath, bDescending)); // sap.ui.model.Sorter is used for sorting
            }

            // Apply the selected sort settings
            if (oBinding) {
                oBinding.sort(aSorters);
            }

            // console.log({ oTable })
            // console.log({ mParams })
            // console.log({ oBinding })
            // console.log({ sPath })
            // console.log({ bDescending })
            // console.log({ aSorters })
        },

        // -----
        handleFilterButtonPressed: function (ev) {
            const { data, xkeys, aItems } = this._currentController.getDataXkeysAItems();

            if (!this._currentController._mViewSettingsDialogs['filter_sug']) {
                // Create the ViewSettingsDialog
                const oViewSettingsDialog = new sap.m.ViewSettingsDialog({
                    confirm: this.handleFilterDialogConfirm.bind(this)
                });


                aItems.forEach(key => {
                    const oFilterItem = new sap.m.ViewSettingsFilterItem({
                        text: key.text,
                        key: key.key,
                        multiSelect: true
                    });

                    // Create a Set to ensure unique items
                    const uniqueItems = new Set(data.map(item => item[key.key]));

                    // Add unique ViewSettingsItems to the filter
                    uniqueItems.forEach(value => {
                        oFilterItem.addItem(new sap.m.ViewSettingsItem({
                            text: value,
                            key: key.key
                        }));
                    });

                    oViewSettingsDialog.addFilterItem(oFilterItem);
                });

                // Save the dialog reference for later use
                this._currentController._mViewSettingsDialogs['filter_sug'] = oViewSettingsDialog;
            }

            // Open the dialog
            this._currentController._mViewSettingsDialogs['filter_sug'].open();

        },

        handleFilterDialogConfirm: function (ev) {
            var oTable = this._currentController.byId(this._currentController.mainTableId),
                mParams = ev.getParameters(),
                oBinding = oTable.getBinding("rows"),
                aFilters = [];

            mParams.filterItems.forEach(function (oItem) {
                var aSplit = oItem.getKey().split("___"),
                    sPath = aSplit[0],
                    sOperator = sap.ui.model.FilterOperator.EQ,
                    sValue1 = oItem.getText(),
                    oFilter = new sap.ui.model.Filter(sPath, sOperator, sValue1);
                // console.log("aSplit: ", aSplit, ", sPath: ", sPath, ", sOperator: ", sOperator, ", sValue1: ", sValue1, ", oBinding: ", oBinding);
                aFilters.push(oFilter);
            });

            if (oBinding) {
                oBinding.filter(aFilters);
            }

            // console.log({ oTable })
            // console.log({ mParams })
            // console.log({ oBinding })
            // console.log({ aFilters })


        },

        // ------
        handleGroupButtonPressed: function (ev) {

            if (!this._currentController._mViewSettingsDialogs['group_sug']) {
                // Define the array of items to be added
                const { data, xkeys, aItems } = this._currentController.getDataXkeysAItems();

                // Check if the dialog already exists
                // Create the ViewSettingsDialog
                const oViewSettingsDialog = new sap.m.ViewSettingsDialog({
                    confirm: this.handleGroupDialogConfirm.bind(this),
                    reset: this.resetGroupDialog.bind(this)
                });

                // Loop through the array and add ViewSettingsItem for each object
                aItems.forEach(function (item) {
                    oViewSettingsDialog.addGroupItem(new sap.m.ViewSettingsItem({
                        text: item.text,
                        key: item.key
                    }));
                }.bind(this));  // Bind the loop to the current context (controller)

                this._currentController._mViewSettingsDialogs['group_sug'] = oViewSettingsDialog;
            }
            // Save the dialog reference for later use

            // Open the dialog
            this._currentController._mViewSettingsDialogs['group_sug'].open();

        },

        handleGroupDialogConfirm: function (ev) {
            var oTable = this._currentController.byId(this._currentController.mainTableId),
                mParams = ev.getParameters(),
                oBinding = oTable.getBinding("rows"), // Use "rows" for sap.ui.table.Table
                sPath,
                bDescending,
                vGroup,
                aGroupers = [];

            // Ensure group functions are generated
            this.generateGroupFunctions();

            if (mParams.groupItem) {
                sPath = mParams.groupItem.getKey();
                bDescending = mParams.groupDescending;
                vGroup = this.mGroupFunctions[sPath];

                if (typeof vGroup === 'function') {
                    aGroupers.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
                    // Apply the selected group settings
                    oBinding.sort(aGroupers);
                } else {
                    console.error("Invalid group function for key: ", sPath);
                }
            } else if (this.groupReset) {
                oBinding.sort(); // Reset sorting
                this.groupReset = false;
            }

            // console.log("\nmParams: ", mParams, "\noBinding: ", oBinding, "\nsPath: ", sPath, "\nbDescending: ", bDescending, "\nvGroup: ", vGroup, "\naGroupers: ", aGroupers);
        },

        // ------
        resetGroupDialog: function (ev) {
            this.groupReset = true;
        },

        onSearch: function (ev) {
            const { data, xkeys } = this._currentController.getDataXkeysAItems();
            var sQuery = ev.getParameter("query"),
                oTable = this._currentController.byId(this._currentController.mainTableId),
                oBinding = oTable.getBinding("rows"),
                aFilters = [];

            if (sQuery && sQuery.length > 0) {
                // Normalize the query string to handle different forms of Arabic characters
                var normalizedQuery = this._normalizeArabic(sQuery).toLowerCase();

                // Create filters for all keys
                var oFilter = new sap.ui.model.Filter({
                    filters: xkeys.map(function (key) {
                        return new sap.ui.model.Filter({
                            path: key,
                            test: function (value) {
                                if (value) {
                                    // Normalize the value for comparison
                                    var normalizedValue = this._normalizeArabic(value.toLowerCase());
                                    return normalizedValue.includes(normalizedQuery);
                                }
                                return false;
                            }.bind(this)
                        });
                    }.bind(this)),
                    and: false
                });

                aFilters.push(oFilter);
            }

            // Apply the filter to the table binding
            if (oBinding) {
                oBinding.filter(aFilters);
            }
        },

        // Helper function to normalize Arabic text
        _normalizeArabic: function (str) {
            if (!str) return '';

            // Normalize Arabic characters
            var arCharMap = {
                'أ': 'ا', 'إ': 'ا', 'آ': 'ا',
                'ى': 'ي', 'ئ': 'ي', 'ؤ': 'و',
                'ة': 'ه', 'گ': 'ك', 'پ': 'ب',
                'چ': 'ج', 'ژ': 'ز', 'ڤ': 'ف'
            };

            return str.replace(/[أإآىئؤةگپچژڤ]/g, function (match) {
                return arCharMap[match];
            }).normalize('NFD').replace(/[\u064B-\u065F\u0617-\u061A\u0640]/g, '');
        },


        // onSearch: function (ev) {
        //     const { data, xkeys, aItems } = this._currentController.getDataXkeysAItems();
        //     var sQuery = ev.getParameter("query"),
        //         oTable = this._currentController.byId(this._currentController.mainTableId), // Assuming you have a table with this ID
        //         oBinding = oTable.getBinding("rows"), // Use "rows" for sap.ui.table.Table
        //         aFilters = [];
        //     if (sQuery && sQuery.length > 0) {
        //         var oFilter = new sap.ui.model.Filter(xkeys[0], sap.ui.model.FilterOperator.Contains, sQuery); // Adjust "someProperty" to your model property
        //         aFilters.push(oFilter);
        //     }

        //     // Apply the filter to the table binding
        //     if (oBinding) {
        //         oBinding.filter(aFilters);
        //     }
        // },

        generateGroupFunctions: function () {
            const { data, xkeys, aItems } = this._currentController.getDataXkeysAItems();

            this.mGroupFunctions = {};

            xkeys.forEach(key => {
                this.mGroupFunctions[key] = function (oContext) {
                    const data = oContext.getProperty();

                    if (data && data[key]) {
                        return {
                            key: data[key],
                            text: data[key]
                        };
                    } else {
                        console.error(`Invalid data for ${key}: `, data);
                        return {
                            key: "Unknown",
                            text: "Unknown"
                        };
                    }
                };
            });
        },

        // ================================== # xxx Functions # ==================================

    });
});