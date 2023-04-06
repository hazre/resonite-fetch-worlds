export interface Env {}

interface Record {
  id: string;
  assetUri: string;
  globalVersion: number;
  localVersion: number;
  name: string;
  recordType: string;
  ownerName: string;
  tags: string[];
  thumbnailUri: string;
  isPublic: boolean;
  isForPatrons: boolean;
  isListed: boolean;
  isDeleted: boolean;
  lastModificationTime: string;
  randomOrder: number;
  visits: number;
  rating: number;
  type: string;
  ownerId: string;
}

/**
 * Creates a failed object
 * @param status error status
 * @param data error message
 */
export function fail(status: number, data: string) {
  return JSON.stringify({ code: status, message: data });
}

function inRange(x: string, min: number, max: number) {
  const int = parseInt(x);
  if (!int) return false;
  return int >= min && int <= max;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const count = searchParams.get('count') || 1000000;
    const sortBy = searchParams.get('sortby') || '4';
    const sortDirection = searchParams.get('sortdirection') || '2';

    if (!inRange(sortBy, 1, 6)) return new Response(fail(400, 'sortBy parameter is invalid. range is between 1 and 6. (CreationDate=1, LastUpdateDate=2, FirstPublishTime=3, TotalVisits=4, Name=5, Random=6)'));
    if (!inRange(sortDirection, 1, 2)) return new Response(fail(400, 'sortDirection parameter is invalid. range is between 1 and 2. (Ascending=1, Descending=2)'));

    const url = 'https://cloudx.azurewebsites.net/api/records/pagedSearch';
    const body = { count: count, sortBy: parseInt(sortBy) - 1, sortDirection: parseInt(sortDirection) - 1 };

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const json = await response.json();

    const records = json.records.map((record: Record) => {
      const ownerId = record.ownerId;
      const id = record.id;
      const name = record.name || 'unknown';
      //very unique character ^-^
      const uri = `neosrec:///${ownerId}/${id}`;
      return [name, uri];
    });

    const csv = records.map((record: [string, string]) => record.join('|亡|')).join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
      },
    });
  },
};
