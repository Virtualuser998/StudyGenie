export const quizQuestionBank = {
  DBMS: [
    {
      question: "Which normal form removes partial dependency?",
      options: ["1NF", "2NF", "3NF", "BCNF"],
      answer: 1,
      explanation: "Second normal form removes partial dependency on a composite key.",
    },
    {
      question: "Which SQL command is used to retrieve data from a table?",
      options: ["INSERT", "UPDATE", "SELECT", "ALTER"],
      answer: 2,
      explanation: "SELECT retrieves rows from one or more database tables.",
    },
    {
      question: "A primary key must be:",
      options: ["Unique and not null", "Repeated in every row", "Always a string", "Optional"],
      answer: 0,
      explanation: "A primary key uniquely identifies each row and cannot be null.",
    },
    {
      question: "Which of these is a property of a transaction in ACID?",
      options: ["Availability", "Atomicity", "Inheritance", "Redundancy"],
      answer: 1,
      explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability.",
    },
    {
      question: "Which SQL clause filters grouped results?",
      options: ["WHERE", "ORDER BY", "HAVING", "LIMIT"],
      answer: 2,
      explanation: "HAVING applies a condition to groups after GROUP BY.",
    },
  ],
  "Operating Systems": [
    {
      question: "Which scheduling algorithm uses a fixed time slice?",
      options: ["FCFS", "Round Robin", "Shortest Job First", "Priority only"],
      answer: 1,
      explanation: "Round Robin gives each ready process a fixed time quantum.",
    },
    {
      question: "What is a deadlock?",
      options: ["A process finishing early", "Processes waiting indefinitely for each other", "A full disk", "A CPU cache miss"],
      answer: 1,
      explanation: "A deadlock occurs when processes wait indefinitely for resources held by each other.",
    },
    {
      question: "Which memory management technique divides memory into fixed-size blocks?",
      options: ["Paging", "Segmentation", "Spooling", "Swapping"],
      answer: 0,
      explanation: "Paging divides logical and physical memory into fixed-size pages and frames.",
    },
    {
      question: "Which part of an operating system manages process execution?",
      options: ["Compiler", "Scheduler", "File extension", "Assembler"],
      answer: 1,
      explanation: "The scheduler selects processes for CPU execution.",
    },
    {
      question: "A semaphore is commonly used for:",
      options: ["File compression", "Process synchronization", "Address translation", "Disk formatting"],
      answer: 1,
      explanation: "Semaphores coordinate access to shared resources between processes.",
    },
  ],
  Java: [
    {
      question: "Which keyword creates a subclass in Java?",
      options: ["implements", "extends", "inherits", "instanceof"],
      answer: 1,
      explanation: "A class uses extends to inherit from another class.",
    },
    {
      question: "Which collection does not allow duplicate elements?",
      options: ["List", "ArrayList", "Set", "Queue"],
      answer: 2,
      explanation: "The Set interface stores unique elements.",
    },
    {
      question: "What is the entry point of a standard Java application?",
      options: ["start()", "main()", "runApp()", "init()"],
      answer: 1,
      explanation: "Java starts execution from public static void main(String[] args).",
    },
    {
      question: "Which keyword prevents a method from being overridden?",
      options: ["static", "private", "final", "super"],
      answer: 2,
      explanation: "A final method cannot be overridden in a subclass.",
    },
    {
      question: "Which exception type must generally be handled or declared?",
      options: ["Checked exception", "Error", "RuntimeException", "NullPointerException"],
      answer: 0,
      explanation: "Checked exceptions must be caught or declared with throws.",
    },
  ],
};
