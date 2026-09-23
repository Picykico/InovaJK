-- ============================================================
-- Banco de dados InovaJK — MySQL
-- Convenção: nomes de tabela/coluna em inglês (padrão de código);
-- os textos que o usuário final vê continuam em pt-BR no site/API.
-- ============================================================

CREATE DATABASE IF NOT EXISTS inovajk_db;
USE inovajk_db;

-- ------------------------------------------------------------
-- CLIENTES (quem leva equipamento pra manutenção/suporte)
-- Correspondia à tabela "users" do rascunho original.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cpf VARCHAR(14) UNIQUE,
    cnpj VARCHAR(18) UNIQUE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- EQUIPAMENTOS
-- Criada ANTES de service_orders (no rascunho original vinha depois,
-- o que quebraria a foreign key em MySQL).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- ------------------------------------------------------------
-- ORDENS DE SERVIÇO (SO)
-- Corrigido: equipment_id agora é INT (era TEXT, não batia com
-- o tipo de equipment.id) e budget virou DECIMAL (REAL/FLOAT
-- causa erro de arredondamento em valores monetários).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    equipment_id INT NOT NULL,
    service VARCHAR(255) NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,

    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- ------------------------------------------------------------
-- ADMINS (equipe que gerencia o conteúdo do site — separado dos clients)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- CURSOS (conteúdo editável pelo admin)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- ESTAGIÁRIOS (atual/histórico, editável pelo admin)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    course VARCHAR(100),
    photo_url VARCHAR(255),
    start_date DATE,
    end_date DATE NULL,
    projects TEXT,
    skills VARCHAR(255),
    portfolio_url VARCHAR(255),
    contact_url VARCHAR(255),
    status ENUM('CURRENT', 'FORMER') NOT NULL DEFAULT 'CURRENT'
);

-- ------------------------------------------------------------
-- MENSAGENS DE CONTATO (vindas do formulário do site)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(100),
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

-- ------------------------------------------------------------
-- LOGS DE ACESSO (auditoria de login do admin)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS access_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    success BOOLEAN NOT NULL,

    FOREIGN KEY (admin_id) REFERENCES admins(id)
);
