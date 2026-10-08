"use strict";

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET =
    process.env.JWT_SECRET || "jeux-ano-v10-secret-change-moi";

const db = new Database(
    path.join(__dirname, "jeux-ano.db")
);

/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(cors());
app.use(express.json());

/* =====================================================
   BASE DE DONNÉES
===================================================== */

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        games_played INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        draws INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

/* =====================================================
   AUTHENTIFICATION
===================================================== */

function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email
        },
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

function authenticate(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentification requise."
        });
    }

    const token = header.substring(7);

    try {
        req.user = jwt.verify(
            token,
            JWT_SECRET
        );

        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Session expirée."
        });
    }
}

/* =====================================================
   ROUTE TEST
===================================================== */

app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "🌿 API Jeux Ano V10 opérationnelle."
    });
});

/* =====================================================
   INSCRIPTION
===================================================== */

app.post("/api/register", async (req, res) => {
    try {
        const {
            username,
            email,
            password
        } = req.body;

        if (
            !username ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Tous les champs sont obligatoires."
            });
        }

        if (password.length < 4) {
            return res.status(400).json({
                success: false,
                message: "Le mot de passe doit contenir au moins 4 caractères."
            });
        }

        const existing = db.prepare(`
            SELECT id
            FROM users
            WHERE username = ? OR email = ?
        `).get(
            username.trim(),
            email.trim().toLowerCase()
        );

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Ce pseudo ou cet email existe déjà."
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );

        const result = db.prepare(`
            INSERT INTO users (
                username,
                email,
                password
            )
            VALUES (?, ?, ?)
        `).run(
            username.trim(),
            email.trim().toLowerCase(),
            hashedPassword
        );

        const user = db.prepare(`
            SELECT
                id,
                username,
                email,
                xp,
                level,
                games_played,
                wins,
                losses,
                draws
            FROM users
            WHERE id = ?
        `).get(result.lastInsertRowid);

        const token =
            createToken(user);

        res.status(201).json({
            success: true,
            message: "Compte créé !",
            token,
            user
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Erreur serveur."
        });
    }
});

/* =====================================================
   CONNEXION
===================================================== */

app.post("/api/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email et mot de passe requis."
            });
        }

        const user = db.prepare(`
            SELECT *
            FROM users
            WHERE email = ?
        `).get(
            email.trim().toLowerCase()
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect."
            });
        }

        const valid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect."
            });
        }

        const token =
            createToken(user);

        delete user.password;

        res.json({
            success: true,
            message: "Connexion réussie !",
            token,
            user
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Erreur serveur."
        });
    }
});

/* =====================================================
   PROFIL
===================================================== */

app.get(
    "/api/profile",
    authenticate,
    (req, res) => {

        const user = db.prepare(`
            SELECT
                id,
                username,
                email,
                xp,
                level,
                games_played,
                wins,
                losses,
                draws,
                created_at
            FROM users
            WHERE id = ?
        `).get(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur introuvable."
            });
        }

        res.json({
            success: true,
            user
        });
    }
);

/* =====================================================
   SAUVEGARDE DES STATISTIQUES
===================================================== */

app.post(
    "/api/stats",
    authenticate,
    (req, res) => {

        const {
            result
        } = req.body;

        if (
            ![
                "win",
                "loss",
                "draw"
            ].includes(result)
        ) {
            return res.status(400).json({
                success: false,
                message: "Résultat invalide."
            });
        }

        let xp = 10;

        if (result === "win") {
            xp = 25;
        }

        if (result === "draw") {
            xp = 15;
        }

        const user =
            db.prepare(`
                SELECT *
                FROM users
                WHERE id = ?
            `).get(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur introuvable."
            });
        }

        let newXP =
            user.xp + xp;

        let newLevel =
            user.level;

        let requiredXP =
            newLevel * 100;

        while (
            newXP >= requiredXP
        ) {
            newXP -= requiredXP;
            newLevel++;
            requiredXP =
                newLevel * 100;
        }

        let wins =
            user.wins;

        let losses =
            user.losses;

        let draws =
            user.draws;

        if (result === "win") {
            wins++;
        }

        if (result === "loss") {
            losses++;
        }

        if (result === "draw") {
            draws++;
        }

        const gamesPlayed =
            user.games_played + 1;

        db.prepare(`
            UPDATE users
            SET
                xp = ?,
                level = ?,
                games_played = ?,
                wins = ?,
                losses = ?,
                draws = ?
            WHERE id = ?
        `).run(
            newXP,
            newLevel,
            gamesPlayed,
            wins,
            losses,
            draws,
            req.user.id
        );

        res.json({
            success: true,
            message: "Statistiques sauvegardées.",
            stats: {
                xp: newXP,
                level: newLevel,
                gamesPlayed,
                wins,
                losses,
                draws
            }
        });
    }
);

/* =====================================================
   DÉMARRAGE
===================================================== */

app.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log("");
        console.log(
            "🌿 ==============================="
        );
        console.log(
            "🌿      JEUX ANO V10 - BACKEND"
        );
        console.log(
            "🌿 ==============================="
        );
        console.log(
            `🌿 Serveur : http://localhost:${PORT}`
        );
        console.log(
            "🌿 Base de données : SQLite"
        );
        console.log(
            "🌿 API prête !"
        );
        console.log("");
    }
);