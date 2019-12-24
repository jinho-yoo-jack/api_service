
SELECT * FROM (
  SELECT
    o.OBJECT_NAME,
    o.OBJECT_ID,
    '' short_name,
    DECODE(bitand(t.property, 32), 32, 'YES', 'NO') PARTITIONED,
    DECODE(bitand(t.property, 64), 64, 'IOT',
    DECODE(bitand(t.property, 512), 512, 'IOT_OVERFLOW',
    DECODE(bitand(t.flags, 536870912), 536870912, 'IOT_MAPPING', null))) iot_type, 
    o.OWNER OBJECT_OWNER,
    o.CREATED,
    o.LAST_DDL_TIME,
    O.GENERATED,
    O.TEMPORARY,
    CASE
      WHEN xt.obj# is null THEN 'N'
      ELSE 'Y'
    END EXTERNAL
  FROM
    SYS.Dba_OBJECTS O,
    sys.tab$ t,
    sys.external_tab$ xt
  WHERE
    O.OWNER = 'RATOR'
    AND o.object_id = t.obj#(+)
    AND o.object_id = xt.obj#(+)
    AND O.OBJECT_TYPE = 'TABLE' 
  UNION ALL
  SELECT
    OBJECT_NAME,
    OBJECT_ID,
    syn.SYNONYM_NAME short_NAME,
    DECODE(bitand(t.property, 32), 32, 'YES', 'NO') PARTITIONED,
    DECODE(bitand(t.property, 64), 64, 'IOT',
    DECODE(bitand(t.property, 512), 512, 'IOT_OVERFLOW',
    DECODE(bitand(t.flags, 536870912), 536870912, 'IOT_MAPPING', null))) iot_type, 
    SYN.TABLE_OWNER OBJECT_OWNER,
    o.CREATED,
    o.LAST_DDL_TIME,
    O.GENERATED,
    O.TEMPORARY,
    CASE
      WHEN xt.obj# is null THEN 'N'
      ELSE 'Y'
    END EXTERNAL
  FROM
    SYS.Dba_OBJECTS O,
    sys.user_synonyms syn,
    sys.tab$ t,
    sys.external_tab$ xt
  WHERE
    syn.table_owner = o.owner
    AND syn.TABLE_NAME = o.object_NAME
    AND o.object_id = t.obj#
    AND o.object_id = xt.obj#(+)
    AND o.object_type = 'TABLE'
    AND NULL = 1
)
WHERE
  OBJECT_NAME NOT IN (SELECT OBJECT_NAME FROM RECYCLEBIN)
  AND not object_name like 'BIN$%'
ORDER BY
  OBJECT_NAME