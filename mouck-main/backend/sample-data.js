// Sample Quiz Data - Run this after starting the backend
// Usage: node sample-data.js

const axios = require('axios');

const sampleQuizzes = [
  {
    title: "Web Development Fundamentals",
    description: "Test your knowledge of HTML, CSS, and JavaScript basics",
    questions: [
      {
        questionText: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Home Tool Markup Language",
          "Hyperlinks and Text Markup Language"
        ],
        correctAnswer: 0
      },
      {
        questionText: "Which HTML tag is used for the largest heading?",
        options: ["<h6>", "<h1>", "<heading>", "<header>"],
        correctAnswer: 1
      },
      {
        questionText: "In CSS, what does the 'box-shadow' property do?",
        options: [
          "Creates a shadow effect around an element",
          "Adds a border to an element",
          "Changes the color of text",
          "Creates an outline around text"
        ],
        correctAnswer: 0
      },
      {
        questionText: "What is the purpose of the 'DOCTYPE' declaration?",
        options: [
          "Defines the document type and HTML version",
          "Creates a new document",
          "Sets the page background color",
          "Declares CSS styles"
        ],
        correctAnswer: 0
      },
      {
        questionText: "Which property is used to add space inside an element?",
        options: ["margin", "padding", "spacing", "border"],
        correctAnswer: 1
      },
      {
        questionText: "What is the correct way to create a comment in JavaScript?",
        options: [
          "// This is a comment",
          "<!-- This is a comment -->",
          "# This is a comment",
          "** This is a comment **"
        ],
        correctAnswer: 0
      },
      {
        questionText: "Which selector in CSS targets elements by class name?",
        options: ["#className", ".className", ":className", "-className"],
        correctAnswer: 1
      },
      {
        questionText: "What does the 'float' property do in CSS?",
        options: [
          "Makes elements float in the middle of the page",
          "Removes elements from the normal flow and aligns them left/right",
          "Creates animation effects",
          "Adds elevation to elements"
        ],
        correctAnswer: 1
      },
      {
        questionText: "In JavaScript, what is the difference between 'let' and 'var'?",
        options: [
          "No difference - they are the same",
          "'let' is block-scoped while 'var' is function-scoped",
          "'let' is function-scoped while 'var' is block-scoped",
          "'let' cannot be redeclared while 'var' can be"
        ],
        correctAnswer: 1
      },
      {
        questionText: "What is the purpose of a meta tag in HTML?",
        options: [
          "To define metadata about the HTML document",
          "To create menu items",
          "To link external JavaScript files",
          "To define the main content area"
        ],
        correctAnswer: 0
      }
    ]
  },
  {
    title: "JavaScript Advanced Concepts",
    description: "Test your knowledge of advanced JavaScript features",
    questions: [
      {
        questionText: "What is a closure in JavaScript?",
        options: [
          "A function that has access to the outer function's variables",
          "A way to close a JavaScript file",
          "A type of loop",
          "A debugging tool"
        ],
        correctAnswer: 0
      },
      {
        questionText: "What does the 'this' keyword refer to?",
        options: [
          "The current object",
          "Always refers to the global window object",
          "A function keyword",
          "A CSS property"
        ],
        correctAnswer: 0
      },
      {
        questionText: "What is the difference between == and ===?",
        options: [
          "They are the same",
          "'==' checks type while '===' checks value",
          "'===' checks type and value while '==' only checks value",
          "'==' is used for strings and '===' for numbers"
        ],
        correctAnswer: 2
      },
      {
        questionText: "What is a Promise in JavaScript?",
        options: [
          "A guarantee that something will happen",
          "An object representing eventual completion or failure of async operation",
          "A function that promises to work",
          "A type of variable"
        ],
        correctAnswer: 1
      },
      {
        questionText: "What is destructuring in JavaScript?",
        options: [
          "Breaking down an object or array into individual variables",
          "Deleting data from an object",
          "A way to break JavaScript code",
          "A performance optimization technique"
        ],
        correctAnswer: 0
      }
    ]
  },
  {
    title: "React Fundamentals",
    description: "Test your React knowledge with these fundamental questions",
    questions: [
      {
        questionText: "What is JSX?",
        options: [
          "Java Syntax Extension",
          "A syntax extension that looks similar to HTML written in JavaScript",
          "A type of variable",
          "A React library"
        ],
        correctAnswer: 1
      },
      {
        questionText: "What are React components?",
        options: [
          "CSS classes",
          "Reusable pieces of UI that return JSX",
          "Type of database",
          "Server-side functions"
        ],
        correctAnswer: 1
      },
      {
        questionText: "What is the difference between state and props?",
        options: [
          "They are the same",
          "Props are passed down and state is managed within component",
          "State is passed down and props are internal",
          "Props are for functions, state is for classes"
        ],
        correctAnswer: 1
      },
      {
        questionText: "What is the purpose of useEffect hook?",
        options: [
          "To create side effects in functional components",
          "To manage component state",
          "To create new elements",
          "To handle routing"
        ],
        correctAnswer: 0
      },
      {
        questionText: "What is the Virtual DOM?",
        options: [
          "A fake version of the actual DOM",
          "An in-memory representation of the UI used to improve performance",
          "The browser's DOM",
          "A database concept"
        ],
        correctAnswer: 1
      }
    ]
  }
];

async function createSampleQuizzes() {
  try {
    console.log('📚 Creating sample quizzes...\n');
    
    for (const quiz of sampleQuizzes) {
      try {
        const response = await axios.post(
          'http://localhost:5000/api/admin/quizzes',
          quiz,
          { timeout: 5000 }
        );
        console.log(`✓ Created: "${quiz.title}"`);
        console.log(`  ID: ${response.data.quiz._id}`);
        console.log(`  Questions: ${quiz.questions.length}\n`);
      } catch (error) {
        console.error(`✗ Error creating "${quiz.title}":`, 
          error.response?.data?.message || error.message);
      }
    }
    
    console.log('\n✅ Sample quizzes setup complete!');
    console.log('📝 You can now login and take these quizzes.\n');
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

console.log('🚀 Quiz Platform - Sample Data Setup');
console.log('====================================\n');

// Check if server is running
axios.get('http://localhost:5000/api/quizzes', { timeout: 2000 })
  .then(() => {
    createSampleQuizzes();
  })
  .catch(() => {
    console.error('❌ Backend server is not running!');
    console.error('Please start the backend first: npm start\n');
    process.exit(1);
  });
