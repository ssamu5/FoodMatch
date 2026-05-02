# Investigacion de mercado y posicionamiento estrategico

**Fecha:** 2 de mayo de 2026
**Mercado piloto:** Alicante ciudad (Espana)
**Objetivo del documento:** sustituir las proyecciones sin base del documento `ANALYSIS_AND_IMPROVEMENTS.md` por datos verificables y un analisis competitivo honesto.

Toda cifra en este documento tiene fuente citada al final.

---

## 1. El mercado de Alicante en numeros reales

| Variable | Cifra | Implicacion |
|---|---|---|
| Restaurantes en la ciudad de Alicante | 1,700+ | Alta densidad. Indexable en semanas, no anos. |
| Turistas en la ciudad (2025) | 1.5 millones (record) | Demanda real, mayoritariamente estacional. |
| Turistas extranjeros en la provincia (2025) | 8.45 millones | Mercado bilingue obligatorio desde el dia uno. |
| Gasto medio diario por turista | 138.40 EUR | Margen para servicios premium. |
| Pasajeros de cruceros (2025) | 250,000 en 103 escalas | Audiencia de horas, no dias. Necesita respuestas instantaneas. |
| Asistentes a 5 festivales locales | 400,000 | Picos de demanda durante Hogueras, Moros y Cristianos, etc. |
| Designacion 2025 | Capital Espanola de Gastronomia | 42M EUR de impacto economico declarado. |

**Lectura honesta:** Alicante es uno de los mejores mercados piloto posibles en Espana para una app de descubrimiento gastronomico. Densidad alta, turismo masivo, ciudad manejable, marca gastronomica reciente. Esto es real y favorable.

**Lectura honesta numero dos:** la estacionalidad es un riesgo. Octubre a febrero hay menos turistas. El producto necesita servir tambien al residente local, no solo al turista, o las metricas se hunden fuera de temporada.

---

## 2. Panorama competitivo

### 2.1 Booking y descubrimiento clasico

| Player | Posicion en Espana | Modelo | Amenaza |
|---|---|---|---|
| TheFork (ex-ElTenedor, propiedad TripAdvisor) | Lider en Espana, 30,000+ restaurantes, 20M comensales/mes globalmente | Comision 2 a 4 EUR por comensal | Alta. Domina la reserva. |
| Google Maps | Default universal de descubrimiento | Gratis al usuario, ads al restaurante | Muy alta. Es la primera parada de todos. |
| TripAdvisor | Reviews de turistas | Ads + TheFork upsell | Media. Su debilidad es UX antiguo. |
| OpenTable | Cobertura debil en Espana, fuerte en US/UK | Comision por reserva | Baja en Espana hoy. |
| Yelp | Marginal en Espana | Reviews + ads | Baja. |

### 2.2 Delivery (no es nuestro espacio, pero define la zona prohibida)

Cuotas Espana: Glovo 41%, Just Eat 39%, Uber Eats 20%. Combinadas mueven el 100% del delivery con flotas propias y exclusividades. **Recomendacion explicita: no entrar en delivery.** Es una guerra de capital y logistica que perdemos seguro.

### 2.3 La verdadera amenaza: IA conversacional para descubrir restaurantes

Este es el espacio que el usuario describe como "ChatGPT especializado para restaurantes". Hay que ser claros: el espacio ya existe y se mueve rapido.

**Perplexity + OpenTable (lanzado 2025):** un usuario escribe "sitio italiano romantico con cacio e pepe" y recibe restaurantes con horarios reservables y boton de Reservar integrado. Funciona globalmente. La debilidad en Espana es que OpenTable tiene cobertura escasa aqui.

**Google AI Overviews + Ask Maps + Agentic Booking:** ya activo en Estados Unidos, Reino Unido, India, Canada y Australia. Anunciado para expansion a 200+ paises. **No esta en Espana todavia.** Cuando llegue (estimacion conservadora: 6 a 18 meses), la pregunta "donde como esta noche en Alicante" la responde Google directamente sin necesidad de salir del buscador. El 60% de las busquedas de Google ya se resuelven sin click a finales de 2025.

**ChatGPT search:** lider en recomendaciones generales. Se apoya principalmente en Yelp (debil en Espana). Los datos para Espana son por tanto pobres comparados con Estados Unidos.

