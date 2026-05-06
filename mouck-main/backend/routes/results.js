const express = require('express');
const router = express.Router();
const Result = require('../models/Result');

// ================= SAVE RESULT =================
router.post('/submit', async (req, res) => {
    try {
        const result = await Result.create(req.body);

        console.log("✅ RESULT SAVED");

        res.json(result); // ✅ IMPORTANT
    } catch (error) {
        console.error("❌ Error saving result:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ================= GET ALL RESULTS =================
router.get('/', async (req, res) => {
    try {
        const results = await Result.find().sort({ createdAt: -1 });

        res.json(results); // ✅ IMPORTANT
    } catch (error) {
        console.error("❌ Error fetching results:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ================= GET SINGLE RESULT =================
router.get('/:id', async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);

        if (!result) {
            return res.status(404).json({ message: "Result not found" });
        }

        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching result:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;