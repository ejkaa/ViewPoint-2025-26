create database viewpoint;

create table users (
    id serial primary key,
    username text unique not null,
    email text unique not null,
    password_hash text not null,
    registered_at timestamp default current_timestamp
);

create table default_lists (
    id serial primary key,
    title text not null
);-- prepis na enum
insert into default_lists values (1,'Watching');
insert into default_lists values (2,'Planning');
insert into default_lists values (3,'Completed');
insert into default_lists values (4,'Rewatching');
insert into default_lists values (5,'Dropped');
insert into default_lists values (6,'Paused');

create table entries (
    id serial primary key,
    user_id int not null references users(id) on delete cascade,
    list_id int not null references default_lists(id) on delete cascade,
    tmdb_id int not null,
    episodes_watched int not null default 0,
    rating int,
    note text,
    added_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    unique (user_id, tmdb_id)
);

CREATE TABLE lists (
    id serial primary key,
    user_id int not null references users(id) on delete cascade,
    title text unique not null,
    description text,
    updated_at timestamp default current_timestamp,
    created_at timestamp default current_timestamp
);

create table list_entries (
    id serial primary key,
    list_id int not null references lists(id) on delete cascade,
    tmdb_id int not null,
    added_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    unique (list_id, tmdb_id)
);