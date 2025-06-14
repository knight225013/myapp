import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Shipment } from '@/types/shipment';

interface ShipmentTableOptimizedProps {
  shipments: Shipment[];
  onSelectShipment: (shipment: Shipment) => void;
  onEditShipment: (shipment: Shipment) => void;
  selectedRows: string[];
  onRowSelectionChange: (selectedRows: string[]) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// 单行组件 - 使用memo优化
const ShipmentRow = memo(({ 
  index, 
  style, 
  data 
}: { 
  index: number; 
  style: React.CSSProperties; 
  data: {
    shipments: Shipment[];
    onSelectShipment: (shipment: Shipment) => void;
    onEditShipment: (shipment: Shipment) => void;
    selectedRows: string[];
    onRowSelectionChange: (selectedRows: string[]) => void;
  };
}) => {
  const { shipments, onSelectShipment, onEditShipment, selectedRows, onRowSelectionChange } = data;
  const shipment = shipments[index];

  const handleRowClick = useCallback(() => {
    onSelectShipment(shipment);
  }, [shipment, onSelectShipment]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEditShipment(shipment);
  }, [shipment, onEditShipment]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const isChecked = e.target.checked;
    const newSelectedRows = isChecked
      ? [...selectedRows, shipment.id]
      : selectedRows.filter(id => id !== shipment.id);
    onRowSelectionChange(newSelectedRows);
  }, [shipment.id, selectedRows, onRowSelectionChange]);

  const isSelected = selectedRows.includes(shipment.id);

  return (
    <div 
      style={style} 
      className={`grid grid-cols-8 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
        isSelected ? 'bg-blue-50' : ''
      }`}
      onClick={handleRowClick}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="mr-2"
        />
        <span className="text-sm font-medium">{shipment.waybillNumber}</span>
      </div>
      
      <div className="text-sm text-gray-600">
        {shipment.recipient}
      </div>
      
      <div className="text-sm text-gray-600">
        {shipment.country}
      </div>
      
      <div className="text-sm text-gray-600">
        {shipment.channel?.name || '-'}
      </div>
      
      <div className="text-sm text-gray-600">
        {shipment.weight}kg
      </div>
      
      <div className="text-sm">
        <span className={`px-2 py-1 rounded-full text-xs ${
          shipment.status === '已签收' ? 'bg-green-100 text-green-800' :
          shipment.status === '转运中' ? 'bg-blue-100 text-blue-800' :
          shipment.status === '已下单' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {shipment.status}
        </span>
      </div>
      
      <div className="text-sm text-gray-600">
        {shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString() : '-'}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handleEditClick}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          编辑
        </button>
      </div>
    </div>
  );
});

ShipmentRow.displayName = 'ShipmentRow';

// 表头组件 - 使用memo优化
const TableHeader = memo(({ 
  selectedRows, 
  shipments, 
  onRowSelectionChange 
}: {
  selectedRows: string[];
  shipments: Shipment[];
  onRowSelectionChange: (selectedRows: string[]) => void;
}) => {
  const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const newSelectedRows = isChecked ? shipments.map(s => s.id) : [];
    onRowSelectionChange(newSelectedRows);
  }, [shipments, onRowSelectionChange]);

  const isAllSelected = shipments.length > 0 && selectedRows.length === shipments.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < shipments.length;

  return (
    <div className="grid grid-cols-8 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-medium text-sm text-gray-700">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isAllSelected}
          ref={(input) => {
            if (input) input.indeterminate = isIndeterminate;
          }}
          onChange={handleSelectAll}
          className="mr-2"
        />
        运单号
      </div>
      <div>收件人</div>
      <div>目的国</div>
      <div>渠道</div>
      <div>重量</div>
      <div>状态</div>
      <div>创建时间</div>
      <div>操作</div>
    </div>
  );
});

TableHeader.displayName = 'TableHeader';

// 分页组件 - 使用memo优化
const Pagination = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const pages = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  const handlePageClick = useCallback((page: number) => {
    onPageChange(page);
  }, [onPageChange]);

  const handlePrevClick = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextClick = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-700">
        第 {currentPage} 页，共 {totalPages} 页
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevClick}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          上一页
        </button>
        
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && handlePageClick(page)}
            disabled={page === '...'}
            className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
              page === currentPage
                ? 'bg-blue-500 text-white border-blue-500'
                : page === '...'
                ? 'cursor-default'
                : 'hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={handleNextClick}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          下一页
        </button>
      </div>
    </div>
  );
});

Pagination.displayName = 'Pagination';

// 主表格组件
export default function ShipmentTableOptimized({
  shipments,
  onSelectShipment,
  onEditShipment,
  selectedRows,
  onRowSelectionChange,
  currentPage,
  totalPages,
  onPageChange,
}: ShipmentTableOptimizedProps) {
  // 使用useMemo优化数据传递
  const listData = useMemo(() => ({
    shipments,
    onSelectShipment,
    onEditShipment,
    selectedRows,
    onRowSelectionChange,
  }), [shipments, onSelectShipment, onEditShipment, selectedRows, onRowSelectionChange]);

  // 如果数据量大，使用虚拟化
  const useVirtualization = shipments.length > 100;

  if (shipments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">暂无运单数据</div>
        <div className="text-gray-400 text-sm mt-2">请尝试调整筛选条件或创建新的运单</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <TableHeader
        selectedRows={selectedRows}
        shipments={shipments}
        onRowSelectionChange={onRowSelectionChange}
      />
      
      {useVirtualization ? (
        <List
          height={600}
          itemCount={shipments.length}
          itemSize={80}
          itemData={listData}
        >
          {ShipmentRow}
        </List>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {shipments.map((shipment, index) => (
            <ShipmentRow
              key={shipment.id}
              index={index}
              style={{}}
              data={listData}
            />
          ))}
        </div>
      )}
      
      <div className="p-4 border-t border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
} 