# A Winter Literary Journey - Personal Portfolio

A modern, elegant, and interactive personal portfolio designed for Nguyen Thi Dung, a passionate Literature Tutor.

## Features
- **Winter Theme**: Soft winter palette, snowfall effect, and elegant typography.
- **Interactive Snow Game**: Catch the falling snow in a small interactive mini-game.
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile devices.
- **Micro-Animations**: Scroll reveal, hover effects, and smooth transitions.

## Project Structure
```
portfolio/
├── app.py                  # Flask application entry point
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Main HTML template
└── static/
    ├── css/
    │   └── style.css       # CSS styles
    ├── js/
    │   └── script.js       # JavaScript for animations and game
    └── images/             # Image assets
```

## Running Locally

1. **Install Python**: Ensure you have Python installed on your system.
2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Run the Application**:
   ```bash
   python app.py
   ```
4. **View in Browser**: Open `http://127.0.0.1:5000` in your web browser.

## Image Assets
To extract images directly from the provided CV PDF, run the provided `extract.py` script located in the parent directory:
```bash
pip install PyMuPDF Pillow
python extract.py
```
This will extract valid images and save them into `portfolio/static/images/`. You can then update the image paths in `templates/index.html`.
