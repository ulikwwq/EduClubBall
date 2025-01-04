// Обработчик формы обратной связи
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (name === '' || email === '' || message === '') {
        alert('Пожалуйста, заполните все поля.');
    } else {
        alert(`Спасибо за ваше сообщение, ${name}! Мы свяжемся с вами по email: ${email}`);
        this.reset(); // Сброс формы
    }
});
