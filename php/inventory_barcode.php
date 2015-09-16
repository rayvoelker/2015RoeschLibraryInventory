<?php
// sanitize the input
if ( isset($_GET['barcode']) )  {
	header("Content-Type: application/json");
	// ensure that the barcode value is formatted somewhat sanely
	if( strlen($_GET['barcode']) > 12 ) {
		//we don't expect barcodes to be longer than 12 alpha-numeric characters
		//although, 99.9 % of our scannable barcodes are 10 digit, I'm leaving some breathing room
		echo "{}";
		die();
	}
	// barcodes are ONLY alpha-numeric ... strip anything that isn't this.
	$barcode = preg_replace("/[^a-zA-Z0-9\s]/", "", $_GET['barcode']);
}
else{
	die();
}

/*
include file (item_barcode.php) supplies the following
arguments as the example below illustrates :
	$username = "username";
	$password = "password";

	$dsn = "pgsql:"
		. "host=sierra-db.school.edu;"
		. "dbname=iii;"
		. "port=1032;"
		. "sslmode=require;"
		. "charset=utf8;"
*/

//reset all variables needed for our connection
$username = null;
$password = null;
$dsn = null;
$connection = null;

require_once($_SERVER['DOCUMENT_ROOT'] . '/../includes/sql/sqlinv_group.php');

//make our database connection
try {
	// $connection = new PDO($dsn, $username, $password, array(PDO::ATTR_PERSISTENT => true));
	$connection = new PDO($dsn, $username, $password);
}

catch ( PDOException $e ) {
	$row = null;
	$statement = null;
	$connection = null;

	echo "problem connecting to database...\n";
	error_log('PDO Exception: '.$e->getMessage());
	exit(1);
}

//set output to utf-8
$connection->query('SET NAMES UNICODE');

$sql = '
SELECT

-- p.call_number_norm,
upper(p.call_number_norm || COALESCE(\' \' || v.field_content, \'\') ) as call_number_norm,
i.location_code, i.item_status_code,
b.best_title,
c.due_gmt, i.inventory_gmt

-- *

FROM

sierra_view.phrase_entry				AS e

JOIN
sierra_view.item_record_property		AS p
ON
  e.record_id = p.item_record_id

  JOIN sierra_view.item_record			AS i
ON
  i.id = p.item_record_id

LEFT OUTER JOIN sierra_view.checkout	AS c
ON
  i.id = c.item_record_id

-- This JOIN will get the Title and Author from the bib
JOIN
sierra_view.bib_record_item_record_link	AS l
ON
  l.item_record_id = e.record_id
JOIN
sierra_view.bib_record_property			AS b
ON
  l.bib_record_id = b.bib_record_id
  
LEFT OUTER JOIN
sierra_view.varfield					AS v
ON
  (i.id = v.record_id) AND (v.varfield_type_code = \'v\')

WHERE
e.index_tag || e.index_entry = \'b\' || UPPER(\'' . $barcode . '\')
OR
e.index_tag || e.index_entry = \'b\' || LOWER(\'' . $barcode . '\')
';

$statement = $connection->prepare($sql);
$statement->execute();
$row = $statement->fetch(PDO::FETCH_ASSOC);
header('Content-Type: application/json');
echo json_encode($row);

$row = null;
$statement = null;
$connection = null;

?>