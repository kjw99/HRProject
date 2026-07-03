from app.main import app
from app.observability import setup_metrics


setup_metrics(app)
