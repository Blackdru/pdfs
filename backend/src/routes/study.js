const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');
const { requireFeature } = require('../middleware/subscriptionMiddleware');
const aiService = require('../services/aiService');

const router = express.Router();

// Generate flashcards from document
router.post('/flashcards/generate', 
  authenticateUser, 
  requireFeature('ai_features'),
  async (req, res) => {
  try {
    const { fileId, count = 10, difficulty = 'medium' } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    // Get file with extracted text
    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!file.extracted_text) {
      return res.status(400).json({ 
        error: 'No text content found. Please run OCR first.',
        needsOCR: true
      });
    }

    if (!aiService.isEnabled()) {
      return res.status(503).json({ error: 'AI features are not enabled' });
    }

    // Generate flashcards using AI
    const prompt = `Generate ${count} flashcards from the following text. Each flashcard should have a clear question and a concise answer. Format as JSON array with objects containing "question", "answer", and "difficulty" (easy/medium/hard) fields.

Text:
${file.extracted_text.substring(0, 3000)}

Return only the JSON array, no additional text.`;

    const response = await aiService.openai.chat.completions.create({
      model: aiService.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator who creates effective study flashcards. Generate clear, concise flashcards that help students learn key concepts.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    let flashcards = [];
    try {
      const content = response.choices[0].message.content.trim();
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error('Error parsing flashcards:', parseError);
      // Fallback flashcards
      flashcards = [
        {
          question: 'What is the main topic of this document?',
          answer: 'Review the document summary for the main topic.',
          difficulty: 'easy'
        }
      ];
    }

    // Store flashcards in database
    const flashcardRecords = flashcards.map((card, index) => ({
      user_id: req.user.id,
      file_id: fileId,
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty || difficulty,
      order_index: index,
      created_at: new Date().toISOString()
    }));

    const { data: savedFlashcards, error: saveError } = await supabaseAdmin
      .from('flashcards')
      .insert(flashcardRecords)
      .select();

    if (saveError) {
      console.error('Error saving flashcards:', saveError);
      // Return generated flashcards even if save fails
    }

    res.json({
      message: 'Flashcards generated successfully',
      flashcards: savedFlashcards || flashcards,
      count: flashcards.length
    });

  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate flashcards' });
  }
});

// Get flashcards for a document
router.get('/flashcards/:fileId', authenticateUser, async (req, res) => {
  try {
    const { fileId } = req.params;

    const { data: flashcards, error } = await supabaseAdmin
      .from('flashcards')
      .select('*')
      .eq('file_id', fileId)
      .eq('user_id', req.user.id)
      .order('order_index', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({ flashcards });

  } catch (error) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch flashcards' });
  }
});

// Generate quiz from document
router.post('/quiz/generate', 
  authenticateUser, 
  requireFeature('ai_features'),
  async (req, res) => {
  try {
    const { fileId, questionCount = 5, difficulty = 'medium', questionType = 'multiple-choice' } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    // Get file with extracted text
    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', req.user.id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!file.extracted_text) {
      return res.status(400).json({ 
        error: 'No text content found. Please run OCR first.',
        needsOCR: true
      });
    }

    if (!aiService.isEnabled()) {
      return res.status(503).json({ error: 'AI features are not enabled' });
    }

    // Generate quiz using AI
    const prompt = `Generate ${questionCount} ${questionType} quiz questions from the following text. Each question should test understanding of key concepts.

For multiple-choice questions, provide 4 options with one correct answer.
Format as JSON array with objects containing:
- "question": the question text
- "type": "${questionType}"
- "options": array of 4 options (for multiple-choice)
- "correctAnswer": the correct answer
- "explanation": brief explanation of the correct answer

Text:
${file.extracted_text.substring(0, 3000)}

Return only the JSON array, no additional text.`;

    const response = await aiService.openai.chat.completions.create({
      model: aiService.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator who creates effective quiz questions. Generate clear questions that test understanding of key concepts.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    let questions = [];
    try {
      const content = response.choices[0].message.content.trim();
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error('Error parsing quiz questions:', parseError);
      // Fallback questions
      questions = [
        {
          question: 'What is the main topic discussed in this document?',
          type: 'multiple-choice',
          options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'],
          correctAnswer: 'Topic A',
          explanation: 'Review the document for the main topic.'
        }
      ];
    }

    // Create quiz record
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from('quizzes')
      .insert({
        user_id: req.user.id,
        file_id: fileId,
        title: `Quiz for ${file.filename}`,
        difficulty: difficulty,
        total_questions: questions.length,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (quizError) {
      console.error('Error creating quiz:', quizError);
    }

    // Store quiz questions
    if (quiz) {
      const questionRecords = questions.map((q, index) => ({
        quiz_id: quiz.id,
        question: q.question,
        type: q.type,
        options: q.options,
        correct_answer: q.correctAnswer,
        explanation: q.explanation,
        order_index: index
      }));

      const { error: questionsError } = await supabaseAdmin
        .from('quiz_questions')
        .insert(questionRecords);

      if (questionsError) {
        console.error('Error saving quiz questions:', questionsError);
      }
    }

    res.json({
      message: 'Quiz generated successfully',
      quiz: {
        id: quiz?.id,
        questions: questions,
        totalQuestions: questions.length
      }
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// Get quiz by ID
router.get('/quiz/:quizId', authenticateUser, async (req, res) => {
  try {
    const { quizId } = req.params;

    const { data: quiz, error: quizError } = await supabaseAdmin
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .eq('user_id', req.user.id)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (questionsError) {
      throw questionsError;
    }

    res.json({
      quiz: {
        ...quiz,
        questions
      }
    });

  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch quiz' });
  }
});

// Submit quiz answers
router.post('/quiz/:quizId/submit', authenticateUser, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // { questionId: answer }

    // Get quiz questions
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId);

    if (questionsError) {
      throw questionsError;
    }

    // Calculate score
    let correctCount = 0;
    const results = questions.map(q => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correct_answer;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        question: q.question,
        userAnswer,
        correctAnswer: q.correct_answer,
        isCorrect,
        explanation: q.explanation
      };
    });

    const score = (correctCount / questions.length) * 100;

    // Update quiz with score
    await supabaseAdmin
      .from('quizzes')
      .update({
        score: score,
        completed_at: new Date().toISOString()
      })
      .eq('id', quizId);

    res.json({
      message: 'Quiz submitted successfully',
      score: score,
      correctCount: correctCount,
      totalQuestions: questions.length,
      results: results
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: error.message || 'Failed to submit quiz' });
  }
});

module.exports = router;
