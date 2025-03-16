import tkinter as tk
from tkinter import ttk

# Create the main application window
root = tk.Tk()
root.title("Create Instance")

# Set the window size
root.geometry("600x300")

root.resizable(False, False)

# Create a style object
style = ttk.Style()

# Configure the style for the frame
style.configure("TFrame", background="#f0f0f0")

# Configure the style for the labels
style.configure("TLabel", background="#f0f0f0", font=("Arial", 12))

# Configure the style for the entry and combobox
style.configure("TEntry", font=("Arial", 12))
style.configure("TCombobox", font=("Arial", 12))

# Configure the style for the button
style.configure("TButton", font=("Arial", 12), background="#4CAF50", foreground="white")
style.map("TButton", background=[("active", "#45a049")])

# Create a frame for the form
frame = ttk.Frame(root, padding="20")
frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

# Configure the grid to expand with the window
root.grid_rowconfigure(0, weight=1)
root.grid_columnconfigure(0, weight=1)
frame.grid_rowconfigure(0, weight=1)
frame.grid_columnconfigure(0, weight=1)

# Add the form title
title_label = ttk.Label(frame, text="Create Instance", font=("Arial", 16, "bold"))
title_label.grid(row=0, column=0, columnspan=2, pady=(0, 20))

# Add the name input
name_label = ttk.Label(frame, text="Name:")
name_label.grid(row=1, column=0, sticky=tk.W, pady=10)
name_entry = ttk.Entry(frame, width=30)
name_entry.grid(row=1, column=1, pady=10, sticky=(tk.W, tk.E))

# Add the model input
model_label = ttk.Label(frame, text="Model:")
model_label.grid(row=2, column=0, sticky=tk.W, pady=10)
model_combobox = ttk.Combobox(frame, values=["DkC1", "DkC2", "DkC3"], state="readonly")
model_combobox.grid(row=2, column=1, pady=10, sticky=(tk.W, tk.E))

# Add the capacity input
capacity_label = ttk.Label(frame, text="Capacity:")
capacity_label.grid(row=3, column=0, sticky=tk.W, pady=10)
capacity_combobox = ttk.Combobox(frame, values=["SMALL", "MEDIUM", "LARGE"], state="readonly")
capacity_combobox.grid(row=3, column=1, pady=10, sticky=(tk.W, tk.E))

# Add a submit button
submit_button = ttk.Button(frame, text="Submit")
submit_button.grid(row=4, column=0, columnspan=2, pady=(20, 0))

# Run the application
root.mainloop()