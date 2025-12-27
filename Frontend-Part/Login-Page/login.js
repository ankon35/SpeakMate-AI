
// let signupTimerInterval;
// let forgotTimerInterval;
// let currentSignupOtp = '';
// let currentForgotOtp = '';

// function showPage(pageId) {
//     const container = document.getElementById('mainContainer');
//     const isDesktop = window.innerWidth > 768;

//     if (isDesktop) {
//         container.classList.add('transitioning');

//         setTimeout(() => {
//             document.querySelectorAll('.page').forEach(page => {
//                 page.classList.remove('active');
//             });
//             document.getElementById(pageId).classList.add('active');

//             if (pageId === 'signup' || pageId === 'signupOtp' || pageId === 'signupSuccess') {
//                 container.classList.add('signup-mode');
//             } else {
//                 container.classList.remove('signup-mode');
//             }

//             setTimeout(() => {
//                 container.classList.remove('transitioning');
//             }, 100);
//         }, 400);
//     } else {
//         document.querySelectorAll('.page').forEach(page => {
//             page.classList.remove('active');
//         });
//         document.getElementById(pageId).classList.add('active');
//     }

//     if (signupTimerInterval) clearInterval(signupTimerInterval);
//     if (forgotTimerInterval) clearInterval(forgotTimerInterval);
// }

// function togglePassword(inputId, icon) {
//     const input = document.getElementById(inputId);
//     if (input.type === 'password') {
//         input.type = 'text';
//         icon.classList.remove('fa-eye-slash');
//         icon.classList.add('fa-eye');
//     } else {
//         input.type = 'password';
//         icon.classList.remove('fa-eye');
//         icon.classList.add('fa-eye-slash');
//     }
// }

// function handleLogin(e) {
//     e.preventDefault();
//     const email = document.getElementById('loginEmail').value;
//     const password = document.getElementById('loginPassword').value;

//     if (!validateEmail(email)) {
//         showError('loginEmailError', 'Please enter a valid email address');
//         return;
//     }

//     alert('Login successful!');
//     window.location.href = "/SpeakMate-AI/Frontend-Part/Landing-Page/index.html";

// }

// function handleSignup(e) {
//     e.preventDefault();
//     const name = document.getElementById('signupName').value;
//     const email = document.getElementById('signupEmail').value;
//     const password = document.getElementById('signupPassword').value;
//     const confirmPassword = document.getElementById('signupConfirmPassword').value;

//     clearErrors();

//     if (!validateEmail(email)) {
//         showError('signupEmailError', 'Please enter a valid email address');
//         return;
//     }

//     if (password.length < 8) {
//         showError('signupPasswordError', 'Password must be at least 8 characters');
//         return;
//     }

//     if (password !== confirmPassword) {
//         showError('confirmPasswordError', 'Passwords do not match');
//         return;
//     }

//     currentSignupOtp = generateOtp();
//     console.log('Signup OTP:', currentSignupOtp);
//     document.getElementById('signupEmailDisplay').textContent = email;
//     showPage('signupOtp');
//     startTimer('signup');
// }

// function handleForgotPassword(e) {
//     e.preventDefault();
//     const email = document.getElementById('forgotEmail').value;

//     if (!validateEmail(email)) {
//         showError('forgotEmailError', 'Please enter a valid email address');
//         return;
//     }

//     currentForgotOtp = generateOtp();
//     console.log('Forgot Password OTP:', currentForgotOtp);
//     document.getElementById('forgotEmailDisplay').textContent = email;
//     showPage('forgotOtp');
//     startTimer('forgot');
// }

// function handleResetPassword(e) {
//     e.preventDefault();
//     const newPassword = document.getElementById('newPassword').value;
//     const confirmPassword = document.getElementById('confirmNewPassword').value;

//     if (newPassword.length < 8) {
//         showError('resetPasswordError', 'Password must be at least 8 characters');
//         return;
//     }

//     if (newPassword !== confirmPassword) {
//         showError('resetPasswordError', 'Passwords do not match');
//         return;
//     }

//     showPage('resetSuccess');
// }

// function verifySignupOtp() {
//     const otp = getOtpValue('signupOtp');

//     if (otp.length !== 6) {
//         alert('Please enter the complete 6-digit code');
//         return;
//     }

