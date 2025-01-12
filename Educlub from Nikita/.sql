-- Таблица для групп
CREATE TABLE groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  trainer_id INT NOT NULL, -- id тренера
  FOREIGN KEY (trainer_id) REFERENCES users(id) -- ссылка на тренера
);

-- Таблица для учеников
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  group_id INT NOT NULL,
  FOREIGN KEY (group_id) REFERENCES groups(id) -- ссылка на группу
);

-- Таблица для посещаемости
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  group_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent') NOT NULL, -- статус посещаемости
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (group_id) REFERENCES groups(id)
);

-- Таблица для оплаты
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL, -- сумма оплаты
  date DATE NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id)
);
CREATE TABLE parents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL, -- номер WhatsApp
  FOREIGN KEY (student_id) REFERENCES students(id)
);
ALTER TABLE students
ADD COLUMN payment_type ENUM('monthly', 'hourly') DEFAULT 'monthly';
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type ENUM('monthly', 'hourly') DEFAULT 'monthly',
  hours_worked INT DEFAULT 0,
  month_year VARCHAR(7),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);
