// Lead Generation Quiz - Challenging Questions
// Tests knowledge related to course topics and general Islamic knowledge

export const quizQuestions = [
  // Advanced Tafseer Questions
  {
    id: 1,
    category: "Tafseer",
    question: "According to Usūl al-Tafsīr, what is the greatest danger when interpreting the Quran?",
    options: [
      "Not knowing Arabic grammar",
      "Allowing personal desires (Hawā) to dictate meaning",
      "Using modern translations",
      "Consulting multiple scholars"
    ],
    correctAnswer: "Allowing personal desires (Hawā) to dictate meaning",
    explanation: "The greatest danger in Tafsīr is allowing personal desires (Hawā) to dictate the meaning of the divine text, rather than following sound principles."
  },
  {
    id: 2,
    category: "Tafseer",
    question: "What must Ta'wīl never do in relation to Tafsīr?",
    options: [
      "Use Arabic language",
      "Contradict the core meaning established by Tafsīr",
      "Reference Hadith",
      "Be written by scholars"
    ],
    correctAnswer: "Contradict the core meaning established by Tafsīr",
    explanation: "Ta'wīl must never contradict the core meaning established by Tafsīr. It can only deduce deeper meanings that align with the literal text."
  },
  
  // Advanced Hadith Questions
  {
    id: 3,
    category: "Hadith Sciences",
    question: "Why did Ibn al-Mubarak say 'The Sanad is part of the religion'?",
    options: [
      "Because it's mentioned in the Quran",
      "Because without it, anyone could fabricate Hadith",
      "Because it's a modern requirement",
      "Because it makes Hadith longer"
    ],
    correctAnswer: "Because without it, anyone could fabricate Hadith",
    explanation: "The Sanad (chain of narration) is essential because it authenticates the source. Without it, anyone could claim anything about the Prophet."
  },
  {
    id: 4,
    category: "Hadith Sciences",
    question: "What distinguishes a Mutawatir (Tawātur) Hadith from an Āhād Hadith?",
    options: [
      "Mutawatir is always authentic, Āhād is always weak",
      "Mutawatir has so many independent chains that fabrication is impossible",
      "Mutawatir is only about legal matters",
      "There is no real difference"
    ],
    correctAnswer: "Mutawatir has so many independent chains that fabrication is impossible",
    explanation: "Mutawatir Hadith has multiple independent chains of narration making it impossible for them all to be false, while Āhād has fewer narrators."
  },
  
  // Advanced Islamic Knowledge
  {
    id: 5,
    category: "Islamic Sciences",
    question: "What is the correct order of sources for Quranic interpretation according to Usūl al-Tafsīr?",
    options: [
      "Personal opinion, then modern scholars, then Hadith",
      "Quran explains itself, then Sunnah, then Companions' statements, then Arabic language",
      "Any scholarly opinion is equally valid",
      "Only the Quran itself, nothing else"
    ],
    correctAnswer: "Quran explains itself, then Sunnah, then Companions' statements, then Arabic language",
    explanation: "The correct hierarchy: 1) Quran explains itself, 2) Sunnah of the Prophet, 3) Statements of Companions, 4) Arabic language and context."
  },
  {
    id: 6,
    category: "Islamic Sciences",
    question: "What does 'Jarh wa Ta'dīl' specifically assess in Hadith sciences?",
    options: [
      "The length of Hadith",
      "The narrators' reliability through criticism and validation",
      "The topic of Hadith",
      "The language of Hadith"
    ],
    correctAnswer: "The narrators' reliability through criticism and validation",
    explanation: "Jarh wa Ta'dīl is the science of assessing narrators' reliability - Jarh (criticism/discrediting) and Ta'dīl (validation/attesting to reliability)."
  },
  {
    id: 7,
    category: "Islamic Sciences",
    question: "What are the External Sciences (al-'Ulūm al-Khārijiyyah) that a Mufassir must master?",
    options: [
      "Only Arabic",
      "Arabic, Hadith sciences, Usūl al-Fiqh, history, and related disciplines",
      "Only modern sciences",
      "Only translation skills"
    ],
    correctAnswer: "Arabic, Hadith sciences, Usūl al-Fiqh, history, and related disciplines",
    explanation: "A Mufassir needs Arabic language, Hadith sciences, Usūl al-Fiqh (principles of jurisprudence), history, and other related disciplines."
  },
  {
    id: 8,
    category: "Islamic Knowledge",
    question: "What is the precise definition of 'Ihsan' according to the Hadith of Jibril?",
    options: [
      "To do good deeds",
      "To worship Allah as if you see Him, and if you don't see Him, know that He sees you",
      "To give charity regularly",
      "To memorize the entire Quran"
    ],
    correctAnswer: "To worship Allah as if you see Him, and if you don't see Him, know that He sees you",
    explanation: "Ihsan is the highest level of faith - to worship Allah as if you see Him, and if you don't see Him, know that He sees you."
  }
];

// Calculate score and provide feedback
export function calculateScore(answers) {
  let correct = 0;
  const results = [];
  
  quizQuestions.forEach((question, index) => {
    const userAnswer = answers[question.id];
    const isCorrect = userAnswer === question.correctAnswer;
    if (isCorrect) correct++;
    
    results.push({
      questionId: question.id,
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
      category: question.category
    });
  });
  
  const percentage = Math.round((correct / quizQuestions.length) * 100);
  
  // Determine feedback message based on score
  let feedback = "";
  let recommendation = "";
  
  if (percentage >= 90) {
    feedback = "Excellent! You have a strong foundation in Islamic knowledge.";
    recommendation = "You're ready for advanced courses. Continue deepening your understanding with our comprehensive courses.";
  } else if (percentage >= 70) {
    feedback = "Good job! You have solid knowledge but there's room to grow.";
    recommendation = "Our courses will help you strengthen your understanding and fill in the gaps in your knowledge.";
  } else if (percentage >= 50) {
    feedback = "You have some knowledge, but there's much more to learn.";
    recommendation = "Our structured courses will help you build a strong foundation in Islamic studies.";
  } else {
    feedback = "This quiz shows there's valuable knowledge waiting for you.";
    recommendation = "Start your learning journey with our comprehensive courses designed for every level.";
  }
  
  return {
    score: correct,
    total: quizQuestions.length,
    percentage,
    feedback,
    recommendation,
    results
  };
}

