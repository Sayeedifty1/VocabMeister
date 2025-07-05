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

    // For better learning, prioritize words with more Quiz 1 mistakes and less practice
    const sortedVocabs = vocabs.sort((a, b) => {
      // First, prioritize words with Quiz 1 mistakes
      if (a.quiz1Mistakes !== b.quiz1Mistakes) {
        return b.quiz1Mistakes - a.quiz1Mistakes;
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
    // and words with more Quiz 2 unknown marks
    const sortedVocabs = vocabs.sort((a, b) => {
      // First, prioritize words with more Quiz 2 unknown marks
      if (a.quiz2UnknownCount !== b.quiz2UnknownCount) {
        return b.quiz2UnknownCount - a.quiz2UnknownCount;
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
        quiz1Mistakes: selectedVocab.quiz1Mistakes,
        quiz2UnknownCount: selectedVocab.quiz2UnknownCount,
        quiz2KnownCount: selectedVocab.quiz2KnownCount,
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

    console.log('Marking word as unknown:', { vocabId, userId });

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

    console.log('Found vocab item before update:', vocab);

    // Update the vocab item with Quiz 2 unknown tracking
    const updatedVocab = await prisma.vocab.update({
      where: { id: vocabId },
      data: { 
        quiz2UnknownCount: vocab.quiz2UnknownCount + 1,
        quiz2Attempts: vocab.quiz2Attempts + 1,
        practiceCount: vocab.practiceCount + 1,
        lastPracticed: new Date()
      }
    });

    console.log('Updated vocab item after marking unknown:', updatedVocab);

    res.json({ 
      message: 'Word marked as unknown',
      updatedQuiz2UnknownCount: updatedVocab.quiz2UnknownCount,
      updatedQuiz2Attempts: updatedVocab.quiz2Attempts,
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

    console.log('Marking word as known:', { vocabId, userId });

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

    console.log('Found vocab item before update:', vocab);

    // Update the vocab item with Quiz 2 known tracking
    const updatedVocab = await prisma.vocab.update({
      where: { id: vocabId },
      data: { 
        quiz2KnownCount: vocab.quiz2KnownCount + 1,
        quiz2Attempts: vocab.quiz2Attempts + 1,
        practiceCount: vocab.practiceCount + 1,
        lastPracticed: new Date()
      }
    });

    console.log('Updated vocab item after marking known:', updatedVocab);

    res.json({ 
      message: 'Word marked as known',
      updatedQuiz2KnownCount: updatedVocab.quiz2KnownCount,
      updatedQuiz2Attempts: updatedVocab.quiz2Attempts,
      updatedPracticeCount: updatedVocab.practiceCount
    });
  } catch (error) {
    console.error('Mark known error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit quiz answer (for Quiz 1)
router.post('/answer', async (req, res) => {
  try {
    const { vocabId, answer, questionType } = req.body;
    const userId = req.session.userId;

    console.log('Quiz answer submitted:', { vocabId, answer, questionType, userId });

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

    console.log('Found vocab item:', vocab);

    // Check if answer is correct
    const correctAnswer = questionType === 'english' ? vocab.english : vocab.bengali;
    const isCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    console.log('Answer check:', { 
      userAnswer: answer, 
      correctAnswer, 
      isCorrect 
    });

    // Update vocab item based on Quiz 1 result
    const updateData = {
      quiz1Attempts: vocab.quiz1Attempts + 1,
      practiceCount: vocab.practiceCount + 1,
      lastPracticed: new Date()
    };

    if (isCorrect) {
      updateData.quiz1CorrectAnswers = vocab.quiz1CorrectAnswers + 1;
    } else {
      updateData.quiz1Mistakes = vocab.quiz1Mistakes + 1;
    }

    console.log('Updating vocab with:', updateData);

    const updatedVocab = await prisma.vocab.update({
      where: { id: vocabId },
      data: updateData
    });

    console.log('Updated vocab item:', updatedVocab);

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
    
    // Quiz 1 statistics
    const totalQuiz1Mistakes = vocabs.reduce((sum, vocab) => sum + vocab.quiz1Mistakes, 0);
    const totalQuiz1CorrectAnswers = vocabs.reduce((sum, vocab) => sum + vocab.quiz1CorrectAnswers, 0);
    const totalQuiz1Attempts = vocabs.reduce((sum, vocab) => sum + vocab.quiz1Attempts, 0);
    const wordsWithQuiz1Mistakes = vocabs.filter(v => v.quiz1Mistakes > 0).length;
    
    // Quiz 2 statistics
    const totalQuiz2UnknownCount = vocabs.reduce((sum, vocab) => sum + vocab.quiz2UnknownCount, 0);
    const totalQuiz2KnownCount = vocabs.reduce((sum, vocab) => sum + vocab.quiz2KnownCount, 0);
    const totalQuiz2Attempts = vocabs.reduce((sum, vocab) => sum + vocab.quiz2Attempts, 0);
    const wordsWithQuiz2Unknown = vocabs.filter(v => v.quiz2UnknownCount > 0).length;
    
    // General statistics
    const totalPracticeCount = vocabs.reduce((sum, vocab) => sum + vocab.practiceCount, 0);

    res.json({
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
    });
  } catch (error) {
    console.error('Quiz stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 