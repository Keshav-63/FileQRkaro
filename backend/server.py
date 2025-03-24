from flask import Flask, request, jsonify, send_file, redirect, render_template
from flask_cors import CORS
import os
import zipfile
import cloudinary
import cloudinary.uploader
import qrcode
import pymongo
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import uuid
import datetime
import threading
import time


load_dotenv()

app = Flask(__name__, static_folder="../frontend", static_url_path="/")
CORS(app)


client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client["fileqrkaro"]
files_collection = db["files"]
contact_collection = db["contacts"]


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

EXPIRATION_TIME = 86400  # 24 hours in seconds


def zip_folder(folder_path, output_filename):
    """Compress a folder into a zip file."""
    zip_path = os.path.join(app.config["UPLOAD_FOLDER"], output_filename)
    
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, folder_path)  
                zipf.write(file_path, arcname=arcname)  
    
    return zip_path

@app.route("/upload", methods=["POST"])
def upload_file():
    """Upload a file/folder, store in Cloudinary, and generate a QR code."""
    uploaded_files = request.files.getlist("files")  # Get multiple files
    is_folder = request.form.get("is_folder") == "true"

    if not uploaded_files:
        return jsonify({"error": "No file uploaded"}), 400

    unique_id = str(uuid.uuid4())  

    if is_folder:
        
        folder_name = secure_filename(uploaded_files[0].filename).split("/")[0]
        formatted_folder_name = f"FileQRkaro_{folder_name}_{unique_id}"  
        folder_path = os.path.join(app.config["UPLOAD_FOLDER"], formatted_folder_name)

        os.makedirs(folder_path, exist_ok=True)

        
        for file in uploaded_files:
            file_path = os.path.join(folder_path, secure_filename(file.filename))
            file.save(file_path)

       
        zip_filename = formatted_folder_name + ".zip" 
        zip_path = zip_folder(folder_path, zip_filename)
        upload_path = zip_path
        resource_type = "raw" 

        final_filename = zip_filename

    else:
   
        uploaded_file = uploaded_files[0]
        filename = secure_filename(uploaded_file.filename)
        formatted_filename = f"FileQRkaro_{filename}_{unique_id}"  
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], formatted_filename)
        uploaded_file.save(file_path)
        upload_path = file_path
        resource_type = "auto"  

        final_filename = formatted_filename  


    try:
        cloud_response = cloudinary.uploader.upload(
            upload_path,
            resource_type=resource_type,
            folder="fileqrkaro",
            public_id=f"fileqrkaro/{final_filename}",
            access_mode="public"
        )
        file_url = cloud_response["secure_url"]
        cloudinary_id = cloud_response["public_id"]
        print(f"Uploaded to Cloudinary: {file_url} | Public ID: {cloudinary_id}")  
    except Exception as e:
        print(f"Cloudinary Upload Error: {str(e)}")
        return jsonify({"error": "Cloudinary upload failed"}), 500


    qr_link = f"http://localhost:5000/download/{final_filename}"
    qr = qrcode.make(qr_link)
    qr_path = os.path.join(app.config["UPLOAD_FOLDER"], f"{final_filename}_qr.png")
    qr.save(qr_path)


    qr_response = cloudinary.uploader.upload(
        qr_path, folder="fileqrkaro", public_id=f"fileqrkaro/{final_filename}_qr"
    )
    qr_url = qr_response["secure_url"]


    expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days=1)
    file_data = {
        "filename": final_filename,
        "file_url": file_url,
        "qr_url": qr_url,
        "cloudinary_id": cloudinary_id,
        "uploaded_at": datetime.datetime.utcnow(),
        "expires_at": expiration_time
    }
    files_collection.insert_one(file_data)

    return jsonify({"file_url": file_url, "qr_url": qr_url})




@app.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    """Redirect user to the Cloudinary URL for file download."""
    file_data = files_collection.find_one({"filename": filename})
    if not file_data:
        return jsonify({"error": "File not found or expired"}), 404

    
    print(f"Redirecting to Cloudinary URL: {file_data['file_url']}")

    return redirect(file_data["file_url"], code=302)


@app.route("/submit-contact", methods=["POST"])
def submit_contact():
    """Save contact form data to MongoDB."""
    data = request.json  
    if not data:
        return jsonify({"error": "No data provided"}), 400

    
    required_fields = ["name", "email", "subject", "message"]
    for field in required_fields:
        if field not in data or not data[field].strip():
            return jsonify({"error": f"{field} is required"}), 400

    
    contact_data = {
        "name": data["name"],
        "email": data["email"],
        "subject": data["subject"],
        "message": data["message"],
        "submitted_at": datetime.datetime.utcnow()
    }
    contact_collection.insert_one(contact_data)

    return jsonify({"message": "Contact form submitted successfully"}), 200


@app.route("/")
def index():
    return app.send_static_file("index.html")


def cleanup_expired_files():
    """Check for expired files and delete them from Cloudinary."""
    while True:
        current_time = datetime.datetime.utcnow()
        expired_files = files_collection.find({"expires_at": {"$lt": current_time}})

        for file_data in expired_files:
            try:
                cloudinary.uploader.destroy(file_data["cloudinary_id"])
                files_collection.delete_one({"_id": file_data["_id"]})
                print(f"Deleted expired file: {file_data['filename']}")
            except Exception as e:
                print(f"Error deleting file {file_data['filename']}: {str(e)}")

        time.sleep(3600)  # Run cleanup every hour


# Start the cleanup process in a separate thread
threading.Thread(target=cleanup_expired_files, daemon=True).start()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
