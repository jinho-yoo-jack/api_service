SELECT
  c.column_name,
  CASE
    WHEN data_type = 'CHAR' THEN
      data_type||'('||c.char_length||DECODE(char_used,'B',' BYTE','C',' CHAR',null)||')'
    WHEN data_type = 'VARCHAR' THEN
      data_type||'('||c.char_length||DECODE(char_used,'B',' BYTE','C',' CHAR',null)||')'
    WHEN data_type = 'VARCHAR2' THEN
      data_type||'('||c.char_length||DECODE(char_used,'B',' BYTE','C',' CHAR',null)||')'
    WHEN data_type = 'NCHAR' THEN
      data_type||'('||c.char_length||DECODE(char_used,'B',' BYTE','C',' CHAR',null)||')'
    WHEN data_type = 'NUMBER' THEN
      CASE
        WHEN c.data_precision IS null AND c.data_scale IS null THEN 'NUMBER'
        WHEN c.data_precision IS null AND c.data_scale IS not null THEN 'NUMBER(38,'||c.data_scale||')'
        ELSE data_type||'('||c.data_precision||','||c.data_SCALE||')'
      END
    WHEN data_type = 'NVARCHAR' THEN
      data_type||'('||c.char_length||DECODE(char_used,'B',' BYTE','C',' CHAR',null)||')'
    WHEN data_type = 'NVARCHAR2' THEN
      data_type||'('||c.char_length||DECODE(char_used,'B',' BYTE','C',' CHAR',null)||')'
  ELSE
    data_type
  END data_type,
  DECODE(nullable,'Y','Yes','No') nullable,
  c.DATA_DEFAULT,
  column_id,
  com.comments
FROM
  sys.Dba_tab_Columns c,
  sys.Dba_col_comments com
WHERE
  c.owner = 'RATOR'
  AND c.table_name = 'USERS'
  AND c.table_name = com.table_name
  AND c.owner = com.owner
  AND c.column_name = com.column_name
ORDER BY
  column_id