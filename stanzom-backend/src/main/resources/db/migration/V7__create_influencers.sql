CREATE TABLE influencers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    display_name VARCHAR(100) NOT NULL,
    handle VARCHAR(100),
    bio TEXT,
    sports UUID[],
    niche VARCHAR(50)[],
    platform VARCHAR(50),
    followers_count VARCHAR(20),
    social_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    featured_order INTEGER,
    likes_count INTEGER DEFAULT 0,
    overall_rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE influencer_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    influencer_id UUID REFERENCES influencers(id),
    user_id UUID REFERENCES users(id),
    rating DECIMAL(3,2) NOT NULL,
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(influencer_id, user_id)
);

CREATE TABLE influencer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    niche VARCHAR(50)[],
    sports UUID[],
    bio TEXT,
    social_handle VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
