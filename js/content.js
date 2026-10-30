/*
  CONTENIDO EDITABLE — Maileny Skincare
  ------------------------------------------------------------
  Cambia aquí textos, servicios, promociones y datos de contacto.
  No hace falta tocar el HTML ni el CSS.
  · Escribe siempre entre comillas "así".
  · Para fotos: guarda la imagen en assets/img/ y pon su nombre en "foto".
    Si "foto" está vacío, se muestra un marco decorativo.
*/
window.SITE = {
  contacto: {
    // Número de WhatsApp con código de país, sin espacios ni "+".
    // Ej.: "18095551234". Mientras esté vacío se usa el enlace wa.link.
    whatsapp: "",
    whatsappLink: "https://wa.link/xychbx",
    instagram: "maileny_skincare",
    threads: "maileny_skincare",
    direccion: "Bonao, Monseñor Nouel, República Dominicana",
    mapa: "Bonao, Monseñor Nouel, República Dominicana",
    // CONFIRMAR horario con la clienta
    horario: [
      ["Lunes a viernes", "9:00 a.m. – 6:00 p.m."],
      ["Sábados", "9:00 a.m. – 3:00 p.m."],
      ["Domingos", "Cerrado"]
    ],
    mensaje: "¡Hola Maileny! 🌸 Me gustaría reservar una cita.",
    mensajeFaq: "¡Hola Maileny! 🌸 Tengo una pregunta."
  },

  hero: {
    saludo: "Cosmiatra Esteticista · Bonao",
    titulo: "Una piel sana demuestra el",
    tituloScript: "amor",
    tituloFin: "con el que te tratas",
    texto: "Tratamientos faciales y corporales personalizados en un centro habilitado por Salud Pública, con la atención cercana que mereces.",
    boton: "Reserva por WhatsApp",
    boton2: "Ver tratamientos"
  },

  confianza: [
    { icono: "shield", titulo: "Centro habilitado", texto: "Ministerio de Salud Pública" },
    { icono: "award", titulo: "Cosmiatra certificada", texto: "Atención profesional" },
    { icono: "heart", titulo: "+3,400 seguidoras", texto: "Que confían en nosotras" },
    { icono: "pin", titulo: "Bonao, RD", texto: "Fácil de encontrar" }
  ],

  // Pon activa: false para ocultar la promoción.
  // "hasta": último día de la oferta (año-mes-día). Después se oculta sola. Vacío = sin fecha.
  promo: {
    activa: true,
    hasta: "",
    etiqueta: "Oferta del mes",
    titulo: "Láser de diodo",
    descuento: "-30% y -40%",
    texto: "¡Di adiós al vello! Depilación láser con descuento especial.",
    condicion: "Válido martes y viernes",
    boton: "Quiero mi descuento",
    mensaje: "¡Hola Maileny! 🌸 Quiero aprovechar la oferta de láser de diodo."
  },

  // CONFIRMAR lista de servicios con la clienta
  servicios: [
    { icono: "laser", nombre: "Depilación láser de diodo", texto: "Resultados duraderos y piel suave, en todo tipo de piel." },
    { icono: "drop", nombre: "Limpieza facial profunda", texto: "Extracción, exfoliación e hidratación para una piel que respira." },
    { icono: "sparkle", nombre: "Hidratación facial", texto: "Devuelve luminosidad, elasticidad y glow a tu rostro." },
    { icono: "leaf", nombre: "Peeling químico", texto: "Renueva la textura y unifica el tono de tu piel." },
    { icono: "sun", nombre: "Tratamiento de manchas", texto: "Protocolos despigmentantes adaptados a tu tipo de piel." },
    { icono: "face", nombre: "Tratamiento antiacné", texto: "Controla brotes y mejora marcas con un plan a tu medida." },
    { icono: "flower", nombre: "Depilación con cera", texto: "Rápida, higiénica y con productos suaves para tu piel." },
    { icono: "hand", nombre: "Evaluación de piel", texto: "Diagnóstico personalizado para elegir el tratamiento ideal." }
  ],

  sobreMi: {
    nombre: "Maileny Vásquez",
    cargo: "Cosmiatra Esteticista · CEO",
    foto: "", // ej.: "maileny.jpg"
    parrafos: [
      "Soy Maileny, cosmiatra esteticista y fundadora de Maileny Skincare. Creo que cuidar tu piel es una forma de amarte, y por eso cada tratamiento empieza escuchándote.",
      "Después de mucho esfuerzo, dedicación y amor por lo que hago, hoy celebramos la habilitación de nuestro centro por el Ministerio de Salud Pública: un sueño cumplido gracias a la confianza de cada una de mis clientas."
    ],
    chips: ["Centro habilitado", "Cosmiatría", "Láser de diodo", "Atención personalizada"]
  },

  // categoria: faciales | laser | centro | resultados
  galeria: [
    { foto: "", categoria: "faciales", titulo: "Limpieza facial" },
    { foto: "", categoria: "laser", titulo: "Láser de diodo" },
    { foto: "", categoria: "centro", titulo: "Nuestro centro" },
    { foto: "", categoria: "resultados", titulo: "Glow después del tratamiento" },
    { foto: "", categoria: "faciales", titulo: "Hidratación profunda" },
    { foto: "", categoria: "centro", titulo: "Cabina de tratamiento" }
  ],

  // TEXTOS DE EJEMPLO — reemplazar por testimonios reales de clientas
  testimonios: [
    { nombre: "Clienta de ejemplo", texto: "Desde que me atiendo con Maileny mi piel cambió por completo. Es súper profesional y te hace sentir en confianza.", estrellas: 5 },
    { nombre: "Clienta de ejemplo", texto: "El láser de diodo funcionó increíble y el trato es de lo mejor. Todo muy limpio y cómodo.", estrellas: 5 },
    { nombre: "Clienta de ejemplo", texto: "La limpieza facial me dejó la piel radiante. Se nota el cariño en cada detalle.", estrellas: 5 }
  ],

  // CONFIRMAR respuestas con la clienta
  preguntas: [
    { pregunta: "¿Cómo reservo mi cita?", respuesta: "Escríbenos por WhatsApp con el tratamiento que te interesa y el día que prefieres. Te confirmamos la hora disponible lo antes posible." },
    { pregunta: "¿No sé qué tratamiento necesito, qué hago?", respuesta: "Empieza con una evaluación de piel. Revisamos tu tipo de piel y lo que quieres mejorar, y te recomendamos el tratamiento ideal para ti." },
    { pregunta: "¿Cuántas sesiones de láser de diodo necesito?", respuesta: "Depende de la zona, el tipo de vello y tu piel. La mayoría de las clientas ve resultados desde las primeras sesiones; en tu evaluación te damos un plan personalizado." },
    { pregunta: "¿Cómo me preparo para la depilación láser?", respuesta: "Rasura la zona uno o dos días antes, evita el sol y las cremas autobronceadoras, y no uses cera ni pinzas en las semanas previas. Te damos todas las indicaciones al reservar." },
    { pregunta: "¿El centro está habilitado?", respuesta: "Sí. Nuestro centro está habilitado por el Ministerio de Salud Pública, y trabajamos con protocolos de higiene y productos profesionales." }
  ],

  footer: "Una piel sana demuestra el amor con el que te tratas 🌸"
};
