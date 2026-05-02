# Propuesta de monetizacion (pendiente aprobacion de Samuel)

**Fecha:** 2 de mayo de 2026
**Para:** Samuel
**De:** Max
**Estado:** Borrador para discutir y aprobar

Este documento existe para fijar el modelo de precios antes de empezar el Sprint 3 (panel del restaurante). Lo que decidamos aqui condiciona que features construimos y en que orden.

Por favor lee y responde con APROBADO, RECHAZADO o DISCUTIR en cada decision marcada con casilla. Cualquier punto se puede negociar.

---

## 1. Resumen de la propuesta en una frase

Dos niveles para el restaurante (gratis o 99 EUR/mes) y un add-on opcional de visibilidad pagada por semana. Sin comisiones sobre reservas o pedidos.

---

## 2. Estructura de precios propuesta

### Nivel 1: Listado gratis

El restaurante existe en nuestro indice automaticamente, basado en datos publicos.

Que incluye:
- Ficha basica con nombre, direccion, telefono, horarios publicos, tipo de cocina, rango de precios
- Aparece en respuestas de la IA y en la busqueda del marketplace
- Sin fotos propias (solo placeholder o foto generica si la hay)
- Sin reviews integradas
- Sin posibilidad de actualizar nada
- Sin panel de gestion

Por que existe el nivel gratis: nuestra IA solo recomienda bien si el indice es completo. Si solo aparecen restaurantes que pagan, el chatbot recomienda 50 sitios y el resto no existe para el usuario. Cobertura del 100% de Alicante desde el dia uno es indispensable para que el producto funcione.

### Nivel 2: Pro (99 EUR/mes)

Que incluye:
- Todo lo anterior, mas
- Fotos del restaurante (gestionables desde panel)
- Indicador de reputacion en Google (rating + numero de reviews) con link al perfil completo de Google
- Sistema de reviews propio dentro de la app (los usuarios autenticados pueden valorar y comentar; restaurante puede responder)
- Menu completo con precios, alergenos y traduccion automatica a ingles, aleman, frances y holandes
- Informacion ampliada (politica de reservas, terraza, parking, accesible, kid-friendly, vegano, etc.)
- Panel de gestion para actualizar todo en tiempo real
- Analytics basicos (visitas a tu ficha, busquedas que te encuentran, idiomas de los usuarios)
- Badge verificado en la ficha
- Soporte por email
- Sin comision por reservas o pedidos generados

### Add-on opcional: Boost (50 EUR/semana)

Solo disponible para restaurantes Pro. Compra puntual, no recurrente.

Que incluye:
- Posicionamiento prioritario en respuestas de la IA y en listados de la categoria correspondiente
- Etiquetado transparentemente como "Promocionado" para no romper la confianza del usuario

Limites duros para evitar spam y mantener confianza en el producto:
- **Maximo 3 slots de boost activos por codigo postal** en cualquier momento. Esto asegura competencia local real entre restaurantes de la misma zona sin que ninguna zona se sature.
- **Maximo 2 boosts visibles por respuesta de IA** independientemente del codigo postal. Para queries amplias como "mejor paella en Alicante" no aparecen 10 promocionados de zips distintos.

Calculo de capacidad y revenue maximo:
- Alicante ciudad tiene aproximadamente 16 codigos postales activos (03001 a 03016)
- 16 zips x 3 slots = 48 slots de boost simultaneos posibles
- 48 slots x 50 EUR/semana = 2,400 EUR/semana = ~10,400 EUR/mes en boost si se vende todo
- Realidad esperada: 30 a 50% de ocupacion en temporada normal, mas en festividades

Casos de uso pensados:
- Apertura de restaurante nuevo
- Semanas de fiestas locales (Hogueras, Moros y Cristianos, Semana Santa)
- Promocion de menu de temporada
- Recuperacion despues de una semana floja

---

## 3. Por que estas decisiones

### Por que dos niveles y no tres

