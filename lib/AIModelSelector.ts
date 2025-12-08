import type {
  AIModel,
  AIModelType,
  AIModelSelection,
  ModelComparison,
  InstrumentType
} from './types';

export class AIModelSelector {
  private models: Map<string, AIModel>;

  constructor() {
    this.models = new Map();
    this.initializeModels();
  }

  private initializeModels(): void {
    // Bio-GPT: General biological analysis
    this.registerModel({
      id: 'bio-gpt-7b',
      name: 'Bio-GPT 7B',
      type: 'bio-gpt',
      version: '2.0',
      description: 'General-purpose biological language model for analysis interpretation',
      capabilities: [
        'DNA sequence analysis',
        'Protein annotation',
        'Gene expression interpretation',
        'Literature synthesis',
        'Experimental design suggestions'
      ],
      pricing: {
        perSample: 0.50,
        perToken: 0.0001
      },
      parameters: {
        size: '7B',
        contextWindow: 8192,
        accuracy: 94.5
      },
      requirements: {
        minGPU: 1,
        minVRAM: 16,
        minRAM: 32
      },
      specialization: ['genomics', 'proteomics', 'general-biology'],
      trainingData: 'PubMed, GenBank, UniProt (2025)'
    });

    // Chem-BERT: Chemistry analysis
    this.registerModel({
      id: 'chem-bert-base',
      name: 'Chem-BERT Base',
      type: 'chem-bert',
      version: '3.1',
      description: 'Specialized model for chemical structure and reaction analysis',
      capabilities: [
        'Molecular structure prediction',
        'Reaction mechanism analysis',
        'Compound identification',
        'Toxicity prediction',
        'Drug-drug interactions'
      ],
      pricing: {
        perSample: 0.75,
        perToken: 0.00015
      },
      parameters: {
        size: '12B',
        contextWindow: 4096,
        accuracy: 96.2
      },
      requirements: {
        minGPU: 2,
        minVRAM: 24,
        minRAM: 48
      },
      specialization: ['chemistry', 'pharmacology', 'toxicology'],
      trainingData: 'ChEMBL, PubChem, ZINC (2025)'
    });

    // Protein-Fold: Protein structure prediction
    this.registerModel({
      id: 'protein-fold-v3',
      name: 'Protein-Fold v3',
      type: 'protein-fold',
      version: '3.0',
      description: 'AlphaFold-derived model for protein structure and function prediction',
      capabilities: [
        '3D structure prediction',
        'Function inference',
        'Binding site identification',
        'Mutation impact analysis',
        'Protein-protein interactions'
      ],
      pricing: {
        perSample: 2.00,
        perToken: 0.0003
      },
      parameters: {
        size: '50B',
        accuracy: 98.1
      },
      requirements: {
        minGPU: 4,
        minVRAM: 80,
        minRAM: 128
      },
      specialization: ['structural-biology', 'proteomics', 'drug-design'],
      trainingData: 'PDB, AlphaFold DB, UniProt (2025)'
    });

    // Genomics-LLM: Advanced genomics
    this.registerModel({
      id: 'genomics-llm-70b',
      name: 'Genomics-LLM 70B',
      type: 'genomics-llm',
      version: '1.5',
      description: 'Large language model specialized in genomic sequence analysis',
      capabilities: [
        'Variant calling and annotation',
        'Gene regulatory network analysis',
        'GWAS interpretation',
        'Epigenetic analysis',
        'Phylogenetic analysis'
      ],
      pricing: {
        perSample: 3.50,
        perToken: 0.0005
      },
      parameters: {
        size: '70B',
        contextWindow: 32768,
        accuracy: 97.8
      },
      requirements: {
        minGPU: 8,
        minVRAM: 160,
        minRAM: 256
      },
      specialization: ['genomics', 'personalized-medicine', 'cancer-research'],
      trainingData: 'gnomAD, TCGA, UK Biobank (2025)'
    });

    // Drug-Discovery: Pharmaceutical research
    this.registerModel({
      id: 'drug-discovery-ai',
      name: 'Drug-Discovery AI',
      type: 'drug-discovery',
      version: '2.3',
      description: 'Specialized model for drug discovery and development',
      capabilities: [
        'Lead compound identification',
        'ADMET prediction',
        'Target validation',
        'Formulation optimization',
        'Clinical trial design'
      ],
      pricing: {
        perSample: 5.00,
        perToken: 0.001
      },
      parameters: {
        size: '100B',
        accuracy: 95.5
      },
      requirements: {
        minGPU: 8,
        minVRAM: 200,
        minRAM: 512
      },
      specialization: ['drug-discovery', 'pharmacology', 'clinical-research'],
      trainingData: 'DrugBank, ChEMBL, Clinical Trials (2025)'
    });

    // Medical-Vision: Medical imaging
    this.registerModel({
      id: 'medical-vision-v4',
      name: 'Medical-Vision v4',
      type: 'medical-vision',
      version: '4.0',
      description: 'Advanced vision model for medical imaging analysis',
      capabilities: [
        'Disease detection',
        'Tumor segmentation',
        'Abnormality classification',
        'Radiology report generation',
        'Multi-modal imaging fusion'
      ],
      pricing: {
        perSample: 1.50,
        perImage: 0.25
      },
      parameters: {
        size: '25B',
        accuracy: 97.2
      },
      requirements: {
        minGPU: 4,
        minVRAM: 64,
        minRAM: 96
      },
      specialization: ['radiology', 'pathology', 'medical-imaging'],
      trainingData: 'ImageNet Medical, MIMIC-CXR, RadGraph (2025)'
    });

    // Pathology-AI: Pathology analysis
    this.registerModel({
      id: 'pathology-ai-pro',
      name: 'Pathology-AI Pro',
      type: 'pathology-ai',
      version: '1.8',
      description: 'Specialized model for digital pathology and histology',
      capabilities: [
        'Cell classification',
        'Tissue segmentation',
        'Cancer grading',
        'Biomarker detection',
        'Whole slide analysis'
      ],
      pricing: {
        perSample: 2.50,
        perImage: 0.50
      },
      parameters: {
        size: '35B',
        accuracy: 96.8
      },
      requirements: {
        minGPU: 4,
        minVRAM: 96,
        minRAM: 128
      },
      specialization: ['pathology', 'histology', 'oncology'],
      trainingData: 'TCGA, CAMELYON, PanNuke (2025)'
    });

    console.log(`🤖 Initialized ${this.models.size} AI models`);
  }

