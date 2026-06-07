-- Bảng lưu toàn bộ config dưới dạng JSON
CREATE TABLE IF NOT EXISTS config (
  id   INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT    NOT NULL,
  v    INTEGER NOT NULL DEFAULT 1
);

-- Bảng lưu liên hệ từ form contact
CREATE TABLE IF NOT EXISTS contacts (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  name       TEXT     NOT NULL,
  email      TEXT     NOT NULL,
  message    TEXT     NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lưu email đăng ký
CREATE TABLE IF NOT EXISTS subscribers (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  email      TEXT     UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
