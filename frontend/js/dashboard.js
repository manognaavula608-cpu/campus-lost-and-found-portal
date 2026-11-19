const API_BASE = "http://localhost:5000/api";

// Get the saved login details
const token = localStorage.getItem("token");
const savedUser = localStorage.getItem("user");

// If the student is not logged in, open the login page
if (!token || !savedUser) {
    window.location.href = "login.html";
}

// Display the logged-in student's name
if (savedUser) {
    try {
        const user = JSON.parse(savedUser);

        document.getElementById("studentName").textContent =
            user.name || "Student";

    } catch (error) {
        console.log("Unable to read student details");
    }
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
});

// Display all items
async function loadItems() {
    const container = document.getElementById("itemsContainer");
    container.textContent = "Loading items...";

    try {
        
        const keyword = document.getElementById("searchInput").value.trim();
        const category = document.getElementById("categoryFilter").value;
        const type = document.getElementById("typeFilter").value;
        const location = document.getElementById("locationFilter").value.trim();
        const status = document.getElementById("statusFilter").value;
        const date = document.getElementById("dateFilter").value;


        const params = new URLSearchParams();

        if (keyword) params.append("keyword", keyword);
        if (category) params.append("category", category);
        if (type) params.append("type", type);
        if (location) params.append("location", location);
        if (status) params.append("status", status);
        if (date) params.append("date", date); 


        const response = await fetch(`${API_BASE}/items?${params.toString()}`);
        const data = await response.json();

        container.innerHTML = "";

        if (!response.ok) {
            container.textContent = data.message || "Unable to load items.";
            return;
        }

        if (!data.items || data.items.length === 0) {
            container.textContent = "No items found.";
            return;
        }

        data.items.forEach(function (item) {
            const card = document.createElement("div");
            card.className = "item-card";

            // Display uploaded item photo
            if (item.imageUrl) {
                const itemImage = document.createElement("img");

                itemImage.src = `http://localhost:5000${item.imageUrl}`;
                itemImage.alt = item.itemName;
                itemImage.style.width = "150px";
                itemImage.style.height = "120px";
                itemImage.style.objectFit = "cover";
                itemImage.style.borderRadius = "10px";
                itemImage.style.marginBottom = "10px";
 
                card.appendChild(itemImage);
            }

            const name = document.createElement("h3");
            name.textContent = item.itemName;

            const description = document.createElement("p");
            description.textContent = item.description;

            const details = document.createElement("p");
            details.textContent =
                `Category: ${item.category} | Type: ${item.type} | Location: ${item.location}`;

            const status = document.createElement("p");
            status.textContent = `Status: ${item.status}`;

            card.append(name, description, details, status);

            // Smart Item Matching button
            const matchButton = document.createElement("button");
            matchButton.textContent = "Find Possible Matches";

            matchButton.addEventListener("click", async function () {
                matchButton.disabled = true;
                matchButton.textContent = "Searching...";

                try {
                    const response = await fetch(
                        `${API_BASE}/items/${item._id}/matches`
                    );

                    const data = await response.json();

                    const matchContainer = document.createElement("div");
                    matchContainer.className = "match-results";

                    if (!response.ok) {
                        matchContainer.textContent =
                            data.message || "Unable to find matches.";
                    } else if (data.matches.length === 0) {
                        matchContainer.textContent = "No possible matches found.";
                    } else {
                        const heading = document.createElement("h4");
                        heading.textContent = "Possible Matches";
                        matchContainer.appendChild(heading);

                        data.matches.forEach(function (match) {
                            const matchItem = document.createElement("p");

                            matchItem.textContent =
                                `${match.item.itemName} - ${match.matchScore}% match. ` +
                                `Reasons: ${match.reasons.join(", ")}`;

                            matchContainer.appendChild(matchItem);
                        });
                    }

                    // Remove previous results before showing new ones
                    const oldResults = card.querySelector(".match-results");
                    if (oldResults) oldResults.remove();

                    card.appendChild(matchContainer);

                } catch (error) {
                    alert("Cannot connect to the server.");
                } finally {
                    matchButton.disabled = false;
                    matchButton.textContent = "Find Possible Matches";
                }
            });

            card.appendChild(matchButton);


            // Show a claim button only for active found items
            if (item.type === "found" && item.status === "active") {
                const claimButton = document.createElement("button");
                claimButton.textContent = "Claim This Item";

                claimButton.addEventListener("click", function () {
                    const message = prompt("Explain why this item belongs to you:");

                    if (message && message.trim()) {
                        submitClaim(item._id, message.trim());
                    }
                });

                card.appendChild(claimButton);
            }

            container.appendChild(card);
        });

    } catch (error) {
        container.textContent = "Cannot connect to the server.";
    }
}

// Submit a claim for a found item
async function submitClaim(itemId, message) {
    try {
        const response = await fetch(`${API_BASE}/claims`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ itemId, message })
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            loadMyClaims();
        }

    } catch (error) {
        alert("Unable to submit your claim. Please try again.");
    }
}


