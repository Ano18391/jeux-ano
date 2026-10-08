"use strict";

/* =========================================================
   🌿 JEUX ANO V10
   FRONTEND + BACKEND
========================================================= */

const API_URL = "/api";
const TOKEN_KEY = "jeux_ano_token";

let token = localStorage.getItem(TOKEN_KEY);

let data = {
    user: null,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    xp: 0,
    level: 1,
    history: []
};


/* =========================================================
   OUTILS
========================================================= */

function $(selector) {
    return document.querySelector(selector);
}

function showToast(message) {
    let toast = $("#toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function capitalize(value) {
    return value.charAt(0).toUpperCase()
        + value.slice(1);
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   API
========================================================= */

async function api(endpoint, options = {}) {

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    try {
        const response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Une erreur est survenue."
            );
        }

        return result;

    } catch (error) {

        console.error(
            "API error:",
            error
        );

        throw error;
    }
}


/* =========================================================
   CONVERSION DES DONNÉES BACKEND
========================================================= */

function updateLocalUser(user) {

    if (!user) {
        return;
    }

    data.user = user.username;
    data.gamesPlayed =
        user.games_played ?? 0;

    data.wins =
        user.wins ?? 0;

    data.losses =
        user.losses ?? 0;

    data.draws =
        user.draws ?? 0;

    data.xp =
        user.xp ?? 0;

    data.level =
        user.level ?? 1;

    updateUI();
}


/* =========================================================
   CONNEXION
========================================================= */

async function register(
    username,
    email,
    password
) {

    if (
        !username ||
        !email ||
        !password
    ) {
        showToast(
            "⚠️ Remplis tous les champs."
        );

        return false;
    }

    if (password.length < 4) {
        showToast(
            "⚠️ Mot de passe trop court."
        );

        return false;
    }

    try {

        const result =
            await api(
                "/register",
                {
                    method: "POST",
                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                }
            );

        token = result.token;

        localStorage.setItem(
            TOKEN_KEY,
            token
        );

        updateLocalUser(
            result.user
        );

        showToast(
            "🌿 Compte créé avec succès !"
        );

        return true;

    } catch (error) {

        showToast(
            `⚠️ ${error.message}`
        );

        return false;
    }
}


