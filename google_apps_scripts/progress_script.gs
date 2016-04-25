function onOpen() {
  // options to export the JSON data for MAPit feature
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [
    {name: "Export JSON for MAPit", functionName: "export_json_data_html"}
  ];
  ss.addMenu("Export JSON", menuEntries);
  
} //end function onOpen

function countBetween (callnumber1, callnumber2, location_code) {  
  var call1 = encodeURIComponent(callnumber1);
  var call2 = encodeURIComponent(callnumber2);
  var loc = encodeURIComponent(location_code);
  
  var url = 'http://library2.udayton.edu/api/count_between_callnumbers.php?'
  + 'callnumber1=' + call1 + '&callnumber2=' + call2 + '&location_code=' + loc;
  
  //var result = UrlFetchApp.fetch(url);
  //var json_data = JSON.parse( result.getContentText() );
    
  return url;
} //end function countBetween

function CountNotBlank(myArray) {
  var output = 0;
  for (i = 0; i < myArray.length; i++) { 
    if (myArray[i] != "") {
      output += 1
    }
  }
  return output;
}



function export_json_data_html() {
  //create the dialog for output (is called when we click on the option from the drop down)
  var html = HtmlService.createHtmlOutputFromFile('html_progress_script.html')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .showModalDialog(html, 'Exported JSON');
  
} //end function export_json_data_html

function get_json_data() {
  // this function is for the html object and will return the raw json object
  /*
  var json = {
    "id": 1,
    "name": "A green door",
    "price": 12.50,
    "tags": ["home", "green"]
  };
  */
  
  //get all the data (values) from the sheet
  var values = SpreadsheetApp.getActive().getDataRange().getValues();
  
  var json = [];
  //loop through the data and construct the json object (skip the first since we don't want the column names)
  for (var i = 1; i < values.length; i++) {
    var row = {};
    if(values[i][0]) {
      //this is the range name
      row.range_name = values[i][0];
    }
    if(values[i][1]) {
      //this is the range start
      row.range_start = values[i][1];
    }
    if(values[i][2]) {
      //this is the range end
      row.range_end = values[i][2];
    }
    json.push(row);
    
  } // end for i
    
  // return the json object for the html page
  return json;
  
} //end function get_json_data();