**Dato clave para nuestro posicionamiento:** ChatGPT y Perplexity coinciden en 0% de los restaurantes recomendados en estudios locales. No hay un "ganador" en recomendaciones de IA; la calidad del indice subyacente es lo que decide.

### 2.4 Apps locales en Alicante

Lo que ya existe en la ciudad:

- App oficial Alicante Turismo (alicanteturismo.com): directorio basico, no conversacional, no transaccional.
- CostaBlanca.nl: orientada a turistas neerlandeses, no a restaurantes especificamente.
- Sin app de descubrimiento conversacional gastronomico especifica para Alicante.

**Conclusion del panorama local:** la afirmacion del usuario "no existe tal app" es correcta para Alicante y para Espana en formato consumer-facing conversacional. Es correcta hoy. No esta garantizado que siga siendolo en 12 meses.

---

## 3. Donde esta el wedge real

### 3.1 Lo que NO es un wedge defensible

- "Tener un chatbot de IA": cualquiera lo monta con una llamada a OpenAI o Anthropic. No es ventaja competitiva.
- "App moderna y rapida": Google Maps tambien lo es, gratis, y ya tiene el indice.
- "Recomendaciones IA": Perplexity y ChatGPT ya las dan.

Si nuestro pitch es solo eso, nos extinguimos cuando Google Agentic Booking aterrice en Espana.

### 3.2 Lo que SI puede ser defensible

Tres angulos que combinados forman un wedge real:

**A. Profundidad local en Alicante que ningun gigante tiene.**
Indexar los 1,700 restaurantes a un nivel de detalle que Google y Perplexity no alcanzan: menus actualizados con precios, fotos reales (no solo las que sube el restaurante), atributos por dieta y alergenos, horarios atipicos durante Hogueras y festivos locales, recomendaciones cruzadas (este es bueno para grupos, este otro para parejas). Eso es trabajo de campo, no de modelo.

**B. Inclusion del pequeno restaurante.**
TheFork penaliza al restaurante pequeno con comisiones del 2 a 4 EUR por comensal y empuja descuentos del 20 al 50%. Un restaurante de 30 cubiertos con margen ajustado no puede pagarlo sin perder dinero. Nosotros podemos ser su unico canal digital decente, sin obligar a descuento, con suscripcion plana baja. Esto es defensible porque construimos relacion directa con el restaurante, no algoritmica.

**C. Bilingue real, con contexto local verificado.**
El turista frances, aleman, britanico u holandes en Costa Blanca usa Google Maps en su idioma y recibe traducciones automaticas mediocres y reviews de hace anos. Una IA que responde en su idioma con datos verificados de Alicante (horarios actuales, platos disponibles esta semana, precios reales) es valor inmediato. La paridad bilingue espanol-ingles desde el dia uno, anadiendo aleman, holandes y frances en sprint 4 o 5, es realista y diferenciador.

### 3.3 La narrativa correcta

Cambiar el posicionamiento interno de "asistente IA conversacional" a algo como **"la guia completa y actualizada de Alicante, con respuestas instantaneas en tu idioma"**. La diferencia es que la primera frase compite con OpenAI; la segunda compite con la guia oficial de turismo y con Google Maps en una dimension donde ambos son malos.

---

## 4. Modelo de negocio basado en cifras reales

### 4.1 Que paga hoy un restaurante en Alicante

- Comision TheFork: 2 a 4 EUR por comensal. Restaurante turistico con 50 reservas online por dia paga 100 a 200 EUR diarios, es decir 3,000 a 6,000 EUR mensuales.
- Benchmark de marketing en restauracion (general): 5 a 10% de la facturacion mensual.
- Restaurante pequeno tipico en Alicante facturando 15 a 30k EUR/mes tiene un presupuesto de marketing de 750 a 3,000 EUR/mes.

Conclusion: hay margen para una suscripcion mensual baja sin desplazar otros gastos. Si pedimos 30 a 50 EUR/mes a cambio de presencia digital y panel propio, encaja.

### 4.2 Modelo de monetizacion adoptado

Tras discusion entre Max y Samuel, se ha simplificado a dos niveles para evitar fatiga de eleccion en restauradores no tecnicos. Detalles completos y decisiones pendientes en `PRICING_PROPOSAL.md`.

Resumen:

