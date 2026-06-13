// Bilingual legal pages for the FoodMatch website (ES source of truth + EN).
// TEMPLATE text aligned to Spanish LSSI-CE (Ley 34/2002), RGPD (UE 2016/679)
// and LOPDGDD (3/2018). NOT legal advice: the [PLACEHOLDERS] must be filled with
// the real owner details and the whole set reviewed by a lawyer before publishing.

const EMAIL = 'foodmatchinfo@gmail.com'
const IG = 'https://instagram.com/foodmatch_es'

// Render a legal page body. blocks: [{ h:{es,en}, body:{es,en} }] where body is HTML.
function render(lang, title, updated, intro, blocks) {
  const sections = blocks
    .map(
      (b) =>
        `<h2 class="serif" style="font-size:1.3rem;margin:1.8rem 0 0.5rem">${b.h[lang]}</h2>\n<div style="color:var(--tinta-70);line-height:1.7">${b.body[lang]}</div>`,
    )
    .join('\n')
  return `<section class="section"><div class="wrap" style="max-width:74ch">
  <p class="eyebrow">FoodMatch</p>
  <h1 class="display-md">${title[lang]}</h1>
  <p class="muted" style="margin:0.4rem 0 1.6rem;font-size:0.9rem">${updated[lang]}</p>
  ${intro ? `<p class="lede">${intro[lang]}</p>` : ''}
  ${sections}
</div></section>`
}

// While false, every legal route shows a simple "coming soon" placeholder.
// Flip to true to publish the full legal text (the functions below), after the
// [PLACEHOLDERS] are filled and a lawyer has reviewed it.
const SHOW_FULL = false

function comingSoon(heading, lang) {
  const note = {
    es: 'Estamos preparando esta página. Estará disponible muy pronto. Mientras tanto, puedes escribirnos a',
    en: 'We are preparing this page. It will be available very soon. In the meantime, you can write to us at',
  }
  return `<section class="section"><div class="wrap center" style="max-width:58ch">
  <p class="eyebrow">FoodMatch</p>
  <h1 class="display-md">${heading[lang]}</h1>
  <p class="lede" style="margin-top:1.1rem">${lang === 'es' ? 'Próximamente.' : 'Coming soon.'}</p>
  <p class="muted" style="margin-top:0.8rem">${note[lang]} <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
</div></section>`
}

const UPDATED = {
  es: 'Última actualización: 13 de junio de 2026',
  en: 'Last updated: 13 June 2026',
}

