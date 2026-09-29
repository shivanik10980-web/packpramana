export type FoodCategory = 'fresh' | 'dry';
export type StorageType = 'ambient' | 'chilled' | 'frozen';
export type TransportSeverity = 'gentle' | 'normal' | 'rough';
export type CostPriority = 'balanced' | 'cost';

export type RecommendationStatus = 'demo_shortlist' | 'review_required' | 'invalid' | 'no_match';

export interface CommodityComposition {
  moisturePct: number | null;
  fatPct: number | null;
  pH: number | null;
  respirationMlCO2KgHour: number | null;
  respirationTemperatureC: number | null;
}

export interface BarrierRequirements {
  moisture: number;
  oxygen: number;
  light: number;
  grease: number;
}

export interface Commodity {
  id: string;
  name: string;
  category: FoodCategory;
  composition: CommodityComposition;
  storageType: StorageType;
  temperatureC: [number, number];
  prototypeMaxDays: number;
  required: BarrierRequirements;
  evidenceStatus: string;
  sourceIds: string[];
  // Real-world food science properties
  waterActivity?: number;
  respirationClass?: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  primaryDegradationMode?: string;
  recommendedMapGas?: { o2Pct: number; co2Pct: number; n2Pct: number };
}

export interface BarrierMeasurement {
  value: number | null;
  unit: string;
  temperatureC: number | null;
  relativeHumidityPct: number | null;
  method: string | null;
  status: 'not_measured' | 'measured';
}

export interface PackagingRecord {
  id: string;
  name: string;
  structure: string;
  format: string;
  breathable: boolean;
  compatibleCategories: FoodCategory[];
  temperatureC: [number, number];
  thicknessMicron: [number, number];
  sealMethod: string;
  capabilities: BarrierRequirements;
  mechanicalRating: number;
  unitCostInr: number;
  endOfLifeScore: number;
  endOfLifeNote: string;
  nominalPackMassG: number;
  otr: BarrierMeasurement;
  wvtr: BarrierMeasurement;
  gasPermeability: string;
  mapStatus: string;
  foodContactStatus: string;
  evidenceStatus: string;
  sourceIds: string[];
  // Industrial packaging physical & regulatory properties
  recyclingCategory?: string;
  pwmEprCategory?: 'Category I (Rigid)' | 'Category II (Flexible)' | 'Category III (Multi-layered)' | 'Compostable';
  fssaiMigrationStatus?: string;
  standardsRef?: string[];
}

export interface DataSource {
  id: string;
  title: string;
  evidenceType?: string;
  url: string | null;
  scope?: string;
}

export interface ScenarioInput {
  commodityId: string;
  storageType: StorageType;
  temperatureC: number;
  relativeHumidityPct: number;
  targetDays: number;
  distanceKm: number;
  transportSeverity: TransportSeverity;
  packMassG: number;
  budgetInrPerPack: number;
  costPriority: CostPriority;
  composition?: Partial<CommodityComposition>;
}

export interface DerivedTargets extends BarrierRequirements {
  mechanical: number;
}

export interface ComponentBreakdown {
  F: number; // Requirement fit
  C: number; // Budget fit
  M: number; // Transport margin
  E: number; // Temperature margin
  R: number; // Disposal assumption
}

export interface CandidateRecommendation {
  id: string;
  name: string;
  score: number;
  displayScore: number;
  unitCostInr: number;
  overBudgetInr: number;
  components: ComponentBreakdown;
  contributions: ComponentBreakdown;
  weights: ComponentBreakdown;
  reasons: string[];
  warnings: string[];
  packaging: PackagingRecord;
}

export interface RejectedCandidate {
  id: string;
  name: string;
  reasons: string[];
}

export interface EngineResult {
  status: RecommendationStatus;
  reasons: string[];
  candidates: CandidateRecommendation[];
  rejected: RejectedCandidate[];
  targets: DerivedTargets | null;
  rulesVersion: string;
  catalogueVersion: string;
  evidenceStatus: string;
}

export interface SeedData {
  schemaVersion: number;
  catalogueVersion: string;
  rulesVersion: string;
  disclaimer: string;
  sources: DataSource[];
  demoScenarios: Array<ScenarioInput & { id: string }>;
  commodities: Commodity[];
  packaging: PackagingRecord[];
}

export interface SavedScenario {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  input: ScenarioInput;
  result: EngineResult;
  note?: string;
}

// ==========================================
// Gemini AI Intelligence & Assistant Schemas
// ==========================================

export interface AIAnalysisResult {
  executiveSummary: string;
  biochemicalProtection: string;
  shelfLifeExtensionNote: string;
  activePackagingAdvice: Array<{ type: string; details: string }>;
  riskWarnings: string[];
}

export interface ComplianceAuditResult {
  fssaiStatus: 'compliant' | 'caution' | 'requires_food_grade_liner';
  fssaiDetails: string;
  bisStandard: string;
  pwmCategory: string;
  recyclingGuidance: string;
}

export interface ScenarioExtractionResult {
  commodityId: string;
  commodityName: string;
  storageType: StorageType;
  temperatureC: number;
  relativeHumidityPct: number;
  targetDays: number;
  distanceKm: number;
  transportSeverity: TransportSeverity;
  packMassG: number;
  budgetInrPerPack: number;
  costPriority: CostPriority;
  inferredHazards: string[];
  confidenceScore: number;
  rationale: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
