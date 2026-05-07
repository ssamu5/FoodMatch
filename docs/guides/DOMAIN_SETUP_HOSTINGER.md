# Configurar foodmatch.es (Hostinger -> Vercel)

**Para:** Samuel
**De:** Max
**Tiempo:** 10 minutos en Hostinger + 5 a 30 minutos esperando propagacion

## Resumen en una frase

El dominio foodmatch.es esta en Hostinger, la web esta en Vercel. Hay que cambiar dos registros DNS en Hostinger para que foodmatch.es apunte a Vercel.

## Lo que ya esta hecho (no toques nada)

1. Maquetada la web en Vercel: https://foodmatch-nine.vercel.app/
2. Anadido foodmatch.es y www.foodmatch.es al proyecto de Vercel
3. Vercel esta listo, solo espera el DNS

## Lo que tienes que hacer en Hostinger

### Paso 1. Entrar al editor DNS

1. Login en https://hpanel.hostinger.com
2. Menu lateral izquierdo: clic en **Dominios**
3. Clic en **foodmatch.es**
4. En el menu del dominio, busca **DNS / Servidores de nombres** (a veces aparece como "Editor de zona DNS" o "Gestionar DNS")
5. Te aparece una tabla con los registros DNS actuales

### Paso 2. Borrar los registros que estorban

Hostinger deja por defecto registros que apuntan a su propio "parking" (la pagina "este dominio esta a la venta" o similar). Hay que quitarlos.

**Borra estos si existen:**

- Registro tipo `A` con Nombre `@` (o vacio) que apunta a una IP de Hostinger
- Registro tipo `A` con Nombre `www` que apunta a una IP de Hostinger
- Registro tipo `CNAME` con Nombre `www` que apunta a algo como `parkingpage.hostinger.com`

**No borres** los registros tipo `MX`, `TXT`, `NS` ni `SOA`. Solo los de Hostinger parking.

### Paso 3. Anadir los dos registros de Vercel

Crea dos registros nuevos:

**Registro 1 (dominio raiz):**
- Tipo: `A`
- Nombre / Host: `@`
- Apunta a / Valor: `76.76.21.21`
- TTL: deja el valor por defecto (3600 o 14400)

**Registro 2 (subdominio www):**
- Tipo: `CNAME`
- Nombre / Host: `www`
- Apunta a / Valor: `cname.vercel-dns.com`
- TTL: deja el valor por defecto

Pulsa **Guardar** o **Actualizar registros**.

### Paso 4. Esperar y comprobar

DNS necesita tiempo para propagarse. Tipico en Espana: entre 5 y 30 minutos. Maximo absoluto: 24 horas.

**Comprobacion rapida:**
1. Espera 10 minutos
2. Abre **https://foodmatch.es** en el navegador
3. Si ves la web de FoodMatch con el candado verde (HTTPS), todo bien
4. Tambien prueba **https://www.foodmatch.es**, deberia redirigir al mismo sitio

**Comprobacion tecnica (opcional):**

Si tienes terminal a mano:

```
dig +short foodmatch.es
```

Tiene que devolver: `76.76.21.21`

```
dig +short www.foodmatch.es
```

Tiene que devolver: `cname.vercel-dns.com.` y luego una IP de Vercel.

## Si algo falla

| Sintoma | Causa probable | Que hacer |
|---|---|---|
| "No se puede conectar" | DNS aun no propagado | Esperar otros 30 minutos |
| Sale la pagina de Hostinger parking | No se borraron los registros A de Hostinger | Volver al editor DNS, borrar los A que apuntan a IP de Hostinger |
| "Certificado no valido" o aviso SSL | Vercel aun no ha emitido SSL | Esperar 15 minutos. Vercel emite Let's Encrypt automatico cuando el DNS resuelve |
| Funciona foodmatch.es pero no www.foodmatch.es (o al reves) | Falta uno de los dos registros DNS | Revisar paso 3, asegurar los dos registros |
| Lleva mas de 2 horas y no funciona | Algo distinto | Avisame y miro la config de Vercel |

## Lo que pasa despues, automaticamente

- Vercel emite el certificado SSL gratuito (Let's Encrypt) en cuanto detecta el DNS apuntando bien
- Cada vez que yo hago `git push origin main` o `vercel deploy --prod`, la nueva version se publica en foodmatch.es automaticamente
- Tu no tienes que volver a tocar Hostinger nunca, salvo que quieras cambiar el dominio o anadir email

## Si quieres email con @foodmatch.es

Eso es aparte. Hostinger tiene el servicio "Hostinger Email" que viene con el dominio. Para activarlo, anadiriamos registros MX en este mismo editor DNS. Si te interesa, dimelo y te paso la guia.

## Datos para tener a mano

- Dominio: **foodmatch.es**
- Proveedor DNS: Hostinger
- Hosting de la web: Vercel (proyecto webkomodo/foodmatch)
- Registro A para `@`: `76.76.21.21`
- Registro CNAME para `www`: `cname.vercel-dns.com`
- URL temporal mientras configuras: https://foodmatch-nine.vercel.app/
