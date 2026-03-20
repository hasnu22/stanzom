CREATE TABLE reward_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    points INTEGER NOT NULL,
    transaction_type VARCHAR(50),
    description TEXT,
    reference_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_reward_tx_user ON reward_transactions(user_id);

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES users(id),
    referred_id UUID REFERENCES users(id),
    referral_code VARCHAR(20) NOT NULL,
    points_awarded INTEGER DEFAULT 50,
    downloaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(referred_id)
);

CREATE TABLE share_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    platform VARCHAR(30),
    content_type VARCHAR(50),
    content_id VARCHAR(100),
    points_awarded INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);
