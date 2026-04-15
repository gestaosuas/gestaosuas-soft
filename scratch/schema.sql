


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "user_name" "text",
    "directorate_id" "uuid",
    "directorate_name" "text",
    "action_type" "text" NOT NULL,
    "resource_type" "text" NOT NULL,
    "resource_name" "text",
    "details" "jsonb"
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."beneficios_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "directorate_id" "text" NOT NULL,
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "absorvente" integer DEFAULT 0,
    "encaminhadas_inclusao_cadunico" integer DEFAULT 0,
    "encaminhadas_atualizacao_cadunico" integer DEFAULT 0,
    "consulta_cadunico" integer DEFAULT 0,
    "numero_nis" integer DEFAULT 0,
    "dmae" integer DEFAULT 0,
    "pro_pao" integer DEFAULT 0,
    "auxilio_documento" integer DEFAULT 0,
    "carteirinha_idoso" integer DEFAULT 0,
    "bpc_presencial" integer DEFAULT 0,
    "bpc_online" integer DEFAULT 0,
    "solicitacao_colchoes" integer DEFAULT 0,
    "cesta_basica" integer DEFAULT 0,
    "solicitacao_fraldas" integer DEFAULT 0,
    "agasalho_cobertor" integer DEFAULT 0,
    "visitas_cadunico" integer DEFAULT 0,
    "visita_nucleo_habitacao" integer DEFAULT 0,
    "visita_cesta_fraldas_colchoes" integer DEFAULT 0,
    "visita_dmae" integer DEFAULT 0,
    "visitas_pro_pao" integer DEFAULT 0,
    "total_visitas" integer DEFAULT 0,
    "busao_social_1" integer DEFAULT 0,
    "busao_social_2" integer DEFAULT 0,
    "dibs" integer DEFAULT 0,
    "familias_pbf" integer DEFAULT 0,
    "pessoas_cadunico" integer DEFAULT 0
);


ALTER TABLE "public"."beneficios_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ceai_categorias" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit" "text" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ceai_categorias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ceai_oficinas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit" "text" NOT NULL,
    "activity_name" "text" NOT NULL,
    "category_id" "uuid",
    "vacancies" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "classes_count" integer DEFAULT 0 NOT NULL,
    "total_vacancies" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."ceai_oficinas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cras_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "unit_name" "text" NOT NULL,
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "absorvente" integer DEFAULT 0,
    "mes_anterior" integer DEFAULT 0,
    "admitidas" integer DEFAULT 0,
    "desligadas" integer DEFAULT 0,
    "atual" integer DEFAULT 0,
    "atendimentos" integer DEFAULT 0,
    "visita_domiciliar" integer DEFAULT 0,
    "atend_particularizado" integer DEFAULT 0,
    "pro_pao" integer DEFAULT 0,
    "dmae" integer DEFAULT 0,
    "auxilio_documento" integer DEFAULT 0,
    "cesta_basica" integer DEFAULT 0,
    "fralda" integer DEFAULT 0,
    "bpc" integer DEFAULT 0,
    "carteirinha_idoso" integer DEFAULT 0,
    "passe_livre_deficiente" integer DEFAULT 0,
    "cadastros_novos" integer DEFAULT 0,
    "recadastros" integer DEFAULT 0,
    "anexo_rma" "text" DEFAULT ''::"text",
    "directorate_id" "uuid"
);


