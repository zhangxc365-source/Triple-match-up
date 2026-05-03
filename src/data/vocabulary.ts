import { Word } from '../types';
import { yct1Words } from './words/yct1';
import { yct2Words } from './words/yct2';
import { yct3Words } from './words/yct3';
import { yct4Words } from './words/yct4';
import { yct5Words } from './words/yct5';
import { yct6Words } from './words/yct6';

export const VOCABULARY: Word[] = [
  ...yct1Words,
  ...yct2Words,
  ...yct3Words,
  ...yct4Words,
  ...yct5Words,
  ...yct6Words,
].filter(word => !word.translation.en.toLowerCase().includes('measure word'));
