export interface AppInfo {
  name: string
  version: string
}

export function describeApp(app: AppInfo): string {
  return `${app.name} ${app.version}`
}
