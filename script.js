//coonfiguration
const CONFIG = { displayTime: 60000, loadingTime: 1500, maxRetries: 3};
const state = { retryCount: 0};

//Form Submission handler
document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    try{
        const formData = validateFormData({
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            message: document.getElementById('message').value.trim()
        });
    }
    catch (error){
        handleError(error);
    }
});

//Core Functions
function validateFormData(data){
    const errors = [];
    if (!data.name) errors.push('Name is required!');
    if (!data.email) errors.push('Email is required!');
    if (!data.message) errors.push('Message is required!');
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Invalid Email!');
    if (errors.length) throw new Errors(errors.join(','));

    return data;
}

async function getRecaptchaResponse(){
    const response = grecaptcha.getResponse();
    if (!response) throw new Error('Please complete this reCaptcha verification.');
   
    return response;
}

async function processFormSubmission(formData,recaptchaResponse) {
    showMessage('Verifying reCaptcha and submitting your response...', 'info');
    try{
        await new Promise(resolve => setTimeout(resolve,CONFIG.loadingTime));
        const info = await extractRecaptchaInfo(recaptchaResponse);
        displaySuccessMessage(info);
        resetForm();
    }
    catch(error){
        throw new Error('Form submission failed: ${error.message}');
    }
}

async function extractRecaptchaInfo(response) {
    const timestamp = new Date();
    return {
       timestamp: timestamp.toLocaleTimeString(),
       date: timestamp.toLocaleDateString(),
       browserInfo: timestamp.getBrowserInfo(),
       deviceInfo: timestamp.getDeviceInfo()
    };
}

//Helper Function
function getBrowserInfo(){
    const ua = navigator.userAgent;
    const browser = {
        chrome: /Chrome\/([0-9.]+)/,
        firefox: /Firefox\/([0-9.]+)/,
        safari: /Version\/([0-9.]+).*Safari/,
        edge: /Edg\/([0-9.]+)/,
        ie: /MSIE ([0-9.]+)/    
    };

    for (const [name, regex] of Object.entries(browser)){
        const match = ua.match(regex);
        if (match) return { 
            name: name.charAt(0).toUpperCase() + name.slice(1), version: match[1]
        };
    }
    return { name: 'Unknow'}

} 

function getDeviceInfo(){
    return {
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        platform: navigator.platform,
        language: navigator.language
    };
}

function displaySuccessMessage(info){
    const successMessage = `
        <div class = "recaptcha-details">
            <h3>reCAPTCHA Verification Details</h3>
            <div class = "info-grid">
                <div class = "info-icon">🌐</div>
                <div class ="info-content>
                    <h4>Browser Information</h4>
                    <p>${info.browserInfo.name} ${info.browserInfo.version} </p>
                    <p>Platform: ${info.deviceInfo.platform}</p>
                    <p>Languange: ${info.deviceInfo.language}</p>
                </div>
            </div>
            <div class = "info-card">
                <div class = "info-icon">📱</div>
                <div class = "info-content">
                    <h4>Device Details</h4>
                    <p>Screen: ${info.deviceInfo.screenSize}</p>
                    <p>Time: ${info.timestamp}</p>
                    <p>Date: ${info.date}</p>
                </div>
            </div>
        </div>
        `;
        showMessage(successMessage, 'success');
}