const authScreen = document.getElementById("auth-screen");
const appScreen = document.getElementById("app-screen");
const accountForm = document.getElementById("account-form");

const displayName = document.getElementById("display-name");
const welcomeName = document.getElementById("welcome-name");
const userAvatar = document.getElementById("user-avatar");
const gamesCount = document.getElementById("games-count");

const gameMenu = document.getElementById("game-menu");
const gameArea = document.getElementById("game-area");
const gameContent = document.getElementById("game-content");
const backButton = document.getElementById("back-button");
const logoutButton = document.getElementById("logout-button");


/* =========================
   COMPTE
========================= */

function getAccount() {
    return JSON.parse(
        localStorage.getItem("jeuxAnoAccount")
    );
}


function saveAccount(account) {
    localStorage.setItem(
        "jeuxAnoAccount",
        JSON.stringify(account)
    );
}


function getGamesCount() {
    return Number(
        localStorage.getItem("jeuxAnoGames") || 0
    );
}


function incrementGames() {

    const count = getGamesCount() + 1;

    localStorage.setItem(
        "jeuxAnoGames",
        count
    );

    gamesCount.textContent = count;
}


function connect(account) {

    displayName.textContent = account.name;
    welcomeName.textContent = account.name;

    userAvatar.textContent =
        account.name.charAt(0).toUpperCase();

    gamesCount.textContent =
        getGamesCount();

    authScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
}


accountForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const name =
            document.getElementById("username")
                .value
                .trim();

        const email =
            document.getElementById("email")
                .value
                .trim();

        const password =
            document.getElementById("password")
                .value;


        const account = {
            name,
            email,
            password
        };


        saveAccount(account);

        connect(account);
    }
);


/* =========================
   DECONNEXION
========================= */

logoutButton.addEventListener(
    "click",
    () => {

        appScreen.classList.add("hidden");

        authScreen.classList.remove("hidden");

        accountForm.reset();

        showMenu();
    }
);


/* =========================
   MENU
========================= */

document.querySelectorAll(".game-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const game =
                    card.dataset.game;

                openGame(game);
            }
        );
    });


function openGame(game) {

    gameMenu.classList.add("hidden");

    gameArea.classList.remove("hidden");


    if (game === "rps") {
        renderRPS();
    }

    if (game === "number") {
        renderNumberGame();
    }

    if (game === "calculator") {
        renderCalculator();
    }
}


function showMenu() {

    gameArea.classList.add("hidden");

    gameMenu.classList.remove("hidden");

    gameContent.innerHTML = "";
}


backButton.addEventListener(
    "click",
    showMenu
);


/* =========================
   PIERRE FEUILLE CISEAUX
========================= */

let rpsScore = 0;
let rpsBotScore = 0;
let rpsRounds = 0;


function renderRPS() {

    rpsScore = 0;
    rpsBotScore = 0;
    rpsRounds = 0;


    gameContent.innerHTML = `

        <div class="game-panel">

            <div class="game-panel-header">

                <div class="big-icon">
                    ✊
                </div>

                <h2>
                    Pierre, feuille, ciseaux
                </h2>

                <p>
                    Premier à obtenir le meilleur score.
                </p>

            </div>


            <div class="rps-score">

                <div class="score-box">
                    <small>TOI</small>
                    <strong id="rps-player">
                        0
                    </strong>
                </div>

                <div class="score-box">
                    <small>BOT</small>
                    <strong id="rps-bot">
                        0
                    </strong>
                </div>

            </div>


            <div class="rps-buttons">

                <button
                    class="choice-button"
                    onclick="playRPS('pierre')"
                >
                    <span>✊</span>
                    <small>Pierre</small>
                </button>

                <button
                    class="choice-button"
                    onclick="playRPS('feuille')"
                >
                    <span>✋</span>
                    <small>Feuille</small>
                </button>

                <button
                    class="choice-button"
                    onclick="playRPS('ciseaux')"
                >
                    <span>✌️</span>
                    <small>Ciseaux</small>
                </button>

            </div>


            <div
                id="rps-message"
                class="hint"
            >
                Fais ton choix !
            </div>

        </div>
    `;
}


function playRPS(choice) {

    const choices = [
        "pierre",
        "feuille",
        "ciseaux"
    ];

    const bot =
        choices[
            Math.floor(
                Math.random() * choices.length
            )
        ];


    rpsRounds++;


    let result;


    if (choice === bot) {

        result =
            `Égalité ! Le bot a choisi ${bot}.`;

    }
    else if (
        (choice === "pierre" && bot === "ciseaux") ||
        (choice === "feuille" && bot === "pierre") ||
        (choice === "ciseaux" && bot === "feuille")
    ) {

        rpsScore++;

        result =
            `Gagné ! Le bot avait choisi ${bot}. 🏆`;

    }
    else {

        rpsBotScore++;

        result =
            `Perdu ! Le bot avait choisi ${bot}.`;
    }


    document.getElementById(
        "rps-player"
    ).textContent = rpsScore;


    document.getElementById(
        "rps-bot"
    ).textContent = rpsBotScore;


    document.getElementById(
        "rps-message"
    ).textContent =
        result;


    if (rpsRounds >= 5) {

        incrementGames();

        let final;

        if (rpsScore > rpsBotScore) {
            final = "🏆 Tu remportes la partie !";
        }
        else if (rpsScore < rpsBotScore) {
            final = "😢 Le bot remporte la partie.";
        }
        else {
            final = "🤝 Match nul !";
        }


        document.getElementById(
            "rps-message"
        ).textContent =
            `${final} ${rpsScore} - ${rpsBotScore}`;


        document.querySelectorAll(
            ".choice-button"
        ).forEach(button => {
            button.disabled = true;
            button.style.opacity = ".45";
        });
    }
}


