CREATE TABLE feedback
(
    feedback_id serial primary key,
    created_time timestamp with time zone not null,
    feedback text NOT NULL,
    feedback_type text NOT NULL
);