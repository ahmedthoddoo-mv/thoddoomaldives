-- A clean production seed contains only the three membership plans.
select 'membership_plans' as table_name, count(*) as actual_count, 3 as expected_count
from public.membership_plans;

select 'partners' as table_name, count(*) as actual_count, 0 as expected_count
from public.partners;

select 'properties' as table_name, count(*) as actual_count, 0 as expected_count
from public.properties;
