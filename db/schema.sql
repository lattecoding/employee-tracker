DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

\c employees_db;

CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL,
    manager_id INTEGER,
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL
);

-- Reset sequences to avoid duplicate key errors
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'employee_id_seq') THEN
        -- Set the sequence to the max id in the employee table
        PERFORM setval('employee_id_seq', COALESCE((SELECT MAX(id) FROM employee), 0) + 1, false);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'role_id_seq') THEN
        -- Set the sequence to the max id in the role table
        PERFORM setval('role_id_seq', COALESCE((SELECT MAX(id) FROM role), 0) + 1, false);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'department_id_seq') THEN
        -- Set the sequence to the max id in the department table
        PERFORM setval('department_id_seq', COALESCE((SELECT MAX(id) FROM department), 0) + 1, false);
    END IF;
END $$;
