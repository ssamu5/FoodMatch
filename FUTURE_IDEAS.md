# Ideas para el futuro

Este documento captura ideas que no son parte del MVP pero que merecen ser desarrolladas mas adelante. No son compromisos, son hipotesis a validar cuando el producto base funcione.

---

## Idea 1: Seccion Comunidad (UGC con incentivos)

### Resumen

Los usuarios pueden subir videos y fotos de su experiencia en un restaurante. El contenido aparece en una "Seccion Comunidad" dentro de la ficha del restaurante. A cambio de subir contenido, el usuario recibe recompensas (descuentos, badges, puntos canjeables).

Es User Generated Content (UGC) tipo Instagram o TikTok dentro de la app, vinculado a cada restaurante.

### Por que tiene sentido

1. **Resuelve el cold start de las reviews propias.** En lugar de esperar a que la gente escriba reviews, les damos un formato mas natural (foto rapida del plato, video corto del ambiente) que hoy ya hacen en Instagram pero no en apps de restaurantes.

2. **Network effects reales.** Buen contenido atrae usuarios, usuarios atraidos suben mas contenido, restaurantes se benefician del flujo, restaurantes promueven la app a sus clientes para que suban contenido. Loop autosostenido si arranca.

3. **Restaurantes obtienen activos de marketing gratis.** Hoy un restaurante pequeno paga 200 a 500 EUR por una sesion de fotos profesional. Si su Seccion Comunidad tiene 50 fotos reales de clientes contentos, eso es marketing en vivo sin coste para el restaurante.

4. **Diferenciacion frente a Google.** Google Maps tiene fotos subidas por usuarios pero sin curacion ni incentivo. Nosotros podemos hacer la experiencia mejor (formato, recompensa, restaurante puede destacar contenido).

5. **Dato valioso para la IA.** Los videos y fotos etiquetados con plato, hora, ambiente, son material de entrenamiento para mejorar las recomendaciones futuras.

### Como podria funcionar

**Para el usuario:**
- Subir foto o video corto (15 a 30 segundos) directamente desde la app
- Etiquetar el plato y el restaurante (autocompletado del menu)
- Opcionalmente: rating, comentario corto, hashtags
- Recibir recompensa segun el tipo de contenido y la calidad

**Sistema de recompensas (a definir):**
- Foto de un plato: 1 credito
- Video corto: 3 creditos
- Contenido destacado por el restaurante: 5 creditos extra
- Creditos canjeables por descuentos en restaurantes Pro participantes (ej. 10 creditos = 5 EUR de descuento en tu proximo pedido)

**Para el restaurante (Plan Pro):**
- Ve todo el contenido nuevo en su panel antes de que se publique (opcional, configurable)
- Puede destacar contenido en su Seccion Comunidad
- Puede responder o dar like al contenido
- Puede usar el contenido en sus propias redes sociales (con atribucion)
- Define que descuentos ofrece para los creditos

**Para nosotros:**
- Moderacion automatica para contenido inapropiado (modelo de IA + reportes)
- Sistema de flags para contenido falso o spam
- Curacion editorial del contenido top de la ciudad para destacar en la home

### Riesgos a considerar

1. **Moderacion.** Contenido inapropiado, ofensivo, o falso. Necesitamos moderacion automatica y humana. Coste real, no trivial.

2. **Calidad heterogenea.** Videos de movil mediocres pueden hacer ver mal al restaurante. Solucion: el restaurante decide que destacar y que ocultar.

3. **Coste de los descuentos.** Quien paga? Si lo paga el restaurante, hay que convencerle del retorno. Si lo pagamos nosotros, hay que limitarlo. Modelo mas probable: los descuentos los financia el restaurante, nosotros gestionamos la operativa.

4. **Derechos de imagen.** Personas en los videos, propiedad intelectual de la marca, etc. Necesitamos terminos claros: el usuario que sube cede licencia de uso a FoodMatch y al restaurante.

