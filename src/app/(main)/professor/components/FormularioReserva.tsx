// app/(main)/professor/components/FormularioReserva.tsx
"use client";

import { useFormStatus } from "react-dom";
import React, { useState, useRef, useEffect } from "react";
import { criarReserva, type State } from "../actions";
import type { Turma, Materia } from "@/generated/prisma";

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

interface FormularioReservaProps {
  turmas: (Turma & {
    materias: Materia[];
  })[];
}

export function FormularioReserva({ turmas }: FormularioReservaProps) {
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = React.useActionState(criarReserva, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [selectedTurmaId, setSelectedTurmaId] = useState<string>("");

  const selectedTurma = turmas.find(
    (turma) => turma.id === Number(selectedTurmaId)
  );
  const materiasDaTurma = selectedTurma?.materias ?? [];

  useEffect(() => {
    if (state.message && !state.errors) {
      formRef.current?.reset();
      setSelectedTurmaId("");
    }
  }, [state]);

  return (
    <form ref={formRef} action={dispatch} className="space-y-4">
      {/* TURMA */}
      <div>
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
                  {turma.nome} ({turma.codigo})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="0" disabled>
                Nenhuma turma cadastrada
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Esta verificação de erro agora funciona
            porque corrigimos o 'State' em actions.ts */}
        {state.errors?.turmaId && (
          <p className="text-sm text-red-500 mt-1">
            {state.errors.turmaId[0]}
          </p>
        )}
      </div>

      {/* MATÉRIA */}
      <div>
        <Label htmlFor="materiaId">Matéria</Label>
        <Select
          name="materiaId"
          disabled={materiasDaTurma.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a matéria" />
          </SelectTrigger>
          <SelectContent>
            {materiasDaTurma.length > 0 ? (
              materiasDaTurma.map((materia) => (
                <SelectItem key={materia.id} value={String(materia.id)}>
                  {materia.nome}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="0" disabled>
                {selectedTurmaId
                  ? "Nenhuma matéria para esta turma"
                  : "Selecione uma turma primeiro"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        
        {/* ----- INÍCIO DA CORREÇÃO ----- */}
        {/* Removemos a verificação '|| state.errors?.materia' */}
        {state.errors?.materiaId && (
          <p className="text-sm text-red-500 mt-1">
            {state.errors.materiaId[0]}
          </p>
        )}
        {/* ----- FIM DA CORREÇÃO ----- */}

      </div>

      {/* DATA */}
      <div>
        <Label htmlFor="dataAula">Data</Label>
        <Input
          id="dataAula"
          name="dataAula"
          type="date"
          defaultValue={new Date(Date.now() + 86400000)
            .toISOString()
            .split("T")[0]}
        />
        {state.errors?.dataAula && (
          <p className="text-sm text-red-500 mt-1">
            {state.errors.dataAula[0]}
          </p>
        )}
      </div>

      {/* HORÁRIO */}
      <div>
        <Label htmlFor="horario">Horário</Label>
        <Input id="horario" name="horario" type="time" />
        {state.errors?.horario && (
          <p className="text-sm text-red-500 mt-1">
            {state.errors.horario[0]}
          </p>
        )}
      </div>

      {/* TURNO */}
      <div>
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
          <p className="text-sm text-red-500 mt-1">{state.errors.turno[0]}</p>
        )}
      </div>

      {/* QUANTIDADE */}
      <div>
        <Label htmlFor="qtdNotebooks">Quantidade</Label>
        <Input
          id="qtdNotebooks"
          name="qtdNotebooks"
          type="number"
          min="1"
          placeholder="Ex: 25"
        />
        {state.errors?.qtdNotebooks && (
          <p className="text-sm text-red-500 mt-1">
            {state.errors.qtdNotebooks[0]}
          </p>
        )}
      </div>

      {/* ERRO GERAL */}
      {state.errors?.geral && (
        <p className="text-sm text-red-500">{state.errors.geral[0]}</p>
      )}

      {/* SUCESSO */}
      {state.message && !state.errors && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}

      <SubmitButton />
    </form>
  );
}