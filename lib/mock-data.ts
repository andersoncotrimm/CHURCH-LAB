// Dados fictícios para visualização da interface.
// TODO: integrar com o backend (Supabase) e substituir por dados reais.

export const mockUser = {
  name: "Marcos Andrade",
  role: "Coordenador de Comunicação",
  church: "Igreja Vida Nova",
};

export const mockIndicators = [
  { label: "Membros ativos", value: "1.284", trend: "+4,2%", positive: true },
  { label: "Eventos no mês", value: "12", trend: "+2", positive: true },
  { label: "Inscrições abertas", value: "348", trend: "+18%", positive: true },
  { label: "Ministérios ativos", value: "9", trend: "estável", positive: true },
];

export const mockUpcomingEvents = [
  {
    id: "1",
    title: "Culto de Celebração",
    date: "28 SET",
    time: "19h00",
    location: "Templo Principal",
    attendees: 420,
    category: "Culto",
  },
  {
    id: "2",
    title: "Conferência de Líderes",
    date: "04 OUT",
    time: "09h00",
    location: "Auditório 2",
    attendees: 180,
    category: "Conferência",
  },
  {
    id: "3",
    title: "Encontro de Jovens",
    date: "10 OUT",
    time: "20h00",
    location: "Espaço Kids & Jovens",
    attendees: 95,
    category: "Ministério Jovem",
  },
  {
    id: "4",
    title: "Batismo nas Águas",
    date: "18 OUT",
    time: "16h00",
    location: "Templo Principal",
    attendees: 260,
    category: "Culto",
  },
];

export const mockPastEvents = [
  {
    id: "5",
    title: "Retiro de Casais",
    date: "22 AGO",
    location: "Chácara Monte Sião",
    attendees: 64,
    category: "Ministério de Casais",
  },
  {
    id: "6",
    title: "Vigília de Oração",
    date: "15 AGO",
    location: "Templo Principal",
    attendees: 310,
    category: "Culto",
  },
  {
    id: "7",
    title: "Treinamento de Voluntários",
    date: "02 AGO",
    location: "Sala de Treinamento",
    attendees: 48,
    category: "Capacitação",
  },
];

export const mockActivities = [
  {
    id: "1",
    actor: "Camila Souza",
    action: "criou o evento",
    target: "Conferência de Líderes",
    time: "há 12 min",
  },
  {
    id: "2",
    actor: "Pedro Lima",
    action: "atualizou o formulário",
    target: "Inscrição — Retiro de Jovens",
    time: "há 48 min",
  },
  {
    id: "3",
    actor: "Ana Beatriz",
    action: "adicionou 6 pessoas ao ministério",
    target: "Louvor & Adoração",
    time: "há 2 h",
  },
  {
    id: "4",
    actor: "Sistema",
    action: "gerou o relatório mensal de",
    target: "Frequência de Membros",
    time: "há 5 h",
  },
];

export const mockShortcuts = [
  { label: "Novo evento", description: "Criar e publicar um evento" },
  { label: "Nova pessoa", description: "Cadastrar um membro" },
  { label: "Novo material", description: "Enviar para a biblioteca" },
  { label: "Novo formulário", description: "Montar formulário de inscrição" },
];

export const mockLibraryCategories = [
  "Todos",
  "Louvor",
  "Pregações",
  "Design & Social",
  "Discipulado",
  "Kids",
  "Administrativo",
];

export const mockLibraryItems = [
  {
    id: "1",
    title: "Kit de Slides — Culto de Celebração",
    category: "Design & Social",
    type: "Slides",
    updatedAt: "2 dias atrás",
    size: "24 MB",
    featured: true,
  },
  {
    id: "2",
    title: "Cifras — Repertório de Outubro",
    category: "Louvor",
    type: "PDF",
    updatedAt: "5 dias atrás",
    size: "3,1 MB",
    featured: true,
  },
  {
    id: "3",
    title: "Série 'Fundamentos da Fé' — Áudios",
    category: "Pregações",
    type: "Áudio",
    updatedAt: "1 semana atrás",
    size: "112 MB",
    featured: false,
  },
  {
    id: "4",
    title: "Apostila do Discipulado — Módulo 3",
    category: "Discipulado",
    type: "PDF",
    updatedAt: "2 semanas atrás",
    size: "5,4 MB",
    featured: false,
  },
  {
    id: "5",
    title: "Artes para Stories — Semana de Oração",
    category: "Design & Social",
    type: "Imagens",
    updatedAt: "3 dias atrás",
    size: "48 MB",
    featured: true,
  },
  {
    id: "6",
    title: "Roteiro — Culto Kids de Outubro",
    category: "Kids",
    type: "Documento",
    updatedAt: "4 dias atrás",
    size: "1,2 MB",
    featured: false,
  },
  {
    id: "7",
    title: "Planilha de Escalas — Ministérios",
    category: "Administrativo",
    type: "Planilha",
    updatedAt: "6 dias atrás",
    size: "820 KB",
    featured: false,
  },
  {
    id: "8",
    title: "Playback — Repertório Acústico",
    category: "Louvor",
    type: "Áudio",
    updatedAt: "1 semana atrás",
    size: "67 MB",
    featured: false,
  },
];