ALTER TABLE "public"."cras_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."creas_idoso_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "directorate_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "month" smallint NOT NULL,
    "year" integer NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "paefi_novos_casos" integer DEFAULT 0,
    "paefi_acomp_inicio" integer DEFAULT 0,
    "paefi_inseridos" integer DEFAULT 0,
    "paefi_desligados" integer DEFAULT 0,
    "paefi_bolsa_familia" integer DEFAULT 0,
    "paefi_bpc" integer DEFAULT 0,
    "paefi_substancias" integer DEFAULT 0,
    "violencia_fisica_atendidas_anterior" integer DEFAULT 0,
    "violencia_fisica_inseridos" integer DEFAULT 0,
    "violencia_fisica_desligados" integer DEFAULT 0,
    "violencia_fisica_total" integer DEFAULT 0,
    "abuso_sexual_atendidas_anterior" integer DEFAULT 0,
    "abuso_sexual_inseridos" integer DEFAULT 0,
    "abuso_sexual_desligados" integer DEFAULT 0,
    "abuso_sexual_total" integer DEFAULT 0,
    "exploracao_sexual_atendidas_anterior" integer DEFAULT 0,
    "exploracao_sexual_inseridos" integer DEFAULT 0,
    "exploracao_sexual_desligados" integer DEFAULT 0,
    "exploracao_sexual_total" integer DEFAULT 0,
    "negligencia_atendidas_anterior" integer DEFAULT 0,
    "negligencia_inseridos" integer DEFAULT 0,
    "negligencia_desligados" integer DEFAULT 0,
    "negligencia_total" integer DEFAULT 0,
    "exploracao_financeira_atendidas_anterior" integer DEFAULT 0,
    "exploracao_financeira_inseridos" integer DEFAULT 0,
    "exploracao_financeira_desligados" integer DEFAULT 0,
    "exploracao_financeira_total" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "creas_idoso_reports_month_check" CHECK ((("month" >= 1) AND ("month" <= 12))),
    CONSTRAINT "creas_idoso_reports_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'finalized'::"text", 'submitted'::"text"])))
);


ALTER TABLE "public"."creas_idoso_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."creas_pcd_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "directorate_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "month" smallint NOT NULL,
    "year" integer NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "def_violencia_fisica_atendidas_anterior" integer DEFAULT 0,
    "def_violencia_fisica_inseridos" integer DEFAULT 0,
    "def_violencia_fisica_desligados" integer DEFAULT 0,
    "def_violencia_fisica_total" integer DEFAULT 0,
    "def_abuso_sexual_atendidas_anterior" integer DEFAULT 0,
    "def_abuso_sexual_inseridos" integer DEFAULT 0,
    "def_abuso_sexual_desligados" integer DEFAULT 0,
    "def_abuso_sexual_total" integer DEFAULT 0,
    "def_exploracao_sexual_atendidas_anterior" integer DEFAULT 0,
    "def_exploracao_sexual_inseridos" integer DEFAULT 0,
    "def_exploracao_sexual_desligados" integer DEFAULT 0,
    "def_exploracao_sexual_total" integer DEFAULT 0,
    "def_negligencia_atendidas_anterior" integer DEFAULT 0,
    "def_negligencia_inseridos" integer DEFAULT 0,
    "def_negligencia_desligados" integer DEFAULT 0,
    "def_negligencia_total" integer DEFAULT 0,
    "def_exploracao_financeira_atendidas_anterior" integer DEFAULT 0,
    "def_exploracao_financeira_inseridos" integer DEFAULT 0,
    "def_exploracao_financeira_desligados" integer DEFAULT 0,
    "def_exploracao_financeira_total" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "creas_pcd_reports_month_check" CHECK ((("month" >= 1) AND ("month" <= 12))),
    CONSTRAINT "creas_pcd_reports_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'finalized'::"text", 'submitted'::"text"])))
);


ALTER TABLE "public"."creas_pcd_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."creas_pop_rua_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "directorate_id" "uuid" NOT NULL,
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text" NOT NULL,
    "num_atend_centro_ref" integer DEFAULT 0,
    "num_atend_abordagem" integer DEFAULT 0,
    "num_atend_migracao" integer DEFAULT 0,
    "num_atend_total" integer DEFAULT 0,
    "cr_a1_masc" integer DEFAULT 0,
    "cr_a1_fem" integer DEFAULT 0,
    "cr_b1_drogas" integer DEFAULT 0,
    "cr_b2_migrantes" integer DEFAULT 0,
    "cr_b3_mental" integer DEFAULT 0,
    "cr_cad_unico" integer DEFAULT 0,
    "cr_enc_mercado" integer DEFAULT 0,
    "cr_enc_caps" integer DEFAULT 0,
    "cr_enc_saude" integer DEFAULT 0,
    "cr_enc_consultorio" integer DEFAULT 0,
    "cr_segunda_via" integer DEFAULT 0,
    "ar_e1_masc" integer DEFAULT 0,
    "ar_e2_fem" integer DEFAULT 0,
    "ar_e5_drogas" integer DEFAULT 0,
    "ar_e6_migrantes" integer DEFAULT 0,
    "ar_persistentes" integer DEFAULT 0,
    "ar_enc_centro_ref" integer DEFAULT 0,
    "ar_recusa_identificacao" integer DEFAULT 0,
    "nm_total_passagens" integer DEFAULT 0,
    "nm_passagens_deferidas" integer DEFAULT 0,
    "nm_passagens_indeferidas" integer DEFAULT 0,
    "nm_estrangeiros" integer DEFAULT 0,
    "nm_retorno_familiar" integer DEFAULT 0,
    "nm_busca_trabalho" integer DEFAULT 0,
    "nm_busca_saude" integer DEFAULT 0,
    CONSTRAINT "creas_pop_rua_reports_month_check" CHECK ((("month" >= 1) AND ("month" <= 12)))
);


