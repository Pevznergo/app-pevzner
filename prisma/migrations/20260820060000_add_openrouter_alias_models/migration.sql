UPDATE "ChannelTemplate"
SET
  "models" = concat_ws(
    ',',
    "models",
    CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,claude-sonnet-5,%' THEN NULL ELSE 'claude-sonnet-5' END,
    CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,claude-opus-5,%' THEN NULL ELSE 'claude-opus-5' END,
    CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,claude-sonnet-4-6,%' THEN NULL ELSE 'claude-sonnet-4-6' END,
    CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,gpt-5.2,%' THEN NULL ELSE 'gpt-5.2' END,
    CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,gpt-5.5,%' THEN NULL ELSE 'gpt-5.5' END,
    CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,gpt-5.4,%' THEN NULL ELSE 'gpt-5.4' END,
    CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,gemini-3.1-pro-preview,%' THEN NULL ELSE 'gemini-3.1-pro-preview' END,
    CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,claude-opus-4-8,%' THEN NULL ELSE 'claude-opus-4-8' END,
    CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,claude-sonnet-4-5,%' THEN NULL ELSE 'claude-sonnet-4-5' END,
    CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,gpt-5.6-luna,%' THEN NULL ELSE 'gpt-5.6-luna' END,
    CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,gpt-5.6-terra,%' THEN NULL ELSE 'gpt-5.6-terra' END,
    CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,gpt-5.6-sol,%' THEN NULL ELSE 'gpt-5.6-sol' END
  ),
  "modelMapping" = (
    COALESCE(NULLIF("modelMapping", ''), '{}')::jsonb ||
    '{
      "claude-sonnet-5": "anthropic/claude-sonnet-5",
      "claude-opus-5": "anthropic/claude-opus-5",
      "claude-sonnet-4-6": "anthropic/claude-sonnet-4.6",
      "gpt-5.2": "openai/gpt-5.2",
      "gpt-5.5": "openai/gpt-5.5",
      "gpt-5.4": "openai/gpt-5.4",
      "gemini-3.1-pro-preview": "google/gemini-3.1-pro-preview",
      "claude-opus-4-8": "anthropic/claude-opus-4.8",
      "claude-sonnet-4-5": "anthropic/claude-sonnet-4.5",
      "gpt-5.6-luna": "openai/gpt-5.6-luna",
      "gpt-5.6-terra": "openai/gpt-5.6-terra",
      "gpt-5.6-sol": "openai/gpt-5.6-sol"
    }'::jsonb
  )::text
WHERE lower("name") = 'openrouter';