Cualquier modelo de pricing con tres tiers asume que el comprador compara. Los restauradores en Alicante no son compradores SaaS; no van a abrir nuestra pagina de precios y elegir el tier optimo. La conversacion va a ser cara a cara o por telefono. La decision tiene que ser binaria: "salgo gratis y basico, o pago 99 y salgo bien". Dos niveles convierten mejor en este publico.

### Por que 99 EUR y no 49, 79 o 149

Benchmark verificado del mercado espanol:
- CoverManager (player local lider en gestion de reservas): 60 a 250 EUR/mes
- TheFork comisiones: equivalente de 1,000 a 6,000 EUR/mes para un restaurante turistico medio
- Tableo: alrededor de 85 EUR/mes para volumen medio
- Median SaaS para small business en general: 29 a 99 USD/mes

99 EUR/mes nos posiciona como producto serio sin asustar al pequeno. Esta debajo del umbral psicologico de 100 EUR. Datos de retencion de SaaS: precios mas altos = menor churn (los productos baratos atraen a clientes que cancelan rapido). 99 es el equilibrio.

### Por que el boost es solo para Pro

Si un restaurante en Listado gratis pudiera comprar boost a la carta, nunca pagaria los 99 EUR/mes. Compraria boost solo en momentos clave y se ahorraria la suscripcion. El boost tiene que ser un upsell del Pro, no un sustituto.

### Por que etiquetar el boost como "Promocionado"

Si los usuarios sospechan que las recomendaciones de la IA son anuncios encubiertos, dejan de confiar y dejan de usar la app. Un sistema en el que todo lo que sale es comprado se llama publicidad, no descubrimiento. La transparencia es la unica forma de que esto sea sostenible. Modelo correcto: la mayoria de las recomendaciones son organicas (basadas en match real con la pregunta del usuario), y como mucho 1 o 2 espacios por pagina son boost etiquetado.

### Por que no comision sobre reservas

TheFork ya domina ese modelo y exprime al pequeno con 2 a 4 EUR por comensal. Competir en comisiones nos pondria a librar la misma guerra desde mas atras. Suscripcion plana es predecible para el restaurante y para nosotros.

---

## 4. Math con este modelo

### Hipotesis Ano 1 conservadora
- 50 restaurantes Pro a 99 EUR/mes = 4,950 EUR/mes
- 5 restaurantes con boost activo en promedio (1 semana al mes) = 250 EUR/mes
- MRR total: ~5,200 EUR/mes = 62k EUR ARR

### Hipotesis Ano 1 objetivo
- 100 restaurantes Pro = 9,900 EUR/mes
- 15 restaurantes con boost activo regularmente = 750 EUR/mes
- MRR total: ~10,650 EUR/mes = 128k EUR ARR

### Hipotesis Ano 2 objetivo
- 250 restaurantes Pro = 24,750 EUR/mes
- 40 restaurantes con boost activo regularmente = 2,000 EUR/mes
- MRR total: ~26,750 EUR/mes = 321k EUR ARR

Todas las cifras asumen Alicante puro, sin expansion. Con 1,700 restaurantes en la ciudad, 250 Pro a 24 meses es 14% de penetracion: realista pero requiere ejecucion.

---

## 5. Decisiones que necesito de Samuel

Marca cada una APROBADO / RECHAZADO / DISCUTIR:

- [ ] Modelo de dos niveles (Listado gratis + Pro 99 EUR)
- [ ] Precio Pro: 99 EUR/mes
- [ ] Listado gratis incluye: ficha basica con datos publicos, sin fotos propias ni gestion
- [ ] Pro incluye: fotos, indicador de Google reviews + sistema propio de reviews, menu completo traducido, panel, analytics
- [ ] Add-on Boost: 50 EUR/semana, solo Pro, etiquetado "Promocionado", maximo 3 slots activos por codigo postal y maximo 2 visibles por respuesta de IA
- [ ] Sin comision sobre reservas o pedidos (subscription puro)
- [ ] Periodo de prueba: 14 dias de Pro gratis sin tarjeta antes de empezar a cobrar
- [ ] Discount por pago anual: 990 EUR/ano (2 meses gratis)
- [ ] Cohorte fundadora: primeros 50 restaurantes pagan 49 EUR/mes durante 12 meses (despues precio completo)