ALTER TABLE "public"."creas_pop_rua_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" "date" NOT NULL,
    "directorate_id" "uuid",
    "user_id" "uuid",
    "type" "text" DEFAULT 'daily'::"text" NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."daily_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."directorates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "sheet_config" "jsonb",
    "form_definition" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "available_units" "jsonb"
);


ALTER TABLE "public"."directorates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_delegations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "visit_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "delegated_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "directorate_id" "uuid",
    CONSTRAINT "form_delegations_target_check" CHECK ((("user_id" IS NOT NULL) OR ("directorate_id" IS NOT NULL)))
);


ALTER TABLE "public"."form_delegations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."map_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "color" "text" DEFAULT 'gray'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."map_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."map_units" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid",
    "name" "text" NOT NULL,
    "region" "text",
    "address" "text",
    "phone" "text",
    "latitude" numeric,
    "longitude" numeric,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."map_units" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."monthly_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "directorate_id" "uuid",
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "setor" "text" NOT NULL,
    "content" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'finalized'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."monthly_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."oscs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "cep" "text",
    "address" "text",
    "number" "text",
    "neighborhood" "text",
    "phone" "text",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "activity_type" "text",
    "subsidized_count" integer DEFAULT 0,
    "objeto" "text",
    "objetivos" "text",
    "metas" "text",
    "atividades" "text",
    "directorate_id" "uuid"
);


ALTER TABLE "public"."oscs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_directorates" (
    "profile_id" "uuid" NOT NULL,
    "directorate_id" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"(),
    "allowed_units" "jsonb"
);


ALTER TABLE "public"."profile_directorates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "directorate_id" "uuid",
    "full_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'diretor'::"text", 'agente'::"text", 'user'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."qualificacao_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "directorate_id" "uuid",
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "resumo_vagas" integer DEFAULT 0,
    "resumo_cursos" integer DEFAULT 0,
    "resumo_turmas" integer DEFAULT 0,
    "resumo_concluintes" integer DEFAULT 0,
    "resumo_mulheres" integer DEFAULT 0,
    "resumo_homens" integer DEFAULT 0,
    "resumo_mercado_fem" integer DEFAULT 0,
    "resumo_mercado_masc" integer DEFAULT 0,
    "resumo_vagas_ocupadas" integer DEFAULT 0,
    "resumo_taxa_ocupacao" numeric(5,2) DEFAULT 0,
    "cp_morumbi_concluintes" integer DEFAULT 0,
    "cp_lagoinha_concluintes" integer DEFAULT 0,
    "cp_campo_alegre_concluintes" integer DEFAULT 0,
    "cp_luizote_1_concluintes" integer DEFAULT 0,
    "cp_luizote_2_concluintes" integer DEFAULT 0,
    "cp_tocantins_concluintes" integer DEFAULT 0,
    "cp_planalto_concluintes" integer DEFAULT 0,
    "onibus_concluintes_unit" integer DEFAULT 0,
    "maravilha_concluintes" integer DEFAULT 0,
    "uditech_concluintes" integer DEFAULT 0,
    "bairros_visitados" integer DEFAULT 0,
    "concluintes_onibus" integer DEFAULT 0,
    "cursos_onibus" integer DEFAULT 0,
    "cp_morumbi_atendimentos" integer DEFAULT 0,
    "cp_lagoinha_atendimentos" integer DEFAULT 0,
    "cp_campo_alegre_atendimentos" integer DEFAULT 0,
    "cp_luizote_1_atendimentos" integer DEFAULT 0,
    "cp_luizote_2_atendimentos" integer DEFAULT 0,
    "cp_tocantis_atendimentos" integer DEFAULT 0,
    "cp_planalto_atendimentos" integer DEFAULT 0,
    "maravilha_atendimentos" integer DEFAULT 0,
    "unitech_atendimentos" integer DEFAULT 0,
    "onibus_atendimentos" integer DEFAULT 0,
    "cursos_andamento" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "qualificacao_reports_month_check" CHECK ((("month" >= 1) AND ("month" <= 12)))
);


