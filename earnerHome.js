document.addEventListener("DOMContentLoaded", async () => {

    const BACKEND_URL = "https://badge-connect-issuer-backend.onrender.com";

    async function getSessionID() {
        const xmlBody = `
        <xmlrequest>
            <operation>CS</operation>
            <authenticationKey>5HGdHz60U31Bj0bKVhkv</authenticationKey>
        </xmlrequest>`;

        const response = await fetch(`${BACKEND_URL}/api/badgecert`, {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: xmlBody
        });

        const text = await response.text();
        const match = text.match(/<ResponseCode>(.*?)<\/ResponseCode>/);
        if (!match) throw new Error("Failed to fetch session ID");
        return match[1];
    }

    async function getBadges(sessionID) {
        const xmlBody = `
        <xmlrequest>
            <operation>QEI</operation>
            <sessionID>${sessionID}</sessionID>
            <earneremail>ramrajpanwar9603@gmail.com</earneremail>
        </xmlrequest>`;

        const response = await fetch(`${BACKEND_URL}/api/badgecert`, {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: xmlBody
        });

        const xmlText = await response.text();
        const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");
        const nodes = xmlDoc.getElementsByTagName("issuedbadgecert");

        return [...nodes].map(b => {
            const badgeId = b.querySelector("badgeid")?.textContent || "";
            return {
                issuanceId: b.querySelector("issuanceid")?.textContent || "",
                badgeId,
                name: b.querySelector("badgename")?.textContent || "",
                issuedDate: b.querySelector("issuedate")?.textContent || "",
                image: `${BACKEND_URL}/api/badge-image/${badgeId}`
            };
        });
    }
    function renderBadges(badges) {
        const container = document.getElementById("badgeList");
        container.innerHTML = "";

        badges.forEach(badge => {
            const row = document.createElement("div");
            row.className = "badge-row";

            const imgUrl = `${BACKEND_URL}/api/badge-image/${badge.badgeId}`;

            row.innerHTML = `
            <input type="checkbox" class="cert-checkbox" data-id="${badge.issuanceId}">
            
            <div class="badge-img-box">
                <img src="${imgUrl}" alt="${badge.name}" class="badge-img">
            </div>

            <div class="badge-info">
                <span class="badge-title">${badge.name}</span>
                <span class="badge-meta">Badge ID: ${badge.badgeId}</span>
                <span class="badge-meta">Issuance ID: ${badge.issuanceId}</span>
            </div>

            <a class="pay-link" data-id="${badge.issuanceId}">Pay</a>
        `;

            container.appendChild(row);

            // ✅ Log when image loads
            const img = row.querySelector(".badge-img");
            img.onload = () => console.log("✅ Badge Image Loaded:", imgUrl);
            img.onerror = () => console.error("❌ Badge Image Failed:", imgUrl);
        });
    }


    function setupBulkPaymentHandler() {
        document.getElementById("paySelectedBtn").onclick = () => {
            const selected = [...document.querySelectorAll(".cert-checkbox:checked")].map(cb => cb.dataset.id);

            if (selected.length === 0) return alert("Select at least one badge to pay.");

            console.log("Selected for payment:", selected);
            // Redirect to payment screen here
        };
    }

    async function init() {
        const sessionID = await getSessionID();
        const badges = await getBadges(sessionID);

        localStorage.setItem("earner_badges", JSON.stringify(badges));
        renderBadges(badges);
        setupBulkPaymentHandler();
    }

    init();
});
