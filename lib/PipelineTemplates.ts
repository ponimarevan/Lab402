// PipelineTemplates - Pre-built laboratory automation protocols

import { Pipeline } from './Pipeline';
import type { PipelineTemplate, BuiltInTemplate } from './pipeline-types';

export class PipelineTemplates {
  private static templates: Map<string, PipelineTemplate> = new Map();

  /**
   * Register a custom template
   */
  static register(template: PipelineTemplate): void {
    this.templates.set(template.name, template);
  }

  /**
   * Get template by name
   */
  static get(name: string): PipelineTemplate | undefined {
    return this.templates.get(name) || this.getBuiltIn(name as BuiltInTemplate);
  }

  /**
   * Create pipeline from template
   */
  static create(templateName: string, variables?: Record<string, any>): Pipeline {
    const template = this.get(templateName);
    
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const pipeline = new Pipeline(template.name, template.description);

    // Apply variables
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        pipeline.setVariable(key, value);
      });
    }

    // Add steps from template
    template.steps.forEach(step => {
      pipeline.addStep(step.name, step.config);
      
      if (step.retryPolicy) {
        pipeline.setRetry(step.retryPolicy);
      }
      
      if (step.timeout) {
        pipeline.setTimeout(step.timeout);
      }
    });

    return pipeline;
  }

  /**
   * Get built-in template
   */
  private static getBuiltIn(name: BuiltInTemplate): PipelineTemplate | undefined {
    switch (name) {
      case 'genomics-analysis':
        return this.genomicsAnalysis();
      case 'drug-discovery':
        return this.drugDiscovery();
      case 'quality-control':
        return this.qualityControl();
      case 'batch-processing':
        return this.batchProcessing();
      case 'research-workflow':
        return this.researchWorkflow();
      default:
        return undefined;
    }
  }

  /**
   * Genomics Analysis Pipeline
   * DNA Sequencing → AI Analysis → Quality Check → Storage
   */
  private static genomicsAnalysis(): PipelineTemplate {
    return {
      name: 'genomics-analysis',
      description: 'Complete genomics analysis pipeline from sequencing to variant calling',
      version: '1.0.0',
      variables: {
        samples: 100,
        quality: 'high',
        storageDestination: 's3://results/genomics'
      },
      steps: [
        {
          name: 'DNA Sequencing',
          type: 'instrument',
          config: {
            instrument: 'dna-sequencer',
            samples: 100,
            priority: 'quality'
          },
          retryPolicy: {
            maxAttempts: 2,
            backoff: 'exponential',
            initialDelay: 5000
          },
          timeout: 3600000 // 1 hour
        },
        {
          name: 'Quality Assessment',
          type: 'transform',
          config: {
            transform: (data: any) => {
              // Check sequencing quality
              const avgQuality = data.results?.reduce((sum: number, r: any) => 
                sum + r.quality, 0) / data.results?.length || 0;
              
              return {
                ...data,
                qualityScore: avgQuality,
                passQC: avgQuality > 0.95
              };
            }
          }
        },
        {
          name: 'QC Check',
          type: 'condition',
          config: {
            condition: (data: any) => data.passQC === true
          }
        },
        {
          name: 'AI Variant Calling',
          type: 'ai-analysis',
          config: {
            aiModel: 'genomics-llm',
            task: 'variant-calling'
          },
          timeout: 1800000 // 30 minutes
        },
        {
          name: 'Generate Report',
          type: 'transform',
          config: {
            transform: (data: any) => {
              return {
                variants: data.results?.variants || [],
                confidence: data.results?.confidence || 0,
                timestamp: Date.now(),
                format: 'vcf'
              };
            }
          }
        },
        {
          name: 'Store Results',
          type: 'storage',
          config: {
            destination: 's3://results/genomics',
            format: 'vcf'
          }
        }
      ],
      tags: ['genomics', 'dna', 'sequencing', 'variant-calling']
    };
  }

  /**
   * Drug Discovery Pipeline
   * Mass Spectrometry → AI Prediction → Results Analysis
   */
  private static drugDiscovery(): PipelineTemplate {
    return {
      name: 'drug-discovery',
      description: 'Drug compound analysis and prediction pipeline',
      version: '1.0.0',
      steps: [
        {
          name: 'Mass Spectrometry',
          type: 'instrument',
          config: {
            instrument: 'mass-spec',
            samples: 50,
            priority: 'quality'
          },
          timeout: 2400000 // 40 minutes
        },
        {
          name: 'Compound Identification',
          type: 'ai-analysis',
          config: {
            aiModel: 'chem-bert',
            task: 'compound-identification'
          }
        },
        {
          name: 'Drug Efficacy Prediction',
          type: 'ai-analysis',
          config: {
            aiModel: 'drug-discovery',
            task: 'efficacy-prediction'
          }
        },
        {
          name: 'Safety Analysis',
          type: 'transform',
          config: {
            transform: (data: any) => {
              const compounds = data.results?.compounds || [];
              
              return {
                safeCompounds: compounds.filter((c: any) => 
                  c.toxicity < 0.3 && c.efficacy > 0.7
                ),
                totalAnalyzed: compounds.length,
                timestamp: Date.now()
              };
            }
          }
        },
        {
          name: 'Generate Report',
          type: 'storage',
          config: {
            destination: 's3://drug-discovery/results',
            format: 'json'
          }
        }
      ],
      tags: ['drug-discovery', 'mass-spec', 'chemistry']
    };
  }

  /**
   * Quality Control Pipeline
   * Multiple Tests → QC Validation → Approve/Reject
   */
  private static qualityControl(): PipelineTemplate {
    return {
      name: 'quality-control',
      description: 'Automated quality control testing pipeline',
      version: '1.0.0',
      steps: [
        {
          name: 'Spectroscopy Analysis',
          type: 'instrument',
          config: {
            instrument: 'spectroscopy',
            samples: 100,
            priority: 'speed'
          }
        },
        {
          name: 'Microscopy Inspection',
          type: 'instrument',
          config: {
            instrument: 'microscopy',
            samples: 100,
            priority: 'quality'
          }
        },
        {
          name: 'AI Quality Assessment',
          type: 'ai-analysis',
          config: {
            aiModel: 'pathology-ai',
            task: 'quality-check'
          }
        },
        {
          name: 'QC Decision',
          type: 'condition',
          config: {
            condition: (data: any) => {
              const score = data.results?.qualityScore || 0;
              return score > 0.90;
            }
          }
        },
        {
          name: 'Approve Batch',
          type: 'custom',
          config: {
            execute: async (context: any) => {
              return {
                status: 'approved',
                batchId: context.variables.get('batchId'),
                timestamp: Date.now()
              };
            }
          }
        },
        {
          name: 'Send Notification',
          type: 'webhook',
          config: {
            url: 'https://api.example.com/qc/approved',
            method: 'POST'
          }
        }
      ],
      tags: ['quality-control', 'qc', 'validation']
    };
  }

  /**
   * Batch Processing Pipeline
   * High-volume sample processing
   */
  private static batchProcessing(): PipelineTemplate {
    return {
      name: 'batch-processing',
      description: 'High-throughput batch sample processing',
      version: '1.0.0',
      steps: [
        {
          name: 'Batch Preparation',
          type: 'transform',
          config: {
            transform: (data: any) => {
              const samples = data.samples || [];
              const batchSize = 50;
              
              const batches = [];
              for (let i = 0; i < samples.length; i += batchSize) {
                batches.push(samples.slice(i, i + batchSize));
              }
              
              return { batches, totalSamples: samples.length };
            }
          }
        },
        {
          name: 'Process Batch',
          type: 'instrument',
          config: {
            instrument: 'dna-sequencer',
            samples: 500,
            priority: 'cost'
          },
          retryPolicy: {
            maxAttempts: 3,
            backoff: 'exponential'
          }
        },
        {
          name: 'AI Analysis',
          type: 'ai-analysis',
          config: {
            aiModel: 'bio-gpt',
            task: 'batch-analysis'
          }
        },
        {
          name: 'Aggregate Results',
          type: 'transform',
          config: {
            transform: (data: any) => {
              return {
                totalProcessed: data.results?.length || 0,
                successRate: data.results?.successRate || 0,
                timestamp: Date.now()
              };
            }
          }
        },
        {
          name: 'Store Results',
          type: 'storage',
          config: {
            destination: 's3://batch-results',
            format: 'json'
          }
        }
      ],
      tags: ['batch', 'high-throughput', 'processing']
    };
  }

  /**
   * Research Workflow Pipeline
   * Multi-step scientific protocol
   */
  private static researchWorkflow(): PipelineTemplate {
    return {
      name: 'research-workflow',
      description: 'Flexible multi-step research protocol',
      version: '1.0.0',
      steps: [
        {
          name: 'Initial Analysis',
          type: 'instrument',
          config: {
            instrument: 'spectroscopy',
            samples: 50,
            priority: 'balanced'
          }
        },
        {
          name: 'Data Preprocessing',
          type: 'transform',
          config: {
            transform: (data: any) => {
              // Normalize and clean data
              return {
                normalized: true,
                samples: data.results?.length || 0,
                timestamp: Date.now()
              };
            }
          }
        },
        {
          name: 'AI Insights',
          type: 'ai-analysis',
          config: {
            aiModel: 'bio-gpt',
            task: 'research-analysis'
          }
        },
        {
          name: 'Validation Check',
          type: 'condition',
          config: {
            condition: (data: any) => {
              return (data.results?.confidence || 0) > 0.85;
            }
          }
        },
        {
          name: 'Generate Publication Data',
          type: 'transform',
          config: {
            transform: (data: any) => {
              return {
                figures: data.results?.figures || [],
                statistics: data.results?.statistics || {},
                conclusions: data.results?.conclusions || [],
                timestamp: Date.now()
              };
            }
          }
        },
        {
          name: 'Store Research Data',
          type: 'storage',
          config: {
            destination: 's3://research/publications',
            format: 'json'
          }
        }
      ],
      tags: ['research', 'scientific', 'protocol']
    };
  }

  /**
   * List all available templates
   */
  static list(): string[] {
    const builtIn: string[] = [
      'genomics-analysis',
      'drug-discovery',
      'quality-control',
      'batch-processing',
      'research-workflow'
    ];

    const custom = Array.from(this.templates.keys());
    
    return [...builtIn, ...custom];
  }

  /**
   * Get template info
   */
  static info(name: string): PipelineTemplate | undefined {
    return this.get(name);
  }
}
