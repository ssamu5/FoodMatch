# Validation y riesgos pendientes (lectura honesta del proyecto)

**Fecha:** 3 de mayo de 2026
**Proposito:** ser brutal y critico sobre lo que NO sabemos, lo que puede salir mal, y lo que tenemos que hacer ANTES de seguir construyendo o invertir tiempo y dinero.

Este documento es deliberadamente incomodo. La idea es hablar de cosas que no salen en el roadmap optimista. Si algo aqui escuece, probablemente sea importante.

---

## 1. Estado real del proyecto, sin filtros

### Lo que tenemos
- Repositorio con codigo de Sprint 0 y 1 (busqueda y filtros funcionales)
- Documentacion estrategica completa: market research, pricing, founder agreement, future ideas
- Una idea clara de a quien queremos servir y por que
- Plan financiero con numeros realistas

### Lo que NO tenemos
- **Cero clientes.** Ningun restaurante ha dicho "si, pago 99 EUR/mes".
- **Cero usuarios.** Ningun turista o local ha usado la app en su forma actual.
- **Cero validacion del wedge.** La hipotesis "ChatGPT especializado en restaurantes" nunca se ha probado con usuarios reales.
- **Acuerdo formal con Samuel.** Toda la planificacion estrategica de los ultimos dias la ha hecho Max. Samuel no ha aprobado nada explicitamente. Su silencio no es consentimiento.
- **Decision de mercado de lanzamiento.** Alicante? Valencia? Pamplona? Sigue abierto despues de la correccion de que Samuel vive en Navarra.
- **Visibilidad sobre la verdadera demanda.** Estamos asumiendo que existe basandonos en datos macro de turismo. Demanda real = personas pagando, no personas en avion.

### Honesto: estamos en fase pre-validacion
A pesar de tener 7 documentos estrategicos, el proyecto sigue en fase 0. Ningun euro ha cambiado de manos. Ningun restaurante ha probado la app. Esta diferencia importa.

---

## 2. Riesgos criticos que no se han dimensionado todavia

### 2.1 Samuel no ha respondido a nada

Toda la estrategia, pricing, agreement, y planes que se han redactado son borradores de Max. Samuel ha escrito el codigo del Sprint 0 y 1 pero no ha participado en la conversacion estrategica reciente.

**Riesgo:** Samuel puede estar en desacuerdo con cualquier cosa: el reparto 50/50, los roles CEO/CTO, el precio 99 EUR, el modelo de boost, la ciudad de lanzamiento, el calendario de vesting, todo. Sin su alineacion explicita, esto es un plan de un solo fundador.

**Que hacer:** llamada de 90 a 120 minutos con Samuel exclusivamente para revisar PRICING_PROPOSAL.md y FOUNDER_AGREEMENT.md punto por punto. Sin esa llamada, todo lo demas es papel mojado.

### 2.2 Presencia local en Valencia confirmada

Samuel vive a aproximadamente 30 minutos de Valencia ciudad. Esto reduce drasticamente el riesgo de "ambos fundadores remotos" que se planteo inicialmente. Samuel puede:
- Hacer onboarding presencial de restaurantes en Valencia
- Asistir a eventos del ecosistema startup (Startup Valencia, KM Zero, Lanzadera)
- Reunirse con asesores legales y bancos en persona
- Mantener relaciones cara a cara con los primeros 100 clientes

**Implicaciones estrategicas:**
- Valencia se confirma como el mercado de lanzamiento natural (mas grande que Alicante, con presencia local de Samuel)
- Alicante pasa a ser mercado secundario para fase 2
- El argumento de "depth local" frente a Google/Perplexity es defendible

**Lo que sigue siendo riesgo:** Max es remoto desde Alemania. Las dinamicas de remote-only entre cofundadores siguen requiriendo disciplina (ver riesgo 2.12).

### 2.3 Concentracion de codigo y accesos en Samuel

El repositorio github.com/ssamu5/FoodMatch es de Samuel. Las cuentas de servicios que se hayan creado probablemente tambien. Si Samuel desaparece (accidente, oferta laboral, conflicto), Max hereda nada.

