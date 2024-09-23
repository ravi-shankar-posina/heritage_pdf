import io
import re
import zipfile
from flask import Flask, request, send_file
from flask_cors import CORS
from PyPDF2 import PdfReader, PdfWriter

app = Flask(__name__)
CORS(app)

def extract_employee_info(text):
    emp_no_match = re.search(r'Emp No:(\d+)', text)
    name_match = re.search(r'Mr\. ([^\n]+)', text)
    
    if emp_no_match and name_match:
        emp_no = emp_no_match.group(1)
        name = name_match.group(1).replace(' ', '_')
        return f"{emp_no}_{name}_VPFY24"
    return None

@app.route('/', methods=['GET'])
def index():
    return "Hello"

@app.route('/favicon.ico', methods=['GET'])
def favicon():
    return "", 204

@app.route('/split-pdf', methods=['POST'])
def split_pdf():
    if 'file' not in request.files:
        return "No file part", 400
    
    file = request.files['file']
    if file.filename == '':
        return "No selected file", 400

    if file and file.filename.endswith('.pdf'):
        pdf_reader = PdfReader(file)
        memory_file = io.BytesIO()
        
        with zipfile.ZipFile(memory_file, 'w') as zf:
            for page in range(len(pdf_reader.pages)):
                pdf_writer = PdfWriter()
                pdf_writer.add_page(pdf_reader.pages[page])
                
                page_content = pdf_reader.pages[page].extract_text()
                filename = extract_employee_info(page_content)
                
                if filename:
                    output = io.BytesIO()
                    pdf_writer.write(output)
                    zf.writestr(f"{filename}.pdf", output.getvalue())
        
        memory_file.seek(0)
        return send_file(memory_file, download_name='files.zip', as_attachment=True)
    
    return "Invalid file format", 400

if __name__ == '__main__':
    app.run(host="0.0.0.0")