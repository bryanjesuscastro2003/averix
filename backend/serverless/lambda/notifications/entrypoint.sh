#Create environment
python3 -m venv venv

# Activate the virtual environment
. venv/bin/activate

# Install the dependencies
pip install --no-cache-dir -r requirements.txt

# Run the application
python3 src/app.py
