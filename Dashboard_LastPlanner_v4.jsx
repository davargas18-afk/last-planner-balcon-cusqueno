import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, ReferenceLine
} from 'recharts';
import {
  Building2, AlertTriangle, TrendingUp, TrendingDown, CheckCircle2, Clock,
  AlertCircle, Plus, X, Filter, Search, Calendar, MapPin, Users, Package,
  FileText, BarChart3, Activity, Layers, ChevronRight, RotateCcw, ArrowUp,
  ArrowDown, Minus, Hammer, Ruler, Eye, Edit2, Trash2, Check, Lock, Unlock,
  CalendarDays, ClipboardCheck, GitCommit, FileSignature, XCircle, PenSquare,
  ChevronDown, Printer, Upload, Download, Image, Camera, MessageSquare, HardHat
} from 'lucide-react';

// ============================================================================
// INITIAL DATA — PASAJE BALCÓN CUSQUEÑO
// ============================================================================

const PROJECT = {
  name: "Pasaje Balcón Cusqueño",
  subtitle: "Plazoleta Tricentenario / Calle Huaynapata",
  code: 2655049,
  meta: "258-2026",
  modalidad: "Administración Directa",
  entidad: "Municipalidad Provincial del Cusco",
  totalLength: 144.69,
  // Presupuesto REAL del expediente técnico
  BAC: 942707.27,            // Total (CD + GG + Sup + ET + Eval + Liq)
  BAC_directo: 584847.13,    // Costo Directo (lo que se gestiona en obra)
  BAC_GG: 193043.54,         // Gastos Generales (33.01%)
  BAC_sup: 56321.63,         // Supervisión (9.63%)
  BAC_expTec: 49658.01,      // Expediente Técnico (8.49%)
  BAC_eval: 29584.90,        // Evaluación (5.06%)
  BAC_liq: 29252.06,         // Liquidación (5.00%)
  startDate: "2026-03-30",
  endDate: "2026-07-28",
  totalWeeks: 17,
};

const TODAY = new Date().toISOString().split('T')[0];
const CURRENT_WEEK = Math.min(
  PROJECT.totalWeeks,
  Math.max(1, Math.floor((new Date(TODAY) - new Date(PROJECT.startDate)) / (7 * 24 * 60 * 60 * 1000)) + 1)
);

// Desglose de presupuesto para visualización
const FINANCIAL_BREAKDOWN = [
  { id: 'directo',  name: 'Costo Directo',     budget: 584847.13, pct: 62.04, color: '#1E40AF', desc: 'Materiales, MO, equipos · GESTIONADO' },
  { id: 'GG',       name: 'Gastos Generales',  budget: 193043.54, pct: 20.48, color: '#10B981', desc: 'Operativos mensuales' },
  { id: 'sup',      name: 'Supervisión',       budget: 56321.63,  pct: 5.97,  color: '#F59E0B', desc: 'Residente, inspector' },
  { id: 'expTec',   name: 'Expediente Técnico', budget: 49658.01, pct: 5.27,  color: '#94A3B8', desc: 'Pago anticipado' },
  { id: 'eval',     name: 'Evaluación',        budget: 29584.90,  pct: 3.14,  color: '#8B5CF6', desc: 'Al cierre' },
  { id: 'liq',      name: 'Liquidación',       budget: 29252.06,  pct: 3.10,  color: '#A855F7', desc: 'Al cierre' },
];

// SECTORES (antes TRAMOS) — los 7 tramos del pasaje
const SECTORES = [
  { id: "T01", name: "TRAMO 01", inicio: "0+000.00", fin: "0+023.30", length: 23.30, color: "#3B82F6" },
  { id: "T02", name: "TRAMO 02", inicio: "0+023.30", fin: "0+031.11", length: 7.81, color: "#10B981" },
  { id: "T03", name: "TRAMO 03", inicio: "0+031.11", fin: "0+046.31", length: 15.20, color: "#F59E0B" },
  { id: "T04", name: "TRAMO 04", inicio: "0+046.31", fin: "0+055.41", length: 9.10, color: "#F97316" },
  { id: "T05", name: "TRAMO 05", inicio: "0+055.41", fin: "0+095.60", length: 40.19, color: "#EF4444" },
  { id: "T06", name: "TRAMO 06", inicio: "0+095.60", fin: "0+117.75", length: 22.15, color: "#8B5CF6" },
  { id: "T07", name: "TRAMO 07", inicio: "0+117.75", fin: "0+144.69", length: 26.94, color: "#1E40AF" },
];

// Alias para compatibilidad con código existente
const TRAMOS = SECTORES;

// PV mensual acumulado por bucket (basado en BAC_directo real)
const PV_MONTHLY = [
  { mes: 'Mar', directo: 21810,  GG: 7197,   sup: 2099,  expTec: 49658, eval: 0,     liq: 0     },
  { mes: 'Abr', directo: 75173,  GG: 24802,  sup: 7235,  expTec: 49658, eval: 0,     liq: 0     },
  { mes: 'May', directo: 244780, GG: 80755,  sup: 23554, expTec: 49658, eval: 0,     liq: 0     },
  { mes: 'Jun', directo: 477015, GG: 157372, sup: 45905, expTec: 49658, eval: 14792, liq: 0     },
  { mes: 'Jul', directo: 584847, GG: 193044, sup: 56322, expTec: 49658, eval: 29585, liq: 29252 },
];

const INITIAL_EV_MONTHLY = [
  { mes: 'Mar', directo: 13652, GG: 4504,  sup: 1314, expTec: 49658, eval: 0, liq: 0 },
  { mes: 'Abr', directo: 47065, GG: 15530, sup: 4530, expTec: 49658, eval: 0, liq: 0 },
  { mes: 'May', directo: 65854, GG: 21726, sup: 6336, expTec: 49658, eval: 0, liq: 0 },
  { mes: 'Jun', directo: null,  GG: null,  sup: null, expTec: 49658, eval: 0, liq: 0 },
  { mes: 'Jul', directo: null,  GG: null,  sup: null, expTec: 49658, eval: 0, liq: 0 },
];

const INITIAL_AC_MONTHLY = [
  { mes: 'Mar', directo: 14500, GG: 7200,  sup: 1900, expTec: 49658, eval: 0, liq: 0 },
  { mes: 'Abr', directo: 49500, GG: 24800, sup: 6400, expTec: 49658, eval: 0, liq: 0 },
  { mes: 'May', directo: 69000, GG: 50000, sup: 12000, expTec: 49658, eval: 0, liq: 0 },
  { mes: 'Jun', directo: null,  GG: null,  sup: null,  expTec: 49658, eval: 0, liq: 0 },
  { mes: 'Jul', directo: null,  GG: null,  sup: null,  expTec: 49658, eval: 0, liq: 0 },
];

// (TRAMOS y SECTORES ya están definidos arriba)


const TRENES = [
  { id: 'BUZONES_CC', name: 'Buzones CCTV', frente: 'CCTV', global: false, color: '#10B981' },
  { id: 'BUZONES_IE', name: 'Buzones eléctricos', frente: 'IIEE', global: false, color: '#713F12' },
  { id: 'CABLES_CC', name: 'Cableado fibra óptica + F/UTP CCTV', frente: 'CCTV', global: false, color: '#0F766E' },
  { id: 'CABLES_IE', name: 'Cableado eléctrico N2XOH', frente: 'IIEE', global: false, color: '#854D0E' },
  { id: 'CAMARAS', name: 'Cámaras IP + servidor', frente: 'CCTV', global: false, color: '#065F46' },
  { id: 'CANAL_PLU', name: 'Limpieza canal pluvial', frente: 'IISS', global: false, color: '#0284C7' },
  { id: 'COBERTURA', name: 'Cobertura policarbonato pérgola', frente: 'ARQUIT', global: false, color: '#0891B2' },
  { id: 'CONEXION', name: 'Conexión a red eléctrica externa', frente: 'IIEE', global: true, color: '#EAB308' },
  { id: 'CONTRAPISO', name: 'Contrapisos', frente: 'ARQUIT', global: false, color: '#65A30D' },
  { id: 'DADOS', name: 'Dados de concreto', frente: 'ESTRUCTURAS', global: false, color: '#D97706' },
  { id: 'DEMOL', name: 'Demoliciones', frente: 'ESTRUCTURAS', global: false, color: '#78716C' },
  { id: 'DESM_IE', name: 'Desmontaje instalaciones existentes', frente: 'IIEE', global: true, color: '#7C2D12' },
  { id: 'DUCTOS_CC', name: 'Tuberías CCTV', frente: 'CCTV', global: false, color: '#115E59' },
  { id: 'DUCTOS_IE', name: 'Tuberías PVC eléctricas', frente: 'IIEE', global: false, color: '#A16207' },
  { id: 'ELEM_ORN', name: 'Elementos ornamentales menores', frente: 'ARQUIT', global: false, color: '#C026D3' },
  { id: 'EXC_DADOS', name: 'Excavación dados/mamparas', frente: 'ESTRUCTURAS', global: false, color: '#F59E0B' },
  { id: 'FAROLAS', name: 'Farolas LED 100W', frente: 'IIEE', global: false, color: '#C2410C' },
  { id: 'GABINETE', name: 'Gabinete + switches + UPS + PDU', frente: 'CCTV', global: true, color: '#047857' },
  { id: 'GEN_AMB', name: 'Generales - Manejo Ambiental', frente: 'OBRAS_PROV', global: true, color: '#94A3B8' },
  { id: 'GEN_PROV', name: 'Generales - Obras Provisionales', frente: 'OBRAS_PROV', global: true, color: '#94A3B8' },
  { id: 'GEN_SEG', name: 'Generales - Seguridad y Salud', frente: 'OBRAS_PROV', global: true, color: '#94A3B8' },
  { id: 'JARDINERIA', name: 'Jardinería y maseteros plásticos', frente: 'ARQUIT', global: false, color: '#22C55E' },
  { id: 'MAMPARAS', name: 'Mamparas de fierro con vidrio', frente: 'ARQUIT', global: false, color: '#155E75' },
  { id: 'MOBILIARIO', name: 'Mobiliario urbano (bancas, basureros)', frente: 'ARQUIT', global: false, color: '#9333EA' },
  { id: 'PERGOLAS', name: 'Pérgolas metálicas', frente: 'ARQUIT', global: false, color: '#7C3AED' },
  { id: 'PINTURA', name: 'Pintura (anticorrosiva + esmalte)', frente: 'ARQUIT', global: false, color: '#EC4899' },
  { id: 'PISO_CR', name: 'Piso canto rodado', frente: 'ARQUIT', global: false, color: '#16A34A' },
  { id: 'PISO_LAJA', name: 'Piso laja regular (picapedrero)', frente: 'ARQUIT', global: false, color: '#15803D' },
  { id: 'POSTES', name: 'Postes y pastorales ornamentales', frente: 'IIEE', global: false, color: '#FB923C' },
  { id: 'PRELIM', name: 'Preliminares (limpieza, trazo)', frente: 'ESTRUCTURAS', global: false, color: '#A8A29E' },
  { id: 'PRUEBAS_IE', name: 'Pruebas eléctricas', frente: 'IIEE', global: true, color: '#9A3412' },
  { id: 'PUERTAS', name: 'Puertas metálicas', frente: 'ARQUIT', global: false, color: '#0E7490' },
  { id: 'REJAS', name: 'Rejas decorativas y maseteros', frente: 'ARQUIT', global: false, color: '#A855F7' },
  { id: 'REVOQUES', name: 'Revoques y tarrajeos', frente: 'ARQUIT', global: false, color: '#84CC16' },
  { id: 'SALIDAS_CC', name: 'Salidas datos CCTV', frente: 'CCTV', global: false, color: '#134E4A' },
  { id: 'SALIDAS_IE', name: 'Salidas eléctricas', frente: 'IIEE', global: false, color: '#CA8A04' },
  { id: 'SARDINELES', name: 'Sardineles', frente: 'ARQUIT', global: false, color: '#166534' },
  { id: 'TABLEROS', name: 'Tableros y dispositivos eléctricos', frente: 'IIEE', global: true, color: '#FDE047' },
  { id: 'TIERRA_CC', name: 'Sistema puesta a tierra CCTV', frente: 'CCTV', global: true, color: '#064E3B' },
  { id: 'TIERRA_IE', name: 'Sistema puesta a tierra IIEE', frente: 'IIEE', global: false, color: '#EA580C' },
  { id: 'VIDRIO', name: 'Vidrios templados (mamparas)', frente: 'ARQUIT', global: false, color: '#0EA5E9' },
  { id: 'ZANJAS_CC', name: 'Zanjas CCTV', frente: 'CCTV', global: false, color: '#059669' },
  { id: 'ZANJAS_IE', name: 'Zanjas eléctricas (excavación)', frente: 'IIEE', global: false, color: '#FACC15' },
];