// ---------- Aviso Legal ----------
function avisoLegal(lang) {
  return render(
    lang,
    { es: 'Aviso Legal', en: 'Legal Notice' },
    UPDATED,
    {
      es: 'Este aviso legal regula el acceso y uso del sitio web foodmatch.es, conforme a la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).',
      en: 'This legal notice governs access to and use of the website foodmatch.es, in accordance with Spanish Law 34/2002 on Information Society Services and Electronic Commerce (LSSI-CE).',
    },
    [
      {
        h: { es: '1. Titular del sitio web', en: '1. Website owner' },
        body: {
          es: `<p>Titular: <strong>[TITULAR: nombre o razón social]</strong>.<br/>NIF/CIF: <strong>[NIF / CIF]</strong>.<br/>Domicilio: <strong>[DIRECCIÓN POSTAL]</strong>, Valencia, España.<br/>Correo de contacto: <a href="mailto:${EMAIL}">${EMAIL}</a>.<br/>Instagram: <a href="${IG}" target="_blank" rel="noopener">@foodmatch_es</a>.</p>`,
          en: `<p>Owner: <strong>[TITULAR: name or company name]</strong>.<br/>Tax ID (NIF/CIF): <strong>[NIF / CIF]</strong>.<br/>Address: <strong>[POSTAL ADDRESS]</strong>, Valencia, Spain.<br/>Contact email: <a href="mailto:${EMAIL}">${EMAIL}</a>.<br/>Instagram: <a href="${IG}" target="_blank" rel="noopener">@foodmatch_es</a>.</p>`,
        },
      },
      {
        h: { es: '2. Objeto', en: '2. Purpose' },
        body: {
          es: '<p>FoodMatch es una plataforma de descubrimiento de restaurantes en Valencia que ayuda a las personas a encontrar dónde comer y permite a los restaurantes darse a conocer. El sitio se encuentra en fase piloto.</p>',
          en: '<p>FoodMatch is a restaurant discovery platform for Valencia that helps people find where to eat and lets restaurants get discovered. The site is in a pilot phase.</p>',
        },
      },
      {
        h: { es: '3. Condiciones de uso', en: '3. Conditions of use' },
        body: {
          es: '<p>El usuario se compromete a hacer un uso lícito del sitio, a no realizar actividades que dañen, sobrecarguen o impidan su normal funcionamiento, y a respetar la legislación vigente y los derechos de terceros.</p>',
          en: '<p>Users agree to use the site lawfully, not to carry out activities that damage, overload or impair its normal operation, and to respect applicable law and the rights of third parties.</p>',
        },
      },
      {
        h: { es: '4. Propiedad intelectual e industrial', en: '4. Intellectual and industrial property' },
        body: {
          es: '<p>La marca FoodMatch, el logotipo, el diseño del sitio y sus contenidos son titularidad del Titular o se utilizan con autorización. No se permite su reproducción, distribución o transformación sin consentimiento expreso.</p>',
          en: '<p>The FoodMatch brand, logo, site design and its contents belong to the Owner or are used with permission. Reproduction, distribution or transformation without express consent is not permitted.</p>',
        },
      },
      {
        h: { es: '5. Responsabilidad', en: '5. Liability' },
        body: {
          es: '<p>Durante el piloto, parte de la información de restaurantes mostrada puede ser de muestra hasta su verificación. El sitio puede contener enlaces a terceros (por ejemplo, WhatsApp); el Titular no se responsabiliza de los contenidos ni del funcionamiento de dichos servicios externos.</p>',
          en: '<p>During the pilot, some of the restaurant information shown may be sample data until verified. The site may contain links to third parties (for example, WhatsApp); the Owner is not responsible for the content or operation of those external services.</p>',
        },
      },
      {
        h: { es: '6. Legislación aplicable y jurisdicción', en: '6. Governing law and jurisdiction' },
        body: {
          es: '<p>Este aviso legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Valencia, salvo que la normativa de consumo establezca otro fuero.</p>',
          en: '<p>This legal notice is governed by Spanish law. For any dispute, the parties submit to the courts of Valencia, unless consumer protection rules establish a different jurisdiction.</p>',
        },
      },
    ],
  )
}