**Riesgo:** punto unico de fallo total. Sin acceso al codigo, no hay proyecto.

**Que hacer ya:**
- Crear organizacion en GitHub (FoodMatch) y migrar el repositorio
- Anadir a Max como owner de la organizacion
- Compartir credenciales de cualquier cuenta de servicios via 1Password o Bitwarden compartido
- Documentar arquitectura basica (donde esta hosteado, que tokens hay, que servicios externos se usan)

### 2.4 La validacion con restaurantes nunca se hace

El recurso a "validar con 10 a 20 restaurantes" aparece en MARKET_RESEARCH.md y PRICING_PROPOSAL.md, pero nadie la ha programado todavia. El patron tipico es que se quede aplazada para siempre y se siga construyendo basandose en hipotesis.

**Riesgo:** llegamos al lanzamiento descubriendo que nadie pagaria 99 EUR/mes. Todo el trabajo previo se invalida.

**Que hacer:** poner fecha. Antes del 17 de mayo de 2026, Samuel (o Max) tiene que haber hecho 10 conversaciones con restaurantes reales. No "preguntar a un amigo", conversaciones formales tipo customer development. Si no se hacen, paramos hasta hacerlas.

### 2.5 Codigo del Sprint 0 y 1 no esta alineado con el modelo de negocio actual

Samuel construyo el codigo basandose en el ROADMAP original (busqueda + filtros simples). El modelo de negocio que hemos disenado despues (Pro tier con panel, boost, Google reviews, sistema propio de reviews, multilingua) es mucho mas complejo.

**Riesgo:** mucho del codigo actual habra que tirarlo o refactorizarlo profundamente. La impresion de "ya tenemos algo construido" es enganosa.

**Que hacer:** Max revisa el codigo de Samuel en detalle antes de firmar nada. Si la arquitectura es solida, perfecto. Si no, hay que decidir si refactorizar o reescribir desde cero. Esa decision afecta el calendario.

### 2.6 Distribucion: como nos encuentran los usuarios

Toda la estrategia asume que los turistas y locales descubriran la app. La realidad: app store discovery es brutal para apps nuevas, SEO tarda anos, paid acquisition cuesta dinero que no tenemos.

**Riesgo:** indexamos 1,700 a 4,500 restaurantes y tenemos cero usuarios.

**Posibles caminos para distribucion (todos requieren validacion):**
- Partnership con hoteles para QR en habitaciones
- Partnership con cruceros para folletos en escalas
- SEO local: dominar "best paella in Valencia" tipo de queries
- Google Ads en queries turisticas (caro, pero medible)
- Influencers gastronomicos locales (microinfluencers son baratos)
- Codigos QR en restaurantes Pro participantes (los restaurantes se convierten en canal)
- Press en medios turisticos locales y digitales

Hoy no tenemos plan concreto para ninguno. Esto es Sprint 4 mas o menos pero sin presupuesto definido.

### 2.7 La marca FoodMatch puede no estar disponible

No hemos comprobado si "FoodMatch" esta libre como marca registrada en EUIPO, en Espana, o en Alemania. No hemos comprobado dominios disponibles.

**Riesgo:** descubrimos a las 6 semanas que un FoodMatch estadounidense ya tiene marca en EU y nos toca cambiar de nombre.

**Que hacer ya (gratis o casi):**
- Buscar "FoodMatch" en https://euipo.europa.eu/eSearch/
- Buscar en https://sede.oepm.gob.es/eSede/es/
- Comprobar dominios: foodmatch.es, .com, .app, .ai, .eu
- Si todo libre: registrar dominios YA. Coste 50 a 200 EUR.
- Marca formal puede esperar a la SL, pero comprobar disponibilidad no.

### 2.8 Cumplimiento legal antes del primer cliente pagador

GDPR, AEPD, IVA, terminos y condiciones, politica de privacidad, cookie banner, contratos con procesadores (Stripe, OpenAI/Anthropic). Nada de esto esta hecho. Spanish AEPD es de los reguladores de privacidad mas activos de Europa.

