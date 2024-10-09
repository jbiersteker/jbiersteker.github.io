// script.js

// Introduction text with typing animation, selecting randomly from 20 messages
const introMessages = [
    "Hi, I'm Jasper!",
    "Welcome to my portfolio!",
    "Greetings! I'm Jasper.",
    "Hello there, I'm Jasper.",
    "Hey! Jasper here.",
    "Hiya! Welcome to my site.",
    "Bonjour! Je suis Jasper.",
    "Hola! Soy Jasper.",
    "Ciao! Mi chiamo Jasper.",
    "Hallo! Ik ben Jasper.",
    "Salve! I'm Jasper.",
    "Howdy! Jasper at your service.",
    "Ahoy! I'm Jasper.",
    "Namaste! I'm Jasper.",
    "こんにちは、私はジャスパーです。",
    "안녕하세요, 저는 재스퍼입니다.",
    "你好，我是贾斯珀。",
    "مرحبا، أنا جاسبر.",
    "Привет, я Джаспер.",
    "Annyeong! I'm Jasper."
];

function typeIntroText(text, elementId) {
    let i = 0;
    const speed = 100; // Typing speed in milliseconds
    const element = document.getElementById(elementId);
    element.textContent = '';

    function typeWriter() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }
    typeWriter();
}

// Select a random message
const randomIndex = Math.floor(Math.random() * introMessages.length);
const introText = introMessages[randomIndex];
typeIntroText(introText, 'intro-text');

// Cookie consent joke
function showCookieJoke() {
    window.location.href = 'cookie-joke.html';
}

// Animations on scroll (simple example)
window.addEventListener('scroll', () => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
        const position = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        if (position < screenPosition) {
            element.classList.add('animated');
        }
    });
});
