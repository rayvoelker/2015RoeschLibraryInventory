<?php

function left_pad_number($number, $pad_amount) {
	//returns a string value of a number padded out to the maximum length of the $pad_amount
	
	//if the length of the number is the same or greater than the pad_amount, just return the number unpadded
	if ( strlen($number) >= $pad_amount ) {
		return $number;
	}
	
	$result = array();
	$number = array_map('intval', str_split($number));	
	
	//pop off values from the end of number and push them onto the $result stack
	while ($number) {
		array_push($result, array_pop($number) );
	}
		
	while ( count($result) < $pad_amount ) {
		array_push($result, " ");
	}
	
	$result = array_reverse($result);
	$string = implode('', $result);

	return $string;
}

function normalize_volume($string_data) {
	//will return a string formatted to sort properly among other volumes
	// For example:
	// given a volume number:
	// "v.1"
	// will return:
	// "v.    1"
	
	// given a volume number:
	// "v.11"
	// will return:
	// "v.   11"
	
	$return_string = "";
	$len = strlen($string_data);
	
	//split everything that is a number, and everything that is not a number into $matches
	$regex = "/[0-9]+|[^0-9]+/";
	preg_match_all($regex, $string_data, $matches);
		
	for($i=0; $i<count($matches[0]); $i++) {
		if ( is_numeric ($matches[0][$i]) ) {
			$matches[0][$i] = left_pad_number($matches[0][$i], 5);
		}
	}
	
	$string = implode('', $matches[0]);
	
	return $string;	
} //end function normalize_callnumber


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
*/

//reset all variables needed for our connection
$username = null;
$password = null;
$dsn = null;
$connection = null;

//includes the file in which you've stored your database credentials; should be in php format in this case
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
upper(p.call_number_norm) as call_number_norm,
v.field_content as volume,
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

if($row["volume"]) {
	$row["call_number_norm"] = $row["call_number_norm"] . 
		" " . 
		normalize_volume($row["volume"]);
}

header('Content-Type: application/json');
echo json_encode($row);

$row = null;
$statement = null;
$connection = null;

?>
