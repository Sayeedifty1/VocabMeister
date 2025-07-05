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

    // For better learning, prioritize words with more mistakes and less practice
    const sortedVocabs = vocabs.sort((a, b) => {
      // First, prioritize words with mistakes
      if (a.mistakes !== b.mistakes) {
        return b.mistakes - a.mistakes;
      }
      // Then, prioritize words that haven't been practiced recently
      if (a.lastPracticed !== b.lastPracticed) {
        if (!a.lastPracticed) return -1;
        if (!b.lastPracticed) return 1;
        return a.lastPracticed.getTime() - b.lastPracticed.getTime();
      }
      // Finally, randomize among words with same priority
      return Math.random() - 0.5;
    });

    // Select from the top 70% of words (prioritizing difficult ones)
    const selectionPool = sortedVocabs.slice(0, Math.ceil(sortedVocabs.length * 0.7));
    const randomIndex = Math.floor(Math.random() * selectionPool.length);
    const selectedVocab = selectionPool[randomIndex];

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

// Get next card for Quiz 2 (swipe game)
router.get('/next-card', async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get all user's vocabulary
    const vocabs = await prisma.vocab.findMany({
      where: { userId }
    });

    if (vocabs.length === 0) {
      return res.status(404).json({ error: 'No vocabulary items found. Please upload some vocabulary first.' });
    }

    // For Quiz 2, prioritize words that haven't been practiced recently
    // and words with more mistakes (unknown words)
    const sortedVocabs = vocabs.sort((a, b) => {
      // First, prioritize words with mistakes (unknown words)
      if (a.mistakes !== b.mistakes) {
        return b.mistakes - a.mistakes;
      }
      // Then, prioritize words that haven't been practiced recently
      if (a.lastPracticed !== b.lastPracticed) {
        if (!a.lastPracticed) return -1;
        if (!b.lastPracticed) return 1;
        return a.lastPracticed.getTime() - b.lastPracticed.getTime();
      }
      // Finally, randomize among words with same priority
      return Math.random() - 0.5;
    });

    // Select a random word from the vocabulary
    const randomIndex = Math.floor(Math.random() * sortedVocabs.length);
    const selectedVocab = sortedVocabs[randomIndex];

    res.json({
      card: {
        id: selectedVocab.id,
        german: selectedVocab.german,
        english: selectedVocab.english,
        bengali: selectedVocab.bengali,
        mistakes: selectedVocab.mistakes,
        practiceCount: selectedVocab.practiceCount,
        lastPracticed: selectedVocab.lastPracticed
      }
    });
  } catch (error) {
    console.error('Next card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark word as unknown (for Quiz 2)
router.post('/mark-unknown', async (req, res) => {
  try {
    const { vocabId } = req.body;
    const userId = req.session.userId;

    if (!vocabId) {
      return res.status(400).json({ error: 'Missing vocabId' });
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

    // Update the vocab item with unknown tracking
    const updatedVocab = await prisma.vocab.update({
      where: { id: vocabId },
      data: { 
        mistakes: { increment: 1 },
        unknownCount: { increment: 1 },
        practiceCount: { increment: 1 },
        lastPracticed: new Date()
      }
    });

    res.json({ 
      message: 'Word marked as unknown',
      updatedMistakes: updatedVocab.mistakes,
      updatedUnknownCount: updatedVocab.unknownCount,
      updatedPracticeCount: updatedVocab.practiceCount
    });
  } catch (error) {
    console.error('Mark unknown error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark word as known (for Quiz 2)
router.post('/mark-known', async (req, res) => {
  try {
    const { vocabId } = req.body;
    const userId = req.session.userId;

    if (!vocabId) {
      return res.status(400).json({ error: 'Missing vocabId' });
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

    // Update the vocab item with known tracking
    const updatedVocab = await prisma.vocab.update({
      where: { id: vocabId },
      data: { 
        knownCount: { increment: 1 },
        practiceCount: { increment: 1 },
        lastPracticed: new Date()
      }
    });

    res.json({ 
      message: 'Word marked as known',
      updatedKnownCount: updatedVocab.knownCount,
      updatedPracticeCount: updatedVocab.practiceCount
    });
  } catch (error) {
    console.error('Mark known error:', error);
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

    // Update vocab item based on result
    const updateData = {
      practiceCount: { increment: 1 },
      lastPracticed: new Date()
    };

    if (isCorrect) {
      updateData.knownCount = { increment: 1 };
    } else {
      updateData.mistakes = { increment: 1 };
      updateData.unknownCount = { increment: 1 };
    }

    await prisma.vocab.update({
      where: { id: vocabId },
      data: updateData
    });

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

// Get quiz statistics for the user
router.get('/stats', async (req, res) => {
  try {
    const userId = req.session.userId;

    const vocabs = await prisma.vocab.findMany({
      where: { userId }
    });

    const totalVocabs = vocabs.length;
    const totalMistakes = vocabs.reduce((sum, vocab) => sum + vocab.mistakes, 0);
    const wordsWithMistakes = vocabs.filter(v => v.mistakes > 0).length;
    const totalPracticeCount = vocabs.reduce((sum, vocab) => sum + vocab.practiceCount, 0);
    const totalKnownCount = vocabs.reduce((sum, vocab) => sum + vocab.knownCount, 0);
    const totalUnknownCount = vocabs.reduce((sum, vocab) => sum + vocab.unknownCount, 0);

    res.json({
      totalVocabs,
      totalMistakes,
      wordsWithMistakes,
      totalPracticeCount,
      totalKnownCount,
      totalUnknownCount,
      averageMistakes: totalVocabs > 0 ? (totalMistakes / totalVocabs).toFixed(2) : 0,
      successRate: totalPracticeCount > 0 ? ((totalKnownCount / totalPracticeCount) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Quiz stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 