// Форма регистрации
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
  
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.redirectTo) {
        window.location.href = data.redirectTo;
      } else {
        alert(data.message);
      }
    })
    .catch(err => console.error('Ошибка:', err));
  });
  
  // Форма логина
  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.redirectTo) {
        window.location.href = data.redirectTo;
      } else {
        alert(data.message);
      }
    })
    .catch(err => console.error('Ошибка:', err));
  });
  