async function login(
    email,
    password
) {

    if (!email || !password) {
        showToast(
            "⚠️ Remplis tous les champs."
        );

        return false;
    }

    try {

        const result =
            await api(
                "/login",
                {
                    method: "POST",
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

        token = result.token;

        localStorage.setItem(
            TOKEN_KEY,
            token
        );

        updateLocalUser(
            result.user
        );

        showToast(
            `🌿 Bienvenue ${result.user.username} !`
        );

        return true;

    } catch (error) {

        showToast(
            `⚠️ ${error.message}`
        );

        return false;
    }
}


function logout() {

    token = null;

    localStorage.removeItem(
        TOKEN_KEY
    );

    data.user = null;

    updateUI();

    showToast(
        "👋 Déconnexion réussie."
    );
}


/* =========================================================
   RÉCUPÉRER LE PROFIL
========================================================= */

async function loadProfile() {

    if (!token) {
        return false;
    }

    try {

        const result =
            await api(
                "/profile"
            );

        updateLocalUser(
            result.user
        );

        return true;

    } catch (error) {

        token = null;

        localStorage.removeItem(
            TOKEN_KEY
        );

        return false;
    }
}


/* =========================================================
   STATISTIQUES
========================================================= */

async function registerGame(result) {

    if (!token) {

        showToast(
            "💾 Connecte-toi pour sauvegarder ta progression."
        );

        return;
    }

    try {

        const response =
            await api(
                "/stats",
                {
                    method: "POST",
                    body: JSON.stringify({
                        result
                    })
                }
            );

        const stats =
            response.stats;

        data.gamesPlayed =
            stats.gamesPlayed;

        data.wins =
            stats.wins;

        data.losses =
            stats.losses;

        data.draws =
            stats.draws;

        data.xp =
            stats.xp;

        data.level =
            stats.level;

        updateUI();

    } catch (error) {

        showToast(
            `⚠️ Sauvegarde impossible : ${error.message}`
        );
    }
}


/* =========================================================
   INTERFACE
========================================================= */

function updateUI() {

    const username =
        data.user || "Joueur";


    document
        .querySelectorAll(
            "[data-username]"
        )
        .forEach(element => {

            element.textContent =
                username;

        });


    document
        .querySelectorAll(
            "[data-level]"
        )
        .forEach(element => {

            element.textContent =
                data.level;

        });


    document
        .querySelectorAll(
            "[data-xp]"
        )
        .forEach(element => {

            element.textContent =
                `${data.xp} / ${data.level * 100} XP`;

        });


    const xpPercent =
        Math.min(
            100,
            (data.xp /
                (data.level * 100)) *
            100
        );


    document
        .querySelectorAll(
            ".xp-progress"
        )
        .forEach(bar => {

            bar.style.width =
                `${xpPercent}%`;

        });


    document
        .querySelectorAll(
            "[data-games]"
        )
        .forEach(element => {

            element.textContent =
                data.gamesPlayed;

        });


    document
        .querySelectorAll(
            "[data-wins]"
        )
        .forEach(element => {

            element.textContent =
                data.wins;

        });


    document
        .querySelectorAll(
            "[data-losses]"
        )
        .forEach(element => {

            element.textContent =
                data.losses;

        });


    document
        .querySelectorAll(
            "[data-draws]"
        )
        .forEach(element => {

            element.textContent =
                data.draws;

        });
}


/* =========================================================
   PIERRE FEUILLE CISEAUX
========================================================= */

let rpsPlayerScore = 0;
let rpsBotScore = 0;
let rpsRounds = 0;

const rpsChoices = [
    "pierre",
    "feuille",
    "ciseaux"
];


async function playRPS(
    playerChoice
) {

    if (
        !rpsChoices.includes(
            playerChoice
        )
    ) {
        return;
    }


    const botChoice =
        rpsChoices[
            Math.floor(
                Math.random() *
                rpsChoices.length
            )
        ];


    let result;


    if (
        playerChoice ===
        botChoice
    ) {

        result = "draw";

    } else if (

        (
            playerChoice ===
            "pierre" &&
            botChoice ===
            "ciseaux"
        ) ||

        (
            playerChoice ===
            "feuille" &&
            botChoice ===
            "pierre"
        ) ||

        (
            playerChoice ===
            "ciseaux" &&
            botChoice ===
            "feuille"
        )

    ) {

        result = "win";

    } else {

        result = "loss";
    }


    rpsRounds++;


    if (result === "win") {
        rpsPlayerScore++;
    }

    if (result === "loss") {
        rpsBotScore++;
    }


    const resultBox =
        $("#rpsResult");


    const messages = {
        win: "🏆 Gagné !",
        loss: "😢 Perdu !",
        draw: "🤝 Égalité !"
    };


    if (resultBox) {

        resultBox.innerHTML = `
            <strong>
                ${messages[result]}
            </strong>

            <br>

            Toi :
            ${capitalize(playerChoice)}

            <br>

            Bot :
            ${capitalize(botChoice)}
        `;

    }


    updateRPSScore();


    if (rpsRounds >= 5) {
        await finishRPS();
    }
}


async function finishRPS() {

    let finalResult;


    if (
        rpsPlayerScore >
        rpsBotScore
    ) {

        finalResult = "win";

    } else if (
        rpsPlayerScore <
        rpsBotScore
    ) {

        finalResult = "loss";

    } else {

        finalResult = "draw";
    }


    await registerGame(
        finalResult
    );


    showToast(
        `🏁 Partie terminée : ${rpsPlayerScore} - ${rpsBotScore}`
    );


    setTimeout(() => {

        rpsPlayerScore = 0;
        rpsBotScore = 0;
        rpsRounds = 0;

        updateRPSScore();

    }, 1500);
}


function updateRPSScore() {

    const player =
        $("#rpsPlayerScore");

    const bot =
        $("#rpsBotScore");

    const rounds =
        $("#rpsRounds");


    if (player) {
        player.textContent =
            rpsPlayerScore;
    }

    if (bot) {
        bot.textContent =
            rpsBotScore;
    }

    if (rounds) {
        rounds.textContent =
            rpsRounds;
    }
}


/* =========================================================
   DEVINE LE NOMBRE
========================================================= */

let secretNumber = null;
let numberAttempts = 0;
let numberGameActive = false;


function startNumberGame() {

    secretNumber =
        Math.floor(
            Math.random() * 1000
        ) + 1;

    numberAttempts = 0;

    numberGameActive = true;


    const result =
        $("#numberResult");

    if (result) {

        result.textContent =
            "🔥 Trouve le nombre entre 1 et 1000 !";

    }


    const attempts =
        $("#numberAttempts");

    if (attempts) {

        attempts.textContent =
            "Essais : 0 / 10";

    }
}


async function guessNumber(value) {

    if (!numberGameActive) {
        startNumberGame();
    }


    const guess =
        Number(value);


    if (
        !Number.isInteger(guess) ||
        guess < 1 ||
        guess > 1000
    ) {

        showToast(
            "⚠️ Entre un nombre entre 1 et 1000."
        );

        return;
    }


    numberAttempts++;


    const distance =
        Math.abs(
            secretNumber -
            guess
        );


    let message = "";


    if (
        guess ===
        secretNumber
    ) {

        message =
            `🏆 Bravo ! Le nombre était ${secretNumber}. ` +
            `Réussi en ${numberAttempts} essai(s) !`;


        numberGameActive =
            false;


        await registerGame(
            "win"
        );

    } else {

        if (
            guess >
            secretNumber
        ) {

            message +=
                "⬇️ Plus petit ! ";

        } else {

            message +=
                "⬆️ Plus grand ! ";
        }


        if (distance >= 500) {

            message +=
                "🥶 Très froid !";

        } else if (
            distance >= 200
        ) {

            message +=
                "❄️ Froid.";

        } else if (
            distance >= 100
        ) {

            message +=
                "🌡️ Ça chauffe.";

        } else if (
            distance >= 50
        ) {

            message +=
                "🔥 Chaud !";

        } else if (
            distance >= 20
        ) {

            message +=
                "🔥🔥 Très chaud !";

        } else if (
            distance >= 10
        ) {

            message +=
                "🧨 Brûlant !";

        } else {

            message +=
                "🧨🔥 HYPER chaud !";
        }


        if (
            numberAttempts >= 10
        ) {

            message =
                `😢 Perdu ! Le nombre était ${secretNumber}.`;

            numberGameActive =
                false;


            await registerGame(
                "loss"
            );
        }
    }


    const result =
        $("#numberResult");

    if (result) {

        result.textContent =
            message;

    }


    const attempts =
        $("#numberAttempts");

    if (attempts) {

        attempts.textContent =
            `Essais : ${numberAttempts} / 10`;

    }
}


/* =========================================================
   CALCULATRICE
========================================================= */

function calculate(
    a,
    b,
    operator
) {

    switch (operator) {

        case "+":
            return a + b;

        case "-":
            return a - b;

        case "*":
            return a * b;

        case "/":

            if (b === 0) {
                throw new Error(
                    "Division par zéro impossible."
                );
            }

            return a / b;

        case "**":
            return a ** b;

        default:
            throw new Error(
                "Opérateur invalide."
            );
    }
}


function useCalculator(
    first,
    second,
    operator
) {

    const a =
        Number(first);

    const b =
        Number(second);


    if (
        !Number.isFinite(a) ||
        !Number.isFinite(b)
    ) {

        showToast(
            "⚠️ Entre deux nombres valides."
        );

        return;
    }


    try {

        const result =
            calculate(
                a,
                b,
                operator
            );


        const formatted =
            Number.isInteger(result)
                ? result
                : result.toFixed(2);


        const resultBox =
            $("#calculatorResult");


        if (resultBox) {

            resultBox.textContent =
                `${a} ${operator} ${b} = ${formatted}`;

        }


        addCalculatorHistory(
            `${a} ${operator} ${b} = ${formatted}`
        );


    } catch (error) {

        showToast(
            `⚠️ ${error.message}`
        );
    }
}


function addCalculatorHistory(
    text
) {

    const history =
        $("#calcHistory");


    if (!history) {
        return;
    }


    const line =
        document.createElement(
            "div"
        );


    line.textContent =
        text;


    history.prepend(line);
}


/* =========================================================
   PROFIL
========================================================= */

function displayHistory() {

    const container =
        $("#historyList");


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="history-item">
            <strong>
                📊 Statistiques synchronisées
            </strong>

            <br>

            <small>
                ${data.gamesPlayed}
                parties ·
                ${data.wins}
                victoires ·
                ${data.losses}
                défaites
            </small>
        </div>

    `;
}


/* =========================================================
   RESET
========================================================= */

function resetProgress() {

    showToast(
        "ℹ️ La progression est maintenant gérée par le compte."
    );
}


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "🌿 Jeux Ano V10 chargé."
        );


        updateUI();


        if (token) {

            const connected =
                await loadProfile();

            if (connected) {

                showToast(
                    "🌿 Progression synchronisée."
                );

            }

        }

    }
);


/* =========================================================
   API PUBLIQUE
========================================================= */

window.JeuxAno = {

    register,
    login,
    logout,

    loadProfile,

    playRPS,

    startNumberGame,
    guessNumber,

    useCalculator,

    resetProgress,

    updateUI,
    displayHistory

};