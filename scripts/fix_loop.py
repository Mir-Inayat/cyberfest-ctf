from CTFd import create_app
from CTFd.models import Configs, db
import sys

try:
    app = create_app()
    with app.app_context():
        config = Configs.query.filter_by(key="verify_emails").first()
        if config:
            print(f"[INFO] Current verify_emails value: {config.value}")
            if config.value == "1" or config.value == "true":
                config.value = "false"
                db.session.commit()
                print("[INFO] Successfully disabled email verification to prevent redirect loop.")
            else:
                print("[INFO] Email verification already disabled.")
        else:
            print("[INFO] verify_emails config not found, system defaults apply.")
except Exception as e:
    print(f"[ERROR] Failed to update config: {e}")
    sys.exit(1)