ALTER TABLE "public"."qualificacao_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settings" (
    "key" "text" NOT NULL,
    "value" "text",
    "description" "text",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sine_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "directorate_id" "uuid",
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "atend_trabalhador" integer DEFAULT 0,
    "atend_online_trabalhador" integer DEFAULT 0,
    "atend_empregador" integer DEFAULT 0,
    "atend_online_empregador" integer DEFAULT 0,
    "seguro_desemprego" integer DEFAULT 0,
    "vagas_captadas" integer DEFAULT 0,
    "ligacoes_recebidas" integer DEFAULT 0,
    "ligacoes_realizadas" integer DEFAULT 0,
    "curriculos" integer DEFAULT 0,
    "entrevistados" integer DEFAULT 0,
    "proc_administrativos" integer DEFAULT 0,
    "processo_seletivo" integer DEFAULT 0,
    "inseridos_mercado" integer DEFAULT 0,
    "carteira_digital" integer DEFAULT 0,
    "orientacao_profissional" integer DEFAULT 0,
    "convocacao_trabalhadores" integer DEFAULT 0,
    "vagas_alto_valor" integer DEFAULT 0,
    "atendimentos" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "sine_reports_month_check" CHECK ((("month" >= 1) AND ("month" <= 12)))
);


ALTER TABLE "public"."sine_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "directorate_id" "uuid",
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "submissions_month_check" CHECK ((("month" >= 1) AND ("month" <= 12)))
);


ALTER TABLE "public"."submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visits" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "osc_id" "uuid",
    "directorate_id" "uuid",
    "visit_date" "date" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text",
    "identificacao" "jsonb",
    "atendimento" "jsonb",
    "forma_acesso" "jsonb",
    "rh_data" "jsonb",
    "observacoes" "text",
    "recomendacoes" "text",
    "assinaturas" "jsonb",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "parecer_tecnico" "jsonb",
    "documents" "jsonb" DEFAULT '[]'::"jsonb",
    "parecer_conclusivo" "jsonb",
    "relatorio_final" "jsonb",
    "notificacoes" "jsonb" DEFAULT '[]'::"jsonb",
    CONSTRAINT "visits_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'finalized'::"text"])))
);


ALTER TABLE "public"."visits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "osc_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "directorate_id" "uuid" NOT NULL,
    "content" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text"
);


ALTER TABLE "public"."work_plans" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."beneficios_reports"
    ADD CONSTRAINT "beneficios_reports_directorate_id_month_year_key" UNIQUE ("directorate_id", "month", "year");



ALTER TABLE ONLY "public"."beneficios_reports"
    ADD CONSTRAINT "beneficios_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ceai_categorias"
    ADD CONSTRAINT "ceai_categorias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ceai_oficinas"
    ADD CONSTRAINT "ceai_oficinas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cras_reports"
    ADD CONSTRAINT "cras_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cras_reports"
    ADD CONSTRAINT "cras_reports_unit_name_month_year_key" UNIQUE ("unit_name", "month", "year");



ALTER TABLE ONLY "public"."creas_idoso_reports"
    ADD CONSTRAINT "creas_idoso_reports_directorate_id_month_year_key" UNIQUE ("directorate_id", "month", "year");



ALTER TABLE ONLY "public"."creas_idoso_reports"
    ADD CONSTRAINT "creas_idoso_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."creas_pcd_reports"
    ADD CONSTRAINT "creas_pcd_reports_directorate_id_month_year_key" UNIQUE ("directorate_id", "month", "year");



