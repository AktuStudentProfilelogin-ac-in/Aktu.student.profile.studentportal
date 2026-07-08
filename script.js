document.addEventListener("DOMContentLoaded", function() {
    const menuTrigger = document.getElementById('menu-trigger');
    const dropdownMenu = document.getElementById('dropdown-menu');

    // मोबाइल और डेस्कटॉप दोनों के लिए मेनू ओपनर लॉजिक
    function handleMenuToggle(event) {
        event.preventDefault();
        event.stopPropagation();
        dropdownMenu.classList.toggle('show-menu');
    }

    if (menuTrigger) {
        menuTrigger.addEventListener('click', handleMenuToggle);
        menuTrigger.addEventListener('touchstart', handleMenuToggle);
    }

    // स्क्रीन के बाहर कहीं भी टैप करने पर ड्रॉपडाउन बंद करें
    document.addEventListener('click', function(event) {
        if (dropdownMenu && !dropdownMenu.contains(event.target) && event.target !== menuTrigger) {
            dropdownMenu.classList.remove('show-menu');
        }
    });

    // नेविगेशन / स्क्रीन स्विचिंग
    function navigateTo(panel) {
        document.getElementById('front-page').style.display = 'none';
        document.getElementById('login-card').style.display = 'block';
        
        if(panel === 'admin') {
            document.getElementById('username').value = 'Admin';
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        } else {
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('username').focus();
        }
    }

    // बटनों पर डायरेक्ट लिसनर बाइंडिंग (बिना किसी मिस के काम करेगा)
    document.getElementById('opt-student').addEventListener('click', () => navigateTo('student'));
    document.getElementById('opt-student').addEventListener('touchstart', () => navigateTo('student'));
    
    document.getElementById('opt-admin').addEventListener('click', () => navigateTo('admin'));
    document.getElementById('opt-admin').addEventListener('touchstart', () => navigateTo('admin'));

    // डिफ़ॉल्ट डेटा और एडमिन इमेजेस लोडिंग
    try {
        const savedName = localStorage.getItem('siteName') || "AKTU ERP Portal";
        const savedLogo = localStorage.getItem('siteLogo');
        const savedFrontBg = localStorage.getItem('frontPageBg') || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000";
        const savedGlobalBg = localStorage.getItem('globalPageBg') || "linear-gradient(rgba(210, 225, 235, 0.85), rgba(210, 225, 235, 0.85)), url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000')";

        document.getElementById('front-page').style.backgroundImage = `url('${savedFrontBg}')`;
        document.body.style.backgroundImage = savedGlobalBg.includes('linear-gradient') ? savedGlobalBg : `linear-gradient(rgba(210, 225, 235, 0.85), rgba(210, 225, 235, 0.85)), url('${savedGlobalBg}')`;

        document.getElementById('portal-name-view').innerText = savedName;
        document.getElementById('site-title-tag').innerText = savedName;
        document.getElementById('input-site-name').value = savedName;
        if(savedLogo) document.getElementById('portal-logo-view').innerHTML = `<img src="${savedLogo}">`;
    } catch(e){}

    // लॉगिन सबमिट लॉजिक
    document.getElementById('login-submit-btn').onclick = function() {
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();
        const captchaChecked = document.getElementById('captcha').checked;

        if(!user || !pass) {
            alert("कृपया यूजर आईडी और पासवर्ड डालें!");
            return;
        }
        if(!captchaChecked) {
            alert("कृपया रीकैप्चा टिक करें!");
            return;
        }

        if(user === "Admin" && pass === "Manvendra#1234") {
            document.getElementById('login-card').style.display = 'none';
            document.getElementById('admin-dashboard').style.display = 'block';
            return;
        }

        try {
            const studentDataStr = localStorage.getItem('student_' + user);
            if(studentDataStr) {
                const studentData = JSON.parse(studentDataStr);
                if(studentData.password === pass) {
                    document.getElementById('login-card').style.display = 'none';
                    document.getElementById('student-dashboard').style.display = 'block';
                    document.getElementById('dash-student-title').innerText = "रोल नंबर: " + user;
                    setupStudentDashboard(studentData);
                } else {
                    alert("गलत पासवर्ड!");
                }
            } else {
                alert("यह रोल नंबर मौजूद नहीं है।");
            }
        } catch (error) {
            alert("लॉगिन एरर उत्पन्न हुआ!");
        }
    };

    // सेटिंग्स बटन के क्लिक पर डेटा सेव करना
    document.getElementById('save-settings-btn').onclick = function() {
        const nameInput = document.getElementById('input-site-name').value;
        const logoFile = document.getElementById('input-site-logo').files[0];
        const frontBgFile = document.getElementById('input-front-bg').files[0];
        const globalBgFile = document.getElementById('input-global-bg').files[0];

        if(nameInput) localStorage.setItem('siteName', nameInput);

        const readFile = (file) => {
            return new Promise((resolve) => {
                if (!file) resolve(null);
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        };

        Promise.all([readFile(logoFile), readFile(frontBgFile), readFile(globalBgFile)]).then(([logoData, frontData, globalData]) => {
            try {
                if (logoData) localStorage.setItem('siteLogo', logoData);
                if (frontData) localStorage.setItem('frontPageBg', frontData);
                if (globalData) localStorage.setItem('globalPageBg', globalData);
                
                alert("पोर्टल सेटिंग्स सुरक्षित कर दिए गए हैं!");
                location.reload();
            } catch(e) {
                alert("त्रुटि: इमेज फ़ाइल साइज बहुत बड़ी है!");
            }
        });
    };

    // स्टूडेंट डेटा सेव करना
    document.getElementById('save-student-btn').onclick = function() {
        const roll = document.getElementById('stud-roll').value.trim();
        const pass = document.getElementById('stud-pass').value.trim();
        const photoFile = document.getElementById('stud-photo').files[0];
        const pdfFile = document.getElementById('stud-pdf').files[0];

        if(!roll || !pass) return alert("रोल नंबर और पासवर्ड भरें!");

        let studentObj = { password: pass, photo: "", pdf: "" };
        try {
            let existing = localStorage.getItem('student_' + roll);
            if(existing) studentObj = JSON.parse(existing);
        } catch(e){}
        studentObj.password = pass;

        const finalSave = () => {
            try {
                localStorage.setItem('student_' + roll, JSON.stringify(studentObj));
                alert(`छात्र ${roll} का डेटा सुरक्षित हुआ!`);
            } catch(e){ alert("फ़ाइल साइज बहुत बड़ा है!"); }
        };

        if(photoFile && pdfFile) {
            let r1 = new FileReader(), r2 = new FileReader();
            r1.onload = function(e){ studentObj.photo = e.target.result; r2.readAsDataURL(pdfFile); }
            r2.onload = function(e){ studentObj.pdf = e.target.result; finalSave(); }
            r1.readAsDataURL(photoFile);
        } else if(photoFile) {
            let r1 = new FileReader();
            r1.onload = function(e){ studentObj.photo = e.target.result; finalSave(); }
            r1.readAsDataURL(photoFile);
        } else if(pdfFile) {
            let r2 = new FileReader();
            r2.onload = function(e){ studentObj.pdf = e.target.result; finalSave(); }
            r2.readAsDataURL(pdfFile);
        } else {
            finalSave();
        }
    };

    // स्टूडेंट डिलीट करना
    document.getElementById('delete-student-btn').onclick = function() {
        const roll = document.getElementById('delete-stud-roll').value.trim();
        if(!roll) return alert("रोल नंबर डालें!");
        try {
            localStorage.removeItem('student_' + roll);
            alert("छात्र डिलीट हो गया!");
        } catch(e){}
    };
});

// स्टूडेंट डैशबोर्ड सेटअप
function setupStudentDashboard(data) {
    if(data.photo) {
        document.getElementById('display-profile-pic').src = data.photo;
        document.getElementById('display-profile-pic').classList.remove('hidden');
        document.getElementById('profile-status').classList.add('hidden');
    }
    if(data.pdf) {
        try {
            const parts = data.pdf.split(';base64,');
            const contentType = parts[0].split(':')[1];
            const raw = window.atob(parts[1]);
            const uInt8Array = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
            const blobUrl = URL.createObjectURL(new Blob([uInt8Array], {type: contentType}));
            
            document.getElementById('pdf-container').innerHTML = `<object data="${blobUrl}" type="application/pdf"><embed src="${blobUrl}" type="application/pdf" /></object>`;
            document.getElementById('pdf-container').classList.remove('hidden');
            document.getElementById('result-status').classList.add('hidden');
        } catch(e){}
    }
}

// टैब स्विचिंग लॉजिक
function switchTab(tabName) {
    if(tabName === 'profile') {
        document.getElementById('profile-content').classList.remove('hidden');
        document.getElementById('result-content').classList.add('hidden');
        document.getElementById('btn-profile').classList.add('active');
        document.getElementById('btn-result').classList.remove('active');
    } else {
        document.getElementById('profile-content').classList.add('hidden');
        document.getElementById('result-content').classList.remove('hidden');
        document.getElementById('btn-profile').classList.remove('active');
        document.getElementById('btn-result').classList.add('active');
    }
}

