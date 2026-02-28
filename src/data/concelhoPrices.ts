// Preços médios por m² em Portugal por concelho (valores aproximados de 2024)
// Fonte: Dados de referência do mercado imobiliário português

export interface ConcelhoPriceData {
  avg: number;
  min: number;
  max: number;
}

// Preços base por distrito para concelhos sem dados específicos
const districtBasePrices: Record<string, ConcelhoPriceData> = {
  "Aveiro": { avg: 1450, min: 900, max: 2200 },
  "Beja": { avg: 750, min: 450, max: 1100 },
  "Braga": { avg: 1400, min: 850, max: 2100 },
  "Bragança": { avg: 650, min: 400, max: 950 },
  "Castelo Branco": { avg: 700, min: 450, max: 1000 },
  "Coimbra": { avg: 1300, min: 800, max: 1900 },
  "Évora": { avg: 1100, min: 700, max: 1600 },
  "Faro": { avg: 2800, min: 1500, max: 4500 },
  "Guarda": { avg: 600, min: 380, max: 900 },
  "Leiria": { avg: 1200, min: 750, max: 1800 },
  "Lisboa": { avg: 4200, min: 2500, max: 7000 },
  "Portalegre": { avg: 650, min: 400, max: 950 },
  "Porto": { avg: 2800, min: 1600, max: 4200 },
  "Santarém": { avg: 950, min: 600, max: 1400 },
  "Setúbal": { avg: 2200, min: 1300, max: 3500 },
  "Viana do Castelo": { avg: 1200, min: 750, max: 1800 },
  "Vila Real": { avg: 750, min: 480, max: 1100 },
  "Viseu": { avg: 850, min: 550, max: 1250 },
  "Açores": { avg: 1100, min: 700, max: 1600 },
  "Madeira": { avg: 1800, min: 1100, max: 2800 },
};

