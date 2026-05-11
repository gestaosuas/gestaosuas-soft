import sqlite3
import uuid
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "db.sqlite3"


DDL = [
    """
    CREATE TABLE IF NOT EXISTS core_systemsetting (
        key varchar(120) PRIMARY KEY,
        value TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS directorates_directorate (
        id char(32) PRIMARY KEY,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        name varchar(255) NOT NULL UNIQUE,
        sheet_config TEXT NULL,
        form_definition TEXT NULL,
        available_units TEXT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS accounts_profile (
        id integer PRIMARY KEY AUTOINCREMENT,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        full_name varchar(255) NOT NULL DEFAULT '',
        role varchar(20) NOT NULL DEFAULT 'user',
        user_id integer NOT NULL UNIQUE REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED,
        primary_directorate_id char(32) NULL REFERENCES directorates_directorate(id) DEFERRABLE INITIALLY DEFERRED
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS accounts_profiledirectorate (
        id integer PRIMARY KEY AUTOINCREMENT,
        assigned_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        allowed_units TEXT NULL,
        profile_id integer NOT NULL REFERENCES accounts_profile(id) DEFERRABLE INITIALLY DEFERRED,
        directorate_id char(32) NOT NULL REFERENCES directorates_directorate(id) DEFERRABLE INITIALLY DEFERRED
    )
    """,
    """
    CREATE UNIQUE INDEX IF NOT EXISTS accounts_profiledirectorate_unique
    ON accounts_profiledirectorate(profile_id, directorate_id)
    """,
    """
    CREATE TABLE IF NOT EXISTS directorates_monthlysubmission (
        id char(32) PRIMARY KEY,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        month smallint NOT NULL,
        year integer NOT NULL,
        data TEXT NOT NULL DEFAULT '{}',
        user_id integer NULL REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED,
        directorate_id char(32) NOT NULL REFERENCES directorates_directorate(id) DEFERRABLE INITIALLY DEFERRED
    )
    """,
    """
    CREATE UNIQUE INDEX IF NOT EXISTS directorates_monthlysubmission_unique
    ON directorates_monthlysubmission(directorate_id, month, year)
    """,
    """
    CREATE TABLE IF NOT EXISTS directorates_dailyreport (
        id char(32) PRIMARY KEY,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        date date NOT NULL,
        data TEXT NOT NULL DEFAULT '{}',
        report_type varchar(50) NOT NULL DEFAULT '',
        user_id integer NULL REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED,
        directorate_id char(32) NOT NULL REFERENCES directorates_directorate(id) DEFERRABLE INITIALLY DEFERRED
    )
    """,
    """
    CREATE UNIQUE INDEX IF NOT EXISTS directorates_dailyreport_unique
    ON directorates_dailyreport(date, directorate_id)
    """,
    """
    CREATE TABLE IF NOT EXISTS directorates_monthlyreport (
        id char(32) PRIMARY KEY,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        month smallint NOT NULL,
        year integer NOT NULL,
        setor varchar(120) NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '{}',
        status varchar(20) NOT NULL DEFAULT 'draft',
        user_id integer NULL REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED,
        directorate_id char(32) NOT NULL REFERENCES directorates_directorate(id) DEFERRABLE INITIALLY DEFERRED
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS directorates_osc (
        id char(32) PRIMARY KEY,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        name varchar(255) NOT NULL,
        activity_type varchar(120) NOT NULL DEFAULT '',
        cep varchar(20) NOT NULL DEFAULT '',
        address varchar(255) NOT NULL DEFAULT '',
        number varchar(20) NOT NULL DEFAULT '',
        neighborhood varchar(120) NOT NULL DEFAULT '',
        phone varchar(60) NOT NULL DEFAULT '',
        subsidized_count integer NOT NULL DEFAULT 0,
        objeto TEXT NOT NULL DEFAULT '',
        objetivos TEXT NOT NULL DEFAULT '',
        metas TEXT NOT NULL DEFAULT '',
        atividades TEXT NOT NULL DEFAULT '',
        user_id integer NULL REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED,
        directorate_id char(32) NOT NULL REFERENCES directorates_directorate(id) DEFERRABLE INITIALLY DEFERRED
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS directorates_workplan (
        id char(32) PRIMARY KEY,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        title varchar(255) NOT NULL,
        content TEXT NOT NULL DEFAULT '[]',
        status varchar(20) NOT NULL DEFAULT 'draft',
        osc_id char(32) NOT NULL REFERENCES directorates_osc(id) DEFERRABLE INITIALLY DEFERRED,
        user_id integer NULL REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED,
        directorate_id char(32) NOT NULL REFERENCES directorates_directorate(id) DEFERRABLE INITIALLY DEFERRED
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS directorates_visit (
        id char(32) PRIMARY KEY,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        visit_date date NOT NULL,
        visit_time time NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'draft',
        identificacao TEXT NULL,
        atendimento TEXT NULL,
        forma_acesso TEXT NULL,
        rh_data TEXT NULL,
        observacoes TEXT NOT NULL DEFAULT '',
        recomendacoes TEXT NOT NULL DEFAULT '',
        assinaturas TEXT NULL,
        parecer_tecnico TEXT NULL,
        parecer_conclusivo TEXT NULL,
        relatorio_final TEXT NULL,
        notificacoes TEXT NOT NULL DEFAULT '[]',
        documents TEXT NOT NULL DEFAULT '[]',
        osc_id char(32) NOT NULL REFERENCES directorates_osc(id) DEFERRABLE INITIALLY DEFERRED,
        directorate_id char(32) NOT NULL REFERENCES directorates_directorate(id) DEFERRABLE INITIALLY DEFERRED,
        user_id integer NULL REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS directorates_formdelegation (
        id char(32) PRIMARY KEY,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        visit_id char(32) NOT NULL REFERENCES directorates_visit(id) DEFERRABLE INITIALLY DEFERRED,
        user_id integer NULL REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED,
        delegated_by_id integer NULL REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED,
        directorate_id char(32) NULL REFERENCES directorates_directorate(id) DEFERRABLE INITIALLY DEFERRED
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS monitorings_beneficiosreport (
        id char(32) PRIMARY KEY,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        month smallint NOT NULL,
        year integer NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'draft',
        created_by varchar(255) NOT NULL DEFAULT '',
        encaminhadas_inclusao_cadunico integer NOT NULL DEFAULT 0,
        encaminhadas_atualizacao_cadunico integer NOT NULL DEFAULT 0,
        consulta_cadunico integer NOT NULL DEFAULT 0,
        numero_nis integer NOT NULL DEFAULT 0,
        dmae integer NOT NULL DEFAULT 0,
        pro_pao integer NOT NULL DEFAULT 0,
        auxilio_documento integer NOT NULL DEFAULT 0,
        carteirinha_idoso integer NOT NULL DEFAULT 0,
        bpc_presencial integer NOT NULL DEFAULT 0,
        bpc_online integer NOT NULL DEFAULT 0,
        solicitacao_colchoes integer NOT NULL DEFAULT 0,
        cesta_basica integer NOT NULL DEFAULT 0,
        solicitacao_fraldas integer NOT NULL DEFAULT 0,
        absorvente integer NOT NULL DEFAULT 0,
        agasalho_cobertor integer NOT NULL DEFAULT 0,
        visitas_cadunico integer NOT NULL DEFAULT 0,
        visita_nucleo_habitacao integer NOT NULL DEFAULT 0,
        visita_cesta_fraldas_colchoes integer NOT NULL DEFAULT 0,
        visita_dmae integer NOT NULL DEFAULT 0,
        visitas_pro_pao integer NOT NULL DEFAULT 0,
        total_visitas integer NOT NULL DEFAULT 0,
        busao_social_1 integer NOT NULL DEFAULT 0,
        busao_social_2 integer NOT NULL DEFAULT 0,
        dibs integer NOT NULL DEFAULT 0,
        familias_pbf integer NOT NULL DEFAULT 0,
        pessoas_cadunico integer NOT NULL DEFAULT 0,
        directorate_id char(32) NOT NULL REFERENCES directorates_directorate(id) DEFERRABLE INITIALLY DEFERRED,
        user_id integer NULL REFERENCES auth_user(id) DEFERRABLE INITIALLY DEFERRED
    )
    """,
    """
    CREATE UNIQUE INDEX IF NOT EXISTS monitorings_beneficiosreport_unique
    ON monitorings_beneficiosreport(directorate_id, month, year)
    """,
]

