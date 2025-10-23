const loginForm = document.getElementById("loginForm");
const otpForm = document.getElementById("otpForm");
const profileIdField = document.getElementById("profileId");
const emailField = document.getElementById("email");
const verifyProfileId = document.getElementById("verifyProfileId");
const verifyEmail = document.getElementById("verifyEmail");
const formSubtitle = document.getElementById("form-subtitle");
const formDesc = document.getElementById("form-desc");
const resendLink = document.getElementById("resendLink");
const timerText = document.getElementById("timer");
const otpInputs = document.querySelectorAll(".otp-input");

let timer;
let countdown = 60;

// ✅ Handle Send OTP
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const profileId = profileIdField.value.trim();
        const email = emailField.value.trim();

        if (!profileId) return alert("Please enter your profile ID!");
        if (!email) return alert("Please enter your email or phone!");

        loginForm.classList.add("d-none");
        otpForm.classList.remove("d-none");

        if (verifyProfileId) verifyProfileId.value = profileId;
        if (verifyEmail) verifyEmail.value = email;

        if (formSubtitle) formSubtitle.textContent = "Please verify your login details";
        if (formDesc) formDesc.textContent = "";

        startTimer();

        if (otpInputs && otpInputs.length) otpInputs[0].focus();
    });
}

// ✅ OTP Input Auto-Navigation
if (otpInputs && otpInputs.length) {
    otpInputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            input.value = input.value.replace(/[^0-9]/g, "");
            if (input.value && index < otpInputs.length - 1) otpInputs[index + 1].focus();
        });

        input.addEventListener("keydown", (event) => {
            if (event.key === "Backspace" && !input.value && index > 0) otpInputs[index - 1].focus();
            else if (event.key === "ArrowLeft" && index > 0) otpInputs[index - 1].focus();
            else if (event.key === "ArrowRight" && index < otpInputs.length - 1) otpInputs[index + 1].focus();
        });
    });
}

// ✅ Timer Handling
function startTimer() {
    clearInterval(timer);
    countdown = 60;
    resendLink.style.pointerEvents = "none";
    resendLink.style.opacity = "0.6";
    timerText.textContent = `00:60`;

    timer = setInterval(() => {
        countdown--;
        const seconds = countdown < 10 ? "0" + countdown : countdown;
        timerText.textContent = `00:${seconds}`;

        if (countdown <= 0) {
            clearInterval(timer);
            resendLink.style.pointerEvents = "auto";
            resendLink.style.opacity = "1";
            timerText.textContent = "00:00";
        }
    }, 1000);
}

// ✅ Resend OTP Click (safe)
if (resendLink) {
    resendLink.addEventListener("click", () => {
        if (resendLink.style.pointerEvents === "auto") {
            alert("A new OTP has been sent!");
            startTimer();
        }
    });
}


// ✅ OTP Validation
otpForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let enteredOTP = "";
    otpInputs.forEach(input => enteredOTP += input.value);

    if (enteredOTP.length < 6) {
        alert("Please enter all 6 digits of the OTP.");
        return;
    }

    if (enteredOTP === "123456") {
        window.location.href = "earnerHome.html";
    } else {
        alert("Invalid OTP. Please try again.");
        otpInputs.forEach(inp => inp.value = "");
        otpInputs[0].focus();
    }
});