ALTER TABLE ONLY "public"."creas_pcd_reports"
    ADD CONSTRAINT "creas_pcd_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."creas_pop_rua_reports"
    ADD CONSTRAINT "creas_pop_rua_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."creas_pop_rua_reports"
    ADD CONSTRAINT "creas_pop_rua_reports_unq" UNIQUE ("directorate_id", "month", "year");



ALTER TABLE ONLY "public"."daily_reports"
    ADD CONSTRAINT "daily_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."directorates"
    ADD CONSTRAINT "directorates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_delegations"
    ADD CONSTRAINT "form_delegations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_delegations"
    ADD CONSTRAINT "form_delegations_visit_id_user_id_key" UNIQUE ("visit_id", "user_id");



ALTER TABLE ONLY "public"."map_categories"
    ADD CONSTRAINT "map_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."map_categories"
    ADD CONSTRAINT "map_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."map_units"
    ADD CONSTRAINT "map_units_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."monthly_reports"
    ADD CONSTRAINT "monthly_reports_directorate_id_setor_month_year_key" UNIQUE ("directorate_id", "setor", "month", "year");



ALTER TABLE ONLY "public"."monthly_reports"
    ADD CONSTRAINT "monthly_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."oscs"
    ADD CONSTRAINT "oscs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_directorates"
    ADD CONSTRAINT "profile_directorates_pkey" PRIMARY KEY ("profile_id", "directorate_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."qualificacao_reports"
    ADD CONSTRAINT "qualificacao_reports_month_year_key" UNIQUE ("month", "year");



ALTER TABLE ONLY "public"."qualificacao_reports"
    ADD CONSTRAINT "qualificacao_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."sine_reports"
    ADD CONSTRAINT "sine_reports_month_year_key" UNIQUE ("month", "year");



ALTER TABLE ONLY "public"."sine_reports"
    ADD CONSTRAINT "sine_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_directorate_id_month_year_key" UNIQUE ("directorate_id", "month", "year");



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."work_plans"
    ADD CONSTRAINT "work_plans_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_daily_reports_date" ON "public"."daily_reports" USING "btree" ("date");



CREATE INDEX "idx_daily_reports_directorate" ON "public"."daily_reports" USING "btree" ("directorate_id");



CREATE INDEX "visits_directorate_id_idx" ON "public"."visits" USING "btree" ("directorate_id");



CREATE INDEX "visits_osc_id_idx" ON "public"."visits" USING "btree" ("osc_id");



CREATE INDEX "visits_status_idx" ON "public"."visits" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "trigger_update_creas_idoso_reports" BEFORE UPDATE ON "public"."creas_idoso_reports" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_creas_pcd_reports" BEFORE UPDATE ON "public"."creas_pcd_reports" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."beneficios_reports"
    ADD CONSTRAINT "beneficios_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ceai_oficinas"
    ADD CONSTRAINT "ceai_oficinas_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."ceai_categorias"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cras_reports"
    ADD CONSTRAINT "cras_reports_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id");



ALTER TABLE ONLY "public"."cras_reports"
    ADD CONSTRAINT "cras_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."creas_idoso_reports"
    ADD CONSTRAINT "creas_idoso_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."creas_idoso_reports"
    ADD CONSTRAINT "creas_idoso_reports_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."creas_pcd_reports"
    ADD CONSTRAINT "creas_pcd_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."creas_pcd_reports"
    ADD CONSTRAINT "creas_pcd_reports_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."creas_pop_rua_reports"
    ADD CONSTRAINT "creas_pop_rua_reports_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_reports"
    ADD CONSTRAINT "daily_reports_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_reports"
    ADD CONSTRAINT "daily_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."form_delegations"
    ADD CONSTRAINT "form_delegations_delegated_by_fkey" FOREIGN KEY ("delegated_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_delegations"
    ADD CONSTRAINT "form_delegations_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_delegations"
    ADD CONSTRAINT "form_delegations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_delegations"
    ADD CONSTRAINT "form_delegations_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."map_units"
    ADD CONSTRAINT "map_units_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."map_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."monthly_reports"
    ADD CONSTRAINT "monthly_reports_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id");



ALTER TABLE ONLY "public"."monthly_reports"
    ADD CONSTRAINT "monthly_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."oscs"
    ADD CONSTRAINT "oscs_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id");



