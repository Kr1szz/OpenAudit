CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    vendor TEXT,
    amount NUMERIC,
    date DATE,
    flag BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample queries
-- INSERT INTO receipts (vendor, amount, date, flag, image_url) VALUES ('Vendor A', 100.50, '2023-10-01', FALSE, 'path/to/image.jpg');
-- SELECT * FROM receipts;
-- SELECT * FROM receipts WHERE flag = TRUE;