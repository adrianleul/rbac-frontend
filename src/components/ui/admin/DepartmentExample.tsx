import React, { useState } from 'react';
import DepartmentTreeSelect from './Department';

const DepartmentExample: React.FC = () => {
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [selectedDeptName, setSelectedDeptName] = useState<string>('');

  const handleDepartmentChange = (deptId: number | null, deptName?: string) => {
    setSelectedDeptId(deptId);
    setSelectedDeptName(deptName || '');
    console.log('Selected Department:', { deptId, deptName });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Department Tree Select Examples</h2>
      
      {/* Basic Usage */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700">Basic Usage</h3>
        <DepartmentTreeSelect
          value={selectedDeptId}
          onChange={handleDepartmentChange}
          placeholder="Select a department"
        />
      </div>

      {/* Disabled State */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700">Disabled State</h3>
        <DepartmentTreeSelect
          value={null}
          onChange={() => {}}
          disabled={true}
          placeholder="Disabled department select"
        />
      </div>

      {/* Different Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Different Sizes</h3>
        <div className="space-y-2">
          <DepartmentTreeSelect
            value={null}
            onChange={() => {}}
            size="sm"
            placeholder="Small size"
          />
          <DepartmentTreeSelect
            value={null}
            onChange={() => {}}
            size="md"
            placeholder="Medium size (default)"
          />
          <DepartmentTreeSelect
            value={null}
            onChange={() => {}}
            size="lg"
            placeholder="Large size"
          />
        </div>
      </div>

      {/* Without Clear Button */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700">Without Clear Button</h3>
        <DepartmentTreeSelect
          value={null}
          onChange={() => {}}
          allowClear={false}
          placeholder="No clear button"
        />
      </div>

      {/* Custom Styling */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700">Custom Styling</h3>
        <DepartmentTreeSelect
          value={null}
          onChange={() => {}}
          className="max-w-md"
          placeholder="Custom width"
        />
      </div>
    </div>
  );
};

export default DepartmentExample; 