//     if (otp === currentSignupOtp) {
//         clearInterval(signupTimerInterval);
//         showPage('signupSuccess');
//     } else {
//         alert('Invalid OTP. Please try again.');
//         clearOtpInputs('signupOtp');
//     }
// }

// function verifyForgotOtp() {
//     const otp = getOtpValue('forgotOtp');

//     if (otp.length !== 6) {
//         alert('Please enter the complete 6-digit code');
//         return;
//     }

//     if (otp === currentForgotOtp) {
//         clearInterval(forgotTimerInterval);
//         showPage('resetPassword');
//     } else {
//         alert('Invalid code. Please try again.');
//         clearOtpInputs('forgotOtp');
//     }
// }

// function resendSignupOtp() {
//     currentSignupOtp = generateOtp();
//     console.log('New Signup OTP:', currentSignupOtp);
//     clearOtpInputs('signupOtp');
//     document.getElementById('signupResendBtn').disabled = true;
//     startTimer('signup');
// }

// function resendForgotOtp() {
//     currentForgotOtp = generateOtp();
//     console.log('New Forgot Password OTP:', currentForgotOtp);
//     clearOtpInputs('forgotOtp');
//     document.getElementById('forgotResendBtn').disabled = true;
//     startTimer('forgot');
// }

// function startTimer(type) {
//     let timeLeft = 60;
//     const timerElement = document.getElementById(`${type}TimerCount`);
//     const resendBtn = document.getElementById(`${type}ResendBtn`);
//     const timerDiv = document.getElementById(`${type}Timer`);

//     timerDiv.classList.remove('expired');

//     const interval = setInterval(() => {
//         timeLeft--;
//         timerElement.textContent = timeLeft;

//         if (timeLeft <= 0) {
//             clearInterval(interval);
//             resendBtn.disabled = false;
//             timerDiv.classList.add('expired');
//             timerElement.textContent = '0';
//         }
//     }, 1000);

//     if (type === 'signup') {
//         signupTimerInterval = interval;
//     } else {
//         forgotTimerInterval = interval;
//     }
// }

// function moveToNext(current, index) {
//     const inputs = current.parentElement.querySelectorAll('.otp-input');

//     if (current.value.length === 1 && index < 5) {
//         inputs[index + 1].focus();
//     }

//     const allFilled = Array.from(inputs).every(input => input.value.length === 1);
//     if (allFilled) {
//         const parentPage = current.closest('.page').id;
//         if (parentPage === 'signupOtp') {
//             verifySignupOtp();
//         } else if (parentPage === 'forgotOtp') {
//             verifyForgotOtp();
//         }
//     }
// }

// function getOtpValue(pageId) {
//     const page = document.getElementById(pageId);
//     const inputs = page.querySelectorAll('.otp-input');
//     return Array.from(inputs).map(input => input.value).join('');
// }

// function clearOtpInputs(pageId) {
//     const page = document.getElementById(pageId);
//     const inputs = page.querySelectorAll('.otp-input');
//     inputs.forEach(input => input.value = '');
//     inputs[0].focus();
// }

// function generateOtp() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// }

// function validateEmail(email) {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
// }

// function checkPasswordStrength(password, barId) {
//     const strengthBar = document.getElementById(barId);
//     if (!strengthBar) return;

//     let strength = 0;
//     if (password.length >= 8) strength += 25;
//     if (password.match(/[a-z]+/)) strength += 25;
//     if (password.match(/[A-Z]+/)) strength += 25;
//     if (password.match(/[0-9]+/)) strength += 25;

//     strengthBar.style.width = strength + '%';

//     if (strength < 50) {
//         strengthBar.style.background = '#EF4444';
//     } else if (strength < 75) {
//         strengthBar.style.background = '#F59E0B';
//     } else {
//         strengthBar.style.background = '#10B981';
//     }
// }

// function showError(elementId, message) {
//     const errorElement = document.getElementById(elementId);
//     errorElement.textContent = message;
//     errorElement.classList.add('show');
//     errorElement.previousElementSibling.classList.add('error');
// }

// function clearErrors() {
//     document.querySelectorAll('.error-message').forEach(error => {
//         error.classList.remove('show');
//     });
//     document.querySelectorAll('input').forEach(input => {
//         input.classList.remove('error');
//     });
// }

