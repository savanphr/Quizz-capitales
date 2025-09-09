let countries = [];
let currentCountry = null;
let score = 0;
let total = 0;
let currentLang = 'fr'; // Définit la langue par défaut

const texts = {
  fr: {
    title: "Quiz des Capitales 🌍",
    question: "Quelle est la capitale de :",
    loading: "Chargement...",
    answerPlaceholder: "Votre réponse",
    submitButton: "Valider",
    nextButton: "Suivant",
    resetButton: "Réinitialiser",
    resultGood: "✅ Bonne réponse :",
    resultWrong: "❌ Mauvaise réponse. La capitale est :",
    score: "Score :",
    loadingError: "Erreur de chargement des données",
    emptyDataError: "Aucune donnée disponible pour poser une question.",
    dataError: "Problème avec l’entrée choisie :",
    countryName: "Pays",
  },
  en: {
    title: "Capital Quiz 🌍",
    question: "What is the capital of :",
    loading: "Loading...",
    answerPlaceholder: "Your answer",
    submitButton: "Submit",
    nextButton: "Next",
    resetButton: "Reset",
    resultGood: "✅ Correct answer:",
    resultWrong: "❌ Wrong answer. The capital is:",
    score: "Score:",
    loadingError: "Error loading data",
    emptyDataError: "No data available to ask a question.",
    dataError: "Problem with the chosen entry:",
    countryName: "Country",
  }
};

function updateUI() {
  const langText = texts[currentLang];
  document.querySelector("h1").textContent = langText.title;
  document.getElementById("question").textContent = langText.question;
  document.getElementById("answer").placeholder = langText.answerPlaceholder;
  document.getElementById("submit").textContent = langText.submitButton;
  document.getElementById("next").textContent = langText.nextButton;
  document.getElementById("reset").textContent = langText.resetButton;
  document.getElementById("score").textContent = `${langText.score} ${score} / ${total}`;
}

function setLanguage(lang) {
  currentLang = lang;
  updateUI();
  resetQuiz(); // On réinitialise le quiz pour la nouvelle langue
}

// Charger la liste des pays (avec le nouveau nom de fichier)
async function loadCountries() {
    try {
        const response = await fetch("countries_bilingual.json");
        if (!response.ok) throw new Error(texts[currentLang].loadingError);
        
        countries = await response.json();

        if (!Array.isArray(countries) || countries.length === 0) {
            throw new Error(texts[currentLang].emptyDataError);
        }
        
        console.log(`✅ ${texts[currentLang].countryName}s loaded:`, countries.length);
        nextQuestion();
    } catch (error) {
        console.error("❌ Erreur de chargement :", error);
        document.getElementById("country").innerText = texts[currentLang].loadingError;
    }
}

// Normaliser les accents et majuscules/minuscules
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function nextQuestion() {
    if (!countries || countries.length === 0) {
        console.error(`⚠️ ${texts[currentLang].emptyDataError}`);
        return;
    }

    const randomIndex = Math.floor(Math.random() * countries.length);
    currentCountry = countries[randomIndex];

    if (!currentCountry) {
        console.error(`⚠️ ${texts[currentLang].dataError}`, currentCountry);
        return;
    }
    
    // Afficher le pays dans la langue actuelle
    const countryToDisplay = currentLang === 'fr' ? currentCountry.pays : currentCountry.en_pays;
    document.getElementById("country").innerText = countryToDisplay;
    document.getElementById("answer").value = "";
    document.getElementById("result").textContent = "";
}

function checkAnswer() {
  const userAnswer = normalize(document.getElementById("answer").value.trim());
  
  // Utiliser la capitale en fonction de la langue
  const correctCapital = currentLang === 'fr' ? currentCountry.capitale : currentCountry.en_capitale;
  const correctAnswers = correctCapital.split("/").map(c => normalize(c.trim()));
  const langText = texts[currentLang];

  total++;
  if (correctAnswers.includes(userAnswer)) {
    score++;
    document.getElementById("result").textContent = `${langText.resultGood} ${correctCapital}`;
  } else {
    document.getElementById("result").textContent = `${langText.resultWrong} ${correctCapital}`;
  }
  document.getElementById("score").textContent = `${langText.score} ${score} / ${total}`;
}

function resetQuiz() {
  score = 0;
  total = 0;
  document.getElementById("score").textContent = `${texts[currentLang].score} 0 / 0`;
  document.getElementById("result").textContent = "";
  nextQuestion();
}

document.getElementById("submit").addEventListener("click", checkAnswer);
document.getElementById("next").addEventListener("click", nextQuestion);
document.getElementById("reset").addEventListener("click", resetQuiz);

// Validation avec Entrée
document.getElementById("answer").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    checkAnswer();
  }
});

// Lancer au chargement
updateUI(); // Met à jour l'interface avec la langue par défaut
loadCountries();

// 🔹 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('✅ Service Worker actif via script.js'))
    .catch(err => console.error('❌ Erreur Service Worker :', err));
}
