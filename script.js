// --- 0. CLOUD DATABASE SETUP ---
const SUPABASE_URL = "https://jqteppzgagqwljqpvmbn.supabase.co/rest/v1/"; 
const SUPABASE_ANON_KEY = "sb_publishable_t4HA7S1fKrxVCxcaUgFfvg_Bw0Gb1uJ"; 

// Initializing the Supabase Client with a fixed name variation to prevent conflict crashes
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- 1. GAME STATE VARIABLES ---
let score = 0;
let passiveIncome = 0;

let cursorCount = 0;
let cursorCost = 15;

let grandmaCount = 0;
let grandmaCost = 100;

let factoryCount = 0;
let factoryCost = 1000;

// --- 2. DOM ELEMENTS ---
const scoreDisplay = document.getElementById('score');
const gpsDisplay = document.getElementById('gps');
const clickBtn = document.getElementById('clickBtn');

const buyCursorBtn = document.getElementById('buyCursor');
const cursorCostDisplay = document.getElementById('cursorCost');

const buyGrandmaBtn = document.getElementById('buyGrandma');
const grandmaCostDisplay = document.getElementById('grandmaCost');

const buyFactoryBtn = document.getElementById('buyFactory');
const factoryCostDisplay = document.getElementById('factoryCost');

const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const submitScoreBtn = document.getElementById('submitScoreBtn');
const leaderboardList = document.getElementById('leaderboardList');

// --- 3. CORE TRANSACTIONS ---
clickBtn.addEventListener('click', () => {
    score += 1;
    updateUI();
});

buyCursorBtn.addEventListener('click', () => {
    if (score >= cursorCost) {
        score -= cursorCost;
        cursorCount++;
        passiveIncome += 1;
        cursorCost = Math.round(cursorCost * 1.15);
        updateUI();
    }
});

buyGrandmaBtn.addEventListener('click', () => {
    if (score >= grandmaCost) {
        score -= grandmaCost;
        grandmaCount++;
        passiveIncome += 5;
        grandmaCost = Math.round(grandmaCost * 1.15);
        updateUI();
    }
});

buyFactoryBtn.addEventListener('click', () => {
    if (score >= factoryCost) {
        score -= factoryCost;
        factoryCount++;
        passiveIncome += 50;
        factoryCost = Math.round(factoryCost * 1.15);
        updateUI();
    }
});

function updateUI() {
    scoreDisplay.innerText = Math.floor(score);
    gpsDisplay.innerText = passiveIncome;
    cursorCostDisplay.innerText = cursorCost;
    grandmaCostDisplay.innerText = grandmaCost;
    factoryCostDisplay.innerText = factoryCost;
}

// --- 4. PERSISTENT BROWSER SAVES ---
function saveGame() {
    const gameSave = {
        score: score,
        passiveIncome: passiveIncome,
        cursorCount: cursorCount,
        cursorCost: cursorCost,
        grandmaCount: grandmaCount,
        grandmaCost: grandmaCost,
        factoryCount: factoryCount,
        factoryCost: factoryCost
    };
    localStorage.setItem("clickerGameSave", JSON.stringify(gameSave));
}

function loadGame() {
    const savedData = localStorage.getItem("clickerGameSave");
    if (savedData) {
        const gameSave = JSON.parse(savedData);
        score = gameSave.score || 0;
        passiveIncome = gameSave.passiveIncome || 0;
        cursorCount = gameSave.cursorCount || 0;
        cursorCost = gameSave.cursorCost || 15;
        grandmaCount = gameSave.grandmaCount || 0;
        grandmaCost = gameSave.grandmaCost || 100;
        factoryCount = gameSave.factoryCount || 0;
        factoryCost = gameSave.factoryCost || 1000;
        updateUI();
    }
}

saveBtn.addEventListener('click', () => {
    saveGame();
    alert("Game Progress Saved!");
});

resetBtn.addEventListener('click', () => {
    if (confirm("Reset game? All local gold and items will be wiped.")) {
        localStorage.removeItem("clickerGameSave");
        location.reload();
    }
});

// Auto-save tracker running every 30 seconds
setInterval(saveGame, 30000);

// --- 5. LIVE GLOBAL LEADERBOARD LOGIC ---
submitScoreBtn.addEventListener('click', async () => {
    const name = prompt("Enter your name for the LIVE leaderboard:");
    if (name) {
        const { error } = await supabaseClient
            .from('leaderboard')
            .insert([{ name: name, score: Math.floor(score) }]);

        if (error) {
            console.error("Leaderboard Error:", error);
            alert("Could not connect to database.");
        } else {
            alert("Score posted successfully!");
            fetchLiveLeaderboard();
        }
    }
});

async function fetchLiveLeaderboard() {
    const { data, error } = await supabaseClient
        .from('leaderboard')
        .select('name, score')
        .order('score', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Fetch Error:", error);
        return;
    }

    leaderboardList.innerHTML = "";
    if (data.length === 0) {
        leaderboardList.innerHTML = "<li>No global scores posted yet!</li>";
        return;
    }
    data.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${entry.name}</strong>: ${entry.score} gold`;
        leaderboardList.appendChild(li);
    });
}

// --- 6. TICK ENGINE TIMERS ---
setInterval(() => {
    score += (passiveIncome / 10);
    updateUI();
}, 100);

window.onload = () => {
    loadGame();
    fetchLiveLeaderboard();
};