const INITIAL_ACTIVIDADES = [
  { id: 'A001', item: '1.1.1.1.1', desc: 'ALQUILER DE ALMACEN Y OFICINAS PARA LA OBRA', tren: 'GEN_PROV', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'mes', metrado: 4.0, precio: 1500.0, costo: 6000.0, metradoEjec: 1.4, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A002', item: '1.1.1.1.2', desc: 'CERCO PROVISIONAL DE PROTECCION DE CALAMINA', tren: 'GEN_PROV', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'm', metrado: 30.0, precio: 99.04, costo: 2971.2, metradoEjec: 10.5, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A003', item: '1.1.1.1.3', desc: 'SERVICIOS HIGIENICOS PORTATILES (1 S.H. EJECUTIVO  02S.H. ESTANDARES)', tren: 'GEN_PROV', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'mes', metrado: 4.0, precio: 1260.0, costo: 5040.0, metradoEjec: 1.4, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A004', item: '1.1.1.1.4', desc: 'CARTEL DE OBRA 3.60 X 2.40 M (MADERA)', tren: 'GEN_PROV', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 1056.87, costo: 1056.87, metradoEjec: 0.35, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A005', item: '1.1.1.2.1', desc: 'AGUA PARA LA CONSTRUCCION', tren: 'GEN_PROV', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'und', metrado: 4.0, precio: 325.0, costo: 1300.0, metradoEjec: 1.4, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A006', item: '1.1.1.2.2', desc: 'DESAGUE PARA LA CONSTRUCCION', tren: 'GEN_PROV', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'und', metrado: 4.0, precio: 430.72, costo: 1722.88, metradoEjec: 1.4, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A007', item: '1.1.1.2.3', desc: 'ENERGIA ELECTRICA PARA LA CONSTRUCCION', tren: 'GEN_PROV', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'und', metrado: 4.0, precio: 286.85, costo: 1147.4, metradoEjec: 1.4, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A008', item: '1.1.1.3.1', desc: 'LIMPIEZA DE TERRENO MANUAL', tren: 'PRELIM', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm²', metrado: 567.28, precio: 1.46, costo: 828.23, metradoEjec: 567.28, inicio: '2026-03-30', fin: '2026-04-19', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A009', item: '1.1.1.3.2', desc: 'ELIMINACIÓN DE BASURA Y ELEMENTOS SUELTOS LIVIANOS', tren: 'PRELIM', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 41.54, precio: 2.93, costo: 121.71, metradoEjec: 41.54, inicio: '2026-03-30', fin: '2026-04-19', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A010', item: '1.1.1.3.3', desc: 'ELIMINACION DE BASURA Y ELEMENTOS SUELTOS PESADOS', tren: 'PRELIM', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 2.5, precio: 251.46, costo: 628.65, metradoEjec: 2.5, inicio: '2026-03-30', fin: '2026-04-19', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A011', item: '1.1.1.4.1', desc: 'ELIMINACIÓN DE VEGETACIÓN', tren: 'PRELIM', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm²', metrado: 15.6, precio: 9.71, costo: 151.48, metradoEjec: 15.6, inicio: '2026-03-30', fin: '2026-04-19', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A012', item: '1.1.1.5.1', desc: 'DESMONTAJE DE PUERTAS METALICAS (REJAS METALICAS)', tren: 'DEMOL', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 77.88, costo: 155.76, metradoEjec: 2.0, inicio: '2026-04-09', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A013', item: '1.1.1.5.2', desc: 'DESMONTAJE DE MOBILIARIO URBANO', tren: 'DEMOL', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 37.73, costo: 75.46, metradoEjec: 2.0, inicio: '2026-04-09', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A014', item: '1.1.1.6.1', desc: 'DEMOLICIÓN DE PARAPETO EXISTENTE MANUAL', tren: 'DEMOL', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 5.23, precio: 7.96, costo: 41.63, metradoEjec: 5.23, inicio: '2026-04-09', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A015', item: '1.1.1.6.2', desc: 'DEMOLICIÓN DE CONCRETO SIMPLE MANUAL R=0.6 M3/D', tren: 'DEMOL', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 3.3, precio: 93.67, costo: 309.11, metradoEjec: 3.3, inicio: '2026-04-09', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A016', item: '1.1.1.6.3', desc: 'PICADO DE CONCRETO PARA ANCLAJE DE DADOS', tren: 'DEMOL', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 3.33, precio: 1.46, costo: 4.86, metradoEjec: 3.33, inicio: '2026-04-09', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A017', item: '1.1.1.6.4', desc: 'RASQUETEO Y DEMANCHADO DE PARAPETO PARA TARRAJEAR', tren: 'DEMOL', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm²', metrado: 45.23, precio: 31.08, costo: 1405.75, metradoEjec: 45.23, inicio: '2026-04-09', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A018', item: '1.1.1.6.5', desc: 'DEMOLICIÓN PISO DE PIEDRA , MANUAL', tren: 'DEMOL', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm²', metrado: 45.59, precio: 29.27, costo: 1334.42, metradoEjec: 45.59, inicio: '2026-04-09', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A019', item: '1.1.1.7.1', desc: 'TRAZO Y REPLANTEO S/EQUIPO', tren: 'PRELIM', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm²', metrado: 567.28, precio: 1.49, costo: 845.25, metradoEjec: 567.28, inicio: '2026-03-30', fin: '2026-04-19', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A020', item: '1.1.1.7.2', desc: 'TRAZO Y REPLANTEO C/EQUIPO', tren: 'PRELIM', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm²', metrado: 567.28, precio: 1.51, costo: 856.59, metradoEjec: 567.28, inicio: '2026-03-30', fin: '2026-04-19', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A021', item: '1.1.2.1', desc: 'EQUIPOS DE PROTECCION INDIVIDUAL', tren: 'GEN_SEG', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'gbl', metrado: 1.0, precio: 4716.95, costo: 4716.95, metradoEjec: 0.35, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A022', item: '1.1.2.2', desc: 'EQUIPOS DE PROTECCION COLECTIVA', tren: 'GEN_SEG', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'glb', metrado: 1.0, precio: 1567.0, costo: 1567.0, metradoEjec: 0.35, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A023', item: '1.1.2.3', desc: 'SEÑALIZACIÓN TEMPORAL DE SEGURIDAD', tren: 'GEN_SEG', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'jgo', metrado: 1.0, precio: 1295.36, costo: 1295.36, metradoEjec: 0.35, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A024', item: '1.1.2.4', desc: 'CAPACITACION EN SEGURIDAD Y SALUD', tren: 'GEN_SEG', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'glb', metrado: 1.0, precio: 3660.0, costo: 3660.0, metradoEjec: 0.35, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A025', item: '1.1.2.5', desc: 'RECURSOS PARA RESPUESTAS ANTE EMERGENCIAS', tren: 'GEN_SEG', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 1459.56, costo: 1459.56, metradoEjec: 0.35, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A026', item: '1.1.3.1.1', desc: 'RIEGO DURANTE EL PROCESO CONSTRUCTIVO', tren: 'GEN_AMB', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'm²', metrado: 250.0, precio: 14.56, costo: 3640.0, metradoEjec: 87.5, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A027', item: '1.1.3.1.2', desc: 'LIMPIEZA RUTINARIA DEL AREA DE INFLUENCIA DIRECTA', tren: 'GEN_AMB', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'm²', metrado: 250.0, precio: 12.37, costo: 3092.5, metradoEjec: 87.5, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A028', item: '1.1.3.1.3', desc: 'PROTECCIÓN DE MATERIAL SUELTO', tren: 'GEN_AMB', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 250.0, costo: 250.0, metradoEjec: 0.35, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A029', item: '1.1.3.2.1.1', desc: 'IMPLEMENTACIÓN DE MATERIALES PARA RESIDUOS SOLIDOS EN OBRA', tren: 'GEN_AMB', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 2899.86, costo: 2899.86, metradoEjec: 0.35, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A030', item: '1.1.3.2.1.2', desc: 'GESTIÓN Y MANEJO DE RESIDUOS SOLIDOS', tren: 'GEN_AMB', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'glb', metrado: 2.0, precio: 19.52, costo: 39.04, metradoEjec: 0.7, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A031', item: '1.1.3.3.1', desc: 'SEÑALIZACIÓN AMBIENTAL EN LAS ZONAS DE CONSTRUCCIÓN', tren: 'GEN_AMB', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 384.18, costo: 1152.54, metradoEjec: 1.05, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A032', item: '1.1.3.4.1', desc: 'EQUIPAMIENTO', tren: 'GEN_AMB', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 850.0, costo: 850.0, metradoEjec: 0.35, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A033', item: '1.1.3.5.1', desc: 'DESMONTAJE DE OBRAS PROVISIONALES', tren: 'GEN_AMB', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'm²', metrado: 100.0, precio: 18.74, costo: 1874.0, metradoEjec: 35.0, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A034', item: '1.1.3.5.2', desc: 'LIMPIEZA FINAL DE OBRA', tren: 'GEN_AMB', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'm²', metrado: 200.0, precio: 9.36, costo: 1872.0, metradoEjec: 70.0, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A035', item: '1.1.4.1.1.1', desc: 'TALLER DE CAPACITACIÓN SOBRE LA IDENTIFICACIÓN DE RIESGOS EN CENTROS EDUCATIVOS', tren: 'GEN_AMB', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'Serv.', metrado: 1.0, precio: 4980.0, costo: 4980.0, metradoEjec: 0.35, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A036', item: '1.1.4.1.2.1', desc: 'SUMINISTRO Y COLOCACIÓN DE RUTAS DE EVACUACIÓN', tren: 'GEN_AMB', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'und', metrado: 19.0, precio: 18.27, costo: 347.13, metradoEjec: 6.65, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A037', item: '1.1.4.1.2.2', desc: 'PINTADO EN ZONA DE SEGURIDAD EN PISO CON PINTURA DE TRÁNSITO', tren: 'GEN_AMB', frente: 'OBRAS_PROV', sector: 'TODOS', und: 'm²', metrado: 58.55, precio: 78.39, costo: 4589.73, metradoEjec: 20.49, inicio: '2026-03-30', fin: '2026-07-27', responsable: 'Residente', status: 'VERDE', esGlobal: true },
  { id: 'A038', item: '1.2.1.1.1', desc: 'EXCAVACIÓN PARA DADOS DE MAMPARA 0.25X0.30X0.50 M', tren: 'EXC_DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 1.16, precio: 39.03, costo: 45.37, metradoEjec: 1.16, inicio: '2026-04-14', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A039', item: '1.2.1.1.2', desc: 'EXCAVACIÓN PARA DADOS DE MAMPARA 0.25X0.25X0.30 M', tren: 'EXC_DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 0.26, precio: 39.03, costo: 10.25, metradoEjec: 0.26, inicio: '2026-04-14', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A040', item: '1.2.1.1.3', desc: 'EXCAVACIÓN PARA DADOS DE BASE EN PERGOLA', tren: 'EXC_DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 5.83, precio: 39.03, costo: 227.54, metradoEjec: 5.83, inicio: '2026-04-14', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A041', item: '1.2.1.1.4', desc: 'EXCAVACIÓN PARA DADOS EN BASE DE BASURERO', tren: 'EXC_DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 0.08, precio: 39.03, costo: 3.12, metradoEjec: 0.08, inicio: '2026-04-14', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A042', item: '1.2.1.2.1', desc: 'ELIMINACIÓN DE MATERIAL EXCEDENTE MANUAL D=50M ( DISTANCIA PROMEDIO)', tren: 'EXC_DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 55.25, precio: 23.42, costo: 1293.96, metradoEjec: 55.25, inicio: '2026-04-14', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A043', item: '1.2.1.2.2', desc: 'ACARREO DE MATERIAL EXCEDENTE EN CARRETILLA (50 M )', tren: 'EXC_DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 55.25, precio: 23.42, costo: 1293.96, metradoEjec: 55.25, inicio: '2026-04-14', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A044', item: '1.2.1.2.3', desc: 'TRANSPORTE DE MATERIALES', tren: 'EXC_DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 56.25, precio: 20.16, costo: 1134.0, metradoEjec: 56.25, inicio: '2026-04-14', fin: '2026-05-08', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A045', item: '1.2.2.1.1', desc: 'DADO DE CONCRETO 0.25X0.30X0.50 M P/ ENPOTRADO  F\'C= 175KG/CM2  EN MAMPARA', tren: 'DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 1.16, precio: 320.07, costo: 372.24, metradoEjec: 1.16, inicio: '2026-04-19', fin: '2026-05-13', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A046', item: '1.2.2.1.2', desc: 'ENCOFRADO Y DESENCOFRADO EN DADOS DE 0.25X0.30X0.50 M', tren: 'DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm²', metrado: 3.88, precio: 58.83, costo: 227.97, metradoEjec: 3.88, inicio: '2026-04-19', fin: '2026-05-13', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A047', item: '1.2.2.1.3', desc: 'DADO DE CONCRETO 0.25X0.25X0.30 M P/ ENPOTRADO  F\'C= 175KG/CM2  EN MAMPARA', tren: 'DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 0.26, precio: 320.07, costo: 84.02, metradoEjec: 0.26, inicio: '2026-04-19', fin: '2026-05-13', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A048', item: '1.2.2.1.4', desc: 'ENCOFRADO Y DESENCOFRADO EN DADOS DE 0.25X0.25X0.30 M', tren: 'DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm²', metrado: 1.05, precio: 58.83, costo: 61.77, metradoEjec: 1.05, inicio: '2026-04-19', fin: '2026-05-13', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A049', item: '1.2.2.1.5', desc: 'DADO DE CONCRETO 0.30X0.30X0.45M P/ ENPOTRADO  F\'C= 175KG/CM2  EN PERGOLA', tren: 'DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 0.97, precio: 320.07, costo: 310.47, metradoEjec: 0.97, inicio: '2026-04-19', fin: '2026-05-13', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A050', item: '1.2.2.1.6', desc: 'DADO DE CONCRETO 0.15X0.15X0.20M P/ ENPOTRADO  F\'C= 175KG/CM2  EN BASUREROS', tren: 'DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm³', metrado: 0.03, precio: 320.07, costo: 9.6, metradoEjec: 0.03, inicio: '2026-04-19', fin: '2026-05-13', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A051', item: '1.2.2.1.7', desc: 'CURADO DE CONCRETO', tren: 'DADOS', frente: 'ESTRUCTURAS', sector: 'TODOS', und: 'm²', metrado: 1.0, precio: 218.57, costo: 218.57, metradoEjec: 1.0, inicio: '2026-04-19', fin: '2026-05-13', responsable: 'Ing. Estruct.', status: 'VERDE', esGlobal: false },
  { id: 'A052', item: '1.3.1.1.1', desc: 'TARRAJEO PRIMARIO DE E = 5 cm, C:A 1:5', tren: 'REVOQUES', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 5.76, precio: 51.04, costo: 293.99, metradoEjec: 1.56, inicio: '2026-04-29', fin: '2026-06-02', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A053', item: '1.3.1.2.1', desc: 'TARRAJEO EN MUROS EXTERIORES DE E=5CM, C:A 1:5', tren: 'REVOQUES', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 56.0, precio: 20.62, costo: 1154.72, metradoEjec: 15.12, inicio: '2026-04-29', fin: '2026-06-02', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A054', item: '1.3.1.3.1', desc: 'PREPARACION DE GRADAS DE CONCRETO DE E = 5 cm, C:A 1:5', tren: 'PISO_LAJA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 73.03, precio: 45.31, costo: 3308.99, metradoEjec: 5.84, inicio: '2026-05-04', fin: '2026-07-02', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A055', item: '1.3.1.4.1', desc: 'REVESTIMIENTO CON  LAJA REGULAR DE PIEDRA COLOR GRIS CLARO DE  E= 4 cm', tren: 'PISO_LAJA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 73.03, precio: 77.43, costo: 5654.71, metradoEjec: 5.84, inicio: '2026-05-04', fin: '2026-07-02', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A056', item: '1.3.1.5.1', desc: 'SOLAQUEO EN PARAPETOS EXISTENTES', tren: 'REVOQUES', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 171.97, precio: 16.53, costo: 2842.66, metradoEjec: 46.43, inicio: '2026-04-29', fin: '2026-06-02', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A057', item: '1.3.1.5.2', desc: 'REVESTIMIENTO DE CERAMICOS CON IMPRESIÓN PERSONALIZADA', tren: 'REVOQUES', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 5.76, precio: 144.45, costo: 832.03, metradoEjec: 1.56, inicio: '2026-04-29', fin: '2026-06-02', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A058', item: '1.3.2.1.1', desc: 'CONTRAPISO DE E = 5 cm, C:A 1:5', tren: 'CONTRAPISO', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 249.03, precio: 35.0, costo: 8716.05, metradoEjec: 107.08, inicio: '2026-04-24', fin: '2026-05-23', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A059', item: '1.3.2.2.1.1', desc: 'REPOSICIÓN DE PISOS DE CANTOS RODADOS', tren: 'PISO_CR', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 64.1, precio: 96.68, costo: 6197.19, metradoEjec: 9.61, inicio: '2026-05-04', fin: '2026-06-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A060', item: '1.3.2.2.2.1', desc: 'REPOSICION DE PISO LAJA DE CORTE REGULAR DE PIEDRA COLOR GRIS CLARO DE  E= 4 cm', tren: 'PISO_LAJA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 184.93, precio: 181.68, costo: 33598.08, metradoEjec: 14.79, inicio: '2026-05-04', fin: '2026-07-02', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A061', item: '1.3.2.2.3.1', desc: 'SARDINEL DE PIEDRA DE REGULAR COLOR GRIS CLARO DE E=4\"', tren: 'SARDINELES', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 136.82, precio: 182.06, costo: 24909.45, metradoEjec: 0.0, inicio: '2026-05-14', fin: '2026-06-17', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A062', item: '1.3.3.1.1', desc: 'POLICARBONATO SOLIDO DE E= 3mm', tren: 'COBERTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 29.76, precio: 138.95, costo: 4135.15, metradoEjec: 0.0, inicio: '2026-05-19', fin: '2026-06-17', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A063', item: '1.3.4.1.1', desc: 'PM-01, SEGÚN DISEÑO', tren: 'PUERTAS', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 3727.21, costo: 3727.21, metradoEjec: 0.0, inicio: '2026-05-29', fin: '2026-06-22', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A064', item: '1.3.4.1.2', desc: 'PM-02, SEGÚN DISEÑO', tren: 'PUERTAS', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 3727.21, costo: 3727.21, metradoEjec: 0.0, inicio: '2026-05-29', fin: '2026-06-22', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A065', item: '1.3.4.2.1', desc: 'MAMPARA DE FIERRO TIPO 01, SEGÚN DISEÑO.', tren: 'MAMPARAS', frente: 'ARQUIT', sector: 'TODOS', und: 'm', metrado: 103.1, precio: 500.0, costo: 51550.0, metradoEjec: 0.0, inicio: '2026-05-19', fin: '2026-07-02', responsable: 'Maestro', status: 'ROJO', esGlobal: false },
  { id: 'A066', item: '1.3.4.3.1', desc: 'PERGOLA METALICA DE 3.00 X 1.50 X 2.50, SEGÚN DISEÑO,  INC. INSTALACION', tren: 'PERGOLAS', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 6.0, precio: 2700.0, costo: 16200.0, metradoEjec: 0.0, inicio: '2026-05-14', fin: '2026-06-17', responsable: 'Maestro', status: 'ROJO', esGlobal: false },
  { id: 'A067', item: '1.3.4.3.2', desc: 'BANCA METALICA DE 2.40 m x 0.90 m x 0.80m , CON ASIENTO Y ESPALDAR DE LISTONES DE MADERA TRATADA,  SEGÚN DISEÑO. INC. INSTALACION', tren: 'MOBILIARIO', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 6.0, precio: 1800.0, costo: 10800.0, metradoEjec: 0.0, inicio: '2026-06-03', fin: '2026-07-02', responsable: 'Maestro', status: 'ROJO', esGlobal: false },
  { id: 'A068', item: '1.3.4.3.3', desc: 'BASUREROS METALICOS SEGUN DISEÑO, INC. INSTALACION', tren: 'MOBILIARIO', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 600.0, costo: 1800.0, metradoEjec: 0.0, inicio: '2026-06-03', fin: '2026-07-02', responsable: 'Maestro', status: 'ROJO', esGlobal: false },
  { id: 'A069', item: '1.3.4.3.4', desc: 'REJA DECORATIVA TIPO 01,  SEGÚN DISEÑO', tren: 'REJAS', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 6.0, precio: 650.0, costo: 3900.0, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-02', responsable: 'Maestro', status: 'ROJO', esGlobal: false },
  { id: 'A070', item: '1.3.4.3.5', desc: 'REJA DECORATIVA TIPO 02,  SEGÚN DISEÑO', tren: 'REJAS', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 650.0, costo: 650.0, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-02', responsable: 'Maestro', status: 'ROJO', esGlobal: false },
  { id: 'A071', item: '1.3.4.3.6', desc: 'REJA DECORATIVA TIPO 03,  SEGÚN DISEÑO', tren: 'REJAS', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 8.0, precio: 450.0, costo: 3600.0, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-02', responsable: 'Maestro', status: 'ROJO', esGlobal: false },
  { id: 'A072', item: '1.3.4.3.7', desc: 'SOPORTE METALICO PARA MASETERO DE FIERRO LISO, SEGÚN DISEÑO.', tren: 'ELEM_ORN', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 27.0, precio: 12.0, costo: 324.0, metradoEjec: 0.0, inicio: '2026-06-13', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A073', item: '1.3.4.3.8', desc: 'SOPORTE METALICO INDIVIDUAL DE BANNERS, SEGÚN DISEÑO.', tren: 'ELEM_ORN', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 110.0, costo: 220.0, metradoEjec: 0.0, inicio: '2026-06-13', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A074', item: '1.3.4.3.9', desc: 'SOPORTE METALICO DOBLE DE BANNERS, SEGÚN DISEÑO.', tren: 'ELEM_ORN', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 6.0, precio: 90.0, costo: 540.0, metradoEjec: 0.0, inicio: '2026-06-13', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A075', item: '1.3.4.3.10', desc: 'SOPORTE METALICO DE BANNER INFORMATIVO, SEGUN DISEÑO', tren: 'MOBILIARIO', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 120.0, costo: 120.0, metradoEjec: 0.0, inicio: '2026-06-03', fin: '2026-07-02', responsable: 'Maestro', status: 'ROJO', esGlobal: false },
  { id: 'A076', item: '1.3.4.3.11', desc: 'REJILLA DE SUMIDERO METALICA', tren: 'MOBILIARIO', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 10.0, precio: 228.73, costo: 2287.3, metradoEjec: 0.0, inicio: '2026-06-03', fin: '2026-07-02', responsable: 'Maestro', status: 'ROJO', esGlobal: false },
  { id: 'A077', item: '1.3.5.1.1', desc: 'CANDADO DE ACERO INOXIDABLE', tren: 'ELEM_ORN', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 9.5, costo: 19.0, metradoEjec: 0.0, inicio: '2026-06-13', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A078', item: '1.3.6.1', desc: 'VIDRIO TEMPLADO INCOLORO DE E=10mm, laminado con PVB de 08mm de espesor. Incluye accesorios e instalación', tren: 'VIDRIO', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 165.0, precio: 350.0, costo: 57750.0, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-07-02', responsable: 'Maestro', status: 'ROJO', esGlobal: false },
  { id: 'A079', item: '1.3.7.1.1', desc: 'PINTURA LATEX EN MUROS EXTERIORES, 2 manos', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 749.93, precio: 16.45, costo: 12336.35, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A080', item: '1.3.7.2.1', desc: 'PINTURA DE VENTANAS', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 70.27, precio: 28.08, costo: 1973.18, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A081', item: '1.3.7.3.1.1', desc: 'PINTURA ANTICORROSIVA', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 37.35, precio: 48.98, costo: 1829.4, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A082', item: '1.3.7.3.1.2', desc: 'PINTURA ESMALTE', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 42.89, precio: 39.29, costo: 1685.15, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A083', item: '1.3.7.3.2.1', desc: 'PINTURA ANTICORROSIVA', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 64.28, precio: 54.3, costo: 3490.4, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A084', item: '1.3.7.3.2.2', desc: 'PINTURA ESMALTE', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 64.33, precio: 39.29, costo: 2527.53, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A085', item: '1.3.7.4.1.1', desc: 'PERGOLA METALICA', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 69.0, precio: 48.98, costo: 3379.62, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A086', item: '1.3.7.4.1.2', desc: 'BANCA METALICA', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 35.0, precio: 48.98, costo: 1714.3, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A087', item: '1.3.7.4.1.3', desc: 'BASUREROS METALICOS', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 6.0, precio: 48.98, costo: 293.88, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A088', item: '1.3.7.4.1.4', desc: 'PINTURA ANTICORROSIVA EN REJA DECORATIVA TIPO 01', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 10.56, precio: 54.3, costo: 573.41, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A089', item: '1.3.7.4.1.5', desc: 'PINTURA ANTICORROSIVA EN REJA DECORATIVA TIPO 02', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 15.92, precio: 54.3, costo: 864.46, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A090', item: '1.3.7.4.1.6', desc: 'PINTURA ANTICORROSIVA EN REJA DECORATIVA TIPO 03', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 7.05, precio: 54.3, costo: 382.82, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A091', item: '1.3.7.4.1.7', desc: 'PINTURA ANTICORROSIVA EN SOPORTE METALICO PARA MASETERO', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 30.24, precio: 44.56, costo: 1347.49, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A092', item: '1.3.7.4.1.8', desc: 'PINTURA ANTICORROSIVA EN SOPORTE INDIVIDUAL METALICO DE BANNERS', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 0.23, precio: 44.56, costo: 10.25, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A093', item: '1.3.7.4.1.9', desc: 'PINTURA ANTICORROSIVA EN SOPORTE DOBLE METALICO DE BANNERS', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 1.29, precio: 44.56, costo: 57.48, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A094', item: '1.3.7.4.1.10', desc: 'PINTURA ANTICORROSIVA DE POSTES METALICOS ORNAMENTALES', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 100.8, precio: 44.56, costo: 4491.65, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A095', item: '1.3.7.4.1.11', desc: 'PINTURA ANTICORROSIVA DE PASTORALES METALICOS ORNAMENTALES', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 2.4, precio: 54.15, costo: 129.96, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A096', item: '1.3.7.4.1.12', desc: 'PINTURA ANTICORROSIVA EN SOPORTE METALICO DE BANNER INFORMATIVO', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 6.6, precio: 44.56, costo: 294.1, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A097', item: '1.3.7.4.1.13', desc: 'PINTURA ANTICORROSIVA EN REJILLA DE SUMIDERO METALICA', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 4.8, precio: 54.15, costo: 259.92, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A098', item: '1.3.7.4.2.1', desc: 'PERGOLA METALICA', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 63.38, precio: 39.29, costo: 2490.2, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A099', item: '1.3.7.4.2.2', desc: 'BANCA METALICA', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 33.79, precio: 39.29, costo: 1327.61, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A100', item: '1.3.7.4.2.3', desc: 'BASUREROS METALICOS', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 5.73, precio: 39.29, costo: 225.13, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A101', item: '1.3.7.4.2.4', desc: 'PINTURA ESMALTE EN REJA DECORATIVA TIPO 01', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 10.56, precio: 41.42, costo: 437.4, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A102', item: '1.3.7.4.2.5', desc: 'PINTURA ESMALTE EN REJA DECORATIVA TIPO 02', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 2.0, precio: 41.42, costo: 82.84, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A103', item: '1.3.7.4.2.6', desc: 'PINTURA ESMALTE EN REJA DECORATIVA TIPO 03', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 7.05, precio: 41.42, costo: 292.01, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A104', item: '1.3.7.4.2.7', desc: 'PINTURA ESMALTE EN SOPORTE METALICO PARA MASETERO', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 30.24, precio: 41.42, costo: 1252.54, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A105', item: '1.3.7.4.2.8', desc: 'PINTURA ESMALTE EN SOPORTE INDIVIDUAL METALICO DE BANNERS', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 0.23, precio: 41.42, costo: 9.53, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A106', item: '1.3.7.4.2.9', desc: 'PINTURA ESMALTE EN SOPORTE DOBLE METALICO DE BANNERS', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 1.29, precio: 41.42, costo: 53.43, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A107', item: '1.3.7.4.2.10', desc: 'PINTURA ESMALTE DE POSTES METALICOS EXISTENTES', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 100.8, precio: 41.42, costo: 4175.14, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A108', item: '1.3.7.4.2.11', desc: 'PINTURA ESMALTE DE PASTORALES METALICOS ORNAMENTALES', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 2.4, precio: 41.42, costo: 99.41, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A109', item: '1.3.7.4.2.12', desc: 'PINTURA ESMALTE EN SOPORTE METALICO DE BANNER INFORMATIVO', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 6.6, precio: 39.29, costo: 259.31, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A110', item: '1.3.7.4.2.13', desc: 'PINTURA ESMALTE EN REJILLA DE SUMIDERO METALICA', tren: 'PINTURA', frente: 'ARQUIT', sector: 'TODOS', und: 'm²', metrado: 4.8, precio: 39.29, costo: 188.59, metradoEjec: 0.0, inicio: '2026-06-08', fin: '2026-07-12', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A111', item: '1.3.8.1', desc: 'TRABAJOS DE JARDINERÍA', tren: 'JARDINERIA', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 27.0, precio: 15.75, costo: 425.25, metradoEjec: 0.0, inicio: '2026-07-03', fin: '2026-07-22', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A112', item: '1.3.9.1', desc: 'MASETEROS DE PLASTICO DE 5 LTS', tren: 'JARDINERIA', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 27.0, precio: 20.0, costo: 540.0, metradoEjec: 0.0, inicio: '2026-07-03', fin: '2026-07-22', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A113', item: '1.3.9.2', desc: 'PLANTONES FLORES NATIVAS', tren: 'JARDINERIA', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 27.0, precio: 15.0, costo: 405.0, metradoEjec: 0.0, inicio: '2026-07-03', fin: '2026-07-22', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A114', item: '1.3.9.3', desc: 'BANNERS PARA SOPORTES EN POSTES SEGÚN DISEÑO.', tren: 'JARDINERIA', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 14.0, precio: 25.0, costo: 350.0, metradoEjec: 0.0, inicio: '2026-07-03', fin: '2026-07-22', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A115', item: '1.3.9.4', desc: 'BANNERS PARA PANEL INFORMATIVO SEGÚN DISEÑO.', tren: 'JARDINERIA', frente: 'ARQUIT', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 25.0, costo: 25.0, metradoEjec: 0.0, inicio: '2026-07-03', fin: '2026-07-22', responsable: 'Maestro', status: 'AMARILLO', esGlobal: false },
  { id: 'A116', item: '1.4.1.1', desc: 'LIMPIEZA DE CANAL PLUVIAL EXISTENTE', tren: 'CANAL_PLU', frente: 'IISS', sector: 'TODOS', und: 'm', metrado: 78.0, precio: 30.2, costo: 2355.6, metradoEjec: 78.0, inicio: '2026-04-04', fin: '2026-04-15', responsable: 'Ing. Sanit.', status: 'VERDE', esGlobal: false },
  { id: 'A117', item: '1.5.1.1', desc: 'TRAMITE E INSTALACIÓN DE SUMINISTRO MONOFÁSICO (1Ø)', tren: 'CONEXION', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 850.0, costo: 850.0, metradoEjec: 1.0, inicio: '2026-04-09', fin: '2026-04-23', responsable: 'Ing. Elect.', status: 'VERDE', esGlobal: true },
  { id: 'A118', item: '1.5.2.1.1', desc: 'SALIDA PARA ALUMBRADO EN POSTE ORNAMENTAL', tren: 'SALIDAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 8.0, precio: 347.08, costo: 2776.64, metradoEjec: 2.16, inicio: '2026-04-29', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A119', item: '1.5.2.1.2', desc: 'SALIDA PARA ALUMBRADO EN PASTORAL ORNAMENTAL', tren: 'SALIDAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 231.38, costo: 694.14, metradoEjec: 0.81, inicio: '2026-04-29', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A120', item: '1.5.2.1.3', desc: 'SALIDA PARA CAJA PORTAMEDIDOR MONOFÁSICO  (1Ø)', tren: 'SALIDAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 185.65, costo: 371.3, metradoEjec: 0.54, inicio: '2026-04-29', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A121', item: '1.5.2.1.4', desc: 'SALIDA PARA MEDIDOR ELECTRONICO MONOFÁSICO (1Ø)', tren: 'SALIDAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 335.65, costo: 671.3, metradoEjec: 0.54, inicio: '2026-04-29', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A122', item: '1.5.2.1.5', desc: 'SALIDA PARA GABINETE DE COMUNICACIÓN (CCTV)', tren: 'SALIDAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 277.65, costo: 277.65, metradoEjec: 0.27, inicio: '2026-04-29', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A123', item: '1.5.2.1.6', desc: 'SALIDA PARA TOMACORRIENTE INDUSTRIAL P/EMPOTRAR 2P+ LT,16A, 250V', tren: 'SALIDAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 156.38, costo: 312.76, metradoEjec: 0.54, inicio: '2026-04-29', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A124', item: '1.5.2.2.1', desc: 'TUBERIA PVC-CP DE 20mm Ø - ALUMBRADO FAROLAS (PASTORAL EN PARED)', tren: 'DUCTOS_IE', frente: 'IIEE', sector: 'TODOS', und: 'm', metrado: 36.0, precio: 9.57, costo: 344.52, metradoEjec: 11.52, inicio: '2026-04-24', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A125', item: '1.5.2.2.2', desc: 'TUBERIA PVC-CP DE 35mm Ø - ALUMBRADO FAROLAS (POSTE ORNAMENTAL)', tren: 'DUCTOS_IE', frente: 'IIEE', sector: 'TODOS', und: 'm', metrado: 150.0, precio: 12.95, costo: 1942.5, metradoEjec: 48.0, inicio: '2026-04-24', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A126', item: '1.5.2.2.3', desc: 'TUBERIA PVC-CP DE 35mm Ø - MEDIDOR PARTICULAR Y CCTV', tren: 'DUCTOS_IE', frente: 'IIEE', sector: 'TODOS', und: 'm', metrado: 100.0, precio: 12.95, costo: 1295.0, metradoEjec: 32.0, inicio: '2026-04-24', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A127', item: '1.5.2.2.4', desc: 'TUBERIA PVC-CP DE 1000mm Ø - RED DE BT', tren: 'DUCTOS_IE', frente: 'IIEE', sector: 'TODOS', und: 'm', metrado: 120.0, precio: 32.26, costo: 3871.2, metradoEjec: 38.4, inicio: '2026-04-24', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A128', item: '1.5.2.2.5', desc: 'CURVA PVC-CP DE 20mm Ø', tren: 'DUCTOS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 6.0, precio: 10.53, costo: 63.18, metradoEjec: 1.92, inicio: '2026-04-24', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A129', item: '1.5.2.2.6', desc: 'CURVA PVC-CP DE 35mm Ø', tren: 'DUCTOS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 4.0, precio: 15.66, costo: 62.64, metradoEjec: 1.28, inicio: '2026-04-24', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A130', item: '1.5.2.2.7', desc: 'CURVA PVC-CP DE 100mm Ø', tren: 'DUCTOS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 39.54, costo: 118.62, metradoEjec: 0.96, inicio: '2026-04-24', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A131', item: '1.5.2.2.8', desc: 'UNIÓN PVC-CP DE 20mm Ø', tren: 'DUCTOS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 8.0, precio: 8.76, costo: 70.08, metradoEjec: 2.56, inicio: '2026-04-24', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A132', item: '1.5.2.2.9', desc: 'UNIÓN PVC-CP DE 35mm Ø', tren: 'DUCTOS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 4.0, precio: 10.86, costo: 43.44, metradoEjec: 1.28, inicio: '2026-04-24', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A133', item: '1.5.2.2.10', desc: 'UNIÓN PVC-CP DE 100mm Ø', tren: 'DUCTOS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 20.77, costo: 62.31, metradoEjec: 0.96, inicio: '2026-04-24', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A134', item: '1.5.2.2.11', desc: 'CONECTOR PVC-CP DE 20mm Ø', tren: 'DUCTOS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 8.0, precio: 8.56, costo: 68.48, metradoEjec: 2.56, inicio: '2026-04-24', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A135', item: '1.5.2.2.12', desc: 'CONECTOR PVC-CP DE 35mm Ø', tren: 'DUCTOS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 4.0, precio: 12.26, costo: 49.04, metradoEjec: 1.28, inicio: '2026-04-24', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A136', item: '1.5.2.2.13', desc: 'CONECTOR PVC-CP DE 100mm Ø', tren: 'DUCTOS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 22.04, costo: 66.12, metradoEjec: 0.96, inicio: '2026-04-24', fin: '2026-06-02', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A137', item: '1.5.2.3.1', desc: 'CABLE TIPO N2XOH DE 10 mm2 (UNIPOLAR) - ALIMENTADOR TD Y GABINETE CCTV', tren: 'CABLES_IE', frente: 'IIEE', sector: 'TODOS', und: 'm', metrado: 282.0, precio: 8.1, costo: 2284.2, metradoEjec: 42.3, inicio: '2026-05-04', fin: '2026-06-12', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A138', item: '1.5.2.3.2', desc: 'CABLE TIPO N2XOH DE 16mm2 (UNIPOLAR) - ALIMENTADOR', tren: 'CABLES_IE', frente: 'IIEE', sector: 'TODOS', und: 'm', metrado: 30.0, precio: 8.22, costo: 246.6, metradoEjec: 4.5, inicio: '2026-05-04', fin: '2026-06-12', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A139', item: '1.5.2.3.3', desc: 'CABLE TIPO N2XOH DE 16mm2 (UNIPOLAR) - TIERRA', tren: 'CABLES_IE', frente: 'IIEE', sector: 'TODOS', und: 'm', metrado: 225.0, precio: 8.22, costo: 1849.5, metradoEjec: 33.75, inicio: '2026-05-04', fin: '2026-06-12', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A140', item: '1.5.2.3.4', desc: 'CABLE TIPO N2XOH DE 25mm2 (UNIPOLAR) - ALUMBRADO FAROLAS', tren: 'CABLES_IE', frente: 'IIEE', sector: 'TODOS', und: 'm', metrado: 450.0, precio: 22.18, costo: 9981.0, metradoEjec: 67.5, inicio: '2026-05-04', fin: '2026-06-12', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A141', item: '1.5.2.3.5', desc: 'CABLE TIPO NLT  DE 3x12 AWG (4mm2) - ALUMBRADO FAROLAS', tren: 'CABLES_IE', frente: 'IIEE', sector: 'TODOS', und: 'm', metrado: 110.0, precio: 8.21, costo: 903.1, metradoEjec: 16.5, inicio: '2026-05-04', fin: '2026-06-12', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A142', item: '1.5.2.4.1', desc: 'BUZÓN DE CONCRETO DE 0.40x0.40x0.60m', tren: 'BUZONES_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 24.0, precio: 251.38, costo: 6033.12, metradoEjec: 12.24, inicio: '2026-04-24', fin: '2026-05-18', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A143', item: '1.5.2.5.1', desc: 'EXCAVACIÓN DE HOYO P/BUZÓN DE 0.40x0.40x0.60m', tren: 'ZANJAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'm³', metrado: 2.3, precio: 39.07, costo: 89.86, metradoEjec: 1.24, inicio: '2026-04-19', fin: '2026-05-18', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A144', item: '1.5.2.5.2', desc: 'EXCAVACIÓN DE ZANJA DE 0.40m DE ANCHO x 0.60m DE PROF.', tren: 'ZANJAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'm³', metrado: 31.2, precio: 39.07, costo: 1218.98, metradoEjec: 16.85, inicio: '2026-04-19', fin: '2026-05-18', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A145', item: '1.5.2.5.3', desc: 'REFINE Y NIVELACIÓN DE ZANJA DE 0.40 DE ANCHO x 0.60m DE PROF.', tren: 'ZANJAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'm³', metrado: 28.8, precio: 26.05, costo: 750.24, metradoEjec: 15.55, inicio: '2026-04-19', fin: '2026-05-18', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A146', item: '1.5.2.5.4', desc: 'COLOCACIÓN DE CAMA DE ARENA PARA CONDUCTOR SUBTERRANEO', tren: 'ZANJAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'm³', metrado: 4.8, precio: 176.05, costo: 845.04, metradoEjec: 2.59, inicio: '2026-04-19', fin: '2026-05-18', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A147', item: '1.5.2.5.5', desc: 'COLOCACIÓN DE CINTA SEÑALIZADORA', tren: 'ZANJAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'm', metrado: 120.0, precio: 1.56, costo: 187.2, metradoEjec: 64.8, inicio: '2026-04-19', fin: '2026-05-18', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A148', item: '1.5.2.5.6', desc: 'COLOCACIÓN DE LADRILLO DE PROTECCIÓN', tren: 'ZANJAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 500.0, precio: 2.96, costo: 1480.0, metradoEjec: 270.0, inicio: '2026-04-19', fin: '2026-05-18', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A149', item: '1.5.2.5.7', desc: 'RELLENO Y COMPACTACIÓN', tren: 'ZANJAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'm²', metrado: 36.0, precio: 3.25, costo: 117.0, metradoEjec: 19.44, inicio: '2026-04-19', fin: '2026-05-18', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A150', item: '1.5.2.5.8', desc: 'ELIMINACIÓN DE MATERIAL EXCEDENTE', tren: 'ZANJAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'm³', metrado: 14.4, precio: 42.89, costo: 617.62, metradoEjec: 7.78, inicio: '2026-04-19', fin: '2026-05-18', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A151', item: '1.5.2.6.1', desc: 'TABLERO DE DISTRIBUCIÓN TC-AP (24 POLOS) - TIPO RIEL DIN', tren: 'TABLEROS', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 723.27, costo: 723.27, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A152', item: '1.5.2.6.2', desc: 'TABLERO DE DISTRIBUCIÓN TD-PV 01 (18 POLOS) - TIPO RIEL DIN', tren: 'TABLEROS', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 683.27, costo: 683.27, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A153', item: '1.5.2.6.3', desc: 'TABLERO DE DISTRIBUCIÓN TD-PV 02 (18 POLOS) - TIPO RIEL DIN', tren: 'TABLEROS', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 683.27, costo: 683.27, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A154', item: '1.5.2.7.1.1', desc: 'INTERRUPTOR TERMOMAGNÉTICO DE 2x16A, 220V', tren: 'TABLEROS', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 18.06, costo: 36.12, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A155', item: '1.5.2.7.1.2', desc: 'INTERRUPTOR TERMOMAGNÉTICO DE 2x20A, 220V', tren: 'TABLEROS', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 68.93, costo: 206.79, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A156', item: '1.5.2.7.1.3', desc: 'INTERRUPTOR TERMOMAGNÉTICO DE 2x25A, 220V', tren: 'TABLEROS', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 68.93, costo: 68.93, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A157', item: '1.5.2.7.1.4', desc: 'INTERRUPTOR TERMOMAGNÉTICO DE 2x32A, 220V', tren: 'TABLEROS', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 68.93, costo: 206.79, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A158', item: '1.5.2.7.1.5', desc: 'INTERRUPTOR TERMOMAGNÉTICO DE 2x40A, 220V', tren: 'TABLEROS', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 78.93, costo: 236.79, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A159', item: '1.5.2.7.1.6', desc: 'INTERRUPTOR TERMOMAGNÉTICO DE 2x50A, 220V', tren: 'TABLEROS', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 93.93, costo: 93.93, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A160', item: '1.5.2.7.1.7', desc: 'INTERRUPTOR DIFERENCIAL DE 2X25A, 30mA', tren: 'TABLEROS', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 6.0, precio: 223.93, costo: 1343.58, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A161', item: '1.5.2.7.1.8', desc: 'INTERRUPTOR HORARIO (ANALÓGICO)', tren: 'TABLEROS', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 167.41, costo: 167.41, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A162', item: '1.5.2.7.1.9', desc: 'CONTACTOR DE 15A', tren: 'TABLEROS', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 67.41, costo: 67.41, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A163', item: '1.5.3.1', desc: 'EXCAVACIÓN PARA APERTURA DE HOYO  DE 0.50X0.50X1.00 M3', tren: 'POSTES', frente: 'IIEE', sector: 'TODOS', und: 'm³', metrado: 9.0, precio: 142.77, costo: 1284.93, metradoEjec: 0.0, inicio: '2026-05-14', fin: '2026-06-12', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A164', item: '1.5.3.2', desc: 'SUMINISTRO DE POSTE ORNAMENTAL DE 7m', tren: 'POSTES', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 8.0, precio: 1220.78, costo: 9766.24, metradoEjec: 0.0, inicio: '2026-05-14', fin: '2026-06-12', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A165', item: '1.5.3.3', desc: 'SUMINISTRO DE PASTORAL ORNAMENTAL DE 7M (DADO DE CONCRETO)', tren: 'POSTES', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 770.78, costo: 2312.34, metradoEjec: 0.0, inicio: '2026-05-14', fin: '2026-06-12', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A166', item: '1.5.3.4', desc: 'ESTRUCTURA DE FIJACIÓN DE POSTE ORNAMENTAL DE 7m (DADO DE CONCRETO)', tren: 'POSTES', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 8.0, precio: 550.0, costo: 4400.0, metradoEjec: 0.0, inicio: '2026-05-14', fin: '2026-06-12', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A167', item: '1.5.3.5', desc: 'IZAJE DE POSTE ORNAMENTAL DE 7m', tren: 'POSTES', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 8.0, precio: 247.18, costo: 1977.44, metradoEjec: 0.0, inicio: '2026-05-14', fin: '2026-06-12', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A168', item: '1.5.3.6', desc: 'FIJACIÓN DE PASTORAL ORNAMENTAL DE 1m(EN PARED)', tren: 'POSTES', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 607.18, costo: 1821.54, metradoEjec: 0.0, inicio: '2026-05-14', fin: '2026-06-12', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A169', item: '1.5.4.1', desc: 'APERTURA DE HOYO DE 1.00x1.00 x3.00m', tren: 'TIERRA_IE', frente: 'IIEE', sector: 'TODOS', und: 'm³', metrado: 9.0, precio: 97.92, costo: 881.28, metradoEjec: 9.0, inicio: '2026-04-24', fin: '2026-05-08', responsable: 'Ing. Elect.', status: 'VERDE', esGlobal: false },
  { id: 'A170', item: '1.5.4.2', desc: 'SISTEMA DE PUESTA A TIERRA (S.P.A.T) PARA S.E', tren: 'TIERRA_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 1690.36, costo: 5071.08, metradoEjec: 3.0, inicio: '2026-04-24', fin: '2026-05-08', responsable: 'Ing. Elect.', status: 'VERDE', esGlobal: false },
  { id: 'A171', item: '1.5.5.1.1', desc: 'ARTEFACTO DE ILUMINACIÓN TIPO FAROLA LED DE 100W', tren: 'FAROLAS', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 11.0, precio: 1970.84, costo: 21679.24, metradoEjec: 0.0, inicio: '2026-06-13', fin: '2026-07-07', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: false },
  { id: 'A172', item: '1.5.6.1', desc: 'PRUEBAS DE CONTINUIDAD ELÉCTRICA', tren: 'PRUEBAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 1000.0, costo: 3000.0, metradoEjec: 0.0, inicio: '2026-07-08', fin: '2026-07-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A173', item: '1.5.6.2', desc: 'PRUEBAS DE AISLAMIENTO ELÉCTRICO', tren: 'PRUEBAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 1000.0, costo: 3000.0, metradoEjec: 0.0, inicio: '2026-07-08', fin: '2026-07-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A174', item: '1.5.6.3', desc: 'PRUEBAS DE ILUMINACIÓN EXTERIOR', tren: 'PRUEBAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 750.0, costo: 750.0, metradoEjec: 0.0, inicio: '2026-07-08', fin: '2026-07-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A175', item: '1.5.6.4', desc: 'PRUEBAS DE RESISTENCIA DE PUESTA A TIERRA', tren: 'PRUEBAS_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 3.0, precio: 500.0, costo: 1500.0, metradoEjec: 0.0, inicio: '2026-07-08', fin: '2026-07-22', responsable: 'Ing. Elect.', status: 'AMARILLO', esGlobal: true },
  { id: 'A176', item: '1.5.7.1', desc: 'DESMONTAJE DE INSTALACIONES EXISTENTES', tren: 'DESM_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 1500.0, costo: 1500.0, metradoEjec: 1.0, inicio: '2026-04-04', fin: '2026-04-13', responsable: 'Ing. Elect.', status: 'VERDE', esGlobal: true },
  { id: 'A177', item: '1.5.7.2', desc: 'TRASLADO A ALMACEN DE EQUIPOS Y ACCESORIOS DESMONTADOS', tren: 'DESM_IE', frente: 'IIEE', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 1000.0, costo: 1000.0, metradoEjec: 1.0, inicio: '2026-04-04', fin: '2026-04-13', responsable: 'Ing. Elect.', status: 'VERDE', esGlobal: true },
  { id: 'A178', item: '1.6.1.1.1', desc: 'CABLE ÓPTICO SM OS2 DE 12 FIBRAS', tren: 'CABLES_CC', frente: 'CCTV', sector: 'TODOS', und: 'm', metrado: 160.0, precio: 17.68, costo: 2828.8, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-27', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A179', item: '1.6.1.1.2', desc: 'PIGTAIL LC SM OS2 DE 1.0m', tren: 'CABLES_CC', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 4.0, precio: 69.62, costo: 278.48, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-27', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A180', item: '1.6.1.1.3', desc: 'PATCH CORD LC-LC DUPLEX SM OS2 DE 2.0m', tren: 'CABLES_CC', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 160.53, costo: 321.06, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-27', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A181', item: '1.6.1.1.4', desc: 'CABLE F/UTP CAT 6A LSZH BLINDADO', tren: 'CABLES_CC', frente: 'CCTV', sector: 'TODOS', und: 'm', metrado: 610.0, precio: 4.3, costo: 2623.0, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-27', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A182', item: '1.6.1.1.5', desc: 'PATCH CORD CAT6A APANTALLADO DE 0.5m', tren: 'CABLES_CC', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 10.0, precio: 58.5, costo: 585.0, metradoEjec: 0.0, inicio: '2026-05-24', fin: '2026-06-27', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A183', item: '1.6.2.1', desc: 'TUBERIA METÁLICA FLEXIBLE REVESTIDA CON PVC FILTRO UV DE 40mm Ø', tren: 'DUCTOS_CC', frente: 'CCTV', sector: 'TODOS', und: 'm', metrado: 10.0, precio: 39.37, costo: 393.7, metradoEjec: 0.0, inicio: '2026-05-19', fin: '2026-06-22', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A184', item: '1.6.2.2', desc: 'TUBERIA METÁLICA FLEXIBLE REVESTIDA CON PVC FILTRO UV DE 25mm Ø', tren: 'DUCTOS_CC', frente: 'CCTV', sector: 'TODOS', und: 'm', metrado: 55.0, precio: 20.7, costo: 1138.5, metradoEjec: 0.0, inicio: '2026-05-19', fin: '2026-06-22', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A185', item: '1.6.2.3', desc: 'TUBERIA PVC-SAP DE 40mm Ø', tren: 'DUCTOS_CC', frente: 'CCTV', sector: 'TODOS', und: 'm', metrado: 360.0, precio: 10.58, costo: 3808.8, metradoEjec: 0.0, inicio: '2026-05-19', fin: '2026-06-22', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A186', item: '1.6.2.4', desc: 'CONECTOR CURVO HERMÉTICO PARA TUBERIA FLEXIBLE DE 40mm Ø', tren: 'DUCTOS_CC', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 32.15, costo: 64.3, metradoEjec: 0.0, inicio: '2026-05-19', fin: '2026-06-22', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A187', item: '1.6.2.5', desc: 'CONECTOR RECTO HERMÉTICO PARA TUBERIA FLEXIBLE DE 25mm Ø', tren: 'DUCTOS_CC', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 23.0, precio: 14.15, costo: 325.45, metradoEjec: 0.0, inicio: '2026-05-19', fin: '2026-06-22', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A188', item: '1.6.2.6', desc: 'CURVA PVC-SAP DE 40mm Ø', tren: 'DUCTOS_CC', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 10.0, precio: 15.62, costo: 156.2, metradoEjec: 0.0, inicio: '2026-05-19', fin: '2026-06-22', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A189', item: '1.6.2.7', desc: 'UNION PVC-SAP DE 40mm Ø', tren: 'DUCTOS_CC', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 40.0, precio: 14.32, costo: 572.8, metradoEjec: 0.0, inicio: '2026-05-19', fin: '2026-06-22', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A190', item: '1.6.2.8', desc: 'CONECTOR PVC-SAP DE 40mm Ø', tren: 'DUCTOS_CC', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 130.0, precio: 12.59, costo: 1636.7, metradoEjec: 0.0, inicio: '2026-05-19', fin: '2026-06-22', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A191', item: '1.6.3.1', desc: 'SALIDA DE DATOS PARA CCTV', tren: 'SALIDAS_CC', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 11.0, precio: 68.91, costo: 758.01, metradoEjec: 0.0, inicio: '2026-06-13', fin: '2026-06-27', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A192', item: '1.6.4.1', desc: 'BUZON DE CONCRETO DE 0.60X0.60X0.60M', tren: 'BUZONES_CC', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 245.04, costo: 490.08, metradoEjec: 0.0, inicio: '2026-05-14', fin: '2026-05-28', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A193', item: '1.6.5.1', desc: 'EXCAVACIÓN DE HOYO P/BUZÓN DE 0.60x0.60x0.60m', tren: 'ZANJAS_CC', frente: 'CCTV', sector: 'TODOS', und: 'm³', metrado: 1.02, precio: 39.07, costo: 40.01, metradoEjec: 0.11, inicio: '2026-05-09', fin: '2026-06-02', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A194', item: '1.6.5.2', desc: 'EXCAVACIÓN DE ZANJA DE 0.40m DE ANCHO x 0.60m DE PROF.', tren: 'ZANJAS_CC', frente: 'CCTV', sector: 'TODOS', und: 'm³', metrado: 6.0, precio: 39.07, costo: 234.42, metradoEjec: 0.66, inicio: '2026-05-09', fin: '2026-06-02', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A195', item: '1.6.5.3', desc: 'REFINE Y NIVELACIÓN DE ZANJA DE 0.40 DE ANCHO x 0.60m DE PROF.', tren: 'ZANJAS_CC', frente: 'CCTV', sector: 'TODOS', und: 'm', metrado: 25.0, precio: 26.05, costo: 651.25, metradoEjec: 2.75, inicio: '2026-05-09', fin: '2026-06-02', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A196', item: '1.6.5.4', desc: 'COLOCACIÓN DE CAMA DE ARENA PARA CONDUCTOR SUBTERRANEO', tren: 'ZANJAS_CC', frente: 'CCTV', sector: 'TODOS', und: 'm²', metrado: 2.0, precio: 176.05, costo: 352.1, metradoEjec: 0.22, inicio: '2026-05-09', fin: '2026-06-02', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A197', item: '1.6.5.5', desc: 'COLOCACIÓN DE CINTA SEÑALIZADORA', tren: 'ZANJAS_CC', frente: 'CCTV', sector: 'TODOS', und: 'm', metrado: 180.0, precio: 2.01, costo: 361.8, metradoEjec: 19.8, inicio: '2026-05-09', fin: '2026-06-02', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A198', item: '1.6.5.6', desc: 'COLOCACIÓN DE LADRILLO DE PROTECCIÓN', tren: 'ZANJAS_CC', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 510.0, precio: 2.86, costo: 1458.6, metradoEjec: 56.1, inicio: '2026-05-09', fin: '2026-06-02', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A199', item: '1.6.5.7', desc: 'RELLENO Y COMPACTACIÓN', tren: 'ZANJAS_CC', frente: 'CCTV', sector: 'TODOS', und: 'm²', metrado: 15.0, precio: 3.25, costo: 48.75, metradoEjec: 1.65, inicio: '2026-05-09', fin: '2026-06-02', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A200', item: '1.6.5.8', desc: 'ELIMINACIÓN DE MATERIAL EXCEDENTE', tren: 'ZANJAS_CC', frente: 'CCTV', sector: 'TODOS', und: 'm³', metrado: 8.8, precio: 14.53, costo: 127.86, metradoEjec: 0.97, inicio: '2026-05-09', fin: '2026-06-02', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: false },
  { id: 'A201', item: '1.6.6.1', desc: 'PATCH PANEL CAT 6A  CON 8P, PARA RIEL DIN', tren: 'GABINETE', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 1080.0, costo: 2160.0, metradoEjec: 0.0, inicio: '2026-06-18', fin: '2026-07-12', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: true },
  { id: 'A202', item: '1.6.7.1', desc: 'GABINETE DE COMUNICACIONES IP66 IK10 DE 80(H) X60(W) X30(D) CM CON ACCESORIOS', tren: 'GABINETE', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 1729.04, costo: 1729.04, metradoEjec: 0.0, inicio: '2026-06-18', fin: '2026-07-12', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: true },
  { id: 'A203', item: '1.6.7.2', desc: 'MONTAJE DE DISPOSITIVOS ACTIVOS Y PASIVOS EN GABINETE DE COMUNICACIONES', tren: 'GABINETE', frente: 'CCTV', sector: 'TODOS', und: 'Serv.', metrado: 1.0, precio: 350.0, costo: 350.0, metradoEjec: 0.0, inicio: '2026-06-18', fin: '2026-07-12', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: true },
  { id: 'A204', item: '1.6.8.1.1', desc: 'SERVIDOR DE GRABACION DE 16 CANALES', tren: 'CAMARAS', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 25430.55, costo: 25430.55, metradoEjec: 0.0, inicio: '2026-06-23', fin: '2026-07-17', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: false },
  { id: 'A205', item: '1.6.8.1.2', desc: 'CAMARA IP POE 2MP', tren: 'CAMARAS', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 10.0, precio: 3539.0, costo: 35390.0, metradoEjec: 0.0, inicio: '2026-06-23', fin: '2026-07-17', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: false },
  { id: 'A206', item: '1.6.8.1.3', desc: 'MONITOR LED 32\'\'', tren: 'CAMARAS', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 1000.0, costo: 1000.0, metradoEjec: 0.0, inicio: '2026-06-23', fin: '2026-07-17', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: false },
  { id: 'A207', item: '1.6.8.1.4', desc: 'CONFIGURACIÓN Y PUESTA EN MARCHA DEL SISTEMA DE CCTV', tren: 'CAMARAS', frente: 'CCTV', sector: 'TODOS', und: 'Serv.', metrado: 1.0, precio: 1560.0, costo: 1560.0, metradoEjec: 0.0, inicio: '2026-06-23', fin: '2026-07-17', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: false },
  { id: 'A208', item: '1.6.8.2.1', desc: 'SWITCH  16P RJ45 10/100/1000 Mbit/s  PoE+,2 SFP 1G', tren: 'GABINETE', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 4480.0, costo: 8960.0, metradoEjec: 0.0, inicio: '2026-06-18', fin: '2026-07-12', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: true },
  { id: 'A209', item: '1.6.8.2.2', desc: 'ODF FORMATO RIEL DIN, PARA 12 FIBRAS CON 6 ACOPLADORES LC DUPLEX', tren: 'GABINETE', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 2.0, precio: 592.0, costo: 1184.0, metradoEjec: 0.0, inicio: '2026-06-18', fin: '2026-07-12', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: true },
  { id: 'A210', item: '1.6.8.2.3', desc: 'CERTIFICACIÓN DE ENLACE DE CABLE F/UTP CAT 6A', tren: 'GABINETE', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 10.0, precio: 30.0, costo: 300.0, metradoEjec: 0.0, inicio: '2026-06-18', fin: '2026-07-12', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: true },
  { id: 'A211', item: '1.6.8.2.4', desc: 'CONFIGURACIÓN Y PUESTA EN MARCHA DEL SISTEMA DE CONECTIVIDAD', tren: 'GABINETE', frente: 'CCTV', sector: 'TODOS', und: 'Serv.', metrado: 1.0, precio: 1600.0, costo: 1600.0, metradoEjec: 0.0, inicio: '2026-06-18', fin: '2026-07-12', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: true },
  { id: 'A212', item: '1.6.8.3.1', desc: 'UPS DE 1KVA', tren: 'GABINETE', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 1300.0, costo: 1300.0, metradoEjec: 0.0, inicio: '2026-06-18', fin: '2026-07-12', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: true },
  { id: 'A213', item: '1.6.8.3.2', desc: 'TRANSFORMADOR DE AISLAMIENTO', tren: 'GABINETE', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 850.0, costo: 850.0, metradoEjec: 0.0, inicio: '2026-06-18', fin: '2026-07-12', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: true },
  { id: 'A214', item: '1.6.8.3.3', desc: 'UNIDAD DE DISTRIBUCIÓN DE ENERGÍA PDU HORIZONTAL 8 SALIDAS, 16 A', tren: 'GABINETE', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 160.0, costo: 160.0, metradoEjec: 0.0, inicio: '2026-06-18', fin: '2026-07-12', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: true },
  { id: 'A215', item: '1.6.8.3.4', desc: 'PROTECTOR CONTRA SOBRETENSIONES ETHERNET 1000BASE-T', tren: 'GABINETE', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 10.0, precio: 487.3, costo: 4873.0, metradoEjec: 0.0, inicio: '2026-06-18', fin: '2026-07-12', responsable: 'Ing. CCTV', status: 'ROJO', esGlobal: true },
  { id: 'A216', item: '1.6.8.4.1', desc: 'POZO PUESTA A TIERRA', tren: 'TIERRA_CC', frente: 'CCTV', sector: 'TODOS', und: 'und', metrado: 1.0, precio: 2600.0, costo: 2600.0, metradoEjec: 0.0, inicio: '2026-05-14', fin: '2026-05-23', responsable: 'Ing. CCTV', status: 'AMARILLO', esGlobal: true },
];

// Alias de compatibilidad
const INITIAL_PACKAGES = INITIAL_ACTIVIDADES.map(a => ({
  ...a,
  tramo: a.sector,
  metradoTotal: a.metrado,
  cuadrilla: '—',
  metradoPrevio: a.metradoEjec,  // avance acumulado histórico (semanas previas)
}));

const INITIAL_RESTRICTIONS = [
  { id: 1, fechaIdent: "2026-04-15", tramo: "TRAMO 07", frente: "ESTRUCTURAS", paquete: "Solado y base T07", semana: 4, categoria: "Diseño/Info", desc: "Detalle constructivo de muro de contención T07 sin recubrimiento de acero", accion: "RFI al proyectista", responsable: "Ing. Estruct.", fechaCompromiso: "2026-05-15", fechaReal: null, estado: "EN PROCESO", impacto: "Alto" },
  { id: 2, fechaIdent: "2026-04-20", tramo: "TRAMO 04", frente: "ARQUIT.", paquete: "Cobertura policarbonato pérgola T04", semana: 3, categoria: "Materiales", desc: "Cobertura policarbonato sólido — sin proveedor cotizado", accion: "Cotizar 3 proveedores Cusco/Lima", responsable: "Administr.", fechaCompromiso: "2026-05-25", fechaReal: null, estado: "EN PROCESO", impacto: "Alto" },
  { id: 3, fechaIdent: "2026-04-22", tramo: "TODOS", frente: "—", paquete: "Demoliciones y excavaciones", semana: 1, categoria: "Permisos", desc: "Plan de Monitoreo Arqueológico (PMA) — DDC Cusco", accion: "Seguimiento DDC", responsable: "Residente", fechaCompromiso: "2026-05-12", fechaReal: "2026-05-08", estado: "LEVANTADA", impacto: "Alto" },
  { id: 4, fechaIdent: "2026-04-25", tramo: "TODOS", frente: "ARQUIT.", paquete: "Pisos enchapados (todos los tramos)", semana: 3, categoria: "MO", desc: "Maestro picapedrero — escaso en mercado para empedrado tradicional", accion: "Contactar gremio picapedreros", responsable: "Maestro", fechaCompromiso: "2026-05-22", fechaReal: null, estado: "EN PROCESO", impacto: "Alto" },
  { id: 5, fechaIdent: "2026-04-28", tramo: "TRAMO 05", frente: "ARQUIT.", paquete: "Reja metálica decorativa tipo 02 T05", semana: 5, categoria: "Subcontratas", desc: "Subcontrato de forja decorativa no adjudicado", accion: "Cotizar 3 forjadores", responsable: "Administr.", fechaCompromiso: "2026-05-30", fechaReal: null, estado: "POR INICIAR", impacto: "Medio" },
  { id: 6, fechaIdent: "2026-05-02", tramo: "TRAMO 05", frente: "ESTRUCTURAS", paquete: "Estructura metálica pérgola T05", semana: 5, categoria: "Materiales", desc: "Perfilería metálica para pérgola (40+ ml) — orden de compra no emitida", accion: "Emitir OC esta semana", responsable: "Administr.", fechaCompromiso: "2026-05-20", fechaReal: null, estado: "EN PROCESO", impacto: "Alto" },
  { id: 7, fechaIdent: "2026-05-03", tramo: "TRAMO 06", frente: "ARQUIT.", paquete: "Mural / Panel informativo T06", semana: 3, categoria: "Diseño/Info", desc: "Diseño gráfico de paneles y mural no aprobado por DDC", accion: "Presentar propuestas a DDC", responsable: "Ing. Estruct.", fechaCompromiso: "2026-05-30", fechaReal: null, estado: "POR INICIAR", impacto: "Medio" },
  { id: 8, fechaIdent: "2026-05-05", tramo: "TODOS", frente: "ARQUIT.", paquete: "Pintura mineral muros", semana: 5, categoria: "Diseño/Info", desc: "Carta de colores no aprobada por DDC Cusco", accion: "Presentar muestras físicas", responsable: "Ing. Estruct.", fechaCompromiso: "2026-05-30", fechaReal: null, estado: "POR INICIAR", impacto: "Medio" },
  { id: 9, fechaIdent: "2026-05-06", tramo: "TRAMO 07", frente: "ARQUIT.", paquete: "Puerta mampara doble hoja T07", semana: 6, categoria: "Materiales", desc: "Mampara metálica vidrio incoloro doble hoja H=2.50m — fabricación a medida", accion: "Cotizar y emitir OC con plazo", responsable: "Administr.", fechaCompromiso: "2026-05-28", fechaReal: null, estado: "POR INICIAR", impacto: "Alto" },
  { id: 10, fechaIdent: "2026-05-07", tramo: "TRAMO 04", frente: "ARQUIT.", paquete: "Bancas metálicas T04", semana: 4, categoria: "Subcontratas", desc: "Subcontrato carpintería metálica + listones madera", accion: "Adjudicar subcontrato", responsable: "Administr.", fechaCompromiso: "2026-05-25", fechaReal: null, estado: "POR INICIAR", impacto: "Medio" },
  { id: 11, fechaIdent: "2026-05-08", tramo: "TODOS", frente: "ARQUIT.", paquete: "Pisos enchapados todos los tramos", semana: 3, categoria: "Materiales", desc: "Piedra laja regular cantera local — lead time 3 sem", accion: "Confirmar pedido", responsable: "Almacenero", fechaCompromiso: "2026-05-22", fechaReal: null, estado: "EN PROCESO", impacto: "Alto" },
  { id: 12, fechaIdent: "2026-05-09", tramo: "TODOS", frente: "ARQUIT.", paquete: "Pisos enchapados", semana: 3, categoria: "Materiales", desc: "Canto rodado para acabado piso enchapado", accion: "Cotizar con cantera", responsable: "Almacenero", fechaCompromiso: "2026-05-20", fechaReal: "2026-05-12", estado: "LEVANTADA", impacto: "Medio" },
  { id: 13, fechaIdent: "2026-05-09", tramo: "TODOS", frente: "IIEE", paquete: "Postes ornamentales (todos los tramos)", semana: 4, categoria: "Materiales", desc: "Postes ornamentales (25 und) aprobados DDC — sin fecha confirmada", accion: "Confirmar fecha con proveedor", responsable: "Almacenero", fechaCompromiso: "2026-06-05", fechaReal: null, estado: "EN PROCESO", impacto: "Alto" },
  { id: 14, fechaIdent: "2026-05-10", tramo: "TODOS", frente: "—", paquete: "Toda la obra", semana: 1, categoria: "Seguridad", desc: "Charlas diarias de 5 min no se dictan consistentemente", accion: "Prevencionista define rol", responsable: "Prevenc.", fechaCompromiso: "2026-05-18", fechaReal: null, estado: "POR INICIAR", impacto: "Medio" },
  { id: 15, fechaIdent: "2026-05-10", tramo: "TRAMO 06", frente: "ARQUIT.", paquete: "Baranda decorativa T06", semana: 4, categoria: "Subcontratas", desc: "Subcontrato forja para baranda decorativa", accion: "Cotizar y adjudicar", responsable: "Administr.", fechaCompromiso: "2026-05-28", fechaReal: null, estado: "POR INICIAR", impacto: "Medio" },
  { id: 16, fechaIdent: "2026-05-11", tramo: "TODOS", frente: "ARQUIT.", paquete: "Tarrajeos y enchapados", semana: 2, categoria: "Materiales", desc: "Cemento — stock alcanza solo 5 días", accion: "Reponer 80 bolsas", responsable: "Almacenero", fechaCompromiso: "2026-05-20", fechaReal: null, estado: "EN PROCESO", impacto: "Bajo" },
  { id: 17, fechaIdent: "2026-05-12", tramo: "TRAMO 05", frente: "ARQUIT.", paquete: "Mural informativo T05", semana: 5, categoria: "MO", desc: "Pintor artístico para mural — sin contratar", accion: "Buscar artista local Cusco", responsable: "Maestro", fechaCompromiso: "2026-05-28", fechaReal: null, estado: "POR INICIAR", impacto: "Medio" },
  { id: 18, fechaIdent: "2026-05-12", tramo: "TRAMO 01,02", frente: "ESTRUCTURAS", paquete: "Solado y vaciados T01-T02", semana: 2, categoria: "Subcontratas", desc: "Laboratorio para diseño de mezcla y rotura de probetas — sin contratar", accion: "Adjudicar laboratorio INACAL", responsable: "Administr.", fechaCompromiso: "2026-05-25", fechaReal: null, estado: "POR INICIAR", impacto: "Alto" },
  { id: 19, fechaIdent: "2026-05-12", tramo: "TODOS", frente: "ARQUIT.", paquete: "Asentado de empedrado", semana: 3, categoria: "Permisos", desc: "Horario de trabajo en zona monumental — confirmar (8am-5pm)", accion: "Solicitud por escrito MPC", responsable: "Residente", fechaCompromiso: "2026-05-18", fechaReal: null, estado: "EN PROCESO", impacto: "Medio" },
  { id: 20, fechaIdent: "2026-05-13", tramo: "TODOS", frente: "IIEE", paquete: "Postes ornamentales y conexión", semana: 6, categoria: "Permisos", desc: "Coordinación con Electro Sur Este para empalme", accion: "Presentar expediente técnico", responsable: "Ing. Elect.", fechaCompromiso: "2026-06-15", fechaReal: null, estado: "POR INICIAR", impacto: "Alto" },
  { id: 21, fechaIdent: "2026-05-13", tramo: "TRAMO 05,07", frente: "ESTRUCTURAS", paquete: "Demoliciones T05 y T07", semana: 1, categoria: "Frente/Predec.", desc: "Frente T05 y T07 no liberado — reubicación de comerciantes", accion: "Acta con comerciantes", responsable: "Inspector", fechaCompromiso: "2026-05-25", fechaReal: null, estado: "EN PROCESO", impacto: "Alto" },
];

const INITIAL_PPC = [
  { week: 1, fecha: "2026-03-30", programado: 12, cumplido: 3, source: "manual" },
  { week: 2, fecha: "2026-04-06", programado: 14, cumplido: 5, source: "manual" },
  { week: 3, fecha: "2026-04-13", programado: 16, cumplido: 7, source: "manual" },
  { week: 4, fecha: "2026-04-20", programado: 18, cumplido: 9, source: "manual" },
  { week: 5, fecha: "2026-04-27", programado: 20, cumplido: 14, source: "manual" },
  { week: 6, fecha: "2026-05-04", programado: 22, cumplido: 16, source: "manual" },
  { week: 7, fecha: "2026-05-11", programado: 24, cumplido: 18, source: "manual" },
];

const CURVA_S = [
  { mes: "Mar", planeado: 21753, ejecutado: 13619 },
  { mes: "Abr", planeado: 74957, ejecutado: 46931 },
  { mes: "May", planeado: 244077, ejecutado: 91334 },
  { mes: "Jun", planeado: 475645, ejecutado: null },
  { mes: "Jul", planeado: 584847, ejecutado: null },
];

const TOP_PARTIDAS = [
  { item: "1.3.6.1", desc: "VIDRIO TEMPLADO INCOLORO E=10mm, LAMINADO CON PVB 08mm", saldoMonto: 42500, pctAvance: 0.0 },
  { item: "1.3.4.2.1", desc: "MAMPARA DE FIERRO TIPO 01, SEGÚN DISEÑO", saldoMonto: 38900, pctAvance: 0.0 },
  { item: "1.6.8.1.2", desc: "CAMARA IP POE 2MP", saldoMonto: 27400, pctAvance: 0.0 },
  { item: "1.3.2.2.2.1", desc: "REPOSICION DE PISO LAJA DE CORTE REGULAR DE PIEDRA", saldoMonto: 26100, pctAvance: 12.3 },
  { item: "1.6.8.1.1", desc: "SERVIDOR DE GRABACION DE 16 CANALES", saldoMonto: 22800, pctAvance: 0.0 },
  { item: "1.3.4.1.1", desc: "PERGOLA DE ESTRUCTURA METALICA Y COBERTURA DE POLICARBONATO", saldoMonto: 19500, pctAvance: 0.0 },
  { item: "1.2.5.1", desc: "ACERO DE REFUERZO Fy=4200 KG/CM2", saldoMonto: 17200, pctAvance: 23.4 },
  { item: "1.3.4.3.1", desc: "REJA METALICA DECORATIVA DE FIERRO FORJADO TIPO 04", saldoMonto: 15800, pctAvance: 0.0 },
  { item: "1.5.3.1", desc: "TABLERO ELECTRICO GENERAL TG", saldoMonto: 12600, pctAvance: 0.0 },
  { item: "1.3.3.1.1", desc: "TARRAJEO DE MUROS INTERIORES Y EXTERIORES", saldoMonto: 11200, pctAvance: 18.7 },
];

const INITIAL_WEEKLY_PLANS = {};

const CNC_CATEGORIAS = [
  { id: 'MAT', label: 'Materiales', desc: 'Falta o llegada tardía de materiales' },
  { id: 'MO', label: 'Mano de Obra', desc: 'Ausencia, baja productividad, falta de personal' },
  { id: 'EQ', label: 'Equipos', desc: 'Avería, no disponibilidad' },
  { id: 'DIS', label: 'Diseño/Información', desc: 'RFI sin respuesta, planos no claros' },
  { id: 'CLI', label: 'Cliente/Entidad', desc: 'Cambios, decisiones pendientes' },
  { id: 'SC', label: 'Subcontratista', desc: 'No presencia, mala ejecución' },
  { id: 'PRE', label: 'Predecesora', desc: 'Actividad previa no terminó' },
  { id: 'PER', label: 'Permisos', desc: 'Autorizaciones pendientes' },
  { id: 'EXT', label: 'Clima/Externos', desc: 'Lluvia, paros, manifestaciones' },
  { id: 'OTR', label: 'Otros', desc: '' },
];

const COLORS = {
  verde: { bg: '#DCFCE7', border: '#86EFAC', text: '#15803D', solid: '#16A34A' },
  amarillo: { bg: '#FEF3C7', border: '#FCD34D', text: '#B45309', solid: '#D97706' },
  rojo: { bg: '#FEE2E2', border: '#FCA5A5', text: '#B91C1C', solid: '#DC2626' },
  azul: { bg: '#DBEAFE', border: '#93C5FD', text: '#1E40AF', solid: '#2563EB' },
  gris: { bg: '#F3F4F6', border: '#D1D5DB', text: '#4B5563', solid: '#6B7280' },
};

const FRENTES_LIST = ["OBRAS PROV.", "ESTRUCTURAS", "ARQUIT.", "IIEE", "IISS", "OBRAS COMPL."];
const CATEGORIAS = ["Diseño/Info", "Materiales", "MO", "Equipos", "Subcontratas", "Permisos", "Frente/Predec.", "Seguridad", "Externos"];
const ESTADOS_RESTR = ["POR INICIAR", "EN PROCESO", "LEVANTADA", "VENCIDA"];

// ============================================================================
// HELPERS
// ============================================================================

const formatCurrency = (n) => 'S/. ' + Math.round(n).toLocaleString('es-PE');
const formatPct = (n) => (n * 100).toFixed(1) + '%';
const fmtDate = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
};
const fmtFullDate = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Week helpers
function getWeekDates(weekNum) {
  const start = new Date(PROJECT.startDate);
  start.setDate(start.getDate() + (weekNum - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}
function isoDate(d) { return d.toISOString().split('T')[0]; }

function packagesInWeek(packages, weekNum) {
  const { start, end } = getWeekDates(weekNum);
  return packages.filter(p => {
    const pStart = new Date(p.inicio);
    const pEnd = new Date(p.fin);
    return pEnd >= start && pStart <= end;
  });
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

const StatusDot = ({ status, size = 10 }) => {
  const c = COLORS[status.toLowerCase()] || COLORS.gris;
  return <span className="inline-block rounded-full" style={{ width: size, height: size, backgroundColor: c.solid }} />;
};

const StatusBadge = ({ status, small = false }) => {
  const c = COLORS[status.toLowerCase()] || COLORS.gris;
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium uppercase tracking-wider ${small ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
      style={{ backgroundColor: c.bg, color: c.text, borderRadius: '4px', border: `1px solid ${c.border}` }}
    >
      <StatusDot status={status} size={6} />{status}
    </span>
  );
};

const Card = ({ children, className = '', noPad = false }) => (
  <div className={`bg-white border border-stone-200 rounded-lg ${noPad ? '' : 'p-6'} ${className}`}>{children}</div>
);

const SectionTitle = ({ icon: Icon, children, sub }) => (
  <div className="flex items-center gap-3 mb-4">
    {Icon && <Icon className="w-5 h-5 text-stone-600" strokeWidth={1.75} />}
    <div>
      <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">{children}</h2>
      {sub && <p className="text-xs text-stone-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const KPICard = ({ label, value, sub, accent, trend, icon: Icon }) => {
  const c = COLORS[accent] || COLORS.azul;
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5 relative overflow-hidden group hover:border-stone-300 transition-colors">
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: c.solid }} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-stone-400" strokeWidth={1.75} />}
      </div>
      <p className="text-3xl font-bold text-stone-900 mb-1 font-mono tabular-nums" style={{ letterSpacing: '-0.02em' }}>{value}</p>
      <div className="flex items-center gap-2 mt-2">
        {trend !== undefined && trend !== null && (
          <span className={`inline-flex items-center text-xs font-medium ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-stone-500'}`}>
            {trend > 0 ? <ArrowUp className="w-3 h-3" /> : trend < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {sub && <p className="text-xs text-stone-500">{sub}</p>}
      </div>
    </div>
  );
};

const FormField = ({ label, children, required }) => (
  <div>
    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// ============================================================================
// OVERVIEW VIEW
// ============================================================================

const OverviewView = ({ packages, restrictions, ppcHistory, setActiveTab }) => {
  const metrics = useMemo(() => {
    const totalPackages = packages.length;
    const verde = packages.filter(p => p.status === 'VERDE').length;
    const amarillo = packages.filter(p => p.status === 'AMARILLO').length;
    const rojo = packages.filter(p => p.status === 'ROJO').length;
    const activeRestr = restrictions.filter(r => r.estado !== 'LEVANTADA').length;
    const altoImpacto = restrictions.filter(r => r.estado !== 'LEVANTADA' && r.impacto === 'Alto').length;
    const lastPpc = ppcHistory[ppcHistory.length - 1];
    const prevPpc = ppcHistory[ppcHistory.length - 2];
    const lastPpcPct = lastPpc ? lastPpc.cumplido / lastPpc.programado : 0;
    const prevPpcPct = prevPpc ? prevPpc.cumplido / prevPpc.programado : 0;
    const ppcTrend = (lastPpcPct - prevPpcPct) * 100;
    const avgProgress = packages.reduce((s, p) => s + (p.metradoEjec / p.metradoTotal), 0) / packages.length;
    return { totalPackages, verde, amarillo, rojo, activeRestr, altoImpacto, lastPpcPct, ppcTrend, avgProgress };
  }, [packages, restrictions, ppcHistory]);

  const frenteProgress = useMemo(() => {
    const frentes = [
      { id: 'OBRAS_PROV', label: 'Obras Prov.', color: '#94A3B8' },
      { id: 'ESTRUCTURAS', label: 'Estructuras', color: '#F59E0B' },
      { id: 'ARQUIT', label: 'Arquitectura', color: '#16A34A' },
      { id: 'IISS', label: 'IISS', color: '#0284C7' },
      { id: 'IIEE', label: 'IIEE', color: '#CA8A04' },
      { id: 'CCTV', label: 'CCTV', color: '#0F766E' },
    ];
    return frentes.map(f => {
      const acts = packages.filter(p => p.frente === f.id);
      const costo = acts.reduce((s, p) => s + p.costo, 0);
      const ejec = acts.reduce((s, p) => s + (p.metradoEjec / (p.metrado || 1)) * p.costo, 0);
      return { name: f.label, frente: f.label, avance: costo > 0 ? (ejec / costo) * 100 : 0, color: f.color };
    });
  }, [packages]);

  const ppcChartData = useMemo(() => ppcHistory.map(p => ({
    semana: `S${p.week}`, PPC: Math.round((p.cumplido / p.programado) * 100), Meta: 85,
  })), [ppcHistory]);

  const restrictionsByCategory = useMemo(() => {
    const map = {};
    restrictions.filter(r => r.estado !== 'LEVANTADA').forEach(r => { map[r.categoria] = (map[r.categoria] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [restrictions]);

  const packageStatusData = [
    { name: 'Listos', value: metrics.verde, color: COLORS.verde.solid },
    { name: 'En levantam.', value: metrics.amarillo, color: COLORS.amarillo.solid },
    { name: 'Con restricc.', value: metrics.rojo, color: COLORS.rojo.solid },
  ];

  const topCritical = useMemo(() => restrictions.filter(r => r.estado !== 'LEVANTADA' && r.impacto === 'Alto').slice(0, 5), [restrictions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="BAC (Presupuesto Total)" value={formatCurrency(PROJECT.BAC)} sub={`Adm. Directa · CD: ${formatCurrency(PROJECT.BAC_directo)}`} accent="azul" icon={Building2} />
        <KPICard label="% Avance Físico" value={formatPct(metrics.avgProgress)} sub={`${metrics.totalPackages} paquetes`} accent={metrics.avgProgress >= 0.5 ? "verde" : "amarillo"} icon={Activity} />
        <KPICard label="PPC última semana" value={formatPct(metrics.lastPpcPct)} sub={`meta 85% — sem ${CURRENT_WEEK}`} accent={metrics.lastPpcPct >= 0.85 ? "verde" : metrics.lastPpcPct >= 0.6 ? "amarillo" : "rojo"} trend={metrics.ppcTrend} icon={TrendingUp} />
        <KPICard label="Restricciones Activas" value={metrics.activeRestr} sub={`${metrics.altoImpacto} de alto impacto`} accent={metrics.altoImpacto > 5 ? "rojo" : "amarillo"} icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionTitle icon={BarChart3} sub="Costo ejecutado / costo total por disciplina">Avance % por Frente</SectionTitle>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={frenteProgress} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#57534E' }} axisLine={{ stroke: '#E7E5E4' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#57534E' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E7E5E4', borderRadius: '6px', fontSize: '12px' }} formatter={(v) => v.toFixed(1) + '%'} labelFormatter={(l, payload) => payload[0] ? payload[0].payload.frente : l} />
                <Bar dataKey="avance" radius={[4, 4, 0, 0]}>
                  {frenteProgress.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

        <Card>
          <SectionTitle icon={Package} sub={`${metrics.totalPackages} paquetes`}>Estado de Paquetes</SectionTitle>
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={packageStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                  {packageStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E7E5E4', borderRadius: '6px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {packageStatusData.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-stone-700">{s.name}</span>
                </div>
                <span className="font-mono font-semibold text-stone-900">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle icon={Activity} sub="Plan Cumplido vs meta 85%">PPC Histórico</SectionTitle>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={ppcChartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#57534E' }} axisLine={{ stroke: '#E7E5E4' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#57534E' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E7E5E4', borderRadius: '6px', fontSize: '12px' }} />
                <ReferenceLine y={85} stroke="#D97706" strokeDasharray="4 4" label={{ value: 'Meta', position: 'right', fontSize: 10, fill: '#D97706' }} />
                <Line type="monotone" dataKey="PPC" stroke="#1E40AF" strokeWidth={2.5} dot={{ r: 4, fill: '#1E40AF' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle icon={TrendingUp} sub="Acumulado mensual S/.">Curva S — Planeado vs Ejecutado</SectionTitle>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={CURVA_S} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="planGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94A3B8" stopOpacity={0.4} /><stop offset="100%" stopColor="#94A3B8" stopOpacity={0.05} /></linearGradient>
                  <linearGradient id="ejecGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1E40AF" stopOpacity={0.5} /><stop offset="100%" stopColor="#1E40AF" stopOpacity={0.05} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#57534E' }} axisLine={{ stroke: '#E7E5E4' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#57534E' }} axisLine={false} tickLine={false} tickFormatter={(v) => 'S/.' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip formatter={(v) => v ? 'S/. ' + v.toLocaleString('es-PE') : '—'} contentStyle={{ backgroundColor: 'white', border: '1px solid #E7E5E4', borderRadius: '6px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="planeado" name="Planeado" stroke="#64748B" strokeWidth={2} fill="url(#planGrad)" />
                <Area type="monotone" dataKey="ejecutado" name="Ejecutado" stroke="#1E40AF" strokeWidth={2.5} fill="url(#ejecGrad)" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon={AlertCircle} sub="Impacto Alto, pendientes">Restricciones Críticas</SectionTitle>
            <button onClick={() => setActiveTab('restricciones')} className="text-xs text-stone-600 hover:text-stone-900 inline-flex items-center gap-1 group">
              Ver todas <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="space-y-2.5">
            {topCritical.map(r => (
              <div key={r.id} className="flex items-start gap-3 p-3 border border-stone-200 rounded-md hover:border-stone-300 transition-colors">
                <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS.rojo.solid }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 line-clamp-1">{r.desc}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-stone-500">
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{r.tramo}</span>
                    <span>•</span><span>{r.categoria}</span><span>•</span><span>Resp: {r.responsable}</span>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-stone-400 whitespace-nowrap font-mono">{fmtDate(r.fechaCompromiso)}</span>
              </div>
            ))}
            {topCritical.length === 0 && <p className="text-sm text-stone-500 text-center py-8">Sin restricciones críticas activas 🎉</p>}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Filter} sub="Solo activas">Restricciones por Categoría</SectionTitle>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={restrictionsByCategory} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 90 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#57534E' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#57534E' }} axisLine={false} tickLine={false} width={85} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E7E5E4', borderRadius: '6px', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#EA580C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// TRAMOS VIEW (unchanged from v1)
// ============================================================================

// ============================================================================
// TRENES VIEW — Trenes de trabajo (Lean Construction)
// ============================================================================

const FRENTE_LABELS = {
  OBRAS_PROV: 'Obras Provisionales', ESTRUCTURAS: 'Estructuras', ARQUIT: 'Arquitectura',
  IISS: 'Inst. Sanitarias', IIEE: 'Inst. Eléctricas', CCTV: 'Inst. Especiales (CCTV)',
};

const TrenesView = ({ packages, setPackages }) => {
  const [expandedTren, setExpandedTren] = useState(null);
  const [frenteFilter, setFrenteFilter] = useState('TODOS');

  const trenStats = useMemo(() => TRENES.map(tr => {
    const acts = packages.filter(p => p.tren === tr.id);
    const costoTotal = acts.reduce((s, p) => s + p.costo, 0);
    const costoEjec = acts.reduce((s, p) => s + (p.metradoEjec / (p.metrado || 1)) * p.costo, 0);
    const verde = acts.filter(p => p.status === 'VERDE').length;
    const amarillo = acts.filter(p => p.status === 'AMARILLO').length;
    const rojo = acts.filter(p => p.status === 'ROJO').length;
    return {
      ...tr, acts, costoTotal, costoEjec,
      avance: costoTotal > 0 ? costoEjec / costoTotal : 0,
      verde, amarillo, rojo,
    };
  }).filter(tr => tr.acts.length > 0), [packages]);

  const filteredTrenes = useMemo(() => {
    if (frenteFilter === 'TODOS') return trenStats;
    return trenStats.filter(tr => tr.frente === frenteFilter);
  }, [trenStats, frenteFilter]);

  const updateMetrado = (actId, value) => {
    const num = parseFloat(value) || 0;
    setPackages(packages.map(p => p.id === actId ? { ...p, metradoEjec: Math.min(num, p.metrado), metradoTotal: p.metrado } : p));
  };
  const toggleStatus = (actId, newStatus) => {
    setPackages(packages.map(p => p.id === actId ? { ...p, status: newStatus } : p));
  };

  const frentesPresent = useMemo(() => [...new Set(trenStats.map(t => t.frente))], [trenStats]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionTitle icon={GitCommit} sub="Lean Construction — cada tren agrupa partidas similares que fluyen por la obra">
          Trenes de Trabajo
        </SectionTitle>
        <select value={frenteFilter} onChange={(e) => setFrenteFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400 bg-white">
          <option value="TODOS">Todos los frentes</option>
          {frentesPresent.map(f => <option key={f} value={f}>{FRENTE_LABELS[f] || f}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTrenes.map(tr => (
          <button key={tr.id} onClick={() => setExpandedTren(expandedTren === tr.id ? null : tr.id)}
            className={`text-left bg-white border rounded-lg p-4 transition-all hover:shadow-sm ${expandedTren === tr.id ? 'border-stone-400 ring-1 ring-stone-200' : 'border-stone-200'}`}>
            <div className="flex items-start gap-2 mb-3">
              <div className="w-1.5 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: tr.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-stone-500 uppercase tracking-wider">{FRENTE_LABELS[tr.frente] || tr.frente}{tr.global && ' · Global'}</p>
                <h3 className="text-sm font-bold text-stone-900 leading-tight">{tr.name}</h3>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider">Avance valorizado</span>
                <span className="text-xl font-bold text-stone-900 font-mono tabular-nums">{formatPct(tr.avance)}</span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${tr.avance * 100}%`, backgroundColor: tr.color }} />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500 font-mono">{formatCurrency(tr.costoTotal)}</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="inline-flex items-center gap-0.5"><StatusDot status="verde" size={5} />{tr.verde}</span>
                <span className="inline-flex items-center gap-0.5"><StatusDot status="amarillo" size={5} />{tr.amarillo}</span>
                <span className="inline-flex items-center gap-0.5"><StatusDot status="rojo" size={5} />{tr.rojo}</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500 inline-flex items-center gap-1">
              {tr.acts.length} partidas · {expandedTren === tr.id ? 'ocultar' : 'ver detalle'}
              <ChevronRight className={`w-3 h-3 transition-transform ${expandedTren === tr.id ? 'rotate-90' : ''}`} />
            </div>
          </button>
        ))}
      </div>

      {expandedTren && (() => {
        const tr = trenStats.find(t => t.id === expandedTren);
        if (!tr) return null;
        return (
          <Card noPad className="overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between" style={{ backgroundColor: tr.color + '12' }}>
              <div>
                <h3 className="text-base font-bold text-stone-900">{tr.name}</h3>
                <p className="text-xs text-stone-600 mt-0.5">{tr.acts.length} partidas · {formatCurrency(tr.costoTotal)} · Click en metrado o estado para editar</p>
              </div>
              <button onClick={() => setExpandedTren(null)} className="text-stone-500 hover:text-stone-900"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Ítem</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Partida</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Metrado</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Ejec.</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider w-28">% Avance</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Costo S/.</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Fechas</th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {tr.acts.map(p => {
                    const av = p.metrado > 0 ? p.metradoEjec / p.metrado : 0;
                    return (
                      <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                        <td className="py-3 px-3 font-mono text-xs text-stone-500">{p.item}</td>
                        <td className="py-3 px-3 text-stone-900 max-w-sm">{p.desc}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-700">{p.metrado} <span className="text-stone-400">{p.und}</span></td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-700">{p.metradoEjec.toFixed(1)}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${av * 100}%`, backgroundColor: av >= 1 ? COLORS.verde.solid : av >= 0.5 ? COLORS.azul.solid : COLORS.amarillo.solid }} />
                            </div>
                            <span className="font-mono tabular-nums text-xs font-semibold text-stone-700 w-9 text-right">{(av * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-700">{formatCurrency(p.costo)}</td>
                        <td className="py-3 px-3 text-center text-xs text-stone-600 whitespace-nowrap font-mono">{fmtDate(p.inicio)} → {fmtDate(p.fin)}</td>
                        <td className="py-3 px-3 text-center">
                          <select value={p.status} onChange={(e) => toggleStatus(p.id, e.target.value)}
                            className="text-xs font-medium px-2 py-1 rounded border bg-transparent focus:outline-none cursor-pointer"
                            style={{ backgroundColor: COLORS[p.status.toLowerCase()].bg, color: COLORS[p.status.toLowerCase()].text, borderColor: COLORS[p.status.toLowerCase()].border }}>
                            <option value="VERDE">VERDE</option>
                            <option value="AMARILLO">AMARILLO</option>
                            <option value="ROJO">ROJO</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })()}
    </div>
  );
};

// ============================================================================
// ACTIVIDADES VIEW — Lista filtrable de las 216 partidas
// ============================================================================

const ActividadesView = ({ packages, setPackages }) => {
  const [search, setSearch] = useState('');
  const [frenteFilter, setFrenteFilter] = useState('TODOS');
  const [trenFilter, setTrenFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  const filtered = useMemo(() => packages.filter(p => {
    if (frenteFilter !== 'TODOS' && p.frente !== frenteFilter) return false;
    if (trenFilter !== 'TODOS' && p.tren !== trenFilter) return false;
    if (statusFilter !== 'TODOS' && p.status !== statusFilter) return false;
    if (search && !(p.desc.toLowerCase().includes(search.toLowerCase()) || p.item.includes(search))) return false;
    return true;
  }), [packages, search, frenteFilter, trenFilter, statusFilter]);

  const stats = useMemo(() => {
    const costo = filtered.reduce((s, p) => s + p.costo, 0);
    const ejec = filtered.reduce((s, p) => s + (p.metradoEjec / (p.metrado || 1)) * p.costo, 0);
    return { count: filtered.length, costo, ejec, avance: costo > 0 ? ejec / costo : 0 };
  }, [filtered]);

  const updateMetrado = (actId, value) => {
    const num = parseFloat(value) || 0;
    setPackages(packages.map(p => p.id === actId ? { ...p, metradoEjec: Math.min(num, p.metrado), metradoTotal: p.metrado } : p));
  };
  const toggleStatus = (actId, newStatus) => {
    setPackages(packages.map(p => p.id === actId ? { ...p, status: newStatus } : p));
  };

  const exportCSV = () => {
    const rows = ['id,item,descripcion,und,metrado,metradoEjec'];
    packages.forEach(p => rows.push(`${p.id},${p.item},"${p.desc}",${p.und},${p.metrado},${p.metradoEjec}`));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'metrados_balcon.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ({ target: { result } }) => {
      const lines = result.split('\n').filter(l => l.trim());
      const header = lines[0].toLowerCase().split(',');
      const idIdx = header.indexOf('id'), ejecIdx = header.findIndex(h => h.includes('ejec'));
      if (idIdx < 0 || ejecIdx < 0) { alert('El CSV debe tener columnas "id" y "metradoEjec"'); return; }
      const updates = {};
      lines.slice(1).forEach(line => {
        const cols = line.match(/(".*?"|[^,]+)/g) || line.split(',');
        const id = cols[idIdx]?.trim(), val = parseFloat(cols[ejecIdx]);
        if (id && !isNaN(val)) updates[id] = val;
      });
      const count = Object.keys(updates).length;
      if (count === 0) { alert('No se encontraron filas válidas en el CSV'); return; }
      setPackages(packages.map(p => p.id in updates ? { ...p, metradoEjec: Math.min(updates[p.id], p.metrado) } : p));
      alert(`✓ ${count} partidas actualizadas desde CSV`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const trenOptions = useMemo(() => {
    const ids = [...new Set(packages.map(p => p.tren))];
    return TRENES.filter(t => ids.includes(t.id));
  }, [packages]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Partidas filtradas" value={stats.count} sub={`de ${packages.length} totales`} accent="azul" icon={FileText} />
        <KPICard label="Costo filtrado" value={formatCurrency(stats.costo)} sub="costo directo" accent="gris" icon={Building2} />
        <KPICard label="Ejecutado" value={formatCurrency(stats.ejec)} sub={formatPct(stats.avance)} accent="verde" icon={CheckCircle2} />
        <KPICard label="Saldo" value={formatCurrency(stats.costo - stats.ejec)} sub="por ejecutar" accent="amarillo" icon={Clock} />
      </div>

      <Card noPad>
        <div className="p-4 border-b border-stone-200 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Buscar partida o ítem…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400" />
          </div>
          <select value={frenteFilter} onChange={(e) => setFrenteFilter(e.target.value)} className="px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400 bg-white">
            <option value="TODOS">Todos los frentes</option>
            {Object.entries(FRENTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={trenFilter} onChange={(e) => setTrenFilter(e.target.value)} className="px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400 bg-white">
            <option value="TODOS">Todos los trenes</option>
            {trenOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400 bg-white">
            <option value="TODOS">Todo estado</option>
            <option value="VERDE">VERDE</option>
            <option value="AMARILLO">AMARILLO</option>
            <option value="ROJO">ROJO</option>
          </select>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-stone-200 rounded-md hover:bg-stone-50 text-stone-600" title="Descargar CSV plantilla"><Download className="w-4 h-4" />CSV</button>
          <label className="flex items-center gap-1.5 px-3 py-2 text-sm bg-stone-900 text-white rounded-md hover:bg-stone-700 cursor-pointer" title="Importar metrados desde CSV"><Upload className="w-4 h-4" />Importar<input type="file" accept=".csv" onChange={importCSV} className="hidden" /></label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Ítem</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Partida</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Tren</th>
                <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Metrado</th>
                <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Ejec.</th>
                <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider w-24">% Av</th>
                <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Costo S/.</th>
                <th className="text-center py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const av = p.metrado > 0 ? p.metradoEjec / p.metrado : 0;
                const tren = TRENES.find(t => t.id === p.tren);
                return (
                  <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs text-stone-500">{p.item}</td>
                    <td className="py-2.5 px-3 text-stone-900 max-w-md text-xs">{p.desc}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-stone-600">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tren?.color || '#999' }} />
                        {tren?.name || p.tren}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs text-stone-700">{p.metrado} {p.und}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs text-stone-700">{p.metradoEjec.toFixed(1)}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${av * 100}%`, backgroundColor: av >= 1 ? COLORS.verde.solid : av >= 0.5 ? COLORS.azul.solid : COLORS.amarillo.solid }} />
                        </div>
                        <span className="font-mono tabular-nums text-[10px] font-semibold text-stone-600 w-8 text-right">{(av * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs text-stone-700">{formatCurrency(p.costo)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <select value={p.status} onChange={(e) => toggleStatus(p.id, e.target.value)}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-transparent focus:outline-none cursor-pointer"
                        style={{ backgroundColor: COLORS[p.status.toLowerCase()].bg, color: COLORS[p.status.toLowerCase()].text, borderColor: COLORS[p.status.toLowerCase()].border }}>
                        <option value="VERDE">VERDE</option>
                        <option value="AMARILLO">AMARILLO</option>
                        <option value="ROJO">ROJO</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan="8" className="py-12 text-center text-stone-500">Sin partidas que coincidan</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Alias de compatibilidad
const TramosView = TrenesView;


// ============================================================================
// PROGRAMACIÓN VIEW — Cronograma + Hoja de Programación Semanal editable
// ============================================================================

const ProgramacionView = ({ packages, setPackages, programacion, setProgramacion, ppcHistory, setPpcHistory, restrictions = [] }) => {
  const [view, setView] = useState('hoja'); // 'cronograma' | 'hoja'
  const [selectedWeek, setSelectedWeek] = useState(CURRENT_WEEK);
  const [frenteFilter, setFrenteFilter] = useState('TODOS');
  const [trenFilter, setTrenFilter] = useState('TODOS');
  const [search, setSearch] = useState('');
  const [soloProgramadas, setSoloProgramadas] = useState(false);

  const { start: weekStart, end: weekEnd } = getWeekDates(selectedWeek);

  // Frentes con restricciones activas (no LEVANTADAS) vigentes en la semana seleccionada
  const blockedFrentes = useMemo(() => {
    const set = new Set();
    restrictions.filter(r => r.estado !== 'LEVANTADA' && r.semana <= selectedWeek).forEach(r => {
      if (r.frente && r.frente !== '—') set.add(r.frente);
    });
    return set;
  }, [restrictions, selectedWeek]);

  // ---- Helpers de programación ----
  const getCell = (actId, week) => programacion[actId]?.[week] || { prog: 0, ejec: null };

  // Avance ejecutado acumulado hasta ANTES de una semana dada
  const avancePrevio = (act, week) => {
    const wp = programacion[act.id] || {};
    let suma = act.metradoPrevio || 0;
    Object.entries(wp).forEach(([w, cell]) => {
      if (parseInt(w) < week && cell.ejec != null) suma += cell.ejec;
    });
    return suma;
  };

  // Actualizar una celda (prog o ejec) y recalcular metradoEjec del package
  const setCell = (actId, week, field, rawValue) => {
    const value = rawValue === '' ? (field === 'ejec' ? null : 0) : (parseFloat(rawValue) || 0);
    setProgramacion(prev => {
      const actProg = { ...(prev[actId] || {}) };
      actProg[week] = { ...(actProg[week] || { prog: 0, ejec: null }), [field]: value };
      const next = { ...prev, [actId]: actProg };
      if (field === 'ejec') {
        const act = packages.find(p => p.id === actId);
        if (act) {
          const sumEjec = Object.values(actProg).reduce((s, c) => s + (c.ejec || 0), 0);
          const nuevoEjec = Math.min((act.metradoPrevio || 0) + sumEjec, act.metrado);
          setPackages(pkgs => pkgs.map(p => p.id === actId ? { ...p, metradoEjec: nuevoEjec, metradoTotal: p.metrado } : p));
        }
      }
      return next;
    });
  };

  // ---- Lista filtrada de actividades ----
  const filteredActs = useMemo(() => packages.filter(p => {
    if (frenteFilter !== 'TODOS' && p.frente !== frenteFilter) return false;
    if (trenFilter !== 'TODOS' && p.tren !== trenFilter) return false;
    if (search && !(p.desc.toLowerCase().includes(search.toLowerCase()) || p.item.includes(search))) return false;
    if (soloProgramadas) {
      const cell = getCell(p.id, selectedWeek);
      if (!cell.prog && cell.ejec == null) return false;
    }
    return true;
  }), [packages, frenteFilter, trenFilter, search, soloProgramadas, programacion, selectedWeek]);

  // ---- KPIs de la semana ----
  const weekStats = useMemo(() => {
    let nProg = 0, valProg = 0, valEjec = 0, cumplidas = 0, programadas = 0;
    packages.forEach(p => {
      const cell = getCell(p.id, selectedWeek);
      if (cell.prog > 0) {
        nProg++; programadas++;
        valProg += cell.prog * p.precio;
        const e = cell.ejec || 0;
        valEjec += e * p.precio;
        if (e >= cell.prog * 0.95) cumplidas++;
      } else if (cell.ejec != null && cell.ejec > 0) {
        valEjec += cell.ejec * p.precio;
      }
    });
    const ppc = programadas > 0 ? cumplidas / programadas : 0;
    const cumplEcon = valProg > 0 ? valEjec / valProg : 0;
    return { nProg, valProg, valEjec, cumplidas, programadas, ppc, cumplEcon };
  }, [packages, programacion, selectedWeek]);

  // ---- Avance global del proyecto ----
  const avanceGlobal = useMemo(() => {
    const totalCosto = packages.reduce((s, p) => s + p.costo, 0);
    const ejecCosto = packages.reduce((s, p) => s + (p.metradoEjec / (p.metrado || 1)) * p.costo, 0);
    return totalCosto > 0 ? ejecCosto / totalCosto : 0;
  }, [packages]);

  // ---- Cerrar/guardar PPC de la semana ----
  const guardarPPC = () => {
    if (weekStats.programadas === 0) { alert('No hay partidas programadas en la semana ' + selectedWeek); return; }
    if (!confirm(`Guardar PPC de la semana ${selectedWeek} en el histórico?\n\nPartidas programadas: ${weekStats.programadas}\nCumplidas: ${weekStats.cumplidas}\nPPC: ${(weekStats.ppc * 100).toFixed(0)}%`)) return;
    setPpcHistory(prev => {
      const entry = { week: selectedWeek, fecha: isoDate(weekStart), programado: weekStats.programadas, cumplido: weekStats.cumplidas, source: 'programacion' };
      const exists = prev.find(p => p.week === selectedWeek);
      if (exists) return prev.map(p => p.week === selectedWeek ? entry : p);
      return [...prev, entry].sort((a, b) => a.week - b.week);
    });
    alert(`PPC de la semana ${selectedWeek} guardado: ${(weekStats.ppc * 100).toFixed(0)}%`);
  };

  // ---- Cronograma (Gantt 4 semanas) ----
  const [ganttStartWeek, setGanttStartWeek] = useState(CURRENT_WEEK);
  const ganttDates = useMemo(() => {
    const { start } = getWeekDates(ganttStartWeek);
    return Array.from({ length: 28 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  }, [ganttStartWeek]);
  const ganttStart = ganttDates[0], ganttEnd = ganttDates[27];
  const todayOffset = Math.floor((new Date(TODAY) - ganttStart) / 86400000);
  const getBarPos = (act) => {
    const s = new Date(act.inicio), e = new Date(act.fin);
    if (e < ganttStart || s > ganttEnd) return null;
    return { start: Math.max(0, Math.floor((s - ganttStart) / 86400000)), end: Math.min(27, Math.floor((e - ganttStart) / 86400000)) };
  };

  const trenOptions = useMemo(() => {
    const ids = [...new Set(packages.map(p => p.tren))];
    return TRENES.filter(t => ids.includes(t.id));
  }, [packages]);

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5">
          {[
            { id: 'hoja', label: 'Hoja de Programación', icon: ClipboardCheck },
            { id: 'cronograma', label: 'Cronograma', icon: CalendarDays },
          ].map(t => {
            const Icon = t.icon;
            const active = view === t.id;
            return (
              <button key={t.id} onClick={() => setView(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${active ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-50'}`}>
                <Icon className="w-4 h-4" />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ====================== HOJA DE PROGRAMACIÓN ====================== */}
      {view === 'hoja' && (
        <>
          {/* Selector de semana */}
          <Card>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                  className="w-8 h-8 flex items-center justify-center border border-stone-200 rounded-md hover:bg-stone-50 text-stone-600">‹</button>
                <div className="text-center min-w-[180px]">
                  <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Semana de trabajo</p>
                  <p className="text-2xl font-bold text-stone-900 font-mono">Semana {selectedWeek}</p>
                  <p className="text-xs text-stone-500 font-mono">{fmtFullDate(isoDate(weekStart))} → {fmtFullDate(isoDate(weekEnd))}</p>
                </div>
                <button onClick={() => setSelectedWeek(Math.min(PROJECT.totalWeeks, selectedWeek + 1))}
                  className="w-8 h-8 flex items-center justify-center border border-stone-200 rounded-md hover:bg-stone-50 text-stone-600">›</button>
                {selectedWeek === CURRENT_WEEK && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded uppercase tracking-wider">Semana actual</span>
                )}
              </div>
              <button onClick={guardarPPC}
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-md text-sm font-semibold hover:bg-stone-800">
                <CheckCircle2 className="w-4 h-4" />Guardar PPC en histórico
              </button>
            </div>
          </Card>

          {/* KPIs de la semana */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KPICard label="Partidas en el plan" value={weekStats.nProg} sub="con metrado programado" accent="azul" icon={Package} />
            <KPICard label="Valoriz. Programada" value={formatCurrency(weekStats.valProg)} sub="meta económica semana" accent="gris" icon={CalendarDays} />
            <KPICard label="Valoriz. Ejecutada" value={formatCurrency(weekStats.valEjec)} sub={`${formatPct(weekStats.cumplEcon)} de lo programado`} accent={weekStats.cumplEcon >= 0.9 ? 'verde' : 'amarillo'} icon={TrendingUp} />
            <KPICard label="PPC de la semana" value={formatPct(weekStats.ppc)} sub={`${weekStats.cumplidas}/${weekStats.programadas} partidas`} accent={weekStats.ppc >= 0.85 ? 'verde' : weekStats.ppc >= 0.6 ? 'amarillo' : 'rojo'} icon={Activity} />
            <KPICard label="Avance Global" value={formatPct(avanceGlobal)} sub="del costo directo total" accent="azul" icon={BarChart3} />
          </div>

          {/* Filtros */}
          <Card noPad>
            <div className="p-4 border-b border-stone-200 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Buscar partida o ítem…" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400" />
              </div>
              <select value={frenteFilter} onChange={(e) => setFrenteFilter(e.target.value)} className="px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400 bg-white">
                <option value="TODOS">Todos los frentes</option>
                {Object.entries(FRENTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={trenFilter} onChange={(e) => setTrenFilter(e.target.value)} className="px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400 bg-white">
                <option value="TODOS">Todos los trenes</option>
                {trenOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <label className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-stone-200 rounded-md cursor-pointer hover:bg-stone-50 select-none">
                <input type="checkbox" checked={soloProgramadas} onChange={(e) => setSoloProgramadas(e.target.checked)} className="rounded" />
                Solo partidas del plan
              </label>
            </div>

            {/* Hoja editable */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 1100 }}>
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-stone-600 uppercase tracking-wider">Ítem</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-stone-600 uppercase tracking-wider">Partida</th>
                    <th className="text-right py-2.5 px-2 text-[10px] font-semibold text-stone-600 uppercase tracking-wider">Metr. Total</th>
                    <th className="text-right py-2.5 px-2 text-[10px] font-semibold text-stone-600 uppercase tracking-wider">Av. previo</th>
                    <th className="text-right py-2.5 px-2 text-[10px] font-semibold text-stone-600 uppercase tracking-wider">Saldo</th>
                    <th className="text-center py-2.5 px-2 text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50">Programado</th>
                    <th className="text-center py-2.5 px-2 text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50">Ejecutado<br/><span className="text-[8px] font-medium">medición campo</span></th>
                    <th className="text-right py-2.5 px-2 text-[10px] font-semibold text-stone-600 uppercase tracking-wider">% Cumpl</th>
                    <th className="text-right py-2.5 px-3 text-[10px] font-semibold text-stone-600 uppercase tracking-wider">Valoriz. S/.</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActs.map(p => {
                    const cell = getCell(p.id, selectedWeek);
                    const prev = avancePrevio(p, selectedWeek);
                    const saldo = Math.max(0, p.metrado - prev);
                    const cumpl = cell.prog > 0 && cell.ejec != null ? cell.ejec / cell.prog : null;
                    const valoriz = (cell.ejec || 0) * p.precio;
                    const tren = TRENES.find(t => t.id === p.tren);
                    const enPlan = cell.prog > 0;
                    const bloqueada = blockedFrentes.has(p.frente);
                    return (
                      <tr key={p.id} className={`border-b border-stone-100 hover:bg-stone-50/50 ${enPlan ? 'bg-blue-50/30' : ''} ${bloqueada ? 'border-l-2 border-l-amber-400' : ''}`}>
                        <td className="py-2 px-3 font-mono text-[11px] text-stone-500">{p.item}</td>
                        <td className="py-2 px-3 max-w-xs">
                          <p className="text-xs text-stone-900 leading-tight flex items-center gap-1">
                            {bloqueada && <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" title="Restricción activa en este frente" />}
                            {p.desc}
                          </p>
                          <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tren?.color }} />{tren?.name}
                          </p>
                        </td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-[11px] text-stone-600">{p.metrado} {p.und}</td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-[11px] text-stone-500">{prev.toFixed(1)}</td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-[11px] font-semibold text-stone-700">{saldo.toFixed(1)}</td>
                        <td className="py-1.5 px-2 bg-blue-50/40">
                          <input type="number" value={cell.prog || ''} placeholder="0"
                            onChange={(e) => setCell(p.id, selectedWeek, 'prog', e.target.value)}
                            className="w-full text-right font-mono tabular-nums text-xs bg-white border border-blue-200 rounded px-1.5 py-1 text-stone-900 focus:outline-none focus:border-blue-400"
                            step="any" min="0" max={saldo} />
                        </td>
                        <td className="py-1.5 px-2 bg-emerald-50/40">
                          <input type="number" value={cell.ejec == null ? '' : cell.ejec} placeholder="—"
                            onChange={(e) => setCell(p.id, selectedWeek, 'ejec', e.target.value)}
                            className="w-full text-right font-mono tabular-nums text-xs bg-white border border-emerald-200 rounded px-1.5 py-1 text-stone-900 focus:outline-none focus:border-emerald-400"
                            step="any" min="0" max={saldo} />
                        </td>
                        <td className="py-2 px-2 text-right">
                          {cumpl != null ? (
                            <span className="font-mono tabular-nums text-xs font-bold" style={{ color: cumpl >= 0.95 ? COLORS.verde.solid : cumpl >= 0.6 ? COLORS.amarillo.solid : COLORS.rojo.solid }}>
                              {(cumpl * 100).toFixed(0)}%
                            </span>
                          ) : <span className="text-stone-300 text-xs">—</span>}
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-[11px] text-stone-700">{valoriz > 0 ? formatCurrency(valoriz) : '—'}</td>
                      </tr>
                    );
                  })}
                  {filteredActs.length === 0 && (
                    <tr><td colSpan="9" className="py-12 text-center text-stone-500">Sin partidas que coincidan con los filtros</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-stone-100 border-t-2 border-stone-300 font-semibold">
                    <td colSpan="5" className="py-2.5 px-3 text-xs text-stone-700 text-right uppercase tracking-wider">Totales de la semana {selectedWeek}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs text-blue-700">{formatCurrency(weekStats.valProg)}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs text-emerald-700">{formatCurrency(weekStats.valEjec)}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs" style={{ color: weekStats.cumplEcon >= 0.9 ? COLORS.verde.solid : COLORS.amarillo.solid }}>{formatPct(weekStats.cumplEcon)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs text-stone-900">{formatCurrency(weekStats.valEjec)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="p-4 bg-stone-50 border-t border-stone-200 text-xs text-stone-600 space-y-1">
              <p><span className="font-semibold text-blue-700">Programado</span>: cuánto metrado planeas ejecutar esta semana. Es tu compromiso semanal (Last Planner).</p>
              <p><span className="font-semibold text-emerald-700">Ejecutado</span>: la medición real de campo al final de la semana. Déjalo vacío hasta tener el dato medido.</p>
              <p><span className="font-semibold">% Cumpl</span>: ejecutado ÷ programado. <span className="font-semibold">Valorización</span>: ejecutado × precio unitario = el gasto/avance económico real.</p>
              <p>El <span className="font-semibold">avance de cada partida</span> en las tabs Trenes y Actividades se actualiza solo, sumando lo que registras aquí semana a semana.</p>
            </div>
          </Card>
        </>
      )}

      {/* ====================== CRONOGRAMA (Gantt) ====================== */}
      {view === 'cronograma' && (
        <Card noPad className="overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex items-center justify-between flex-wrap gap-3">
            <SectionTitle icon={CalendarDays} sub={`Ventana de 4 semanas · ${fmtDate(isoDate(ganttStart))} → ${fmtDate(isoDate(ganttEnd))}`}>
              Cronograma de Trenes
            </SectionTitle>
            <div className="flex items-center gap-2">
              <select value={trenFilter} onChange={(e) => setTrenFilter(e.target.value)} className="px-3 py-1.5 text-xs border border-stone-200 rounded bg-white">
                <option value="TODOS">Todos los trenes</option>
                {trenOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button onClick={() => setGanttStartWeek(Math.max(1, ganttStartWeek - 4))} className="px-2.5 py-1.5 text-xs border border-stone-200 rounded hover:bg-stone-50">‹ 4 sem</button>
              <button onClick={() => setGanttStartWeek(CURRENT_WEEK)} className="px-2.5 py-1.5 text-xs bg-stone-900 text-white rounded">Hoy</button>
              <button onClick={() => setGanttStartWeek(ganttStartWeek + 4)} className="px-2.5 py-1.5 text-xs border border-stone-200 rounded hover:bg-stone-50">4 sem ›</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div style={{ minWidth: 1000 }}>
              <div className="flex border-b border-stone-200 bg-stone-50">
                <div className="w-[340px] flex-shrink-0 px-3 py-2 text-[10px] font-semibold text-stone-600 uppercase tracking-wider">Partida</div>
                <div className="flex-1 flex">
                  {[0, 1, 2, 3].map(wk => (
                    <div key={wk} className="flex-1 border-l border-stone-200 px-2 py-2 text-center text-[10px] font-semibold text-stone-600 uppercase tracking-wider">
                      Sem {ganttStartWeek + wk}
                    </div>
                  ))}
                </div>
              </div>
              {TRENES.filter(tr => (trenFilter === 'TODOS' || tr.id === trenFilter) && packages.some(p => p.tren === tr.id)).map(tr => {
                const acts = packages.filter(p => p.tren === tr.id && getBarPos(p) !== null);
                if (acts.length === 0) return null;
                return (
                  <div key={tr.id}>
                    <div className="flex border-b border-stone-200" style={{ backgroundColor: tr.color + '15' }}>
                      <div className="w-full px-3 py-1 text-[11px] font-bold" style={{ color: tr.color }}>▼ {tr.name}</div>
                    </div>
                    {acts.map(p => {
                      const pos = getBarPos(p);
                      const cw = 100 / 28;
                      const barColor = p.status === 'VERDE' ? COLORS.verde.solid : p.status === 'AMARILLO' ? COLORS.amarillo.solid : COLORS.rojo.solid;
                      return (
                        <div key={p.id} className="flex border-b border-stone-100 hover:bg-stone-50/50">
                          <div className="w-[340px] flex-shrink-0 px-3 py-1.5 flex items-center gap-2">
                            <StatusDot status={p.status} size={7} />
                            <span className="font-mono text-[9px] text-stone-400">{p.item}</span>
                            <p className="text-[11px] text-stone-800 truncate flex-1">{p.desc}</p>
                          </div>
                          <div className="flex-1 relative" style={{ minHeight: 30 }}>
                            <div className="absolute inset-0 flex">
                              {ganttDates.map((d, i) => <div key={i} className="flex-1 border-l border-stone-100" style={{ backgroundColor: d.getDay() === 0 ? '#FAFAF9' : 'transparent' }} />)}
                            </div>
                            {todayOffset >= 0 && todayOffset < 28 && (
                              <div className="absolute top-0 bottom-0 w-px bg-amber-500 z-10" style={{ left: `calc(${todayOffset * cw}% + ${cw / 2}%)` }} />
                            )}
                            <div className="absolute top-1 bottom-1 rounded shadow-sm" style={{ left: `${pos.start * cw}%`, width: `${(pos.end - pos.start + 1) * cw}%`, backgroundColor: barColor, opacity: 0.9 }}
                              title={`${p.desc}\n${fmtDate(p.inicio)} - ${fmtDate(p.fin)}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-4 text-xs flex-wrap">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.verde.solid }} /><span className="text-stone-600">Sin restricción</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.amarillo.solid }} /><span className="text-stone-600">En levantamiento</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.rojo.solid }} /><span className="text-stone-600">Bloqueado</span></div>
            <div className="flex items-center gap-1.5"><div className="w-px h-3 bg-amber-500" /><span className="text-stone-600">Hoy</span></div>
          </div>
        </Card>
      )}
    </div>
  );
};


// ============================================================================
// CONTROL SEMANAL VIEW (NEW)
// ============================================================================

const ControlSemanalView = ({ packages, weeklyPlans, setWeeklyPlans, ppcHistory, setPpcHistory }) => {
  const lockedWeeks = useMemo(() => Object.values(weeklyPlans).filter(p => p.status === 'LOCKED').sort((a, b) => a.weekNum - b.weekNum), [weeklyPlans]);
  const closedWeeks = useMemo(() => Object.values(weeklyPlans).filter(p => p.status === 'CLOSED').sort((a, b) => a.weekNum - b.weekNum), [weeklyPlans]);

  const [selectedWeek, setSelectedWeek] = useState(null);
  const [cncDrafts, setCncDrafts] = useState({});

  // Default to first locked week
  useEffect(() => {
    if (lockedWeeks.length > 0 && (!selectedWeek || !weeklyPlans[selectedWeek])) {
      setSelectedWeek(lockedWeeks[0].weekNum);
    } else if (lockedWeeks.length === 0 && closedWeeks.length > 0 && !selectedWeek) {
      setSelectedWeek(closedWeeks[closedWeeks.length - 1].weekNum);
    }
  }, [lockedWeeks.length, closedWeeks.length]);

  const currentPlan = selectedWeek ? weeklyPlans[selectedWeek] : null;

  // CNC pareto across all closed weeks
  const cncStats = useMemo(() => {
    const counts = {};
    closedWeeks.forEach(wp => {
      wp.commitments.filter(c => c.result === 'NO CUMPLIDO' && c.cnc).forEach(c => {
        counts[c.cnc.categoria] = (counts[c.cnc.categoria] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [closedWeeks]);

  const markCommitment = (commitmentId, result) => {
    if (!currentPlan) return;
    setWeeklyPlans(prev => ({
      ...prev,
      [selectedWeek]: {
        ...currentPlan,
        commitments: currentPlan.commitments.map(c => {
          if (c.id !== commitmentId) return c;
          if (result === 'CUMPLIDO') return { ...c, result: 'CUMPLIDO', cnc: null };
          return { ...c, result: 'NO CUMPLIDO', cnc: c.cnc || { categoria: 'Materiales', descripcion: '', porQues: '' } };
        })
      }
    }));
  };

  const updateCnc = (commitmentId, field, value) => {
    setWeeklyPlans(prev => ({
      ...prev,
      [selectedWeek]: {
        ...currentPlan,
        commitments: currentPlan.commitments.map(c => c.id === commitmentId ? { ...c, cnc: { ...c.cnc, [field]: value } } : c)
      }
    }));
  };

  const allMarked = currentPlan?.commitments.every(c => c.result !== null);
  const cumplidos = currentPlan?.commitments.filter(c => c.result === 'CUMPLIDO').length || 0;

  // ---- Photos ----
  const addPhotos = (files) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = ({ target: { result } }) => {
        const foto = { id: Date.now() + Math.random(), dataUrl: result, caption: '', date: TODAY };
        setWeeklyPlans(prev => ({
          ...prev,
          [selectedWeek]: { ...prev[selectedWeek], fotos: [...(prev[selectedWeek]?.fotos || []), foto] }
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const updateCaption = (fotoId, caption) => {
    setWeeklyPlans(prev => ({
      ...prev,
      [selectedWeek]: { ...prev[selectedWeek], fotos: prev[selectedWeek].fotos.map(f => f.id === fotoId ? { ...f, caption } : f) }
    }));
  };

  const removePhoto = (fotoId) => {
    setWeeklyPlans(prev => ({
      ...prev,
      [selectedWeek]: { ...prev[selectedWeek], fotos: prev[selectedWeek].fotos.filter(f => f.id !== fotoId) }
    }));
  };
  const noCumplidos = currentPlan?.commitments.filter(c => c.result === 'NO CUMPLIDO').length || 0;
  const total = currentPlan?.commitments.length || 0;
  const ppcCalc = total > 0 ? cumplidos / total : 0;

  // Check CNC completeness
  const cncIncomplete = currentPlan?.commitments.filter(c => c.result === 'NO CUMPLIDO' && (!c.cnc?.descripcion)) || [];

  const closeWeek = () => {
    if (!allMarked) { alert('Marca todos los compromisos como CUMPLIDO o NO CUMPLIDO antes de cerrar.'); return; }
    if (cncIncomplete.length > 0) { alert(`Faltan descripciones de CNC en ${cncIncomplete.length} compromiso(s) no cumplidos.`); return; }
    if (!confirm(`¿Cerrar control de semana ${selectedWeek}?\nPPC: ${(ppcCalc * 100).toFixed(0)}% (${cumplidos}/${total})\n\nEsto registra el PPC en el histórico y no podrá modificarse.`)) return;

    const { start } = getWeekDates(selectedWeek);
    setWeeklyPlans(prev => ({
      ...prev,
      [selectedWeek]: { ...currentPlan, status: 'CLOSED', closedDate: TODAY }
    }));
    // Add to PPC history
    setPpcHistory(prev => {
      const existing = prev.find(p => p.week === selectedWeek);
      const entry = { week: selectedWeek, fecha: isoDate(start), programado: total, cumplido: cumplidos, source: 'control' };
      if (existing) return prev.map(p => p.week === selectedWeek ? entry : p);
      return [...prev, entry].sort((a, b) => a.week - b.week);
    });
  };

  if (lockedWeeks.length === 0 && closedWeeks.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <ClipboardCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-700 font-medium">No hay planes semanales para controlar</p>
          <p className="text-sm text-stone-500 mt-1">Crea un Plan Semanal en la tab Programación → Plan Semanal</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionTitle icon={ClipboardCheck} sub="Cierre de Plan Semanal con registro de Causas de No Cumplimiento (CNC)">Control Semanal</SectionTitle>
        <select value={selectedWeek || ''} onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
          className="px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400 bg-white font-mono font-semibold">
          {[...lockedWeeks, ...closedWeeks].sort((a, b) => b.weekNum - a.weekNum).map(wp => (
            <option key={wp.weekNum} value={wp.weekNum}>
              S{wp.weekNum} {wp.status === 'CLOSED' ? '✓ Cerrada' : '🔒 Pendiente control'}
            </option>
          ))}
        </select>
      </div>

      {currentPlan && (
        <>
          {/* Live PPC */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Cumplidos" value={cumplidos} sub={`de ${total}`} accent="verde" icon={CheckCircle2} />
            <KPICard label="No Cumplidos" value={noCumplidos} sub={`de ${total}`} accent="rojo" icon={XCircle} />
            <KPICard label="PPC Calculado" value={formatPct(ppcCalc)} sub={ppcCalc >= 0.85 ? 'Cumple meta' : 'Bajo meta 85%'} accent={ppcCalc >= 0.85 ? "verde" : ppcCalc >= 0.6 ? "amarillo" : "rojo"} icon={Activity} />
            <KPICard label="Estado" value={currentPlan.status === 'CLOSED' ? 'Cerrada' : 'Pendiente'} sub={currentPlan.status === 'CLOSED' ? `Cerrada ${fmtDate(currentPlan.closedDate)}` : 'Por controlar'} accent={currentPlan.status === 'CLOSED' ? 'verde' : 'amarillo'} icon={currentPlan.status === 'CLOSED' ? CheckCircle2 : Clock} />
          </div>

          {/* Commitment checklist */}
          <Card noPad>
            <div className="p-5 border-b border-stone-200">
              <SectionTitle icon={ClipboardCheck} sub={`${total} compromisos firmados el ${fmtFullDate(currentPlan.lockedDate)}`}>
                Checklist de Compromisos
              </SectionTitle>
            </div>
            <div className="divide-y divide-stone-100">
              {currentPlan.commitments.map(c => {
                const pkg = packages.find(p => p.id === c.packageId);
                if (!pkg) return null;
                const isReadOnly = currentPlan.status === 'CLOSED';
                return (
                  <div key={c.id} className="p-4 hover:bg-stone-50/50">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold text-stone-700">{pkg.id}</span>
                          <span className="text-xs text-stone-500">{TRENES.find(t => t.id === pkg.tren)?.name || FRENTE_LABELS[pkg.frente]}</span>
                        </div>
                        <p className="text-sm font-medium text-stone-900">{pkg.desc}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-stone-600">
                          <span>Meta: <span className="font-mono font-semibold">{c.metaText || `${pkg.metradoTotal} ${pkg.und}`}</span></span>
                          <span>Resp: <span className="font-medium">{c.responsable}</span></span>
                          <span className="inline-flex items-center gap-1">Firma: <span className="font-mono font-bold bg-stone-100 px-1.5 py-0.5 rounded">{c.firma}</span></span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => !isReadOnly && markCommitment(c.id, 'CUMPLIDO')}
                          disabled={isReadOnly}
                          className={`px-3 py-2 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors ${c.result === 'CUMPLIDO' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400 hover:text-emerald-600'} ${isReadOnly ? 'cursor-not-allowed opacity-70' : ''}`}>
                          <Check className="w-3.5 h-3.5" />Cumplido
                        </button>
                        <button
                          onClick={() => !isReadOnly && markCommitment(c.id, 'NO CUMPLIDO')}
                          disabled={isReadOnly}
                          className={`px-3 py-2 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors ${c.result === 'NO CUMPLIDO' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-stone-600 border-stone-200 hover:border-red-400 hover:text-red-600'} ${isReadOnly ? 'cursor-not-allowed opacity-70' : ''}`}>
                          <X className="w-3.5 h-3.5" />No cumplido
                        </button>
                      </div>
                    </div>

                    {/* CNC form if not cumplido */}
                    {c.result === 'NO CUMPLIDO' && c.cnc && (
                      <div className="mt-3 ml-0 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs font-semibold text-red-900 uppercase tracking-wider mb-2 inline-flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />Causa de No Cumplimiento
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                          <select value={c.cnc.categoria} onChange={(e) => !isReadOnly && updateCnc(c.id, 'categoria', e.target.value)} disabled={isReadOnly}
                            className="text-xs px-2 py-1.5 border border-red-200 bg-white rounded focus:outline-none focus:border-red-400">
                            {CNC_CATEGORIAS.map(cat => <option key={cat.id} value={cat.label}>{cat.label}</option>)}
                          </select>
                          <input type="text" placeholder="Descripción breve de la causa" value={c.cnc.descripcion} disabled={isReadOnly}
                            onChange={(e) => updateCnc(c.id, 'descripcion', e.target.value)}
                            className="text-xs px-2 py-1.5 border border-red-200 bg-white rounded focus:outline-none focus:border-red-400" />
                        </div>
                        <textarea placeholder="5 Por Qués (opcional) — Profundiza en la causa raíz:&#10;1. ¿Por qué...?&#10;2. ¿Por qué...?&#10;3. ¿Por qué...?" value={c.cnc.porQues || ''} disabled={isReadOnly}
                          onChange={(e) => updateCnc(c.id, 'porQues', e.target.value)} rows="3"
                          className="w-full text-xs px-2 py-1.5 border border-red-200 bg-white rounded focus:outline-none focus:border-red-400 font-mono" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Close week button */}
            {currentPlan.status === 'LOCKED' && (
              <div className="p-5 bg-stone-50 border-t border-stone-200">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="text-sm text-stone-600">
                    {allMarked ? (
                      <span className="text-emerald-700 font-medium">✓ Todos los compromisos marcados. PPC calculado: <span className="font-bold font-mono">{(ppcCalc * 100).toFixed(0)}%</span></span>
                    ) : (
                      <span>Faltan {total - cumplidos - noCumplidos} compromisos por marcar</span>
                    )}
                  </div>
                  <button onClick={closeWeek} disabled={!allMarked || cncIncomplete.length > 0}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-md text-sm font-semibold hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed">
                    <CheckCircle2 className="w-4 h-4" />Cerrar control y registrar PPC
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Fotos de avance */}
          <Card noPad>
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <SectionTitle icon={Camera} sub={`Registro fotográfico de avance — Semana ${selectedWeek}`}>Fotos de Avance</SectionTitle>
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-900 text-white rounded-md hover:bg-stone-700 cursor-pointer no-print">
                <Camera className="w-4 h-4" />Agregar fotos
                <input type="file" accept="image/*" multiple onChange={(e) => addPhotos(e.target.files)} className="hidden" />
              </label>
            </div>
            {(currentPlan?.fotos || []).length === 0 ? (
              <div
                className="p-8 text-center text-stone-500 text-sm cursor-pointer hover:bg-stone-50 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); addPhotos(e.dataTransfer.files); }}>
                <Image className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                <p>Arrastra imágenes aquí o usa el botón "Agregar fotos"</p>
                <p className="text-xs text-stone-400 mt-1">JPG, PNG, WEBP — se almacenan en el navegador</p>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {(currentPlan?.fotos || []).map(foto => (
                  <div key={foto.id} className="relative group rounded-lg overflow-hidden border border-stone-200">
                    <img src={foto.dataUrl} alt={foto.caption || 'Avance'} className="w-full h-36 object-cover" />
                    <button onClick={() => removePhoto(foto.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs no-print">
                      <X className="w-3 h-3" />
                    </button>
                    <input type="text" value={foto.caption} placeholder="Leyenda…"
                      onChange={(e) => updateCaption(foto.id, e.target.value)}
                      className="w-full px-2 py-1 text-xs border-t border-stone-200 bg-white focus:outline-none focus:bg-stone-50" />
                    <p className="px-2 py-0.5 text-[10px] text-stone-400 bg-white">{fmtDate(foto.date)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* CNC Pareto analysis */}
      {cncStats.length > 0 && (
        <Card>
          <SectionTitle icon={BarChart3} sub={`Acumulado de ${closedWeeks.length} semanas cerradas`}>Análisis de Causas de No Cumplimiento (CNC)</SectionTitle>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={cncStats} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 110 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#57534E' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#57534E' }} axisLine={false} tickLine={false} width={105} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E7E5E4', borderRadius: '6px', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#DC2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-stone-500 mt-3 italic">
            Las causas con barras más largas son las que más están bloqueando tu obra. Atacarlas primero mejora el PPC más rápido.
          </p>
        </Card>
      )}
    </div>
  );
};

// ============================================================================
// RESTRICTIONS VIEW (unchanged from v1)
// ============================================================================

const RestrictionsView = ({ restrictions, setRestrictions }) => {
  const [filterEstado, setFilterEstado] = useState('TODAS');
  const [filterCat, setFilterCat] = useState('TODAS');
  const [filterImpact, setFilterImpact] = useState('TODOS');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);

  const filtered = useMemo(() => restrictions.filter(r => {
    if (filterEstado !== 'TODAS' && r.estado !== filterEstado) return false;
    if (filterCat !== 'TODAS' && r.categoria !== filterCat) return false;
    if (filterImpact !== 'TODOS' && r.impacto !== filterImpact) return false;
    if (search && !(r.desc.toLowerCase().includes(search.toLowerCase()) || r.paquete.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }), [restrictions, filterEstado, filterCat, filterImpact, search]);

  const stats = useMemo(() => ({
    total: restrictions.length,
    porIniciar: restrictions.filter(r => r.estado === 'POR INICIAR').length,
    enProceso: restrictions.filter(r => r.estado === 'EN PROCESO').length,
    levantadas: restrictions.filter(r => r.estado === 'LEVANTADA').length,
    alto: restrictions.filter(r => r.impacto === 'Alto' && r.estado !== 'LEVANTADA').length,
  }), [restrictions]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      fechaIdent: new Date().toISOString().split('T')[0], tramo: 'TRAMO 01', frente: 'ESTRUCTURAS',
      paquete: '', semana: CURRENT_WEEK, categoria: 'Materiales',
      desc: '', accion: '', responsable: '', fechaCompromiso: '', fechaReal: null,
      estado: 'POR INICIAR', impacto: 'Medio',
    });
    setModalOpen(true);
  };

  const openEditModal = (r) => { setEditingId(r.id); setForm({ ...r }); setModalOpen(true); };

  const saveRestriction = () => {
    if (!form.desc || !form.accion) return;
    if (editingId) setRestrictions(restrictions.map(r => r.id === editingId ? { ...form, id: editingId } : r));
    else {
      const newId = Math.max(...restrictions.map(r => r.id), 0) + 1;
      setRestrictions([...restrictions, { ...form, id: newId }]);
    }
    setModalOpen(false);
  };

  const markAsLifted = (id) => setRestrictions(restrictions.map(r => r.id === id ? { ...r, estado: 'LEVANTADA', fechaReal: new Date().toISOString().split('T')[0] } : r));
  const deleteRestriction = (id) => { if (confirm('¿Eliminar esta restricción?')) setRestrictions(restrictions.filter(r => r.id !== id)); };

  const StatChip = ({ label, value, color, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-start gap-1 px-4 py-3 rounded-lg border transition-all ${active ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
      <span className={`text-[10px] font-semibold uppercase tracking-widest ${active ? 'text-stone-300' : 'text-stone-500'}`}>{label}</span>
      <span className={`text-2xl font-bold font-mono tabular-nums ${active ? 'text-white' : color || 'text-stone-900'}`}>{value}</span>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatChip label="Total" value={stats.total} active={filterEstado === 'TODAS'} onClick={() => setFilterEstado('TODAS')} />
        <StatChip label="Por iniciar" value={stats.porIniciar} color="text-stone-700" active={filterEstado === 'POR INICIAR'} onClick={() => setFilterEstado('POR INICIAR')} />
        <StatChip label="En proceso" value={stats.enProceso} color="text-amber-600" active={filterEstado === 'EN PROCESO'} onClick={() => setFilterEstado('EN PROCESO')} />
        <StatChip label="Levantadas" value={stats.levantadas} color="text-emerald-600" active={filterEstado === 'LEVANTADA'} onClick={() => setFilterEstado('LEVANTADA')} />
        <StatChip label="Impacto Alto" value={stats.alto} color="text-red-600" active={filterImpact === 'Alto'} onClick={() => setFilterImpact(filterImpact === 'Alto' ? 'TODOS' : 'Alto')} />
      </div>

      <Card noPad>
        <div className="p-4 border-b border-stone-200 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Buscar restricción o paquete…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400" />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400 bg-white">
            <option value="TODAS">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={openAddModal} className="inline-flex items-center gap-1.5 bg-stone-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-stone-800 transition-colors">
            <Plus className="w-4 h-4" /> Nueva
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">ID</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Tramo</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Categoría</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Descripción</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Responsable</th>
                <th className="text-center py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Compromiso</th>
                <th className="text-center py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Estado</th>
                <th className="text-center py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Impacto</th>
                <th className="text-center py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const overdue = r.estado !== 'LEVANTADA' && r.fechaCompromiso && new Date(r.fechaCompromiso) < new Date(TODAY);
                return (
                  <tr key={r.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-stone-500">R{String(r.id).padStart(2, '0')}</td>
                    <td className="py-3 px-3 text-xs"><span className="inline-block bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium whitespace-nowrap">{r.tramo}</span></td>
                    <td className="py-3 px-3 text-xs text-stone-700 whitespace-nowrap">{r.categoria}</td>
                    <td className="py-3 px-3 max-w-md"><p className="text-stone-900 line-clamp-1">{r.desc}</p><p className="text-xs text-stone-500 mt-0.5 line-clamp-1">→ {r.accion}</p></td>
                    <td className="py-3 px-3 text-xs text-stone-700 whitespace-nowrap">{r.responsable}</td>
                    <td className="py-3 px-3 text-center text-xs whitespace-nowrap">
                      <div className={overdue ? 'text-red-600 font-semibold' : 'text-stone-600'}>{fmtDate(r.fechaCompromiso)}{overdue && <span className="block text-[10px]">vencida</span>}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {(() => {
                        const colorMap = { 'POR INICIAR': 'gris', 'EN PROCESO': 'amarillo', 'LEVANTADA': 'verde', 'VENCIDA': 'rojo' };
                        const c = COLORS[colorMap[r.estado]] || COLORS.gris;
                        return <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 font-medium rounded" style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}>{r.estado === 'LEVANTADA' && <Check className="w-3 h-3" />}{r.estado}</span>;
                      })()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {(() => {
                        const ic = { 'Alto': 'rojo', 'Medio': 'amarillo', 'Bajo': 'verde' };
                        const c = COLORS[ic[r.impacto]];
                        return <span className="inline-block text-[10px] px-2 py-0.5 font-medium rounded" style={{ backgroundColor: c.bg, color: c.text }}>{r.impacto}</span>;
                      })()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        {r.estado !== 'LEVANTADA' && <button onClick={() => markAsLifted(r.id)} className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600" title="Marcar como levantada"><Check className="w-3.5 h-3.5" /></button>}
                        <button onClick={() => openEditModal(r)} className="p-1.5 hover:bg-stone-100 rounded text-stone-600" title="Editar"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteRestriction(r.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan="9" className="py-12 text-center text-stone-500">Sin restricciones que coincidan con los filtros</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {modalOpen && form && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-stone-200 p-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900">{editingId ? 'Editar Restricción' : 'Nueva Restricción'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Tramo afectado">
                  <select value={form.tramo} onChange={(e) => setForm({ ...form, tramo: e.target.value })} className="form-input">
                    {['TODOS', ...TRAMOS.map(t => t.name)].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
                <FormField label="Frente">
                  <select value={form.frente} onChange={(e) => setForm({ ...form, frente: e.target.value })} className="form-input">
                    <option value="—">—</option>
                    {FRENTES_LIST.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </FormField>
                <FormField label="Categoría">
                  <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="form-input">
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Impacto">
                  <select value={form.impacto} onChange={(e) => setForm({ ...form, impacto: e.target.value })} className="form-input">
                    {['Alto', 'Medio', 'Bajo'].map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </FormField>
              </div>
              <FormField label="Paquete afectado"><input type="text" value={form.paquete} onChange={(e) => setForm({ ...form, paquete: e.target.value })} className="form-input" placeholder="Ej: Piso enchapado T05" /></FormField>
              <FormField label="Descripción de la restricción" required><textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} className="form-input" rows="2" placeholder="Qué impide que la actividad inicie…" /></FormField>
              <FormField label="Acción para levantar" required><textarea value={form.accion} onChange={(e) => setForm({ ...form, accion: e.target.value })} className="form-input" rows="2" placeholder="Qué hay que hacer para resolver…" /></FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Responsable"><input type="text" value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })} className="form-input" placeholder="Ej: Residente" /></FormField>
                <FormField label="Fecha compromiso"><input type="date" value={form.fechaCompromiso} onChange={(e) => setForm({ ...form, fechaCompromiso: e.target.value })} className="form-input" /></FormField>
                <FormField label="Fecha identificada"><input type="date" value={form.fechaIdent} onChange={(e) => setForm({ ...form, fechaIdent: e.target.value })} className="form-input" /></FormField>
                <FormField label="Estado">
                  <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="form-input">
                    {ESTADOS_RESTR.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </FormField>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-stone-200 p-4 flex items-center justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 rounded">Cancelar</button>
              <button onClick={saveRestriction} className="px-4 py-2 text-sm bg-stone-900 text-white rounded hover:bg-stone-800">{editingId ? 'Guardar cambios' : 'Crear restricción'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .form-input { width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; border: 1px solid #E7E5E4; border-radius: 0.375rem; background-color: white; color: #1C1917; outline: none; transition: border-color 0.15s; }
        .form-input:focus { border-color: #78716C; }
      `}</style>
    </div>
  );
};

// ============================================================================
// PPC VIEW (now read-only history)
// ============================================================================

const PPCView = ({ ppcHistory, setActiveTab }) => {
  const chartData = ppcHistory.map(p => ({
    semana: `S${p.week}`, PPC: Math.round((p.cumplido / p.programado) * 100), Meta: 85,
  }));

  const avgPPC = ppcHistory.reduce((s, p) => s + (p.cumplido / p.programado), 0) / ppcHistory.length;
  const lastPPC = ppcHistory[ppcHistory.length - 1];
  const trend = ppcHistory.length >= 2 ? (lastPPC.cumplido / lastPPC.programado) - (ppcHistory[ppcHistory.length - 2].cumplido / ppcHistory[ppcHistory.length - 2].programado) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KPICard label="PPC Promedio" value={formatPct(avgPPC)} sub={`${ppcHistory.length} semanas`} accent={avgPPC >= 0.85 ? 'verde' : avgPPC >= 0.6 ? 'amarillo' : 'rojo'} icon={Activity} />
        <KPICard label="Última semana" value={formatPct(lastPPC.cumplido / lastPPC.programado)} sub={`S${lastPPC.week} • ${fmtDate(lastPPC.fecha)}`} accent="azul" trend={trend * 100} icon={Calendar} />
        <KPICard label="Tareas Programadas" value={lastPPC.programado} sub="última semana" accent="gris" icon={Package} />
        <KPICard label="Tareas Cumplidas" value={lastPPC.cumplido} sub={`${lastPPC.programado - lastPPC.cumplido} no cumplidas`} accent="verde" icon={CheckCircle2} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle icon={Activity} sub="Histórico semanal con meta 85%">Evolución PPC</SectionTitle>
          <button onClick={() => setActiveTab('programacion')} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-stone-200 rounded hover:bg-stone-50">
            <FileSignature className="w-3.5 h-3.5" />Ir a Programación
          </button>
        </div>
        <div style={{ height: 340 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
              <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#57534E' }} axisLine={{ stroke: '#E7E5E4' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#57534E' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E7E5E4', borderRadius: '6px', fontSize: '12px' }} />
              <ReferenceLine y={85} stroke="#D97706" strokeDasharray="4 4" label={{ value: 'Meta 85%', position: 'right', fontSize: 10, fill: '#D97706' }} />
              <Line type="monotone" dataKey="PPC" stroke="#1E40AF" strokeWidth={3} dot={{ r: 5, fill: '#1E40AF', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card noPad>
        <div className="p-5 border-b border-stone-200">
          <SectionTitle icon={FileText} sub="Detalle semanal — los nuevos PPC se generan desde Control Semanal">Registro Histórico</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Semana</th>
                <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Fecha Inicio</th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Programado</th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Cumplido</th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">PPC</th>
                <th className="text-center py-2.5 px-4 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">vs Meta 85%</th>
                <th className="text-center py-2.5 px-4 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Origen</th>
              </tr>
            </thead>
            <tbody>
              {ppcHistory.map(p => {
                const pct = p.cumplido / p.programado;
                const meetMeta = pct >= 0.85;
                return (
                  <tr key={p.week} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-stone-900">Semana {p.week}</td>
                    <td className="py-3 px-4 font-mono text-xs text-stone-600">{fmtFullDate(p.fecha)}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-stone-700">{p.programado}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-stone-700">{p.cumplido}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums" style={{ color: meetMeta ? COLORS.verde.text : pct >= 0.6 ? COLORS.amarillo.text : COLORS.rojo.text }}>
                      {(pct * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 font-medium rounded" style={{ backgroundColor: meetMeta ? COLORS.verde.bg : pct >= 0.6 ? COLORS.amarillo.bg : COLORS.rojo.bg, color: meetMeta ? COLORS.verde.text : pct >= 0.6 ? COLORS.amarillo.text : COLORS.rojo.text }}>
                        {meetMeta ? '✓ Cumple' : `${((0.85 - pct) * 100).toFixed(0)}% por debajo`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-medium text-stone-500 uppercase">{p.source === 'control' ? '✓ Control' : 'Histórico'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// VALOR GANADO (EVM) VIEW — NEW
// ============================================================================

const ValorGanadoView = ({ acMonthly, setAcMonthly }) => {
  const [mode, setMode] = useState('CT'); // 'CD' (Costo Directo) | 'CT' (Costo Total)

  // Buckets según modo: CD solo costo directo, CT todos
  const activeBuckets = mode === 'CD' ? ['directo'] : ['directo', 'GG', 'sup', 'expTec', 'eval', 'liq'];

  // Helper: sum active buckets for a month entry
  const sumMonth = (entry) => {
    if (!entry) return null;
    let sum = 0; let allNull = true;
    activeBuckets.forEach(b => {
      if (entry[b] !== null && entry[b] !== undefined) { sum += entry[b]; allNull = false; }
    });
    return allNull ? null : sum;
  };

  // Build EVM monthly data
  const evmData = useMemo(() => {
    return PV_MONTHLY.map((pv, i) => {
      const ev = INITIAL_EV_MONTHLY[i];
      const ac = acMonthly[i];
      return {
        mes: pv.mes,
        PV: sumMonth(pv),
        EV: sumMonth(ev),
        AC: sumMonth(ac),
        PV_directo: pv.directo, EV_directo: ev.directo, AC_directo: ac.directo,
        PV_GG: pv.GG, EV_GG: ev.GG, AC_GG: ac.GG,
        PV_sup: pv.sup, EV_sup: ev.sup, AC_sup: ac.sup,
        PV_expTec: pv.expTec, EV_expTec: ev.expTec, AC_expTec: ac.expTec,
        PV_eval: pv.eval, EV_eval: ev.eval, AC_eval: ac.eval,
        PV_liq: pv.liq, EV_liq: ev.liq, AC_liq: ac.liq,
      };
    });
  }, [acMonthly, mode]);

  // Current month index — dynamic based on TODAY
  const currentIdx = Math.min(
    Math.max(0, new Date(TODAY).getMonth() - new Date(PROJECT.startDate).getMonth()),
    PV_MONTHLY.length - 1
  );
  const currentMonth = evmData[currentIdx];
  const PV = currentMonth.PV || 0;
  const EV = currentMonth.EV || 0;
  const AC = currentMonth.AC || 0;
  const BAC = mode === 'CD' ? PROJECT.BAC_directo : PROJECT.BAC;

  // EVM Metrics
  const CV = EV - AC;
  const SV = EV - PV;
  const CV_pct = EV > 0 ? (CV / EV) * 100 : 0;
  const SV_pct = PV > 0 ? (SV / PV) * 100 : 0;
  const CPI = AC > 0 ? EV / AC : 0;
  const SPI = PV > 0 ? EV / PV : 0;
  const EAC = CPI > 0 ? BAC / CPI : BAC;
  const ETC = EAC - AC;
  const VAC = BAC - EAC;

  // Status indicators
  const cpiStatus = CPI >= 1 ? 'verde' : CPI >= 0.9 ? 'amarillo' : 'rojo';
  const spiStatus = SPI >= 1 ? 'verde' : SPI >= 0.9 ? 'amarillo' : 'rojo';

  // Update AC value
  const updateAC = (monthIdx, bucket, value) => {
    const num = value === '' ? null : parseFloat(value) || 0;
    setAcMonthly(prev => prev.map((m, i) => i === monthIdx ? { ...m, [bucket]: num } : m));
  };

  return (
    <div className="space-y-4">
      {/* MODE TOGGLE: CD vs CT */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionTitle icon={TrendingUp} sub={mode === 'CD' ? 'Solo Costo Directo — el que gestionas en obra' : 'Costo Total — incluye GG, supervisión, evaluación, liquidación'}>
          Valor Ganado (EVM)
        </SectionTitle>
        <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5">
          <button onClick={() => setMode('CD')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'CD' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-50'}`}>
            Costo Directo
          </button>
          <button onClick={() => setMode('CT')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'CT' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-50'}`}>
            Costo Total
          </button>
        </div>
      </div>

      <div className={`p-3 rounded-lg text-xs ${mode === 'CD' ? 'bg-blue-50 text-blue-800' : 'bg-violet-50 text-violet-800'}`}>
        {mode === 'CD'
          ? <span><strong>Vista Costo Directo (S/. 584,847):</strong> es lo que gestionas operativamente en obra. Úsala para tu control diario y reuniones de equipo.</span>
          : <span><strong>Vista Costo Total (S/. 942,707):</strong> incluye gastos generales, supervisión, evaluación y liquidación. Úsala para reportar al Inspector / MP Cusco.</span>}
      </div>

      {/* HEADER: EVM Key KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label={`BAC ${mode}`} value={formatCurrency(BAC)} sub={mode === 'CD' ? 'presupuesto costo directo' : 'presupuesto total'} accent="azul" icon={Building2} />
        <KPICard label="EV (Valor Ganado)" value={formatCurrency(EV)} sub={`${formatPct(EV / BAC)} del BAC`} accent="verde" icon={CheckCircle2} />
        <KPICard label="AC (Costo Real)" value={formatCurrency(AC)} sub={`${formatPct(AC / BAC)} gastado`} accent={AC > EV ? "rojo" : "amarillo"} icon={TrendingDown} />
        <KPICard label="EAC (Estim. al final)" value={formatCurrency(EAC)} sub={EAC > BAC ? `Sobrecosto: ${formatCurrency(EAC - BAC)}` : `Ahorro: ${formatCurrency(BAC - EAC)}`} accent={EAC > BAC ? "rojo" : "verde"} icon={TrendingUp} />
      </div>

      {/* CPI / SPI Performance Indices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest">CPI · Eficiencia de Costo</p>
              <p className="text-4xl font-bold font-mono tabular-nums mt-1" style={{ color: COLORS[cpiStatus].solid }}>{CPI.toFixed(2)}</p>
              <p className="text-xs text-stone-500 mt-1">EV / AC · {CPI >= 1 ? 'Bajo presupuesto ✓' : 'Sobrecosto ✗'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">CV</p>
              <p className="text-lg font-bold font-mono" style={{ color: CV >= 0 ? COLORS.verde.solid : COLORS.rojo.solid }}>
                {CV >= 0 ? '+' : ''}{formatCurrency(CV)}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5 font-mono">{CV_pct >= 0 ? '+' : ''}{CV_pct.toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>{CPI < 1 ? `Por cada S/.1 ganado, gastas S/.${(1/CPI).toFixed(2)}` : `Por cada S/.1 gastado, ganas S/.${CPI.toFixed(2)}`}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest">SPI · Eficiencia de Cronograma</p>
              <p className="text-4xl font-bold font-mono tabular-nums mt-1" style={{ color: COLORS[spiStatus].solid }}>{SPI.toFixed(2)}</p>
              <p className="text-xs text-stone-500 mt-1">EV / PV · {SPI >= 1 ? 'Adelantado ✓' : 'Atrasado ✗'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">SV</p>
              <p className="text-lg font-bold font-mono" style={{ color: SV >= 0 ? COLORS.verde.solid : COLORS.rojo.solid }}>
                {SV >= 0 ? '+' : ''}{formatCurrency(SV)}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5 font-mono">{SV_pct >= 0 ? '+' : ''}{SV_pct.toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>{SPI < 1 ? `Progresas al ${(SPI * 100).toFixed(0)}% del ritmo planeado` : `Progresas al ${(SPI * 100).toFixed(0)}% del ritmo planeado`}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* TRIPLE CURVA S */}
      <Card>
        <SectionTitle icon={TrendingUp} sub="PV planeado · EV ganado · AC realmente gastado (acumulado S/.)">Curva S — Valor Planeado vs Ganado vs Costo Real</SectionTitle>
        <div style={{ height: 380 }}>
          <ResponsiveContainer>
            <AreaChart data={evmData} margin={{ top: 10, right: 30, bottom: 0, left: 10 }}>
              <defs>
                <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94A3B8" stopOpacity={0.4} /><stop offset="100%" stopColor="#94A3B8" stopOpacity={0.05} /></linearGradient>
                <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16A34A" stopOpacity={0.5} /><stop offset="100%" stopColor="#16A34A" stopOpacity={0.05} /></linearGradient>
                <linearGradient id="acGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#DC2626" stopOpacity={0.5} /><stop offset="100%" stopColor="#DC2626" stopOpacity={0.05} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#57534E' }} axisLine={{ stroke: '#E7E5E4' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#57534E' }} axisLine={false} tickLine={false} tickFormatter={(v) => 'S/.' + (v / 1000).toFixed(0) + 'k'} />
              <Tooltip formatter={(v, n) => v !== null && v !== undefined ? [formatCurrency(v), n] : ['—', n]} contentStyle={{ backgroundColor: 'white', border: '1px solid #E7E5E4', borderRadius: '6px', fontSize: '12px' }} />
              <ReferenceLine y={BAC} stroke="#1E40AF" strokeDasharray="4 4" label={{ value: `BAC: ${formatCurrency(BAC)}`, position: 'right', fontSize: 10, fill: '#1E40AF' }} />
              <ReferenceLine x={evmData[currentIdx]?.mes} stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 2" label={{ value: 'HOY', position: 'top', fontSize: 10, fill: '#B45309', fontWeight: 700 }} />
              <Area type="monotone" dataKey="PV" name="PV (Planeado)" stroke="#64748B" strokeWidth={2} fill="url(#pvGrad)" />
              <Area type="monotone" dataKey="EV" name="EV (Ganado)" stroke="#16A34A" strokeWidth={3} fill="url(#evGrad)" connectNulls={false} />
              <Area type="monotone" dataKey="AC" name="AC (Real)" stroke="#DC2626" strokeWidth={3} fill="url(#acGrad)" strokeDasharray="6 3" connectNulls={false} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-stone-50 rounded">
            <span className="inline-flex items-center gap-1.5 font-semibold text-stone-700"><span className="w-3 h-3 rounded bg-stone-500" />PV — Planeado</span>
            <p className="text-stone-600 mt-1">Lo que debería estar gastado a esa fecha según cronograma</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded">
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800"><span className="w-3 h-3 rounded bg-emerald-600" />EV — Ganado</span>
            <p className="text-emerald-700 mt-1">Lo realmente avanzado, valorado al precio planeado</p>
          </div>
          <div className="p-3 bg-red-50 rounded">
            <span className="inline-flex items-center gap-1.5 font-semibold text-red-800"><span className="w-3 h-3 rounded bg-red-600" />AC — Costo Real</span>
            <p className="text-red-700 mt-1">Lo que realmente se gastó (incluye sobrecostos)</p>
          </div>
        </div>
      </Card>

      {/* FORECAST CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest mb-2">EAC · Estimación al Término</p>
          <p className="text-3xl font-bold text-stone-900 font-mono tabular-nums">{formatCurrency(EAC)}</p>
          <p className="text-xs text-stone-500 mt-1">BAC / CPI = {formatCurrency(BAC)} / {CPI.toFixed(2)}</p>
          <p className="text-xs mt-2 font-medium" style={{ color: EAC > BAC ? COLORS.rojo.text : COLORS.verde.text }}>
            {EAC > BAC ? `⚠ Proyecta sobrecosto de ${formatCurrency(EAC - BAC)}` : `✓ Proyecta ahorro de ${formatCurrency(BAC - EAC)}`}
          </p>
        </Card>
        <Card>
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest mb-2">ETC · Falta por Gastar</p>
          <p className="text-3xl font-bold text-stone-900 font-mono tabular-nums">{formatCurrency(ETC)}</p>
          <p className="text-xs text-stone-500 mt-1">EAC - AC = lo que queda por desembolsar</p>
          <p className="text-xs mt-2 font-medium text-stone-700">Hasta el cierre del proyecto</p>
        </Card>
        <Card>
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest mb-2">VAC · Variación Final</p>
          <p className="text-3xl font-bold font-mono tabular-nums" style={{ color: VAC >= 0 ? COLORS.verde.solid : COLORS.rojo.solid }}>
            {VAC >= 0 ? '+' : ''}{formatCurrency(VAC)}
          </p>
          <p className="text-xs text-stone-500 mt-1">BAC - EAC = saldo final estimado</p>
          <p className="text-xs mt-2 font-medium" style={{ color: VAC >= 0 ? COLORS.verde.text : COLORS.rojo.text }}>
            {VAC >= 0 ? 'Cerrarías dentro de presupuesto' : 'Cerrarías sobre el presupuesto'}
          </p>
        </Card>
      </div>

      {/* PRONÓSTICO DE TÉRMINO */}
      {(() => {
        const startMs = new Date(PROJECT.startDate).getTime();
        const endMs = new Date(PROJECT.endDate).getTime();
        const todayMs = new Date(TODAY).getTime();
        const totalDays = Math.round((endMs - startMs) / 86400000);
        const daysElapsed = Math.max(1, Math.round((todayMs - startMs) / 86400000));
        const pctComplete = BAC > 0 ? EV / BAC : 0;
        const forecastTotalDays = pctComplete > 0 ? Math.round(daysElapsed / pctComplete) : totalDays;
        const forecastEndMs = startMs + forecastTotalDays * 86400000;
        const forecastEnd = new Date(forecastEndMs).toISOString().split('T')[0];
        const daysVariance = Math.round((forecastEndMs - endMs) / 86400000);
        const onTime = daysVariance <= 0;
        return (
          <Card>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest mb-1">Pronóstico de Término</p>
                <p className="text-2xl font-bold font-mono text-stone-900">{fmtFullDate(forecastEnd)}</p>
                <p className="text-xs text-stone-500 mt-1">Fin contractual: {fmtFullDate(PROJECT.endDate)} · Avance físico: {(pctComplete * 100).toFixed(1)}%</p>
              </div>
              <div className={`px-4 py-3 rounded-lg text-center ${onTime ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: onTime ? COLORS.verde.text : COLORS.rojo.text }}>
                  {onTime ? 'En plazo' : 'Con retraso'}
                </p>
                <p className="text-3xl font-bold font-mono" style={{ color: onTime ? COLORS.verde.solid : COLORS.rojo.solid }}>
                  {onTime ? `${Math.abs(daysVariance)}d` : `+${daysVariance}d`}
                </p>
                <p className="text-[10px] text-stone-500 mt-0.5">{onTime ? 'adelante' : 'de retraso proyectado'}</p>
              </div>
              <div className="text-xs text-stone-600 space-y-1 max-w-xs">
                <p><span className="font-semibold">Método:</span> días transcurridos ÷ % avance físico</p>
                <p><span className="font-semibold">Días transcurridos:</span> {daysElapsed} de {totalDays} ({(daysElapsed/totalDays*100).toFixed(0)}%)</p>
                <p><span className="font-semibold">Ritmo actual:</span> {(pctComplete/daysElapsed*30).toFixed(2)}% de avance / mes</p>
              </div>
            </div>
          </Card>
        );
      })()}


      {/* BUDGET BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionTitle icon={Layers} sub="Composición del BAC por bucket de costo">Desglose de Presupuesto</SectionTitle>
          <div className="space-y-3">
            {FINANCIAL_BREAKDOWN.map(b => {
              const acAtCurrent = currentMonth[`AC_${b.id}`] || 0;
              const pct = (acAtCurrent / b.budget) * 100;
              return (
                <div key={b.id} className="border border-stone-200 rounded-lg p-3 hover:border-stone-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 rounded-full" style={{ backgroundColor: b.color }} />
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{b.name}</p>
                        <p className="text-xs text-stone-500">{b.desc} · {b.pct.toFixed(2)}% del BAC</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold font-mono text-stone-900">{formatCurrency(b.budget)}</p>
                      <p className="text-xs text-stone-500 font-mono">Gastado: {formatCurrency(acAtCurrent)} ({pct.toFixed(0)}%)</p>
                    </div>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: b.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Package} sub="Distribución porcentual">Composición BAC</SectionTitle>
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={FINANCIAL_BREAKDOWN.map(b => ({ name: b.name, value: b.budget, color: b.color }))} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                  {FINANCIAL_BREAKDOWN.map((b, i) => <Cell key={i} fill={b.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: 'white', border: '1px solid #E7E5E4', borderRadius: '6px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* MONTHLY AC TABLE (EDITABLE) */}
      <Card noPad>
        <div className="p-5 border-b border-stone-200">
          <SectionTitle icon={Edit2} sub="Acumulado a fin de mes en S/. — celdas amarillas son editables">Registro de Costo Real (AC) Mensual</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left py-2.5 px-4 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Mes</th>
                {FINANCIAL_BREAKDOWN.map(b => (
                  <th key={b.id} className="text-right py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="whitespace-nowrap">{b.name}</span>
                    </div>
                  </th>
                ))}
                <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-stone-600 uppercase tracking-wider bg-stone-100">Total AC</th>
              </tr>
            </thead>
            <tbody>
              {acMonthly.map((row, i) => {
                const total = sumMonth(row);
                return (
                  <tr key={row.mes} className="border-b border-stone-100 hover:bg-stone-50/30">
                    <td className="py-3 px-4 font-semibold text-stone-900">{row.mes} 2026</td>
                    {FINANCIAL_BREAKDOWN.map(b => (
                      <td key={b.id} className="py-2 px-3 text-right">
                        <input type="number" value={row[b.id] === null ? '' : row[b.id]}
                          onChange={(e) => updateAC(i, b.id, e.target.value)}
                          placeholder="—"
                          className="w-24 text-right font-mono tabular-nums text-xs bg-amber-50 border border-amber-200 rounded px-2 py-1 text-stone-900 focus:outline-none focus:border-amber-400" />
                      </td>
                    ))}
                    <td className="py-3 px-3 text-right font-mono font-bold text-stone-900 bg-stone-50">
                      {total !== null ? formatCurrency(total) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-stone-50 border-t border-stone-200 text-xs text-stone-600">
          <p><span className="font-semibold">Cómo usar:</span> a fin de cada mes registra el AC acumulado de cada bucket. El sistema recalcula automáticamente PV, EV, CPI, SPI y EAC.</p>
          <p className="mt-1"><span className="font-semibold">AC vs EV:</span> AC es lo que realmente saliste del cajón. EV es lo que "ganaste" según el avance físico valorado al precio planeado. Si AC &gt; EV, hay sobrecosto. Si EV &gt; AC, hay ahorro.</p>
        </div>
      </Card>

      {/* COMPARATIVO DE VALORIZACIÓN */}
      <Card noPad>
        <div className="p-5 border-b border-stone-200">
          <SectionTitle icon={BarChart3} sub="Valorización mensual acumulada: Planeado vs Ganado vs Costo Real">Comparativo de Valorización por Mes</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">Mes</th>
                <th className="text-right py-3 px-4 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">PV Planeado</th>
                <th className="text-right py-3 px-4 text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">EV Ganado</th>
                <th className="text-right py-3 px-4 text-[11px] font-semibold text-red-600 uppercase tracking-wider">AC Real</th>
                <th className="text-right py-3 px-4 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">SV (Plazo)</th>
                <th className="text-right py-3 px-4 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">CV (Costo)</th>
                <th className="text-right py-3 px-4 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">% Avance</th>
              </tr>
            </thead>
            <tbody>
              {evmData.map((row, i) => {
                const pv = row.PV || 0;
                const ev = row.EV;
                const ac = row.AC;
                const sv = ev != null ? ev - pv : null;
                const cv = ev != null && ac != null ? ev - ac : null;
                const pct = ev != null && BAC > 0 ? ev / BAC : null;
                const isCurrent = i === currentIdx;
                return (
                  <tr key={row.mes} className={`border-b border-stone-100 hover:bg-stone-50 ${isCurrent ? 'bg-amber-50/50' : ''}`}>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {row.mes} 2026 {isCurrent && <span className="ml-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded uppercase">HOY</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-stone-600">{formatCurrency(pv)}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">{ev != null ? formatCurrency(ev) : '—'}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-red-600">{ac != null ? formatCurrency(ac) : '—'}</td>
                    <td className="py-3 px-4 text-right font-mono text-xs" style={{ color: sv == null ? '#9CA3AF' : sv >= 0 ? COLORS.verde.solid : COLORS.rojo.solid }}>
                      {sv == null ? '—' : (sv >= 0 ? '+' : '') + formatCurrency(sv)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs" style={{ color: cv == null ? '#9CA3AF' : cv >= 0 ? COLORS.verde.solid : COLORS.rojo.solid }}>
                      {cv == null ? '—' : (cv >= 0 ? '+' : '') + formatCurrency(cv)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {pct != null ? (
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, pct * 100)}%` }} />
                          </div>
                          <span className="font-mono text-xs font-semibold text-stone-700">{(pct * 100).toFixed(1)}%</span>
                        </div>
                      ) : <span className="text-stone-400 text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-stone-100 border-t-2 border-stone-300 font-semibold">
                <td className="py-3 px-4 text-xs text-stone-700 uppercase tracking-wider">BAC Total</td>
                <td className="py-3 px-4 text-right font-mono text-stone-900">{formatCurrency(BAC)}</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700">{formatCurrency(EV)}</td>
                <td className="py-3 px-4 text-right font-mono text-red-600">{formatCurrency(AC)}</td>
                <td className="py-3 px-4 text-right font-mono text-xs" style={{ color: SV >= 0 ? COLORS.verde.solid : COLORS.rojo.solid }}>{(SV >= 0 ? '+' : '') + formatCurrency(SV)}</td>
                <td className="py-3 px-4 text-right font-mono text-xs" style={{ color: CV >= 0 ? COLORS.verde.solid : COLORS.rojo.solid }}>{(CV >= 0 ? '+' : '') + formatCurrency(CV)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">{(EV / BAC * 100).toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* TOP PARTIDAS CRITICAS */}
      <Card noPad>
        <div className="p-5 border-b border-stone-200">
          <SectionTitle icon={AlertCircle} sub="Mayor saldo monetario pendiente del Costo Directo">Top 10 Partidas Críticas</SectionTitle>
        </div>
        <div className="divide-y divide-stone-100">
          {TOP_PARTIDAS.map((p, i) => (
            <div key={p.item} className="p-4 hover:bg-stone-50/50 transition-colors flex items-center gap-4">
              <div className="text-2xl font-bold font-mono text-stone-300 w-8">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">{p.item}</span>
                  <span className="text-xs text-stone-500">% Avance: <span className="font-mono font-semibold text-stone-700">{p.pctAvance.toFixed(1)}%</span></span>
                </div>
                <p className="text-sm text-stone-900 line-clamp-1">{p.desc}</p>
                <div className="mt-1.5 h-1 bg-stone-100 rounded-full overflow-hidden max-w-md">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.pctAvance}%` }} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Saldo</p>
                <p className="text-lg font-bold font-mono tabular-nums text-red-700">{formatCurrency(p.saldoMonto)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// LEGACY: PartidasView removed, replaced by ValorGanadoView above
// ============================================================================

const PartidasView = ValorGanadoView; // alias for backward compatibility

// ============================================================================
// LOOKAHEAD VIEW
// ============================================================================
const LookaheadView = ({ packages, programacion, restrictions, totalWeeks }) => {
  const [horizonte, setHorizonte] = useState(4);
  const semanas = useMemo(() =>
    Array.from({ length: horizonte }, (_, i) => CURRENT_WEEK + i).filter(w => w <= totalWeeks),
    [horizonte, totalWeeks]
  );
  const getActsForWeek = (w) => {
    const { start, end } = getWeekDates(w);
    return packages.filter(p => {
      const hasProg = (programacion[p.id]?.[w]?.prog || 0) > 0;
      const inRange = new Date(p.inicio) <= end && new Date(p.fin) >= start;
      return hasProg || inRange;
    });
  };
  const getActiveRestrs = (w) => restrictions.filter(r => r.estado !== 'LEVANTADA' && r.semana <= w);
  const getBlockedFrentes = (w) => { const s = new Set(); getActiveRestrs(w).forEach(r => { if (r.frente && r.frente !== '—') s.add(r.frente); }); return s; };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionTitle icon={Eye} sub="Planificación anticipada con semáforo de restricciones — herramienta central del Last Planner">Lookahead Plan</SectionTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-600">Horizonte:</span>
          {[3,4,5,6].map(n => (
            <button key={n} onClick={() => setHorizonte(n)} className={`px-3 py-1.5 text-sm rounded-md font-medium ${horizonte===n ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-600 hover:bg-stone-50'}`}>{n} sem</button>
          ))}
        </div>
      </div>
      {semanas.map(w => {
        const acts = getActsForWeek(w);
        const blocked = getBlockedFrentes(w);
        const restrs = getActiveRestrs(w);
        const { start, end } = getWeekDates(w);
        const isCur = w === CURRENT_WEEK;
        return (
          <Card key={w} noPad>
            <div className={`p-4 border-b flex items-center justify-between ${isCur ? 'bg-amber-50 border-amber-200' : 'bg-stone-50 border-stone-200'}`}>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isCur ? 'text-amber-700' : 'text-stone-500'}`}>{isCur ? 'SEMANA ACTUAL' : `+${w - CURRENT_WEEK} semana${w - CURRENT_WEEK > 1 ? 's' : ''}`}</span>
                <p className="text-xl font-bold text-stone-900 font-mono">Semana {w}</p>
                <p className="text-xs text-stone-500">{fmtFullDate(isoDate(start))} → {fmtFullDate(isoDate(end))}</p>
              </div>
              <div className="flex gap-4 text-center">
                <div><p className="text-2xl font-bold font-mono text-stone-900">{acts.length}</p><p className="text-[10px] text-stone-500 uppercase">actividades</p></div>
                <div><p className="text-2xl font-bold font-mono text-red-600">{restrs.length}</p><p className="text-[10px] text-stone-500 uppercase">restricciones</p></div>
              </div>
            </div>
            {acts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-stone-100 bg-stone-50/50">
                    <th className="text-left py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Partida</th>
                    <th className="text-left py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Frente</th>
                    <th className="text-left py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Responsable</th>
                    <th className="text-right py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Prog.</th>
                    <th className="text-center py-2 px-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Estado</th>
                  </tr></thead>
                  <tbody>
                    {acts.map(p => {
                      const prog = programacion[p.id]?.[w]?.prog || 0;
                      const bloq = blocked.has(p.frente);
                      return (
                        <tr key={p.id} className={`border-b border-stone-50 hover:bg-stone-50 ${bloq ? 'border-l-2 border-l-red-400' : ''}`}>
                          <td className="py-2 px-3"><p className="font-medium text-stone-900">{p.desc.slice(0,55)}{p.desc.length>55?'…':''}</p><p className="text-stone-400 font-mono text-[10px]">{p.item}</p></td>
                          <td className="py-2 px-3 text-stone-600">{FRENTE_LABELS[p.frente] || p.frente}</td>
                          <td className="py-2 px-3 text-stone-600">{p.responsable}</td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-stone-700">{prog > 0 ? `${prog} ${p.und}` : '—'}</td>
                          <td className="py-2 px-3 text-center">
                            {bloq
                              ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-semibold"><AlertTriangle className="w-3 h-3"/>Restricción</span>
                              : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-semibold"><CheckCircle2 className="w-3 h-3"/>Libre</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <div className="p-6 text-center text-stone-400 text-sm">No hay actividades programadas para esta semana</div>}
            {restrs.length > 0 && (
              <div className="p-3 bg-red-50 border-t border-red-200">
                <p className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-1.5">Restricciones activas que afectan esta semana:</p>
                <div className="space-y-1">
                  {restrs.slice(0,4).map(r => (
                    <p key={r.id} className="text-xs text-red-700 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.impacto==='Alto'?'bg-red-600':r.impacto==='Medio'?'bg-amber-500':'bg-blue-400'}`}/>
                      <span className="font-medium">[{r.categoria}]</span> {r.desc.slice(0,70)}{r.desc.length>70?'…':''}
                      <span className="ml-auto font-mono text-[10px] text-red-600 flex-shrink-0">{r.fechaCompromiso}</span>
                    </p>
                  ))}
                  {restrs.length > 4 && <p className="text-xs text-red-500">+ {restrs.length - 4} más...</p>}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

// ============================================================================
// INFORME SEMANAL VIEW
// ============================================================================
const InformeSemanalView = ({ packages, weeklyPlans, ppcHistory, restrictions, programacion }) => {
  const [semana, setSemana] = useState(CURRENT_WEEK);
  const plan = weeklyPlans[semana];
  const ppcEntry = ppcHistory.find(p => p.week === semana);
  const cumplidos = plan?.commitments.filter(c => c.result === 'CUMPLIDO').length || 0;
  const total = plan?.commitments.length || 0;
  const ppc = ppcEntry ? ppcEntry.cumplido / ppcEntry.programado : (total > 0 ? cumplidos / total : 0);
  const { start, end } = getWeekDates(semana);
  const activeRestrs = restrictions.filter(r => r.estado !== 'LEVANTADA');
  const overdueRestrs = activeRestrs.filter(r => r.fechaCompromiso && new Date(r.fechaCompromiso) < new Date(TODAY));
  const weekActs = packages.filter(p => (programacion[p.id]?.[semana]?.prog || 0) > 0);
  const valProg = weekActs.reduce((s,p) => s + (programacion[p.id]?.[semana]?.prog||0)*p.precio, 0);
  const valEjec = weekActs.reduce((s,p) => s + (programacion[p.id]?.[semana]?.ejec||0)*p.precio, 0);
  const fotos = plan?.fotos || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <SectionTitle icon={FileText} sub="Reporte semanal completo listo para imprimir y entregar al inspector">Informe Semanal</SectionTitle>
        <div className="flex items-center gap-3">
          <select value={semana} onChange={e => setSemana(parseInt(e.target.value))} className="px-3 py-2 text-sm border border-stone-200 rounded-md bg-white font-mono font-semibold">
            {Array.from({length:PROJECT.totalWeeks},(_,i)=>i+1).map(w=><option key={w} value={w}>Semana {w}</option>)}
          </select>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-md text-sm font-semibold hover:bg-stone-700 no-print">
            <Printer className="w-4 h-4"/>Imprimir / PDF
          </button>
        </div>
      </div>
      <div className="bg-white border border-stone-200 rounded-xl p-8 space-y-6">
        <div className="border-b-2 border-stone-900 pb-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{PROJECT.entidad}</p>
            <h1 className="text-2xl font-bold text-stone-900 font-display mt-1">{PROJECT.name}</h1>
            <p className="text-sm text-stone-600 mt-0.5">{PROJECT.subtitle} · Meta {PROJECT.meta} · {PROJECT.modalidad}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-stone-500">Informe Semanal</p>
            <p className="text-3xl font-bold font-mono text-stone-900">Sem. {semana}</p>
            <p className="text-xs text-stone-500 mt-1">{fmtFullDate(isoDate(start))} al {fmtFullDate(isoDate(end))}</p>
            <p className="text-xs text-stone-400 mt-0.5">Emitido: {fmtFullDate(TODAY)}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            {label:'PPC Semana', val:(ppc*100).toFixed(0)+'%', note:'meta: 85%', color: ppc>=0.85?'#16A34A':ppc>=0.6?'#D97706':'#DC2626'},
            {label:'Compromisos', val:total, note:'plan firmado', color:'#1C1917'},
            {label:'Valoriz. Prog.', val:formatCurrency(valProg), note:'programado', color:'#1E40AF'},
            {label:'Valoriz. Ejec.', val:formatCurrency(valEjec), note:'ejecutado', color:'#15803D'},
          ].map(k => (
            <div key={k.label} className="border border-stone-200 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">{k.label}</p>
              <p className="text-2xl font-bold font-mono mt-1" style={{color:k.color}}>{k.val}</p>
              <p className="text-xs text-stone-500 mt-0.5">{k.note}</p>
            </div>
          ))}
        </div>
        {plan && plan.commitments.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3 pb-2 border-b border-stone-200">Compromisos Semanales</h2>
            <table className="w-full text-xs border-collapse">
              <thead><tr className="bg-stone-100"><th className="text-left p-2 border border-stone-200">N°</th><th className="text-left p-2 border border-stone-200">Partida</th><th className="text-left p-2 border border-stone-200">Meta</th><th className="text-left p-2 border border-stone-200">Responsable</th><th className="text-center p-2 border border-stone-200">Resultado</th><th className="text-left p-2 border border-stone-200">CNC</th></tr></thead>
              <tbody>
                {plan.commitments.map((c,i)=>{
                  const pkg=packages.find(p=>p.id===c.packageId);
                  return <tr key={c.id} className={i%2===0?'bg-white':'bg-stone-50'}>
                    <td className="p-2 border border-stone-200 font-mono">{i+1}</td>
                    <td className="p-2 border border-stone-200">{pkg?.desc||c.packageId}</td>
                    <td className="p-2 border border-stone-200 font-mono">{c.metaText}</td>
                    <td className="p-2 border border-stone-200">{c.responsable}</td>
                    <td className="p-2 border border-stone-200 text-center font-semibold" style={{color:c.result==='CUMPLIDO'?'#15803D':c.result==='NO CUMPLIDO'?'#B91C1C':'#78716C'}}>{c.result||'—'}</td>
                    <td className="p-2 border border-stone-200 text-stone-600">{c.cnc?.descripcion||'—'}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
        {activeRestrs.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3 pb-2 border-b border-stone-200">Restricciones Activas ({activeRestrs.length}) · Vencidas: {overdueRestrs.length}</h2>
            <table className="w-full text-xs border-collapse">
              <thead><tr className="bg-stone-100"><th className="text-left p-2 border border-stone-200">Descripción</th><th className="text-left p-2 border border-stone-200">Categoría</th><th className="text-left p-2 border border-stone-200">Responsable</th><th className="text-left p-2 border border-stone-200">Compromiso</th><th className="text-left p-2 border border-stone-200">Estado</th></tr></thead>
              <tbody>
                {activeRestrs.map((r,i)=>{
                  const ov=r.fechaCompromiso&&new Date(r.fechaCompromiso)<new Date(TODAY);
                  return <tr key={r.id} className={ov?'bg-red-50':i%2===0?'bg-white':'bg-stone-50'}>
                    <td className="p-2 border border-stone-200">{r.desc}</td>
                    <td className="p-2 border border-stone-200">{r.categoria}</td>
                    <td className="p-2 border border-stone-200">{r.responsable}</td>
                    <td className={`p-2 border border-stone-200 font-mono ${ov?'text-red-700 font-semibold':''}`}>{r.fechaCompromiso}</td>
                    <td className="p-2 border border-stone-200">{r.estado}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
        {fotos.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3 pb-2 border-b border-stone-200">Registro Fotográfico ({fotos.length})</h2>
            <div className="grid grid-cols-3 gap-3">
              {fotos.map(f=><div key={f.id} className="rounded-lg overflow-hidden border border-stone-200">
                <img src={f.dataUrl} alt={f.caption} className="w-full h-32 object-cover"/>
                {f.caption&&<p className="p-1.5 text-[10px] text-stone-600 bg-stone-50">{f.caption}</p>}
              </div>)}
            </div>
          </div>
        )}
        <div className="border-t-2 border-stone-200 pt-6 mt-6">
          <div className="grid grid-cols-3 gap-8 text-center text-xs text-stone-600">
            <div><div className="h-12 border-b border-stone-400 mb-2"/><p className="font-semibold">Residente de Obra</p></div>
            <div><div className="h-12 border-b border-stone-400 mb-2"/><p className="font-semibold">Inspector / Supervisor</p></div>
            <div><div className="h-12 border-b border-stone-400 mb-2"/><p className="font-semibold">Representante MP Cusco</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MANO DE OBRA VIEW
// ============================================================================
const TARIFAS_MO = { peon: 68.90, oficial: 83.30, operario: 96.10 };

const ManoObraView = ({ moRegistros, setMoRegistros, packages }) => {
  const emptyForm = { fecha: TODAY, semana: CURRENT_WEEK, frente: 'ESTRUCTURAS', partida: '', horas: 8, peon: 0, oficial: 0, operario: 0, obs: '' };
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [filterSem, setFilterSem] = useState('');
  const [filterFrente, setFilterFrente] = useState('');

  const calcPersonas = r => (parseInt(r.peon)||0) + (parseInt(r.oficial)||0) + (parseInt(r.operario)||0);
  const calcHH = r => calcPersonas(r) * (parseFloat(r.horas)||8);
  const calcCosto = r => ((parseInt(r.peon)||0)*TARIFAS_MO.peon + (parseInt(r.oficial)||0)*TARIFAS_MO.oficial + (parseInt(r.operario)||0)*TARIFAS_MO.operario) * ((parseFloat(r.horas)||8) / 8);

  const formPersonas = (parseInt(form.peon)||0) + (parseInt(form.oficial)||0) + (parseInt(form.operario)||0);
  const formHH = formPersonas * (parseFloat(form.horas)||8);
  const formCosto = ((parseInt(form.peon)||0)*TARIFAS_MO.peon + (parseInt(form.oficial)||0)*TARIFAS_MO.oficial + (parseInt(form.operario)||0)*TARIFAS_MO.operario) * ((parseFloat(form.horas)||8) / 8);

  const addRegistro = () => {
    if (formPersonas === 0) { alert('Ingresa al menos un trabajador (Peón, Oficial u Operario)'); return; }
    setMoRegistros(prev => [...prev, {
      ...form, id: Date.now(),
      peon: parseInt(form.peon)||0,
      oficial: parseInt(form.oficial)||0,
      operario: parseInt(form.operario)||0,
      horas: parseFloat(form.horas)||8,
    }]);
    setForm(emptyForm); setShowForm(false);
  };

  const byWeek = useMemo(() => {
    const m = {};
    moRegistros.forEach(r => {
      const h = r.horas || 8;
      if (!m[r.semana]) m[r.semana] = { semana: r.semana, peonHH: 0, oficialHH: 0, operarioHH: 0, HH: 0, costo: 0 };
      m[r.semana].peonHH += (r.peon||0) * h;
      m[r.semana].oficialHH += (r.oficial||0) * h;
      m[r.semana].operarioHH += (r.operario||0) * h;
      m[r.semana].HH += calcHH(r);
      m[r.semana].costo += calcCosto(r);
    });
    return Object.values(m).sort((a,b)=>a.semana-b.semana);
  }, [moRegistros]);

  const byPartida = useMemo(() => {
    const m = {};
    moRegistros.filter(r=>r.partida).forEach(r => {
      if (!m[r.partida]) m[r.partida] = { id: r.partida, HH: 0, costo: 0, peon: 0, oficial: 0, operario: 0, dias: 0 };
      m[r.partida].peon += r.peon||0;
      m[r.partida].oficial += r.oficial||0;
      m[r.partida].operario += r.operario||0;
      m[r.partida].HH += calcHH(r);
      m[r.partida].costo += calcCosto(r);
      m[r.partida].dias += 1;
    });
    return Object.values(m).sort((a,b) => b.costo - a.costo);
  }, [moRegistros]);

  const totals = useMemo(() => ({
    HH: moRegistros.reduce((s,r) => s + calcHH(r), 0),
    costo: moRegistros.reduce((s,r) => s + calcCosto(r), 0),
    peon: moRegistros.reduce((s,r) => s + (r.peon||0), 0),
    oficial: moRegistros.reduce((s,r) => s + (r.oficial||0), 0),
    operario: moRegistros.reduce((s,r) => s + (r.operario||0), 0),
  }), [moRegistros]);

  const semanas = [...new Set(moRegistros.map(r=>r.semana))].sort((a,b)=>a-b);

  const filtered = useMemo(() =>
    moRegistros.filter(r =>
      (!filterSem || String(r.semana) === filterSem) &&
      (!filterFrente || r.frente === filterFrente)
    ).sort((a,b) => b.fecha.localeCompare(a.fecha)),
  [moRegistros, filterSem, filterFrente]);

  const CATS = [
    { key:'peon',     label:'Peón',     tarifa:TARIFAS_MO.peon,     bg:'bg-orange-100', text:'text-orange-800', border:'border-orange-200', fill:'#F97316' },
    { key:'oficial',  label:'Oficial',  tarifa:TARIFAS_MO.oficial,  bg:'bg-blue-100',   text:'text-blue-800',   border:'border-blue-200',   fill:'#3B82F6' },
    { key:'operario', label:'Operario', tarifa:TARIFAS_MO.operario, bg:'bg-emerald-100',text:'text-emerald-800',border:'border-emerald-200',fill:'#10B981' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionTitle icon={HardHat} sub="Registro diario por categoría, frente y partida — Administración Directa">Control de Mano de Obra</SectionTitle>
        <button onClick={()=>setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-md text-sm font-semibold hover:bg-stone-700">
          <Plus className="w-4 h-4"/>{showForm?'Cancelar':'Registrar día'}
        </button>
      </div>

      {showForm && (
        <Card>
          <p className="text-sm font-semibold text-stone-700 mb-4">Nuevo Registro de Mano de Obra</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div><label className="text-xs text-stone-500 font-medium">Fecha</label>
              <input type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})} className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400"/></div>
            <div><label className="text-xs text-stone-500 font-medium">Semana</label>
              <input type="number" value={form.semana} onChange={e=>setForm({...form,semana:parseInt(e.target.value)||1})} min="1" max={PROJECT.totalWeeks} className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400"/></div>
            <div><label className="text-xs text-stone-500 font-medium">Frente</label>
              <select value={form.frente} onChange={e=>setForm({...form,frente:e.target.value})} className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded focus:outline-none bg-white">
                {Object.entries(FRENTE_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select></div>
            <div><label className="text-xs text-stone-500 font-medium">Horas trabajadas / día</label>
              <input type="number" value={form.horas} onChange={e=>setForm({...form,horas:e.target.value})} min="1" max="12" step="0.5" className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400"/></div>
          </div>

          <div className="bg-stone-50 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-3">Categorías de Mano de Obra — Jornales construcción civil</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CATS.map(cat => (
                <div key={cat.key} className={`rounded-lg border p-3 ${cat.bg} ${cat.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-bold ${cat.text}`}>{cat.label}</span>
                    <span className={`text-xs font-mono ${cat.text} opacity-80`}>S/. {cat.tarifa.toFixed(2)}/jornal</span>
                  </div>
                  <input type="number" value={form[cat.key]}
                    onChange={e=>setForm({...form,[cat.key]:e.target.value})}
                    min="0" placeholder="0"
                    className="w-full px-2 py-2 text-lg border-0 rounded bg-white/80 focus:outline-none text-center font-mono font-bold text-stone-900"/>
                  {(parseInt(form[cat.key])||0) > 0 && (
                    <p className={`text-[10px] mt-1.5 text-center font-mono ${cat.text} opacity-70`}>
                      S/. {((parseInt(form[cat.key])||0) * cat.tarifa * ((parseFloat(form.horas)||8)/8)).toFixed(2)} este día
                    </p>
                  )}
                </div>
              ))}
            </div>
            {formPersonas > 0 && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-stone-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div><p className="text-stone-500">Total personas</p><p className="font-bold text-stone-900 font-mono text-base">{formPersonas}</p></div>
                <div><p className="text-stone-500">HH del día</p><p className="font-bold text-blue-700 font-mono text-base">{formHH}</p></div>
                <div><p className="text-stone-500">Costo del día</p><p className="font-bold text-emerald-700 font-mono text-base">S/. {formCosto.toFixed(2)}</p></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="text-xs text-stone-500 font-medium">Partida vinculada <span className="text-stone-400">(opcional)</span></label>
              <select value={form.partida} onChange={e=>setForm({...form,partida:e.target.value})} className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded focus:outline-none bg-white">
                <option value="">— Sin vinculación —</option>
                {(packages||[]).map(p=><option key={p.id} value={p.id}>{p.item} — {p.desc.slice(0,55)}{p.desc.length>55?'…':''} ({p.und})</option>)}
              </select></div>
            <div><label className="text-xs text-stone-500 font-medium">Observaciones</label>
              <input type="text" placeholder="Opcional" value={form.obs} onChange={e=>setForm({...form,obs:e.target.value})} className="w-full mt-1 px-2 py-1.5 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400"/></div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={addRegistro} className="px-5 py-2 bg-stone-900 text-white rounded-md text-sm font-semibold hover:bg-stone-700">Guardar registro</button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Total HH registradas" value={totals.HH.toFixed(0)} sub="Horas-Hombre acumuladas" accent="azul" icon={HardHat}/>
        <KPICard label="Costo MO estimado" value={`S/. ${Math.round(totals.costo).toLocaleString()}`} sub="Jornales acumulados" accent="verde" icon={TrendingUp}/>
        <KPICard label="Semanas registradas" value={byWeek.length} sub={`de ${CURRENT_WEEK} transcurridas`} accent="gris" icon={CalendarDays}/>
        <KPICard label="Registros totales" value={moRegistros.length} sub="entradas en el log" accent="amarillo" icon={FileText}/>
      </div>

      {moRegistros.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {CATS.map(c => (
            <div key={c.key} className={`rounded-lg p-4 ${c.bg}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${c.text} opacity-70`}>{c.label}s</p>
              <p className={`text-3xl font-bold font-mono ${c.text}`}>{totals[c.key]}</p>
              <p className={`text-xs mt-0.5 ${c.text} opacity-60`}>S/. {(totals[c.key]*c.tarifa).toFixed(0)} en jornales</p>
            </div>
          ))}
        </div>
      )}

      {byWeek.length > 0 && (
        <Card>
          <SectionTitle icon={BarChart3} sub="HH apiladas por categoría de MO por semana">Evolución Semanal — HH por Categoría</SectionTitle>
          <div style={{height:260}}>
            <ResponsiveContainer>
              <BarChart data={byWeek.map(w=>({semana:`S${w.semana}`,Peón:w.peonHH,Oficial:w.oficialHH,Operario:w.operarioHH}))} margin={{top:5,right:20,bottom:5,left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4"/>
                <XAxis dataKey="semana" tick={{fontSize:11,fill:'#57534E'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'#57534E'}} axisLine={false} tickLine={false} label={{value:'HH',angle:-90,position:'insideLeft',fontSize:10,fill:'#57534E'}}/>
                <Tooltip contentStyle={{backgroundColor:'white',border:'1px solid #E7E5E4',borderRadius:'6px',fontSize:'12px'}} formatter={(v,n)=>[v+' HH',n]}/>
                <Legend wrapperStyle={{fontSize:12}}/>
                <Bar dataKey="Peón" stackId="a" fill="#F97316"/>
                <Bar dataKey="Oficial" stackId="a" fill="#3B82F6"/>
                <Bar dataKey="Operario" stackId="a" fill="#10B981" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {byPartida.length > 0 && (
        <Card noPad>
          <div className="p-4 border-b border-stone-200"><SectionTitle icon={Package} sub="HH y costo de MO acumulado por partida vinculada">MO por Partida</SectionTitle></div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-stone-50 border-b border-stone-200">
                {['Partida','Días reg.','Peones','Oficiales','Operarios','HH Total','Costo MO est.'].map(h=>(
                  <th key={h} className={`py-2 px-3 text-[10px] font-semibold text-stone-600 uppercase tracking-wider ${h==='Partida'?'text-left':'text-right'}`}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {byPartida.map(bp => {
                  const pkg = (packages||[]).find(p=>p.id===bp.id);
                  return (
                    <tr key={bp.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="py-2.5 px-3 max-w-[220px]">
                        <p className="font-semibold text-stone-900 truncate">{pkg?.item||bp.id} — {pkg?.desc?.slice(0,45)||'—'}</p>
                        <p className="text-stone-400 text-[10px]">{pkg?.und||''}</p>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-stone-600">{bp.dias}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-orange-700">{bp.peon}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-700">{bp.oficial}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">{bp.operario}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">{bp.HH.toFixed(0)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">S/. {bp.costo.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card noPad>
        <div className="p-4 border-b border-stone-200 flex items-center justify-between flex-wrap gap-3">
          <p className="font-semibold text-stone-900 text-sm">Registro Detallado</p>
          <div className="flex items-center gap-2">
            <select value={filterSem} onChange={e=>setFilterSem(e.target.value)} className="px-2 py-1 text-xs border border-stone-200 rounded bg-white">
              <option value="">Todas las semanas</option>
              {semanas.map(s=><option key={s} value={s}>Semana {s}</option>)}
            </select>
            <select value={filterFrente} onChange={e=>setFilterFrente(e.target.value)} className="px-2 py-1 text-xs border border-stone-200 rounded bg-white">
              <option value="">Todos los frentes</option>
              {Object.entries(FRENTE_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        {filtered.length === 0
          ? <div className="p-8 text-center text-stone-500 text-sm"><HardHat className="w-10 h-10 mx-auto mb-2 text-stone-300"/>No hay registros. Usa "Registrar día" para empezar.</div>
          : <div className="overflow-x-auto"><table className="w-full text-xs">
              <thead><tr className="bg-stone-50 border-b border-stone-200">
                {['Fecha','Sem.','Frente','Partida','Peón','Ofic.','Oper.','HH','Costo est.','Obs.',''].map(h=>(
                  <th key={h} className={`py-2 px-3 text-[10px] font-semibold text-stone-600 uppercase tracking-wider ${['Peón','Ofic.','Oper.','HH','Costo est.'].includes(h)?'text-right':'text-left'}`}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(r => {
                  const pkg = (packages||[]).find(p=>p.id===r.partida);
                  return (
                    <tr key={r.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="py-2 px-3 font-mono">{fmtDate(r.fecha)}</td>
                      <td className="py-2 px-3 font-mono">S{r.semana}</td>
                      <td className="py-2 px-3">{FRENTE_LABELS[r.frente]||r.frente}</td>
                      <td className="py-2 px-3 max-w-[150px]">
                        {pkg ? <p className="truncate text-stone-700">{pkg.item} {pkg.desc.slice(0,30)}</p> : <span className="text-stone-400">—</span>}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-orange-700">{r.peon||0}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-blue-700">{r.oficial||0}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700">{r.operario||0}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">{calcHH(r).toFixed(0)}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700">S/. {calcCosto(r).toFixed(2)}</td>
                      <td className="py-2 px-3 text-stone-500 max-w-[100px] truncate">{r.obs||'—'}</td>
                      <td className="py-2 px-2"><button onClick={()=>{if(confirm('¿Eliminar?'))setMoRegistros(prev=>prev.filter(x=>x.id!==r.id))}} className="text-stone-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>}
      </Card>
    </div>
  );
};

// ============================================================================
// PRODUCCIÓN VIEW (Histograma + avance por tren)
// ============================================================================
const ProduccionView = ({ packages, programacion }) => {
  const weeks = Array.from({length: PROJECT.totalWeeks}, (_,i) => i+1);
  const chartData = useMemo(() => weeks.map(w => {
    const prog = packages.reduce((s,p)=>s+(programacion[p.id]?.[w]?.prog||0)*p.precio,0);
    const ejec = packages.reduce((s,p)=>s+(programacion[p.id]?.[w]?.ejec||0)*p.precio,0);
    return { semana:`S${w}`, Programado: prog||null, Ejecutado: ejec||null };
  }).filter(d=>d.Programado||d.Ejecutado), [packages, programacion]);

  const trenProgress = useMemo(() => TRENES.map(t => {
    const acts = packages.filter(p=>p.tren===t.id);
    if (!acts.length) return null;
    const total = acts.reduce((s,p)=>s+p.costo,0);
    const ejec = acts.reduce((s,p)=>s+(p.metradoEjec/p.metrado)*p.costo,0);
    return { ...t, total, ejec, pct: total>0?ejec/total:0, acts: acts.length };
  }).filter(Boolean).filter(t=>t.total>0).sort((a,b)=>b.pct-a.pct), [packages]);

  return (
    <div className="space-y-4">
      <SectionTitle icon={BarChart3} sub="Ritmo de producción semanal y avance por tren de trabajo">Producción Semanal</SectionTitle>
      {chartData.length > 0 ? (
        <Card>
          <SectionTitle icon={Activity} sub="Valorización programada vs ejecutada por semana (S/.)">Histograma de Valorización Semanal</SectionTitle>
          <div style={{height:300}}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{top:5,right:20,bottom:5,left:10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4"/>
                <XAxis dataKey="semana" tick={{fontSize:10,fill:'#57534E'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#57534E'}} axisLine={false} tickLine={false} tickFormatter={v=>'S/.'+Math.round(v/1000)+'k'}/>
                <Tooltip formatter={v=>formatCurrency(v)} contentStyle={{backgroundColor:'white',border:'1px solid #E7E5E4',borderRadius:'6px',fontSize:'12px'}}/>
                <Legend wrapperStyle={{fontSize:12}}/>
                <Bar dataKey="Programado" fill="#94A3B8" radius={[3,3,0,0]}/>
                <Bar dataKey="Ejecutado" fill="#16A34A" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card><p className="text-center text-stone-500 py-8">Registra datos en Programación para ver el histograma</p></Card>
      )}
      <Card noPad>
        <div className="p-4 border-b border-stone-200"><SectionTitle icon={GitCommit} sub="Porcentaje de avance de cada tren de trabajo">Avance por Tren</SectionTitle></div>
        <div className="divide-y divide-stone-100">
          {trenProgress.map(t=>(
            <div key={t.id} className="p-4 flex items-center gap-4 hover:bg-stone-50">
              <div className="w-2 h-10 rounded-full flex-shrink-0" style={{backgroundColor:t.color}}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-stone-900 truncate">{t.name}</p>
                  <span className="text-xs font-mono font-bold ml-4 flex-shrink-0" style={{color:t.pct>=0.8?COLORS.verde.solid:t.pct>=0.4?COLORS.amarillo.solid:COLORS.rojo.solid}}>{(t.pct*100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{width:`${Math.min(100,t.pct*100)}%`,backgroundColor:t.color}}/>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">{t.acts} partidas · {formatCurrency(t.ejec)} de {formatCurrency(t.total)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// RFIs / CONSULTAS DDC VIEW
// ============================================================================
const RFIsView = ({ rfis, setRfis }) => {
  const emptyForm = { numero:'', fecha:TODAY, asunto:'', para:'Proyectista', de:'Residente', estado:'PENDIENTE', fechaRespuesta:'', respuesta:'', impacto:'Medio', relacionado:'' };
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const ESTADOS_RFI = ['PENDIENTE','EN PROCESO','RESPONDIDA','CERRADA'];
  const IMPACTOS = ['Alto','Medio','Bajo'];

  const saveRfi = () => {
    if (!form.asunto) { alert('Ingresa el asunto del RFI'); return; }
    if (editId !== null) {
      setRfis(prev=>prev.map(r=>r.id===editId?{...form,id:editId}:r));
    } else {
      setRfis(prev=>[...prev,{...form,id:Date.now()}]);
    }
    setModalOpen(false); setEditId(null); setForm(emptyForm);
  };

  const editRfi = (r) => { setForm({...r}); setEditId(r.id); setModalOpen(true); };
  const deleteRfi = (id) => { if(confirm('¿Eliminar RFI?')) setRfis(prev=>prev.filter(r=>r.id!==id)); };

  const stats = useMemo(()=>({
    pendientes: rfis.filter(r=>r.estado==='PENDIENTE').length,
    enProceso: rfis.filter(r=>r.estado==='EN PROCESO').length,
    respondidas: rfis.filter(r=>r.estado==='RESPONDIDA'||r.estado==='CERRADA').length,
    altoImpacto: rfis.filter(r=>r.impacto==='Alto'&&r.estado!=='CERRADA').length,
  }),[rfis]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionTitle icon={MessageSquare} sub="Seguimiento de consultas al proyectista, DDC Cusco y entidades externas">RFIs / Consultas DDC</SectionTitle>
        <button onClick={()=>{setForm(emptyForm);setEditId(null);setModalOpen(true)}} className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-md text-sm font-semibold hover:bg-stone-700">
          <Plus className="w-4 h-4"/>Nuevo RFI
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Pendientes" value={stats.pendientes} sub="sin respuesta" accent="rojo" icon={AlertCircle}/>
        <KPICard label="En proceso" value={stats.enProceso} sub="en seguimiento" accent="amarillo" icon={Clock}/>
        <KPICard label="Respondidas" value={stats.respondidas} sub="cerradas/respondidas" accent="verde" icon={CheckCircle2}/>
        <KPICard label="Alto impacto" value={stats.altoImpacto} sub="abiertas con riesgo alto" accent={stats.altoImpacto>2?'rojo':'amarillo'} icon={AlertTriangle}/>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-semibold text-stone-900">{editId?'Editar RFI':'Nuevo RFI / Consulta'}</h3>
              <button onClick={()=>setModalOpen(false)}><X className="w-5 h-5 text-stone-400"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">N° RFI</label><input type="text" placeholder="RFI-001" value={form.numero} onChange={e=>setForm({...form,numero:e.target.value})} className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400"/></div>
                <div><label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Fecha emisión</label><input type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})} className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400"/></div>
              </div>
              <div><label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Asunto *</label><input type="text" placeholder="Descripción de la consulta" value={form.asunto} onChange={e=>setForm({...form,asunto:e.target.value})} className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Para</label><input type="text" value={form.para} onChange={e=>setForm({...form,para:e.target.value})} className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400"/></div>
                <div><label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">De</label><input type="text" value={form.de} onChange={e=>setForm({...form,de:e.target.value})} className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400"/></div>
                <div><label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Estado</label><select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded bg-white focus:outline-none">{ESTADOS_RFI.map(s=><option key={s}>{s}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Impacto</label><select value={form.impacto} onChange={e=>setForm({...form,impacto:e.target.value})} className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded bg-white focus:outline-none">{IMPACTOS.map(i=><option key={i}>{i}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Fecha respuesta</label><input type="date" value={form.fechaRespuesta} onChange={e=>setForm({...form,fechaRespuesta:e.target.value})} className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400"/></div>
                <div><label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Partida relacionada</label><input type="text" placeholder="Ej: A045, 1.3.4.1" value={form.relacionado} onChange={e=>setForm({...form,relacionado:e.target.value})} className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400"/></div>
              </div>
              <div><label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Respuesta / Resolución</label><textarea value={form.respuesta} onChange={e=>setForm({...form,respuesta:e.target.value})} rows="3" placeholder="Descripción de la respuesta recibida..." className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400 resize-none"/></div>
            </div>
            <div className="p-6 border-t border-stone-200 flex justify-end gap-3">
              <button onClick={()=>setModalOpen(false)} className="px-4 py-2 text-sm border border-stone-200 rounded-md hover:bg-stone-50">Cancelar</button>
              <button onClick={saveRfi} className="px-4 py-2 bg-stone-900 text-white rounded-md text-sm font-semibold hover:bg-stone-700">Guardar RFI</button>
            </div>
          </div>
        </div>
      )}
      <Card noPad>
        {rfis.length === 0
          ? <div className="p-8 text-center text-stone-500 text-sm"><MessageSquare className="w-10 h-10 mx-auto mb-2 text-stone-300"/>No hay RFIs registrados. Usa el botón "Nuevo RFI" para empezar.</div>
          : <div className="overflow-x-auto"><table className="w-full text-xs">
              <thead><tr className="bg-stone-50 border-b border-stone-200">
                {['N°','Fecha','Asunto','Para','Impacto','Estado','F. Resp.',''].map(h=><th key={h} className="text-left py-2.5 px-3 text-[10px] font-semibold text-stone-600 uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody>
                {rfis.map(r=>{
                  const open = r.estado!=='CERRADA'&&r.estado!=='RESPONDIDA';
                  return <tr key={r.id} className={`border-b border-stone-100 hover:bg-stone-50 ${r.impacto==='Alto'&&open?'border-l-2 border-l-red-500':''}`}>
                    <td className="py-2.5 px-3 font-mono font-semibold text-stone-700">{r.numero||'—'}</td>
                    <td className="py-2.5 px-3 font-mono">{fmtDate(r.fecha)}</td>
                    <td className="py-2.5 px-3 max-w-xs"><p className="font-medium text-stone-900 truncate">{r.asunto}</p>{r.relacionado&&<p className="text-stone-400 text-[10px]">{r.relacionado}</p>}</td>
                    <td className="py-2.5 px-3 text-stone-600">{r.para}</td>
                    <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.impacto==='Alto'?'bg-red-100 text-red-700':r.impacto==='Medio'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700'}`}>{r.impacto}</span></td>
                    <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.estado==='PENDIENTE'?'bg-red-100 text-red-700':r.estado==='EN PROCESO'?'bg-amber-100 text-amber-700':r.estado==='RESPONDIDA'?'bg-blue-100 text-blue-700':'bg-emerald-100 text-emerald-700'}`}>{r.estado}</span></td>
                    <td className="py-2.5 px-3 font-mono">{r.fechaRespuesta?fmtDate(r.fechaRespuesta):'—'}</td>
                    <td className="py-2.5 px-3 flex items-center gap-1">
                      <button onClick={()=>editRfi(r)} className="text-stone-300 hover:text-stone-700"><Edit2 className="w-3.5 h-3.5"/></button>
                      <button onClick={()=>deleteRfi(r.id)} className="text-stone-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
                    </td>
                  </tr>;
                })}
              </tbody>
            </table></div>}
      </Card>
    </div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [activeTab, setActiveTab] = useState('resumen');
  const [packages, setPackages] = useState(INITIAL_PACKAGES);
  const [restrictions, setRestrictions] = useState(INITIAL_RESTRICTIONS);
  const [ppcHistory, setPpcHistory] = useState(INITIAL_PPC);
  const [weeklyPlans, setWeeklyPlans] = useState(INITIAL_WEEKLY_PLANS);
  const [acMonthly, setAcMonthly] = useState(INITIAL_AC_MONTHLY);
  const [programacion, setProgramacion] = useState({});
  const [moRegistros, setMoRegistros] = useState([]);
  const [rfis, setRfis] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, r, ppc, wp, ac, prog, mo, rfi] = await Promise.all([
          window.storage?.get('packages').catch(() => null),
          window.storage?.get('restrictions').catch(() => null),
          window.storage?.get('ppc').catch(() => null),
          window.storage?.get('weeklyPlans').catch(() => null),
          window.storage?.get('acMonthly').catch(() => null),
          window.storage?.get('programacion').catch(() => null),
          window.storage?.get('moRegistros').catch(() => null),
          window.storage?.get('rfis').catch(() => null),
        ]);
        if (p?.value) setPackages(JSON.parse(p.value));
        if (r?.value) setRestrictions(JSON.parse(r.value));
        if (ppc?.value) setPpcHistory(JSON.parse(ppc.value));
        if (wp?.value) setWeeklyPlans(JSON.parse(wp.value));
        if (ac?.value) setAcMonthly(JSON.parse(ac.value));
        if (prog?.value) setProgramacion(JSON.parse(prog.value));
        if (mo?.value) setMoRegistros(JSON.parse(mo.value));
        if (rfi?.value) setRfis(JSON.parse(rfi.value));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) window.storage?.set('packages', JSON.stringify(packages)).catch(() => {}); }, [packages, loaded]);
  useEffect(() => { if (loaded) window.storage?.set('restrictions', JSON.stringify(restrictions)).catch(() => {}); }, [restrictions, loaded]);
  useEffect(() => { if (loaded) window.storage?.set('ppc', JSON.stringify(ppcHistory)).catch(() => {}); }, [ppcHistory, loaded]);
  useEffect(() => { if (loaded) window.storage?.set('weeklyPlans', JSON.stringify(weeklyPlans)).catch(() => {}); }, [weeklyPlans, loaded]);
  useEffect(() => { if (loaded) window.storage?.set('acMonthly', JSON.stringify(acMonthly)).catch(() => {}); }, [acMonthly, loaded]);
  useEffect(() => { if (loaded) window.storage?.set('programacion', JSON.stringify(programacion)).catch(() => {}); }, [programacion, loaded]);
  useEffect(() => { if (loaded) window.storage?.set('moRegistros', JSON.stringify(moRegistros)).catch(() => {}); }, [moRegistros, loaded]);
  useEffect(() => { if (loaded) window.storage?.set('rfis', JSON.stringify(rfis)).catch(() => {}); }, [rfis, loaded]);

  const resetData = async () => {
    if (confirm('¿Restablecer todos los datos a los iniciales? Esto borrará tus cambios.')) {
      setPackages(INITIAL_PACKAGES); setRestrictions(INITIAL_RESTRICTIONS); setPpcHistory(INITIAL_PPC); setWeeklyPlans(INITIAL_WEEKLY_PLANS); setAcMonthly(INITIAL_AC_MONTHLY); setProgramacion({});
      try {
        await window.storage?.delete('packages'); await window.storage?.delete('restrictions');
        await window.storage?.delete('ppc'); await window.storage?.delete('weeklyPlans');
        await window.storage?.delete('acMonthly'); await window.storage?.delete('programacion');
      } catch (e) {}
    }
  };

  // Notification badge: locked plans pending control
  const pendingControl = Object.values(weeklyPlans).filter(p => p.status === 'LOCKED').length;

  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const notifications = useMemo(() => {
    const alerts = [];
    // PPC < 60% en las últimas 3 semanas cerradas
    const recentClosed = ppcHistory.filter(p => p.source === 'control').slice(-3);
    recentClosed.forEach(p => {
      const ppc = p.programado > 0 ? p.cumplido / p.programado : 1;
      if (ppc < 0.6) alerts.push({ id: `ppc-${p.week}`, type: 'rojo', icon: '📉', msg: `PPC Semana ${p.week}: ${(ppc * 100).toFixed(0)}% — por debajo del umbral crítico (60%)` });
    });
    // Restricciones vencidas (fechaCompromiso < HOY y no levantada)
    restrictions.filter(r => r.estado !== 'LEVANTADA' && r.fechaCompromiso && new Date(r.fechaCompromiso) < new Date(TODAY))
      .forEach(r => alerts.push({ id: `restr-${r.id}`, type: 'amber', icon: '⚠️', msg: `Restricción vencida: "${r.desc.slice(0, 60)}${r.desc.length > 60 ? '…' : ''}" — Resp: ${r.responsable}` }));
    return alerts.filter(a => !dismissedAlerts.has(a.id));
  }, [ppcHistory, restrictions, dismissedAlerts]);

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: BarChart3 },
    { id: 'trenes', label: 'Trenes', icon: GitCommit },
    { id: 'actividades', label: 'Actividades', icon: Layers },
    { id: 'programacion', label: 'Programación', icon: CalendarDays },
    { id: 'lookahead', label: 'Lookahead', icon: Eye },
    { id: 'control', label: 'Control Semanal', icon: ClipboardCheck, badge: pendingControl },
    { id: 'restricciones', label: 'Restricciones', icon: AlertTriangle },
    { id: 'ppc', label: 'PPC', icon: Activity },
    { id: 'valorGanado', label: 'Valor Ganado', icon: TrendingUp },
    { id: 'mo', label: 'Mano de Obra', icon: HardHat },
    { id: 'produccion', label: 'Producción', icon: BarChart3 },
    { id: 'rfis', label: 'RFIs / DDC', icon: MessageSquare },
    { id: 'informe', label: 'Informe', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: '"Manrope", -apple-system, sans-serif' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Archivo+Narrow:wght@500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-display { font-family: 'Archivo Narrow', sans-serif; }
        body { font-family: 'Manrope', sans-serif; }
        @media print {
          .no-print { display: none !important; }
          header { position: static !important; box-shadow: none !important; border-bottom: 1px solid #e7e5e4 !important; }
          .print-break-before { page-break-before: always; }
          body { background: white !important; }
          .min-h-screen { min-height: unset !important; }
          button:not(.print-visible) { display: none !important; }
          input, select { border: none !important; }
          .sticky { position: static !important; }
        }
      `}</style>

      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-stone-900 rounded flex items-center justify-center"><Hammer className="w-5 h-5 text-white" /></div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{PROJECT.entidad}</p>
                <h1 className="text-base font-bold text-stone-900 -mt-0.5 font-display tracking-wide">{PROJECT.name.toUpperCase()}</h1>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-5 text-xs">
              <div className="text-right"><p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Semana actual</p><p className="font-mono font-bold text-stone-900">{CURRENT_WEEK} / {PROJECT.totalWeeks}</p></div>
              <div className="text-right"><p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Hoy</p><p className="font-mono font-bold text-stone-900">{fmtFullDate(TODAY)}</p></div>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-stone-900 text-white rounded hover:bg-stone-700 no-print" title="Exportar a PDF"><Printer className="w-3.5 h-3.5" />PDF</button>
              <button onClick={resetData} className="text-stone-400 hover:text-stone-700 p-1.5 no-print" title="Restablecer datos iniciales"><RotateCcw className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex items-center gap-1 -mb-px overflow-x-auto no-print">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${active ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'}`}>
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{tab.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {notifications.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 no-print">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-1">
            {notifications.map(n => (
              <div key={n.id} className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm ${n.type === 'rojo' ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-900'}`}>
                <span className="flex items-center gap-2"><span>{n.icon}</span><span>{n.msg}</span></span>
                <button onClick={() => setDismissedAlerts(prev => new Set([...prev, n.id]))} className="text-current opacity-60 hover:opacity-100 flex-shrink-0"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'resumen' && <OverviewView packages={packages} restrictions={restrictions} ppcHistory={ppcHistory} setActiveTab={setActiveTab} />}
        {activeTab === 'trenes' && <TrenesView packages={packages} setPackages={setPackages} />}
        {activeTab === 'actividades' && <ActividadesView packages={packages} setPackages={setPackages} />}
        {activeTab === 'tramos' && <TrenesView packages={packages} setPackages={setPackages} />}
        {activeTab === 'programacion' && <ProgramacionView packages={packages} setPackages={setPackages} programacion={programacion} setProgramacion={setProgramacion} ppcHistory={ppcHistory} setPpcHistory={setPpcHistory} restrictions={restrictions} />}
        {activeTab === 'control' && <ControlSemanalView packages={packages} weeklyPlans={weeklyPlans} setWeeklyPlans={setWeeklyPlans} ppcHistory={ppcHistory} setPpcHistory={setPpcHistory} />}
        {activeTab === 'restricciones' && <RestrictionsView restrictions={restrictions} setRestrictions={setRestrictions} />}
        {activeTab === 'ppc' && <PPCView ppcHistory={ppcHistory} setActiveTab={setActiveTab} />}
        {activeTab === 'partidas' && <ValorGanadoView acMonthly={acMonthly} setAcMonthly={setAcMonthly} />}
        {activeTab === 'valorGanado' && <ValorGanadoView acMonthly={acMonthly} setAcMonthly={setAcMonthly} />}
        {activeTab === 'lookahead' && <LookaheadView packages={packages} programacion={programacion} restrictions={restrictions} totalWeeks={PROJECT.totalWeeks} />}
        {activeTab === 'informe' && <InformeSemanalView packages={packages} weeklyPlans={weeklyPlans} ppcHistory={ppcHistory} restrictions={restrictions} programacion={programacion} />}
        {activeTab === 'mo' && <ManoObraView moRegistros={moRegistros} setMoRegistros={setMoRegistros} packages={packages} />}
        {activeTab === 'produccion' && <ProduccionView packages={packages} programacion={programacion} />}
        {activeTab === 'rfis' && <RFIsView rfis={rfis} setRfis={setRfis} />}

        <footer className="mt-12 pt-6 border-t border-stone-200 text-center text-xs text-stone-500">
          <p>Last Planner Dashboard · {PROJECT.name} · Meta {PROJECT.meta}</p>
          <p className="mt-1 text-stone-400">Los cambios se guardan automáticamente en tu navegador</p>
        </footer>
      </main>
    </div>
  );
}
