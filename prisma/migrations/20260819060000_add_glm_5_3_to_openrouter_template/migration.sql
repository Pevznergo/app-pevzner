UPDATE "ChannelTemplate"
SET "models" = concat_ws(',', "models", 'z-ai/glm-5.3')
WHERE lower("name") = 'openrouter'
  AND (',' || replace("models", ' ', '') || ',') NOT LIKE '%,z-ai/glm-5.3,%';
