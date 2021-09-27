CREATE TABLE feedback
(
    user_id uuid NOT NULL,
    feedback_id serial primary key,
    created_time timestamp with time zone not null,
    feedback text NOT NULL,
    feedback_type text NOT NULL,
	foreign key (user_id) references users(user_id),
);