/* =========================
   DEVINE LE NOMBRE
========================= */

let secretNumber;
let numberAttempts;


function renderNumberGame() {

    secretNumber =
        Math.floor(
            Math.random() * 1000
        ) + 1;

    numberAttempts = 0;


    gameContent.innerHTML = `

        <div class="game-panel">

            <div class="game-panel-header">

                <div class="big-icon">
                    🔢
                </div>

                <h2>
                    Devine le nombre
                </h2>

                <p>
                    Trouve le nombre secret entre 1 et 1000.
                </p>

            </div>


            <div class="number-form">

                <input
                    id="number-input"
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="Entre un nombre..."
                >

                <button
                    onclick="guessNumber()"
                >
                    Deviner
                </button>

                <div
                    id="number-hint"
                    class="hint"
                >
                    Tu as 10 essais.
                </div>

                <div
                    id="number-attempts"
                    class="attempts"
                >
                    Essais : 0 / 10
                </div>

            </div>

        </div>
    `;


    document
        .getElementById("number-input")
        .focus();
}


function guessNumber() {

    const input =
        document.getElementById(
            "number-input"
        );


    const guess =
        Number(input.value);


    if (
        !Number.isInteger(guess) ||
        guess < 1 ||
        guess > 1000
    ) {

        document.getElementById(
            "number-hint"
        ).textContent =
            "Entre un nombre entre 1 et 1000.";

        return;
    }


    numberAttempts++;


    const distance =
        Math.abs(
            secretNumber - guess
        );


    let message;


    if (guess === secretNumber) {

        incrementGames();

        message =
            `🏆 Bravo ! Le nombre était ${secretNumber}. Réussi en ${numberAttempts} essai(s).`;

        input.disabled = true;

        return setHint(message);
    }


    if (guess > secretNumber) {
        message = "⬇️ Plus petit !";
    }
    else {
        message = "⬆️ Plus grand !";
    }


    if (distance >= 500) {
        message += " 🥶 Très froid !";
    }
    else if (distance >= 200) {
        message += " ❄️ Froid !";
    }
    else if (distance >= 100) {
        message += " 🔥 Ça chauffe !";
    }
    else if (distance >= 50) {
        message += " 🥵 Tu chauffes beaucoup !";
    }
    else if (distance >= 20) {
        message += " 🧨 Très chaud !";
    }
    else {
        message += " 🔥🔥 Brûlant !";
    }


    setHint(message);


    document.getElementById(
        "number-attempts"
    ).textContent =
        `Essais : ${numberAttempts} / 10`;


    if (numberAttempts >= 10) {

        incrementGames();

        setHint(
            `😢 Terminé ! Le nombre était ${secretNumber}.`
        );

        input.disabled = true;
    }
}


function setHint(message) {

    document.getElementById(
        "number-hint"
    ).textContent =
        message;
}


/* =========================
   CALCULATRICE
========================= */

function renderCalculator() {

    gameContent.innerHTML = `

        <div class="game-panel">

            <div class="game-panel-header">

                <div class="big-icon">
                    🧮
                </div>

                <h2>
                    Calculatrice
                </h2>

                <p>
                    Effectue une opération rapidement.
                </p>

            </div>


            <div class="calculator-form">

                <div class="calc-row">

                    <input
                        id="calc-a"
                        type="number"
                        step="any"
                        placeholder="Premier nombre"
                    >

                    <input
                        id="calc-b"
                        type="number"
                        step="any"
                        placeholder="Second nombre"
                    >

                </div>


                <select id="calc-operation">

                    <option value="+">
                        Addition +
                    </option>

                    <option value="-">
                        Soustraction -
                    </option>

                    <option value="*">
                        Multiplication ×
                    </option>

                    <option value="/">
                        Division ÷
                    </option>

                    <option value="**">
                        Puissance ^
                    </option>

                </select>


                <button
                    onclick="calculate()"
                >
                    Calculer
                </button>


                <div
                    id="calc-result"
                    class="calc-result"
                >
                    Résultat : —
                </div>

            </div>

        </div>
    `;
}


function calculate() {

    const a =
        Number(
            document.getElementById("calc-a").value
        );

    const b =
        Number(
            document.getElementById("calc-b").value
        );

    const operation =
        document.getElementById(
            "calc-operation"
        ).value;


    if (!Number.isFinite(a) || !Number.isFinite(b)) {

        document.getElementById(
            "calc-result"
        ).textContent =
            "Entre deux nombres.";

        return;
    }


    let result;


    if (operation === "+") {
        result = a + b;
    }

    if (operation === "-") {
        result = a - b;
    }

    if (operation === "*") {
        result = a * b;
    }

    if (operation === "/") {

        if (b === 0) {

            document.getElementById(
                "calc-result"
            ).textContent =
                "Impossible de diviser par 0.";

            return;
        }

        result = a / b;
    }

    if (operation === "**") {
        result = a ** b;
    }


    incrementGames();


    document.getElementById(
        "calc-result"
    ).textContent =
        `Résultat : ${formatNumber(result)}`;
}


function formatNumber(value) {

    return new Intl.NumberFormat(
        "fr-FR",
        {
            maximumFractionDigits: 8
        }
    ).format(value);
}


/* =========================
   CONNEXION AUTOMATIQUE
========================= */

const savedAccount = getAccount();

if (savedAccount) {
    connect(savedAccount);
}