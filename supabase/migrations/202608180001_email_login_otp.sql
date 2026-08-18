ALTER TABLE public.auth_users
  ADD COLUMN IF NOT EXISTS email VARCHAR(320);

CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.auth_users(id) ON DELETE CASCADE,
  challenge_hash TEXT UNIQUE NOT NULL,
  otp_hash TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  otp_expires_at TIMESTAMPTZ,
  send_count INTEGER NOT NULL DEFAULT 0 CHECK (send_count >= 0 AND send_count <= 3),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0 AND attempt_count <= 5),
  last_sent_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  request_ip VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_verifications_user_id
  ON public.otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at
  ON public.otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_active
  ON public.otp_verifications(challenge_hash)
  WHERE consumed_at IS NULL;

ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.otp_verifications FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.otp_verifications TO service_role;


CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  bucket TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (bucket, key_hash)
);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.auth_rate_limits FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.auth_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_auth_rate_limit(
  p_bucket TEXT,
  p_key_hash TEXT,
  p_window_seconds INTEGER,
  p_max_attempts INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  INSERT INTO public.auth_rate_limits AS limits (
    bucket,
    key_hash,
    window_started_at,
    request_count,
    updated_at
  )
  VALUES (p_bucket, p_key_hash, NOW(), 1, NOW())
  ON CONFLICT (bucket, key_hash) DO UPDATE SET
    request_count = CASE
      WHEN limits.window_started_at <= NOW() - make_interval(secs => p_window_seconds) THEN 1
      ELSE limits.request_count + 1
    END,
    window_started_at = CASE
      WHEN limits.window_started_at <= NOW() - make_interval(secs => p_window_seconds) THEN NOW()
      ELSE limits.window_started_at
    END,
    updated_at = NOW()
  RETURNING request_count INTO current_count;

  RETURN current_count <= p_max_attempts;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_auth_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_auth_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;
