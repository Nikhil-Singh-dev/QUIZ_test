# 📚 Quiz Master - Professional Quiz Platform

A fully-featured, responsive quiz platform with user authentication, real-time scoring, and animated result visualization. Perfect for educational assessments, certifications, and online testing.

## 🎯 Features

### Authentication & Security
- ✅ User signup and login with JWT authentication
- 🔐 Secure password hashing with bcryptjs
- 👤 User profile management
- 🚪 Session management with token-based auth

### Quiz Management
- 📝 Multiple choice questions
- ⏱️ Customizable time limits (auto-calculated based on questions)
- 📊 Question progress tracking
- 🎯 Answer review after completion
- 🔄 Retake quizzes anytime

### User Dashboard
- 📈 Statistics: tests taken, average score, best score, total correct answers
- 📚 Available quizzes display
- 📊 Recent results history with sortable table
- 👤 User profile information
- 🎨 Clean, intuitive interface

### Results & Visualization
- 🎨 Animated circular score display (0-100%)
- 🟢 Green for correct answers
- 🔴 Red for incorrect answers
- ⏱️ Time tracking and display
- 📋 Detailed answer review with correct/incorrect indicators
- 💾 Complete result history

### Responsive Design
- 📱 Mobile-first design (works perfectly on phones)
- 💻 Optimized for tablets and desktops
- 🎯 Touch-friendly interface
- ⚡ Fast loading and smooth animations

## 🏗️ Architecture

```
quiz-platform/
├── backend/
│   ├── server.js              # Express server with all routes
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment configuration
├── styles/
│   ├── auth.css              # Login/Signup styles
│   ├── dashboard.css         # Dashboard styles
│   ├── quiz.css              # Quiz page styles
│   └── results.css           # Results page styles
├── js/
│   ├── api.js                # API communication layer
│   ├── auth.js               # Authentication logic
│   ├── dashboard.js          # Dashboard functionality
│   ├── quiz.js               # Quiz logic
│   └── results.js            # Results display
├── login.html                # Login page
├── signup.html               # Signup page
├── dashboard.html            # User dashboard
├── quiz.html                 # Quiz interface
└── results.html              # Results page
```

## 🚀 Quick Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment**
```bash
# Edit .env file
MONGO_URI=mongodb://localhost:27017/quiz_platform
JWT_SECRET=your-secret-key-here
PORT=5000
```

3. **Start MongoDB** (if local)
```bash
# Windows
mongod

# macOS/Linux
brew services start mongodb-community
```

4. **Start Backend Server**
```bash
cd backend
npm start
# Server will run on http://localhost:5000
```

5. **Open Frontend**
- Open `signup.html` in your browser or use a local server
- Or use VS Code Live Server extension

### Using a Local Server (Recommended)

```bash
# Python 3
python -m http.server 8000

# Node.js http-server
npx http-server
```

Then visit: `http://localhost:8000/signup.html`

## 📝 Creating Your First Quiz

Use the API endpoint to create a quiz with questions. You can use a tool like Postman or curl:

```bash
curl -X POST http://localhost:5000/api/admin/quizzes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "HTML Fundamentals",
    "description": "Test your HTML knowledge",
    "questions": [
      {
        "questionText": "What does HTML stand for?",
        "options": [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Home Tool Markup Language",
          "Hyperlinks and Text Markup Language"
        ],
        "correctAnswer": 0
      },
      {
        "questionText": "Which is the correct way to create a hyperlink?",
        "options": [
          "<a href=\"https://example.com\">Link</a>",
          "<link url=\"https://example.com\">Link</link>",
          "<url=\"https://example.com\">Link</url>",
          "<hyperlink>https://example.com</hyperlink>"
        ],
        "correctAnswer": 0
      }
    ]
  }'
```

Or use the Node.js script below:

## 📱 Test Data Setup Script

Create a file `setup-data.js` in the backend folder:

```javascript
const axios = require('axios');

const sampleQuiz = {
  "title": "Web Development Fundamentals",
  "description": "Test your knowledge of HTML, CSS, and JavaScript basics",
  "questions": [
    {
      "questionText": "What does HTML stand for?",
      "options": [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Home Tool Markup Language",
        "Hyperlinks and Text Markup Language"
      ],
      "correctAnswer": 0
    },
    {
      "questionText": "Which HTML tag is used for the largest heading?",
      "options": ["<h6>", "<h1>", "<heading>", "<header>"],
      "correctAnswer": 1
    },
    {
      "questionText": "In CSS, what does the 'box-shadow' property do?",
      "options": [
        "Creates a shadow effect around an element",
        "Adds a border to an element",
        "Changes the color of text",
        "Creates an outline around text"
      ],
      "correctAnswer": 0
    },
    {
      "questionText": "What is the purpose of the 'DOCTYPE' declaration?",
      "options": [
        "Defines the document type and HTML version",
        "Creates a new document",
        "Sets the page background color",
        "Declares CSS styles"
      ],
      "correctAnswer": 0
    },
    {
      "questionText": "Which property is used to add space inside an element (between border and content)?",
      "options": ["margin", "padding", "spacing", "border"],
      "correctAnswer": 1
    }
  ]
};

async function setupData() {
  try {
    const response = await axios.post('http://localhost:5000/api/admin/quizzes', sampleQuiz);
    console.log('✓ Quiz created successfully!');
    console.log('Quiz ID:', response.data.quiz._id);
  } catch (error) {
    console.error('Error creating quiz:', error.response?.data || error.message);
  }
}

setupData();
```

