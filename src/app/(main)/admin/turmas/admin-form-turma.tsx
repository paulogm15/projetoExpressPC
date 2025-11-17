"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// ---------------- SCHEMA ----------------

const turmaSchema = z.object({
  codigo: z.string().min(1, "Código obrigatório"),
  nome: z.string().min(1, "Nome obrigatório"),
  semestre: z.number().min(1).max(2),
  ano: z.number().min(2000).max(2100),
  materiaIds: z.array(z.number()).min(1, "Selecione ao menos 1 matéria"),
});

type TurmaFormData = z.infer<typeof turmaSchema>;

// ---------------- COMPONENTE ----------------

// materias agora é OPCIONAL
export default function TurmaForm({ materias = [] }: { materias?: any[] }) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TurmaFormData>({
    resolver: zodResolver(turmaSchema),
    defaultValues: {
      semestre: 1,
      ano: new Date().getFullYear(),
      materiaIds: [],
    },
  });

  const selectedMaterias = watch("materiaIds");

  // --------------- SUBMIT ---------------
  async function onSubmit(data: TurmaFormData) {
    try {
      const response = await fetch("/api/turma", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Erro ao salvar turma.");

      toast({
        title: "Sucesso!",
        description: "Turma cadastrada corretamente.",
      });

      reset();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  // --------------- COMPONENTE ---------------
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 border p-6 rounded-xl shadow-sm bg-white"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Código */}
        <div>
          <Label htmlFor="codigo">Código</Label>
          <Input id="codigo" {...register("codigo")} />
          {errors.codigo && (
            <p className="text-red-500 text-sm">{errors.codigo.message}</p>
          )}
        </div>

        {/* Nome */}
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" {...register("nome")} />
          {errors.nome && (
            <p className="text-red-500 text-sm">{errors.nome.message}</p>
          )}
        </div>

        {/* Semestre */}
        <div>
          <Label>Semestre</Label>
          <Select
            defaultValue="1"
            onValueChange={(value) => setValue("semestre", Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
            </SelectContent>
          </Select>

          {errors.semestre && (
            <p className="text-red-500 text-sm">
              {errors.semestre.message?.toString()}
            </p>
          )}
        </div>

        {/* Ano */}
        <div>
          <Label htmlFor="ano">Ano</Label>
          <Input
            id="ano"
            type="number"
            {...register("ano", { valueAsNumber: true })}
          />
          {errors.ano && (
            <p className="text-red-500 text-sm">{errors.ano.message}</p>
          )}
        </div>
      </div>

      {/* Matérias */}
      <div>
        <Label>Matérias</Label>

        {materias.length === 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            Nenhuma matéria cadastrada ainda.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {materias.map((m: any) => (
            <label
              key={m.id}
              className="flex items-center gap-2 p-2 border rounded-md cursor-pointer"
            >
              <input
                type="checkbox"
                value={m.id}
                checked={selectedMaterias.includes(m.id)}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const current = watch("materiaIds");

                  setValue(
                    "materiaIds",
                    current.includes(id)
                      ? current.filter((x) => x !== id)
                      : [...current, id]
                  );
                }}
              />
              {m.nome}
            </label>
          ))}
        </div>

        {errors.materiaIds && (
          <p className="text-red-500 text-sm">{errors.materiaIds.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Cadastrar Turma"}
      </Button>
    </form>
  );
}
