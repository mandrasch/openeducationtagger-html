'use strict';

// this approach is needed because nodeIntegration = false
// selected node APIs are exposed here (e.g. https), but not all
// https://github.com/electron/electron/issues/8227

document.onreadystatechange = function() {
  if (document.readyState == "complete") {
    // 2DO: load via npm?
    // const $ = require('jquery');
    // Do things with $

    // loaded via index.html
    $(function() {
      console.log('hello jquery world');

      // 2DO: is this secure?
      //window.https = require('https');
      //window.tryjson = require('tryjson');

      const configStore = localStorage;

      const myOpenEducationTagger = new OpenEducationTagger();

      const configFormFields = [
        'oet_spreadsheet_id',
        'oet_spreadsheet_sheet_id',
        'oet_elasticsearch_hostname',
        'oet_elasticsearch_index',
        'oet_elasticsearch_auth_string_write'
      ];

      configFormFields.forEach(function(formFieldName) {
        // 2DO: load values
        console.log('check if value is in store', formFieldName, " = ", configStore.getItem(formFieldName));

        const valueInStore = configStore.getItem(formFieldName);

        // if value is already stored, apply it to form field
        if (valueInStore !== undefined) {
          $("input[name=" + formFieldName + "]").val(valueInStore);
        }

        // initiate jquery event
        $("input[name=" + formFieldName + "]").bind('change', function() {
          //$("input[name=" + formFieldName + "]").bind('input propertychange', function() {
          console.log('event - form field value was changed', this);
          console.log('save new value to config store', this.value);
          configStore.setItem(formFieldName, this.value);
        });

      }, this); // 2DO: is bind needed?



      $("#oetSyncSpreadsheet").on('click', function(e) {
        e.preventDefault();

        console.log('Try to sync spreadsheet...');
        // 2DO: start worker

        // 2DO: this is no good style I suppose ;-)
        console.log('Update config first, apply config to class ... ');

        // lazy way, just submit whole store values as object
        myOpenEducationTagger.setConfig(configStore);
        myOpenEducationTagger.startSync();
      }); // eo click

      // button actions
      $("#oetClearStore").on('click', function(e) {
        // 2DO: reload form/window?
        $("input").val('').trigger('change');
      });

      $("#oetTestBulk").on('click', function(e) {
        myOpenEducationTagger.setConfig(configStore);
        myOpenEducationTagger.testBulkApi();
      });

      $("#oetDeleteBySpreadsheetId").on('click',function(e){
        myOpenEducationTagger.setConfig(configStore);
        myOpenEducationTagger.deleteBySpreadsheetId();
      });

      //$('#oetSyncSpreadsheet').focus(); // focus input box


    }); // eo jQuery

  } // eo readyState == complete
} // eo onReadstayte
