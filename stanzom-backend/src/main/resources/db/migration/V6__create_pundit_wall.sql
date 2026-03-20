CREATE TABLE pundit_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_id UUID REFERENCES events(id),
    sport_id UUID REFERENCES sports(id),
    take_text TEXT,
    audience_type VARCHAR(20) DEFAULT 'PUBLIC',
    likes_count INTEGER DEFAULT 0,
    is_auto_generated BOOLEAN DEFAULT true,
    user_accuracy DECIMAL(5,2),
    user_rank_at_post INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_pundit_posts_event ON pundit_posts(event_id);
CREATE INDEX idx_pundit_posts_user ON pundit_posts(user_id);

CREATE TABLE pundit_post_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES pundit_posts(id),
    question_text VARCHAR(200),
    user_answer TEXT,
    correct_answer TEXT,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0
);

CREATE TABLE pundit_post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES pundit_posts(id),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(post_id, user_id)
);
