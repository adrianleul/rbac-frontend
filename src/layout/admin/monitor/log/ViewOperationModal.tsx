// components/modals/ViewOperationModal.tsx
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "../../../../components/ui/dialog";

type OperationLog = {
  operId: number;
  title: string;
  businessType: number;
  businessTypes: number[] | null;
  method: string;
  requestMethod: string;
  operatorType: number;
  operName: string;
  deptName: string;
  operUrl: string;
  operIp: string;
  operLocation: string;
  operParam: string; // JSON stringified object
  jsonResult: string; // JSON stringified object
  status: number; // 0 = success, 1 = failure
  errorMsg: string | null;
  operTime: string; // ISO or formatted date string
  costTime: number; // milliseconds
};

type ViewOperationModalProps = {
  open: boolean;
  onClose: () => void;
  data: OperationLog | null;
};

const ViewOperationModal: React.FC<ViewOperationModalProps> = ({ open, onClose, data }) => {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent width={1000} style={{ top: 24 }} className="w-full max-w-3xl p-6 rounded-xl shadow-xl" footer={null}>
        <div className="relative">

          {/* Title */}
          <DialogTitle className="text-xl font-semibold mb-4">View Operation Log</DialogTitle>

          {/* Grid Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Title:</strong> {data.title}</div>
            <div><strong>Business Type:</strong> {data.businessType}</div>
            <div><strong>Method:</strong> {data.method}</div>
            <div><strong>Request Method:</strong> {data.requestMethod}</div>
            <div><strong>Operator:</strong> {data.operName}</div>
            <div><strong>Department:</strong> {data.deptName}</div>
            <div><strong>IP:</strong> {data.operIp}</div>
            <div><strong>Location:</strong> {data.operLocation}</div>
            <div className="col-span-2">
              <strong>Parameters:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 whitespace-pre-wrap">
                {data.operParam}
              </pre>
            </div>
            <div className="col-span-2">
              <strong>Result:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 whitespace-pre-wrap">
                {data.jsonResult}
              </pre>
            </div>
            <div><strong>Status:</strong> {data.status === 0 ? "Success" : "Failure"}</div>
            <div><strong>Error:</strong> {data.errorMsg || "-"}</div>
            <div><strong>Time:</strong> {data.operTime}</div>
            <div><strong>Duration:</strong> {data.costTime}ms</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewOperationModal;
