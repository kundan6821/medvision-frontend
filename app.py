from flask import Flask, render_template, request, jsonify
import requests, json, os

app = Flask(__name__)

MEDICINE_API_URL = os.environ.get('BACKEND_URL', 'https://medvision-backend-egoh.onrender.com/api/medicine')
if not MEDICINE_API_URL.endswith('/api/medicine'):
    MEDICINE_API_URL = MEDICINE_API_URL.rstrip('/') + '/api/medicine'
REMINDERS_FILE = os.path.join(os.path.dirname(__file__), 'reminders.json')

def load_reminders():
    if os.path.exists(REMINDERS_FILE):
        with open(REMINDERS_FILE) as f:
            return json.load(f)
    return []

def save_reminders(reminders):
    with open(REMINDERS_FILE, 'w') as f:
        json.dump(reminders, f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/medicine/search', methods=['GET'])
def search_medicine():
    medicine_name = request.args.get('name', '')
    if not medicine_name:
        return jsonify({'error': 'Medicine name is required'}), 400
    
    headers = {}
    auth_header = request.headers.get('Authorization')
    if auth_header:
        headers['Authorization'] = auth_header
        
    try:
        response = requests.get(f'{MEDICINE_API_URL}/info', params={'name': medicine_name}, headers=headers)
        return jsonify(response.json()), response.status_code
    except requests.exceptions.ConnectionError:
        return jsonify({'error': 'Medicine API service is not available. Please ensure the backend is running on port 3000.'}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/medicine/upload', methods=['POST'])
def upload_medicine_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image file selected'}), 400
    
    try:
        headers = {}
        auth_header = request.headers.get('Authorization')
        if auth_header:
            headers['Authorization'] = auth_header
            
        files = {'image': (file.filename, file.stream, file.mimetype)}
        response = requests.post(f'{MEDICINE_API_URL}/upload', files=files, headers=headers)
        return jsonify(response.json()), response.status_code
    except requests.exceptions.ConnectionError:
        return jsonify({'error': 'Medicine API service is not available. Please ensure the backend is running on port 3000.'}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reminders', methods=['GET'])
def get_reminders():
    return jsonify(load_reminders())

@app.route('/api/reminders', methods=['POST'])
def add_reminder():
    data = request.get_json()
    medicine = data.get('medicine', '').strip()
    time = data.get('time', '').strip()
    if not medicine or not time:
        return jsonify({'error': 'Medicine and time are required'}), 400
    reminders = load_reminders()
    reminder = {'id': int(__import__('time').time() * 1000), 'medicine': medicine, 'time': time}
    reminders.append(reminder)
    save_reminders(reminders)
    return jsonify(reminder), 201

@app.route('/api/reminders/<int:reminder_id>', methods=['DELETE'])
def delete_reminder(reminder_id):
    reminders = load_reminders()
    reminders = [r for r in reminders if r['id'] != reminder_id]
    save_reminders(reminders)
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)