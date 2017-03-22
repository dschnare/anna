declare type AnalyzeFunc = (sourceFile: string, sourceText: string, anna: any) => Promise<any>

declare interface Analyzer {
  kind: string
  analyze: AnalyzeFunc
}
