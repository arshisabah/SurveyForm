export const toPct = (part, total) => total === 0 ? 0 : Number(((part / total) * 100).toFixed(2));
