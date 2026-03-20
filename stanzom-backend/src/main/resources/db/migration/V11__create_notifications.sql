CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(200),
    message TEXT,
    type VARCHAR(50),
    reference_id VARCHAR(100),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);

CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) UNIQUE,
    push_enabled BOOLEAN DEFAULT true,
    prediction_alerts BOOLEAN DEFAULT true,
    event_alerts BOOLEAN DEFAULT true,
    prize_alerts BOOLEAN DEFAULT true,
    social_alerts BOOLEAN DEFAULT true
);
