# 📋 End of Session Checklist

**Este checklist se ejecuta al final de cada sesión**

Cuando Samuel dice: *"Vale Claude, cerramos sesión"*, yo hago TODO esto en este orden.

---

## ✅ Paso 1: Actualizar Documentación Interna

```
☐ Actualizar current_sprint.md (memory/)
  └─ Qué se completó hoy
  └─ En qué % estamos del sprint
  └─ Qué sigue mañana

☐ Actualizar session_notes.md (memory/)
  └─ Qué se hizo esta sesión
  └─ Cuánto tiempo tardó
  └─ Qué funcionó bien
  └─ Qué falló o tiene problemas

☐ Actualizar decisions_made.md (memory/) SI hay nuevas decisiones
  └─ Si tomamos decisiones técnicas nuevas hoy

☐ Actualizar patterns_to_follow.md (memory/) SI descubrimos nuevos patrones
  └─ Si encontramos nuevas formas de hacer las cosas
```

---

## ✅ Paso 2: Actualizar Dashboards del Proyecto

```
☐ Actualizar PROJECT_STATUS.md (raíz)
  └─ % completado de cada sprint
  └─ Qué se terminó hoy
  └─ Qué sigue la próxima sesión
  └─ Hitos alcanzados

☐ Actualizar SPRINT_CHECKLISTS.md (docs/checklists/)
  └─ Marcar items como [x] si están completos
  └─ Actualizar "En progreso" si algo está a mitad
  └─ Agregar nuevos items si descubrimos más trabajo

☐ Actualizar current_sprint.md (memory/)
  └─ Tabla de progreso
  └─ Qué sigue
```

---

## ✅ Paso 3: Commit a Git

```
☐ Verificar cambios: git status
  └─ Qué archivos cambiaron

☐ Agregar cambios: git add .
  └─ Preparar todo para el commit

☐ Crear commit descriptivo
  Format: tipo(área): descripción
  
  Ejemplos:
  ✓ "feat(sprint0): crear estructura backend inicial"
  ✓ "docs(sprint1): actualizar checklist de search"
  ✓ "fix(database): corregir relación de favoritos"

☐ Verificar commit: git log -1
  └─ Confirmar que el commit fue creado correctamente
```

---

## ✅ Paso 4: Push a GitHub

```
☐ Hacer push: git push origin main
  └─ Si falla por permisos, aviso a Samuel

☐ Verificar en GitHub
  └─ Comprobar que los cambios aparecen en el repo online
```

---

## 📝 PLANTILLA DE RESUMEN FINAL

Al terminar, digo algo como esto:

```
✅ SESSION SUMMARY:

📊 Progreso:
   - Sprint 0: 45% → 60% (+15%)
   - Items completados: 8
   - Items en progreso: 2

💾 Cambios:
   - Archivos modificados: 5
   - Nuevas líneas de código: 234
   - Commit: "feat(sprint0): setup inicial completado"

📈 Siguiente sesión:
   - Continuar con [X item]
   - Completar [Y item]
   - Empezar [Z item]

🔗 GitHub:
   - Status: ✅ Sincronizado
   - Último commit: [hash]
```

---

## 🔍 CHECKLIST RÁPIDO

Si solo tienes 5 minutos, haz ESTO MÍNIMO:

```
☐ 1. Actualizar PROJECT_STATUS.md (el más importante)
☐ 2. Hacer git commit
☐ 3. Hacer git push
☐ 4. Confirmación visual de GitHub
```

Si tienes 10 minutos, agrega:

```
☐ 5. Actualizar session_notes.md
☐ 6. Actualizar current_sprint.md
```

---

## 📋 STATUS DE EJECUCIÓN

- [ ] Paso 1: Actualizar memory
- [ ] Paso 2: Actualizar dashboards
- [ ] Paso 3: Commit a git
- [ ] Paso 4: Push a GitHub
- [ ] Paso 5: Resumen final

---

**⚠️ IMPORTANTE**: 

Esta checklist se ejecuta **AL FINAL de cada sesión**, cuando Samuel dice "cerramos sesión".

Yo sé exactamente qué hacer. Solo necesito la orden. 👇
