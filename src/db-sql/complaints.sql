create table complaints(
	user_id uuid not null,
	complaint_id serial primary key,
	description text not null,
	_location text not null,
	waste_type text,
	zone text,
	status text not null,
	created_time timestamp with time zone not null,
	registered_time timestamp with time zone,
    work_started_time timestamp with time zone,
	completed_time timestamp with time zone,
	images text[],
	foreign key (user_id) references users(user_id),
	feedback_rating int check(feedback_rating between 1 and 5),
	feedback_remark text,
	admin_remark text
);