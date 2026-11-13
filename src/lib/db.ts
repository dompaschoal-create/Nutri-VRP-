import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_DATABASE_URL || '';

export const sql = databaseUrl ? neon(databaseUrl) : null;

export async function syncNutricionista(id: string, nome: string, email: string) {
  if (!sql) return;
  try {
    await sql`
      INSERT INTO public.nutricionistas (id, nome, email, created_at)
      VALUES (${id}, ${nome}, ${email}, NOW())
      ON CONFLICT (id) DO UPDATE
      SET nome = EXCLUDED.nome,
          email = EXCLUDED.email;
    `;
  } catch (error) {
    console.error('Erro ao sincronizar nutricionista no banco:', error);
  }
}

export interface PacienteSemRetorno {
  id: string;
  nome: string;
  data_ultima_consulta: string;
  dias_sem_consulta: number;
}

export interface DashboardMetrics {
  totalPacientes: number;
  consultasSemana: number;
  pacientesSemRetorno: PacienteSemRetorno[];
}

export async function getDashboardMetrics(nutricionistaId: string): Promise<DashboardMetrics> {
  if (!sql || !nutricionistaId) {
    return {
      totalPacientes: 0,
      consultasSemana: 0,
      pacientesSemRetorno: [],
    };
  }

  try {
    const totalPacientesRes = await sql`
      SELECT COUNT(*)::int as total
      FROM public.pacientes
      WHERE nutricionista_id = ${nutricionistaId}::uuid
    `;
    const totalPacientes = totalPacientesRes[0]?.total ?? 0;

    const consultasSemanaRes = await sql`
      SELECT COUNT(*)::int as total
      FROM public.consultas c
      JOIN public.pacientes p ON p.id = c.paciente_id
      WHERE p.nutricionista_id = ${nutricionistaId}::uuid
        AND c.data_consulta >= date_trunc('week', CURRENT_DATE)::date
        AND c.data_consulta <= (date_trunc('week', CURRENT_DATE) + interval '6 days')::date
    `;
    const consultasSemana = consultasSemanaRes[0]?.total ?? 0;

    const pacientesSemRetornoRes = await sql`
      WITH ultimas_consultas AS (
        SELECT 
          c.paciente_id,
          MAX(c.data_consulta) AS ultima_consulta,
          MAX(c.proximo_retorno) AS proximo_retorno_agendado
        FROM public.consultas c
        JOIN public.pacientes p ON p.id = c.paciente_id
        WHERE p.nutricionista_id = ${nutricionistaId}::uuid
        GROUP BY c.paciente_id
      )
      SELECT 
        p.id,
        p.nome,
        uc.ultima_consulta,
        (CURRENT_DATE - uc.ultima_consulta)::int AS dias_sem_consulta
      FROM ultimas_consultas uc
      JOIN public.pacientes p ON p.id = uc.paciente_id
      WHERE uc.ultima_consulta < (CURRENT_DATE - INTERVAL '30 days')::date
        AND (uc.proximo_retorno_agendado IS NULL OR uc.proximo_retorno_agendado < CURRENT_DATE)
      ORDER BY uc.ultima_consulta ASC
    `;

    const pacientesSemRetorno: PacienteSemRetorno[] = (pacientesSemRetornoRes || []).map((row: any) => ({
      id: String(row.id || ''),
      nome: String(row.nome || ''),
      data_ultima_consulta: row.ultima_consulta ? new Date(row.ultima_consulta).toLocaleDateString('pt-BR') : '',
      dias_sem_consulta: Number(row.dias_sem_consulta) || 0,
    }));

    return {
      totalPacientes,
      consultasSemana,
      pacientesSemRetorno,
    };
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard:', error);
    return {
      totalPacientes: 0,
      consultasSemana: 0,
      pacientesSemRetorno: [],
    };
  }
}

export interface PacienteListItem {
  id: string;
  nome: string;
  objetivos: string[] | null;
  objetivo_texto: string | null;
  data_ultima_consulta: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  created_at: string;
}

