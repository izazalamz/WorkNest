
CREATE TABLE Employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    company_name VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL,
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE  -- Indicates if employee is currently checked in
);


CREATE TABLE Attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    check_in_time TIMESTAMP NOT NULL,
    check_out_time TIMESTAMP NULL,
    date DATE NOT NULL,
    office_status ENUM('Office', 'Remote') NOT NULL,
    total_active_time DECIMAL(5,2) DEFAULT 0.00,  -- Calculated as (check_out_time - check_in_time) in hours
    total_office_time DECIMAL(5,2) DEFAULT 0.00,  -- Calculated as total_active_time if office_status = 'Office', else 0
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employee_date (employee_id, date)  -- Ensure one record per employee per day
);

CREATE INDEX idx_employee_id ON Attendance(employee_id);
CREATE INDEX idx_date ON Attendance(date);
CREATE INDEX idx_office_status ON Attendance(office_status);
