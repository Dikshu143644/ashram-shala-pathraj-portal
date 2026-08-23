-- WhatsApp conversations table for storing webhook message history
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  sender VARCHAR(20) NOT NULL DEFAULT 'parent',
  message TEXT,
  ai_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on phone_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone
  ON whatsapp_conversations (phone_number);

-- Index on created_at for recent conversation queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_created
  ON whatsapp_conversations (created_at DESC);
