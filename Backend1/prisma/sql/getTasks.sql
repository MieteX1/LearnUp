select id, name, order_, difficulty, category, 'card' as type from public."Card"
where collection_id = $1
UNION
select id, name, order_, difficulty, category, 'test' as type from public."Task_test"
where collection_id = $1
UNION
select id, name, order_, difficulty, category, 'open' from public."Task_open"
where collection_id = $1
UNION
select id, name, order_, difficulty, category, 'match' from public."Task_match"
where collection_id = $1
UNION
select id, name, order_, difficulty, category, 'gap' from public."Task_gap"
where collection_id = $1
order by order_ asc, category
