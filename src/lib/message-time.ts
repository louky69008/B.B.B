export function messageTimeInMicroseconds(timestamp: string) {
  const remaining = timestamp.match(/\.\d{3}(\d{1,3})(?=Z|[+-])/i)?.[1] ?? "";
  return Date.parse(timestamp) * 1_000 + Number(remaining.padEnd(3, "0"));
}