ALTER TABLE ONLY "public"."oscs"
    ADD CONSTRAINT "oscs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profile_directorates"
    ADD CONSTRAINT "profile_directorates_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_directorates"
    ADD CONSTRAINT "profile_directorates_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."qualificacao_reports"
    ADD CONSTRAINT "qualificacao_reports_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."qualificacao_reports"
    ADD CONSTRAINT "qualificacao_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."sine_reports"
    ADD CONSTRAINT "sine_reports_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sine_reports"
    ADD CONSTRAINT "sine_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id");



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_directorate_id_fkey" FOREIGN KEY ("directorate_id") REFERENCES "public"."directorates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_osc_id_fkey" FOREIGN KEY ("osc_id") REFERENCES "public"."oscs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."work_plans"
    ADD CONSTRAINT "work_plans_osc_id_fkey" FOREIGN KEY ("osc_id") REFERENCES "public"."oscs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_plans"
    ADD CONSTRAINT "work_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Acesso as categorias" ON "public"."ceai_categorias" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso as oficinas" ON "public"."ceai_oficinas" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Admin can delete pcd reports" ON "public"."creas_pcd_reports" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admin can delete reports" ON "public"."creas_idoso_reports" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can delete map categories" ON "public"."map_categories" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Admins can delete map units" ON "public"."map_units" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Admins can do everything on creas_pop_rua_reports" ON "public"."creas_pop_rua_reports" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can insert map categories" ON "public"."map_categories" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Admins can insert map units" ON "public"."map_units" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Admins can manage OSCs" ON "public"."oscs" TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Admins can manage delegations" ON "public"."form_delegations" TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Admins can update map categories" ON "public"."map_categories" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Admins can update map units" ON "public"."map_units" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Admins can view activity logs" ON "public"."activity_logs" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() ->> 'email'::"text") = 'klismanrds@gmail.com'::"text") OR (("auth"."jwt"() ->> 'email'::"text") = 'gestaosuas@uberlandia.mg.gov.br'::"text")));



CREATE POLICY "Admins podem gerenciar" ON "public"."profile_directorates" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow admin all settings" ON "public"."settings" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow all authenticated viewing" ON "public"."monthly_reports" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated insert" ON "public"."monthly_reports" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow public read settings" ON "public"."settings" FOR SELECT USING (true);



CREATE POLICY "Allow update for owner" ON "public"."monthly_reports" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated can view directorates" ON "public"."directorates" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view directorates" ON "public"."directorates" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Delegations are viewable by admins" ON "public"."form_delegations" FOR SELECT TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Directorates manageable by admin" ON "public"."directorates" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Directorates viewable by authenticated" ON "public"."directorates" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable delete for owners and admins" ON "public"."work_plans" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users" ON "public"."work_plans" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."work_plans" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable update for owners and admins" ON "public"."work_plans" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Insert submissions for my directorate" ON "public"."submissions" FOR INSERT WITH CHECK (("directorate_id" IN ( SELECT "profiles"."directorate_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Map Categories are viewable by everyone" ON "public"."map_categories" FOR SELECT USING (true);



CREATE POLICY "Map Units are viewable by everyone" ON "public"."map_units" FOR SELECT USING (true);



CREATE POLICY "OSCs deletáveis por admins" ON "public"."oscs" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "OSCs editáveis por usuários autenticados" ON "public"."oscs" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "OSCs inseríveis por usuários autenticados" ON "public"."oscs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "OSCs visíveis para usuários autenticados" ON "public"."oscs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Profiles manageable by admin" ON "public"."profiles" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND ("profiles_1"."role" = 'admin'::"text")))));



CREATE POLICY "Profiles viewable by self" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Public insert qualificacao_reports" ON "public"."qualificacao_reports" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public insert sine_reports" ON "public"."sine_reports" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public read qualificacao_reports" ON "public"."qualificacao_reports" FOR SELECT USING (true);



CREATE POLICY "Public read sine_reports" ON "public"."sine_reports" FOR SELECT USING (true);



CREATE POLICY "Public update qualificacao_reports" ON "public"."qualificacao_reports" FOR UPDATE USING (true);



CREATE POLICY "Public update sine_reports" ON "public"."sine_reports" FOR UPDATE USING (true);



