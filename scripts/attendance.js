document.addEventListener('DOMContentLoaded', () => {
    const groupList = document.getElementById('group-list');
    const studentList = document.getElementById('student-list');
    const attendanceForm = document.getElementById('attendance-form');

    // Загрузка списка учеников при выборе группы
    groupList.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.dataset.groupId) {
            const groupId = e.target.dataset.groupId;

            // Загружаем список учеников через API
            fetch(`/api/students?groupId=${groupId}`)
                .then((response) => response.json())
                .then((data) => {
                    const tbody = studentList.querySelector('tbody');
                    tbody.innerHTML = ''; // Очищаем старый список
                    
                    data.forEach((student) => {
                        const row = `
                            <tr>
                                <td>${student.name}</td>
                                <td>${student.attendance}/${student.totalSessions}</td>
                                <td><input type="radio" name="student-${student.id}" value="present" required></td>
                                <td><input type="radio" name="student-${student.id}" value="absent"></td>
                            </tr>
                        `;
                        tbody.insertAdjacentHTML('beforeend', row);
                    });

                    studentList.style.display = 'block';
                })
                .catch((err) => console.error('Ошибка загрузки данных:', err));
        }
    });

    // Отправка данных
    attendanceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(attendanceForm);
        const data = {};

        formData.forEach((value, key) => {
            const [_, studentId] = key.split('-');
            if (!data[studentId]) data[studentId] = {};
            data[studentId] = value;
        });

        fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((result) => {
                alert('Посещаемость успешно сохранена!');
            })
            .catch((err) => console.error('Ошибка сохранения:', err));
    });
});