// ---------- Política de Privacidad ----------
function privacidad(lang) {
  return render(
    lang,
    { es: 'Política de Privacidad', en: 'Privacy Policy' },
    UPDATED,
    {
      es: 'En FoodMatch respetamos tu privacidad. Esta política explica qué datos personales tratamos, con qué finalidad y qué derechos tienes, conforme al Reglamento (UE) 2016/679 (RGPD) y a la LOPDGDD 3/2018.',
      en: 'At FoodMatch we respect your privacy. This policy explains what personal data we process, for what purpose and what rights you have, in accordance with Regulation (EU) 2016/679 (GDPR) and Spanish Law 3/2018 (LOPDGDD).',
    },
    [
      {
        h: { es: '1. Responsable del tratamiento', en: '1. Data controller' },
        body: {
          es: `<p><strong>[TITULAR: nombre o razón social]</strong>, NIF/CIF <strong>[NIF / CIF]</strong>, con domicilio en <strong>[DIRECCIÓN POSTAL]</strong>, Valencia (España). Contacto: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`,
          en: `<p><strong>[TITULAR: name or company name]</strong>, Tax ID <strong>[NIF / CIF]</strong>, address <strong>[POSTAL ADDRESS]</strong>, Valencia (Spain). Contact: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`,
        },
      },
      {
        h: { es: '2. Qué datos tratamos', en: '2. What data we process' },
        body: {
          es: '<p>Tratamos los datos que nos facilitas a través del formulario de alta o reclamación de restaurante: nombre del restaurante, nombre de la persona de contacto, correo electrónico, teléfono y el mensaje que escribas. El sitio web no usa cuentas de usuario. La aplicación móvil guarda tus preferencias y sitios guardados en el almacenamiento local de tu dispositivo.</p>',
          en: '<p>We process the data you provide through the restaurant claim or sign-up form: restaurant name, contact person name, email, phone and the message you write. The website has no user accounts. The mobile app stores your preferences and saved places in your device local storage.</p>',
        },
      },
      {
        h: { es: '3. Finalidad y base jurídica', en: '3. Purpose and legal basis' },
        body: {
          es: '<p>Usamos tus datos para gestionar tu solicitud, responder a tus consultas y, en su caso, dar de alta tu restaurante. La base jurídica es tu consentimiento y la aplicación de medidas precontractuales a petición tuya, así como nuestro interés legítimo en responderte.</p>',
          en: '<p>We use your data to manage your request, answer your enquiries and, where applicable, list your restaurant. The legal basis is your consent and pre-contractual steps taken at your request, as well as our legitimate interest in replying to you.</p>',
        },
      },
      {
        h: { es: '4. Conservación', en: '4. Retention' },
        body: {
          es: '<p>Conservamos tus datos el tiempo necesario para gestionar tu solicitud y mientras no solicites su supresión, salvo obligaciones legales que exijan conservarlos durante más tiempo.</p>',
          en: '<p>We keep your data for as long as needed to handle your request and until you ask us to delete it, unless legal obligations require longer retention.</p>',
        },
      },
      {
        h: { es: '5. Destinatarios y encargados', en: '5. Recipients and processors' },
        body: {
          es: '<p>No vendemos tus datos. Para prestar el servicio usamos proveedores que actúan como encargados del tratamiento: Supabase (base de datos donde se almacena el formulario), Vercel (alojamiento del sitio) y Google (fuentes web, que pueden registrar tu dirección IP al cargar las tipografías). Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo (por ejemplo, EE. UU.) con garantías adecuadas, como las cláusulas contractuales tipo de la Comisión Europea.</p>',
          en: '<p>We do not sell your data. To provide the service we use suppliers acting as processors: Supabase (database storing the form), Vercel (site hosting) and Google (web fonts, which may log your IP when loading the typefaces). Some of these suppliers may process data outside the European Economic Area (for example, the US) under appropriate safeguards such as the European Commission Standard Contractual Clauses.</p>',
        },
      },
      {
        h: { es: '6. Tus derechos', en: '6. Your rights' },
        body: {
          es: `<p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a <a href="mailto:${EMAIL}">${EMAIL}</a>. Si consideras que no hemos atendido correctamente tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>`,
          en: `<p>You can exercise your rights of access, rectification, erasure, objection, restriction and portability by writing to <a href="mailto:${EMAIL}">${EMAIL}</a>. If you believe we have not handled your request properly, you can complain to the Spanish Data Protection Agency (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>`,
        },
      },
      {
        h: { es: '7. Seguridad y menores', en: '7. Security and minors' },
        body: {
          es: '<p>Aplicamos medidas técnicas y organizativas razonables para proteger tus datos. El servicio no está dirigido a menores de edad y no recogemos conscientemente sus datos sin el consentimiento de quien ejerza la patria potestad o tutela.</p>',
          en: '<p>We apply reasonable technical and organisational measures to protect your data. The service is not directed at minors and we do not knowingly collect their data without the consent of a parent or guardian.</p>',
        },
      },
    ],
  )
}

