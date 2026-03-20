CREATE TABLE sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(30) UNIQUE NOT NULL,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0
);
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID REFERENCES sports(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    season VARCHAR(20),
    start_date DATE,
    end_date DATE,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID REFERENCES sports(id),
    tournament_id UUID REFERENCES tournaments(id),
    event_type VARCHAR(30) DEFAULT 'MATCH',
    title VARCHAR(200),
    team_home_id UUID,
    team_away_id UUID,
    event_date TIMESTAMPTZ NOT NULL,
    venue VARCHAR(100),
    status VARCHAR(20) DEFAULT 'UPCOMING',
    score_home VARCHAR(20),
    score_away VARCHAR(20),
    winner_team_id UUID,
    metadata JSONB,
    current_period VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_sport_id ON events(sport_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_tournament_id ON events(tournament_id);

CREATE TABLE event_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_event_reactions_event ON event_reactions(event_id);

CREATE TABLE event_buzz_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    post_type VARCHAR(20),
    event_moment VARCHAR(50),
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_buzz_posts_event ON event_buzz_posts(event_id);
CREATE INDEX idx_buzz_posts_type ON event_buzz_posts(post_type);

CREATE TABLE event_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    rating DECIMAL(3,2) NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);
