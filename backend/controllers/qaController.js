const asyncHandler = require('express-async-handler');
const Question = require('../models/Question');
const Product = require('../models/Product');

// @desc    Get questions for a product
// @route   GET /api/qa/:productId
// @access  Public
const getQuestionsForProduct = asyncHandler(async (req, res) => {
  const questions = await Question.find({ product: req.params.productId })
    .sort({ createdAt: -1 });

  res.json({ success: true, questions });
});

// @desc    Submit a question for a product (Customer)
// @route   POST /api/qa/:productId
// @access  Private
const askQuestion = asyncHandler(async (req, res) => {
  const { question } = req.body;
  const product = await Product.findById(req.params.productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!question || !question.trim()) {
    res.status(400);
    throw new Error('Please enter a valid question');
  }

  const newQuestion = new Question({
    product: product._id,
    user: req.user._id,
    userName: req.user.name,
    question: question.trim(),
  });

  const savedQuestion = await newQuestion.save();
  res.status(201).json({ success: true, question: savedQuestion });
});

// @desc    Answer a question (Admin)
// @route   PUT /api/qa/:id/answer
// @access  Private/Admin
const answerQuestion = asyncHandler(async (req, res) => {
  const { answer } = req.body;
  const qa = await Question.findById(req.params.id);

  if (!qa) {
    res.status(404);
    throw new Error('Question not found');
  }

  if (!answer || !answer.trim()) {
    res.status(400);
    throw new Error('Please enter an answer');
  }

  qa.answer = answer.trim();
  qa.isAnswered = true;
  qa.answeredBy = req.user.role === 'ADMIN' ? 'NexCart Verified Seller & Admin' : 'Store Manager';
  qa.answeredAt = new Date();

  const updatedQA = await qa.save();
  res.json({ success: true, question: updatedQA });
});

// @desc    Get all pending unanswered questions (Admin)
// @route   GET /api/qa/admin/pending
// @access  Private/Admin
const getUnansweredQuestionsAdmin = asyncHandler(async (req, res) => {
  const questions = await Question.find({ isAnswered: false })
    .populate('product', 'name slug images')
    .sort({ createdAt: -1 });

  res.json({ success: true, questions });
});

module.exports = {
  getQuestionsForProduct,
  askQuestion,
  answerQuestion,
  getUnansweredQuestionsAdmin,
};
