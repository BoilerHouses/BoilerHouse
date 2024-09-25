To run the server:
1. use the command: python3 manage.py runserver

To create an endpoint:
Use the /api/ping/ endpoint as an example

1. Create the handler method in views.py using the correct decorator (get put post delete etc.)
2. Add the url to /api/urls.py file, note it will be available at /api/*
3. Test the endpoint from postman