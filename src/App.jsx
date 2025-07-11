import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBookOpen, FaPlus, FaGamepad, FaTrophy, FaCheckCircle } from 'react-icons/fa';

const API_URL = 'http://localhost:8000';

// const getFlashcards = () => {
//   const data = localStorage.getItem('flashcards');
//   return data ? JSON.parse(data) : [];
// };

// const saveFlashcards = (cards) => {
//   localStorage.setItem('flashcards', JSON.stringify(cards));
// };


export default function FlashcardApp() {
  const [view, setView] = useState('home');
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [score, setScore] = useState({ bueno: 0, regular: 0, malo: 0 });
  const [showSummary, setShowSummary] = useState(false);

  // ✅ Cargar las tarjetas desde la API al iniciar
  useEffect(() => {
    fetch(`${API_URL}/words`)
      .then((res) => res.json())
      .then((data) => setFlashcards(data))
      .catch((err) => console.error('Error al obtener tarjetas:', err));
  }, []);

const addCard = async (english, spanish, category_id) => {
  try {
    const response = await fetch(`${API_URL}/words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        english,
        spanish,
        category_id: category_id || null,
      }),
    });

    if (!response.ok) throw new Error('Error al agregar tarjeta');

    const newCard = await response.json();
    setFlashcards((prev) => [...prev, newCard]);
    setView('home');
  } catch (error) {
    console.error(error);
  }
};

  const updateProgress = (level) => {
    const updated = [...flashcards];
    updated[currentIndex].progress = level;
    setFlashcards(updated);
    setScore({ ...score, [level]: score[level] + 1 });
    setShowTranslation(false);

    if (currentIndex + 1 >= flashcards.length) {
      setShowSummary(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setShowTranslation(false);
    setScore({ bueno: 0, regular: 0, malo: 0 });
    setShowSummary(false);
    setView('home');
  };

  const Flashcard = ({ word }) => (
    <motion.div
      className="bg-white shadow-2xl rounded-3xl p-8 w-96 text-center border-2 border-purple-200"
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -90, opacity: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      <h2 className="text-3xl font-bold text-purple-700 mb-6">{word.english}</h2>
      {showTranslation && <p className="text-xl text-gray-700 font-medium">{word.spanish}</p>}
      <div className="mt-6 space-y-2 flex flex-col items-center">
        {!showTranslation && (
          <button onClick={() => setShowTranslation(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full">Ver traducción</button>
        )}
        {showTranslation && (
          <>
            <button onClick={() => updateProgress('malo')} className="bg-red-100 text-red-700 px-6 py-2 rounded-full w-40">👎 Malo</button>
            <button onClick={() => updateProgress('regular')} className="bg-yellow-100 text-yellow-700 px-6 py-2 rounded-full w-40">😐 Regular</button>
            <button onClick={() => updateProgress('bueno')} className="bg-green-100 text-green-700 px-6 py-2 rounded-full w-40">👍 Bien</button>
          </>
        )}
      </div>
      <div className="mt-6">
        <button onClick={() => setView('home')} className="text-sm text-gray-500 underline">← Volver al menú</button>
      </div>
    </motion.div>
  );

  const GameSummary = () => (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-4">Resumen del juego</h2>
      <p className="mb-2">👍 Bien: {score.bueno}</p>
      <p className="mb-2">😐 Regular: {score.regular}</p>
      <p className="mb-4">👎 Malo: {score.malo}</p>
      <button className="bg-green-500 text-white px-4 py-2 rounded mr-2" onClick={restartGame}>Volver al menú</button>
      <button className="bg-purple-500 text-white px-4 py-2 rounded" onClick={() => { setCurrentIndex(0); setShowSummary(false); }}>Reintentar</button>
    </div>
  );

  const AddCardForm = () => {
    const [english, setEnglish] = useState('');
    const [spanish, setSpanish] = useState('');
    const [category, setCategory] = useState('');
const categories = [
  { id: 1, name: 'General' },
  { id: 2, name: 'Verbos' },
  { id: 3, name: 'Objetos' },
  { id: 4, name: 'Comida' },
  { id: 5, name: 'Animales' },
  { id: 6, name: 'Otros' }
];

    return (
      <div className="p-4 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Agregar nueva palabra</h2>
        <input className="border p-2 mb-2 w-full text-black" placeholder="Inglés" value={english} onChange={(e) => setEnglish(e.target.value)} />
        <input className="border p-2 mb-2 w-full text-black" placeholder="Español" value={spanish} onChange={(e) => setSpanish(e.target.value)} />
        <select className="border p-2 mb-4 w-full text-black" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="" className='text-black' >Seleccionar categoría</option>
          {categories.map((cat) => (
            <option className='text-black' key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button disabled={!english || !spanish || !category} className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50" onClick={() => addCard(english, spanish, category)}>Guardar</button>
        <button className="bg-gray-300 text-black px-4 py-2 rounded" onClick={() => setView('home')}>Cancelar</button>
      </div>
    );
  };

  const ViewCards = () => (
    <div className="p-4 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Lista de Palabras</h2>
      <ul className="list-disc pl-5 space-y-1">
        {flashcards.map((card, i) => (
          <li key={i}>{card.english} - {card.spanish} ({card.category})</li>
        ))}
      </ul>
      <div className="mt-4">
        <button onClick={() => setView('home')} className="text-sm text-gray-600 underline">← Volver al menú</button>
      </div>
    </div>
  );

  const totalLearned = flashcards.filter(f => f.progress === 'bueno').length;
  const precision = flashcards.length ? Math.round((totalLearned / flashcards.length) * 100) : 0;
  const daysStreak = 15;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
      {view === 'home' && (
        <motion.div
          className="max-w-3xl w-full space-y-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-3xl font-bold">
              <span className="bg-yellow-400 text-white p-2 rounded-full"><FaCheckCircle /></span>
              <h1 className="text-white">EasyFlash</h1>
            </div>
            <p className="text-gray-300 mt-2">Aprende inglés de manera divertida y efectiva con nuestro sistema de tarjetas inteligentes</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-800 p-4 rounded-xl">
              <p className="text-2xl font-bold text-blue-400">{totalLearned}</p>
              <p className="text-gray-400">Palabras aprendidas</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl">
              <p className="text-2xl font-bold text-yellow-400">{daysStreak}</p>
              <p className="text-gray-400">Días consecutivos</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl">
              <p className="text-2xl font-bold text-purple-400">{precision}%</p>
              <p className="text-gray-400">Precisión</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-xl flex flex-col items-center justify-center space-y-2" onClick={() => setView('add')}>
              <FaPlus size={32} />
              <span>Agregar Palabra</span>
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-xl flex flex-col items-center justify-center space-y-2" onClick={() => setView('view')}>
              <FaBookOpen size={32} />
              <span>Ver Palabras</span>
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-xl flex flex-col items-center justify-center space-y-2" onClick={() => setView('play')}>
              <FaGamepad size={32} />
              <span>Jugar</span>
            </button>
          </div>
        </motion.div>
      )}

      {view === 'add' && <AddCardForm />}
      {view === 'view' && <ViewCards />}
      {view === 'play' && !showSummary && flashcards.length > 0 && <Flashcard word={flashcards[currentIndex]} />}
      {view === 'play' && showSummary && <GameSummary />}
    </div>
  );
}
