SELECT 
lower(p.barcode) as barcode, 
upper(p.call_number_norm || COALESCE(' ' || v.field_content, '') ) as call_number_norm, 
i.location_code, 
i.item_status_code,
s.content AS inventory_note, 
to_date(c.due_gmt::text, 'YYYY-MM-DD HH:MI:SS') as due_gmt

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

WHERE 
i.location_code = 'rc5'
AND 
p.call_number_norm >= lower('HB   74 M3 A4 1963') 
AND 
p.call_number_norm <= lower('HB  851 C45')

order by call_number_norm ASC
LIMIT 10000
