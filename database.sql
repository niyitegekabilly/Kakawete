-- ============================================================================
-- Secret Santa Gift Exchange Database Schema (MySQL 5.7+ / 8.0+ / MariaDB)
-- Simplified: Name-Only Secret Santa Exchange
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. Table: users (Organizers / Administrators)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table: events (Secret Santa Events)
-- ----------------------------------------------------------------------------
CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    organizer_id VARCHAR(36) NULL,
    organizer_name VARCHAR(100) NOT NULL,
    admin_pin_hash VARCHAR(255) NOT NULL,
    exchange_date DATE NULL,
    status ENUM('REGISTRATION', 'DRAW_COMPLETED', 'GIFT_EXCHANGE', 'COMPLETED') NOT NULL DEFAULT 'REGISTRATION',
    reveal_identities BOOLEAN NOT NULL DEFAULT FALSE,
    is_registration_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_events_code (code),
    CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table: participants (Members per event - Name only)
-- ----------------------------------------------------------------------------
CREATE TABLE participants (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    secret_token VARCHAR(64) NOT NULL UNIQUE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_participants_event (event_id),
    INDEX idx_participants_token (secret_token),
    CONSTRAINT fk_participants_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Table: assignments (Derangement Pairs - Zero Self-Assignment)
-- ----------------------------------------------------------------------------
CREATE TABLE assignments (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    giver_id VARCHAR(36) NOT NULL,
    receiver_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_event_giver (event_id, giver_id),
    UNIQUE KEY uq_event_receiver (event_id, receiver_id),
    INDEX idx_assignments_event (event_id),
    CONSTRAINT chk_no_self_assignment CHECK (giver_id <> receiver_id),
    CONSTRAINT fk_assignments_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignments_giver FOREIGN KEY (giver_id) REFERENCES participants(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignments_receiver FOREIGN KEY (receiver_id) REFERENCES participants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SAMPLE SEED DATA (Demo Event: VJN Staff Secret Santa 2026)
-- ============================================================================

INSERT INTO events (id, code, title, organizer_name, admin_pin_hash, exchange_date, status, reveal_identities, is_registration_locked) VALUES
('evt_vjn_2026', 'VJN-XMAS-8K4P', 'VJN Staff Secret Santa 2026', 'Jean Bosco', SHA2('1234', 256), '2026-12-20', 'REGISTRATION', FALSE, FALSE);

INSERT INTO participants (id, event_id, name, secret_token) VALUES
('part_1', 'evt_vjn_2026', 'Bosco', 'bosco-token-77a1'),
('part_2', 'evt_vjn_2026', 'Alice', 'alice-token-99b2'),
('part_3', 'evt_vjn_2026', 'Jean', 'jean-token-33c3'),
('part_4', 'evt_vjn_2026', 'Diane', 'diane-token-44d4'),
('part_5', 'evt_vjn_2026', 'Patrick', 'patrick-token-55e5');