// ---------- Política de Cookies ----------
function cookies(lang) {
  return render(
    lang,
    { es: 'Política de Cookies', en: 'Cookie Policy' },
    UPDATED,
    {
      es: 'Esta política explica el uso de cookies y tecnologías similares en foodmatch.es.',
      en: 'This policy explains the use of cookies and similar technologies on foodmatch.es.',
    },
    [
      {
        h: { es: '1. Qué son las cookies', en: '1. What cookies are' },
        body: {
          es: '<p>Una cookie es un pequeño archivo que un sitio web guarda en tu navegador para recordar información sobre tu visita.</p>',
          en: '<p>A cookie is a small file that a website stores in your browser to remember information about your visit.</p>',
        },
      },
      {
        h: { es: '2. Cookies que utilizamos', en: '2. Cookies we use' },
        body: {
          es: '<p>Este sitio web <strong>no utiliza cookies de análisis, publicidad ni seguimiento</strong>. Solo carga las tipografías de Google Fonts, que no instalan cookies, aunque realizan una petición a los servidores de Google que puede registrar tu dirección IP. Por ello no mostramos un banner de consentimiento de cookies, ya que no instalamos cookies no esenciales.</p>',
          en: '<p>This website <strong>does not use analytics, advertising or tracking cookies</strong>. It only loads Google Fonts typefaces, which do not set cookies, although they make a request to Google servers that may log your IP address. For this reason we do not show a cookie consent banner, since we do not set any non-essential cookies.</p>',
        },
      },
      {
        h: { es: '3. La aplicación móvil', en: '3. The mobile app' },
        body: {
          es: '<p>La aplicación FoodMatch guarda tus preferencias y sitios guardados en el almacenamiento local de tu dispositivo. No son cookies y no se comparten con terceros.</p>',
          en: '<p>The FoodMatch app stores your preferences and saved places in your device local storage. These are not cookies and are not shared with third parties.</p>',
        },
      },
      {
        h: { es: '4. Cómo gestionar las cookies', en: '4. How to manage cookies' },
        body: {
          es: '<p>Puedes configurar tu navegador para bloquear o eliminar las cookies y los datos de sitios web desde sus ajustes de privacidad en cualquier momento.</p>',
          en: '<p>You can set your browser to block or delete cookies and website data from its privacy settings at any time.</p>',
        },
      },
    ],
  )
}

