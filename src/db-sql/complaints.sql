create table complaints(
	user_id uuid not null,
	title text not null,
	description text,
	_location text not null,
	status text not null,
	created_time timestamp with time zone not null,
	completed_time timestamp with time zone,
	images bytea[],
	primary key (user_id, created_time),
	foreign key (user_id) references users(user_id)
);