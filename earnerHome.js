document.addEventListener("DOMContentLoaded", async () => {

    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js";

    async function getSessionID() {
        const xmlBody = `
        <xmlrequest>
            <operation>CS</operation>
            <authenticationKey>5HGdHz60U31Bj0bKVhkv</authenticationKey>
        </xmlrequest>`;

        const response = await fetch("https://badge-connect-issuer-backend.onrender.com/api/badgecert", {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: xmlBody
        });

        const text = await response.text();
        const match = text.match(/<ResponseCode>(.*?)<\/ResponseCode>/);

        if (!match) throw new Error("Failed to fetch session ID");

        return match[1]; // ResponseCode IS the sessionID
    }

    async function getBadges(sessionID) {
        const xmlBody = `
        <xmlrequest>
            <operation>QEI</operation>
            <sessionID>${sessionID}</sessionID>
            <earneremail>ramrajpanwar9603@gmail.com</earneremail>
        </xmlrequest>`;

        const response = await fetch("https://badge-connect-issuer-backend.onrender.com/api/badgecert", {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: xmlBody
        });


        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        console.log(xmlDoc);

        // The repeated nodes you want:
        const nodes = xmlDoc.getElementsByTagName("issuedbadgecert");

        const badges = [...nodes].map(b => ({
            issuanceId: b.querySelector("issuanceid")?.textContent || "",
            badgeId: b.querySelector("badgeid")?.textContent || "",
            name: b.querySelector("badgename")?.textContent || "",
            image: b.querySelector("badgeartifact1")?.textContent || "",
            issuedDate: b.querySelector("issuedate")?.textContent || "",
            certificatePdf: b.querySelector("certificatepdf")?.textContent || ""
        }));

        return badges;
    }


    function renderBadges(badges) {
        const container = document.getElementById("badgeList");
        container.innerHTML = "";

        badges.forEach(badge => {
            const div = document.createElement("div");
            div.classList.add("badge-row");

            div.innerHTML = `
            <input type="checkbox" class="cert-checkbox" data-id="${badge.issuanceId}">

            <div class="badge-img-box">
                <canvas class="badge-preview" data-pdf="${badge.certificatePdf}"></canvas>
            </div>  

            <div class="badge-info">
                <span class="badge-title">${badge.name}</span>
                <span class="badge-meta">Badge ID: ${badge.badgeId}</span>
                <span class="badge-meta">Issuance ID: ${badge.issuanceId}</span>
            </div>

            <a class="pay-link" data-id="${badge.issuanceId}">Pay</a>
        `;

            container.appendChild(div);
        });
    }

    function renderPdfThumbnails() {
        const canvases = document.querySelectorAll(".badge-preview");

        canvases.forEach(canvas => {
            const pdfUrl = canvas.dataset.pdf;
            const loadingTask = pdfjsLib.getDocument(pdfUrl);

            loadingTask.promise.then(pdf => {
                pdf.getPage(1).then(page => {
                    const viewport = page.getViewport({ scale: 0.5 });
                    const context = canvas.getContext("2d");
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    page.render({ canvasContext: context, viewport: viewport });
                });
            }).catch(err => {
                console.error("PDF render failed:", err);
            });
        });
    }




    function setupBulkPaymentHandler() {
        document.getElementById("paySelectedBtn").onclick = () => {
            const selected = [...document.querySelectorAll(".cert-checkbox:checked")]
                .map(cb => cb.dataset.issuanceid);

            if (selected.length === 0) {
                alert("Select at least one badge to pay.");
                return;
            }

            console.log("Send these issuanceIds to your payment API:", selected);
        };
    }


    async function init() {
        const sessionID = await getSessionID();
        const badges = await getBadges(sessionID);


        console.log("Fetched badges:", badges);

        // Save to localStorage
        localStorage.setItem("earner_badges", JSON.stringify(badges));
        renderBadges(badges);
        renderPdfThumbnails();
        setupBulkPaymentHandler()
    }

    init();

});
