'use strict';
class OpenEducationTagger {
  constructor() {

    // 2DO: case convention

    // submitted from outside
    this.oet_spreadsheet_sheet_id;
    this.oet_spreadsheet_sheet_id;
    this.oet_elasticsearch_hostname;
    this.oet_elasticsearch_index;
    this.oet_elasticsearch_auth_string_write;

    // generated by this class
    this.spreadsheetJsonUrl;

    // hardcoded by now  (move to a config file?)
    // nameForElastic : jsonFieldTitleGDrive
    this.singleValueFields = {
      'title': 'gsx$title',
      'url': 'gsx$url',
      'description': 'gsx$description',
      'year': 'gsx$year',
      'licenseurl': 'gsx$licenseurl'
    };

    // special field license (type)
    this.licenseUrlFieldString = 'gsx$licenseurl';

    // nameForElastic : jsonFieldTitleGDrive
    this.multipleValueFields = {
      'subjectareas': 'gsx$subjectareas',
      'types': 'gsx$types',
      'tags': 'gsx$tags',
      'languages': 'gsx$languages'
    }
  }
  setConfig(configObject) {
    console.log('oet - setConfig', configObject);
    // 2DO: use isset | shortcut
    this.oet_spreadsheet_id = configObject.oet_spreadsheet_id;
    this.oet_spreadsheet_sheet_id = configObject.oet_spreadsheet_sheet_id;
    this.oet_elasticsearch_hostname = configObject.oet_elasticsearch_hostname;
    this.oet_elasticsearch_index = configObject.oet_elasticsearch_index;
    this.oet_elasticsearch_auth_string_write = configObject.oet_elasticsearch_auth_string_write;

    this.spreadsheetJsonUrl = 'https://spreadsheets.google.com/feeds/list/' + this.oet_spreadsheet_id + '/' + this.oet_spreadsheet_sheet_id + '/public/values?alt=json';
    console.log('set spreadsheet url', this.spreadsheetJsonUrl);

    // 2DO: validate all values, show error?

    console.log('updated config, values are now:', this);
  }
  startSync() {
    console.log('start sync');
    // first clear the index, this will trigger syncing afterwards
    this.deleteBySpreadsheetId();
    // 2DO: use async await?1
  }
  deleteBySpreadsheetId() {
    const https = window.https;
    const tryjson = window.tryjson;


    if (this.oet_spreadsheet_id == '' || this.oet_spreadsheet_id == undefined) {
      alert('Spreadsheet ID not set');
      return;
    }

    console.log('Clear index...');

    // configure authentication
    // 2DO: use stored values
    const userAndPass = this.oet_elasticsearch_auth_string_write;
    const authString = "Basic " + btoa(userAndPass); // base64 encoding
    const headers = {
      // 'User-Agent': 'request',
      'Authorization': authString,
      "Content-Type": "application/json",
    };
    // search action


    let options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        "query": {
          "match": {
            "spreadsheetid": this.oet_spreadsheet_id
          }
        }
      })
    };

    const myOpenEducationTagger = this;

    // 2DO: uncomment
    console.log('fetching url','https:' + this.oet_elasticsearch_hostname + '/' + this.oet_elasticsearch_index + '/_delete_by_query')
    fetch('https://' + this.oet_elasticsearch_hostname + '/' + this.oet_elasticsearch_index + '/_delete_by_query', options).then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        this.syncSpreadsheetToClearedIndex();
      })
      .catch((error) => {
        console.error('Error:', error);
      });



    // 2DO: convert everything to fetch...

    /*const req = https.request(options, function(res) {
      var jsonResponse = '';
      console.log('send POST to index', res);
      res.on('data', function(chunk) {
        //console.log('data',chunk);
        jsonResponse += chunk;
      });

      res.on('end', function() {
        // 201 = created
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('Status:', res.statusCode);
          console.log('res', res);
          var data = tryjson.parse(jsonResponse);
          console.log('data parsed', data ? data : 'Error parsing JSON!');
          // tryjson will return undefined on parsing error
          if (data !== undefined) {
            // new id will be _id: "kX9qDHEBtWjoDWKpNl2U",
            console.log('got data successful', data);
          }

          // we trigger the insert
          myOpenEducationTagger.syncSpreadsheetToClearedIndex();

        } else {
          console.log('Status:', res.statusCode);
        }
      });
    }).on('error', function(err) {
      console.log('Error:', err);
    }); // eo https get*/


  }
  syncSpreadsheetToClearedIndex() {
    // https://spreadsheets.google.com/feeds/list/1kntJWO9iP6rL6WFqKXNsINoa923LjoDfEz38_NA4-ao/od6/public/values?alt=json

    // https://www.electronjs.org/docs/api/client-request
    /*const stream = require('stream')
    const {net} = require('electron').remote

    const request = net.request({
      method: 'GET',
      protocol: 'https:',
      hostname: 'spreadsheets.google.com',
      port: 443,
      path: '/feeds/list/1kntJWO9iP6rL6WFqKXNsINoa923LjoDfEz38_NA4-ao/od6/public/values?alt=json'
    });

    request.on('response', (response) => {
      console.log(`STATUS electron request: ${response.statusCode}`);
      response.on('error', (error) => {
        console.log(`ERROR: ${JSON.stringify(error)}`)
      })
    })
    request.on('login', (authInfo, callback) => {
      callback()
    })*/

    // 2DO: good style to do it here this way?
    // this needs to be made available in preload.js
    const https = window.https;
    const tryjson = window.tryjson;

    // save reference to class for callback
    const theCurrentClassInstance = this;
    // better way - async waterfall?
    // https://blog.cloudboost.io/execute-asynchronous-tasks-in-series-942b74697f9c
    // https://www.codementor.io/@aminmeyghani/running-asynchronous-javascript-code-in-sequence-with-async-waterfall---part-1-du1084fmx

    console.log('try to load gdrive spreadsheet');

    /*fetch(this.spreadsheetJsonUrl).then(response => {
      return response.json().catch(err => {
        console.error(`'${err}' happened, but no big deal!`);
        return {};
      });
    }).then(data => {
      console.log('DATA', data);
    });

    fetch(this.spreadsheetJsonUrl, {
        mode: "no-cors",
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      })
      .then(response => response.json())
      .then(response => {
        return dispatch({
          type: "GET_CALL",
          response: response
        });
      })*/

    console.log('try fetch');
    fetch(this.spreadsheetJsonUrl, {
        //mode: "no-cors",
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      }).then(response => response.json()) // important to do it that way!, otherwise empty result
      .then(json => {
        console.log('parsed json', json); // access json.body here

        this.convertAndSubmitJsonToIndex(json);

      }).catch(function(error) {
        // If there is any error you will catch them here
        console.log('error', error)
      });

    /*fetch(this.spreadsheetJsonUrl).then(function(data) {
      // Here you get the data to modify as you please
      console.log('data', data);
    }).catch(function(error) {
      // If there is any error you will catch them here
      console.log('error', error)
    });*/

    /*https.get(this.spreadsheetJsonUrl, function(res) {
      var json = '';

      res.on('data', function(chunk) {
        //console.log('data',chunk);
        json += chunk;
      });

      res.on('end', function() {
        if (res.statusCode === 200) {
          console.log('Status:', res.statusCode);
          console.log('res', res);
          console.log('theCurrentClassInstance', theCurrentClassInstance);
          var data = tryjson.parse(json);
          console.log(data ? data : 'Error parsing JSON!');

          // tryjson will return undefined on parsing error
          if (data !== undefined) {
            theCurrentClassInstance.convertAndSubmitJsonToIndex(data);
          }
        } else {
          console.log('Status:', res.statusCode);
        }
      });
    }).on('error', function(err) {
      console.log('Error:', err);
    }); // eo https get*/

  }
  testBulkApi(sanitizedObjects) {
    console.log('test bulk api');
    // 2DO: good style to do it here this way?
    //const https = window.https;
    // safer parsing
    // const tryjson = window.tryjson;

    // configure authentication
    // 2DO: use stored values
    const userAndPass = this.oet_elasticsearch_auth_string_write;
    const authString = "Basic " + btoa(userAndPass); // base64 encoding
    const headers = {
      // 'User-Agent': 'request',
      'Authorization': authString,
      "Content-Type": "application/json",
    };
    // search action



    // bulk action
    /*let options = {
      host: this.oet_elasticsearch_hostname,
      path: '/' + this.oet_elasticsearch_index + '/_bulk',
      method: 'POST',
      headers: headers
    };*/

    let reqStringBulk = '';
    for (let i = 0; i < sanitizedObjects.length; i++) {
      reqStringBulk += JSON.stringify({
        "index": {}
      }) + "\n";
      reqStringBulk += JSON.stringify(sanitizedObjects[i]) + "\n";
    }

    fetch('https://' + this.oet_elasticsearch_hostname + '/' + this.oet_elasticsearch_index + '/_bulk', {
        //mode: "no-cors",
        method: "POST",
        headers: headers,
        body: reqStringBulk
        /*headers: {
          "Accept": "application/json"
        }*/
      }).then(response => response.json()) // important to do it that way!, otherwise empty result
      .then(json => {
        console.log('json parsed', json);
      });


    // this writes json data
    // this works!
    //req.write(JSON.stringify({ "index":{}})+"\n"+JSON.stringify({ "name":"john doe","age":25 })+"\n"+JSON.stringify({ "index":{} })+"\n"+JSON.stringify({ "name":"mary smith","age":32 })+"\n");

    //req.end();

  }
  convertAndSubmitJsonToIndex(spreadsheetJson) {
    console.log('convertAndsubmitJsonToIndex called');
    console.log('convertAndsubmitJsonToIndex this', this);

    // we clear all entries for the desired spreadsheets
    // spreadsheet ID is saved on dataobject.spreadsheet.id

    // 2DO: remove all (search spreadsheet ID)

    // try bulk api to insert all

    /*POST _bulk
    { "index" : { "_index" : "test", "_id" : "1" } }
    { "field1" : "value1" }*/

    //const https = window.https;
    // safer parsing
    //const tryjson = window.tryjson;

    const sanitizedObjects = [];


    // 2DO: check if feed.entry is set
    // important: set ,thisValue
    // 2DO: use for, not async?

    for (let i = 0; i < spreadsheetJson.feed.entry.length; i++) {
      // spreadsheetJson.feed.entry.forEach(function(item, index) {

      // 2DO: add debug option to only include 10 items
      //if(i<3){
      // 2DO: remove later

      const item = spreadsheetJson.feed.entry[i];

      console.log('converting item', item, i);

      let sanitizedObject = {};

      // we store this, so we can dump everything before update
      sanitizedObject['spreadsheetid'] = this.oet_spreadsheet_id;

      // we're doing something like that sanitizedObject.title = item['gsx$titel']['$t'];

      // https://stackoverflow.com/a/684692
      for (let [key, value] of Object.entries(this.singleValueFields)) {
        //console.log(`${key}: ${value}`);
        sanitizedObject['' + key + ''] = this.sanitizeHtml(item['' + value + '']['$t']);
      }

      // license URL
      const licenseUrlFieldValue = item['' + this.licenseUrlFieldString + '']['$t'];
      let convertedLicenseTypeValueForElastic = '';
      switch (true) {
        case (licenseUrlFieldValue.indexOf("creativecommons.org/publicdomain/zero") != -1):
          convertedLicenseTypeValueForElastic = 'CC0';
          break;
        case (licenseUrlFieldValue.indexOf("creativecommons.org/licenses/by/") != -1):
          convertedLicenseTypeValueForElastic = 'CC BY';
          break;
        case (licenseUrlFieldValue.indexOf("creativecommons.org/licenses/by-sa/") != -1):
          convertedLicenseTypeValueForElastic = 'CC BY-SA';
          break;
        case (licenseUrlFieldValue.indexOf("creativecommons.org/licenses/by-nc-sa/") != -1):
          convertedLicenseTypeValueForElastic = 'CC BY-NC-SA';
          break;
        case (licenseUrlFieldValue.indexOf("creativecommons.org/licenses/by-nc/") != -1):
          convertedLicenseTypeValueForElastic = 'CC BY-NC';
          break;
        case (licenseUrlFieldValue.indexOf("creativecommons.org/licenses/by-nc-nd/") != -1):
          convertedLicenseTypeValueForElastic = 'CC BY-NC-ND';
          break;
        default:
          convertedLicenseTypeValueForElastic = '';
          break;
      }
      sanitizedObject['licensetype'] = convertedLicenseTypeValueForElastic;

      for (let [key, value] of Object.entries(this.multipleValueFields)) {
        //console.log(`${key}: ${value}`);

        // convert multi value fields to arrays
        const itemValue = this.sanitizeHtml(item['' + value + '']['$t']);
        if (itemValue.indexOf(",") != -1) {
          sanitizedObject['' + key + ''] = itemValue.split(",");
        } else {
          sanitizedObject['' + key + ''] = new Array('' + itemValue + '');
        }
      }

      console.log('sanitized object', sanitizedObject);

      // add to object list
      sanitizedObjects.push(sanitizedObject);
      //this.sendObjectToIndex(sanitizedObject);

      // } // eo if<3 2DO: remove, only for testing

    } // eo for

    this.testBulkApi(sanitizedObjects);


    // this was only for .forEach
    // }, this); // !important -> this. binding!
  }
  sendObjectToIndex(objectToSend) {

    console.log('sendObjectToIndex', objectToSend);

    // 2DO: good style to do it here this way?
    const https = window.https;
    // safer parsing
    const tryjson = window.tryjson;

    // configure authentication
    // 2DO: use stored values
    const userAndPass = this.oet_elasticsearch_auth_string_write;
    const authString = "Basic " + btoa(userAndPass); // base64 encoding
    const headers = {
      // 'User-Agent': 'request',
      'Authorization': authString,
      "Content-Type": "application/json",
    };
    console.log('authString', authString);

    // 2DO: index or update (Get it first by URL, see PHP code)
    console.log('check if this entry is already indexed (by URL)');

    // search action
    let options = {
      host: this.oet_elasticsearch_hostname,
      path: '/' + this.oet_elasticsearch_index + '/_search',
      method: 'POST',
      headers: headers
    };

    const dataSearchQuery = {
      'query': {
        'match': {
          'url.keyword': objectToSend['url']
        }
      }
    };


    const data = JSON.stringify(objectToSend);
    // see at bottom, will be send via req.write(data)

    options = {
      host: 'scalr.api.appbase.io',
      path: '/openeducationtagger-playground/_doc', // 2DO: index or update
      method: 'POST',
      headers: {
        // 'User-Agent': 'request',
        'Authorization': authString,
        "Content-Type": "application/json",
        'Content-Length': data.length
      }
    };

    // post it
    const req = https.request(options, function(res) {
      var jsonResponse = '';

      console.log('send POST to index', res);

      res.on('data', function(chunk) {
        //console.log('data',chunk);
        jsonResponse += chunk;
      });

      res.on('end', function() {
        // 201 = created
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('Status:', res.statusCode);
          console.log('res', res);
          var data = tryjson.parse(jsonResponse);
          console.log('data parsed', data ? data : 'Error parsing JSON!');

          // tryjson will return undefined on parsing error
          if (data !== undefined) {
            // new id will be _id: "kX9qDHEBtWjoDWKpNl2U",
            console.log('got data successful', data);
          }
        } else {
          console.log('Status:', res.statusCode);
        }
      });
    }).on('error', function(err) {
      console.log('Error:', err);
    }); // eo https get

    // this writes json data
    req.write(data)
    req.end();



  }
  set name(name) {
    this._name = name.charAt(0).toUpperCase() + name.slice(1);
  }
  get name() {
    return this._name;
  }
  sayHello() {
    console.log('Hello, my name is ' + this.name + ', I have ID: ' + this.id);
  }
  // 2DO: static?
  sanitizeHtml(str) {
    /*!
     * Sanitize and encode all HTML in a user-submitted string
     * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
     * @param  {String} str  The user-submitted string
     * @return {String} str  The sanitized string
     */
    // https://vanillajstoolkit.com/helpers/sanitizehtml/
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }
}
