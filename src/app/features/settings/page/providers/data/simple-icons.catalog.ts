import iconsData from 'simple-icons/icons.json';
import { SimpleIconOption } from '../models/provider';

export const SIMPLE_ICONS_CATALOG: SimpleIconOption[] = iconsData
  .map((icon) => {
    const aliases = [
      ...(icon.aliases?.aka ?? []),
      ...(icon.aliases?.old ?? []),
      ...(icon.aliases?.dup?.map((duplicate) => duplicate.title) ?? [])
    ];
    return {
      slug: icon.slug,
      label: icon.title,
      defaultColor: `#${icon.hex}`,
      ...(aliases.length ? { aliases } : {})
    };
  })
  .sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));

export const SIMPLE_ICONS_COUNT = SIMPLE_ICONS_CATALOG.length;
