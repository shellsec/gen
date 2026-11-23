'use strict';

const field = id => document.getElementById(id);
const words = {
    descriptors: ['Amber', 'Arctic', 'Azure', 'Bold', 'Bronze', 'Cloudy', 'Coral', 'Crimson', 'Golden', 'Lunar', 'Marble', 'Neon', 'Polar', 'Quiet', 'Scarlet', 'Silver', 'Solar', 'Steady', 'Velvet', 'Vivid'],
    creatures: ['Badger', 'Bison', 'Crane', 'Gecko', 'Heron', 'Ibis', 'Koala', 'Lemur', 'Mantis', 'Marten', 'Moose', 'Orca', 'Osprey', 'Puffin', 'Quail', 'Seal', 'Stoat', 'Toucan', 'Viper', 'Wren'],
    given: ['Ada', 'Aria', 'Avery', 'Devon', 'Ellis', 'Finn', 'Hazel', 'Iris', 'Jade', 'Jamie', 'Jordan', 'Kai', 'Leah', 'Milo', 'Nadia', 'Rowan', 'Sage', 'Sam', 'Theo', 'Zoe'],
    family: ['Archer', 'Blake', 'Brooks', 'Chase', 'Clarke', 'Cole', 'Cross', 'Dale', 'Frost', 'Hayes', 'Lane', 'Marsh', 'Reed', 'Reeve', 'Rivera', 'Shaw', 'Snow', 'Vale', 'Wells', 'West']
};
const groups = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const randomWord = new Uint32Array(1);
function randomBelow(size) {
    const ceiling = 2 ** 32 - (2 ** 32 % size);
    do {
        crypto.getRandomValues(randomWord);
    } while (randomWord[0] >= ceiling);
    return randomWord[0] % size;
}

const choose = list => list[randomBelow(list.length)];
const usernameFormats = {
    adjective_noun: () => [choose(words.descriptors), choose(words.creatures)],
    noun_number: () => [choose(words.creatures), String(10 + randomBelow(90))],
    firstname_lastname: () => [choose(words.given), choose(words.family)],
    random_mix: () => [...usernameFormats.adjective_noun(), String(randomBelow(10))],
    adjective_noun_three_digits: () => [...usernameFormats.adjective_noun(), String(100 + randomBelow(900))]
};

function refreshProfile() {
    const format = usernameFormats[field('usernameStyle').value];
    const output = field('username');
    let parts;
    let name;
    do {
        parts = format();
        name = parts.join('');
    } while (name === output.textContent);
    output.textContent = name;
    field('displayName').textContent = parts.join(' ');
    field('testEmail').textContent = name.toLowerCase() + '@example.com';
}

const lengthControl = field('passwordLength');
function refreshPassword() {
    const enabled = Object.keys(groups).filter(id => field(id).checked).map(id => groups[id]);
    if (enabled.length === 0) enabled.push(groups.lowercase);

    const pool = enabled.join('');
    const length = Number(lengthControl.value);
    // Reject candidates missing an enabled group so valid passwords are sampled uniformly.
    let password;
    do {
        password = Array.from({ length }, () => choose(pool)).join('');
    } while (enabled.some(group => !Array.from(password).some(character => group.includes(character))));
    field('password').textContent = password;
}

function refreshUuid() {
    if (typeof crypto.randomUUID === 'function') {
        field('testUuid').textContent = crypto.randomUUID();
        return;
    }
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
    field('testUuid').textContent = hex.replace(/^(........)(....)(....)(....)(............)$/, '$1-$2-$3-$4-$5');
}

function refreshPin() {
    field('testPin').textContent = String(randomBelow(1_000_000)).padStart(6, '0');
}

function refreshAll() {
    refreshProfile();
    refreshPassword();
    refreshUuid();
    refreshPin();
}

const notice = field('notification');
let hideNotice;
async function copyValue(id) {
    try {
        await navigator.clipboard.writeText(field(id).textContent);
        notice.textContent = notice.dataset.success;
    } catch {
        notice.textContent = notice.dataset.failure;
    }
    clearTimeout(hideNotice);
    notice.classList.add('show');
    hideNotice = setTimeout(() => notice.classList.remove('show'), 2000);
}

function configureLanguage() {
    const link = document.querySelector('.language-switch a');
    if (location.protocol === 'file:') link.pathname += 'index.html';
    link.search = location.search;

    const current = document.documentElement.lang;
    const manual = location.hash === '#language';
    let saved;
    try {
        if (manual) localStorage.setItem('account-details-language', current);
        saved = localStorage.getItem('account-details-language');
    } catch {
        // Local files and privacy settings may block storage.
    }

    const supported = (navigator.languages || [navigator.language])
        .map(language => language?.split('-')[0].toLowerCase())
        .find(language => language === 'en' || language === 'zh');
    if (!manual && current === 'zh-CN' && (saved ? saved === 'en' : supported === 'en')) {
        location.replace(link.href);
        return false;
    }
    link.hash = 'language';
    return true;
}

if (configureLanguage()) {
    const query = location.search.slice(1);
    const input = new URLSearchParams(query).get('length') ?? query;
    const requested = Number(input);
    if (/^\d+$/.test(input) && requested >= Number(lengthControl.min) && requested <= Number(lengthControl.max)) {
        lengthControl.value = String(requested);
    }
    const showLength = () => { field('passwordLengthValue').textContent = lengthControl.value; };
    showLength();
    lengthControl.addEventListener('input', showLength);

    const generators = { profile: refreshProfile, password: refreshPassword, uuid: refreshUuid, pin: refreshPin };
    document.querySelectorAll('[data-generate]').forEach(button => {
        button.addEventListener('click', generators[button.dataset.generate]);
    });
    document.querySelectorAll('[data-copy]').forEach(button => {
        button.addEventListener('click', () => copyValue(button.dataset.copy));
    });
    field('generate-all').addEventListener('click', refreshAll);
    refreshAll();
}
