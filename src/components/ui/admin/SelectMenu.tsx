import React, { useEffect, useState } from 'react';
import { TreeSelect, Spin } from 'antd';
import { listMenu } from '../../../api/system/menu';

interface MenuItem {
  menuId: number;
  menuName: string;
  parentId: number;
  children?: MenuItem[];
}

interface SelectMenuProps {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  reloadKey?: any;
}

// Helper to build tree from flat menu list
function buildMenuTree(list: MenuItem[], parentId = 0): any[] {
  const tree = list
    .filter(item => item.parentId === parentId)
    .map(item => ({
      title: item.menuName,
      value: item.menuId,
      key: item.menuId,
      children: buildMenuTree(list, item.menuId),
    }));
  return tree;
}

const SelectMenu: React.FC<SelectMenuProps> = ({ value, onChange, disabled, reloadKey }) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    listMenu()
      .then((res: any) => {
        const list: MenuItem[] = res.data || [];
        // Add the default Main Menu node
        const tree = [
          {
            title: 'Main Menu',
            value: 0,
            key: 0,
            children: buildMenuTree(list, 0),
          },
        ];
        setTreeData(tree);
      })
      .finally(() => setLoading(false));
  }, [reloadKey]);

  return (
    <Spin spinning={loading}>
      <TreeSelect
        value={value ?? 0}
        treeData={treeData}
        placeholder="Select the upper level menu"
        onChange={onChange}
        treeDefaultExpandAll
        allowClear={false}
        disabled={disabled}
        style={{ width: '100%' }}
      />
    </Spin>
  );
};

export default SelectMenu;