5. **Reviews falsas o competencia desleal.** Restaurante competidor podria pagar a usuarios para subir contenido malo. Anti-fraude y verificacion de visita ayudan.

6. **Escala de moderacion.** A 10,000 piezas de contenido al mes, no se puede revisar todo manualmente. Plan: IA filtra, humanos solo revisan flagged.

### Preguntas abiertas

- Quien financia los descuentos: el restaurante, FoodMatch, o un mix?
- Que tipo de contenido funciona mejor: foto, video corto, vlog mas largo?
- Hasta que punto el restaurante puede moderar lo que se publica sin perder credibilidad ante el usuario?
- Conviene mostrar el contenido de la comunidad dentro de la app o tambien en una version publica web (mejor SEO)?
- Cuando lanzar: cuando tengamos 100 restaurantes Pro o cuando tengamos 1,000 usuarios activos?

### Cuando tendria sentido lanzar

No antes de tener:
- 50 restaurantes Pro activos
- 1,000 usuarios activos en la app
- Sistema basico de reviews propias funcionando
- Politica de moderacion definida

Probablemente Sprint 6 o Sprint 7, post-MVP. No bloquear el roadmap actual con esto.

---

## Otras ideas a desarrollar (placeholders)

### Idea 2: Concierge B2B con hoteles y operadores de cruceros
Mencionada en `MARKET_RESEARCH.md` apartado 4.3. Hoteles pagan por embeber nuestra IA o nuestras recomendaciones para sus huespedes. Mercado de 250,000 cruceristas y miles de hoteles solo en provincia.

### Idea 3: Pro Diner (suscripcion del usuario final)
Plan opcional para usuarios power (locales frecuentes, food writers) por 3.99 EUR/mes o 29 EUR/ano. Sin contenido promocionado, listas ilimitadas, recomendaciones personalizadas, multi-ciudad. Solo tiene sentido cuando expandamos mas alla de Alicante.

### Idea 4: Expansion geografica
Despues de Alicante, candidatos por orden de logica:
1. Valencia ciudad (cercania, mismo perfil turistico, sinergia regional)
2. Benidorm y otras ciudades de Costa Blanca (turismo intenso, perfil similar)
3. Malaga y Costa del Sol (siguiente mercado turistico claro)
4. Madrid o Barcelona solo cuando tengamos producto probado y capital

### Idea 5: Integracion con sistemas de reservas existentes
En lugar de competir con TheFork desde el dia uno en reservas, integrarse con su API u otras (CoverManager, OpenTable) para que el usuario pueda reservar desde nuestra app. Posible negociacion de comision compartida. Riesgo: dependencia.

### Idea 6: Eventos y experiencias
Mas alla de comer en un sitio fijo: cenas tematicas, food tours, clases de cocina, experiencias gastronomicas en Alicante. Mercado adyacente con margen mayor.

### Idea 7: API publica para guias y bloggers
Permitir que blogs locales, guias de viaje y agencias de turismo embeban widgets de FoodMatch o usen nuestra API. Distribucion gratuita inicialmente, monetizacion despues si la traccion lo justifica.

### Idea 8: Personalizacion via login con perfil
Usuarios autenticados pueden indicar restricciones dieteticas, idioma preferido, presupuesto, tipo de comida favorita. La IA ajusta recomendaciones automaticamente. Aumenta engagement y retencion.

---

## Como mantener este documento

Cualquier idea nueva que no entre en el sprint actual se anota aqui con:
- Resumen
- Por que tiene sentido
- Como podria funcionar
- Riesgos
- Cuando podria lanzarse

No requiere que la idea sea completa. Esta bien dejar preguntas abiertas. El proposito del documento es no perder ideas, no ejecutarlas.

Revisar este documento al final de cada sprint para ver si alguna idea ya tiene contexto suficiente para promoverse a roadmap.