**Riesgo:** primer cliente paga, primera queja de GDPR, primera multa. Las multas de AEPD pueden ser 20,000 EUR para PYME pequenas y suben rapido.

**Que hacer:** antes del primer cliente que paga:
- Privacy policy y cookie banner publicados
- Terms of service del usuario y del restaurante
- Contratos de procesador con cualquier servicio que toque datos personales
- Designar Data Protection Officer (DPO) si procesamos datos de menores o categorias especiales (probablemente no, pero confirmar)
- Asesor legal especializado en datos hace una pasada

Coste estimado de hacer esto bien: 1,500 a 3,000 EUR de abogado. Coste de no hacerlo bien: catastrofico.

### 2.9 Coste de IA escala con uso, revenue no escala con uso

Si el chatbot tiene exito y la gente lo usa mucho, el coste de OpenAI o Anthropic crece con cada query. El usuario no paga por query (free para usuarios). Si tenemos 10,000 usuarios al dia con 10 queries cada uno, son 100,000 calls/dia, lo que puede ser 100 a 1,000 USD/dia de coste de IA puro.

**Riesgo:** un momento viral nos lleva a la quiebra antes de que el revenue de los restaurantes lo absorba.

**Que hacer:**
- Caching agresivo de queries comunes desde el dia uno
- Rate limiting por IP y por sesion
- Hard budget cap mensual con alerta y degradacion de servicio si se excede
- Modelo cheaper como fallback (Haiku, GPT-4o-mini) cuando el budget se acerca al limite
- Estimacion de coste por usuario para validar margenes

### 2.10 No hemos hablado con un abogado todavia

Estamos haciendo planes basados en lo que sabemos (Max y yo). Un abogado mercantilista espanol nos dira en una hora cosas que cambian todo: como estructurar el SL para que Max no tenga problemas en Alemania, si la Ley de Startups aplica, riesgos especificos de la actividad, etc.

**Riesgo:** descubrir despues de incorporar la SL que la estructura no era la optima fiscalmente o legalmente.

**Que hacer:** programar una consulta con asesor fiscal/legal en las proximas 2 semanas. Coste 200 a 500 EUR. La inversion mas barata que vamos a hacer.

### 2.11 Conflicto de vision sin resolver

Preguntas que ni Max ni Samuel han contestado mutuamente:
- Bootstrap o levantar capital? Si capital, cuanto y para que?
- Crecimiento agresivo o lifestyle business sostenible?
- Vision de exit: vender en 3 a 5 anos, mantener forever, IPO?
- Si en mes 12 el negocio crece despacio, paramos, pivotamos, o aguantamos?
- Si recibimos oferta de compra en mes 18 por 500k EUR (250k cada uno), vendemos?

**Riesgo:** descubrimos en momento de crisis que tenemos visiones incompatibles.

**Que hacer:** llamada explicita sobre estas preguntas. Documentar las respuestas. Si hay desacuerdo grave, mejor saberlo ahora que despues.

### 2.12 Aislamiento mental de fundadores remotos

Dos fundadores en dos paises trabajando solos sin equipo, sin oficina compartida, sin comunidad local. Riesgo alto de que cada uno tire en su direccion en 3 meses sin darse cuenta.

**Que hacer:**
- Sync semanal fijo (mismo dia, misma hora, no cancelable)
- Demo semanal del progreso de cada uno
- Compartir un canal Slack o similar para comunicacion async
- Visita en persona cada 2 a 3 meses minimo (Max viaja a Espana o Samuel a Alemania)
- Buscar 1 a 2 mentores con experiencia en SaaS o food tech (Distrito Digital, KM Zero, etc)

### 2.13 Personalizacion del producto a Espana