CREATE POLICY "Submissions insertable by user" ON "public"."submissions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Submissions viewable by admin" ON "public"."submissions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Technicians can manage their own visits" ON "public"."visits" TO "authenticated" USING (((("user_id" = "auth"."uid"()) AND ("status" = 'draft'::"text")) OR (( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"text")));



CREATE POLICY "Technicians can view visits for their directorate" ON "public"."visits" FOR SELECT TO "authenticated" USING ((("directorate_id" IN ( SELECT "profile_directorates"."directorate_id"
   FROM "public"."profile_directorates"
  WHERE ("profile_directorates"."profile_id" = "auth"."uid"()))) OR (( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"text")));



CREATE POLICY "Update submissions from my directorate" ON "public"."submissions" FOR UPDATE USING (("directorate_id" IN ( SELECT "profiles"."directorate_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can edit their directorate's pop rua reports" ON "public"."creas_pop_rua_reports" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profile_directorates"
  WHERE (("profile_directorates"."profile_id" = "auth"."uid"()) AND ("profile_directorates"."directorate_id" = "creas_pop_rua_reports"."directorate_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profile_directorates"
  WHERE (("profile_directorates"."profile_id" = "auth"."uid"()) AND ("profile_directorates"."directorate_id" = "creas_pop_rua_reports"."directorate_id")))));



CREATE POLICY "Users can insert activity logs" ON "public"."activity_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can insert pcd reports for their directorate" ON "public"."creas_pcd_reports" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."profile_directorates"
  WHERE (("profile_directorates"."profile_id" = "auth"."uid"()) AND ("profile_directorates"."directorate_id" = "creas_pcd_reports"."directorate_id")))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can insert reports for their directorate" ON "public"."creas_idoso_reports" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."profile_directorates"
  WHERE (("profile_directorates"."profile_id" = "auth"."uid"()) AND ("profile_directorates"."directorate_id" = "creas_idoso_reports"."directorate_id")))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can manage their own beneficios reports" ON "public"."beneficios_reports" USING (true) WITH CHECK (true);



CREATE POLICY "Users can manage their own cras reports" ON "public"."cras_reports" USING (true) WITH CHECK (true);



CREATE POLICY "Users can read their directorate's pop rua reports" ON "public"."creas_pop_rua_reports" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."profile_directorates"
  WHERE (("profile_directorates"."profile_id" = "auth"."uid"()) AND ("profile_directorates"."directorate_id" = "creas_pop_rua_reports"."directorate_id"))))));



CREATE POLICY "Users can update pcd reports for their directorate" ON "public"."creas_pcd_reports" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."profile_directorates"
  WHERE (("profile_directorates"."profile_id" = "auth"."uid"()) AND ("profile_directorates"."directorate_id" = "creas_pcd_reports"."directorate_id")))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can update reports for their directorate" ON "public"."creas_idoso_reports" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."profile_directorates"
  WHERE (("profile_directorates"."profile_id" = "auth"."uid"()) AND ("profile_directorates"."directorate_id" = "creas_idoso_reports"."directorate_id")))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can view OSCs" ON "public"."oscs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view delegations for their own directorate" ON "public"."form_delegations" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."directorate_id" = "form_delegations"."directorate_id") OR (EXISTS ( SELECT 1
           FROM "public"."profile_directorates"
          WHERE (("profile_directorates"."profile_id" = "auth"."uid"()) AND ("profile_directorates"."directorate_id" = "form_delegations"."directorate_id"))))))))));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view pcd reports for their directorate" ON "public"."creas_pcd_reports" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."profile_directorates"
  WHERE (("profile_directorates"."profile_id" = "auth"."uid"()) AND ("profile_directorates"."directorate_id" = "creas_pcd_reports"."directorate_id")))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can view reports for their directorate" ON "public"."creas_idoso_reports" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."profile_directorates"
  WHERE (("profile_directorates"."profile_id" = "auth"."uid"()) AND ("profile_directorates"."directorate_id" = "creas_idoso_reports"."directorate_id")))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can view their own delegations" ON "public"."form_delegations" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR (( SELECT "profiles_1"."role"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."id" = "auth"."uid"())) = 'admin'::"text")));



