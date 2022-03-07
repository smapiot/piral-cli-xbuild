export function assertRequiredType(config: any, property: string, type: 'string' | 'number' | 'boolean') {
  if (typeof config[property] !== type) {
    throw new Error(`The required "${property}" property needs to be a ${type}.`);
  }
}

export function assertOptionalType(config: any, property: string, type: 'string' | 'number' | 'boolean') {
  if (config[property] !== undefined && typeof config[property] !== type) {
    throw new Error(`The optional "${property}" property needs to be a ${type}.`);
  }
}
