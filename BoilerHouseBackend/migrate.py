import subprocess

def run_commands():
    try:
        subprocess.run(['python3', 'manage.py', 'migrate', 'api', 'zero'], check=True)
        subprocess.run(['python3', 'manage.py', 'makemigrations'], check=True)        
        subprocess.run(['python3', 'manage.py', 'migrate'], check=True)
        print("Commands executed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while executing the command: {e}")
if __name__ == "__main__":
    run_commands()
