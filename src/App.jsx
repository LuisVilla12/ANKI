import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBookOpen, FaPlus, FaGamepad, FaTrophy, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';

const API_URL = 'http://localhost:8000';

const categories = [
  { id: 0, name: 'Todas' },
  { id: 1, name: 'General' },
  { id: 2, name: 'Verbos' },
  { id: 3, name: 'Objetos' },
  { id: 4, name: 'Comida' },
  { id: 5, name: 'Animales' },
  { id: 6, name: 'Otros' }
];

export default function FlashcardApp() {
  const [view, setView] = useState('home');
  const [flashcards, setFlashcards] = useState([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [score, setScore] = useState({ bueno: 0, regular: 0, malo: 0 });
  const [showSummary, setShowSummary] = useState(false);
  // Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCard, setEditCard] = useState(null); // objeto con la tarjeta que se está editando
  const [editingId, setEditingId] = useState(null);
  const [editEnglish, setEditEnglish] = useState('');
  const [editSpanish, setEditSpanish] = useState('');
  const [editCategory, setEditCategory] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/words`)
      .then((res) => res.json())
      .then((data) => {
        setFlashcards(data);
        setFilteredFlashcards(data);
      })
      .catch((err) => console.error('Error al obtener tarjetas:', err));
  }, []);

  useEffect(() => {
    if (selectedCategory === 0) {
      setFilteredFlashcards(flashcards);
    } else {
      setFilteredFlashcards(flashcards.filter(card => card.category_id === selectedCategory));
    }
  }, [selectedCategory, flashcards]);

  const addCard = async (english, spanish, category_id) => {
    try {
      const response = await fetch(`${API_URL}/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ english, spanish, category_id: Number(category_id) }),
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

  // const startEdit = (card) => {
  //   setEditingId(card.id);
  //   setEditEnglish(card.english);
  //   setEditSpanish(card.spanish);
  //   setEditCategory(card.category_id);
  // };

  const openEditModal = (card) => {
  setEditCard(card);
  setEditEnglish(card.english);
  setEditSpanish(card.spanish);
  setEditCategory(card.category);
  setIsModalOpen(true);
    setEditingId(card.id); // <== ESTA ES LA LÍNEA QUE FALTABA
};

 const handleSaveEdit = () => {
    if (editCard) {
      saveEdit({
        ...editCard,
        english: editEnglish,
        spanish: editSpanish,
        category: editCategory,
      });
    }
    setIsModalOpen(false);
  };

  const saveEdit = async () => {
    const updatedCard = {
      english: editEnglish,
      spanish: editSpanish,
      category_id: Number(editCategory),
    };

    try {
      const response = await fetch(`${API_URL}/words/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCard),
      });

      if (!response.ok) throw new Error('Error al actualizar la tarjeta');
      const updatedFromServer = await response.json();

      const updated = flashcards.map((card) =>
        card.id === editingId ? updatedFromServer : card
      );

      setFlashcards(updated);
      setEditingId(null);
    } catch (error) {
      console.error('Error al guardar edición:', error);
    }
  };
const deleteCard = async (id) => {
  try {
    const response = await fetch(`${API_URL}/words/${id}`, {
      method: 'DELETE',  // Método correcto para eliminar
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Error al eliminar la tarjeta');

    // Si quieres, puedes leer la respuesta del servidor
    // const result = await response.json();

    // Actualizar estados solo si la eliminación fue exitosa
    setFlashcards(prev => prev.filter(card => card.id !== id));
    setFilteredFlashcards(prev => prev.filter(card => card.id !== id));

  } catch (error) {
    console.error('Error al eliminar la tarjeta:', error);
  }
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

    return (
      <div className="p-4 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Agregar nueva palabra</h2>
        <input className="border p-2 mb-2 w-full text-black" placeholder="Inglés" value={english} onChange={(e) => setEnglish(e.target.value)} />
        <input className="border p-2 mb-2 w-full text-black" placeholder="Español" value={spanish} onChange={(e) => setSpanish(e.target.value)} />
        <select className="border p-2 mb-4 w-full text-black" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="" className='text-black'>Seleccionar categoría</option>
          {categories.filter(c => c.id !== 0).map((cat) => (
            <option className='text-black' key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button disabled={!english || !spanish || !category} className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50" onClick={() => addCard(english, spanish, category)}>Guardar</button>
        <button className="bg-gray-300 text-black px-4 py-2 rounded" onClick={() => setView('home')}>Cancelar</button>
      </div>
    );
  };

  const ViewCards = () => (
    <div className="p-4 w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Lista de Palabras</h2>
      <div className="mb-4">
        <label className="mr-2">Filtrar por categoría:</label>
        <select className="border p-2 text-black" value={selectedCategory} onChange={(e) => setSelectedCategory(Number(e.target.value))}>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      
      <ul className="space-y-4">
        {filteredFlashcards.map((card) => (
          <li
            key={card.id}
            className="bg-white text-black rounded-lg shadow p-4 flex justify-between items-center"
          >
            <div className="flex-1">
              <p className="font-semibold">
                {card.english} - {card.spanish}
              </p>
              <p className="text-sm text-gray-500">
                {categories.find((c) => c.id === card.category)?.name || ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(card)}
                className="text-blue-500"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => deleteCard(card.id)}
                className="text-red-500"
              >
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal de edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-black w-96">
            <h3 className="text-lg font-bold mb-4">Editar Tarjeta</h3>
            <input
              value={editEnglish}
              onChange={(e) => setEditEnglish(e.target.value)}
              className="border p-2 mb-2 w-full"
              placeholder="Inglés"
            />
            <input
              value={editSpanish}
              onChange={(e) => setEditSpanish(e.target.value)}
              className="border p-2 mb-2 w-full"
              placeholder="Español"
            />
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(Number(e.target.value))}
              className="border p-2 mb-4 w-full"
            >
              {categories
                .filter((c) => c.id !== 0)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleSaveEdit}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-6">
        <button onClick={() => setView('home')} className="text-sm text-white underline">← Volver al menú</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
      {view === 'home' && (
        <motion.div className="max-w-3xl w-full space-y-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-3xl font-bold">
              <span className="bg-yellow-400 text-white p-2 rounded-full"><FaCheckCircle /></span>
              <h1 className="text-white">EasyFlash</h1>
            </div>
            <p className="text-gray-300 mt-2">Aprende inglés de manera divertida y efectiva con nuestro sistema de tarjetas inteligentes</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-800 p-4 rounded-xl">
              <p className="text-2xl font-bold text-blue-400">{score.bueno}</p>
              <p className="text-gray-400">Palabras aprendidas</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl">
              <p className="text-2xl font-bold text-yellow-400">15</p>
              <p className="text-gray-400">Días consecutivos</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl">
              <p className="text-2xl font-bold text-purple-400">{flashcards.length ? Math.round((score.bueno / flashcards.length) * 100) : 0}%</p>
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
      {view === 'play' && !showSummary && filteredFlashcards.length > 0 && <Flashcard word={filteredFlashcards[currentIndex]} />}
      {view === 'play' && showSummary && <GameSummary />}
    </div>
  );
}
