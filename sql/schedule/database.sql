-- Skapar databasen exam
CREATE DATABASE IF NOT EXISTS scheduler;

-- Använd databasen
USE scheduler;

-- Skapar en användare "user" med lösenordet "pass"
CREATE USER IF NOT EXISTS 'user'@'%'
IDENTIFIED
WITH mysql_native_password -- MySQL with version > 8.0.4
BY 'pass'
;

-- Ge användaren alla rättigheter på meetings
GRANT ALL PRIVILEGES
    ON scheduler.*
    TO 'user'@'%'
;

-- 
-- Tabeller
-- 

DROP TABLE IF EXISTS users;

CREATE TABLE users
(
  email VARCHAR(255) NOT NULL PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL
)
ENGINE INNODB
CHARSET utf8
;


DROP TABLE IF EXISTS meetings;

CREATE TABLE meetings
(
  id BIGINT(20) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  start_user VARCHAR(255) NOT NULL,
  start_date DATETIME,
  end_date DATETIME,
  `text` VARCHAR(255) NOT NULL,
  v_meeting BOOL NOT NULL
)
ENGINE INNODB
CHARSET utf8
;


DROP TABLE IF EXISTS meeting_users;

CREATE TABLE meeting_users
(
  meeting_id BIGINT(20) NOT NULL,
  user_email VARCHAR(255) NOT NULL
)
ENGINE INNODB
CHARSET utf8
;


DROP TABLE IF EXISTS voting_times;

CREATE TABLE voting_times
(
  id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
  meeting_id BIGINT(20) NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL
)
ENGINE INNODB
CHARSET utf8
;


DROP TABLE IF EXISTS votes;

CREATE TABLE votes
(
  meeting_id BIGINT(20) NOT NULL,
  vote_time_id BIGINT(20) NOT NULL,
  vote_user VARCHAR(255) NOT NULL
)
ENGINE INNODB
CHARSET utf8
;