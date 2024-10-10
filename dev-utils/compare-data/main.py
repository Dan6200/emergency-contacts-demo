#cspell:ignore reindex
import pandas as pd

# Load the Excel file
file_path = 'LinkID Data.xlsx'
excel_data = pd.read_excel(file_path, sheet_name=None)


# Read each sheet into a DataFrame
# Extract individual sheets (as DataFrames)
df1 = excel_data['data1']  # First sheet
df2 = excel_data['data2']  # Second sheet
df3 = excel_data['data3']  # Third sheet

# Strip leading and trailing spaces from all column names
df1.columns = df1.columns.str.strip()
df2.columns = df2.columns.str.strip()
df3.columns = df3.columns.str.strip()

# # Reindex to ensure same shape for comparison
# Align all dataframes on their union of indices and columns
# Align df1 and df2 to the structure of df3 (reference)
df1, _ = df1.align(df3, fill_value=pd.NA)
df2, _ = df2.align(df3, fill_value=pd.NA)


# Print each sheet...
print({'name': 'data1', 'sheet': df1})
print({'name': 'data2', 'sheet': df2})
print({'name': 'data3', 'sheet': df3})

# Example: Compare sheet 1 and sheet 2
comparison_1_2 = df1.compare(df2)
comparison_1_3 = df1.compare(df3)
comparison_2_3 = df2.compare(df3)
comparison_3_3 = df3.compare(df3)

# Display differences between the sheets
print("Differences between Sheet 1 and Sheet 2:")
print(comparison_1_2)

print("\nDifferences between Sheet 1 and Sheet 3:")
print(comparison_1_3)

print("\nDifferences between Sheet 2 and Sheet 3:")
print(comparison_2_3)

print("\nComparison between Sheet 3 and itself:")
print(comparison_3_3)
