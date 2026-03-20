CREATE TABLE prediction_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    sport_id UUID REFERENCES sports(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50),
    points INTEGER NOT NULL,
    options JSONB NOT NULL,
    correct_option_id VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    lock_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_pred_questions_event ON prediction_questions(event_id);

CREATE TABLE user_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    question_id UUID REFERENCES prediction_questions(id),
    event_id UUID REFERENCES events(id),
    selected_option_id VARCHAR(10) NOT NULL,
    is_locked BOOLEAN DEFAULT false,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    locked_at TIMESTAMPTZ,
    UNIQUE(user_id, question_id)
);
CREATE INDEX idx_user_predictions_user ON user_predictions(user_id);
CREATE INDEX idx_user_predictions_event ON user_predictions(event_id);

CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    sponsor_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id),
    user_id UUID REFERENCES users(id),
    option_id VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(poll_id, user_id)
);