- **Listado: gratis.** Ficha basica con datos publicos. Cobertura del 100% de Alicante desde el dia uno (necesario para que la IA recomiende bien).
- **Pro: 99 EUR/mes.** Fotos, indicador de Google rating + sistema propio de reviews, menu completo traducido a 4 idiomas, panel de gestion, analytics, badge verificado. Sin comision sobre reservas.
- **Boost (add-on opcional, solo Pro): 50 EUR/semana.** Posicionamiento prioritario etiquetado como "Promocionado", maximo 3 slots activos por codigo postal y maximo 2 visibles por respuesta de IA.

Benchmark del precio de 99 EUR/mes:
- CoverManager (player local lider): 60 a 250 EUR/mes sin comision
- TheFork comisiones equivalentes para un restaurante medio: 1,000 a 6,000 EUR/mes
- Tableo: alrededor de 85 EUR/mes para volumen medio
- Mediana SaaS small business: 29 a 99 USD/mes

99 EUR posiciona como producto serio, debajo del umbral psicologico de 100 EUR, en linea con CoverManager. Datos del sector: precios mas altos correlacionan con menor churn.

Math a precio 99 EUR/mes:

| Restaurantes Pro | MRR base | + Boost (~5 a 15% activo) | MRR total | ARR |
|---|---|---|---|---|
| 50 | 4,950 EUR | 250 EUR | ~5,200 EUR | 62k EUR |
| 100 | 9,900 EUR | 750 EUR | ~10,650 EUR | 128k EUR |
| 250 | 24,750 EUR | 2,000 EUR | ~26,750 EUR | 321k EUR |
| 500 | 49,500 EUR | 4,500 EUR | ~54,000 EUR | 648k EUR |

Con 1,700 restaurantes en la ciudad, 250 Pro a 24 meses es 14% de penetracion. Realista si la ejecucion funciona.

**El precio condiciona el producto.** No basta con un listing y un chatbot. El restaurante Pro necesita ver, cada mes: trafico real, reservas o pedidos generados, datos accionables, mantenimiento del menu sin esfuerzo. Si no entregamos eso, churn alto y modelo roto.

### 4.3 Modelos descartados o aplazados

**Comision sobre reservas:** descartado. TheFork ya domina ese modelo y exprime al pequeno con 2 a 4 EUR por comensal. No competimos en su terreno.

**Tourist concierge B2B con hoteles y cruceros:** aplazado a ano 2. Requiere producto maduro que mostrar a hoteles. Mercado real (250,000 cruceristas + miles de hoteles), pero no es prioridad mientras peleamos por los primeros 100 restaurantes.

### 4.4 Lo que cuesta tener producto real

- Indexacion inicial de 1,700 restaurantes: 2 a 3 semanas de trabajo de una persona con scraping + Google Places API + verificacion manual. Coste real: si lo hacemos nosotros, tiempo. Si lo subcontratamos, 1,500 a 3,000 EUR.
- Mantenimiento mensual del indice: 5 a 10 horas semanales, o trasladado a los restaurantes via panel cuando se suscriban al Plan Pro.
- Coste IA por consulta: GPT-4 cuesta 0.003 a 0.01 USD por pregunta segun tamano. Con caching agresivo y respuestas pre-computadas para preguntas frecuentes, viable. Sin caching, mata el margen rapido.
- Hosting tipico para esta escala: 50 a 200 EUR/mes los primeros 12 meses.

---

## 5. Riesgos honestos

### 5.1 Riesgo competitivo principal

Google Agentic Booking llega a Espana en algun momento entre los proximos 6 y 18 meses. En ese momento, la pregunta en lenguaje natural "donde como esta noche cerca de la playa de San Juan" la contesta Google directamente. **Si nuestro unico valor es la interfaz IA, nos quedamos sin negocio.** Por eso los puntos B y C de la seccion 3.2 (relacion con pequenos restaurantes y bilingue verificado) son criticos: son lo que sobrevive a la llegada de Google.

### 5.2 Riesgo de cold start

Sin restaurantes utiles en el indice, los usuarios no vuelven. Sin usuarios, los restaurantes no pagan. Como romperlo:
- Lanzar con el 100% de Alicante indexado de entrada, no como progreso gradual.
- Periodo gratuito de 6 a 12 meses para los primeros 100 a 200 restaurantes.
- Marketing fisico durante temporada alta y festividades (flyers, QR en hoteles, partnership con turismo municipal).

