CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID REFERENCES sports(id),
    tournament_id UUID REFERENCES tournaments(id),
    short_name VARCHAR(10),
    full_name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    home_ground VARCHAR(100),
    primary_color VARCHAR(10),
    secondary_color VARCHAR(10),
    logo_url TEXT,
    followers_count INTEGER DEFAULT 0,
    overall_rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    founded_year INTEGER,
    titles INTEGER DEFAULT 0
);
CREATE INDEX idx_teams_sport ON teams(sport_id);

CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID REFERENCES sports(id),
    name VARCHAR(100) NOT NULL,
    team_id UUID REFERENCES teams(id),
    role VARCHAR(50),
    country VARCHAR(50),
    jersey_number INTEGER,
    followers_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    overall_rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    bio TEXT,
    image_url TEXT,
    stats JSONB,
    is_active BOOLEAN DEFAULT true
);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_sport ON players(sport_id);

CREATE TABLE player_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id),
    user_id UUID REFERENCES users(id),
    ratings JSONB NOT NULL,
    overall_rating DECIMAL(3,2),
    review_text TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(player_id, user_id)
);

CREATE TABLE team_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    user_id UUID REFERENCES users(id),
    ratings JSONB NOT NULL,
    overall_rating DECIMAL(3,2),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, user_id)
);

CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(20),
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, entity_type, entity_id)
);
CREATE INDEX idx_user_follows_entity ON user_follows(entity_type, entity_id);
