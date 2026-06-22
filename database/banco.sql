-- Banco principal do ProGames
-- Disciplina: Programacao Para Internet
-- Senha dos usuarios de teste: 123456
-- Total de jogos cadastrados no seed: 120

CREATE DATABASE IF NOT EXISTS locacao_jogos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE locacao_jogos;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS itens_emprestimo;
DROP TABLE IF EXISTS emprestimos;
DROP TABLE IF EXISTS jogos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  tipo_usuario ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL UNIQUE,
  descricao VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE jogos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(140) NOT NULL,
  descricao TEXT,
  categoria_id INT NOT NULL,
  tipo_jogo ENUM('videogame', 'boardgame') NOT NULL,
  plataforma ENUM('PS5', 'Xbox Series X|S', 'Nintendo Switch', 'Nintendo Switch 2', 'Board Game') NOT NULL,
  valor_aluguel DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estoque INT NOT NULL DEFAULT 0,
  imagem VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_jogos_categorias
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT ck_jogos_valor CHECK (valor_aluguel >= 0),
  CONSTRAINT ck_jogos_estoque CHECK (estoque >= 0)
) ENGINE=InnoDB;

CREATE TABLE emprestimos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  data_emprestimo DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_prevista_devolucao DATE NOT NULL,
  data_devolucao_real DATETIME NULL,
  status ENUM('pendente', 'aprovado', 'retirado', 'devolvido', 'cancelado', 'atrasado') NOT NULL DEFAULT 'pendente',
  dias_aluguel INT NOT NULL DEFAULT 1,
  desconto DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  observacoes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_emprestimos_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT ck_emprestimos_dias CHECK (dias_aluguel >= 1),
  CONSTRAINT ck_emprestimos_desconto CHECK (desconto >= 0),
  CONSTRAINT ck_emprestimos_valor CHECK (valor_total >= 0)
) ENGINE=InnoDB;

