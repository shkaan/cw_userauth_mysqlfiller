create database if not exists crossword;

use crossword;

drop table if exists cwWords;

create table if not exists cwWords(
    entryId integer primary key auto_increment unique,
    question varchar(100) NOT NULL,
    answer varchar(100) NOT NULL,
    created_by varchar(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by varchar(100),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sessionid varchar(100)
)engine=innodb;

drop table if exists cwUsers;

create table if not exists cwUsers (
    userID integer primary key auto_increment,
    username varchar(100) unique,
    password varchar(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    access_level varchar(10) DEFAULT 'user'

)engine=innodb;