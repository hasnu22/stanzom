CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    username VARCHAR(50) UNIQUE,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(50) DEFAULT 'India',
    profile_image_url TEXT,
    favorite_team_id UUID,
    favorite_sport_id UUID,
    season_points INTEGER DEFAULT 0,
    season_accuracy DECIMAL(5,2) DEFAULT 0,
    active_days INTEGER DEFAULT 0,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES users(id),
    is_influencer BOOLEAN DEFAULT false,
    influencer_verified BOOLEAN DEFAULT false,
    fcm_token TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_state ON users(state);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_season_points ON users(season_points DESC);
