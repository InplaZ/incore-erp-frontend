import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { BarChart3, Calendar } from 'lucide-react';
import { reportesApi } from '@/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Input';

const COLORS = ['#16a34a', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'];

export function ReportesPage() {
  const [periodo, setPeriodo] = useState('mes');

  const { data: pedidosPorEstado = [], isLoading: l1 } = useQuery({ queryKey: ['r-pedidos-estado'], queryFn: reportesApi.pedidosPorEstado });
  const { data: produccionPorMaquina = [], isLoading: l2 } = useQuery({ queryKey: ['r-produccion-maquina'], queryFn: reportesApi.produccionPorMaquina });
  const { data: ventasMensuales = [], isLoading: l3 } = useQuery({ queryKey: ['r-ventas'], queryFn: reportesApi.ventasMensuales });
  const { data: despachosPorEstado = [], isLoading: l4 } = useQuery({ queryKey: ['r-despachos'], queryFn: reportesApi.despachosPorEstado });

  if (l1 || l2 || l3 || l4) return <LoadingState message="Cargando reportes..." />;

  return (
    <div>
      <PageHeader
        title="Reportes"
        subtitle="Análisis y métricas operativas"
        actions={
          <Select value={periodo} onChange={e => setPeriodo(e.target.value)} className="w-auto">
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
            <option value="anio">Año</option>
          </Select>
        }
        breadcrumb={[{ label: 'Reportes' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos por estado */}
        <Card>
          <CardHeader><CardTitle>Pedidos por estado</CardTitle></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pedidosPorEstado}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="estado" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="cantidad" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Producción por máquina */}
        <Card>
          <CardHeader><CardTitle>Producción por máquina</CardTitle></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={produccionPorMaquina} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="maquina" tick={{ fontSize: 11 }} width={50} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="producido" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Ventas mensuales */}
        <Card>
          <CardHeader><CardTitle>Ventas mensuales</CardTitle></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={ventasMensuales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Line type="monotone" dataKey="monto" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Despachos por estado */}
        <Card>
          <CardHeader><CardTitle>Despachos por estado</CardTitle></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={despachosPorEstado} dataKey="cantidad" nameKey="estado" cx="50%" cy="50%" outerRadius={90} label={(e: any) => e.estado}>
                  {despachosPorEstado.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
