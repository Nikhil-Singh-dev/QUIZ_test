const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  quizTitle: { type: String, required: true },
  correctAnswers: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  answers: { type: [{ questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, selectedAnswer: Number, isCorrect: Boolean }], default: [] },
  timeTaken: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);