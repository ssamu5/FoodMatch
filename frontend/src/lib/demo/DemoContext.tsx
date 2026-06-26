import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DEMO_STEPS, DEMO_TOTAL, matchStepIndex } from './demoScript'
import { markWelcomeSeen } from '../storage'

const SS_ACTIVE = 'foodmatch.demo.active'
const SS_STEP = 'foodmatch.demo.step'

interface DemoCtx {
  active: boolean
  stepIndex: number
  total: number
  enter: () => void
  exit: () => void
  next: () => void
  back: () => void
}

const Ctx = createContext<DemoCtx | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [active, setActive] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SS_ACTIVE) === '1'
    } catch {
      return false
    }
  })
  const [stepIndex, setStepIndexState] = useState<number>(() => {
    try {
      return Number(sessionStorage.getItem(SS_STEP)) || 0
    } catch {
      return 0
    }
  })

  const setStepIndex = useCallback((i: number) => {
    setStepIndexState(i)
    try {
      sessionStorage.setItem(SS_STEP, String(i))
    } catch {
      /* ignore */
    }
  }, [])

  const enter = useCallback(() => {
    // Demo bypasses the first-run welcome gate so it lands straight in the app.
    markWelcomeSeen()
    try {
      sessionStorage.setItem(SS_ACTIVE, '1')
    } catch {
      /* ignore */
    }
    setActive(true)
    setStepIndex(0)
    navigate('/')
  }, [navigate, setStepIndex])

  const exit = useCallback(() => {
    try {
      sessionStorage.removeItem(SS_ACTIVE)
      sessionStorage.removeItem(SS_STEP)
    } catch {
      /* ignore */
    }
    setActive(false)
    setStepIndexState(0)
  }, [])

  const next = useCallback(() => {
    if (stepIndex >= DEMO_TOTAL - 1) {
      exit()
      return
    }
    const i = stepIndex + 1
    setStepIndex(i)
    const route = DEMO_STEPS[i].route
    if (route) navigate(route)
  }, [stepIndex, navigate, setStepIndex, exit])

  const back = useCallback(() => {
    if (stepIndex <= 0) return
    const i = stepIndex - 1
    setStepIndex(i)
    const route = DEMO_STEPS[i].route
    if (route) navigate(route)
  }, [stepIndex, navigate, setStepIndex])

  // Real clicks through the app move the narration forward (never backward, so
  // navigating home again does not reset the tour).
  useEffect(() => {
    if (!active) return
    const i = matchStepIndex(pathname)
    if (i > stepIndex) setStepIndex(i)
  }, [active, pathname, stepIndex, setStepIndex])

  return (
    <Ctx.Provider value={{ active, stepIndex, total: DEMO_TOTAL, enter, exit, next, back }}>
      {children}
    </Ctx.Provider>
  )
}

export function useDemo(): DemoCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}
