import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/app/store/auth.store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/');
      } else {
        setError('Credenciales incorrectas. Verifique su usuario y contraseña.');
      }
    } catch {
      setError('No fue posible iniciar sesión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-inplaz-900 text-blue-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-inplaz-500/20 rounded-full blur-3xl -ml-20 -mb-20" />

        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-brand-500 flex items-center justify-center">
            <Boxes className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold">INPLAZ</p>
            <p className="text-sm text-inplaz-300">IN-SYSTEM</p>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-3xl font-bold leading-tight">Plataforma operativa<br />para la gestión industrial</h1>
          <p className="text-inplaz-200 mt-4 text-lg">Pedidos, producción, viabilidad, máquinas, despachos y comercial — todo conectado en un solo flujo.</p>

          <div className="mt-8 space-y-3">
            {['Flujo integrado de cotización a entrega', 'Kanban de pedidos y producción', 'Viabilidad técnica automatizada', 'Control de máquinas y despachos'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-inplaz-200">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-inplaz-400">© 2026 INPLAZ · IN-SYSTEM</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-10 w-10 rounded-lg bg-brand-500 flex items-center justify-center">
              <Boxes className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800">INPLAZ</p>
              <p className="text-xs text-slate-500">IN-SYSTEM</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800">Iniciar sesión</h2>
          <p className="text-sm text-slate-500 mt-1">Acceda a su plataforma operativa</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="pl-9"
                  placeholder="Ingrese su usuario"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-9" placeholder="••••••••" required />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-danger-50 border border-danger-200 px-3 py-2 text-sm text-danger-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Ingresar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 p-3 rounded-lg bg-inplaz-50 border border-inplaz-100 text-xs text-inplaz-700">
            <p className="font-medium mb-1">Cuentas de demostración:</p>
            <p>carlos@inplaz.com · Supervisor</p>
            <p>maria@inplaz.com · Comercial</p>
            <p>roberto@inplaz.com · Administrador</p>
          </div>
        </div>
      </div>
    </div>
  );
}
