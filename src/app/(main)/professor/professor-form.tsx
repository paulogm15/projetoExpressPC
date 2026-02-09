import React, { useState, FormEvent } from 'react';

interface ProfessorFormProps {
    onSubmit?: (data: ProfessorFormData) => void;
    initialData?: ProfessorFormData;
}

export interface ProfessorFormData {
    nome: string;
    email: string;
    departamento: string;
}

const ProfessorForm: React.FC<ProfessorFormProps> = ({ onSubmit, initialData }) => {
    const [form, setForm] = useState<ProfessorFormData>({
        nome: initialData?.nome || '',
        email: initialData?.email || '',
        departamento: initialData?.departamento || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(form);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <div>
                <label htmlFor="nome" className="block font-medium">Nome</label>
                <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2 w-full"
                />
            </div>
            <div>
                <label htmlFor="email" className="block font-medium">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2 w-full"
                />
            </div>
            <div>
                <label htmlFor="departamento" className="block font-medium">Departamento</label>
                <input
                    type="text"
                    id="departamento"
                    name="departamento"
                    value={form.departamento}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2 w-full"
                />
            </div>
            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Salvar
            </button>
        </form>
    );
};

export default ProfessorForm;