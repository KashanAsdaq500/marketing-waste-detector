from fastapi import FastAPI

app = FastAPI()

try:
    from main import app as main_app
    app = main_app
    IMPORT_ERROR = None
except Exception as e:
    IMPORT_ERROR = f"{type(e).__name__}: {e}"

@app.get("/api/v1/health")
def health():
    if IMPORT_ERROR:
        return {
            "status": "error",
            "service": "Marketing Waste Detector API",
            "import_error": IMPORT_ERROR
        }

    return {
        "status": "healthy",
        "service": "Marketing Waste Detector API"
    }
