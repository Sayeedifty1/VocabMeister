const express = require('express');
const prisma = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get user statistics
router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get all user's vocabulary with mistakes
    const vocabs = await prisma.vocab.findMany({
      where: { userId },
      orderBy: { mistakes: 'desc' }
    });

    // Calculate statistics
    const totalVocabs = vocabs.length;
    const totalMistakes = vocabs.reduce((sum, vocab) => sum + vocab.mistakes, 0);
    const mostMistakenWords = vocabs
      .filter(vocab => vocab.mistakes > 0)
      .slice(0, 10)
      .map(vocab => ({
        german: vocab.german,
        english: vocab.english,
        bengali: vocab.bengali,
        mistakes: vocab.mistakes
      }));

    res.json({
      totalVocabs,
      totalMistakes,
      mostMistakenWords
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 