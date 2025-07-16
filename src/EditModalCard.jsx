import React, { useState, useEffect } from "react";

export default function EditModalCard({ card, categories, onSave, onClose }) {
    const [english, setEnglish] = useState("");
    const [spanish, setSpanish] = useState("");
    const [category, setCategory] = useState("");

    useEffect(() => {
        if (card) {
            setEnglish(card.english);
            setSpanish(card.spanish);
            setCategory(card.category_id);
        }
    }, [card]);

    const handleSave = () => {
        onSave({
            ...card,
            english,
            spanish,
            category_id: Number(category),
        });
    };

    if (!card) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg text-black w-96">
                <h3 className="text-lg font-bold mb-4">Editar Tarjeta</h3>
                <input
                    value={english}
                    onChange={(e) => setEnglish(e.target.value)}
                    className="border p-2 mb-2 w-full"
                    placeholder="Inglés"
                />
                <input
                    value={spanish}
                    onChange={(e) => setSpanish(e.target.value)}
                    className="border p-2 mb-2 w-full"
                    placeholder="Español"
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
                        onClick={handleSave}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Guardar
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-300 text-black px-4 py-2 rounded"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
