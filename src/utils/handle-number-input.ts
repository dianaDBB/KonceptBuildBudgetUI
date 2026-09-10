export function parseNumberInput(value: string): number {
  const normalizedValue = value.replace(/\s/g, '');
  const separatorIndex = normalizedValue.search(/[.,]/);

  if (separatorIndex === -1) {
    return Number(normalizedValue.replace(/\D/g, '')) || 0;
  }

  const integerPart = normalizedValue.slice(0, separatorIndex).replace(/\D/g, '') || '0';
  const decimalPart = normalizedValue
    .slice(separatorIndex + 1)
    .replace(/\D/g, '')
    .slice(0, 2);

  return Number(`${integerPart}.${decimalPart.padEnd(2, '0')}`);
}

export function limitDecimals(value: string): string {
  const separatorIndex = value.search(/[.,]/);

  if (separatorIndex === -1) {
    return value;
  }

  const integerPart = value.slice(0, separatorIndex);
  const separator = value[separatorIndex];
  const decimalPart = value
    .slice(separatorIndex + 1)
    .replace(/\D/g, '')
    .slice(0, 2);

  return `${integerPart}${separator}${decimalPart}`;
}