export async function getPacientesList(nutricionistaId: string, search = ''): Promise<PacienteListItem[]> {
  if (!sql || !nutricionistaId) return [];
  try {
    const trimmed = search.trim().toLowerCase();
    let res: any[] = [];

    if (trimmed) {
      const searchTerm = `%${trimmed}%`;
      res = await sql`
        SELECT 
          p.id,
          p.nome,
          p.objetivos,
          p.objetivo_texto,
          p.telefone,
          p.whatsapp,
          p.email,
          p.created_at,
          (
            SELECT MAX(c.data_consulta) 
            FROM public.consultas c 
            WHERE c.paciente_id = p.id
          ) AS data_ultima_consulta
        FROM public.pacientes p
        WHERE p.nutricionista_id = ${nutricionistaId}::uuid
          AND LOWER(p.nome) LIKE ${searchTerm}
        ORDER BY p.created_at DESC
      `;
    } else {
      res = await sql`
        SELECT 
          p.id,
          p.nome,
          p.objetivos,
          p.objetivo_texto,
          p.telefone,
          p.whatsapp,
          p.email,
          p.created_at,
          (
            SELECT MAX(c.data_consulta) 
            FROM public.consultas c 
            WHERE c.paciente_id = p.id
          ) AS data_ultima_consulta
        FROM public.pacientes p
        WHERE p.nutricionista_id = ${nutricionistaId}::uuid
        ORDER BY p.created_at DESC
      `;
    }

    return (res || []).map((row: any) => ({
      id: String(row.id || ''),
      nome: String(row.nome || 'Sem nome'),
      objetivos: Array.isArray(row.objetivos) ? row.objetivos : null,
      objetivo_texto: row.objetivo_texto || null,
      data_ultima_consulta: row.data_ultima_consulta 
        ? new Date(row.data_ultima_consulta).toLocaleDateString('pt-BR') 
        : null,
      telefone: row.telefone || null,
      whatsapp: row.whatsapp || null,
      email: row.email || null,
      created_at: row.created_at ? String(row.created_at) : new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Erro ao listar pacientes:', err);
    return [];
  }
}

export interface PacienteCadastroInput {
  nutricionista_id: string;
  nome: string;
  data_nascimento?: string | null;
  sexo?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  peso_inicial?: number | null;
  altura?: number | null;
  objetivos?: string[];
  objetivo_texto?: string | null;
  nivel_atividade?: string | null;
  patologias?: string[];
  restricoes_alimentares?: string[];
  alergias?: string[];
  medicamentos?: string | null;
  suplementos?: string | null;
  refeicoes_por_dia?: number | null;
  horario_acorda?: string | null;
  horario_dorme?: string | null;
  litros_agua?: number | null;
  atividade_fisica?: boolean;
  atividade_fisica_descricao?: string | null;
  observacoes?: string | null;
}

export async function createPaciente(data: PacienteCadastroInput): Promise<{ id: string } | null> {
  if (!sql) return null;
  try {
    const res = await sql`
      INSERT INTO public.pacientes (
        nutricionista_id,
        nome,
        data_nascimento,
        sexo,
        telefone,
        whatsapp,
        email,
        peso_inicial,
        altura,
        objetivos,
        objetivo_texto,
        nivel_atividade,
        patologias,
        restricoes_alimentares,
        alergias,
        medicamentos,
        suplementos,
        refeicoes_por_dia,
        horario_acorda,
        horario_dorme,
        litros_agua,
        atividade_fisica,
        atividade_fisica_descricao,
        observacoes,
        created_at
      )
      VALUES (
        ${data.nutricionista_id}::uuid,
        ${data.nome.trim()},
        ${data.data_nascimento || null},
        ${data.sexo || null},
        ${data.telefone || null},
        ${data.whatsapp || null},
        ${data.email || null},
        ${data.peso_inicial ?? null},
        ${data.altura ?? null},
        ${data.objetivos && data.objetivos.length > 0 ? data.objetivos : null},
        ${data.objetivo_texto || null},
        ${data.nivel_atividade || null},
        ${data.patologias && data.patologias.length > 0 ? data.patologias : null},
        ${data.restricoes_alimentares && data.restricoes_alimentares.length > 0 ? data.restricoes_alimentares : null},
        ${data.alergias && data.alergias.length > 0 ? data.alergias : null},
        ${data.medicamentos || null},
        ${data.suplementos || null},
        ${data.refeicoes_por_dia ?? null},
        ${data.horario_acorda || null},
        ${data.horario_dorme || null},
        ${data.litros_agua ?? null},
        ${data.atividade_fisica ?? false},
        ${data.atividade_fisica_descricao || null},
        ${data.observacoes || null},
        NOW()
      )
      RETURNING id;
    `;

    return res[0] ? { id: res[0].id } : null;
  } catch (error) {
    console.error('Erro ao cadastrar paciente:', error);
    throw error;
  }
}

export async function getPacienteById(id: string, nutricionistaId: string) {
  if (!sql || !id || !nutricionistaId) return null;
  try {
    const res = await sql`
      SELECT *
      FROM public.pacientes
      WHERE id = ${id}::uuid AND nutricionista_id = ${nutricionistaId}::uuid
      LIMIT 1;
    `;
    return res[0] || null;
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    return null;
  }
}
