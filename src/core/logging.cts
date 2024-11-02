import console from 'node:console'
import chalk from 'chalk'
import useDebug from 'debug'
import isInteractive from 'is-interactive'
import { shared } from '../helpers/system.cjs'
import type { ValuesOf } from '../helpers/types.cjs'
import type { ChalkFunction } from 'chalk'
import type { ConditionalKeys } from 'type-fest'

export const kDebugNamespace = 'lint-config'
export const kLevels = Object.seal(['debug', 'info', 'log', 'warn', 'error'] as const)

export type Levels = ValuesOf<typeof kLevels>
export type LineFormatter = (message?: unknown, ...optionalParams: unknown[]) => [unknown?, ...unknown[]]
export type LineWriter = (message?: unknown, ...optionalParams: unknown[]) => void
export type ConsoleWriter = (typeof console)[Levels]

export interface LevelSettings {
  level: Levels
  style: ChalkFunction
  hideLevel?: boolean | undefined
}

function useTerminalFormatter({ level, style, hideLevel = false }: LevelSettings): LineFormatter {
  return !hideLevel
    ? (message?, ...data) => [style(level), String(message), ...data.map(String)]
    : (message?, ...data) => [String(message), ...data.map(String)]
}

function usePipeFormatter({ level, hideLevel = false }: LevelSettings): LineFormatter {
  return !hideLevel
    ? (message?, ...data) => [`${new Date().toISOString()}:`, `[${level}]`, message, ...data]
    : (message?, ...data) => [`${new Date().toISOString()}:`, message, ...data]
}

function useWriter(settings: LevelSettings, writer: LineWriter): LineWriter {
  const formatter = isInteractive() ? useTerminalFormatter(settings) : usePipeFormatter(settings)

  return (message?, ...data) => {
    writer(...formatter(message, ...data))
  }
}

function useConsoleWriter(level: ConditionalKeys<typeof console, ConsoleWriter>) {
  return console[level]
}

const useConsole = shared(() =>
  Object.freeze({
    debug: useConsoleWriter('debug'),
    info: useConsoleWriter('info'),
    log: useConsoleWriter('log'),
    warn: useConsoleWriter('warn'),
    error: useConsoleWriter('error')
  })
)

const useLogger = (writer?: LineWriter) => {
  const stdio = useConsole()

  return Object.freeze({
    debug: useWriter({ level: 'debug', style: chalk.dim.white, hideLevel: true }, writer ?? useDebug(kDebugNamespace)),
    info: useWriter({ level: 'info', style: chalk.blue }, writer ?? stdio.info),
    log: useWriter({ level: 'log', style: chalk.white, hideLevel: true }, writer ?? stdio.log),
    warn: useWriter({ level: 'warn', style: chalk.yellow }, writer ?? stdio.warn),
    error: useWriter({ level: 'error', style: chalk.red }, writer ?? stdio.error)
  })
}

export type Logger = ReturnType<typeof useLogger>

export default useLogger
