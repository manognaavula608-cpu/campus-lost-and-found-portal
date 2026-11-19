

const API_URL = "https://campus-lost-and-found-portal-1-7prl.onrender.com/api/items";



// STUDENT REGISTRATION
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("message");

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            message.textContent = data.message;

            if (response.ok) {
                message.style.color = "green";
                registerForm.reset();
            } else {
                message.style.color = "red";
            }

        } catch (error) {
            message.textContent = "Cannot connect to server.";
            message.style.color = "red";
        }
    });
}


// STUDENT LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("message");

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            message.textContent = data.message;

            if (response.ok) {
                message.style.color = "green";

                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                if (data.user.role === "admin") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "dashboard.html";
                }
                message.style.color = "red";
            }

        } catch (error) {
            message.textContent = "Cannot connect to server.";
            message.style.color = "red";
        }
    });
}
