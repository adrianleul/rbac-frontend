interface DictItem {
  label: string;
  value: string | number;
}

// date formatting
export function parseTime(time: any, pattern?: string): string | null {
  if (!time) return null;

  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}';
  let date: Date;

  if (typeof time === 'object') {
    date = time;
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    } else if (typeof time === 'string') {
      time = time.replace(/-/g, '/').replace('T', ' ').replace(/\.\d{3}/g, '');
    }

    if (typeof time === 'number' && time.toString().length === 10) {
      time *= 1000;
    }

    date = new Date(time);
  }

  const formatObj: Record<string, number> = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };

  return format.replace(/{(y|m|d|h|i|s|a)+}/g, (_match, key) => {
    let value = formatObj[key];
    if (key === 'a') return ['day', '1', '2', '3', '4', '5', '6'][value];
    if (_match.length > 0 && value < 10) value = Number(`0${value}`);
    return value.toString() || '0';
  });
}

// form reset
export function resetForm(ref: React.RefObject<{ resetFields: () => void }>) {
  if (ref.current) {
    ref.current.resetFields();
  }
}

// Add date range
export function addDateRange(
  params: Record<string, any>,
  dateRange: [string, string],
  propName?: string
): Record<string, any> {
  const search = { ...params };
  search.params = typeof search.params === 'object' && search.params !== null && !Array.isArray(search.params) ? search.params : {};

  if (!propName) {
    search.params['beginTime'] = dateRange?.[0];
    search.params['endTime'] = dateRange?.[1];
  } else {
    search.params['begin' + propName] = dateRange?.[0];
    search.params['end' + propName] = dateRange?.[1];
  }

  return search;
}

// echo data dictionary
export function selectDictLabel(datas: DictItem[], value: string | number): string {
  if (value === undefined) return '';

  const match = datas.find((item) => item.value == value);
  return match ? match.label : String(value);
}

// Echo data dictionary (string, array)
export function selectDictLabels(
  datas: DictItem[],
  value: string[] | string,
  separator: string = ','
): string {
  if (!value || value.length === 0) return '';

  const values = Array.isArray(value) ? value : value.split(separator);

  return values
    .map((val) => {
      const match = datas.find((item) => item.value == val);
      return match ? match.label : val;
    })
    .join(separator);
}

// String formatting(%s)
export function sprintf(str: string, ...args: any[]): string {
  let i = 0;
  return str.replace(/%s/g, () => {
    const arg = args[i++];
    return typeof arg === 'undefined' ? '' : arg;
  });
}

// Convert string, undefined, null etc. converted into ""
export function parseStrEmpty(str: any): string {
  if (!str || str === 'undefined' || str === 'null') {
    return '';
  }
  return str;
}

// Data merge
export function mergeRecursive(source: any, target: any): any {
  for (const key in target) {
    try {
      if (target[key]?.constructor === Object) {
        source[key] = mergeRecursive(source[key], target[key]);
      } else {
        source[key] = target[key];
      }
    } catch {
      source[key] = target[key];
    }
  }
  return source;
}

// Construct tree structure data
interface TreeNode {
  id: string;
  parentId: string;
  [key: string]: any;
}

export function handleTree<T extends TreeNode>(
  data: T[],
  id: keyof T = 'id',
  parentId: keyof T = 'parentId',
  children: string = 'children'
): T[] {
  const childrenListMap: Record<string, T[]> = {};
  const nodeIds: Record<string, T> = {};
  const tree: T[] = [];

  data.forEach(item => {
    const pid = item[parentId] as string;
    if (!childrenListMap[pid]) {
      childrenListMap[pid] = [];
    }
    const nodeId = item[id] as string;
    nodeIds[nodeId] = item;
    childrenListMap[pid].push(item);
  });

  data.forEach(item => {
    const pid = item[parentId] as string;
    if (!nodeIds[pid]) {
      tree.push(item);
    }
  });

  const adaptToChildrenList = (node: T) => {
    const nodeId = node[id] as string;
    if (childrenListMap[nodeId]) {
      (node as any)[children] = childrenListMap[nodeId];
      childrenListMap[nodeId].forEach(adaptToChildrenList);
    }
  };

  tree.forEach(adaptToChildrenList);
  return tree;
}

// Parameter handling
export function tansParams(params: Record<string, any>): string {
  let result = '';
  for (const propName in params) {
    const value = params[propName];
    const part = encodeURIComponent(propName) + '=';

    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key in value) {
          const val = value[key];
          if (val !== null && val !== '' && typeof val !== 'undefined') {
            const paramKey = `${propName}[${key}]`;
            result += `${encodeURIComponent(paramKey)}=${encodeURIComponent(val)}&`;
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&';
      }
    }
  }
  return result.slice(0, -1);
}

// Verify if it is in blob format
export function blobValidate(data: Blob): boolean {
  return data.type !== 'application/json';
}