CREATE POLICY "Usuarios veem suas proprias diretorias" ON "public"."profile_directorates" FOR SELECT USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "View submissions from my directorate" ON "public"."submissions" FOR SELECT USING (("directorate_id" IN ( SELECT "profiles"."directorate_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."beneficios_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ceai_categorias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ceai_oficinas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cras_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."creas_idoso_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."creas_pcd_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."creas_pop_rua_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."directorates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_delegations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."map_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."map_units" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."monthly_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."oscs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_directorates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."qualificacao_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sine_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_plans" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."activity_logs";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."beneficios_reports" TO "anon";
GRANT ALL ON TABLE "public"."beneficios_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."beneficios_reports" TO "service_role";



GRANT ALL ON TABLE "public"."ceai_categorias" TO "anon";
GRANT ALL ON TABLE "public"."ceai_categorias" TO "authenticated";
GRANT ALL ON TABLE "public"."ceai_categorias" TO "service_role";



GRANT ALL ON TABLE "public"."ceai_oficinas" TO "anon";
GRANT ALL ON TABLE "public"."ceai_oficinas" TO "authenticated";
GRANT ALL ON TABLE "public"."ceai_oficinas" TO "service_role";



GRANT ALL ON TABLE "public"."cras_reports" TO "anon";
GRANT ALL ON TABLE "public"."cras_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."cras_reports" TO "service_role";



GRANT ALL ON TABLE "public"."creas_idoso_reports" TO "anon";
GRANT ALL ON TABLE "public"."creas_idoso_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."creas_idoso_reports" TO "service_role";



GRANT ALL ON TABLE "public"."creas_pcd_reports" TO "anon";
GRANT ALL ON TABLE "public"."creas_pcd_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."creas_pcd_reports" TO "service_role";



GRANT ALL ON TABLE "public"."creas_pop_rua_reports" TO "anon";
GRANT ALL ON TABLE "public"."creas_pop_rua_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."creas_pop_rua_reports" TO "service_role";



GRANT ALL ON TABLE "public"."daily_reports" TO "anon";
GRANT ALL ON TABLE "public"."daily_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_reports" TO "service_role";



GRANT ALL ON TABLE "public"."directorates" TO "anon";
GRANT ALL ON TABLE "public"."directorates" TO "authenticated";
GRANT ALL ON TABLE "public"."directorates" TO "service_role";



GRANT ALL ON TABLE "public"."form_delegations" TO "anon";
GRANT ALL ON TABLE "public"."form_delegations" TO "authenticated";
GRANT ALL ON TABLE "public"."form_delegations" TO "service_role";



GRANT ALL ON TABLE "public"."map_categories" TO "anon";
GRANT ALL ON TABLE "public"."map_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."map_categories" TO "service_role";



GRANT ALL ON TABLE "public"."map_units" TO "anon";
GRANT ALL ON TABLE "public"."map_units" TO "authenticated";
GRANT ALL ON TABLE "public"."map_units" TO "service_role";



GRANT ALL ON TABLE "public"."monthly_reports" TO "anon";
GRANT ALL ON TABLE "public"."monthly_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."monthly_reports" TO "service_role";



GRANT ALL ON TABLE "public"."oscs" TO "anon";
GRANT ALL ON TABLE "public"."oscs" TO "authenticated";
GRANT ALL ON TABLE "public"."oscs" TO "service_role";



GRANT ALL ON TABLE "public"."profile_directorates" TO "anon";
GRANT ALL ON TABLE "public"."profile_directorates" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_directorates" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."qualificacao_reports" TO "anon";
GRANT ALL ON TABLE "public"."qualificacao_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."qualificacao_reports" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



GRANT ALL ON TABLE "public"."sine_reports" TO "anon";
GRANT ALL ON TABLE "public"."sine_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."sine_reports" TO "service_role";



GRANT ALL ON TABLE "public"."submissions" TO "anon";
GRANT ALL ON TABLE "public"."submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."submissions" TO "service_role";



GRANT ALL ON TABLE "public"."visits" TO "anon";
GRANT ALL ON TABLE "public"."visits" TO "authenticated";
GRANT ALL ON TABLE "public"."visits" TO "service_role";



GRANT ALL ON TABLE "public"."work_plans" TO "anon";
GRANT ALL ON TABLE "public"."work_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."work_plans" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































