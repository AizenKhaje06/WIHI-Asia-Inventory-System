-- Add multiple agents per department
-- Each agent has their own username (Department-AgentName) and password

-- Example: Add 2 agents for Facebook
INSERT INTO users (id, username, password, role, display_name, assigned_channel) VALUES
  ('fb_juan_' || extract(epoch from now())::text, 'Facebook-Juan', 'juan123', 'operations', 'Juan (Facebook)', 'Facebook'),
  ('fb_maria_' || extract(epoch from now())::text, 'Facebook-Maria', 'maria123', 'operations', 'Maria (Facebook)', 'Facebook')
ON CONFLICT (username) DO UPDATE SET
  assigned_channel = EXCLUDED.assigned_channel,
  display_name = EXCLUDED.display_name;

-- Example: Add 2 agents for TikTok
INSERT INTO users (id, username, password, role, display_name, assigned_channel) VALUES
  ('tt_pedro_' || extract(epoch from now())::text, 'TikTok-Pedro', 'pedro123', 'operations', 'Pedro (TikTok)', 'TikTok'),
  ('tt_ana_' || extract(epoch from now())::text, 'TikTok-Ana', 'ana123', 'operations', 'Ana (TikTok)', 'TikTok')
ON CONFLICT (username) DO UPDATE SET
  assigned_channel = EXCLUDED.assigned_channel,
  display_name = EXCLUDED.display_name;

-- Example: Add 2 agents for Lazada
INSERT INTO users (id, username, password, role, display_name, assigned_channel) VALUES
  ('lz_carlo_' || extract(epoch from now())::text, 'Lazada-Carlo', 'carlo123', 'operations', 'Carlo (Lazada)', 'Lazada'),
  ('lz_lisa_' || extract(epoch from now())::text, 'Lazada-Lisa', 'lisa123', 'operations', 'Lisa (Lazada)', 'Lazada')
ON CONFLICT (username) DO UPDATE SET
  assigned_channel = EXCLUDED.assigned_channel,
  display_name = EXCLUDED.display_name;

-- Example: Add 2 agents for Shopee
INSERT INTO users (id, username, password, role, display_name, assigned_channel) VALUES
  ('sp_rico_' || extract(epoch from now())::text, 'Shopee-Rico', 'rico123', 'operations', 'Rico (Shopee)', 'Shopee'),
  ('sp_nina_' || extract(epoch from now())::text, 'Shopee-Nina', 'nina123', 'operations', 'Nina (Shopee)', 'Shopee')
ON CONFLICT (username) DO UPDATE SET
  assigned_channel = EXCLUDED.assigned_channel,
  display_name = EXCLUDED.display_name;

-- Example: Add 2 agents for Physical Store
INSERT INTO users (id, username, password, role, display_name, assigned_channel) VALUES
  ('ps_ben_' || extract(epoch from now())::text, 'Physical Store-Ben', 'ben123', 'operations', 'Ben (Physical Store)', 'Physical Store'),
  ('ps_jane_' || extract(epoch from now())::text, 'Physical Store-Jane', 'jane123', 'operations', 'Jane (Physical Store)', 'Physical Store')
ON CONFLICT (username) DO UPDATE SET
  assigned_channel = EXCLUDED.assigned_channel,
  display_name = EXCLUDED.display_name;

-- Add comment
COMMENT ON COLUMN users.assigned_channel IS 'Sales channel/department assigned to operations users. Multiple agents can have the same assigned_channel.';