Run with: `node setup-data.js`

## 🎮 User Flow

1. **Sign Up** → Create account → Login
2. **Dashboard** → View available quizzes and past results
3. **Take Quiz** → Answer questions with timer
4. **Review Answers** → See correct/incorrect indicators
5. **View Results** → Animated score circle with detailed stats
6. **Retake** → Option to retake quiz anytime

## 🎨 Customization

### Change Colors
Edit the CSS root variables in any `.css` file:

```css
:root {
    --primary-color: #2ECC71;      /* Green - Success/Primary */
    --secondary-color: #3498DB;    /* Blue - Secondary */
    --danger-color: #E74C3C;       /* Red - Errors/Incorrect */
    --warning-color: #F39C12;      /* Orange - Warnings */
}
```

### Change Time Limit
In `js/quiz.js`, modify:
```javascript
timeLimit = Math.ceil(quizQuestions.length * 1.5 * 60); // 1.5 minutes per question
```

### Add More Questions Types
The current system supports multiple-choice. To add other types:
1. Update the Question schema in `backend/server.js`
2. Add form fields in `quiz.html`
3. Update quiz.js logic

## 📊 Database Schema

### Users
```json
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique),
  "password": String (hashed),
  "createdAt": Date
}
```

### Quizzes
```json
{
  "_id": ObjectId,
  "title": String,
  "description": String,
  "totalQuestions": Number,
  "createdAt": Date
}
```

### Questions
```json
{
  "_id": ObjectId,
  "quizId": ObjectId,
  "questionText": String,
  "options": [String],
  "correctAnswer": Number,
  "questionNumber": Number
}
```

### Results
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "quizId": ObjectId,
  "quizTitle": String,
  "correctAnswers": Number,
  "totalQuestions": Number,
  "score": Number (0-100),
  "answers": [{questionId, selectedAnswer, isCorrect}],
  "timeTaken": Number (seconds),
  "completedAt": Date
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Quizzes
- `GET /api/quizzes` - Get all available quizzes
- `GET /api/quizzes/:quizId` - Get quiz with questions

### Results
- `POST /api/results/submit` - Submit quiz answers
- `GET /api/results` - Get user's all results (requires token)
- `GET /api/results/:resultId` - Get specific result (requires token)

### Admin
- `POST /api/admin/quizzes` - Create new quiz

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB is running
- Check MONGO_URI in .env
- For MongoDB Atlas: verify connection string and IP whitelist

### "CORS error"
- Backend should handle this already
- Check backend is running on port 5000
- Verify API_BASE_URL in `js/api.js` matches your backend

### "Quiz not loading"
- Check browser console for errors
- Verify quiz exists via GET /api/quizzes
- Clear browser cache and refresh

### "Timer issues"
- Check browser time sync
- Try different browser
- Restart backend server

## 📈 Performance Tips

1. **Optimize Images** - Use WebP format for faster loading
2. **Lazy Loading** - Implement for large result sets
3. **Caching** - Use browser cache for CSS/JS
4. **Database Indexing** - Add indexes on userId and quizId
5. **API Rate Limiting** - Implement in production

## 🔒 Security Considerations

⚠️ **Before Production:**
1. Change JWT_SECRET to a strong random key
2. Add HTTPS/SSL
3. Implement rate limiting
4. Add input validation on backend
5. Use environment variables for sensitive data
6. Add CORS whitelist
7. Implement user role-based access
8. Add quiz access controls

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### Deploy Backend (Heroku Example)

```bash
cd backend
heroku create your-app-name
heroku config:set MONGO_URI=your-mongodb-url
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

### Deploy Frontend (Netlify Example)

```bash
# Build if using build tools, or just upload files directly
netlify deploy --prod --dir=.
```

Update `API_BASE_URL` in `js/api.js` to your deployed backend URL.

## 📞 Support & Contact

Made with ❤️ by Nikhil Singh

For issues, suggestions, or contributions:
- Check the console for errors
- Review API responses in Network tab
- Verify all environment variables

## 📄 License

MIT License - Feel free to use for personal and commercial projects!

---

**Happy Quizzing! 🎉**
