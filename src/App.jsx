import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBookOpen, FaPlus, FaGamepad, FaEdit, FaTrash, FaCheckCircle,FaTags } from 'react-icons/fa';
import EditModalCard from './EditModalCard'; // Modal de edición separado
import EditModalCategory from './EditModalCategory'; // Modal de edición separado

const API_URL = 'http://localhost:8000';

export default function FlashcardApp() {
  const [view, setView] = useState('home');
  const [flashcards, setFlashcards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [score, setScore] = useState({ bueno: 0, regular: 0, malo: 0 });
  const [precision, setPrecision] = useState(0);
  const [racha, setRacha] = useState(0);

  // Estados para edición modal card
  const [isModalOpenCard, setIsModalOpenCard] = useState(false);
  const [editCard, setEditCard] = useState(null);
  // Estados para edición modal category
  const [isModalOpenCategory, setIsModalOpenCategory] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  useEffect(() => {
  // Carga inicial de tarjetas
    fetch(`${API_URL}/words`)
      .then((res) => res.json())
      .then((data) => {
        setFlashcards(data);
        setFilteredFlashcards(data);
      })
      .catch((err) => console.error('Error al obtener tarjetas:', err));
      //Registar  racha
    fetch(`${API_URL}/racha`, {
    method: "POST"
  })
    .then((res) => res.json())
    .then((data) => console.log("Racha:", data.mensaje))
    .catch((err) => console.error("Error al registrar racha:", err));
  }, []);
 // Cargar racha
  useEffect(() => {
    fetch(`${API_URL}/racha`)
      .then((res) => res.json())
      .then((data) => {
        setRacha(data.racha);
      })
      .catch((err) => console.error('Error al obtener tarjetas:', err));
  }, []);
  // Función reutilizable para cargar categorías
  const fetchCategories = () => {
  fetch(`${API_URL}/categories`)
    .then((res) => res.json())
    .then((data) => {
      setCategories(data);
    })
    .catch((err) => console.error('Error al obtener las categorias:', err));
};
useEffect(() => {
  fetchCategories();
}, []);

  // Filtra tarjetas según categoría seleccionada
  useEffect(() => {
    if (selectedCategory === 0) {
      setFilteredFlashcards(flashcards);
    } else {
      setFilteredFlashcards(flashcards.filter(card => card.category_id === selectedCategory));
    }
  }, [selectedCategory, flashcards]);

useEffect(() => {
  const total = score.bueno + score.regular + score.malo;
  const nuevaPrecision = total > 0 ? Math.round((score.bueno / total) * 100) : 0;
  setPrecision(nuevaPrecision);
  console.log(nuevaPrecision)
}, [score]);


  // Añadir tarjeta nueva
  const addCard = async (english, spanish, category_id) => {
    try {
      const response = await fetch(`${API_URL}/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ english, spanish, category_id: Number(category_id) }),
      });
      if (!response.ok) throw new Error('Error al agregar tarjeta');
      const newCard = await response.json();
      setFlashcards(prev => [...prev, newCard]);
      setView('home');
    } catch (error) {
      console.error(error);
    }
  };
  // Añadir categoria nueva
  const addCategory = async (nameCategory) => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameCategory  }),
      });
      if (!response.ok) throw new Error('Error al agregar categoria');
      setView('home');
    } catch (error) {
      console.error(error);
    }
  };
const pointsMap = {
  5: 'bueno',
  3: 'regular',
  1: 'malo',
};

  // Actualizar progreso de la tarjeta en el juego
const updateProgress = async (points) => {
  const updated = [...flashcards];
  const word = filteredFlashcards[currentIndex];
  updated[currentIndex].progress += points;
  setFlashcards(updated);

  try {
    await fetch(`${API_URL}/words/${word.id}/progress?points=${points}`, {
    method: 'PUT',
  });
  } catch (error) {
    console.error("Error actualizando progreso:", error);
  }

  setScore((prev) => ({ ...prev, [points]: (prev[points] || 0) + 1 }));
  setShowTranslation(false);

  if (currentIndex + 1 >= filteredFlashcards.length) {
    setShowSummary(true);
  } else {
    setCurrentIndex(prev => prev + 1);
  }

  setScore(prev => {
  const key = pointsMap[points];
  if (!key) return prev; // si no hay key válida, no actualizar

  return {
    ...prev,
    [key]: (prev[key] || 0) + 1,
  };
});
};

  // Reiniciar juego
  const restartGame = () => {
    setCurrentIndex(0);
    setShowTranslation(false);
    // setScore({ bueno: 0, regular: 0, malo: 0 });
    setShowSummary(false);
    setView('home');
  };

  // Abrir modal para editar tarjeta
  const openEditModalCard = (card) => {
    setEditCard(card);
    setIsModalOpenCard(true);
  };

  
  // Abrir modal para editar categoría
  const openEditModalCategory = (cat) => {
    setEditCategory(cat);
    setIsModalOpenCategory(true);
  };

  // Guardar edición de tarjeta
  const handleSaveEditCard = async (updatedCard) => {
    try {
      const response = await fetch(`${API_URL}/words/${updatedCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          english: updatedCard.english,
          spanish: updatedCard.spanish,
          category_id: Number(updatedCard.category_id),
        }),
      });
      if (!response.ok) throw new Error('Error al actualizar la tarjeta');
      const updatedFromServer = await response.json();

      const updated = flashcards.map(card =>
        card.id === updatedFromServer.id ? updatedFromServer : card
      );
      setFlashcards(updated);
      setIsModalOpenCard(false);
      setEditCard(null);
    } catch (error) {
      console.error('Error al guardar edición:', error);
    }
  };
  // Guardar edición de categoría
