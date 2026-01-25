import argparse
import sys
from backend_bridge import BackendBridge

def main():
    parser = argparse.ArgumentParser(description="AttendIQ Python Face Client")
    parser.add_argument("action", choices=["register", "attend", "login-test"], help="Action to perform")
    parser.add_argument("--email", required=True, help="User email")
    parser.add_argument("--password", required=True, help="User password")
    
    args = parser.parse_args()
    
    bridge = BackendBridge()
    
    print(f"--- Attempting to {args.action} for {args.email} ---")
    
    if not bridge.login(args.email, args.password):
        print("Authentication failed. Exiting.")
        sys.exit(1)
        
    if args.action == "register":
        bridge.register_face()
    elif args.action == "attend":
        bridge.mark_attendance()
    elif args.action == "login-test":
        print("Authentication successful, connection established.")

if __name__ == "__main__":
    main()
