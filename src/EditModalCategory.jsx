import React, { useState, useEffect } from "react";

export default function EditModalCard({ cat, onSave, onClose }) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (cat) {
            setName(cat.name);
        }
    }, [cat]);

    const handleSave = () => {
        onSave({
            ...cat,
            name,
        });
    };

    if (!cat) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg text-black w-96">
                <h3 className="text-lg font-bold mb-4">Editar Categoria</h3>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 mb-2 w-full"
                    placeholder="Nombre de la categoría"
                />
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
