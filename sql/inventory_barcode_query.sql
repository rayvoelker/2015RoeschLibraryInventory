SELECT
UPPER(e.index_entry) as barcode,
'i' || ir.record_num || 'a' as item_record_num,
ir.id as item_record_id,
upper(p.call_number_norm) as call_number_norm,
-- here we are pulling in a local call number. 
-- Depending on your institution, this number may be stored in the 050 field
-- or other MARC record field depending on local cataloging practices.
-- This number should be the same as the from the call_number_norm field in
-- the item_record_property table (un-normalized of course)
(
	SELECT
	regexp_replace(v.field_content, '(\|[a-z])', '', 'g') as content

	FROM
	sierra_view.varfield as v

	WHERE
	v.record_id = l.bib_record_id
	AND v.varfield_type_code = 'c'
	AND v.marc_tag = '050'

	limit 1
) as call_number_050,
v.field_content as volume,
i.location_code, i.item_status_code,
b.best_title,
c.due_gmt, i.inventory_gmt

FROM
sierra_view.phrase_entry AS e

JOIN
sierra_view.record_metadata as ir
ON
  e.record_id = ir.id

JOIN
sierra_view.item_record_property AS p
ON
  e.record_id = p.item_record_id

JOIN sierra_view.item_record AS i
ON
  i.id = p.item_record_id

LEFT OUTER JOIN sierra_view.checkout AS c
ON
  i.id = c.item_record_id

JOIN
sierra_view.bib_record_item_record_link	AS l
ON
  l.item_record_id = e.record_id
  
JOIN
sierra_view.bib_record_property AS b
ON
  l.bib_record_id = b.bib_record_id
  
LEFT OUTER JOIN
sierra_view.varfield AS v
ON
  (i.id = v.record_id) AND (v.varfield_type_code = 'v')
  
WHERE
e.index_tag || e.index_entry = 'b' || LOWER('A000023980915')

LIMIT
1
