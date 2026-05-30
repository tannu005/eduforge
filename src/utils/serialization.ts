import { Module, Block } from '../types';
import { validateModuleJSON, ValidationError } from './validation';

export const CURRENT_SCHEMA_VERSION = '1.0.0';

/**
 * Validates and exports a Module object to a pretty-printed JSON file download
 */
export const exportModuleToJSON = (
  moduleData: Omit<Module, 'past' | 'future'>
): { success: boolean; errors: ValidationError[] } => {
  // Validate schema before exporting
  const errors = validateModuleJSON(moduleData);
  const blockingErrors = errors.filter(e => e.severity === 'Blocking');
  
  if (blockingErrors.length > 0) {
    return { success: false, errors };
  }

  // Inject schema version and serialize
  const exportData = {
    ...moduleData,
    version: CURRENT_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Generate safe title for filename
  const cleanTitle = moduleData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'untitled-module';

  const dateString = new Date().toISOString().split('T')[0];
  const filename = `${cleanTitle}-${dateString}.json`;

  // Trigger file download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, errors };
};

/**
 * Decodes and imports a JSON string into a valid Module schema.
 * Performs migrations, validates, and regenerates UUIDs to prevent collisions.
 */
export const importModuleFromJSON = (
  jsonString: string
): { success: boolean; module: Module | null; errors: ValidationError[]; warning?: string } => {
  let parsed: any;
  const errors: ValidationError[] = [];

  try {
    parsed = JSON.parse(jsonString);
  } catch (err: any) {
    errors.push({
      severity: 'Blocking',
      message: `Invalid JSON format: ${err?.message || 'Failed to parse file.'}`,
    });
    return { success: false, module: null, errors };
  }

  // Run validation
  const validationErrors = validateModuleJSON(parsed);
  const blocking = validationErrors.filter(e => e.severity === 'Blocking');
  
  if (blocking.length > 0) {
    return { success: false, module: null, errors: validationErrors };
  }

  // Version migration logic (IM-003)
  let warningMessage = undefined;
  if (parsed.version && parsed.version !== CURRENT_SCHEMA_VERSION) {
    warningMessage = `Migrated module schema from version ${parsed.version} to current version ${CURRENT_SCHEMA_VERSION}.`;
    parsed.version = CURRENT_SCHEMA_VERSION;
  }

  // Regenerate UUIDs to prevent canvas ID collisions (IM-005)
  if (Array.isArray(parsed.blocks)) {
    parsed.blocks = parsed.blocks.map((block: Block, index: number) => ({
      ...block,
      id: crypto.randomUUID(), // New UUID
      order: index,
    }));
  }

  const importedModule: Module = {
    moduleId: parsed.moduleId || crypto.randomUUID(),
    title: parsed.title || 'Imported Module',
    description: parsed.description || '',
    version: CURRENT_SCHEMA_VERSION,
    createdAt: parsed.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: parsed.author || { id: 'imported', name: 'Imported Instructor' },
    metadata: parsed.metadata || { estimatedDuration: 10, difficulty: 'beginner', tags: [], thumbnail: '' },
    blocks: parsed.blocks || [],
    quizConfig: parsed.quizConfig || { feedbackMode: 'immediate', passingScore: 70, showScoreOnCompletion: true },
  };

  return {
    success: true,
    module: importedModule,
    errors: validationErrors,
    warning: warningMessage,
  };
};

/**
 * Mocks helper to read a file as Base64 data (A9.1 EX-005)
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
