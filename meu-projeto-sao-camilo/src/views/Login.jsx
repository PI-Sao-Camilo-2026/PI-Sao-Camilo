import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function Login() {
  return (
    <div className="min-h-screen bg-[#dce3e9] flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-white border-b-4 border-[#b11f24] p-4 flex items-center justify-center gap-2">
        <img src="/logo-sao-camilo.png" alt="Logo" className="h-10" />
        <div className="flex flex-col">
          <h1 className="font-bold text-[#b11f24] text-xl leading-none">SÃO CAMILO</h1>
          <span className="text-gray-600 text-sm">Nutri - Esportiva</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 w-full max-w-md">
        <div className="bg-[#b11f24] rounded-full p-6 mb-4">
          <img src="/icon-soccer.png" alt="Ícone" className="w-16 h-16 invert" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800">Bem-vindo!</h2>
        <p className="text-gray-600 text-sm mb-8">Acesse sua conta para continuar</p>

        <Input label="E-mail" type="email" placeholder="exemplo@email.com" icon="✉️" />
        <Input label="Senha" type="password" placeholder="Digite sua senha" icon="🔒" />

        <div className="w-full flex justify-between items-center mb-6 text-sm text-[#3b73b9]">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <input type="checkbox" className="w-4 h-4" /> Lembrar de mim
          </label>
          <a href="#" className="hover:underline">Esqueceu sua senha?</a>
        </div>

        <Button icon="🔒">Entrar</Button>

        <div className="w-full flex items-center my-6">
          <hr className="flex-1 border-gray-400" />
          <span className="px-4 text-gray-500 font-bold">OU</span>
          <hr className="flex-1 border-gray-400" />
        </div>

        <Button variant="secondary" icon="👤">Cadastre-se</Button>
      </main>

      {/* Footer Navigation */}
      <nav className="w-full bg-[#b11f24] flex justify-around py-2 text-white text-[10px] uppercase font-bold">
        <div className="flex flex-col items-center opacity-100 border-t-2 border-white pt-1">
          <span>🏠</span> INÍCIO
        </div>
        <div className="flex flex-col items-center opacity-70">
          <span>📋</span> HISTÓRICO
        </div>
        <div className="flex flex-col items-center opacity-70">
          <span>❤️</span> OBSERVAÇÕES
        </div>
        <div className="flex flex-col items-center opacity-70">
          <span>👤</span> PERFIL
        </div>
      </nav>
    </div>
  );
}
