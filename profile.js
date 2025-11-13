document.addEventListener("DOMContentLoaded", function () {
    const modal = new bootstrap.Modal(document.getElementById('alternateEmailModal'));

    const openBtn = document.getElementById("openAlternateModal");
    const input = document.getElementById("alternateEmailInput");
    const addBtn = document.getElementById("addAlternateEmailBtn");
    const container = document.getElementById("alternateEmailSection");

    // Load saved email
    const saved = localStorage.getItem("alternateEmail");
    if (saved) {
        container.innerHTML = `<span class="text-muted">${saved}</span>`;
    }

    // Open modal
    if (openBtn) {
        openBtn.addEventListener("click", (e) => {
            e.preventDefault();
            modal.show();
        });
    }

    // Add alternate email
    addBtn.addEventListener("click", () => {
        const email = input.value.trim();

        if (!email || !validateEmail(email)) {
            alert("Please enter a valid email.");
            return;
        }

        // Save
        localStorage.setItem("alternateEmail", email);

        // Replace UI (remove click-to-add)
        container.innerHTML = `<span class="text-muted">${email}</span>`;

        input.value = "";
        modal.hide();
    });

    // Email validation
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    const avatar = document.getElementById("profileAvatar");
    const avatarInput = document.getElementById("avatarInput");
    const editIcon = document.getElementById("editAvatarIcon");

    // ✅ When clicking avatar or camera icon, open file picker
    avatar.addEventListener("click", () => avatarInput.click());
    editIcon.addEventListener("click", () => avatarInput.click());

    // ✅ Show preview instantly + store locally
    avatarInput.addEventListener("change", () => {
        const file = avatarInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            avatar.src = reader.result;
            localStorage.setItem("earnerAvatar", reader.result);
        };
        reader.readAsDataURL(file);
    });

    // ✅ Load saved avatar if exists
    const savedAvatar = localStorage.getItem("earnerAvatar");
    if (savedAvatar) avatar.src = savedAvatar;






});