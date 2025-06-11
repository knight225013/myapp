import pandas as pd

data = [
    {"trackingNumber": "365321688896", "carrier": "sagawa"},
    {"trackingNumber": "365321688897", "carrier": "sagawa"},
    {"trackingNumber": "365321688898", "carrier": "sagawa"}
]

df = pd.DataFrame(data)
df.to_excel("test-waybills.xlsx", index=False)
print("✅ test-waybills.xlsx 已生成")