  private registerModel(model: AIModel): void {
    this.models.set(model.id, model);
  }

  selectModel(
    instrumentType: InstrumentType,
    analysisType?: string,
    priority?: 'cost' | 'accuracy' | 'speed'
  ): AIModelSelection {
    const candidates = this.getCompatibleModels(instrumentType, analysisType);

    if (candidates.length === 0) {
      throw new Error(`No compatible AI models found for ${instrumentType}`);
    }

    // Rank by priority
    let recommended: AIModel;
    
    if (priority === 'cost') {
      recommended = candidates.sort((a, b) => 
        a.pricing.perSample - b.pricing.perSample
      )[0];
    } else if (priority === 'accuracy') {
      recommended = candidates.sort((a, b) => 
        (b.parameters?.accuracy || 0) - (a.parameters?.accuracy || 0)
      )[0];
    } else {
      // Default: balance of cost and accuracy
      recommended = candidates[0];
    }

    const alternatives = candidates.filter(m => m.id !== recommended.id).slice(0, 3);

    return {
      model: recommended,
      reason: this.getSelectionReason(recommended, instrumentType, priority),
      confidence: this.calculateConfidence(recommended, instrumentType),
      alternatives
    };
  }

  private getCompatibleModels(
    instrumentType: InstrumentType,
    analysisType?: string
  ): AIModel[] {
    const compatibilityMap: Record<InstrumentType, AIModelType[]> = {
      'dna-sequencer': ['bio-gpt', 'genomics-llm'],
      'spectroscopy': ['chem-bert', 'bio-gpt'],
      'microscopy': ['medical-vision', 'pathology-ai'],
      'mass-spectrometry': ['chem-bert', 'drug-discovery'],
      'nmr': ['chem-bert', 'protein-fold'],
      'x-ray': ['medical-vision', 'protein-fold']
    };

    const compatibleTypes = compatibilityMap[instrumentType] || ['bio-gpt'];
    
    return Array.from(this.models.values())
      .filter(m => compatibleTypes.includes(m.type));
  }

