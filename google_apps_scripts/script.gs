// Miami University library inventory
// 	version 2.0
//  with collaboration
//	Ray Voelker
//	Sept 23, 2018

// uses a shared library, under Resources -> libraries; 
// to edit shared library called inventoryseed go to https://script.google.com/a/miamioh.edu/d/1QCU8ILpGuCE2se-JrHGCDZkM7e5PG-B0breGkvaprhwz82PQf6WHZ7Tu/edit

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
  menuEntries.push({name: "version 1.5", functionName: "version"});

  spreadsheet.addMenu("Inventory", menuEntries);
} //end function onOpen()


function onEditDup(e) { //must be triggered: Edit -> Current Project Triggers (opens new window) -> Click +Add Trigger in lower right hand of screen
  inventoryseed.onEdit(e);
}

function batchShelfDup() { 
  inventoryseed.batchShelf();
}

function runReshelveDup() {
  inventoryseed.runReshelve();
}

function checkSortDup() {
  var onEdit = inventoryseed.checkSort();
}

function resiveInventoryDup() {
  inventoryseed.resiveInventory();
}

function fixMissingDup() {
  inventoryseed.fixMissing();
}


