"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

const schema = z.object({
  codigo: z.string().min(3),
  nome: z.string().min(3),
  semestre: z.string(),
  ano: z.string(),
  professorId: z.string().min(1),
});

export default function AdminFormTurma() {
  const [professores, setProfessores] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Professores
  useEffect(() => {
    async function loadProfessores() {
      try {
        const res = await axios.get("/api/admin/professores");
        setProfessores(res.data);
      } catch (err) {
        toast.error("Erro ao carregar professores.");
      }
    }

    loadProfessores();
  }, []);

  // CREATE TURMA - agora apontando para o local correto
  async function onSubmit(data: any) {
    try {
      await axios.post("/admin/turmas/api", data); // <------------- AJUSTADO
      toast.success("Turma criada com sucesso!");
    } catch (e) {
      console.log(e);
      toast.error("Erro ao criar turma.");
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Criar Nova Turma</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">

          <div>
            <Label>Código</Label>
            <Input placeholder="ADS001" {...register("codigo")} />
            {errors.codigo && <p className="text-red-500 text-sm">Código inválido</p>}
          </div>

          <div>
            <Label>Nome da Turma</Label>
            <Input placeholder="Algoritmos e Programação" {...register("nome")} />
          </div>

          <div>
            <Label>Semestre</Label>
            <Input type="number" placeholder="1" {...register("semestre")} />
          </div>

          <div>
            <Label>Ano</Label>
            <Input type="number" placeholder="2025" {...register("ano")} />
          </div>

          <div>
            <Label>Professor Responsável</Label>
            <Select onValueChange={(v) => setValue("professorId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o professor" />
              </SelectTrigger>
              <SelectContent>
                {professores.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Nenhum professor encontrado
                  </SelectItem>
                ) : (
                  professores.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit">Criar Turma</Button>
        </form>
      </CardContent>
    </Card>
  );
}