  private getSelectionReason(
    model: AIModel,
    instrumentType: InstrumentType,
    priority?: string
  ): string {
    const reasons = [];

    if (priority === 'cost') {
      reasons.push('Most cost-effective option');
    } else if (priority === 'accuracy') {
      reasons.push(`Highest accuracy (${model.parameters?.accuracy}%)`);
    } else {
      reasons.push('Optimal balance of cost and performance');
    }

    reasons.push(`Specialized for ${instrumentType} analysis`);
    
    if (model.capabilities.length > 0) {
      reasons.push(`${model.capabilities.length} advanced capabilities`);
    }

    return reasons.join('. ');
  }

  private calculateConfidence(model: AIModel, instrumentType: InstrumentType): number {
    let confidence = 85; // Base confidence

    if (model.parameters?.accuracy) {
      confidence += (model.parameters.accuracy - 90) * 2;
    }

    if (model.specialization && model.specialization.length > 2) {
      confidence += 5;
    }

    return Math.min(99, Math.max(70, confidence));
  }

  compareModels(modelIds: string[]): ModelComparison {
    const models = modelIds
      .map(id => this.models.get(id))
      .filter(m => m !== undefined) as AIModel[];

    if (models.length === 0) {
      throw new Error('No valid models provided for comparison');
    }

    const recommended = models.sort((a, b) => {
      const scoreA = (a.parameters?.accuracy || 0) / (a.pricing.perSample || 1);
      const scoreB = (b.parameters?.accuracy || 0) / (b.pricing.perSample || 1);
      return scoreB - scoreA;
    })[0];

    const alternatives = models
      .filter(m => m.id !== recommended.id)
      .map(model => {
        const pros: string[] = [];
        const cons: string[] = [];
        const costDiff = model.pricing.perSample - recommended.pricing.perSample;

        if (costDiff < 0) {
          pros.push(`$${Math.abs(costDiff).toFixed(2)} cheaper per sample`);
        } else if (costDiff > 0) {
          cons.push(`$${costDiff.toFixed(2)} more expensive per sample`);
        }

        if (model.parameters?.accuracy && recommended.parameters?.accuracy) {
          const accDiff = model.parameters.accuracy - recommended.parameters.accuracy;
          if (accDiff > 0) {
            pros.push(`${accDiff.toFixed(1)}% more accurate`);
          } else if (accDiff < 0) {
            cons.push(`${Math.abs(accDiff).toFixed(1)}% less accurate`);
          }
        }

        if (model.capabilities.length > recommended.capabilities.length) {
          pros.push(`${model.capabilities.length - recommended.capabilities.length} more capabilities`);
        }

        return { model, pros, cons, costDiff };
      });

    return {
      recommended,
      alternatives
    };
  }

  getModel(modelId: string): AIModel | undefined {
    return this.models.get(modelId);
  }

  getAllModels(): AIModel[] {
    return Array.from(this.models.values());
  }

  getModelsByType(type: AIModelType): AIModel[] {
    return this.getAllModels().filter(m => m.type === type);
  }

  searchModels(query: {
    type?: AIModelType;
    maxPrice?: number;
    minAccuracy?: number;
    capabilities?: string[];
  }): AIModel[] {
    let models = this.getAllModels();

    if (query.type) {
      models = models.filter(m => m.type === query.type);
    }

    if (query.maxPrice) {
      models = models.filter(m => m.pricing.perSample <= query.maxPrice);
    }

    if (query.minAccuracy) {
      models = models.filter(m => 
        m.parameters?.accuracy && m.parameters.accuracy >= query.minAccuracy
      );
    }

    if (query.capabilities && query.capabilities.length > 0) {
      models = models.filter(m =>
        query.capabilities!.some(cap =>
          m.capabilities.some(c => 
            c.toLowerCase().includes(cap.toLowerCase())
          )
        )
      );
    }

    return models;
  }
}
