UPDATE "ChannelTemplate"
SET "models" = concat_ws(',', "models", 'google/gemini-3.7-flash')
WHERE lower("name") = 'openrouter'
  AND (',' || replace("models", ' ', '') || ',') NOT LIKE '%,google/gemini-3.7-flash,%';