// document.addEventListener('DOMContentLoaded', () => {
//     const observer = new MutationObserver((mutations) => {
//         mutations.forEach((mutation) => {
//             if (mutation.target.classList.contains('active')) {
//                 const firstOtpInput = mutation.target.querySelector('.otp-input');
//                 if (firstOtpInput) {
//                     setTimeout(() => firstOtpInput.focus(), 100);
//                 }
//             }
//         });
//     });

//     document.querySelectorAll('.page').forEach(page => {
//         observer.observe(page, { attributes: true, attributeFilter: ['class'] });
//     });
// });

// document.addEventListener('keydown', (e) => {
//     if (e.target.classList.contains('otp-input') && e.key === 'Backspace') {
//         const inputs = e.target.parentElement.querySelectorAll('.otp-input');
//         const currentIndex = Array.from(inputs).indexOf(e.target);

//         if (e.target.value === '' && currentIndex > 0) {
//             inputs[currentIndex - 1].focus();
//             inputs[currentIndex - 1].value = '';
//         }
//     }
// });

// document.addEventListener('input', (e) => {
//     if (e.target.classList.contains('otp-input')) {
//         e.target.value = e.target.value.replace(/[^0-9]/g, '');
//     }
// });






let signupTimerInterval;
let forgotTimerInterval;
let currentSignupOtp = '';
let currentForgotOtp = '';

// Show Page Logic (keeping the transition style intact)
function showPage(pageId) {
    const container = document.getElementById('mainContainer');
    const isDesktop = window.innerWidth > 768;

    // Handle transition only when the page is changing
    if (isDesktop) {
        container.classList.add('transitioning');

        setTimeout(() => {
            // Remove active class from all pages and add to the target page
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(pageId).classList.add('active');

            // Manage signup-mode class based on the current page
            if (pageId === 'signup' || pageId === 'signupOtp' || pageId === 'signupSuccess') {
                container.classList.add('signup-mode');
            } else {
                container.classList.remove('signup-mode');
            }

            // Remove the transitioning class after transition duration
            setTimeout(() => {
                container.classList.remove('transitioning');
            }, 100);
        }, 400);
    } else {
        // For smaller screens, directly switch pages without transition
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }

    // Clear the timers if any are running
    if (signupTimerInterval) clearInterval(signupTimerInterval);
    if (forgotTimerInterval) clearInterval(forgotTimerInterval);
}

// Toggle Password Visibility
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!validateEmail(email)) {
        showError('loginEmailError', 'Please enter a valid email address');
        return;
    }

    alert('Login successful!');
    window.location.href = "/Frontend-Part/Landing-Page/index.html";
}

// Handle Signup
function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    clearErrors();

    if (!validateEmail(email)) {
        showError('signupEmailError', 'Please enter a valid email address');
        return;
    }

    if (password.length < 8) {
        showError('signupPasswordError', 'Password must be at least 8 characters');
        return;
    }

    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        return;
    }

    currentSignupOtp = generateOtp();
    console.log('Signup OTP:', currentSignupOtp);

    // Generate a unique token for the signup page
    const token = generateUniqueToken();

    // Redirect to the login-signup page with the token and mode as query parameters
    const signupUrl = `/SpeakMate-AI/Frontend-Part/Login-Signup-Page/login-signup.html?mode=signup&token=${token}`;
    window.location.href = signupUrl;

    document.getElementById('signupEmailDisplay').textContent = email;
    showPage('signupOtp');
    startTimer('signup');
}

// Generate Unique Token (for Signup URL)
function generateUniqueToken() {
    return 'signup-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Handle Forgot Password
function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;

    if (!validateEmail(email)) {
        showError('forgotEmailError', 'Please enter a valid email address');
        return;
    }

    currentForgotOtp = generateOtp();
    console.log('Forgot Password OTP:', currentForgotOtp);
    document.getElementById('forgotEmailDisplay').textContent = email;
    showPage('forgotOtp');
    startTimer('forgot');
}

// Handle Reset Password
function handleResetPassword(e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword.length < 8) {
        showError('resetPasswordError', 'Password must be at least 8 characters');
        return;
    }

    if (newPassword !== confirmPassword) {
        showError('resetPasswordError', 'Passwords do not match');
        return;
    }

    showPage('resetSuccess');
}

