export interface InspectionTemplate {
  categories: { name: string; items: { question: string; value?: string }[] }[];
}
