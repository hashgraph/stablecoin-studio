import { Transform } from 'class-transformer';

export function RemoveHexPrefix() {
  return Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item) =>
        item.toLowerCase().startsWith('0x') ? item.substring(2) : item
      );
    }
    return value.toLowerCase().startsWith('0x') ? value.substring(2) : value;
  });
}
