CREATE TABLE IF NOT EXISTS proctor_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('TAB_SWITCH','FULLSCREEN_EXIT','CLIPBOARD','DEVTOOLS','RIGHT_CLICK')) NOT NULL,
  severity   TEXT CHECK (severity IN ('LOW','MEDIUM','HIGH')) NOT NULL,
  timestamp  TIMESTAMPTZ DEFAULT now()
);