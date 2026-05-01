// Catálogo de precios por defecto
// Estos se usan si no hay precios cargados en Supabase

export const DEFAULT_PRECIOS_VENTANAS = {
  // Serie 20 — precio por unidad
  s20_1000x600: 2490, s20_1000x1000: 2990, s20_1200x1000: 3290,
  s20_1200x1200: 3790, s20_1500x1000: 3890, s20_1500x1200: 3990,
  s20_1500x1500: 5350, s20_1500x2000: 5990, s20_1800x1200: 6490,
  s20_1800x1500: 7290, s20_2000x1200: 7090,
  // Serie 25
  s25_1000x1000: 5490, s25_1200x1000: 5990, s25_1200x1200: 6590,
  s25_1500x1000: 7490, s25_1500x1200: 7990, s25_1500x1500: 8190,
  s25_1800x1200: 9090, s25_1800x1500: 9490, s25_1800x2000: 9590,
  // Monoblock S20
  mb20_1200x1000: 7590, mb20_1500x1000: 8490, mb20_1500x1200: 9490,
  mb20_1500x1500: 12490, mb20_1500x2000: 13490, mb20_1800x1500: 15990,
  // Monoblock S25
  mb25_1200x1000: 10990, mb25_1200x1200: 11990, mb25_1500x1200: 14990,
  mb25_1500x1500: 16890, mb25_1500x2000: 17890,
  // Otros
  reja_12_m2: 2500, reja_16_m2: 3500, persiana_m2: 4200, mosquitero_m2: 1100,
  puerta_reja_08: 4990, puerta_reja_09: 6590, puerta_reja_10: 7580,
  // Recargos
  simil_madera_pct: 15, color_pct: 10,
  instalacion_por_unidad: 800,
}

export const DEFAULT_PRECIOS_PVC = {
  // Tablillas (por ML)
  tablilla_blanco_6: 285, tablilla_blanco_7: 310, tablilla_blanco_8: 335,
  tablilla_blanco_10: 390, tablilla_color_7: 420,
  // Perfilería (por ML)
  perfil_u: 180, union_h_6m: 510,
  // Estructura (por barra 3m)
  montante_35: 290, montante_70: 380, solera_35: 290, solera_70: 380,
  // Fijaciones
  tornillo_t1: 4, fijacion_8: 8, esquinero: 80,
  // Aislaciones (por rollo)
  lana_vidrio_18m2: 1850, guata_aluminizada_15m2: 1200,
  // Mano de obra
  mo_m2: 600,
}

export const DEFAULT_PRECIOS_YESO = {
  // Placas
  placa_10: 329, placa_125: 380, placa_verde: 490,
  // Estructura (por barra 3m)
  montante_35: 290, montante_70: 380, solera_35: 270, solera_70: 360,
  omega_3m: 210,
  // Tornillería
  tornillo_t1_100: 180, tornillo_t2_100: 220, fijaciones_bolsa: 320,
  // Masilla
  masilla_7: 480, masilla_16: 890, masilla_25: 1180,
  // Cintas
  cinta_papel: 95, cinta_red: 110,
  // Aislaciones
  lana_vidrio_18m2: 1850, guata_aluminizada_15m2: 1200,
  // MO
  mo_m2: 800,
}

export const DEFAULT_PRECIOS_GENERAL = [
  // Ventanas
  { cat: 'ventanas', n: 'Ventana Serie 20 (1.00×1.00)', p: 2990 },
  { cat: 'ventanas', n: 'Ventana Serie 20 (1.20×1.00)', p: 3290 },
  { cat: 'ventanas', n: 'Ventana Serie 20 (1.20×1.20)', p: 3790 },
  { cat: 'ventanas', n: 'Ventana Serie 20 (1.50×1.00)', p: 3890 },
  { cat: 'ventanas', n: 'Ventana Serie 20 (1.50×1.20)', p: 3990 },
  { cat: 'ventanas', n: 'Ventana Serie 20 (1.50×1.50)', p: 5350 },
  { cat: 'ventanas', n: 'Ventana Serie 20 (1.50×2.00)', p: 5990 },
  { cat: 'ventanas', n: 'Ventana Serie 25 (1.00×1.00)', p: 5490 },
  { cat: 'ventanas', n: 'Ventana Serie 25 (1.20×1.20)', p: 6590 },
  { cat: 'ventanas', n: 'Ventana Serie 25 (1.50×1.50)', p: 8190 },
  { cat: 'ventanas', n: 'Ventana Serie 25 (1.80×2.00)', p: 9590 },
  { cat: 'ventanas', n: 'Monoblock S20 (1.20×1.00)', p: 7590 },
  { cat: 'ventanas', n: 'Monoblock S20 (1.50×1.50)', p: 12490 },
  { cat: 'ventanas', n: 'Monoblock S25 (1.50×2.00)', p: 17890 },
  { cat: 'ventanas', n: 'Persiana (m²)', p: 4200 },
  { cat: 'ventanas', n: 'Reja varillas 12mm (m²)', p: 2500 },
  { cat: 'ventanas', n: 'Reja varillas 16mm (m²)', p: 3500 },
  { cat: 'ventanas', n: 'Mosquitero (m²)', p: 1100 },
  // PVC
  { cat: 'pvc', n: 'Tablilla Blanco 6mm (ML)', p: 285 },
  { cat: 'pvc', n: 'Tablilla Blanco 8mm (ML)', p: 335 },
  { cat: 'pvc', n: 'Tablilla Color 7mm (ML)', p: 420 },
  { cat: 'pvc', n: 'Perfil U / Terminación (ML)', p: 180 },
  { cat: 'pvc', n: 'Unión H (6m)', p: 510 },
  { cat: 'pvc', n: 'Lana de vidrio (rollo 18m²)', p: 1850 },
  { cat: 'pvc', n: 'Guata aluminizada (rollo 15m²)', p: 1200 },
  // Yeso
  { cat: 'yeso', n: 'Placa Durlock 10mm', p: 329 },
  { cat: 'yeso', n: 'Placa Durlock 12.5mm', p: 380 },
  { cat: 'yeso', n: 'Placa verde 12.5mm', p: 490 },
  { cat: 'yeso', n: 'Omega 3m', p: 210 },
  { cat: 'yeso', n: 'Masilla 7kg', p: 480 },
  { cat: 'yeso', n: 'Masilla 25kg', p: 1180 },
  // Otros
  { cat: 'otros', n: 'Vidrio 4mm (m²)', p: 0 },
  { cat: 'otros', n: 'Vidrio DVH (m²)', p: 0 },
  { cat: 'otros', n: 'Mano de obra instalación (m²)', p: 0 },
  { cat: 'otros', n: 'Flete / traslado', p: 0 },
  { cat: 'otros', n: 'Sellador / silicona (tubo)', p: 0 },
]
