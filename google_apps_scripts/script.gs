// Miami University library inventory
// 	version 2.0
//  with collaboration
//	Ray Voelker
//	Sept 23, 2018

// after pasting in new script.gs into script editor remember to import shared library by clicking
// Resources menu, and selecting Libraries. In the libraries window paste/add the following library ID (make sure to avoid leading/trailing spaces): MF-ykH47p89j7uhRAH5k-INUEthJtyoXG
// then select the highest version of the inventoryseed


// uses a shared library, under Resources -> libraries;
// to edit shared library called inventoryseed go to https://script.google.com/a/miamioh.edu/d/1QCU8ILpGuCE2se-JrHGCDZkM7e5PG-B0breGkvaprhwz82PQf6WHZ7Tu/edit

function onOpen() {
  inventoryseed.onOpen();
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
  inventoryseed.checkSort();
}

function resiveInventoryDup() {
  inventoryseed.resiveInventory();
}

function fixMissingDup() {
  inventoryseed.fixMissing();
}
