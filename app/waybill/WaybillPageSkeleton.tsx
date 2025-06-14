export default function WaybillPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 状态切换器骨架 */}
      <div className="glass rounded-3xl shadow-xl p-6">
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <div className="h-16 w-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 搜索栏骨架 */}
      <div className="glass rounded-3xl shadow-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* 表格骨架 */}
      <div className="glass rounded-3xl shadow-xl p-6">
        <div className="space-y-4">
          {/* 表头 */}
          <div className="grid grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
          
          {/* 表格行 */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-8 gap-4">
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="h-8 bg-gray-100 rounded"></div>
              ))}
            </div>
          ))}
        </div>
        
        {/* 分页骨架 */}
        <div className="flex justify-between items-center mt-6">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 