### 5.3 Riesgo de adquisicion vs riesgo de extincion

- Mejor escenario realista: TheFork, Glovo o un grupo hotelero adquiere FoodMatch para tener capa IA + relacion con pequenos restaurantes. Multiplo de adquisicion bajo (1 a 3M EUR) si tenemos 500 restaurantes pagando y 50,000 usuarios activos.
- Peor escenario realista: Google llega antes, nadie usa otra cosa, cerramos.
- Tiempo critico desde lanzamiento del MVP hasta defendibilidad probada: 12 meses.

### 5.4 Riesgo de dependencia LLM

OpenAI o Anthropic suben precios o cambian terminos. Mitigacion: arquitectura agnostica al proveedor, poder cambiar de Anthropic a OpenAI a Mistral en una capa. Esto es trabajo de sprint 2.

---

## 6. Recomendaciones tacticas para el roadmap actual

Comparado con `ROADMAP.md` y `ANALYSIS_AND_IMPROVEMENTS.md`, estos son los cambios que recomiendo basados en lo anterior:

1. **Reducir scope geografico del MVP a Alicante puro.** Ninguna mencion de "expansion a otras ciudades" hasta que Alicante funcione comercialmente. Esto no esta claro en el roadmap actual.

2. **Indexacion de 1,700 restaurantes como prioridad numero uno**, antes que cualquier feature avanzada. Sin datos limpios el chatbot recomienda mal y muere. Esto deberia ser sprint 1.5, no algo asumido.

3. **Cambiar la narrativa publica y la descripcion del repositorio.** "Asistente IA conversacional" es commodity. "Guia completa y verificada de Alicante con respuestas instantaneas" es defensible. La descripcion actual del repo en GitHub deberia reescribirse.

4. **Sprint 5 (panel restaurantes) es mas urgente de lo que dice el roadmap actual.** Sin panel no podemos cobrar al restaurante; sin cobro no hay negocio. Mover a sprint 3 o 3.5.

5. **Validar con 10 a 20 restaurantes reales en Alicante antes de seguir construyendo.** Samuel deberia tener esas conversaciones esta semana o la siguiente. Preguntas concretas para validar:
   - Pagarias 99 EUR/mes por panel completo, menu auto-traducido a 4 idiomas, fotos gestionables, reviews de Google integradas, analytics y aparecer en respuestas de IA, sin comision por reserva?
   - Pagarias 50 EUR/semana adicional para aparecer prioritario durante una semana de fiesta o apertura?
   - Que dato sobre tu restaurante crees que Google muestra mal hoy?
   - Cuanto pagas hoy a TheFork, Just Eat, Glovo o similares en suma?
   Pregunta de control: si no pagarias 99 EUR/mes, que necesitarias ver para pagarlo?
   Si menos del 30% de los preguntados pagaria a 99 EUR/mes, hay dos caminos: bajar precio (modelo se vuelve marginal) o subir valor (mas features, mas trabajo). No seguir construyendo a ciegas.

6. **No competir en delivery.** Glovo, Just Eat y Uber Eats tienen capital, flotas y exclusividades. La opcion del README de "el restaurante recibe el pedido por WhatsApp" es razonable como sustituto liviano sin entrar en logistica.

7. **Stripe no es prioridad para el MVP.** El usuario no pagara en la app si solo descubrimos restaurantes. Stripe entra cuando habilitemos reservas con prepago o pedidos con prepago, no antes. El sprint 3 actual esta sobrecargado.

8. **Bilingue espanol e ingles desde el dia uno.** Hoy el repo es solo en espanol. Anadir ingles antes del lanzamiento publico, aleman/holandes/frances despues.

---

## 7. Que cambia respecto al documento anterior

`ANALYSIS_AND_IMPROVEMENTS.md` afirmaba un "potencial de 40,000 a 50,000 EUR/ano con 100 restaurantes" sin fuente, calculo ni base. Tambien daba un "score de viabilidad 6.5/10 a 8/10" sin metodologia. Esas cifras son aspiracion, no analisis.

En este documento, todas las cifras tienen origen verificable. Las proyecciones de ingresos estan acotadas a supuestos explicitos (250 restaurantes Plan Pro a 99 EUR/mes = ~24,750 EUR/mes mas boost) que se pueden cuestionar y contrastar contra realidad mes a mes.

