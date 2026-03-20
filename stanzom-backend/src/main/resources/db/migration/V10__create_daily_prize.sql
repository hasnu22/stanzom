CREATE TABLE daily_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    sport_id UUID REFERENCES sports(id),
    winner_user_id UUID REFERENCES users(id),
    points_scored INTEGER,
    prediction_accuracy DECIMAL(5,2),
    prize_description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    prize_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE prize_delivery_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    prize_id UUID REFERENCES daily_prizes(id),
    full_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    amazon_order_id VARCHAR(100),
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
