export default function ChannelPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 主要内容区域骨架 */}
      <div className="glass rounded-3xl shadow-xl p-8">
        {/* 标题和操作栏骨架 */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div className="h-7 w-32 bg-gray-200 rounded"></div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* 搜索框骨架 */}
            <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
            
            <div className="flex gap-4">
              <div className="h-6 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* 表格骨架 */}
        <div className="space-y-4">
          {/* 表头 */}
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
          
          {/* 表格行 */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
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

      {/* 估价表格骨架 */}
      <div className="glass rounded-3xl shadow-xl p-8">
        <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-8 gap-4">
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="h-6 bg-gray-100 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 