// Display the student's claims with detailed tracking
async function loadMyClaims() {
    const container = document.getElementById("claimsContainer");
    container.textContent = "Loading your claims...";

    try {
        const response = await fetch(`${API_BASE}/claims/my`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        container.innerHTML = "";

        if (!response.ok) {
            container.textContent =
                data.message || "Unable to load claims.";
            return;
        }

        if (!data.claims || data.claims.length === 0) {
            container.textContent =
                "You have not submitted any claims yet.";
            return;
        }

        data.claims.forEach(function (claim) {
            const card = document.createElement("div");
            card.className = "claim-card";

            const itemName = document.createElement("h3");
            itemName.textContent = claim.item
                ? claim.item.itemName
                : "Item details unavailable";

            // Display item photo
            if (claim.item && claim.item.imageUrl) {
                const image = document.createElement("img");
                image.src = `http://localhost:5000${claim.item.imageUrl}`;
                image.alt = claim.item.itemName;
                image.style.width = "140px";
                image.style.height = "110px";
                image.style.objectFit = "cover";
                image.style.borderRadius = "10px";
                card.appendChild(image);
            }

            const details = document.createElement("p");
            details.textContent = claim.item
                ? `Category: ${claim.item.category} | Location: ${claim.item.location}`
                : "Item details unavailable";

            const message = document.createElement("p");
            message.textContent = `Your message: ${claim.message}`;

            const submittedDate = document.createElement("p");
            submittedDate.textContent =
                `Submitted: ${new Date(claim.createdAt).toLocaleString()}`;

            const status = document.createElement("p");
            status.textContent =
                `Claim Status: ${claim.status.toUpperCase()}`;
                status.className = claim.status;

            const statusMessage = document.createElement("p");

            if (claim.status === "pending") {
                statusMessage.textContent =
                    "Your claim is waiting for admin review.";
            } else if (claim.status === "approved") {
                statusMessage.textContent =
                    "Your claim has been approved!";
            } else {
                statusMessage.textContent =
                    "Your claim was rejected by the admin.";
            }

            card.append(
                itemName,
                details,
                message,
                submittedDate,
                status,
                statusMessage
            );

            // Display admin review details
            if (claim.status !== "pending") {
                const reviewedDate = document.createElement("p");
                reviewedDate.textContent =
                    `Last reviewed: ${new Date(claim.updatedAt).toLocaleString()}`;
                card.appendChild(reviewedDate);

                if (claim.reviewedBy) {
                    const reviewer = document.createElement("p");
                    reviewer.textContent =
                        `Reviewed by: ${claim.reviewedBy.name}`;
                    card.appendChild(reviewer);
                }
            }

            container.appendChild(card);
        });

    } catch (error) {
        container.textContent = "Cannot connect to the server.";
    }
}

// Load notifications for the logged-in student
async function loadNotifications() {
    const container = document.getElementById("notificationsContainer");
    const countElement = document.getElementById("notificationCount");

    if (!container || !countElement) {
        console.error("Notification HTML elements not found.");
        return;
    }

    container.textContent = "Loading notifications...";

    try {
        const response = await fetch(`${API_BASE}/notifications`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            container.textContent =
                data.message || "Unable to load notifications.";
            return;
        }

        container.innerHTML = "";

        const notifications = data.notifications || [];

        const unreadCount = notifications.filter(
            notification => !notification.isRead
        ).length;

        countElement.textContent =
            `Unread notifications: ${unreadCount}`;

        if (notifications.length === 0) {
            container.textContent = "You have no notifications yet.";
            return;
        }

        notifications.forEach(function (notification) {
            const card = document.createElement("div");
            card.className = "notification-card";

            const message = document.createElement("p");
            message.textContent = notification.message;

            const date = document.createElement("small");
            date.textContent = new Date(
                notification.createdAt
            ).toLocaleString();

            const status = document.createElement("p");
            status.textContent = notification.isRead
                ? "Read"
                : "Unread";

            card.append(message, date, status);

            if (!notification.isRead) {
                const readButton = document.createElement("button");
                readButton.textContent = "Mark as Read";

                readButton.addEventListener("click", async function () {
                    await markNotificationAsRead(notification._id);
                });

                card.appendChild(readButton);
            }

            container.appendChild(card);
        });

    } catch (error) {
        container.textContent = "Cannot connect to the server.";
    }
}


// Mark a notification as read
async function markNotificationAsRead(notificationId) {
    try {
        const response = await fetch(
            `${API_BASE}/notifications/${notificationId}/read`,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to update notification.");
            return;
        }

        loadNotifications();

    } catch (error) {
        alert("Cannot connect to the server.");
    }
}

// Search button
document.getElementById("searchBtn").addEventListener("click", loadItems);

// Press Enter in the search box to search
document.getElementById("searchInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        loadItems();
    }
});

// View My Claims button
document.getElementById("myClaimsBtn").addEventListener("click", function () {
    document.getElementById("claimsContainer").scrollIntoView({
        behavior: "smooth"
    });

    loadMyClaims();
});

// Report buttons – we will connect these to the report form in the next step
// Open the report form for a lost item
document.getElementById("lostItemBtn").addEventListener("click", function () {
    window.location.href = "report-item.html?type=lost";
});

// Open the report form for a found item
document.getElementById("foundItemBtn").addEventListener("click", function () {
    window.location.href = "report-item.html?type=found";
});

// Load items and claims when the dashboard opens
loadItems();
loadMyClaims();
loadNotifications();

// Reset all search filters
document.getElementById("resetFiltersBtn").addEventListener("click", function () {
    document.getElementById("searchInput").value = "";
    document.getElementById("categoryFilter").value = "";
    document.getElementById("typeFilter").value = "";
    document.getElementById("locationFilter").value = "";
    document.getElementById("statusFilter").value = "";
    document.getElementById("dateFilter").value = "";

    loadItems();
});