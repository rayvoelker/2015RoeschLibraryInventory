SELECT 
-- i.inventory_gmt, 
lower(p.barcode) as barcode, 
upper(p.call_number_norm || COALESCE(' ' || v.field_content, '') ) as call_number_norm, 
b.best_title,
i.location_code, 
i.item_status_code,
s.content AS inventory_note, to_date(c.due_gmt::text, 
'YYYY-MM-DD HH:MI:SS') as due_gmt

FROM 
sierra_view.item_record_property	AS p 
JOIN 
sierra_view.item_record			AS i 
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
i.location_code = 'imp'
/*AND 
p.call_number_norm >= lower('') 
AND 
p.call_number_norm <= lower('GV 1507 W8 B35 2014')
*/

-- since we have the situation where multiple bibs can share the same item record, we should remove duplicated items.
-- we need to tweak this ... not sure grouping is the best way to do this.

-- group by
-- s.content,
-- c.due_gmt,
-- p.barcode, p.call_number_norm,
-- v.field_content, 
-- l.items_display_order,
-- i.location_code, i.item_status_code

order by 
--b.best_title ASC, --for periodicals which are sorted by title
p.call_number_norm ASC,
l.items_display_order ASC

LIMIT 10000