BENEFICIOS_EXTRA_COLUMNS = {
    "guia_foto": "integer NOT NULL DEFAULT 0",
    "visitas_convocacoes": "integer NOT NULL DEFAULT 0",
    "cesta_indeferida_renda_superior": "integer NOT NULL DEFAULT 0",
    "cesta_indeferida_kit_escolar": "integer NOT NULL DEFAULT 0",
    "cesta_indeferida_renda_pro_pao": "integer NOT NULL DEFAULT 0",
    "cesta_indeferida_ninguem_local": "integer NOT NULL DEFAULT 0",
    "cesta_indeferida_nao_localizado": "integer NOT NULL DEFAULT 0",
    "cesta_indeferida_nao_reside": "integer NOT NULL DEFAULT 0",
    "busao_atendimentos": "integer NOT NULL DEFAULT 0",
    "busao_procedimentos": "integer NOT NULL DEFAULT 0",
}


def ensure_seed_data(cursor):
    cursor.execute(
        """
        INSERT OR IGNORE INTO core_systemsetting (key, value, description)
        VALUES
        ('system_name', 'Plataforma de Vigilancia Socioassistencial', 'Nome do sistema'),
        ('system_reference_year', '2026', 'Ano de referencia visual')
        """
    )

    cursor.execute(
        "SELECT id FROM directorates_directorate WHERE name = ?",
        ("Beneficios Socioassistenciais",),
    )
    row = cursor.fetchone()
    if row:
        return row[0]

    directorate_id = uuid.uuid4().hex
    cursor.execute(
        """
        INSERT INTO directorates_directorate (id, name)
        VALUES (?, ?)
        """,
        (directorate_id, "Beneficios Socioassistenciais"),
    )
    return directorate_id


def ensure_sqlite_columns(cursor, table_name, columns):
    cursor.execute(f"PRAGMA table_info({table_name})")
    existing = {row[1] for row in cursor.fetchall()}
    for column_name, column_sql in columns.items():
        if column_name not in existing:
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_sql}")


def main():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    cursor = connection.cursor()
    for statement in DDL:
        cursor.execute(statement)
    ensure_sqlite_columns(cursor, "monitorings_beneficiosreport", BENEFICIOS_EXTRA_COLUMNS)
    benefits_id = ensure_seed_data(cursor)
    connection.commit()
    connection.close()
    print(f"SQLite bootstrap concluido. Diretoria Beneficios id={benefits_id}")


if __name__ == "__main__":
    main()
