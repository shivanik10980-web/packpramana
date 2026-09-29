import { getGeminiClient, getSelectedModel } from './geminiClient';
import type {
  ScenarioInput,
  CandidateRecommendation,
  Commodity,
  PackagingRecord,
  AIAnalysisResult,
  ComplianceAuditResult,
  ScenarioExtractionResult,
  ChatMessage,
} from '../domain/types';
import { defaultSeedData } from '../engine';

const SYSTEM_INSTRUCTION = `You are PackPramana's Chief Food Packaging Scientist & Regulatory Auditor.
You possess authoritative expertise in:
1. Food deterioration kinetics: Lipid photo-oxidation, moisture sorption isotherms, respiration quotient ($Q_{10}$), enzymatic browning, and microbial spoilage.
2. Barrier polymer physics: Oxygen Transmission Rate (OTR, ASTM D3985), Water Vapor Transmission Rate (WVTR, ASTM F1249), seal integrity, pinholing, and thickness optimization.
3. Modified Atmosphere Packaging (MAP): gas flush equilibriums (O2/CO2/N2) and active packaging (silica gel desiccants, iron-based O2 scavengers, ethylene scrubbers, anti-fog coatings).
4. Indian Regulations & Standards: FSSAI Packaging Regulations 2018 (OML 60 mg/kg limit), BIS IS:15609 (multilayer laminates), IS:9845, and Plastic Waste Management (PWM) Rules 2024 (EPR Category I, II, III).

Provide concise, highly rigorous, actionable technical guidance for food processors and packers.`;

/**
 * Smart Natural Language & Image Scenario Extraction
 */
export async function extractScenarioFromTextOrImage(params: {
  text?: string;
  imageBase64?: string;
  mimeType?: string;
}): Promise<ScenarioExtractionResult> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('Gemini API is not configured. Please enter your API key in AI Settings.');
  }

  const model = getSelectedModel();
  const knownCommodityIds = defaultSeedData.commodities.map((c) => c.id).join(', ');

  const prompt = `Analyze this food product description or image.
Identify the food commodity, its optimal storage mode, temperature, humidity, shelf life requirements, package net weight, transit severity, and budget per pack.

Match the commodity to the closest ID from this catalogue: [${knownCommodityIds}].
If unsure, select the most chemically similar commodity (e.g. almonds -> cashews, berries -> strawberry).

Respond ONLY with a valid JSON object matching this exact structure:
{
  "commodityId": "string (must be one of: ${knownCommodityIds})",
  "commodityName": "string",
  "storageType": "ambient | chilled | frozen",
  "temperatureC": number,
  "relativeHumidityPct": number,
  "targetDays": number,
  "distanceKm": number,
  "transportSeverity": "gentle | normal | rough",
  "packMassG": number,
  "budgetInrPerPack": number,
  "costPriority": "balanced | cost",
  "inferredHazards": ["string", "string"],
  "confidenceScore": number (0.0 to 1.0),
  "rationale": "string explaining why these parameters were inferred"
}`;

  const contents: any[] = [];
  if (params.imageBase64 && params.mimeType) {
    contents.push({
      inlineData: {
        data: params.imageBase64,
        mimeType: params.mimeType,
      },
    });
  }
  if (params.text) {
    contents.push({ text: `Food Processor Query:\n"${params.text}"\n\n${prompt}` });
  } else {
    contents.push({ text: prompt });
  }

  const response = await client.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
    },
  });

  const rawJson = response.text?.trim() || '{}';
  try {
    const parsed = JSON.parse(rawJson);
    return {
      commodityId: parsed.commodityId || 'strawberry',
      commodityName: parsed.commodityName || 'Selected Food Product',
      storageType: parsed.storageType || 'ambient',
      temperatureC: typeof parsed.temperatureC === 'number' ? parsed.temperatureC : 25,
      relativeHumidityPct: typeof parsed.relativeHumidityPct === 'number' ? parsed.relativeHumidityPct : 60,
      targetDays: typeof parsed.targetDays === 'number' ? parsed.targetDays : 30,
      distanceKm: typeof parsed.distanceKm === 'number' ? parsed.distanceKm : 150,
      transportSeverity: parsed.transportSeverity || 'normal',
      packMassG: typeof parsed.packMassG === 'number' ? parsed.packMassG : 250,
      budgetInrPerPack: typeof parsed.budgetInrPerPack === 'number' ? parsed.budgetInrPerPack : 6,
      costPriority: parsed.costPriority || 'balanced',
      inferredHazards: Array.isArray(parsed.inferredHazards) ? parsed.inferredHazards : [],
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.85,
      rationale: parsed.rationale || 'Inferred using Gemini Food Packaging AI.',
    };
  } catch (err) {
    throw new Error(`Failed to parse AI extraction output: ${(err as Error).message}`);
  }
}

/**
 * Deep Biochemical Preservation & Active Packaging Analysis
 */
