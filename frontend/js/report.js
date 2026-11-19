
const API_URL = "https://campus-lost-and-found-portal-1-7prl.onrender.com/api/items";

const params = new URLSearchParams(window.location.search);
const reportType = params.get("type");
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

if (reportType !== "lost" && reportType !== "found") {
    window.location.href = "dashboard.html";
}

const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");

if (reportType === "lost") {
    formTitle.textContent = "Report a Lost Item";
    submitBtn.textContent = "Submit Lost Item";
} else {
    formTitle.textContent = "Report a Found Item";
    submitBtn.textContent = "Submit Found Item";
}

const reportForm = document.getElementById("reportForm");

reportForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = document.getElementById("reportMessage");
    const imageInput = document.getElementById("image");
    const selectedImage = imageInput.files[0];

    if (selectedImage && !selectedImage.type.startsWith("image/")) {
        message.textContent = "Please select a valid image.";
        message.style.color = "red";
        return;
    }

    if (selectedImage && selectedImage.size > 5 * 1024 * 1024) {
        message.textContent = "Image size must be less than 5 MB.";
        message.style.color = "red";
        return;
    }

    const formData = new FormData();

    formData.append("itemName", document.getElementById("itemName").value.trim());
    formData.append("category", document.getElementById("category").value);
    formData.append("description", document.getElementById("description").value.trim());
    formData.append("location", document.getElementById("location").value.trim());
    formData.append("date", document.getElementById("date").value);
    formData.append("type", reportType);

    if (selectedImage) {
        formData.append("image", selectedImage);
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            message.textContent = "Item reported successfully!";
            message.style.color = "green";

            reportForm.reset();

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 1500);
        } else {
            message.textContent = data.message || "Unable to submit report.";
            message.style.color = "red";
        }
    } catch (error) {
        message.textContent = "Cannot connect to the server.";
        message.style.color = "red";
    } finally {
        submitBtn.disabled = false;

        submitBtn.textContent = reportType === "lost"
            ? "Submit Lost Item"
            : "Submit Found Item";
    }
});
