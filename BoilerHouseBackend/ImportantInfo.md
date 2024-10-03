Set up:
1. Run all pip installs, including boto3, django, cryptocode, and maybe rest_framework
2. Make sure you are in backend dir and run 'python makemigrations api'
3. Also run 'python migrate'
4. Take a look at sample requests in '/examples'

To run the server:
1. Use the command: python3 manage.py runserver

To create an endpoint:
Use the /api/ping/ endpoint as an example

1. Create the handler method in views.py using the correct decorator (get put post delete etc.)
2. Add the url to /api/urls.py file, note it will be available at /api/*
3. Test the endpoint from postman


To reset the migrations:
(THIS WILL RESET THE DATABASE)

python3 manage.py migrate api zero
python3 manage.py makemigrations
python3 manage.py migrate