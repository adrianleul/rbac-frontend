export interface Department {
  createTime: string;
  deptId: number;
  parentId: number;
  ancestors: string;
  deptName: string;
  orderNum: number;
  leader: string;
  phone: string;
  email: string;
  status: string;
  delFlag: string;
  remark?: string | null;
  parentName?: string | null;
  children?: Department[];
}
