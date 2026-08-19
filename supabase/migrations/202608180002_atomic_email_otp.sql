-- Make email OTP challenges idempotent, stable across resends, and race-safe.
-- Existing in-flight challenges are deliberately retired because their random
-- bearer tokens cannot be reconstructed by the v2 deterministic token scheme.

ALTER TABLE public.otp_verifications
  ADD COLUMN IF NOT EXISTS request_id UUID,
  ADD COLUMN IF NOT EXISTS token_version SMALLINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_send_request_id UUID,
  ADD COLUMN IF NOT EXISTS send_reserved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_verify_request_id UUID,
  ADD COLUMN IF NOT EXISTS last_verify_status TEXT;

UPDATE public.otp_verifications
SET consumed_at = COALESCE(consumed_at, NOW()),
    updated_at = NOW()
WHERE consumed_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_otp_verifications_request_id
  ON public.otp_verifications(request_id)
  WHERE request_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_otp_verifications_one_active_user
  ON public.otp_verifications(user_id)
  WHERE consumed_at IS NULL;

CREATE OR REPLACE FUNCTION public.begin_otp_challenge(
  p_user_id UUID,
  p_challenge_id UUID,
  p_challenge_hash TEXT,
  p_expires_at TIMESTAMPTZ,
  p_request_ip TEXT,
  p_request_id UUID
)
RETURNS TABLE (
  challenge_id UUID,
  stored_challenge_hash TEXT,
  challenge_expires_at TIMESTAMPTZ,
  created BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  challenge_row public.otp_verifications%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::TEXT, 0));

  SELECT ov.* INTO challenge_row
  FROM public.otp_verifications AS ov
  WHERE ov.request_id = p_request_id
    AND ov.user_id = p_user_id
    AND ov.token_version = 2
    AND ov.consumed_at IS NULL
    AND ov.expires_at > NOW()
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT challenge_row.id, challenge_row.challenge_hash, challenge_row.expires_at, FALSE;
    RETURN;
  END IF;

  SELECT ov.* INTO challenge_row
  FROM public.otp_verifications AS ov
  WHERE ov.user_id = p_user_id
    AND ov.token_version = 2
    AND ov.consumed_at IS NULL
    AND ov.expires_at > NOW()
  ORDER BY ov.created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    RETURN QUERY SELECT challenge_row.id, challenge_row.challenge_hash, challenge_row.expires_at, FALSE;
    RETURN;
  END IF;

  UPDATE public.otp_verifications AS ov
  SET consumed_at = COALESCE(ov.consumed_at, NOW()),
      updated_at = NOW()
  WHERE ov.user_id = p_user_id
    AND ov.consumed_at IS NULL;

  INSERT INTO public.otp_verifications (
    id,
    user_id,
    challenge_hash,
    expires_at,
    request_ip,
    request_id,
    token_version
  ) VALUES (
    p_challenge_id,
    p_user_id,
    p_challenge_hash,
    p_expires_at,
    p_request_ip,
    p_request_id,
    2
  )
  RETURNING * INTO challenge_row;

  RETURN QUERY SELECT challenge_row.id, challenge_row.challenge_hash, challenge_row.expires_at, TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.reserve_otp_send(
  p_challenge_hash TEXT,
  p_otp_hash TEXT,
  p_otp_expires_at TIMESTAMPTZ,
  p_request_id UUID,
  p_max_sends INTEGER,
  p_cooldown_seconds INTEGER,
  p_reservation_seconds INTEGER
)
RETURNS TABLE (
  reservation_status TEXT,
  challenge_id UUID,
  user_id UUID,
  effective_otp_expires_at TIMESTAMPTZ,
  effective_send_count INTEGER,
  retry_after_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  challenge_row public.otp_verifications%ROWTYPE;
  retry_seconds INTEGER;
BEGIN
  SELECT ov.* INTO challenge_row
  FROM public.otp_verifications AS ov
  WHERE ov.challenge_hash = p_challenge_hash
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND OR challenge_row.consumed_at IS NOT NULL OR challenge_row.expires_at <= NOW() THEN
    RETURN QUERY SELECT 'expired'::TEXT, NULL::UUID, NULL::UUID, NULL::TIMESTAMPTZ, 0, 0;
    RETURN;
  END IF;

  IF challenge_row.last_send_request_id = p_request_id THEN
    RETURN QUERY SELECT
      CASE WHEN challenge_row.send_reserved_at IS NULL THEN 'sent'::TEXT ELSE 'reserved'::TEXT END,
      challenge_row.id,
      challenge_row.user_id,
      challenge_row.otp_expires_at,
      challenge_row.send_count,
      0;
    RETURN;
  END IF;

  IF challenge_row.send_reserved_at IS NOT NULL
     AND challenge_row.send_reserved_at > NOW() - make_interval(secs => p_reservation_seconds) THEN
    retry_seconds := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (
      challenge_row.send_reserved_at + make_interval(secs => p_reservation_seconds) - NOW()
    )))::INTEGER);
    RETURN QUERY SELECT 'busy'::TEXT, challenge_row.id, challenge_row.user_id,
      challenge_row.otp_expires_at, challenge_row.send_count, retry_seconds;
    RETURN;
  END IF;

  IF challenge_row.send_count >= p_max_sends THEN
    RETURN QUERY SELECT 'send_limit'::TEXT, challenge_row.id, challenge_row.user_id,
      challenge_row.otp_expires_at, challenge_row.send_count, 0;
    RETURN;
  END IF;

  IF challenge_row.last_sent_at IS NOT NULL
     AND challenge_row.last_sent_at > NOW() - make_interval(secs => p_cooldown_seconds) THEN
    retry_seconds := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (
      challenge_row.last_sent_at + make_interval(secs => p_cooldown_seconds) - NOW()
    )))::INTEGER);
    RETURN QUERY SELECT 'cooldown'::TEXT, challenge_row.id, challenge_row.user_id,
      challenge_row.otp_expires_at, challenge_row.send_count, retry_seconds;
    RETURN;
  END IF;

  IF challenge_row.otp_hash IS NOT NULL AND challenge_row.otp_hash <> p_otp_hash THEN
    RETURN QUERY SELECT 'conflict'::TEXT, challenge_row.id, challenge_row.user_id,
      challenge_row.otp_expires_at, challenge_row.send_count, 0;
    RETURN;
  END IF;

  IF challenge_row.otp_expires_at IS NOT NULL AND challenge_row.otp_expires_at <= NOW() THEN
    RETURN QUERY SELECT 'otp_expired'::TEXT, challenge_row.id, challenge_row.user_id,
      challenge_row.otp_expires_at, challenge_row.send_count, 0;
    RETURN;
  END IF;

  UPDATE public.otp_verifications AS ov
  SET otp_hash = COALESCE(ov.otp_hash, p_otp_hash),
      otp_expires_at = COALESCE(ov.otp_expires_at, LEAST(p_otp_expires_at, ov.expires_at)),
      send_count = ov.send_count + 1,
      last_send_request_id = p_request_id,
      send_reserved_at = NOW(),
      updated_at = NOW()
  WHERE ov.id = challenge_row.id
  RETURNING * INTO challenge_row;

  RETURN QUERY SELECT 'reserved'::TEXT, challenge_row.id, challenge_row.user_id,
    challenge_row.otp_expires_at, challenge_row.send_count, 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_otp_send(
  p_challenge_id UUID,
  p_request_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.otp_verifications AS ov
  SET last_sent_at = NOW(),
      send_reserved_at = NULL,
      updated_at = NOW()
  WHERE ov.id = p_challenge_id
    AND ov.last_send_request_id = p_request_id
    AND ov.send_reserved_at IS NOT NULL
    AND ov.consumed_at IS NULL;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_otp_send(
  p_challenge_id UUID,
  p_request_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.otp_verifications AS ov
  SET send_count = GREATEST(0, ov.send_count - 1),
      last_send_request_id = NULL,
      send_reserved_at = NULL,
      updated_at = NOW()
  WHERE ov.id = p_challenge_id
    AND ov.last_send_request_id = p_request_id
    AND ov.send_reserved_at IS NOT NULL
    AND ov.consumed_at IS NULL;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_otp_challenge(
  p_challenge_hash TEXT,
  p_submitted_otp_hash TEXT,
  p_request_id UUID,
  p_max_attempts INTEGER
)
RETURNS TABLE (
  verification_status TEXT,
  user_id UUID,
  attempt_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  challenge_row public.otp_verifications%ROWTYPE;
  next_attempt_count INTEGER;
BEGIN
  SELECT ov.* INTO challenge_row
  FROM public.otp_verifications AS ov
  WHERE ov.challenge_hash = p_challenge_hash
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'expired'::TEXT, NULL::UUID, 0;
    RETURN;
  END IF;

  IF challenge_row.last_verify_request_id = p_request_id THEN
    RETURN QUERY SELECT COALESCE(challenge_row.last_verify_status, 'expired'),
      challenge_row.user_id, challenge_row.attempt_count;
    RETURN;
  END IF;

  IF challenge_row.consumed_at IS NOT NULL THEN
    RETURN QUERY SELECT 'used'::TEXT, challenge_row.user_id, challenge_row.attempt_count;
    RETURN;
  END IF;

  IF challenge_row.expires_at <= NOW()
     OR challenge_row.otp_hash IS NULL
     OR challenge_row.otp_expires_at IS NULL
     OR challenge_row.otp_expires_at <= NOW() THEN
    RETURN QUERY SELECT 'expired'::TEXT, challenge_row.user_id, challenge_row.attempt_count;
    RETURN;
  END IF;

  IF challenge_row.attempt_count >= p_max_attempts THEN
    RETURN QUERY SELECT 'attempt_limit'::TEXT, challenge_row.user_id, challenge_row.attempt_count;
    RETURN;
  END IF;

  next_attempt_count := challenge_row.attempt_count + 1;

  IF challenge_row.otp_hash = p_submitted_otp_hash THEN
    UPDATE public.otp_verifications AS ov
    SET attempt_count = next_attempt_count,
        consumed_at = NOW(),
        last_verify_request_id = p_request_id,
        last_verify_status = 'success',
        updated_at = NOW()
    WHERE ov.id = challenge_row.id;

    RETURN QUERY SELECT 'success'::TEXT, challenge_row.user_id, next_attempt_count;
    RETURN;
  END IF;

  UPDATE public.otp_verifications AS ov
  SET attempt_count = next_attempt_count,
      last_verify_request_id = p_request_id,
      last_verify_status = 'invalid',
      updated_at = NOW()
  WHERE ov.id = challenge_row.id;

  RETURN QUERY SELECT 'invalid'::TEXT, challenge_row.user_id, next_attempt_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_auth_security_state()
RETURNS TABLE (deleted_challenges BIGINT, deleted_rate_limits BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  challenge_count BIGINT;
  rate_limit_count BIGINT;
BEGIN
  DELETE FROM public.otp_verifications AS ov
  WHERE ov.expires_at < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS challenge_count = ROW_COUNT;

  DELETE FROM public.auth_rate_limits AS limits
  WHERE limits.updated_at < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS rate_limit_count = ROW_COUNT;

  RETURN QUERY SELECT challenge_count, rate_limit_count;
END;
$$;

REVOKE ALL ON FUNCTION public.begin_otp_challenge(UUID, UUID, TEXT, TIMESTAMPTZ, TEXT, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reserve_otp_send(TEXT, TEXT, TIMESTAMPTZ, UUID, INTEGER, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.confirm_otp_send(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cancel_otp_send(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.verify_otp_challenge(TEXT, TEXT, UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cleanup_auth_security_state() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.begin_otp_challenge(UUID, UUID, TEXT, TIMESTAMPTZ, TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_otp_send(TEXT, TEXT, TIMESTAMPTZ, UUID, INTEGER, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_otp_send(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.cancel_otp_send(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_otp_challenge(TEXT, TEXT, UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_auth_security_state() TO service_role;