El stack actual probablemente asume defaults internacionales. Hay cosas espanolas especificas que importan:
- Horarios atipicos: comida 14:00 a 16:00, cena 21:00 a 23:30 (Espana cena tarde)
- Temporadas: agosto medio cerrado, festividades locales con horarios distintos
- Categorias de cocina espanolas (tapas, raciones, menu del dia, sobremesa)
- Idioma valenciano/catalan: ignorarlo en Comunitat Valenciana es un error
- Precios en EUR con coma decimal (no punto)

**Que hacer:** lista de requisitos especificos al mercado espanol antes del lanzamiento.

### 2.14 No hay plan B si el wedge no funciona

Estamos asumiendo que la diferenciacion (profundidad local + bilingue + pequenos restaurantes) es suficiente para defendernos cuando Google AI Mode llegue a Espana. Si no lo es, no tenemos plan B.

**Posibles plan B (a explorar):**
- Pivot a B2B puro (vender a hoteles y operadores turisticos)
- Pivot vertical (solo paella, solo vegano, solo brunch)
- Geographic moat (dominar Comunitat Valenciana antes de expandir)
- Adquirir o ser adquiridos rapido

No hace falta tener plan B definido ahora, pero tener al menos las hipotesis listas para no improvisar bajo presion.

### 2.15 Customer support sera un problema

Cuando 100 restaurantes pagan 99 EUR/mes, esperan respuestas a sus dudas. 100 restaurantes generan facilmente 30 a 50 tickets/mes (foto no carga, menu no se actualiza, link de boost no funciona, etc). Dos fundadores remotos no pueden absorber esto a partir de cierto punto.

**Que hacer:**
- Definir desde el principio que es soporte y que no
- Self-service (FAQ, video tutoriales, chatbot interno)
- En Sprint 4 o 5: contratar persona de soporte parcial (200 a 500 EUR/mes en remoto) o externalizar

---

## 3. Que hay que hacer ANTES de seguir construyendo

Lista priorizada. Si los puntos 1 a 5 no se hacen, no se debe escribir mas codigo nuevo.

### Bloque A: alineacion entre cofundadores (semana 1)

1. **Samuel lee y responde** PRICING_PROPOSAL.md, FOUNDER_AGREEMENT.md, MARKET_RESEARCH.md. Aprueba o discute punto por punto.
2. **Llamada Max + Samuel** de 2 horas para alinear:
   - Reparto 50/50 confirmado
   - Vesting 4 anos / 1 ano cliff confirmado (o renegociar)
   - Salario fase 2 (2,000 EUR a partir de 5,000 EUR MRR) confirmado
   - Roles CEO/CTO confirmados
   - Vision de exit (bootstrap o capital, 3 anos o 10 anos)
   - Mercado de lanzamiento (Alicante, Valencia, Pamplona, otro)
   - Trigger para parar el proyecto si no funciona (que metrica, que mes)
3. **Compartir accesos** de github, dominios, servicios que existan

### Bloque B: validacion de mercado (semanas 1 a 4)

4. **Trademark check FoodMatch** en EUIPO y OEPM (1 hora, gratis)
5. **Comprar dominios** disponibles ASAP (200 EUR maximo)
6. **10 a 20 conversaciones con restaurantes reales** en el mercado de lanzamiento elegido. Format: 30 a 45 minutos por conversacion, presencial o video. Preguntas concretas:
   - Cuanto pagas hoy a TheFork, Glovo, etc en suma?
   - Que necesitas que Google muestre mejor?
   - Pagarias 99 EUR/mes por panel + IA + multilingue + reviews?
   - Pagarias 50 EUR/semana extra por aparecer destacado?
   - Que feature te haria pagar mas?
   - Si dijeras no, por que? Que te haria decir si?
7. **5 a 10 conversaciones con turistas o locales** que coman fuera frecuentemente:
   - Como buscas restaurantes que no conoces hoy?
   - Que apps usas? Que les falta?
   - Usarias un chatbot IA para recomendarte? Por que si o no?
8. **Documentar resultados** de las conversaciones. Numero crudo: % de restaurantes que pagaria 99 EUR/mes. Si <30%, parar y replantear precio o producto.