---

## 6. Preguntas abiertas para discutir

Estas son cosas en las que necesito tu opinion porque no las he decidido todavia:

### 6.1 Que significa exactamente "fotos" en el Plan Pro
Opciones:
- A. Damos herramienta para que el restaurante suba y gestione sus fotos (margen alto, pero la calidad depende de ellos)
- B. Mandamos fotografo profesional una vez al ano incluido en el precio (diferenciador real, pero coste de 100 a 300 EUR por visita reduce mucho el margen)
- C. Partnership con fotografo local de Alicante, descuento al restaurante, comision para nosotros (sin coste fijo nuestro)

Mi recomendacion: empezar con A en MVP, ofrecer B o C como add-on "Foto-shoot profesional" por 199 EUR adicionales una vez al ano. Manteniendo el margen del Plan Pro intacto.

### 6.2 Reviews: aproximacion adoptada (decision tomada por Max y Samuel)

Tras discusion, descartamos scrapear Google reviews. Razones:
- Los terminos de servicio de Google lo prohiben explicitamente. Detectan scrapers via patrones de comportamiento, rate limits, captchas e IP bans.
- Para una startup de descubrimiento gastronomico, que Google nos bloquee la infraestructura es un desastre estrategico. Necesitamos su buena voluntad.
- Mantenimiento constante: Google cambia su HTML y el scraper se rompe regularmente.
- Riesgo legal en futuras rondas de financiacion o adquisicion. Due diligence lo flag como problema.
- Restaurantes pueden quejarse si redistribuimos su data sin permiso.

Aproximacion adoptada: dos componentes complementarios.

**Componente 1: Indicador de Google.**
- Badge pequeno en cada ficha: "4.5 estrellas en Google, 234 reviews"
- Link al perfil de Google Maps para que el usuario lea las reviews alli si quiere
- Esto esta permitido por la licencia oficial de Google Places API (rating + total count)
- Coste: aproximadamente 0.01 EUR por restaurante por refresco
- Refresco automatico semanal o quincenal

**Componente 2: Sistema de reviews propio dentro de la app.**
- Usuarios autenticados pueden dejar valoracion (1 a 5 estrellas) + comentario + opcionalmente fotos
- Restaurante (Pro) puede responder publicamente
- Anti-spam: solo usuarios autenticados, una review por usuario por restaurante, opcional verificacion de visita via reserva
- Pulled into IA recommendations como social proof verificada
- Long-term: este es nuestro moat real. Las reviews de Google son de Google. Las de TheFork son de TheFork. Si tenemos un base de reviews verificadas en Alicante, es un activo defendible que nadie puede replicar facilmente.

Tradeoff honesto: las reviews propias empiezan en cero el dia uno. Necesitamos:
- Bootstrap inicial: incentivar las primeras reviews (descuento al usuario, gamificacion, badge "founder reviewer")
- Prompts post-visita si integramos con sistema de reservas
- UX de reviews que sea facil y rapido (no pedir un ensayo)

Esto es trabajo de producto real, no solo un componente UI. Sprint 4 o 5.

### 6.3 Boost: como decidimos quien sale en el slot promocionado cuando hay varios pagando
Opciones:
- A. Orden de llegada (FIFO)
- B. Rotacion equitativa
- C. Subasta de precio (el que paga mas sale arriba)
- D. Match relevancia + precio (mejor match con la query, dentro de los pagados)

Mi recomendacion: empezar con B (rotacion) en MVP por simplicidad y para no alinearnos con dinamicas de Google Ads desde el principio. Si funciona, evolucionar a D.

