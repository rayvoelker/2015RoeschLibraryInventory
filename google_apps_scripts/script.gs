// Miami University library inventory
// 	version 2.0
//  with collaboration
//	Ray Voelker
//	Sept 23, 2018

function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [];

  menuEntries.push({name: "Generate Shelflist", functionName: "batchShelfDup"});
  menuEntries.push({name: "Produce Reshelve Sheet", functionName: "runReshelveDup"});
  menuEntries.push({name: "Check Sort Order", functionName: "checkSortDup"});
  menuEntries.push(null); // line separator
  menuEntries.push({name: "Resize Inventory Sheet Columns", functionName: "resizeInventoryDup"});
  menuEntries.push(null); // line separator
  menuEntries.push({name: "Fix Missing Column Data", functionName: "fixMissingDup"});
  menuEntries.push(null); // line separator
  menuEntries.push({name: "version 2.0", functionName: "version"});

  spreadsheet.addMenu("Inventory", menuEntries);

  //begin check for project triggers; should only create onEdit if not triggers exist
  var allTriggers = ScriptApp.getProjectTriggers();
  Logger.log(allTriggers.length);

  if (allTriggers.length == 0) {
    Logger.log(allTriggers.length);
    //creates trigger if it does none exist
    ScriptApp.newTrigger('onEditDup').forSpreadsheet(spreadsheet).onEdit().create();
  }//end of all trigger for loop


} //end function onOpen()


function resizeInventory() {
  sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('inventory');

  sheet.setColumnWidth(1, 75);
  sheet.setColumnWidth(2, 225);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 50);
  sheet.setColumnWidth(5, 25);
  sheet.setColumnWidth(6, 50);
  sheet.setColumnWidth(7, 125);
  sheet.setColumnWidth(8, 50);
  sheet.setColumnWidth(9, 125);
}

function batchShelf() {
  var spread_sheet_name = SpreadsheetApp.getActiveSpreadsheet().getName();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('inventory');
  //find all the items that may not have been filled in correctly.
  //get the row number of the last row

  var first = sheet.getRange(1,2).getValues();
  var start = first[0];
  Logger.log(first[0]);


  var lastRow = sheet.getLastRow();

  var last = sheet.getRange(lastRow,2).getValues();
  var end = last[0];
  Logger.log(last[0]);

  var range = sheet.getSheetValues(1,4,lastRow,1);
  //Logger.log(range[3]);


  //count the most frequent location ; https://medium.com/@AmJustSam/how-to-find-most-frequent-item-of-an-array-12015df68c65
  var counts = {};
  var compare = 0;
  var mostFrequent;
  (function(array){
    for(var i = 0, len = array.length; i < len; i++){
      var word = array[i];

      if(counts[word] === undefined){
        counts[word] = 1;
      }else{
        counts[word] = counts[word] + 1;
      }
      if(counts[word] > compare){
        compare = counts[word];
        location = range[i];
      }
    }
    Logger.log(location);
  })(range);
  //end of count most frequenct location

  //continue by calling api call to the Sierra api based on location and call number range
  //logged above in logger values

  var url = 'http://ulblwebt02.lib.miamioh.edu/~bomanca/collection/shelflist.php?'
  + 'location=' + location + '&' + 'start=' + start + '&' + 'end=' + end;
  url = encodeURI(url)
  Logger.log(url);

  var result = UrlFetchApp.fetch(url);
  var json_data = JSON.parse(result.getContentText());
  var payload = JSON.stringify(json_data); //string representation?
  Logger.log(json_data);

  var shelflist = SpreadsheetApp.getActive().insertSheet('shelflist', SpreadsheetApp.getActive().getSheets().length);

  //var shelflist = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('shelflist');
  shelflist.getRange(1,1,json_data.length,7).setValues(json_data);

  //try to automatically create spreadsheet named shelflist



}//end function batchShelf


