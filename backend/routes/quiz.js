const express = require('express');
const prisma = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get next quiz question
router.get('/next', async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get all user's vocabulary
    const vocabs = await prisma.vocab.findMany({
      where: { userId }
    });

    if (vocabs.length === 0) {
      return res.status(404).json({ error: 'No vocabulary items found. Please upload some vocabulary first.' });
    }

    // Select random vocab item
    const randomIndex = Math.floor(Math.random() * vocabs.length);
    const selectedVocab = vocabs[randomIndex];

    // Randomly choose between English and Bengali translation
    const isEnglish = Math.random() > 0.5;
    const correctAnswer = isEnglish ? selectedVocab.english : selectedVocab.bengali;
    const questionType = isEnglish ? 'english' : 'bengali';

    // Get 3 random wrong answers from other vocab items
    const otherVocabs = vocabs.filter(v => v.id !== selectedVocab.id);
    const wrongAnswers = [];
    
    if (otherVocabs.length >= 3) {
      const shuffled = otherVocabs.sort(() => 0.5 - Math.random());
      wrongAnswers.push(...shuffled.slice(0, 3).map(v => isEnglish ? v.english : v.bengali));
    } else {
      // If not enough other vocab items, add some generic answers
      const genericAnswers = isEnglish 
        ? ['To walk', 'To eat', 'To sleep']
        : ['হাঁটা', 'খাওয়া', 'ঘুমানো'];
      wrongAnswers.push(...genericAnswers.slice(0, 3 - otherVocabs.length));
      wrongAnswers.push(...otherVocabs.map(v => isEnglish ? v.english : v.bengali));
    }

    // Create answer options
    const options = [...wrongAnswers, correctAnswer];
    const shuffledOptions = options.sort(() => 0.5 - Math.random());

    res.json({
      question: {
        id: selectedVocab.id,
        german: selectedVocab.german,
        questionType,
        options: shuffledOptions
      }
    });
  } catch (error) {
    console.error('Next question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit quiz answer
router.post('/answer', async (req, res) => {
  try {
    const { vocabId, answer, questionType } = req.body;
    const userId = req.session.userId;

    if (!vocabId || !answer || !questionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the vocab item
    const vocab = await prisma.vocab.findFirst({
      where: { 
        id: vocabId,
        userId 
      }
    });

    if (!vocab) {
      return res.status(404).json({ error: 'Vocabulary item not found' });
    }

    // Check if answer is correct
    const correctAnswer = questionType === 'english' ? vocab.english : vocab.bengali;
    const isCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    // Update mistakes count if wrong
    if (!isCorrect) {
      await prisma.vocab.update({
        where: { id: vocabId },
        data: { mistakes: { increment: 1 } }
      });
    }

    res.json({
      isCorrect,
      correctAnswer,
      message: isCorrect ? 'Correct!' : 'Incorrect!'
    });
  } catch (error) {
    console.error('Answer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 