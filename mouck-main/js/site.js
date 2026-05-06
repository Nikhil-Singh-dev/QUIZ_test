const TRANSLATIONS = {
    en: {
        homeTitle: 'Open Quiz Playground',
        homeSubtitle: 'Explore all quiz topics, switch theme, and choose language instantly.',
        exploreQuizzes: 'All quizzes for every visitor',
        heroText: 'No login needed to browse questions. Start a quiz anytime after signing in.',
        startFree: 'Start Free',
        adminPanel: 'Admin Panel',
        availableQuizzes: 'Available Quizzes',
        quizBrowseText: 'Select any quiz to preview the questions and begin your test.',
        featuresTitle: 'Features You Get',
        darkLightMode: 'Dark / Light Mode',
        darkLightText: 'Toggle display theme for comfortable learning.',
        languageSwitch: 'Hindi / English',
        languageText: 'Switch all page labels instantly between two languages.',
        liveTimer: 'Live Timer',
        timerText: 'Every question has a countdown with visual warning states.',
        soundControl: 'Sound Control',
        soundText: 'Enable or disable ticking sound while taking a quiz.',
        login: 'Login',
        startQuiz: 'Start Quiz',
        continueQuiz: 'Continue',
        submitQuiz: 'Submit Quiz',
        timeRemaining: 'Time Remaining',
        questionsLabel: 'Questions',
        previous: 'Previous',
        next: 'Next',
        submitConfirmTitle: 'Submit Quiz?',
        submitConfirmMessage: 'Are you sure you want to submit your quiz?',
        yesSubmit: 'Yes, Submit',
        noContinue: 'No, Keep Going',
        soundOn: 'Sound On',
        soundOff: 'Sound Off',
        pageSubtitle: 'Enjoy a smart quiz interface with timer, language and sound control.',
        noQuizzes: 'No quizzes available yet. Check back soon.',
        guestNotice: 'Login to begin this quiz.',
        loginToStart: 'Login to Start',
        scoreSubmitted: 'Quiz submitted successfully!',
        loadingQuestion: 'Loading question...',
    },
    hi: {
        homeTitle: 'खुला क्विज़ मंच',
        homeSubtitle: 'सभी क्विज़ देखें, थीम बदलें और भाषा तुरंत चुनें।',
        exploreQuizzes: 'हर आगंतुक के लिए क्विज़',
        heroText: 'प्रश्न देखने के लिए लॉगिन की आवश्यकता नहीं। शुरू करने के लिए साइन इन करें।',
        startFree: 'मुफ्त शुरू करें',
        adminPanel: 'एडमिन पैनल',
        availableQuizzes: 'उपलब्ध क्विज़',
        quizBrowseText: 'किसी भी क्विज़ को चुनें और अपने टेस्ट शुरू करें।',
        featuresTitle: 'जिन सुविधाओं के साथ',
        darkLightMode: 'डार्क / लाइट मोड',
        darkLightText: 'आरामदायक पढ़ाई के लिए थीम बदलें।',
        languageSwitch: 'हिंदी / अंग्रेज़ी',
        languageText: 'सारी वेबसाइट अब दो भाषाओं में देखें।',
        liveTimer: 'लाइव टाइमर',
        timerText: 'हर प्रश्न के साथ काउंटडाउन और चेतावनी रंग।',
        soundControl: 'साउंड कंट्रोल',
        soundText: 'टिक टॉक आवाज़ चालू या बंद करें।',
        login: 'लॉगिन',
        startQuiz: 'क्विज़ शुरू करें',
        continueQuiz: 'जारी रखें',
        submitQuiz: 'क्विज़ सबमिट करें',
        timeRemaining: 'समय शेष',
        questionsLabel: 'प्रश्न',
        previous: 'पिछला',
        next: 'अगला',
        submitConfirmTitle: 'क्विज़ सबमिट करें?',
        submitConfirmMessage: 'क्या आप वाकई अपना क्विज़ सबमिट करना चाहते हैं?',
        yesSubmit: 'हाँ, सबमिट करें',
        noContinue: 'नहीं, जारी रखें',
        soundOn: 'साउंड चालू',
        soundOff: 'साउंड बंद',
        loadingQuestion: 'प्रश्न लोड हो रहा है...',
        pageSubtitle: 'टाइमर, भाषा और साउंड कंट्रोल के साथ स्मार्ट क्विज़ इंटरफ़ेस।',
        noQuizzes: 'अभी कोई क्विज़ उपलब्ध नहीं है। बाद में देखें।',
        guestNotice: 'क्विज़ शुरू करने के लिए लॉगिन करें।',
        loginToStart: 'शुरू करने के लिए लॉगिन करें',
        scoreSubmitted: 'क्विज़ सफलतापूर्वक सबमिट हो गई!',
    }
};

function getSavedTheme() {
    return localStorage.getItem('siteTheme') || 'dark';
}

function getSavedLanguage() {
    return localStorage.getItem('siteLanguage') || 'en';
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('siteTheme', theme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function applyLanguage(lang) {
    localStorage.setItem('siteLanguage', lang);
    const languageToggle = document.getElementById('langToggle');
    if (languageToggle) {
        languageToggle.textContent = lang === 'en' ? 'हिंदी' : 'English';
    }
    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.dataset.i18n;
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            element.textContent = TRANSLATIONS[lang][key];
        }
    });
}

function toggleTheme() {
    const current = getSavedTheme();
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

function toggleLanguage() {
    const current = getSavedLanguage();
    applyLanguage(current === 'en' ? 'hi' : 'en');
}

function getText(key) {
    const lang = getSavedLanguage();
    return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || '';
}

function initSite() {
    applyTheme(getSavedTheme());
    applyLanguage(getSavedLanguage());
    const themeToggle = document.getElementById('themeToggle');
    const langToggle = document.getElementById('langToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (langToggle) langToggle.addEventListener('click', toggleLanguage);
}