export async function generateDeepPreservationAnalysis(
  scenario: ScenarioInput,
  candidate: CandidateRecommendation,
  commodity: Commodity
): Promise<AIAnalysisResult> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('Gemini API is not configured.');
  }

  const model = getSelectedModel();

  const prompt = `Conduct a rigorous food packaging preservation analysis for:
Commodity: ${commodity.name} (${commodity.category})
Composition: Moisture ${commodity.composition.moisturePct}%, Fat ${commodity.composition.fatPct}%, pH ${commodity.composition.pH}, Respiration ${commodity.composition.respirationMlCO2KgHour ?? 'N/A'} ml CO2/kg·h.
Primary Degradation Mode: ${commodity.primaryDegradationMode || 'Oxidation and microbial decay'}
Storage Condition: ${scenario.temperatureC}°C, ${scenario.relativeHumidityPct}% RH, Target ${scenario.targetDays} days.

Packaging Material Evaluated:
Candidate Name: ${candidate.name} (ID: ${candidate.id})
Structure: ${candidate.packaging.structure}
Format: ${candidate.packaging.format} (Breathable: ${candidate.packaging.breathable})
OTR: ${candidate.packaging.otr.value ?? 'N/A'} ${candidate.packaging.otr.unit}
WVTR: ${candidate.packaging.wvtr.value ?? 'N/A'} ${candidate.packaging.wvtr.unit}
Mechanical Rating: ${candidate.packaging.mechanicalRating}/5, Unit Cost: ₹${candidate.unitCostInr}

Provide an authoritative scientific evaluation in JSON format:
{
  "executiveSummary": "Concise 2-sentence summary of barrier suitability",
  "biochemicalProtection": "Detailed explanation of how this material suppresses the specific degradation pathways (water activity, lipid oxidation, respiration, microbial growth)",
  "shelfLifeExtensionNote": "Realistic projection of quality retention factor under these specific storage conditions",
  "activePackagingAdvice": [
    { "type": "Desiccant / Oxygen Scavenger / Anti-fog / Ethylene Absorber", "details": "Specific sizing recommendation (e.g. 2g food-grade silica gel sachet or iron-based 50cc scavenger)" }
  ],
  "riskWarnings": [
    "Specific technical vulnerability (e.g. pinholing in rough transport, condensation fogging, thermal seal failure)"
  ]
}`;

  const response = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
    },
  });

  const parsed = JSON.parse(response.text?.trim() || '{}');
  return {
    executiveSummary: parsed.executiveSummary || 'Suitable barrier matching observed.',
    biochemicalProtection: parsed.biochemicalProtection || 'Preserves product quality through moisture and gas control.',
    shelfLifeExtensionNote: parsed.shelfLifeExtensionNote || 'Maintains commercial quality within target duration.',
    activePackagingAdvice: Array.isArray(parsed.activePackagingAdvice) ? parsed.activePackagingAdvice : [],
    riskWarnings: Array.isArray(parsed.riskWarnings) ? parsed.riskWarnings : ['Ensure calibrated heat sealing parameters.'],
  };
}

/**
 * Indian Regulatory & Environmental Compliance Audit
 */
export async function generateComplianceAudit(
  candidate: PackagingRecord,
  commodity: Commodity
): Promise<ComplianceAuditResult> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('Gemini API is not configured.');
  }

  const model = getSelectedModel();

  const prompt = `Perform an Indian food safety and environmental regulatory audit for:
Material: ${candidate.name} (${candidate.structure})
Format: ${candidate.format}
Food Contact: ${commodity.name} (Category: ${commodity.category}, Moisture ${commodity.composition.moisturePct}%, Fat ${commodity.composition.fatPct}%)
Reported Standards: ${(candidate.standardsRef || []).join(', ')}
PWM Category: ${candidate.pwmEprCategory || 'Flexible'}

Audit against:
1. FSSAI Food Safety and Standards (Packaging) Regulations, 2018 (Overall Migration Limit OML: 60 mg/kg or 10 mg/dm2).
2. Plastic Waste Management (PWM) Rules 2024 (EPR registration, minimum thickness, recyclability).
3. Bureau of Indian Standards (BIS IS:15609, IS:9845).

Respond in JSON format:
{
  "fssaiStatus": "compliant | caution | requires_food_grade_liner",
  "fssaiDetails": "Specific compliance evaluation regarding migration limits and virgin food-grade polymer requirements",
  "bisStandard": "Exact BIS standard applicable",
  "pwmCategory": "Plastic Waste Management EPR Classification",
  "recyclingGuidance": "Actionable recyclability, mono-material guidelines, and post-consumer handling"
}`;

  const response = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
    },
  });

  const parsed = JSON.parse(response.text?.trim() || '{}');
  return {
    fssaiStatus: parsed.fssaiStatus || 'compliant',
    fssaiDetails: parsed.fssaiDetails || 'Compliant with FSSAI 2018 virgin food-contact migration limits.',
    bisStandard: parsed.bisStandard || 'IS 15609 / IS 9845',
    pwmCategory: parsed.pwmCategory || candidate.pwmEprCategory || 'Category II (Flexible)',
    recyclingGuidance: parsed.recyclingGuidance || 'Ensure segregation in clean dry plastics stream.',
  };
}

/**
 * Conversational Packaging Co-Pilot Assistant
 */
export async function chatWithPackagingCopilot(
  history: ChatMessage[],
  context?: {
    scenario?: ScenarioInput;
    candidate?: CandidateRecommendation;
    commodity?: Commodity;
  }
): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('Gemini API is not configured.');
  }

  const model = getSelectedModel();

  let contextSnippet = '';
  if (context?.scenario && context?.commodity) {
    contextSnippet = `\nCurrent Working Context:
Commodity: ${context.commodity.name} (${context.commodity.category})
Storage: ${context.scenario.temperatureC}°C, ${context.scenario.relativeHumidityPct}% RH, ${context.scenario.targetDays} days
Net Pack Mass: ${context.scenario.packMassG}g, Budget: ₹${context.scenario.budgetInrPerPack}
Top Recommended Material: ${context.candidate ? `${context.candidate.name} (${context.candidate.packaging.structure})` : 'Not yet selected'}`;
  }

  const promptContents = history.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  // Append context into system instruction
  const systemInstructionWithContext = `${SYSTEM_INSTRUCTION}\n${contextSnippet}`;

  const response = await client.models.generateContent({
    model,
    contents: promptContents,
    config: {
      systemInstruction: systemInstructionWithContext,
    },
  });

  return response.text || 'I apologize, but I could not formulate a response. Please refine your question.';
}
