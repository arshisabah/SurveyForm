export function validateForm(config, answers) {
  const errors = {};
  config.fields.forEach(field => {
    const v = answers[field.id];
    const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length===0);
    if (field.required && empty) errors[field.id] = `${field.label} is required`;
  });
  return errors;
}
