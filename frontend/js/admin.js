
const API_BASE = "https://campus-lost-and-found-portal-1-7prl.onrender.com/api";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

// Check admin login
if (!token || !user || user.role !== "admin") {
    alert("Access denied. Admin login required.");
    window.location.href = "login.html";
}

// Logout
document.getElementById("adminLogoutBtn").addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
});


// Load item statistics and item list
async function loadAdminItems() {
    const container = document.getElementById("adminItemsContainer");

    try {
        const response = await fetch(`${API_BASE}/items`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load items");
        }

        const items = data.items || [];

        // Calculate item statistics
        document.getElementById("totalItems").textContent = items.length;
        document.getElementById("lostItems").textContent =
            items.filter(item => item.type === "lost").length;
        document.getElementById("foundItems").textContent =
            items.filter(item => item.type === "found").length;
        document.getElementById("activeItems").textContent =
            items.filter(item => item.status === "active").length;
        document.getElementById("claimedItems").textContent =
            items.filter(item => item.status === "claimed").length;
        document.getElementById("recoveredItems").textContent =
            items.filter(item => item.status === "recovered").length;

        container.innerHTML = "";

        if (items.length === 0) {
            container.textContent = "No reported items available.";
            return;
        }

        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "item-card";

            const heading = document.createElement("h3");
            heading.textContent = item.itemName;

            const details = document.createElement("p");
            details.textContent =
                `Category: ${item.category} | Type: ${item.type} | Location: ${item.location}`;

            const status = document.createElement("p");
            status.textContent = `Status: ${item.status}`;

            card.append(heading, details, status);
            container.appendChild(card);
        });

    } catch (error) {
        container.textContent = error.message;
    }
}


// Load claim statistics and manage claims
async function loadAdminClaims() {
    const container = document.getElementById("adminClaimsContainer");

    try {
        const response = await fetch(`${API_BASE}/claims`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load claims");
        }

        const claims = data.claims || [];

        // Calculate claim statistics
        document.getElementById("pendingClaims").textContent =
            claims.filter(claim => claim.status === "pending").length;

        document.getElementById("approvedClaims").textContent =
            claims.filter(claim => claim.status === "approved").length;

        document.getElementById("rejectedClaims").textContent =
            claims.filter(claim => claim.status === "rejected").length;

        container.innerHTML = "";

        if (claims.length === 0) {
            container.textContent = "No student claims available.";
            return;
        }

        claims.forEach(claim => {
            const card = document.createElement("div");
            card.className = "item-card";

            const heading = document.createElement("h3");
            heading.textContent = claim.item?.itemName || "Unknown Item";

            const student = document.createElement("p");
            student.textContent =
                `Student: ${claim.claimant?.name || "Unknown"} (${claim.claimant?.email || "No email"})`;

            const message = document.createElement("p");
            message.textContent = `Claim Message: ${claim.message}`;

            const status = document.createElement("p");
            status.textContent = `Claim Status: ${claim.status}`;

            card.append(heading, student, message, status);

            // Only pending claims can be approved or rejected
            if (claim.status === "pending") {
                const approveButton = document.createElement("button");
                approveButton.textContent = "Approve";

                approveButton.addEventListener("click", function () {
                    updateClaimStatus(claim._id, "approved");
                });

                const rejectButton = document.createElement("button");
                rejectButton.textContent = "Reject";

                rejectButton.addEventListener("click", function () {
                    updateClaimStatus(claim._id, "rejected");
                });

                card.append(approveButton, rejectButton);
            }

            container.appendChild(card);
        });

    } catch (error) {
        container.textContent = error.message;
    }
}


// Update claim status
async function updateClaimStatus(claimId, status) {
    const confirmed = confirm(`Are you sure you want to ${status} this claim?`);

    if (!confirmed) return;

    try {
        const response = await fetch(`${API_BASE}/claims/${claimId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to update claim");
        }

        alert(data.message || `Claim ${status} successfully!`);

        // Refresh statistics and claims
        loadAdminClaims();
        loadAdminItems();

    } catch (error) {
        alert(error.message);
    }
}


// Load dashboard data
loadAdminItems();
loadAdminClaims();
