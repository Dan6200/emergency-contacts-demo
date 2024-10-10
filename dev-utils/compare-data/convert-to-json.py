import pandas as pd
import json

# Load the Excel file
file_path = "LinkID Data.xlsx"

# Specify the sheet names you want to convert to JSON
sheets = ["Emergency Contacts (DB)"]

# Loop through each sheet, read the data, and convert it to JSON
for sheet in sheets:
    df = pd.read_excel(file_path, sheet_name=sheet, dtype={'resident_id': str, 'roomNo': str})
    # Convert DataFrame to a dictionary (orient='records' gives list of rows as dictionaries)
    data = df.to_dict(orient='records')
    
    # Define the JSON output file name (sheet name)
    output_file = f"{sheet}.json"
    
    # Save the JSON data to a file
    with open(output_file, "w") as json_file:
        json.dump(data, json_file, indent=4)
    
    print(f"Data from {sheet} has been converted to {output_file}")

print("All sheets have been processed.")