### Bloque C: legal y administrativo (semanas 2 a 4)

9. **Consulta con abogado mercantilista** en Espana especializado en startups. Coste 200 a 500 EUR. Confirmar:
   - Estructura SL en Alicante (o donde proceda)
   - Aplicabilidad de Ley de Startups
   - Setup cross-border Max/Alemania
   - Pacto de socios basado en nuestro borrador
10. **Max inicia tramite NIE** (8 semanas tipico, polo mas largo)
11. **Confirmar en que ciudad se incorpora la SL** (Navarra es opcion si Samuel quiere domiciliarla en su residencia, vs Alicante por marca de mercado)

### Bloque D: tecnico (semanas 3 a 4)

12. **Max revisa codigo Samuel** y decide: continuar, refactorizar, o reescribir
13. **Estimacion de coste IA por usuario** con caching agresivo simulado
14. **Comprobar Google Places API** disponibilidad y coste para Alicante o ciudad elegida
15. **Lista de requisitos especificos Espana** (horarios, categorias, idiomas)

### Bloque E: distribucion (semana 4)

16. **Plan de adquisicion de usuarios** v0. Aunque sea hipotetico, decidir 2 o 3 canales prioritarios (hoteles? SEO? Ads? Influencers?). Sin esto seguimos construyendo a ciegas.

---

## 4. Decisiones que necesitan acuerdo Max + Samuel (sin las cuales no se avanza)

| # | Decision | Estado |
|---|---|---|
| 1 | Reparto 50/50 confirmado | Pendiente Samuel |
| 2 | Roles CEO Samuel / CTO Max confirmados | Pendiente Samuel |
| 3 | Vesting 4 anos / 1 ano cliff (o renegociar) | Pendiente Samuel |
| 4 | Compensacion fases segun apartado 12 actualizado | Pendiente Samuel |
| 5 | Modelo dos tiers + boost (PRICING_PROPOSAL.md) | Pendiente Samuel |
| 6 | Mercado de lanzamiento | Pendiente ambos |
| 7 | Domicilio social SL | Pendiente ambos |
| 8 | Vision de exit (bootstrap o capital, plazo) | Pendiente ambos |
| 9 | Trigger de parada si no funciona | Pendiente ambos |
| 10 | Plan de relocacion / presencia local | Pendiente Samuel |

---

## 5. Plan sugerido de las proximas 4 semanas

### Semana 1 (5 al 11 de mayo)
- Lunes: Max envia este documento + PRICING_PROPOSAL + FOUNDER_AGREEMENT a Samuel
- Miercoles: llamada de alineacion Max + Samuel (2 a 3 horas)
- Jueves: trademark check + compra dominios
- Viernes: definir mercado de lanzamiento + lista de 20 restaurantes a contactar

### Semana 2 (12 al 18 de mayo)
- Lunes: contactar abogado para consulta
- Lunes a viernes: 5 conversaciones con restaurantes
- Lunes a viernes: 3 conversaciones con usuarios
- Viernes: Max inicia tramite NIE

### Semana 3 (19 al 25 de mayo)
- Lunes a viernes: 5 conversaciones mas con restaurantes
- Lunes a viernes: 3 conversaciones mas con usuarios
- Miercoles: consulta legal
- Viernes: revisar codigo Samuel + plan tecnico

### Semana 4 (26 de mayo al 1 de junio)
- Lunes: documentar resultados validacion
- Miercoles: decision GO / NO GO basada en numeros reales
- Viernes: si GO, replantar roadmap con info validada. Si NO GO, replantear modelo o producto.

**Decision GO o NO GO en mes 1.** Si los datos de validacion son malos, mejor saberlo ahora que en mes 6.

---

## 6. Resumen brutal en una linea

Tenemos planes excelentes para una empresa que todavia no existe, con un cofundador que no ha confirmado nada, sin clientes, sin usuarios, sin ciudad de lanzamiento decidida, sin abogado, sin marca registrada. Antes de un solo commit mas de codigo, hay que hacer las 16 acciones del apartado 3.
