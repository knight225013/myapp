'use client';
interface PriceSettingListProps {
  settings: any[];
}

export function PriceSettingList({ settings }: PriceSettingListProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>生效时段</th>
          <th>费率</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {settings.map((setting) => (
          <tr key={setting.id}>
            <td>{setting.period}</td>
            <td>{setting.rate}</td>
            <td>
              <button>编辑</button>
              <button>删除</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