CREATE TABLE itens_emprestimo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emprestimo_id INT NOT NULL,
  jogo_id INT NOT NULL,
  quantidade INT NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_itens_emprestimos
    FOREIGN KEY (emprestimo_id) REFERENCES emprestimos(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_itens_jogos
    FOREIGN KEY (jogo_id) REFERENCES jogos(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT ck_itens_quantidade CHECK (quantidade > 0),
  CONSTRAINT ck_itens_valor CHECK (valor_unitario >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_jogos_categoria ON jogos(categoria_id);
CREATE INDEX idx_jogos_titulo ON jogos(titulo);
CREATE INDEX idx_jogos_tipo ON jogos(tipo_jogo);
CREATE INDEX idx_jogos_plataforma ON jogos(plataforma);
CREATE INDEX idx_emprestimos_usuario ON emprestimos(usuario_id);
CREATE INDEX idx_emprestimos_status ON emprestimos(status);
CREATE INDEX idx_emprestimos_devolucao ON emprestimos(data_prevista_devolucao);
CREATE INDEX idx_itens_jogo ON itens_emprestimo(jogo_id);

INSERT INTO usuarios (nome, email, senha, telefone, tipo_usuario) VALUES
('Administrador da Locadora', 'admin@locadora.com', '$2a$10$1pOaKgjJQCe7pu.Wl5nMKONqxz7J9.BUG3uIR6rP04tBRXjyWty26', '(12) 99999-0001', 'admin'),
('Usuario Teste', 'usuario@locadora.com', '$2a$10$1pOaKgjJQCe7pu.Wl5nMKONqxz7J9.BUG3uIR6rP04tBRXjyWty26', '(12) 98888-1010', 'usuario');

INSERT INTO categorias (nome, descricao) VALUES
('RPG', 'Jogos com evolucao de personagem e narrativa.'),
('Acao', 'Jogos de combate, reflexo e progressao intensa.'),
('Aventura', 'Jogos com exploracao, missoes e historia.'),
('Corrida', 'Jogos de velocidade, pistas e competicao.'),
('Estrategia', 'Jogos de planejamento e tomada de decisao.'),
('Terror', 'Jogos de suspense, tensao e sobrevivencia.'),
('Coop', 'Jogos focados em cooperacao entre jogadores.'),
('Party Game', 'Jogos rapidos para grupos e festas.'),
('FPS', 'Jogos de tiro em primeira pessoa.'),
('Simulacao', 'Jogos que simulam atividades reais ou sistemas.'),
('Familia', 'Jogos acessiveis para todas as idades.'),
('Cartas', 'Jogos baseados em cartas, blefe ou colecao.'),
('Puzzle', 'Jogos de raciocinio, logica e desafios.'),
('Esporte', 'Jogos esportivos e competitivos.'),
('Survival', 'Jogos de sobrevivencia e gerenciamento de recursos.'),
('Soulslike', 'Jogos de alto desafio inspirados em Souls.'),
('Mundo Aberto', 'Jogos com exploracao livre e mapas amplos.'),
('Plataforma', 'Jogos de salto, fases e precisao.'),
('Roguelike', 'Jogos com progressao procedural e repeticao.'),
('Hack and Slash', 'Jogos de combate corpo a corpo intenso.');

INSERT INTO jogos
(titulo, descricao, categoria_id, tipo_jogo, plataforma, valor_aluguel, estoque, imagem)
VALUES
('God of War Ragnarok', 'Kratos e Atreus enfrentam uma jornada nordica epica.', 2, 'videogame', 'PS5', 12.90, 5, 'god_of_war_ragnarok_ps5.jpg'),
('Marvel Spider-Man 2', 'Peter e Miles protegem Nova York contra novas ameacas.', 2, 'videogame', 'PS5', 13.90, 4, 'marvel_spider_man_2_ps5.jpg'),
('Demon''s Souls', 'Remake soulslike com combate preciso e atmosfera sombria.', 16, 'videogame', 'PS5', 11.90, 3, 'demon_s_souls_ps5.jpg'),
('Ratchet and Clank Rift Apart', 'Aventura de plataforma com dimensoes e muita acao.', 18, 'videogame', 'PS5', 10.90, 4, 'ratchet_and_clank_rift_apart_ps5.jpg'),
('Returnal', 'Roguelike de ficcao cientifica com combate acelerado.', 19, 'videogame', 'PS5', 11.90, 3, 'returnal_ps5.jpg'),
('Astro Bot', 'Plataforma criativo com fases coloridas e acessiveis.', 18, 'videogame', 'PS5', 12.90, 5, 'astro_bot_ps5.jpg'),
('Halo Infinite', 'Master Chief retorna em campanha sci-fi e multiplayer.', 9, 'videogame', 'Xbox Series X|S', 9.90, 5, 'halo_infinite_xbox_series_x_s.jpg'),
('Forza Horizon 5', 'Corridas em mundo aberto com carros e paisagens variadas.', 4, 'videogame', 'Xbox Series X|S', 10.90, 6, 'forza_horizon_5_xbox_series_x_s.jpg'),
('Starfield', 'RPG espacial de exploracao, naves e escolhas.', 1, 'videogame', 'Xbox Series X|S', 11.90, 4, 'starfield_xbox_series_x_s.jpg'),
('Gears 5', 'Acao tatica com cobertura, campanha e modo cooperativo.', 2, 'videogame', 'Xbox Series X|S', 9.90, 4, 'gears_5_xbox_series_x_s.jpg'),
('Microsoft Flight Simulator', 'Simulador de voo com rotas e aeronaves detalhadas.', 10, 'videogame', 'Xbox Series X|S', 12.90, 3, 'microsoft_flight_simulator_xbox_series_x_s.jpg'),
('Avowed', 'RPG de fantasia em primeira pessoa no universo de Eora.', 1, 'videogame', 'Xbox Series X|S', 12.90, 3, 'avowed_xbox_series_x_s.jpg'),
('Zelda Breath of the Wild', 'Aventura em Hyrule com exploracao livre e fisica criativa.', 17, 'videogame', 'Nintendo Switch', 11.90, 4, 'zelda_breath_of_the_wild_nintendo_switch.jpg'),
('Zelda Tears of the Kingdom', 'Nova jornada por Hyrule com construcao e ilhas celestes.', 17, 'videogame', 'Nintendo Switch', 12.90, 5, 'zelda_tears_of_the_kingdom_nintendo_switch.jpg'),
('Mario Kart 8 Deluxe', 'Corridas arcade com itens, pistas classicas e multiplayer.', 4, 'videogame', 'Nintendo Switch', 9.90, 7, 'mario_kart_8_deluxe_nintendo_switch.jpg'),
('Super Mario Odyssey', 'Plataforma 3D com mundos variados e mecanicas criativas.', 18, 'videogame', 'Nintendo Switch', 9.90, 5, 'super_mario_odyssey_nintendo_switch.jpg'),
('Smash Bros Ultimate', 'Luta party com elenco enorme e partidas locais.', 8, 'videogame', 'Nintendo Switch', 10.90, 4, 'smash_bros_ultimate_nintendo_switch.jpg'),
('Animal Crossing New Horizons', 'Simulacao relaxante de ilha, decoracao e rotina.', 10, 'videogame', 'Nintendo Switch', 8.90, 5, 'animal_crossing_new_horizons_nintendo_switch.jpg'),
('Splatoon 3', 'Tiro colorido em arena com equipes e tinta.', 9, 'videogame', 'Nintendo Switch', 9.90, 4, 'splatoon_3_nintendo_switch.jpg'),
('Pokemon Scarlet Violet', 'RPG de criaturas em mundo aberto escolar.', 1, 'videogame', 'Nintendo Switch', 10.90, 4, 'pokemon_scarlet_violet_nintendo_switch.jpg'),
('Mario Kart World', 'Corrida arcade em mundo integrado com novos circuitos.', 4, 'videogame', 'Nintendo Switch 2', 14.90, 4, 'mario_kart_world_nintendo_switch_2.jpg'),
('Donkey Kong Bananza', 'Aventura de plataforma com exploracao e destruicao de cenario.', 18, 'videogame', 'Nintendo Switch 2', 13.90, 3, 'donkey_kong_bananza_nintendo_switch_2.jpg'),
('Metroid Prime 4 Beyond', 'Aventura sci-fi em primeira pessoa com exploracao e combate.', 3, 'videogame', 'Nintendo Switch 2', 14.90, 3, 'metroid_prime_4_beyond_nintendo_switch_2.jpg'),
('Kirby Air Riders', 'Corrida leve e competitiva no universo Kirby.', 4, 'videogame', 'Nintendo Switch 2', 12.90, 4, 'kirby_air_riders_nintendo_switch_2.jpg'),
('Zelda Echoes of Wisdom', 'Aventura de puzzle com Zelda em papel principal.', 13, 'videogame', 'Nintendo Switch 2', 12.90, 3, 'zelda_echoes_of_wisdom_nintendo_switch_2.jpg'),
('Catan', 'Construa colonias, negocie recursos e dispute territorios.', 5, 'boardgame', 'Board Game', 7.90, 6, 'catan_board_game.jpg'),
('Ticket to Ride', 'Monte rotas ferroviarias e conecte cidades no mapa.', 11, 'boardgame', 'Board Game', 7.90, 5, 'ticket_to_ride_board_game.jpg'),
('Dixit', 'Jogo de interpretacao visual com cartas ilustradas.', 8, 'boardgame', 'Board Game', 6.90, 5, 'dixit_board_game.jpg'),
('Uno', 'Cartas rapidas com cores, numeros e viradas inesperadas.', 12, 'boardgame', 'Board Game', 4.90, 10, 'uno_board_game.jpg'),
('Monopoly', 'Compra de propriedades, aluguel e negociacao familiar.', 11, 'boardgame', 'Board Game', 6.90, 4, 'monopoly_board_game.jpg'),
('War', 'Conquista de territorios com estrategia e dados.', 5, 'boardgame', 'Board Game', 7.90, 4, 'war_board_game.jpg'),
('Pandemic', 'Cooperativo para conter surtos globais de doencas.', 7, 'boardgame', 'Board Game', 8.90, 3, 'pandemic_board_game.jpg'),
('Azul', 'Puzzle abstrato com azulejos e pontuacao estrategica.', 13, 'boardgame', 'Board Game', 7.90, 4, 'azul_board_game.jpg'),
('Coup', 'Blefe rapido com personagens e eliminacao social.', 12, 'boardgame', 'Board Game', 5.90, 6, 'coup_board_game.jpg'),
('Terraforming Mars', 'Estrategia pesada para colonizar e transformar Marte.', 5, 'boardgame', 'Board Game', 11.90, 2, 'terraforming_mars_board_game.jpg'),
('Carcassonne', 'Colocacao de pecas e controle de cidades medievais.', 5, 'boardgame', 'Board Game', 6.90, 5, 'carcassonne_board_game.jpg'),
('Exploding Kittens', 'Cartas caoticas com risco, sorte e sabotagem.', 12, 'boardgame', 'Board Game', 5.90, 7, 'exploding_kittens_board_game.jpg'),
('Root', 'Estrategia assimetrica com faccoes e controle de mapa.', 5, 'boardgame', 'Board Game', 10.90, 2, 'root_board_game.jpg'),
('Gloomhaven', 'Campanha cooperativa com combate tatico e narrativa.', 1, 'boardgame', 'Board Game', 15.90, 1, 'gloomhaven_board_game.jpg'),
('7 Wonders', 'Construa civilizacoes por cartas e escolhas simultaneas.', 12, 'boardgame', 'Board Game', 8.90, 4, '7_wonders_board_game.jpg'),
('Risk', 'Conquista mundial com dados, tropas e aliancas.', 5, 'boardgame', 'Board Game', 7.90, 4, 'risk_board_game.jpg'),
('Banco Imobiliario', 'Classico nacional de compra, venda e alugueis.', 11, 'boardgame', 'Board Game', 6.90, 5, 'banco_imobiliario_board_game.jpg'),
('Jenga', 'Habilidade manual removendo blocos da torre.', 8, 'boardgame', 'Board Game', 4.90, 8, 'jenga_board_game.jpg'),
('Detetive', 'Investigacao classica para descobrir crime e culpado.', 13, 'boardgame', 'Board Game', 6.90, 4, 'detetive_board_game.jpg'),
('Coup Rebellion', 'Versao expandida de blefe com papeis variaveis.', 12, 'boardgame', 'Board Game', 5.90, 3, 'coup_rebellion_board_game.jpg'),
('Elden Ring', 'RPG soulslike em mundo aberto com chefes memoraveis.', 16, 'videogame', 'PS5', 12.90, 5, 'elden_ring_ps5.jpg'),
('Elden Ring', 'RPG soulslike em mundo aberto com chefes memoraveis.', 16, 'videogame', 'Xbox Series X|S', 11.90, 4, 'elden_ring_xbox_series_x_s.jpg'),
('Cyberpunk 2077 Ultimate Edition', 'RPG futurista em Night City com expansao inclusa.', 1, 'videogame', 'PS5', 11.90, 4, 'cyberpunk_2077_ultimate_edition_ps5.jpg'),
('Cyberpunk 2077 Ultimate Edition', 'RPG futurista em Night City com expansao inclusa.', 1, 'videogame', 'Xbox Series X|S', 10.90, 3, 'cyberpunk_2077_ultimate_edition_xbox_series_x_s.jpg'),
('Hogwarts Legacy', 'Aventura de mundo aberto no universo bruxo.', 17, 'videogame', 'PS5', 10.90, 5, 'hogwarts_legacy_ps5.jpg'),
('Hogwarts Legacy', 'Aventura de mundo aberto no universo bruxo.', 17, 'videogame', 'Xbox Series X|S', 9.90, 4, 'hogwarts_legacy_xbox_series_x_s.jpg'),
('Resident Evil 4 Remake', 'Terror de acao com Leon em resgate perigoso.', 6, 'videogame', 'PS5', 9.90, 4, 'resident_evil_4_remake_ps5.jpg'),
('Resident Evil 4 Remake', 'Terror de acao com Leon em resgate perigoso.', 6, 'videogame', 'Xbox Series X|S', 9.90, 3, 'resident_evil_4_remake_xbox_series_x_s.jpg'),
('Resident Evil Village', 'Terror em primeira pessoa com vilarejo sombrio.', 6, 'videogame', 'PS5', 9.90, 4, 'resident_evil_village_ps5.jpg'),
('Resident Evil Village', 'Terror em primeira pessoa com vilarejo sombrio.', 6, 'videogame', 'Xbox Series X|S', 8.90, 3, 'resident_evil_village_xbox_series_x_s.jpg'),
('Alan Wake 2', 'Suspense narrativo com investigacao e survival horror.', 6, 'videogame', 'PS5', 11.90, 3, 'alan_wake_2_ps5.jpg'),
('Alan Wake 2', 'Suspense narrativo com investigacao e survival horror.', 6, 'videogame', 'Xbox Series X|S', 10.90, 2, 'alan_wake_2_xbox_series_x_s.jpg'),
('Dead Space Remake', 'Survival horror espacial com atmosfera opressora.', 15, 'videogame', 'PS5', 10.90, 3, 'dead_space_remake_ps5.jpg'),
('Dead Space Remake', 'Survival horror espacial com atmosfera opressora.', 15, 'videogame', 'Xbox Series X|S', 9.90, 2, 'dead_space_remake_xbox_series_x_s.jpg'),
('Baldur''s Gate 3', 'RPG tatico com escolhas profundas e campanha cooperativa.', 1, 'videogame', 'PS5', 14.90, 4, 'baldur_s_gate_3_ps5.jpg'),
('Baldur''s Gate 3', 'RPG tatico com escolhas profundas e campanha cooperativa.', 1, 'videogame', 'Xbox Series X|S', 13.90, 3, 'baldur_s_gate_3_xbox_series_x_s.jpg'),
('Diablo IV', 'Hack and slash sombrio com loot, classes e masmorras.', 20, 'videogame', 'PS5', 10.90, 5, 'diablo_iv_ps5.jpg'),
('Diablo IV', 'Hack and slash sombrio com loot, classes e masmorras.', 20, 'videogame', 'Xbox Series X|S', 9.90, 4, 'diablo_iv_xbox_series_x_s.jpg'),
('Street Fighter 6', 'Luta competitiva com modos modernos e classicos.', 2, 'videogame', 'PS5', 8.90, 4, 'street_fighter_6_ps5.jpg'),
('Street Fighter 6', 'Luta competitiva com modos modernos e classicos.', 2, 'videogame', 'Xbox Series X|S', 7.90, 3, 'street_fighter_6_xbox_series_x_s.jpg'),
('Tekken 8', 'Luta 3D com elenco amplo e visual moderno.', 2, 'videogame', 'PS5', 8.90, 4, 'tekken_8_ps5.jpg'),
('Tekken 8', 'Luta 3D com elenco amplo e visual moderno.', 2, 'videogame', 'Xbox Series X|S', 8.90, 3, 'tekken_8_xbox_series_x_s.jpg'),
('EA Sports FC 25', 'Futebol com clubes licenciados e modos competitivos.', 14, 'videogame', 'PS5', 9.90, 6, 'ea_sports_fc_25_ps5.jpg'),
('EA Sports FC 25', 'Futebol com clubes licenciados e modos competitivos.', 14, 'videogame', 'Xbox Series X|S', 9.90, 5, 'ea_sports_fc_25_xbox_series_x_s.jpg'),
('NBA 2K25', 'Basquete com simulacao, carreira e partidas locais.', 14, 'videogame', 'PS5', 9.90, 4, 'nba_2k25_ps5.jpg'),
('NBA 2K25', 'Basquete com simulacao, carreira e partidas locais.', 14, 'videogame', 'Xbox Series X|S', 8.90, 3, 'nba_2k25_xbox_series_x_s.jpg'),
('F1 24', 'Corrida oficial de Formula 1 com pistas reais.', 4, 'videogame', 'PS5', 9.90, 4, 'f1_24_ps5.jpg'),
('F1 24', 'Corrida oficial de Formula 1 com pistas reais.', 4, 'videogame', 'Xbox Series X|S', 8.90, 3, 'f1_24_xbox_series_x_s.jpg'),
('Mortal Kombat 1', 'Luta brutal com campanha e personagens classicos.', 2, 'videogame', 'PS5', 8.90, 5, 'mortal_kombat_1_ps5.jpg'),
('Mortal Kombat 1', 'Luta brutal com campanha e personagens classicos.', 2, 'videogame', 'Xbox Series X|S', 8.90, 4, 'mortal_kombat_1_xbox_series_x_s.jpg'),
('Assassin''s Creed Mirage', 'Aventura stealth em Bagda com foco em assassinos.', 3, 'videogame', 'PS5', 9.90, 4, 'assassin_s_creed_mirage_ps5.jpg'),
('Assassin''s Creed Mirage', 'Aventura stealth em Bagda com foco em assassinos.', 3, 'videogame', 'Xbox Series X|S', 8.90, 3, 'assassin_s_creed_mirage_xbox_series_x_s.jpg'),
('Star Wars Jedi Survivor', 'Aventura de acao com sabre de luz e exploracao.', 3, 'videogame', 'PS5', 10.90, 4, 'star_wars_jedi_survivor_ps5.jpg'),
('Star Wars Jedi Survivor', 'Aventura de acao com sabre de luz e exploracao.', 3, 'videogame', 'Xbox Series X|S', 9.90, 3, 'star_wars_jedi_survivor_xbox_series_x_s.jpg'),
('Like a Dragon Infinite Wealth', 'RPG urbano com humor, turnos e historia extensa.', 1, 'videogame', 'PS5', 11.90, 3, 'like_a_dragon_infinite_wealth_ps5.jpg'),
('Like a Dragon Infinite Wealth', 'RPG urbano com humor, turnos e historia extensa.', 1, 'videogame', 'Xbox Series X|S', 10.90, 2, 'like_a_dragon_infinite_wealth_xbox_series_x_s.jpg'),
('Persona 3 Reload', 'RPG escolar com dungeons e lacos sociais.', 1, 'videogame', 'PS5', 10.90, 4, 'persona_3_reload_ps5.jpg'),
('Persona 3 Reload', 'RPG escolar com dungeons e lacos sociais.', 1, 'videogame', 'Xbox Series X|S', 9.90, 3, 'persona_3_reload_xbox_series_x_s.jpg'),
('Metaphor ReFantazio', 'RPG de fantasia com combate por turnos e politica.', 1, 'videogame', 'PS5', 12.90, 3, 'metaphor_refantazio_ps5.jpg'),
('Metaphor ReFantazio', 'RPG de fantasia com combate por turnos e politica.', 1, 'videogame', 'Xbox Series X|S', 11.90, 2, 'metaphor_refantazio_xbox_series_x_s.jpg'),
('Monster Hunter Wilds', 'Cace monstros gigantes em biomas dinamicos.', 7, 'videogame', 'PS5', 13.90, 4, 'monster_hunter_wilds_ps5.jpg'),
('Monster Hunter Wilds', 'Cace monstros gigantes em biomas dinamicos.', 7, 'videogame', 'Xbox Series X|S', 12.90, 3, 'monster_hunter_wilds_xbox_series_x_s.jpg'),
('Doom The Dark Ages', 'FPS pesado com combate rapido e fantasia sombria.', 9, 'videogame', 'PS5', 12.90, 4, 'doom_the_dark_ages_ps5.jpg'),
('Doom The Dark Ages', 'FPS pesado com combate rapido e fantasia sombria.', 9, 'videogame', 'Xbox Series X|S', 12.90, 3, 'doom_the_dark_ages_xbox_series_x_s.jpg'),
('Call of Duty Black Ops 6', 'FPS militar com campanha, zombies e multiplayer.', 9, 'videogame', 'PS5', 11.90, 6, 'call_of_duty_black_ops_6_ps5.jpg'),
('Call of Duty Black Ops 6', 'FPS militar com campanha, zombies e multiplayer.', 9, 'videogame', 'Xbox Series X|S', 10.90, 5, 'call_of_duty_black_ops_6_xbox_series_x_s.jpg'),
('Minecraft', 'Sandbox de construcao, exploracao e sobrevivencia.', 15, 'videogame', 'PS5', 6.90, 8, 'minecraft_ps5.jpg'),
('Minecraft', 'Sandbox de construcao, exploracao e sobrevivencia.', 15, 'videogame', 'Xbox Series X|S', 6.90, 7, 'minecraft_xbox_series_x_s.jpg'),
('Palworld', 'Survival com criaturas, construcao e cooperacao.', 15, 'videogame', 'PS5', 9.90, 4, 'palworld_ps5.jpg'),
('Palworld', 'Survival com criaturas, construcao e cooperacao.', 15, 'videogame', 'Xbox Series X|S', 8.90, 3, 'palworld_xbox_series_x_s.jpg'),
('Hades', 'Roguelike mitologico com combate rapido e narrativa.', 19, 'videogame', 'Nintendo Switch', 7.90, 5, 'hades_nintendo_switch.jpg'),
('Celeste', 'Plataforma de precisao com historia sensivel.', 18, 'videogame', 'Nintendo Switch', 5.90, 5, 'celeste_nintendo_switch.jpg'),
('Stardew Valley', 'Simulacao rural com fazenda, minas e amizades.', 10, 'videogame', 'Nintendo Switch', 5.90, 6, 'stardew_valley_nintendo_switch.jpg'),
('Overcooked 2', 'Coop caotico de cozinha para ate quatro jogadores.', 7, 'videogame', 'Nintendo Switch', 6.90, 6, 'overcooked_2_nintendo_switch.jpg'),
('Mario Party Superstars', 'Party game com tabuleiros e minigames classicos.', 8, 'videogame', 'Nintendo Switch', 8.90, 5, 'mario_party_superstars_nintendo_switch.jpg'),
('Luigi''s Mansion 3', 'Aventura de caca-fantasmas em hotel assombrado.', 3, 'videogame', 'Nintendo Switch', 8.90, 4, 'luigi_s_mansion_3_nintendo_switch.jpg'),
('Fire Emblem Engage', 'Estrategia tatica com batalhas por turnos.', 5, 'videogame', 'Nintendo Switch', 9.90, 3, 'fire_emblem_engage_nintendo_switch.jpg'),
('Xenoblade Chronicles 3', 'JRPG de mundo amplo com grupos e narrativa epica.', 1, 'videogame', 'Nintendo Switch', 9.90, 3, 'xenoblade_chronicles_3_nintendo_switch.jpg'),
('Metroid Dread', 'Acao e exploracao 2D com clima de perseguicao.', 3, 'videogame', 'Nintendo Switch', 8.90, 4, 'metroid_dread_nintendo_switch.jpg'),
('Kirby and the Forgotten Land', 'Plataforma 3D leve com fases coloridas.', 18, 'videogame', 'Nintendo Switch', 8.90, 5, 'kirby_and_the_forgotten_land_nintendo_switch.jpg'),
('Pikmin 4', 'Estrategia e puzzle com pequenas criaturas ajudantes.', 5, 'videogame', 'Nintendo Switch', 8.90, 4, 'pikmin_4_nintendo_switch.jpg'),
('Bayonetta 3', 'Hack and slash estiloso com combate extravagante.', 20, 'videogame', 'Nintendo Switch', 9.90, 3, 'bayonetta_3_nintendo_switch.jpg'),
('Octopath Traveler II', 'RPG em HD-2D com oito protagonistas.', 1, 'videogame', 'Nintendo Switch', 8.90, 4, 'octopath_traveler_ii_nintendo_switch.jpg'),
('Hollow Knight', 'Metroidvania desafiador com mundo subterraneo.', 18, 'videogame', 'Nintendo Switch', 6.90, 5, 'hollow_knight_nintendo_switch.jpg'),
('Sea of Stars', 'RPG inspirado em classicos com combate por turnos.', 1, 'videogame', 'Nintendo Switch', 6.90, 4, 'sea_of_stars_nintendo_switch.jpg'),
('Prince of Persia The Lost Crown', 'Plataforma de acao com exploracao e combate fluido.', 18, 'videogame', 'Nintendo Switch', 7.90, 4, 'prince_of_persia_the_lost_crown_nintendo_switch.jpg'),
('Sonic Superstars', 'Plataforma 2D com velocidade e multiplayer local.', 18, 'videogame', 'Nintendo Switch', 6.90, 4, 'sonic_superstars_nintendo_switch.jpg'),
('Minecraft Dungeons', 'Acao cooperativa com loot em estilo dungeon crawler.', 7, 'videogame', 'Nintendo Switch', 6.90, 5, 'minecraft_dungeons_nintendo_switch.jpg'),
('Cuphead', 'Plataforma run and gun com chefes desenhados a mao.', 18, 'videogame', 'Nintendo Switch', 5.90, 5, 'cuphead_nintendo_switch.jpg'),
('Dead Cells', 'Roguelike de acao com fases e armas variadas.', 19, 'videogame', 'Nintendo Switch', 6.90, 5, 'dead_cells_nintendo_switch.jpg'),
('Slay the Spire', 'Roguelike de cartas com escolhas estrategicas.', 12, 'videogame', 'Nintendo Switch', 5.90, 5, 'slay_the_spire_nintendo_switch.jpg'),
('Among Us', 'Party game social de deducao e traicao.', 8, 'videogame', 'Nintendo Switch', 4.90, 8, 'among_us_nintendo_switch.jpg'),
('Just Dance 2025', 'Party game musical com coreografias e pontuacao.', 8, 'videogame', 'Nintendo Switch', 7.90, 5, 'just_dance_2025_nintendo_switch.jpg'),
('No Man''s Sky', 'Exploracao espacial procedural com sobrevivencia.', 15, 'videogame', 'Nintendo Switch', 8.90, 3, 'no_man_s_sky_nintendo_switch.jpg'),
('Tetris Effect Connected', 'Puzzle musical com modos solo e multiplayer.', 13, 'videogame', 'Nintendo Switch', 5.90, 4, 'tetris_effect_connected_nintendo_switch.jpg');

INSERT INTO emprestimos (usuario_id, data_emprestimo, data_prevista_devolucao, data_devolucao_real, status, dias_aluguel, desconto, valor_total, observacoes) VALUES
(2, '2026-05-12 14:20:00', '2026-05-26', NULL, 'pendente', 14, 10.00, 170.60, 'Reserva criada pelo usuario comum.'),
(2, '2026-05-01 09:40:00', '2026-05-08', '2026-05-07 17:30:00', 'devolvido', 7, 20.00, 111.60, 'Devolvido dentro do prazo.'),
(2, '2026-05-02 10:00:00', '2026-05-10', NULL, 'retirado', 8, 10.00, 69.20, 'Emprestimo retirado e aguardando devolucao.');

INSERT INTO itens_emprestimo (emprestimo_id, jogo_id, quantidade, valor_unitario) VALUES
(1, 1, 1, 12.90),
(2, 33, 1, 7.90),
(2, 91, 1, 10.90),
(3, 7, 1, 9.90);

UPDATE jogos SET estoque = estoque - 1 WHERE id IN (1, 7, 33, 91) AND estoque >= 1;


