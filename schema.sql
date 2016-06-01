create database if not exists crosswordsdb;

use crosswordsdb;

--drop table if exists cwUsers;

create table if not exists cwUsers (
    userid integer primary key auto_increment unique,
    username varchar(50) unique,
    password varchar(50),
    created_at DATETIME NOT NULL,
    access_level varchar(10) DEFAULT 'user',
    updated_at DATETIME NOT NULL

)engine=innodb;

--drop table if exists cwWords;

create table if not exists cwWords(
    entryid integer primary key auto_increment unique,
    question varchar(50) NOT NULL,
    answer varchar(50) NOT NULL,
    created_by varchar(50),
    created_at DATETIME NOT NULL,
    updated_by varchar(50),
    updated_at DATETIME NOT NULL,
    sessionid varchar(50),
    is_approved tinyint(1) DEFAULT NULL
)engine=innodb;

--drop table if exists cwApprovedWords;

create table if not exists cwApprovedWords(
    entryid integer primary key unique,
    question varchar(50) NOT NULL,
    answer varchar(50) NOT NULL,
    created_by varchar(50),
    created_at DATETIME NOT NULL,
    updated_by varchar(50),
    updated_at DATETIME NOT NULL,
    approved_by varchar(50) NOT NULL
)engine=innodb;