//fixMissing will attempt to fix the missing values from columns.
function fixMissing() {
  var spread_sheet_name = SpreadsheetApp.getActiveSpreadsheet().getName();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('inventory');
  //find all the items that may not have been filled in correctly.
  //get the row number of the last row
  var lastRow = sheet.getLastRow();
  var range = SpreadsheetApp.getActiveSheet().getRange(1, 1, lastRow, 9);
  var count = 0;

  //Logger.log(range.getValues().length);
  var values = range.getValues();

  for (var i=0; i<values.length; i++){
    if(values[i][1] == '') {
      var value = values[i][0];

      //simulate a trigger of the onEdit function ...
      /* */
      var url = 'http://ulblwebt02.lib.miamioh.edu/~bomanca/cataloging/barcode.php?'
      + 'barcode=' + value;
      var result = UrlFetchApp.fetch(url);
      var json_data = JSON.parse(result.getContentText());

      //make sure we have data back ...
      if(json_data) {
        count++;
        if (value) {
          values[i][0] = value.toString().toLowerCase();
        }

        if (json_data.call_number_norm) {
          values[i][1] = '=\"' + json_data.call_number_norm.toUpperCase() + '\"';
        }

        if (json_data.best_title) {
          values[i][2] = '=\"' + json_data.best_title.replace(/"/g, '""') + '\"';
        }

        values[i][3] = '=\"' + json_data.location_code + '\"';
        values[i][4] = '=\"' + json_data.item_status_code + '\"';

        if(json_data.due_gmt) {
          values[i][5] = '=\"' + json_data.due_gmt.substring(0, json_data.due_gmt.length - 3) + '\"';
        }

        values[i][6] = '=\"' + Utilities.formatDate(new Date(), "GMT-4:00", "yyyy-MM-dd' 'HH:mm:ss") + '\"';
        values[i][7] = i+1;
        values[i][8] = spread_sheet_name;

      } //end if
      /* */

      /*
      should probably sleep just a little bit between UrlFetchApp.fetch calls ...
      *please note that we only get 100,000 / day according to the quotas page:
      https://developers.google.com/apps-script/guides/services/quotas#current_quotas
      */

      Utilities.sleep(250);

    }//end if
  }//end for

  //set the range values to the newly changed "fixed" values
  range.setValues(values);
  SpreadsheetApp.getUi()
     .alert('Fixed ' + count + ' rows');
}//end function fixMissing


function runReshelve() {
  SpreadsheetApp.getUi()
     .alert('Running Script to Produce "reshelve" sheet. \n\nClick OK to Continue');
  joinShelfListToInventory();
} //end function runReshelve


function onEdit(e) {
  var sheet = SpreadsheetApp.getActiveSheet();
  // cell must have a value, be only one row, and be from the first sheet
  if( e.range.getValue() && (e.range.getNumRows() == 1) && sheet.getIndex() == 1) {
    //Logger.log( e.range.getValue() );
    var value = e.range.getValue(),
        spread_sheet_name = SpreadsheetApp.getActiveSpreadsheet().getName();


    var url = 'http://ulblwebt02.lib.miamioh.edu/~bomanca/cataloging/barcode.php?'
      + 'barcode=' + value;
    var result = UrlFetchApp.fetch(url);
    var json_data = JSON.parse(result.getContentText());

    //make sure we have data back ...
    if(json_data) {
      if (json_data.call_number_norm) {
        e.range.offset(0,1).setValue('=\"' + json_data.call_number_norm.toUpperCase() + '\"');
      }
      //escape all double quotes
      if (json_data.best_title) {
        e.range.offset(0,2).setValue('=\"' + json_data.best_title.replace(/"/g, '""') + '\"');
      }
      e.range.offset(0,3).setValue('=\"' + json_data.location_code + '\"');
      e.range.offset(0,4).setValue('=\"' + json_data.item_status_code + '\"');
    }

    if(json_data.due_gmt != null) {
      e.range.offset(0,5).setValue('=\"' + json_data.due_gmt.substring(0, json_data.due_gmt.length - 3) + '\"');
    }
    else {
      e.range.offset(0,5).setValue('=\"\"');
    }

    e.range.offset(0,6).setValue('=\"' + Utilities.formatDate(new Date(), "GMT-4:00", "yyyy-MM-dd' 'HH:mm:ss") + '\"');
    e.range.offset(0,7).setValue(e.range.getRow());
    e.range.offset(0,8).setValue(spread_sheet_name);

  } //end if
} //end function onEdit()


function joinShelfListToInventory() {
  /*
  This function, joinShelfListToInventory, will do what equates to a LEFT OUTER JOIN on two sheets -
  the shelflist (what is in the system, and what we expect to be on the shelf) and
  the inventory (what physical items we scanned and found to be on the shelf).
  This will tell us several things
  1) What items are missing that we expect should be there
  2) What order the items should go in, and how they should be placed on the shelf.
  */

  // check for inventory sheet and the shelflist sheet
  var inventory_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("inventory"),
      shelflist_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("shelflist");
      //reshelve_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("reshelve");

  // if both those exist ...
  if( inventory_sheet && shelflist_sheet ) {
    // create reshelve sheet
    var reshelve_sheet = 1;
    // create and array for the reshelving sheet, shelflist, and inventory
    var reshelve = [],
        shelflist = [],
        inventory = [],
        shelflist_barcodes_range = shelflist_sheet.getRange('A:A').getValues(), //barcodes from shelflist
        inventory_barcodes_range = inventory_sheet.getRange('A:A').getValues(); //barcodes from inventory

    //Logger.log(shelflist_barcodes_range.length + ' ' + inventory_barcodes_range.length);

    //fill the arrays ...
    for (var i=0; i<shelflist_barcodes_range.length; i++) {
      shelflist.push(shelflist_barcodes_range[i][0]);
    }
    for (var i=0; i<inventory_barcodes_range.length; i++) {
      inventory.push(inventory_barcodes_range[i][0]);
    }

    //loop through the shelflist, and find the index of the bar code from inventory
    for (var i=0; i<shelflist.length; i++) {
      var match = inventory.indexOf(shelflist[i]);
        reshelve.push(match);
    } //end for

    //remove the reshelve sheet (if it's there), and place a new one into the spreadsheet
    var reshelve_sheet = SpreadsheetApp.getActive().getSheetByName('reshelve');
    if(reshelve_sheet){
      SpreadsheetApp.getActive().deleteSheet(reshelve_sheet);
    }

    //create the spreadsheet 'reshelve', and put it at the end of the other sheets.
    var reshelve_sheet = SpreadsheetApp.getActive().insertSheet('reshelve', SpreadsheetApp.getActive().getSheets().length);



    //start filling the reshelve sheet
    var shelflist_range = shelflist_sheet.getRange( 'A1:D' + Math.floor(shelflist_sheet.getMaxRows()) ),
        reshelve_range = reshelve_sheet.getRange( 'A1:E' + Math.floor(reshelve_sheet.getMaxRows()) ),
        shelflist_range_values = shelflist_range.getValues();

    if (shelflist_range_values.length != reshelve_range.getValues().length) {
      Logger.log('length of reshelve sheet does not match the length of the shelflist');
      return(0); // we can't / shouldn't go on if these don't match up
    }

    //we need to add the index value to the shelflist_range_values array ... do it here
    for (var i=0; i<shelflist_range_values.length; i++) {
      var position = i+1;

      //item not found in shelflist, mark the row accordingly
      if (reshelve[i] == -1){
        //hopefully this shouldn't happen often, as the getRange is an expensive operation
        reshelve_sheet.getRange('A' + position + ':E' + position).setBackground('LightCoral');
        shelflist_range_values[i][4] = null;
      }

      else{
        shelflist_range_values[i][4] = reshelve[i] + 1;
      }

    } //end for

    //finally set values in the reshelve sheet
    reshelve_range.setValues(shelflist_range_values);
    reshelve_sheet.autoResizeColumn(2);

  } //end if
} //end function joinShelfListToInventory()


function checkSort() {
  //this gets all values from the sheet
  //var values = SpreadsheetApp.getActiveSheet().getDataRange().getValues();

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("reshelve"),
      values = sheet.getRange('E:E').getValues(), //these are the row numbers of the items from the inventory sheet
      sort_note = sheet.getRange('F:F'); //this is the output column

  //clear the sort note column
  sort_note.clear();

  //convert the 2D array of values to a one dimensional array of NON-NULL numbers,
  // and another for sheet position
  var scanned_position = [],
      sheet_position = [];
  scanned_position[0] = 0;
  for (var i=0; i<values.length; i++) {
    sheet_position.push(values[i][0]);
    if (typeof values[i][0] == 'number' ) {
      scanned_position.push(values[i][0]);
    }
  } //end for

  //check to see if each value is in the correct position, if not, flag it.
  for (var i=1; i<scanned_position.length; i++) {
    var value_prev = scanned_position[i-1],
        value = scanned_position[i],
        value_next = scanned_position[i+1],
        position = sheet_position.indexOf(value);
    if( (value_prev + 1 == value) || (value_next - 1 == value) ) {
      sheet.getRange(position+1,6).setValue('OK').setBackground('PaleGreen');
    }
    else {
      //get the row index of the value ...
      sheet.getRange(position+1,6).setValue('Shelf Order Bad').setBackground('LightCoral').setFontWeight(700);
    }
  }

  sheet.autoResizeColumn(6);

} //end function CheckSort()
