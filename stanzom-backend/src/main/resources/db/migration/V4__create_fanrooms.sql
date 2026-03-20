CREATE TABLE fan_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_by UUID REFERENCES users(id),
    event_id UUID REFERENCES events(id),
    sport_id UUID REFERENCES sports(id),
    invite_code VARCHAR(20) UNIQUE,
    access_type VARCHAR(20) DEFAULT 'INVITE_ONLY',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fan_room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES fan_rooms(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(room_id, user_id)
);

CREATE TABLE fan_room_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES fan_rooms(id),
    invited_by UUID REFERENCES users(id),
    invited_user_id UUID REFERENCES users(id),
    mobile_number VARCHAR(15),
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fan_room_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES fan_rooms(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'TEXT',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_fanroom_messages_room ON fan_room_messages(room_id);