### 6.4 Pagos
Stripe directo desde el dia uno o factura manual los primeros 20 clientes para validar antes de invertir en integracion?

Mi recomendacion: factura manual los primeros 10 a 20, despues Stripe. Asi no invertimos en pagos antes de saber que el modelo funciona.

### 6.5 Que hacemos si la validacion sale mal
Si Samuel habla con 20 restaurantes y menos del 30% pagaria 99 EUR/mes, hay dos caminos:
- A. Bajar precio (49 a 69 EUR/mes), modelo se vuelve marginal pero accesible
- B. Subir valor (mas features, mas trabajo nuestro) y mantener 99 EUR/mes

Mi opinion: depende de los motivos del rechazo. Si dicen "no me llega para pagar tanto", bajamos. Si dicen "no veo el valor", subimos valor. Necesitamos entender el porque, no solo el si/no.

---

## 7. Riesgos a discutir

### Riesgo 1: cold start del boost
Si nadie compra boost los primeros meses, no tenemos datos de si funciona. Sugerencia: regalar 1 semana de boost al primer cohorte de Pro como prueba. Costo cero para nosotros, datos a cambio.

### Riesgo 2: free-riders
Restaurantes en Listado gratis nunca pagan. Aceptable si la conversion a Pro es >30% en 12 meses. Si es <10%, el modelo no funciona y hay que repensar (por ejemplo, anadir limite de visibilidad al gratis o forzar pago para responder a comentarios).

### Riesgo 3: overdelivery en Pro
Prometer fotos + integracion Google + panel + analytics + traduccion automatica + soporte es bastante para 99 EUR/mes. Si subestimamos el coste de mantener todo eso, margen unitario se hunde. Por eso 6.1 y 6.2 son importantes (definen el coste real).

### Riesgo 4: contaminacion de la IA por boost
Si hay 30 restaurantes con boost activo y limites laxos, la IA empieza a recomendar siempre los mismos pagados y los usuarios pierden confianza. Los dos limites complementarios (3 por zip, 2 por respuesta) son criticos. Hay que ser disciplinados aqui aunque tengamos demanda de boost en festividades.

### Riesgo 5: dependencia de Google para el indicador de reputacion
Si Google cambia los terminos de su Places API o sube precio, perdemos el indicador de Google rating. Mitigacion: el sistema de reviews propio es nuestro plan B y a la vez nuestro moat real. Cuanto antes empecemos a acumular reviews propias, menos dependemos de Google.

### Riesgo 6: cold start del sistema de reviews propio
Las reviews propias empiezan en cero el dia uno. Sin reviews, los usuarios no confian, y sin confianza no dejan reviews. Mitigaciones a discutir:
- Incentivar las primeras reviews con descuento al usuario o badge "founder reviewer"
- Prompt automatico despues de una visita o reserva
- UX rapida y sin friccion (rating de 1 click + comentario opcional)
- En la fase inicial, mostrar Google rating mas visible y reviews propias menos para no parecer vacio

---

## 8. Proximos pasos si aprobado

1. Samuel valida con 10 a 20 restaurantes en Alicante (esta semana o la siguiente)
2. Si validacion >50% positiva en pagar 99 EUR/mes: bloqueamos modelo y ajustamos roadmap
3. Sprint 3 enfoca en: panel del restaurante, integracion Google reviews, gestion de fotos, sistema de pagos
4. Sprint 4 anade: sistema de boost, etiquetado promocionado, analytics
5. Lanzamiento publico con cohorte fundadora cuando tengamos el indice del 100% de Alicante completo y el panel funcional

---

## 9. Notas finales

Este documento sustituye al modelo de precios mencionado en `MARKET_RESEARCH.md` (donde se planteaban tres niveles). Tras discusion, hemos simplificado a dos niveles + boost.

Si en algun punto algo no se entiende o quieres profundizar, mejor decirlo ahora que cuando ya este construido.
