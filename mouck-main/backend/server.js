const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI?.trim();
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing. Please set it in backend/.env or in the environment variables.');
  process.exit(1);
}

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Import models
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Question = require('./models/Question');
const Result = require('./models/Result');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// JWT Authentication Middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// ==================== AUTHENTICATION ROUTES ====================

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email ? email.toLowerCase() : '';

        if (!name || !normalizedEmail || !password) {
            return res.status(400).json({ message: 'All fields required' });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = normalizedEmail === 'tn8673436@gmail.com' ? 'admin' : 'user';
        const newUser = new User({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role,
            profilePic: '',
            bio: ''
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, profilePic: newUser.profilePic, bio: newUser.bio }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email ? email.toLowerCase() : '';

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        let role = user.role || 'user';
        if (user.email === 'tn8673436@gmail.com') {
            role = 'admin';
            user.role = 'admin';
        }

        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, role, profilePic: user.profilePic, bio: user.bio }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get current user profile
app.get('/api/auth/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Transform _id to id for consistency
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            bio: user.bio,
            role: user.role
        };

        res.json({ user: userData });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
app.put('/api/auth/profile', verifyToken, async (req, res) => {
    try {
        const { name, email, bio } = req.body;
        const userId = req.userId;

        // Check if email is being changed and if it's already taken
        if (email) {
            const normalizedEmail = email.toLowerCase();
            const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email.toLowerCase();
        if (bio !== undefined) updateData.bio = bio;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Transform _id to id for consistency
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            bio: user.bio,
            role: user.role
        };

        res.json({
            message: 'Profile updated successfully',
            user: userData
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Upload profile picture
app.post('/api/upload/profile-picture', verifyToken, upload.single('profilePic'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        // Update user's profile picture
        const user = await User.findByIdAndUpdate(
            req.userId,
            { profilePic: imageUrl },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile picture uploaded successfully',
            imageUrl: imageUrl,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                bio: user.bio,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ==================== USER ROUTES ====================

// Search users
app.get('/api/users/search', verifyToken, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.json({ users: [] });
        }

        const users = await User.find({
            name: { $regex: q.trim(), $options: 'i' }
        }).select('name email profilePic bio').limit(10);

        // Transform _id to id for consistency
        const transformedUsers = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            bio: user.bio
        }));

        res.json({ users: transformedUsers });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user profile by ID
app.get('/api/users/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name email profilePic bio role');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's quiz results
        const results = await Result.find({ userId: req.params.id })
            .sort({ completedAt: -1 })
            .limit(10)
            .select('quizTitle score correctAnswers totalQuestions completedAt');

        // Transform _id to id for consistency with auth endpoints
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            bio: user.bio,
            role: user.role
        };

        res.json({ user: userData, results });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== QUIZ ROUTES ====================

// Get All Quizzes
app.get('/api/quizzes', async (req, res) => {
    try {
        const quizList = await Quiz.find();
        res.json(quizList);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Quiz with Questions
app.get('/api/quizzes/:quizId', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const includeAnswers = req.query.includeAnswers === 'true';
        const quizQuestions = await Question.find({ quizId: req.params.quizId }).sort({ questionNumber: 1 });
        const filteredQuestions = includeAnswers
            ? quizQuestions
            : quizQuestions.map(q => {
                const question = q.toObject();
                delete question.correctAnswer;
                return question;
            });

        res.json({
            quiz,
            questions: filteredQuestions
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== RESULT ROUTES ====================

// Submit Quiz Answers
app.post('/api/results/submit', verifyToken, async (req, res) => {
    try {
        const { quizId, answers, timeTaken } = req.body;

        if (!quizId || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Quiz id and answers are required' });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const allAnswers = await Question.find({ quizId });

        let correctCount = 0;
        const resultAnswers = [];

        for (const answer of answers) {
            const questionData = allAnswers.find(q => q._id.toString() === answer.questionId);
            const isCorrect = questionData && questionData.correctAnswer === answer.selectedAnswer;
            if (isCorrect) correctCount++;
            resultAnswers.push({
                questionId: answer.questionId,
                selectedAnswer: answer.selectedAnswer,
                isCorrect
            });
        }

        const score = allAnswers.length > 0 ? Math.round((correctCount / allAnswers.length) * 100) : 0;

        const result = new Result({
            userId: req.userId,
            quizId,
            quizTitle: quiz.title,
            correctAnswers: correctCount,
            totalQuestions: allAnswers.length,
            score,
            answers: resultAnswers,
            timeTaken
        });

        await result.save();

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get User's All Results
app.get('/api/results', verifyToken, async (req, res) => {
    try {
        const userResults = await Result.find({ userId: req.userId }).sort({ completedAt: -1 });
        res.json(userResults);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Specific Result
app.get('/api/results/:resultId', verifyToken, async (req, res) => {
    try {
        const result = await Result.findById(req.params.resultId);
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create Quiz (Admin)
app.post('/api/admin/quizzes', async (req, res) => {
    try {
        const { title, description, questions } = req.body;

        const quiz = new Quiz({
            title,
            description,
            totalQuestions: questions.length
        });

        await quiz.save();

        // Add questions
        for (let i = 0; i < questions.length; i++) {
            const question = new Question({
                quizId: quiz._id,
                questionText: questions[i].questionText,
                options: questions[i].options,
                correctAnswer: questions[i].correctAnswer,
                questionNumber: i + 1
            });
            await question.save();
        }

        res.status(201).json({ message: 'Quiz created', quiz });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📚 Quiz Platform Backend Active`);
});