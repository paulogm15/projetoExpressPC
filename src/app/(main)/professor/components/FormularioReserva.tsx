// app/(main)/professor/components/FormularioReserva.tsx
"use client";

import { useFormStatus } from "react-dom";
import React, { useState, useRef, useEffect } from "react";
import { criarReserva, type State } from "../actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Botão com estado de carregamento
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Reservando..." : "Reservar"}
    </Button>
  );
}

// Interface ajustada para os dados formatados que vêm da page.tsx
interface FormularioReservaProps {
  turmas: {
    id: number;
    codigo: string;
    nome: string;
    semestre: number;
    ano: number;
    materias: {
      id: number;
      nome: string;
      codigo: string;
    }[];
  }[];
}

export function FormularioReserva({ turmas }: FormularioReservaProps) {
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = React.useActionState(criarReserva, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [selectedTurmaId, setSelectedTurmaId] = useState<string>("");

  // Busca a turma selecionada para filtrar as matérias em tempo real
  const selectedTurma = turmas.find(
    (turma) => turma.id === Number(selectedTurmaId)
  );
  const materiasDaTurma = selectedTurma?.materias ?? [];

  // Efeito para limpar o formulário após sucesso
  useEffect(() => {
    if (state.message && Object.keys(state.errors || {}).length === 0) {
      formRef.current?.reset();
      setSelectedTurmaId("");
    }
  }, [state]);

  return (
    <form ref={formRef} action={dispatch} className="space-y-4">
      {/* TURMA */}
      <div className="space-y-2">
        <Label htmlFor="turmaId">Turma</Label>
        <Select
          name="turmaId"
          value={selectedTurmaId}
          onValueChange={(value) => setSelectedTurmaId(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione sua turma" />
          </SelectTrigger>
          <SelectContent>
            {turmas.length > 0 ? (
              turmas.map((turma) => (
                <SelectItem key={turma.id} value={String(turma.id)}>
                  {turma.codigo} - {turma.nome}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="0" disabled>
                Nenhuma turma disponível
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {state.errors?.turmaId && (
          <p className="text-xs text-red-500">{state.errors.turmaId[0]}</p>
        )}
      </div>

      {/* MATÉRIA */}
      <div className="space-y-2">
        <Label htmlFor="materiaId">Matéria</Label>
        <Select name="materiaId" disabled={materiasDaTurma.length === 0}>
          <SelectTrigger>
            <SelectValue placeholder={selectedTurmaId ? "Selecione a matéria" : "Selecione a turma primeiro"} />
          </SelectTrigger>
          <SelectContent>
            {materiasDaTurma.map((materia) => (
              <SelectItem key={materia.id} value={String(materia.id)}>
                {materia.nome} ({materia.codigo})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.materiaId && (
          <p className="text-xs text-red-500">{state.errors.materiaId[0]}</p>
        )}
      </div>

      {/* GRID PARA DATA E HORÁRIO */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dataAula">Data</Label>
          <Input
            id="dataAula"
            name="dataAula"
            type="date"
            defaultValue={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
          />
          {state.errors?.dataAula && (
            <p className="text-xs text-red-500">{state.errors.dataAula[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="horario">Horário</Label>
          <Input id="horario" name="horario" type="time" />
          {state.errors?.horario && (
            <p className="text-xs text-red-500">{state.errors.horario[0]}</p>
          )}
        </div>
      </div>

      {/* TURNO */}
      <div className="space-y-2">
        <Label htmlFor="turno">Turno</Label>
        <Select name="turno">
          <SelectTrigger>
            <SelectValue placeholder="Selecione o turno" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MANHA">Manhã</SelectItem>
            <SelectItem value="TARDE">Tarde</SelectItem>
            <SelectItem value="NOITE">Noite</SelectItem>
          </SelectContent>
        </Select>
        {state.errors?.turno && (
          <p className="text-xs text-red-500">{state.errors.turno[0]}</p>
        )}
      </div>

      {/* QUANTIDADE */}
      <div className="space-y-2">
        <Label htmlFor="qtdNotebooks">Quantidade de Notebooks</Label>
        <Input
          id="qtdNotebooks"
          name="qtdNotebooks"
          type="number"
          min="1"
          placeholder="Ex: 25"
        />
        {state.errors?.qtdNotebooks && (
          <p className="text-xs text-red-500">{state.errors.qtdNotebooks[0]}</p>
        )}
      </div>

      {/* MENSAGENS DE FEEDBACK */}
      {state.errors?.geral && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200">
           <p className="text-xs text-red-600 font-medium">{state.errors.geral[0]}</p>
        </div>
      )}

      {state.message && Object.keys(state.errors || {}).length === 0 && (
        <div className="p-3 rounded-md bg-green-50 border border-green-200">
           <p className="text-xs text-green-600 font-medium">{state.message}</p>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}