// Verify Signup OTP
function verifySignupOtp() {
    const otp = getOtpValue('signupOtp');

    if (otp.length !== 6) {
        alert('Please enter the complete 6-digit code');
        return;
    }

    if (otp === currentSignupOtp) {
        clearInterval(signupTimerInterval);
        showPage('signupSuccess');
    } else {
        alert('Invalid OTP. Please try again.');
        clearOtpInputs('signupOtp');
    }
}

// Verify Forgot OTP
function verifyForgotOtp() {
    const otp = getOtpValue('forgotOtp');

    if (otp.length !== 6) {
        alert('Please enter the complete 6-digit code');
        return;
    }

    if (otp === currentForgotOtp) {
        clearInterval(forgotTimerInterval);
        showPage('resetPassword');
    } else {
        alert('Invalid code. Please try again.');
        clearOtpInputs('forgotOtp');
    }
}

// Resend Signup OTP
function resendSignupOtp() {
    currentSignupOtp = generateOtp();
    console.log('New Signup OTP:', currentSignupOtp);
    clearOtpInputs('signupOtp');
    document.getElementById('signupResendBtn').disabled = true;
    startTimer('signup');
}

// Resend Forgot OTP
function resendForgotOtp() {
    currentForgotOtp = generateOtp();
    console.log('New Forgot Password OTP:', currentForgotOtp);
    clearOtpInputs('forgotOtp');
    document.getElementById('forgotResendBtn').disabled = true;
    startTimer('forgot');
}

// Start Timer
function startTimer(type) {
    let timeLeft = 60;
    const timerElement = document.getElementById(`${type}TimerCount`);
    const resendBtn = document.getElementById(`${type}ResendBtn`);
    const timerDiv = document.getElementById(`${type}Timer`);

    timerDiv.classList.remove('expired');

    const interval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(interval);
            resendBtn.disabled = false;
            timerDiv.classList.add('expired');
            timerElement.textContent = '0';
        }
    }, 1000);

    if (type === 'signup') {
        signupTimerInterval = interval;
    } else {
        forgotTimerInterval = interval;
    }
}

// Move to Next OTP Input
function moveToNext(current, index) {
    const inputs = current.parentElement.querySelectorAll('.otp-input');

    if (current.value.length === 1 && index < 5) {
        inputs[index + 1].focus();
    }

    const allFilled = Array.from(inputs).every(input => input.value.length === 1);
    if (allFilled) {
        const parentPage = current.closest('.page').id;
        if (parentPage === 'signupOtp') {
            verifySignupOtp();
        } else if (parentPage === 'forgotOtp') {
            verifyForgotOtp();
        }
    }
}

// Get OTP Value
function getOtpValue(pageId) {
    const page = document.getElementById(pageId);
    const inputs = page.querySelectorAll('.otp-input');
    return Array.from(inputs).map(input => input.value).join('');
}

// Clear OTP Inputs
function clearOtpInputs(pageId) {
    const page = document.getElementById(pageId);
    const inputs = page.querySelectorAll('.otp-input');
    inputs.forEach(input => input.value = '');
    inputs[0].focus();
}

// Generate OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate Email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Show Error Message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
    errorElement.previousElementSibling.classList.add('error');
}

// Clear Error Messages
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.classList.remove('show');
    });
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('error');
    });
}

// Handle Token from URL (on Signup page)
function getSignupTokenFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
}

// On DOM Ready (Handle Token and Mode)
document.addEventListener('DOMContentLoaded', () => {
    const token = getSignupTokenFromUrl();
    if (token) {
        console.log('Signup Token:', token); // You can use this token as needed
    }

    // Handle 'mode' URL parameter for deciding login/signup
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');

    if (mode === 'signup') {
        showPage('signup');  // Show signup page
    } else {
        showPage('login');   // Default to login page if mode is not signup
    }
});

// Backspace Handling (OTP)
document.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('otp-input') && e.key === 'Backspace') {
        const inputs = e.target.parentElement.querySelectorAll('.otp-input');
        const currentIndex = Array.from(inputs).indexOf(e.target);

        if (e.target.value === '' && currentIndex > 0) {
            inputs[currentIndex - 1].focus();
            inputs[currentIndex - 1].value = '';
        }
    }
});

// Input Validation (OTP)
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('otp-input')) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    }
});