const handleSaveEditCategory = async (updatedCategory) => {
  try {
    const response = await fetch(`${API_URL}/categories/${updatedCategory.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: updatedCategory.name,
      }),
    });

    // Verifica si la respuesta fue exitosa
    if (!response.ok) throw new Error('Error al actualizar la categoría');
    await fetchCategories();
    // Cierra modal y limpia el estado de edición
    setIsModalOpenCategory(false);
    setEditCategory(null);
  } catch (error) {
    console.error('Error al guardar edición:', error);
  }
};


  // Eliminar tarjeta
  const deleteCard = async (id) => {
    try {
      const response = await fetch(`${API_URL}/words/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Error al eliminar la tarjeta');

      setFlashcards(prev => prev.filter(card => card.id !== id));
      setFilteredFlashcards(prev => prev.filter(card => card.id !== id));
    } catch (error) {
      console.error('Error al eliminar la tarjeta:', error);
    }
  };

    // Eliminar categoria
  const deleteCategory = async (id) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Error al eliminar la categoria');
      await fetchCategories(); // ← Aquí actualizas después de guardar
      setSelectedCategory(0); // Reinicia la categoría seleccionada
    } catch (error) {
      console.error('Error al eliminar la tarjeta:', error);
    }
  };


  // Componentes internos:

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
          <button onClick={() => setShowTranslation(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full">
            Ver traducción
          </button>
        )}
        {showTranslation && (
          <>
            <button onClick={() => updateProgress(1)} className="bg-red-100 text-red-700 px-6 py-2 rounded-full w-40">👎 Malo</button>
            <button onClick={() => updateProgress(3)} className="bg-yellow-100 text-yellow-700 px-6 py-2 rounded-full w-40">😐 Regular</button>
            <button onClick={() => updateProgress(5)} className="bg-green-100 text-green-700 px-6 py-2 rounded-full w-40">👍 Bien</button>
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


    const AddCategoryForm = () => {
    const [nameCategory, setNameCategory] = useState('');

    return (
      <div className="p-4 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Agregar nueva categoria</h2>
        <input
          className="border p-2 mb-2 w-full text-black"
          placeholder="Nombre de la categoría"
          value={nameCategory}
          onChange={e => setNameCategory(e.target.value)}
        />
        <button
          disabled={!nameCategory}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
          onClick={() => addCategory(nameCategory)}
        >
          Guardar
        </button>
        <button
          className="bg-gray-300 text-black px-4 py-2 rounded"
          onClick={() => setView('home')}
        >
          Cancelar
        </button>
      </div>
    );
  };

  const AddCardForm = () => {
    const [english, setEnglish] = useState('');
    const [spanish, setSpanish] = useState('');
    const [category, setCategory] = useState('');

    return (
      <div className="p-4 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Agregar nueva palabra</h2>
        <input
          className="border p-2 mb-2 w-full text-black"
          placeholder="Inglés"
          value={english}
          onChange={e => setEnglish(e.target.value)}
        />
        <input
          className="border p-2 mb-2 w-full text-black"
          placeholder="Español"
          value={spanish}
          onChange={e => setSpanish(e.target.value)}
        />
        <select
          className="border p-2 mb-4 w-full text-black"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">Seleccionar categoría</option>
          {categories.filter(c => c.id !== 0).map(cat => (
            <option className="text-black" key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button
          disabled={!english || !spanish || !category}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
          onClick={() => addCard(english, spanish, category)}
        >
          Guardar
        </button>
        <button
          className="bg-gray-300 text-black px-4 py-2 rounded"
          onClick={() => setView('home')}
        >
          Cancelar
        </button>
      </div>
    );
  };
  //Ver categorias
   const ViewCategories = () => (
    <div className="p-4 w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Lista de categorias</h2>
      <ul className="space-y-4">
        {categories.map(cat => (
          <li
            key={cat.id}
            className="bg-white text-black rounded-lg shadow p-4 flex justify-between items-center"
          >
            <div className="flex-1">
              <p className="font-semibold">{cat.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEditModalCategory(cat)} className="text-blue-500"><FaEdit /></button>
              <button onClick={() => deleteCategory(cat.id)} className="text-red-500"><FaTrash /></button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <button onClick={() => setView('home')} className="text-sm text-white underline">← Volver al menú</button>
      </div>
    </div>
  );

  // Ver cartas
  const ViewCards = () => (
    <div className="p-4 w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Lista de Palabras</h2>
      <div className="mb-4">
        <label className="mr-2">Filtrar por categoría:</label>
        <select
          className="border p-2 text-black"
          value={selectedCategory}
          onChange={e => setSelectedCategory(Number(e.target.value))}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-4">
        {filteredFlashcards.map(card => (
          <li
            key={card.id}
            className="bg-white text-black rounded-lg shadow p-4 flex justify-between items-center"
          >
            <div className="flex-1">
              <p className="font-semibold">{card.english} - {card.spanish}</p>
              <p className="text-sm text-gray-500">{categories.find(c => c.id === card.category_id)?.name || ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEditModalCard(card)} className="text-blue-500"><FaEdit /></button>
              <button onClick={() => deleteCard(card.id)} className="text-red-500"><FaTrash /></button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <button onClick={() => setView('home')} className="text-sm text-white underline">← Volver al menú</button>
      </div>
    </div>
  );

  // Cálculo de precisión
  const precisionColor =precision >= 80 ? "text-green-400" : precision >= 50 ? "text-yellow-400" :"text-red-400";
  const palabrasAprendidas = flashcards.filter(card => card.progress > 150).length;

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
              <p className="text-2xl font-bold text-blue-400">{palabrasAprendidas}</p>
              <p className="text-gray-400">Palabras aprendidas</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl">
              <p className="text-2xl font-bold text-yellow-400">{racha}</p>
              <p className="text-gray-400">Días consecutivos</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl">
              <p className={`text-2xl font-bold ${precisionColor}`}>{precision}%</p>
              <p className="text-gray-400">Precisión</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-xl flex flex-col items-center justify-center space-y-2"
              onClick={() => setView('addCard')}
            >
              <FaPlus size={32} />
              <span>Agregar Palabra</span>
            </button>
            <button
              className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-xl flex flex-col items-center justify-center space-y-2"
              onClick={() => setView('view-cards')}
            >
              <FaBookOpen size={32} />
              <span>Ver Palabras</span>
            </button>
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-xl flex flex-col items-center justify-center space-y-2"
              onClick={() => {
                setCurrentIndex(0);
                setScore({ bueno: 0, regular: 0, malo: 0 });
                setShowTranslation(false);
                setShowSummary(false);
                setView('play');
              }}
            >
              <FaGamepad size={32} />
              <span>Jugar</span>
            </button>
            <button
              className="bg-pink-500 hover:bg-pink-600 text-white p-6 rounded-xl flex flex-col items-center justify-center space-y-2"
              onClick={() => setView('addCategory')}
            >
              <FaPlus size={32} />
              <span>Agregar categoria</span>
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-6 rounded-xl flex flex-col items-center justify-center space-y-2"
              onClick={() => setView('view-categories')}
            >
              <FaTags size={32} />
              <span>Ver Categorias</span>
            </button>
<button
  className="bg-red-500 hover:bg-red-600 text-white p-6 rounded-xl flex flex-col items-center justify-center space-y-2"
  onClick={() => {
    const malas = flashcards
      .filter(card => card.progress !== null && card.progress <= 2) // tarjetas con poco progreso
      .sort(() => Math.random() - 0.5); // opcional: orden aleatorio

    setFilteredFlashcards(malas);
    setCurrentIndex(0);
    setScore({ 1: 0, 3: 0, 5: 0 }); // si vas a usar puntos como 1 = malo, 3 = regular, 5 = bueno
    setShowTranslation(false);
    setShowSummary(false);
        setPrecision(0);
    setView('play');
  }}
>
  <FaGamepad size={32} />
  <span>Practicar palabras difíciles</span>
</button>
          </div>
        </motion.div>
      )}

      {view === 'addCard' && <AddCardForm />}
      {view === 'addCategory' && <AddCategoryForm />}
      {view === 'view-cards' && <ViewCards />}
      {view === 'view-categories' && <ViewCategories />}
      {/* Juego de tarjetas */}
      {view === 'play' && filteredFlashcards.length > 0 && (
        showSummary ? <GameSummary /> : <Flashcard word={filteredFlashcards[currentIndex]} />
      )
      }

      {/* Modal edición de card */}
      {isModalOpenCard && (
        <EditModalCard
          card={editCard}
          categories={categories}
          onSave={handleSaveEditCard}
          onClose={() => {
            setIsModalOpenCard(false);
            setEditCard(null);
          }}
        />
      )}
      
      {/* Modal edición de category */}
      {isModalOpenCategory && (
        <EditModalCategory
          cat={editCategory}
          onSave={handleSaveEditCategory}
          onClose={() => {
            setIsModalOpenCategory(false);
            setEditCategory(null);
          }}
        />
      )}
    </div>
  );
}
