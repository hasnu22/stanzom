CREATE TABLE sentiment_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(50) DEFAULT 'India',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);
CREATE INDEX idx_sentiment_event ON sentiment_votes(event_id);
CREATE INDEX idx_sentiment_city ON sentiment_votes(city);
