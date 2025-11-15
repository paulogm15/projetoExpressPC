// app/(main)/professor/components/FormularioReserva.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
// Importamos a action e o tipo
import { criarReserva, type State } from "../actions"; 
// Importamos o TIPO 'Turma' do seu local gerado
import type { Turma } from "@/generated/prisma"; 

// Componentes UI (assumindo shadcn/ui)
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
import { useRef } from "react";

// Botão que mostra "Carregando..."
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Reservando..." : "Reservar"}
    </Button>
  );
}

// Propriedades: O formulário só precisa saber as turmas
interface FormularioReservaProps {
  turmas: Turma[];
}

export function FormularioReserva({ turmas }: FormularioReservaProps) {
  
  // Estado inicial do useFormState
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useFormState(criarReserva, initialState);
  
  const formRef = useRef<HTMLFormElement>(null);

  // Limpa o formulário em caso de sucesso
  if (state.message && !state.errors) {
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={dispatch} className="space-y-4">
      {/* Seleção de Turma */}
      <div>
        <Label htmlFor="turmaId">Turma</Label>
        <Select name="turmaId">
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
        {state.errors?.turmaId && (
          <p className="mt-1 text-sm text-red-500">{state.errors.turmaId[0]}</p>
        )}
      </div>

      {/* Data da Aula */}
      <div>
        <Label htmlFor="dataAula">Data da Aula</Label>
        <Input 
          id="dataAula" 
          name="dataAula" 
          type="date" 
          defaultValue={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
        />
        {state.errors?.dataAula && (
          <p className="mt-1 text-sm text-red-500">{state.errors.dataAula[0]}</p>
        )}
      </div>

      {/* Quantidade de Notebooks */}
      <div>
        <Label htmlFor="qtdNotebooks">Quantidade de Notebooks</Label>
        <Input
          id="qtdNotebooks"
          name="qtdNotebooks"
          type="number"
          placeholder="Ex: 30"
          min="1"
        />
        {state.errors?.qtdNotebooks && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.qtdNotebooks[0]}
          </p>
        )}
      </div>

      {/* Erro Geral (Ex: falta de estoque) */}
      {state.errors?.geral && (
        <p className="mt-1 text-sm text-red-500">{state.errors.geral[0]}</p>
      )}
      
      {/* Mensagem de Sucesso */}
      {state.message && !state.errors && (
         <p className="mt-1 text-sm text-green-600">{state.message}</p>
      )}

      <SubmitButton />
    </form>
  );
}