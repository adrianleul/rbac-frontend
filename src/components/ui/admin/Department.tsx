import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { deptTreeSelect } from '../../../api/system/user';
import { Department } from '../../../types/dept';
import { handleTree } from '../../../utils/config';

interface DepartmentTreeSelectProps {
  value?: number | null;
  onChange?: (deptId: number | null, deptName?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface TreeNode {
  id: number;
  label: string;
  children?: TreeNode[];
  deptId: number;
  deptName: string;
  parentId: number;
}

// Interface for handleTree function
interface FlatDepartment {
  id: string;
  parentId: string;
  deptId: number;
  deptName: string;
  [key: string]: any;
}

const DepartmentTreeSelect: React.FC<DepartmentTreeSelectProps> = ({
  value,
  onChange,
  placeholder = "Select department",
  disabled = false,
  className = "",
  allowClear = true,
  size = 'md'
}) => {
  const [departments, setDepartments] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [selectedDept, setSelectedDept] = useState<TreeNode | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  };

  // Fetch department tree data
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await deptTreeSelect();
        
        // Debug: Log the raw response to see the structure
        console.log('Raw API Response:', response);
        
        // Handle different response structures
        let departmentData: Department[];
        
        if (response && typeof response === 'object') {
          // If response has data property (standard API response)
          if ('data' in response && Array.isArray(response.data)) {
            departmentData = response.data;
          }
          // If response is directly an array
          else if (Array.isArray(response)) {
            departmentData = response;
          }
          // If response.data is not an array, try to find the data
          else if (response.data && typeof response.data === 'object') {
            // Check if it's a flat array that needs to be converted to tree
            const flatData = Array.isArray(response.data) ? response.data : [];
            departmentData = flatData;
          }
          else {
            throw new Error('Invalid response structure');
          }
        } else {
          throw new Error('Invalid response');
        }
        
        // Check if the data is already in tree structure or needs conversion
        const hasChildren = departmentData.some(dept => dept.children && dept.children.length > 0);
        
        let treeData: Department[];
        if (hasChildren) {
          // Data is already in tree structure
          treeData = departmentData;
        } else {
          // Convert flat data to tree structure using handleTree utility
          // First convert Department to FlatDepartment format
          const flatDepts: FlatDepartment[] = departmentData.map(dept => ({
            id: (dept.deptId || (dept as any).id || 0).toString(),
            parentId: (dept.parentId || (dept as any).parentId || 0).toString(),
            deptId: dept.deptId || (dept as any).id || 0,
            deptName: dept.deptName || (dept as any).label || 'Unnamed Department',
            createTime: dept.createTime,
            ancestors: dept.ancestors,
            orderNum: dept.orderNum,
            leader: dept.leader,
            phone: dept.phone,
            email: dept.email,
            status: dept.status,
            delFlag: dept.delFlag,
            remark: dept.remark,
            parentName: dept.parentName
          }));
          
          const treeResult = handleTree(flatDepts, 'id', 'parentId', 'children');
          
          // Convert back to Department format
          treeData = treeResult.map((item: any) => ({
            deptId: parseInt(item.id),
            parentId: parseInt(item.parentId),
            deptName: item.deptName || item.label || 'Unnamed Department',
            createTime: item.createTime,
            ancestors: item.ancestors,
            orderNum: item.orderNum,
            leader: item.leader,
            phone: item.phone,
            email: item.email,
            status: item.status,
            delFlag: item.delFlag,
            remark: item.remark,
            parentName: item.parentName,
            children: item.children || []
          })) as Department[];
        }
        
        // Transform the data to match our TreeNode interface
        const transformData = (depts: Department[]): TreeNode[] => {
          return depts.map((dept: Department): TreeNode => {
            // Handle different possible field names for department name and ID
            const deptName = dept.deptName || (dept as any).label || (dept as any).name || 'Unnamed Department';
            const deptId = dept.deptId || (dept as any).id || 0;
            const parentId = dept.parentId || (dept as any).parentId || 0;
            
            return {
              id: deptId,
              label: deptName,
              deptId: deptId,
              deptName: deptName,
              parentId: parentId,
              children: dept.children && dept.children.length > 0 ? transformData(dept.children) : undefined
            };
          });
        };

        const transformedData = transformData(treeData);
        
        // Debug: Log the transformed data to verify department names
        console.log('Transformed Department Data:', transformedData);
        
        setDepartments(transformedData);
        
        // Find and set selected department if value is provided
        if (value) {
          const findDept = (nodes: TreeNode[]): TreeNode | null => {
            for (const node of nodes) {
              if (node.deptId === value) return node;
              if (node.children) {
                const found = findDept(node.children);
                if (found) return found;
              }
            }
            return null;
          };
          const found = findDept(transformedData);
          setSelectedDept(found);
        }
      } catch (err) {
        console.error('Error fetching department tree:', err);
        setError('Failed to load departments');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [value]);

  const toggleExpand = (deptId: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deptId)) {
        newSet.delete(deptId);
      } else {
        newSet.add(deptId);
      }
      return newSet;
    });
  };

  const handleSelect = (dept: TreeNode) => {
    setSelectedDept(dept);
    onChange?.(dept.deptId, dept.deptName);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSelectedDept(null);
    onChange?.(null);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setShowDropdown(!showDropdown);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.department-tree-select')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const renderDepartmentNode = (node: TreeNode, level = 0): JSX.Element => {
    const isExpanded = expandedIds.has(node.deptId);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedDept?.deptId === node.deptId;

    return (
      <div key={node.deptId} className="w-full">
        <div 
          className={`
            flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors
            ${isSelected ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'}
            ${level > 0 ? 'ml-4' : ''}
          `}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => handleSelect(node)}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.deptId);
              }}
              className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="flex-1 truncate">{node.label}</span>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-gray-200 ml-2">
            {node.children!.map(child => renderDepartmentNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative department-tree-select ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={`
          w-full flex items-center justify-between px-3 border border-gray-300 rounded-md
          bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-200 focus:border-green-500
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
          ${sizeClasses[size]}
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedDept ? (
            <>
              <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="truncate">{selectedDept.label}</span>
            </>
          ) : (
            <span className="text-gray-500 truncate">{placeholder}</span>
          )}
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {allowClear && selectedDept && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-600 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
              <span className="ml-2">Loading departments...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-red-500 text-center">
              {error}
            </div>
          ) : departments.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">
              No departments available
            </div>
          ) : (
            <div className="py-1">
              {departments.map(dept => renderDepartmentNode(dept))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DepartmentTreeSelect;

