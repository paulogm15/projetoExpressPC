import AlunoForm from "./components/AlunoForm";
import AlunoList from "./components/AlunoList";

export default function AlunosPage() {
  return (
    <div className="space-y-8">
      <AlunoForm onSuccess={() => window.location.reload()} />
      <AlunoList />
    </div>
  );
}
