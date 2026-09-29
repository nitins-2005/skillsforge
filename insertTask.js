const mongoose = require('mongoose');
const Task = require("./models/task");

mongoose.connect("mongodb://127.0.0.1:27017/skillsforge")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

  const tasks = 
    [
  {
    "title": "Rate Limiting",
    "description": "Add rate limiting to protect API.",
    "topic": "RESTfulAPI",
    "difficulty": "hard",
    "skills": "Security, performance optimization"
  },

  {
    "title": "Bootstrap Grid Layout",
    "description": "Create a responsive layout using Bootstrap grid.",
    "topic": "Bootstrap",
    "difficulty": "easy",
    "skills": "Grid system, responsiveness"
  },
  {
    "title": "Bootstrap Components",
    "description": "Use Bootstrap cards, modals, and navbars.",
    "topic": "Bootstrap",
    "difficulty": "medium",
    "skills": "UI components, styling"
  },
  {
    "title": "Custom Theme",
    "description": "Override Bootstrap styles with custom CSS.",
    "topic": "Bootstrap",
    "difficulty": "hard",
    "skills": "Customization, theming"
  },

  {
    "title": "Login Form",
    "description": "Create a login form with validation.",
    "topic": "Authentication",
    "difficulty": "easy",
    "skills": "Forms, validation"
  },
  {
    "title": "JWT Authentication",
    "description": "Implement JWT-based authentication in Node.js.",
    "topic": "Authentication",
    "difficulty": "medium",
    "skills": "JWT, token handling"
  },
  {
    "title": "OAuth Integration",
    "description": "Integrate Google OAuth for login.",
    "topic": "Authentication",
    "difficulty": "hard",
    "skills": "OAuth, third-party login"
  },

  {
    "title": "SQL Table Creation",
    "description": "Create tables with primary and foreign keys.",
    "topic": "SQL",
    "difficulty": "easy",
    "skills": "DDL, schema design"
  },
  {
    "title": "Complex Queries",
    "description": "Write queries with joins and subqueries.",
    "topic": "SQL",
    "difficulty": "medium",
    "skills": "Joins, subqueries, filtering"
  },
  {
    "title": "Stored Procedures",
    "description": "Create stored procedures for business logic.",
    "topic": "SQL",
    "difficulty": "hard",
    "skills": "Procedures, optimization"
  }
];
  

  async function insertDB(){
    await Task.insertMany(tasks);
    console.log("task added successfully");
    mongoose.connection.close();
  }

  insertDB();