// ---------- Términos y Condiciones ----------
function terminos(lang) {
  return render(
    lang,
    { es: 'Términos y Condiciones', en: 'Terms and Conditions' },
    UPDATED,
    {
      es: 'Estos términos regulan el uso de FoodMatch. Al utilizar el sitio o la aplicación, aceptas estas condiciones.',
      en: 'These terms govern the use of FoodMatch. By using the site or app, you accept these conditions.',
    },
    [
      {
        h: { es: '1. El servicio', en: '1. The service' },
        body: {
          es: '<p>FoodMatch ayuda a descubrir restaurantes en Valencia y a ponerte en contacto con ellos. Las reservas y pedidos se realizan directamente con el restaurante, normalmente a través de WhatsApp. FoodMatch no procesa pagos ni gestiona pedidos: actúa como capa de descubrimiento y contacto.</p>',
          en: '<p>FoodMatch helps you discover restaurants in Valencia and get in touch with them. Bookings and orders happen directly with the restaurant, usually through WhatsApp. FoodMatch does not process payments or manage orders: it acts as a discovery and contact layer.</p>',
        },
      },
      {
        h: { es: '2. Datos de muestra durante el piloto', en: '2. Sample data during the pilot' },
        body: {
          es: '<p>Durante la fase piloto, parte de la información de los restaurantes puede ser de muestra hasta que el restaurante verifique y reclame su ficha. No debe tomarse como información comercial definitiva.</p>',
          en: '<p>During the pilot phase, some restaurant information may be sample data until the restaurant verifies and claims its listing. It should not be taken as final commercial information.</p>',
        },
      },
      {
        h: { es: '3. Uso aceptable', en: '3. Acceptable use' },
        body: {
          es: '<p>Te comprometes a usar el servicio de forma lícita y a no introducir información falsa, de terceros sin autorización, ni contenidos que infrinjan derechos o la normativa aplicable.</p>',
          en: '<p>You agree to use the service lawfully and not to submit false information, third-party information without authorisation, or content that infringes rights or applicable law.</p>',
        },
      },
      {
        h: { es: '4. Limitación de responsabilidad', en: '4. Limitation of liability' },
        body: {
          es: '<p>El servicio se ofrece "tal cual" durante el piloto. En la medida permitida por la ley, no garantizamos la disponibilidad continua ni la exactitud de la información de terceros, y no respondemos de la relación que establezcas directamente con un restaurante.</p>',
          en: '<p>The service is provided "as is" during the pilot. To the extent permitted by law, we do not guarantee continuous availability or the accuracy of third-party information, and we are not responsible for the relationship you establish directly with a restaurant.</p>',
        },
      },
      {
        h: { es: '5. Cambios y contacto', en: '5. Changes and contact' },
        body: {
          es: `<p>Podemos actualizar estos términos; publicaremos la versión vigente en esta página. Para cualquier duda, escríbenos a <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`,
          en: `<p>We may update these terms; the current version will be published on this page. For any questions, write to us at <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`,
        },
      },
      {
        h: { es: '6. Ley aplicable', en: '6. Governing law' },
        body: {
          es: '<p>Estos términos se rigen por la legislación española, con sumisión a los juzgados y tribunales de Valencia salvo fuero imperativo distinto.</p>',
          en: '<p>These terms are governed by Spanish law, submitting to the courts of Valencia unless a different mandatory jurisdiction applies.</p>',
        },
      },
    ],
  )
}

// Exported registry consumed by build.mjs (path, meta, render).
export const LEGAL = [
  {
    path: '/aviso-legal',
    title: { es: 'Aviso Legal · FoodMatch', en: 'Legal Notice · FoodMatch' },
    desc: {
      es: 'Aviso legal de FoodMatch: titular del sitio, condiciones de uso y responsabilidad.',
      en: 'FoodMatch legal notice: site owner, conditions of use and liability.',
    },
    render: (lang) => (SHOW_FULL ? avisoLegal(lang) : comingSoon({ es: 'Aviso Legal', en: 'Legal Notice' }, lang)),
  },
  {
    path: '/privacidad',
    title: { es: 'Política de Privacidad · FoodMatch', en: 'Privacy Policy · FoodMatch' },
    desc: {
      es: 'Cómo FoodMatch trata y protege tus datos personales conforme al RGPD.',
      en: 'How FoodMatch processes and protects your personal data under the GDPR.',
    },
    render: (lang) => (SHOW_FULL ? privacidad(lang) : comingSoon({ es: 'Política de Privacidad', en: 'Privacy Policy' }, lang)),
  },
  {
    path: '/cookies',
    title: { es: 'Política de Cookies · FoodMatch', en: 'Cookie Policy · FoodMatch' },
    desc: {
      es: 'Qué cookies utiliza FoodMatch y cómo gestionarlas.',
      en: 'What cookies FoodMatch uses and how to manage them.',
    },
    render: (lang) => (SHOW_FULL ? cookies(lang) : comingSoon({ es: 'Política de Cookies', en: 'Cookie Policy' }, lang)),
  },
  {
    path: '/terminos',
    title: { es: 'Términos y Condiciones · FoodMatch', en: 'Terms and Conditions · FoodMatch' },
    desc: {
      es: 'Condiciones de uso del servicio FoodMatch.',
      en: 'Conditions of use for the FoodMatch service.',
    },
    render: (lang) => (SHOW_FULL ? terminos(lang) : comingSoon({ es: 'Términos y Condiciones', en: 'Terms and Conditions' }, lang)),
  },
]
