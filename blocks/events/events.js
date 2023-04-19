import { getEvents } from '../../scripts/scripts.js'
import { 
  createOptimizedPicture,
  readBlockConfig
} from '../../scripts/lib-franklin.js';
import createList from '../../scripts/list.js';

function createEvents(events, block) {
  const config = readBlockConfig(block);
  const limit = parseInt(config.limit, 10) || 10;
  block.innerHTML = '';

  createList(events, limit, block);
}

export default async function decorate(block) {
  const events = await getEvents(10);
  createEvents(events, block);
}