// Preços específicos por concelho (concelhos com dados mais precisos)
const concelhoPrices: Record<string, ConcelhoPriceData> = {
  // Lisboa
  "Lisboa": { avg: 5200, min: 3500, max: 8500 },
  "Cascais": { avg: 4800, min: 3200, max: 7500 },
  "Oeiras": { avg: 4200, min: 2800, max: 6500 },
  "Sintra": { avg: 2800, min: 1800, max: 4200 },
  "Amadora": { avg: 2600, min: 1700, max: 3800 },
  "Loures": { avg: 2400, min: 1600, max: 3600 },
  "Odivelas": { avg: 2700, min: 1800, max: 4000 },
  "Mafra": { avg: 2200, min: 1400, max: 3400 },
  "Vila Franca de Xira": { avg: 1900, min: 1200, max: 2900 },
  "Torres Vedras": { avg: 1600, min: 1000, max: 2400 },
  "Alenquer": { avg: 1400, min: 900, max: 2100 },
  "Arruda dos Vinhos": { avg: 1500, min: 950, max: 2200 },
  "Azambuja": { avg: 1300, min: 850, max: 1900 },
  "Cadaval": { avg: 1100, min: 700, max: 1600 },
  "Lourinhã": { avg: 1500, min: 950, max: 2200 },
  "Sobral de Monte Agraço": { avg: 1300, min: 850, max: 1900 },
  
  // Porto
  "Porto": { avg: 3800, min: 2500, max: 5800 },
  "Matosinhos": { avg: 3200, min: 2100, max: 4800 },
  "Vila Nova de Gaia": { avg: 2800, min: 1800, max: 4200 },
  "Maia": { avg: 2400, min: 1600, max: 3600 },
  "Gondomar": { avg: 2000, min: 1300, max: 3000 },
  "Valongo": { avg: 1800, min: 1200, max: 2700 },
  "Póvoa de Varzim": { avg: 2200, min: 1400, max: 3300 },
  "Vila do Conde": { avg: 2000, min: 1300, max: 3000 },
  "Santo Tirso": { avg: 1400, min: 900, max: 2100 },
  "Trofa": { avg: 1500, min: 1000, max: 2200 },
  "Paredes": { avg: 1300, min: 850, max: 1950 },
  "Penafiel": { avg: 1200, min: 800, max: 1800 },
  "Paços de Ferreira": { avg: 1100, min: 700, max: 1650 },
  "Lousada": { avg: 1050, min: 700, max: 1550 },
  "Felgueiras": { avg: 1000, min: 650, max: 1500 },
  "Marco de Canaveses": { avg: 950, min: 600, max: 1400 },
  "Amarante": { avg: 1100, min: 700, max: 1650 },
  "Baião": { avg: 900, min: 580, max: 1350 },
  
  // Setúbal
  "Almada": { avg: 3000, min: 2000, max: 4500 },
  "Seixal": { avg: 2400, min: 1600, max: 3600 },
  "Barreiro": { avg: 2000, min: 1300, max: 3000 },
  "Moita": { avg: 1800, min: 1200, max: 2700 },
  "Montijo": { avg: 1900, min: 1250, max: 2850 },
  "Alcochete": { avg: 2200, min: 1450, max: 3300 },
  "Setúbal": { avg: 2100, min: 1400, max: 3150 },
  "Palmela": { avg: 1800, min: 1200, max: 2700 },
  "Sesimbra": { avg: 2500, min: 1650, max: 3750 },
  "Grândola": { avg: 2000, min: 1300, max: 3000 },
  "Santiago do Cacém": { avg: 1400, min: 900, max: 2100 },
  "Sines": { avg: 1600, min: 1050, max: 2400 },
  "Alcácer do Sal": { avg: 1300, min: 850, max: 1950 },
  
  // Faro (Algarve)
  "Faro": { avg: 2600, min: 1700, max: 3900 },
  "Albufeira": { avg: 3500, min: 2300, max: 5250 },
  "Lagos": { avg: 3800, min: 2500, max: 5700 },
  "Portimão": { avg: 3200, min: 2100, max: 4800 },
  "Loulé": { avg: 3400, min: 2250, max: 5100 },
  "Tavira": { avg: 2800, min: 1850, max: 4200 },
  "Silves": { avg: 2400, min: 1600, max: 3600 },
  "Lagoa": { avg: 3300, min: 2200, max: 4950 },
  "Vila Real de Santo António": { avg: 2200, min: 1450, max: 3300 },
  "Olhão": { avg: 2400, min: 1600, max: 3600 },
  "São Brás de Alportel": { avg: 2000, min: 1300, max: 3000 },
  "Castro Marim": { avg: 1800, min: 1200, max: 2700 },
  "Monchique": { avg: 1600, min: 1050, max: 2400 },
  "Alcoutim": { avg: 1200, min: 800, max: 1800 },
  "Aljezur": { avg: 2600, min: 1700, max: 3900 },
  "Vila do Bispo": { avg: 2800, min: 1850, max: 4200 },
  
  // Braga
  "Braga": { avg: 1800, min: 1200, max: 2700 },
  "Guimarães": { avg: 1500, min: 1000, max: 2250 },
  "Vila Nova de Famalicão": { avg: 1400, min: 920, max: 2100 },
  "Barcelos": { avg: 1200, min: 800, max: 1800 },
  "Fafe": { avg: 1100, min: 720, max: 1650 },
  "Vizela": { avg: 1150, min: 760, max: 1725 },
  "Esposende": { avg: 1600, min: 1050, max: 2400 },
  "Vila Verde": { avg: 1000, min: 650, max: 1500 },
  "Amares": { avg: 1050, min: 690, max: 1575 },
  "Póvoa de Lanhoso": { avg: 950, min: 620, max: 1425 },
  "Vieira do Minho": { avg: 850, min: 560, max: 1275 },
  "Terras de Bouro": { avg: 900, min: 590, max: 1350 },
  "Cabeceiras de Basto": { avg: 800, min: 520, max: 1200 },
  "Celorico de Basto": { avg: 750, min: 490, max: 1125 },
  
  // Coimbra
  "Coimbra": { avg: 1600, min: 1050, max: 2400 },
  "Figueira da Foz": { avg: 1400, min: 920, max: 2100 },
  "Cantanhede": { avg: 1100, min: 720, max: 1650 },
  "Lousã": { avg: 1200, min: 790, max: 1800 },
  "Condeixa-a-Nova": { avg: 1300, min: 860, max: 1950 },
  "Montemor-o-Velho": { avg: 1000, min: 660, max: 1500 },
  "Mira": { avg: 1050, min: 690, max: 1575 },
  "Penacova": { avg: 900, min: 590, max: 1350 },
  "Miranda do Corvo": { avg: 950, min: 625, max: 1425 },
  "Penela": { avg: 850, min: 560, max: 1275 },
  "Soure": { avg: 900, min: 590, max: 1350 },
  "Oliveira do Hospital": { avg: 800, min: 520, max: 1200 },
  "Tábua": { avg: 750, min: 490, max: 1125 },
  "Arganil": { avg: 700, min: 460, max: 1050 },
  "Góis": { avg: 650, min: 430, max: 975 },
  "Vila Nova de Poiares": { avg: 850, min: 560, max: 1275 },
  "Pampilhosa da Serra": { avg: 550, min: 360, max: 825 },
  
  // Aveiro
  "Aveiro": { avg: 1800, min: 1180, max: 2700 },
  "Ílhavo": { avg: 1500, min: 990, max: 2250 },
  "Espinho": { avg: 1900, min: 1250, max: 2850 },
  "Ovar": { avg: 1400, min: 920, max: 2100 },
  "Santa Maria da Feira": { avg: 1300, min: 860, max: 1950 },
  "São João da Madeira": { avg: 1350, min: 890, max: 2025 },
  "Oliveira de Azeméis": { avg: 1100, min: 720, max: 1650 },
  "Vale de Cambra": { avg: 1000, min: 660, max: 1500 },
  "Estarreja": { avg: 1150, min: 760, max: 1725 },
  "Murtosa": { avg: 1200, min: 790, max: 1800 },
  "Águeda": { avg: 1100, min: 720, max: 1650 },
  "Albergaria-a-Velha": { avg: 1050, min: 690, max: 1575 },
  "Anadia": { avg: 950, min: 625, max: 1425 },
  "Mealhada": { avg: 1000, min: 660, max: 1500 },
  "Oliveira do Bairro": { avg: 1000, min: 660, max: 1500 },
  "Vagos": { avg: 1100, min: 720, max: 1650 },
  "Sever do Vouga": { avg: 850, min: 560, max: 1275 },
  "Arouca": { avg: 800, min: 520, max: 1200 },
  "Castelo de Paiva": { avg: 750, min: 490, max: 1125 },
  
  // Leiria
  "Leiria": { avg: 1500, min: 990, max: 2250 },
  "Marinha Grande": { avg: 1300, min: 860, max: 1950 },
  "Caldas da Rainha": { avg: 1400, min: 920, max: 2100 },
  "Alcobaça": { avg: 1200, min: 790, max: 1800 },
  "Nazaré": { avg: 1600, min: 1050, max: 2400 },
  "Peniche": { avg: 1500, min: 990, max: 2250 },
  "Óbidos": { avg: 1800, min: 1180, max: 2700 },
  "Bombarral": { avg: 1100, min: 720, max: 1650 },
  "Pombal": { avg: 1000, min: 660, max: 1500 },
  "Batalha": { avg: 1100, min: 720, max: 1650 },
  "Porto de Mós": { avg: 950, min: 625, max: 1425 },
  "Ansião": { avg: 800, min: 520, max: 1200 },
  "Alvaiázere": { avg: 700, min: 460, max: 1050 },
  "Figueiró dos Vinhos": { avg: 750, min: 490, max: 1125 },
  "Castanheira de Pêra": { avg: 650, min: 430, max: 975 },
  "Pedrógão Grande": { avg: 700, min: 460, max: 1050 },
  
  // Évora
  "Évora": { avg: 1400, min: 920, max: 2100 },
  "Estremoz": { avg: 1000, min: 660, max: 1500 },
  "Borba": { avg: 950, min: 625, max: 1425 },
  "Vila Viçosa": { avg: 900, min: 590, max: 1350 },
  "Reguengos de Monsaraz": { avg: 1100, min: 720, max: 1650 },
  "Montemor-o-Novo": { avg: 1000, min: 660, max: 1500 },
  "Vendas Novas": { avg: 1100, min: 720, max: 1650 },
  "Arraiolos": { avg: 900, min: 590, max: 1350 },
  "Redondo": { avg: 850, min: 560, max: 1275 },
  "Alandroal": { avg: 800, min: 520, max: 1200 },
  "Mora": { avg: 750, min: 490, max: 1125 },
  "Mourão": { avg: 700, min: 460, max: 1050 },
  "Portel": { avg: 750, min: 490, max: 1125 },
  "Viana do Alentejo": { avg: 800, min: 520, max: 1200 },
  
  // Santarém
  "Santarém": { avg: 1200, min: 790, max: 1800 },
  "Tomar": { avg: 1100, min: 720, max: 1650 },
  "Ourém": { avg: 1000, min: 660, max: 1500 },
  "Torres Novas": { avg: 950, min: 625, max: 1425 },
  "Abrantes": { avg: 900, min: 590, max: 1350 },
  "Entroncamento": { avg: 1100, min: 720, max: 1650 },
  "Cartaxo": { avg: 1050, min: 690, max: 1575 },
  "Almeirim": { avg: 1000, min: 660, max: 1500 },
  "Rio Maior": { avg: 950, min: 625, max: 1425 },
  "Benavente": { avg: 1300, min: 860, max: 1950 },
  "Coruche": { avg: 900, min: 590, max: 1350 },
  "Salvaterra de Magos": { avg: 950, min: 625, max: 1425 },
  "Alcanena": { avg: 850, min: 560, max: 1275 },
  "Chamusca": { avg: 750, min: 490, max: 1125 },
  "Golegã": { avg: 800, min: 520, max: 1200 },
  "Alpiarça": { avg: 850, min: 560, max: 1275 },
  "Constância": { avg: 800, min: 520, max: 1200 },
  "Ferreira do Zêzere": { avg: 700, min: 460, max: 1050 },
  "Mação": { avg: 650, min: 430, max: 975 },
  "Sardoal": { avg: 650, min: 430, max: 975 },
  "Vila Nova da Barquinha": { avg: 850, min: 560, max: 1275 },
  
  // Viana do Castelo
  "Viana do Castelo": { avg: 1500, min: 990, max: 2250 },
  "Ponte de Lima": { avg: 1200, min: 790, max: 1800 },
  "Caminha": { avg: 1300, min: 860, max: 1950 },
  "Vila Nova de Cerveira": { avg: 1100, min: 720, max: 1650 },
  "Valença": { avg: 1000, min: 660, max: 1500 },
  "Monção": { avg: 900, min: 590, max: 1350 },
  "Melgaço": { avg: 850, min: 560, max: 1275 },
  "Arcos de Valdevez": { avg: 900, min: 590, max: 1350 },
  "Ponte da Barca": { avg: 950, min: 625, max: 1425 },
  "Paredes de Coura": { avg: 800, min: 520, max: 1200 },
  
  // Vila Real
  "Vila Real": { avg: 1000, min: 660, max: 1500 },
  "Chaves": { avg: 900, min: 590, max: 1350 },
  "Peso da Régua": { avg: 950, min: 625, max: 1425 },
  "Lamego": { avg: 900, min: 590, max: 1350 },
  "Mesão Frio": { avg: 850, min: 560, max: 1275 },
  "Santa Marta de Penaguião": { avg: 800, min: 520, max: 1200 },
  "Sabrosa": { avg: 750, min: 490, max: 1125 },
  "Alijó": { avg: 700, min: 460, max: 1050 },
  "Murça": { avg: 650, min: 430, max: 975 },
  "Valpaços": { avg: 600, min: 390, max: 900 },
  "Vila Pouca de Aguiar": { avg: 650, min: 430, max: 975 },
  "Ribeira de Pena": { avg: 600, min: 390, max: 900 },
  "Mondim de Basto": { avg: 700, min: 460, max: 1050 },
  "Boticas": { avg: 550, min: 360, max: 825 },
  "Montalegre": { avg: 500, min: 330, max: 750 },
  
  // Viseu
  "Viseu": { avg: 1100, min: 720, max: 1650 },
  "Mangualde": { avg: 850, min: 560, max: 1275 },
  "Nelas": { avg: 800, min: 520, max: 1200 },
  "Tondela": { avg: 800, min: 520, max: 1200 },
  "Santa Comba Dão": { avg: 750, min: 490, max: 1125 },
  "Mortágua": { avg: 700, min: 460, max: 1050 },
  "Carregal do Sal": { avg: 700, min: 460, max: 1050 },
  "Oliveira de Frades": { avg: 750, min: 490, max: 1125 },
  "Vouzela": { avg: 700, min: 460, max: 1050 },
  "São Pedro do Sul": { avg: 750, min: 490, max: 1125 },
  "Castro Daire": { avg: 650, min: 430, max: 975 },
  "Cinfães": { avg: 700, min: 460, max: 1050 },
  "Resende": { avg: 750, min: 490, max: 1125 },
  "Armamar": { avg: 700, min: 460, max: 1050 },
  "Tarouca": { avg: 650, min: 430, max: 975 },
  "Moimenta da Beira": { avg: 600, min: 390, max: 900 },
  "Sernancelhe": { avg: 550, min: 360, max: 825 },
  "Penedono": { avg: 500, min: 330, max: 750 },
  "São João da Pesqueira": { avg: 650, min: 430, max: 975 },
  "Tabuaço": { avg: 600, min: 390, max: 900 },
  "Sátão": { avg: 650, min: 430, max: 975 },
  "Penalva do Castelo": { avg: 600, min: 390, max: 900 },
  
  // Guarda
  "Guarda": { avg: 800, min: 520, max: 1200 },
  "Seia": { avg: 700, min: 460, max: 1050 },
  "Gouveia": { avg: 650, min: 430, max: 975 },
  "Manteigas": { avg: 750, min: 490, max: 1125 },
  "Covilhã": { avg: 850, min: 560, max: 1275 },
  "Fundão": { avg: 750, min: 490, max: 1125 },
  "Belmonte": { avg: 700, min: 460, max: 1050 },
  "Celorico da Beira": { avg: 600, min: 390, max: 900 },
  "Fornos de Algodres": { avg: 550, min: 360, max: 825 },
  "Trancoso": { avg: 600, min: 390, max: 900 },
  "Pinhel": { avg: 550, min: 360, max: 825 },
  "Almeida": { avg: 500, min: 330, max: 750 },
  "Figueira de Castelo Rodrigo": { avg: 500, min: 330, max: 750 },
  "Mêda": { avg: 500, min: 330, max: 750 },
  "Vila Nova de Foz Côa": { avg: 550, min: 360, max: 825 },
  "Sabugal": { avg: 500, min: 330, max: 750 },
  "Aguiar da Beira": { avg: 550, min: 360, max: 825 },
  
  // Castelo Branco
  "Castelo Branco": { avg: 900, min: 590, max: 1350 },
  "Sertã": { avg: 700, min: 460, max: 1050 },
  "Proença-a-Nova": { avg: 650, min: 430, max: 975 },
  "Oleiros": { avg: 600, min: 390, max: 900 },
  "Vila de Rei": { avg: 600, min: 390, max: 900 },
  "Idanha-a-Nova": { avg: 550, min: 360, max: 825 },
  "Penamacor": { avg: 500, min: 330, max: 750 },
  "Vila Velha de Ródão": { avg: 550, min: 360, max: 825 },
  
  // Bragança
  "Bragança": { avg: 800, min: 520, max: 1200 },
  "Mirandela": { avg: 700, min: 460, max: 1050 },
  "Macedo de Cavaleiros": { avg: 600, min: 390, max: 900 },
  "Mogadouro": { avg: 550, min: 360, max: 825 },
  "Miranda do Douro": { avg: 600, min: 390, max: 900 },
  "Vimioso": { avg: 500, min: 330, max: 750 },
  "Vinhais": { avg: 550, min: 360, max: 825 },
  "Torre de Moncorvo": { avg: 600, min: 390, max: 900 },
  "Freixo de Espada à Cinta": { avg: 550, min: 360, max: 825 },
  "Vila Flor": { avg: 550, min: 360, max: 825 },
  "Carrazeda de Ansiães": { avg: 550, min: 360, max: 825 },
  "Alfândega da Fé": { avg: 500, min: 330, max: 750 },
  
  // Beja
  "Beja": { avg: 950, min: 625, max: 1425 },
  "Moura": { avg: 700, min: 460, max: 1050 },
  "Serpa": { avg: 700, min: 460, max: 1050 },
  "Mértola": { avg: 750, min: 490, max: 1125 },
  "Odemira": { avg: 1100, min: 720, max: 1650 },
  "Aljustrel": { avg: 650, min: 430, max: 975 },
  "Castro Verde": { avg: 650, min: 430, max: 975 },
  "Ourique": { avg: 600, min: 390, max: 900 },
  "Almodôvar": { avg: 600, min: 390, max: 900 },
  "Ferreira do Alentejo": { avg: 700, min: 460, max: 1050 },
  "Cuba": { avg: 650, min: 430, max: 975 },
  "Vidigueira": { avg: 650, min: 430, max: 975 },
  "Alvito": { avg: 600, min: 390, max: 900 },
  "Barrancos": { avg: 500, min: 330, max: 750 },
  
  // Portalegre
  "Portalegre": { avg: 850, min: 560, max: 1275 },
  "Elvas": { avg: 800, min: 520, max: 1200 },
  "Campo Maior": { avg: 750, min: 490, max: 1125 },
  "Ponte de Sor": { avg: 700, min: 460, max: 1050 },
  "Nisa": { avg: 650, min: 430, max: 975 },
  "Castelo de Vide": { avg: 800, min: 520, max: 1200 },
  "Marvão": { avg: 850, min: 560, max: 1275 },
  "Gavião": { avg: 600, min: 390, max: 900 },
  "Crato": { avg: 600, min: 390, max: 900 },
  "Alter do Chão": { avg: 650, min: 430, max: 975 },
  "Avis": { avg: 600, min: 390, max: 900 },
  "Fronteira": { avg: 600, min: 390, max: 900 },
  "Monforte": { avg: 550, min: 360, max: 825 },
  "Arronches": { avg: 550, min: 360, max: 825 },
  "Sousel": { avg: 600, min: 390, max: 900 },
  
  // Açores
  "Ponta Delgada": { avg: 1400, min: 920, max: 2100 },
  "Ribeira Grande": { avg: 1100, min: 720, max: 1650 },
  "Lagoa (Açores)": { avg: 1200, min: 790, max: 1800 },
  "Vila Franca do Campo": { avg: 1000, min: 660, max: 1500 },
  "Angra do Heroísmo": { avg: 1200, min: 790, max: 1800 },
  "Praia da Vitória": { avg: 1000, min: 660, max: 1500 },
  "Horta": { avg: 1100, min: 720, max: 1650 },
  
  // Madeira
  "Funchal": { avg: 2200, min: 1450, max: 3300 },
  "Câmara de Lobos": { avg: 1700, min: 1120, max: 2550 },
  "Santa Cruz": { avg: 1600, min: 1050, max: 2400 },
  "Machico": { avg: 1500, min: 990, max: 2250 },
  "Calheta": { avg: 1400, min: 920, max: 2100 },
  "Ribeira Brava": { avg: 1300, min: 860, max: 1950 },
  "Ponta do Sol": { avg: 1400, min: 920, max: 2100 },
  "São Vicente": { avg: 1200, min: 790, max: 1800 },
  "Santana": { avg: 1100, min: 720, max: 1650 },
  "Porto Moniz": { avg: 1000, min: 660, max: 1500 },
  "Porto Santo": { avg: 1800, min: 1180, max: 2700 },
};