Sugerencia: marcar `ANALYSIS_AND_IMPROVEMENTS.md` como obsoleto o archivarlo, dejando este como documento de referencia de mercado vivo.

---

## Fuentes

Datos de mercado y turismo de Alicante:
- [Pure Costa Blanca, Tourism figures 2025 for the province of Alicante](https://www.purecostablanca.com/en/tourism-province-of-alicante-2025-in-facts-and-figures/)
- [TodoAlicante, Alicante Breaks Tourist Record in 2025 with 1.5 Million Visitors](https://www.todoalicante.es/english/alicante-breaks-tourist-record-20260122030139-nt.html)
- [tourspain.es, Alicante, the star of Spanish gastronomy in 2025](https://www.tourspain.es/en/b2b/alicante-spanish-gastronomy-2025/)
- [Experiencias Costa Blanca, Spanish Capital of Gastronomy 2025](https://www.experienciascostablanca.com/en/alicante-spanish-capital-of-gastronomy-2025/)

Panorama competitivo en booking y discovery:
- [TheFork Manager, Restaurant Software Price](https://www.theforkmanager.com/en/restaurant-software-price)
- [Restaurant Booking System, Best TheFork alternatives 2026](https://restaurantbookingsystem.com/compare/thefork-alternatives/)
- [Deru, TheFork vs CoverManager 2026](https://deru.es/en/blog/software-restaurantes-reservas/)
- [Datanyze, TheFork vs OpenTable Reservations widget market share](https://www.datanyze.com/market-share/restaurant-reservations--440/thefork-market-share)
- [CoverManager pricing on Capterra](https://www.capterra.com/p/229015/CoverManager/)
- [Monetizely, SaaS Pricing Benchmark Study 2025](https://www.getmonetizely.com/articles/saas-pricing-benchmark-study-2025-insights-from-100-companies)

Mercado de delivery (referencia, no objetivo):
- [Statista, Spain food delivery market share by company 2020-2022](https://www.statista.com/statistics/1349384/market-share-food-delivery-companies-spain/)
- [Ken Research, Spain Food Delivery Market 2019 to 2030](https://www.kenresearch.com/spain-online-food-delivery-aggregators-market)

IA conversacional y descubrimiento:
- [OpenTable Restaurant Solutions, Perplexity integration](https://www.opentable.com/restaurant-solutions/resources/perplexity/)
- [TechRadar, Perplexity can help you figure out where to eat and book your table too](https://www.techradar.com/ai-platforms-assistants/perplexity-can-help-you-figure-out-where-to-eat-and-book-your-table-too)
- [Search Engine Journal, Google Extends AI Travel Planning And Agentic Booking In Search](https://www.searchenginejournal.com/google-extends-ai-travel-planning-and-agentic-booking-in-search/561251/)
- [Google blog, Explore new ways to plan and book travel with AI in Search](https://blog.google/products-and-platforms/products/search/agentic-plans-booking-travel-canvas-ai-mode/)
- [Marqii, The 2025 Search Recap: What It Means for Restaurants in 2026](https://blog.marqii.com/the-2025-search-recap-for-restaurants/)
- [Minneapolis Made, What ChatGPT and Perplexity Say About Minneapolis Businesses](https://www.minneapolismade.com/blog/chatgpt-vs-perplexity-twin-cities-business-citations/)
- [The Recursive, Czech Choice Raises Over 6M Euro to Expand AI Restaurant-Tech Platform in Europe](https://therecursive.com/choice-raises-7-1m-ai-restaurant-tech-expansion-europe/)

Marketing y economia del restaurante:
- [Syspree, Boost Digital Marketing In Spain With Proven Plans In 2025](https://syspree.com/blog/digital-marketing-in-spain-in-2025/)
- [MarketMan, Restaurant Marketing 101: Ultimate Guide for Growth in 2025](https://www.marketman.com/blog/restaurant-marketing-101-ultimate-guide-for-growth-in-2025)

Apps locales en Alicante:
- [Alicante Turismo, Maps brochures and Apps](https://alicanteturismo.com/en/maps-brochures-and-apps/)
- [Pure Costa Blanca, Best and nicest restaurants in Alicante 2026](https://www.purecostablanca.com/en/restaurants-alicante/)
