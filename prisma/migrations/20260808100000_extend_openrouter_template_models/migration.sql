-- Add the current OpenRouter models to the existing OpenRouter template while
-- preserving its configured models and avoiding duplicate entries on re-runs.
UPDATE "ChannelTemplate"
SET "models" = concat_ws(
  ',',
  "models",
  CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,anthropic/claude-fable-5,%' THEN NULL ELSE 'anthropic/claude-fable-5' END,
  CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,anthropic/claude-opus-5,%' THEN NULL ELSE 'anthropic/claude-opus-5' END,
  CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,deepseek/deepseek-v4-pro,%' THEN NULL ELSE 'deepseek/deepseek-v4-pro' END,
  CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,x-ai/grok-4.5,%' THEN NULL ELSE 'x-ai/grok-4.5' END,
  CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,perplexity/sonar,%' THEN NULL ELSE 'perplexity/sonar' END,
  CASE WHEN (',' || replace("models", ' ', '') || ',') LIKE '%,perplexity/sonar-deep-research,%' THEN NULL ELSE 'perplexity/sonar-deep-research' END
)
WHERE lower("name") = 'openrouter';