export interface ConcelhoPriceResult {
  data: ConcelhoPriceData;
  source: 'concelho' | 'distrito';
  sourceName: string;
}

/**
 * Get price data for a concelho
 * Returns the source (concelho or distrito) to indicate data precision
 */
export function getConcelhoPriceData(concelho: string, distrito?: string): ConcelhoPriceResult | null {
  // Try to find specific concelho price first
  if (concelhoPrices[concelho]) {
    return {
      data: concelhoPrices[concelho],
      source: 'concelho',
      sourceName: concelho,
    };
  }
  
  // Try to find by case-insensitive match
  const concelhoLower = concelho.toLowerCase();
  for (const [key, value] of Object.entries(concelhoPrices)) {
    if (key.toLowerCase() === concelhoLower) {
      return {
        data: value,
        source: 'concelho',
        sourceName: key,
      };
    }
  }
  
  // Fallback to district price if distrito is provided
  if (distrito && districtBasePrices[distrito]) {
    return {
      data: districtBasePrices[distrito],
      source: 'distrito',
      sourceName: distrito,
    };
  }
  
  return null;
}

/**
 * Get all concelhos with price data
 */
export function getConcelhoWithPrices(): string[] {
  return Object.keys(concelhoPrices).sort();
}

/**
 * Format price in Portuguese currency format
 */
export function formatPricePT(value: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
