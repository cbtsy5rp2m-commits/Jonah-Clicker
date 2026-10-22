// Game State
let score = 0;
let passiveIncome = 0;

let cursorCount = 0;
let cursorCost = 15;

let grandmaCount = 0;
let grandmaCost = 100;

let factoryCount = 0;
let factoryCost = 1000;

let highScores = [];

// DOM Elements
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

// --- 1. CORE MECHANICS ---
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

// --- 2. SAVE & LOAD SYSTEM ---
function saveGame() {
    const gameSave = {
        score: score,
        passiveIncome: passiveIncome,
        cursorCount: cursorCount,
        cursorCost: cursorCost,
        grandmaCount: grandmaCount,
        grandmaCost: grandmaCost,
        factoryCount: factoryCount,
        factoryCost: factoryCost,
        highScores: highScores
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
        highScores = gameSave.highScores || [];
        
        updateUI();
        renderLeaderboard();
    }
}

// Manual Save and Reset Targets
saveBtn.addEventListener('click', () => {
    saveGame();
    alert("Game Saved Successfully!");
});

resetBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to reset everything?")) {
        localStorage.removeItem("clickerGameSave");
        location.reload(); // Refresh the page to wipe everything back to 0
    }
});

// Auto-Save Loop (Saves automatically every 30 seconds)
setInterval(saveGame, 30000);


// --- 3. LIVE CLOUD LEADERBOARD SYSTEM ---

// Go to your Supabase Project Settings > API to get these keys:
const SUPABASE_URL = "https://jqteppzgagqwljqpvmbn.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_t4HA7S1fKrxVCxcaUgFfvg_Bw0Gb1uJ";

// Initialize the Supabase Client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

submitScoreBtn.addEventListener('click', async () => {
    const name = prompt("Enter your name for the LIVE leaderboard:");
    if (name) {
        // Send the score straight to your cloud database!
        const { error } = await supabase
            .from('leaderboard')
            .insert([{ name: name, score: Math.floor(score) }]);

        if (error) {
            console.error("Error saving score:", error);
        } else {
            alert("Score submitted to the live cloud!");
            fetchLiveLeaderboard(); // Refresh the list
        }
    }
});

async function fetchLiveLeaderboard() {
    // Get the top 5 highest scores from the cloud
    const { data, error } = await supabase
        .from('leaderboard')
        .select('name, score')
        .order('score', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching leaderboard:", error);
        return;
    }

    // Render the cloud scores onto the screen
    leaderboardList.innerHTML = "";
    if (data.length === 0) {
        leaderboardList.innerHTML = "<li>No global scores yet!</li>";
        return;
    }
    data.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${entry.name}</strong>: ${entry.score} gold`;
        leaderboardList.appendChild(li);
    });
}

// Change your window.onload to pull from the cloud
window.onload = () => {
    loadGame(); // Keeps their personal gold save local to their browser
    fetchLiveLeaderboard(); // Pulls the shared leaderboard from the cloud
};

// --- 4. GAME INITIALIZATION ---
// Engine loop running 10x per second
setInterval(() => {
    score += (passiveIncome / 10);
    updateUI();
}, 100);

// Automatically load the player's save when they open the website
window.onload = () => {
    loadGame();
};
