import { Record, Env, Records, RecordSearchParameters, SearchSortParameter, SearchSortDirection } from './types.d.js';

const defaultCount = 1000000;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get('count');
    const count = countParam ? parseInt(countParam) : defaultCount;
    const url = 'https://api.resonite.com/records/pagedSearch';
    const sortBy = searchParams.get('sortby') || 'TotalVisits';
    const sortDirection = searchParams.get('sortdirection') || 'Descending';
    const format = searchParams.get('format') || 'csv';

    if (!(sortBy in SearchSortParameter)) return new Response(fail(400, 'sortBy parameter is invalid. Options are: CreationDate, LastUpdateDate, FirstPublishTime, TotalVisits, Name, Random'));
    if (!(sortDirection in SearchSortDirection)) return new Response(fail(400, 'sortDirection parameter is invalid. Options are: Ascending, Descending'));

    const body = constructBody(count, sortBy, sortDirection);

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(fail(500, 'API Request Failed, Rate limited or API is down'));
    }

    const obj = (await response.json()) as Records;

    const records = obj.records.map((record: Record) => {
      const ownerId = record.ownerId;
      const id = record.id;
      const name = record.name || 'unknown';
      const uri = `resrec:///${ownerId}/${id}`;
      return [name, uri];
    });

    if (format === 'json') {
      return new Response(JSON.stringify(records), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      // format is 'csv'
      const csv = records.map((record: string[]) => record.join('|亡|')).join('\n');
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
        },
      });
    }
  },
};

/**
 * Constructs the body for the API request
 * @param count number of records to fetch
 * @param sortBy parameter to sort by
 * @param sortDirection direction to sort in
 */
function constructBody(count: number, sortBy: string, sortDirection: string): RecordSearchParameters {
  return {
    count: count,
    sortBy: SearchSortParameter[sortBy as keyof typeof SearchSortParameter],
    sortDirection: SearchSortDirection[sortDirection as keyof typeof SearchSortDirection],
  };
}

/**
 * Creates a failed object
 * @param status error status
 * @param data error message
 */
export function fail(status: number, data: string) {
  return JSON.stringify({ code: status, message: data });
}
