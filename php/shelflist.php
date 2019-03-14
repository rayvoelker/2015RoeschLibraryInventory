<?php
/*script written by Craig Boman, Miami University Libraries 
with the purpose of providing information as part of a library inventory.
The script receives formatted URL data from Google sheets with a location code and 
call number start and call number end. Script works best with normally formatted and
continous ascdending call number data. If call number ranges are continuous but multiple
locations are interfiled in the spreadsheet this will error out. Only feed in call
number ranges with a single unique location.

Sample URL: http://ulblwebt02.lib.miamioh.edu/~bomanca/collection/shelflist.php?location=scr&start=AY%20%20%2067%20N5%20W7%20%202005&end=PN%20%20171%20F56%20W35%201998
*/

require_once('getdb.php');

$db_handle = getdb(); //call the db function

$start = preg_replace("/[^a-zA-Z0-9]/", "", $_GET['start']);
$end = preg_replace("/[^a-zA-Z0-9]/", "", $_GET['end']);
$location = preg_replace("/[^a-zA-Z0-9]/", "", $_GET['location']);

$query = " 
SELECT
e.index_entry,
p.call_number_norm,
i.location_code,
i.item_status_code,
b.best_title,
c.due_gmt,
i.inventory_gmt
FROM
sierra_view.item_record_property AS p
JOIN
sierra_view.phrase_entry AS e
ON
e.record_id = p.item_record_id

JOIN
sierra_view.item_record AS i
ON
p.item_record_id = i.id
LEFT OUTER JOIN
sierra_view.subfield			AS s
ON
  (s.record_id = p.item_record_id) AND s.field_type_code = 'w'

LEFT OUTER JOIN
sierra_view.checkout			AS c
ON
  (i.record_id = c.item_record_id)


LEFT OUTER JOIN
sierra_view.varfield			AS v
ON
  i.id = v.record_id AND v.varfield_type_code = 'v'

LEFT JOIN
sierra_view.bib_record_item_record_link AS l
ON
  l.item_record_id = i.id

LEFT JOIN
sierra_view.bib_record_property as b
ON
  b.bib_record_id = l.bib_record_id

WHERE
i.location_code = '$location'

  --comment out this section for items organized by title
AND
p.call_number_norm >= lower('$start')
AND
p.call_number_norm <= lower('$end')

--LIMIT 10
ORDER BY
p.call_number_norm ASC
";


$result = pg_query($db_handle, $query);
 
$rows = array();
while($r = pg_fetch_row($result)) {
      $rows[] = $r;
 }
echo json_encode($rows);

 pg_free_result($result);
//deprecated pg_close($db_handle);
?>
