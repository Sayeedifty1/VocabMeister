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
    console.log('Stats requested for user:', userId);

    // Get all user's vocabulary
    const vocabs = await prisma.vocab.findMany({
      where: { userId }
    });

    console.log('Found vocabulary items:', vocabs.length);

    // Calculate statistics
    const totalVocabs = vocabs.length;
    
    // Quiz 1 statistics
    const totalQuiz1Mistakes = vocabs.reduce((sum, vocab) => sum + (vocab.quiz1Mistakes || 0), 0);
    const totalQuiz1CorrectAnswers = vocabs.reduce((sum, vocab) => sum + (vocab.quiz1CorrectAnswers || 0), 0);
    const totalQuiz1Attempts = vocabs.reduce((sum, vocab) => sum + (vocab.quiz1Attempts || 0), 0);
    const wordsWithQuiz1Mistakes = vocabs.filter(v => (v.quiz1Mistakes || 0) > 0).length;
    
    // Quiz 2 statistics
    const totalQuiz2UnknownCount = vocabs.reduce((sum, vocab) => sum + (vocab.quiz2UnknownCount || 0), 0);
    const totalQuiz2KnownCount = vocabs.reduce((sum, vocab) => sum + (vocab.quiz2KnownCount || 0), 0);
    const totalQuiz2Attempts = vocabs.reduce((sum, vocab) => sum + (vocab.quiz2Attempts || 0), 0);
    const wordsWithQuiz2Unknown = vocabs.filter(v => (v.quiz2UnknownCount || 0) > 0).length;
    
    // General statistics
    const totalPracticeCount = vocabs.reduce((sum, vocab) => sum + (vocab.practiceCount || 0), 0);

    const stats = {
      totalVocabs,
      
      // Quiz 1 stats
      totalQuiz1Mistakes,
      totalQuiz1CorrectAnswers,
      totalQuiz1Attempts,
      wordsWithQuiz1Mistakes,
      quiz1SuccessRate: totalQuiz1Attempts > 0 ? ((totalQuiz1CorrectAnswers / totalQuiz1Attempts) * 100).toFixed(2) : 0,
      
      // Quiz 2 stats
      totalQuiz2UnknownCount,
      totalQuiz2KnownCount,
      totalQuiz2Attempts,
      wordsWithQuiz2Unknown,
      quiz2SuccessRate: totalQuiz2Attempts > 0 ? ((totalQuiz2KnownCount / totalQuiz2Attempts) * 100).toFixed(2) : 0,
      
      // General stats
      totalPracticeCount,
      averageQuiz1Mistakes: totalVocabs > 0 ? (totalQuiz1Mistakes / totalVocabs).toFixed(2) : 0,
      averageQuiz2Unknown: totalVocabs > 0 ? (totalQuiz2UnknownCount / totalVocabs).toFixed(2) : 0
    };

    console.log('Calculated stats:', stats);

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 