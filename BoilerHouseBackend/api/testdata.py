'''
python3 api/testData.py
----------------------------------------------------------------------------------------
- populates database with 3 admin accounts and 5 user accounts
- admin1@gmail.com ... admin3@gmail.com
- user1@gmail.com ... user5@gmail.com
- also creates accounts under the following emails as admins and officers for the test club: 
            "asawaarin0@gmail.com", 
            "rohit.kannan203@gmail.com", 
            "thisisadhi@gmail.com", 
            "victorgao0308@gmail.com"
- each user has randomized bio, interests, grad year, and major
- Password is Test1234 for all accounts
- also populates database with a test club that has 4 officers and 6 total members

python3 api/testData.py --drop
----------------------------------------------------------------------------------------
- drops the database and runs python3 manage.py migrate


generate_large_club() takes a while to run. If you don't want a large club a test data, comment out the function call
'''

import psycopg2
from psycopg2 import sql
import cryptocode
import os
from dotenv import load_dotenv
import random
import argparse
import subprocess


IMAGE = "https://boilerhousebucket.s3.amazonaws.com/Test Club/icon/53d7ab13-e5a4-466b-9248-f974b41275dd.jpg"
PASSWORD = "Test1234"
BIO = ["sample bio 1", "test 123", "sample bio 2", "hi"]
INTERESTS = ["computer science", "league", "pokemon", "reading", "cooking", "gaming"]
GRAD_YEAR = [2024, 2025, 2026, 2027, 2028]
MAJOR = ["computer science", "data science", "political science", "physics", "math", "Psychology"]
USERNAME = ["admin1@gmail.com", "admin2@gmail.com", "admin3@gmail.com", "user1@gmail.com", 
            "user2@gmail.com", "user3@gmail.com", "user4@gmail.com", "user5@gmail.com", "asawaarin0@gmail.com", 
            "rohit.kannan203@gmail.com", "thisisadhi@gmail.com", "victorgao0308@gmail.com"]
NAME = ["admin1", "admin2", "admin3", "user1", "user2", "user3", "user4", "user5", "wipe", "dyude", "baab", "vickyg"]
LARGE_CLUB_MEMBERS = 250
MEMBER_NAME = "test"

MAJOR_INTERESTS = ["Development", "Math", "Model UN", "Math", "Coding", "Medical"]
GROUPS_OF_INTERESTS = [["Television", "TV", "Cinema", "Movies", "Breaking Bad", "Game of Thrones", "Suits", "The Dark Knight", "Lord of the Rings", "Film"],
                         ["Music", "Spotify", "Drake", "Travis Scott", "Kendrick Lamar", "Kanye West"], 
                         ["League of Legends", "Roblox", "Pokemon", "Valorant", "Minecraft", "Call of Duty", "Fortnite"], 
                         ["Brooklyn Nine Nine", "Friends", "The Office", "Parks n Rec", "Silicon Valley", "Young Sheldon", "How I met your Mother", "Superstore", "Two Broke Girls"], 
                         ["Reading", "Novels", "Books", "Harry Potter", "Jane Austen", "Literature", "Fantasy"],
                         ["Cooking", "Baking", "Food", "Eating", "Cuisines"],
                         ["Sleeping", "Relaxing", "Going out"], 
                         ["Basketball", "Football", "Soccer", "Baseball", "F1"]]

def drop_tables(conn):
    queries = ["DROP SCHEMA public CASCADE;"
                "CREATE SCHEMA public;"]
    
    with conn.cursor() as cursor:  
        for query in queries:   
            cursor.execute(query)               
        conn.commit()

def connect_db():
    load_dotenv()
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password=os.getenv("DATABASE_PASSWORD"),
            host="boilerhouse-postgres-db.cke5ybck7fmc.us-east-2.rds.amazonaws.com", 
            port="5432"
        )
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None
    

def build_insert_user_query(username, name, is_admin):
    load_dotenv()
    password = cryptocode.encrypt(PASSWORD, os.getenv("ENCRYPTION_KEY"))

    bio = random.sample(BIO, 1)[0]
    interests = random.sample(INTERESTS, random.randint(1, 5))
    interests = "{" + ",".join(f'"{interest}"' for interest in interests) + "}"
   
    majors = random.sample(MAJOR, random.randint(1, 3))
    majors = "{" + ",".join(f'"{major}"' for major in majors) + "}"

    grad_year = random.sample(GRAD_YEAR, 1)[0]

    return [f'''
             INSERT INTO api_loginpair (username, password, is_admin, is_active)
             VALUES ('{username}', '{password}', {is_admin}, true);
             ''',
            f'''
            INSERT INTO api_user (username, is_admin, password, name, bio, interests, created_profile, profile_picture, 
            grad_year, major, availability) VALUES ('{username}', {is_admin}, '{password}', '{name}', '{bio}', '{interests}', 
            true, '{IMAGE}', {grad_year}, '{majors}', '{{}}'::json);
            ''']     
def build_interested_user(username, name, is_admin):
    load_dotenv()
    password = cryptocode.encrypt(PASSWORD, os.getenv("ENCRYPTION_KEY"))

    major_index = random.randint(0, len(MAJOR) - 1)
    majors = [MAJOR[major_index]]
    majors = "{" + ",".join(f'"{major}"' for major in majors) + "}"
    use_major_specific = random.randint(1, 10)
    interests = []
    if (use_major_specific <= 8):
        interests.append(MAJOR_INTERESTS[major_index])
    interest_groups = random.sample(GROUPS_OF_INTERESTS, random.randint(1, 2))
    for group in interest_groups:
        interests.extend(random.sample(group, 4 - len(interest_groups)))
    interests = "{" + ",".join(f'"{interest}"' for interest in interests) + "}"
    bio = random.sample(BIO, 1)[0]
    grad_year = random.sample(GRAD_YEAR, 1)[0]
    return [f'''
             INSERT INTO api_loginpair (username, password, is_admin, is_active)
             VALUES ('{username}', '{password}', {is_admin}, true);
             ''',
            f'''
            INSERT INTO api_user (username, is_admin, password, name, bio, interests, created_profile, profile_picture, 
            grad_year, major, availability) VALUES ('{username}', {is_admin}, '{password}', '{name}', '{bio}', '{interests}', 
            true, '{IMAGE}', {grad_year}, '{majors}', '{{}}'::json);
            ''']    

def insert_user_data(conn):
    with conn.cursor() as cursor:  
        for username, name in zip(USERNAME, NAME):
            queries = build_interested_user(username, name, "user" not in name)   
            for query in queries:   
                cursor.execute(query)  
        for i in range(10, 500):
            username = f'user{i}'
            name = f'user{i}'
            queries = build_interested_user(username, name, False)   
            for query in queries:   
                cursor.execute(query)  
        conn.commit()


def insert_club_data(conn):
    with conn.cursor() as cursor:
        club_query = f'''
                        INSERT INTO api_club (name, description, culture, time_commitment, interests, icon, gallery, is_approved, "useQuestions", questionnaire, responses, meetings, deletion_votes, "officerQuestionnaire", "officerResponses", "acceptingApplications", "clubPhoneNumber", "clubEmail", "targetedAudience", "clubDues") VALUES
                        ('test club1', 'test desc', 'test culture', '1-5 hours', '{{"cs", "ds"}}', '{IMAGE}',
                        '{{}}', true, false, '{{}}', '{{}}', '{{}}', '{{}}', '[{{"text": "Whats your name?", "required": true}}]'::json, '{{}}', true, '', '', '', '')
                    '''

        cursor.execute(club_query) 

        club_query = f'''
                        INSERT INTO api_club (name, description, culture, time_commitment, interests, icon, gallery, is_approved, "useQuestions", questionnaire, responses, meetings, deletion_votes, "officerQuestionnaire", "officerResponses", "acceptingApplications", "clubPhoneNumber", "clubEmail", "targetedAudience", "clubDues") VALUES
                        ('test club2', 'test desc', 'test culture', '1-5 hours', '{{"cs", "ds"}}', '{IMAGE}',
                        '{{}}', true, false, '{{}}', '{{}}', '{{}}', '{{}}', '[{{"text": "Whats your name?", "required": true}}]'::json, '{{}}', true, '', '', '', '')
                    '''

        cursor.execute(club_query) 

        club_query = f'''
                        INSERT INTO api_club (name, description, culture, time_commitment, interests, icon, gallery, is_approved, "useQuestions", questionnaire, responses, meetings, deletion_votes, "officerQuestionnaire", "officerResponses", "acceptingApplications", "clubPhoneNumber", "clubEmail", "targetedAudience", "clubDues") VALUES
                        ('test club3', 'test desc', 'test culture', '1-5 hours', '{{"cs", "ds"}}', '{IMAGE}',
                        '{{}}', true, false, '{{}}', '{{}}', '{{}}', '{{}}', '[{{"text": "Whats your name?", "required": true}}]'::json, '{{}}', true, '', '', '', '')
                    '''

        cursor.execute(club_query) 

        club_query = f'''
                        INSERT INTO api_club (name, description, culture, time_commitment, interests, icon, gallery, is_approved, "useQuestions", questionnaire, responses, meetings, deletion_votes, "officerQuestionnaire", "officerResponses", "acceptingApplications", "clubPhoneNumber", "clubEmail", "targetedAudience", "clubDues") VALUES
                        ('test club4', 'test desc', 'test culture', '1-5 hours', '{{"cs", "ds"}}', '{IMAGE}',
                        '{{}}', true, false, '{{}}', '{{}}', '{{}}', '{{}}', '[{{"text": "Whats your name?", "required": true}}]'::json, '{{}}', true, '', '', '', '')
                    '''
        cursor.execute(club_query) 

        conn.commit()
        for i in range(1, 5):
            member_queries = [
                          f"INSERT INTO api_club_members (club_id, user_id) VALUES ({i}, 1)",
                          f"INSERT INTO api_club_members (club_id, user_id) VALUES ({i}, 2)",
                          f"INSERT INTO api_club_members (club_id, user_id) VALUES ({i}, 9)",
                          f"INSERT INTO api_club_officers (club_id, user_id) VALUES ({i}, 9)",
                          f"INSERT INTO api_club_members (club_id, user_id) VALUES ({i}, 10)",
                          f"INSERT INTO api_club_officers (club_id, user_id) VALUES ({i}, 10)",
                          f"INSERT INTO api_club_members (club_id, user_id) VALUES ({i}, 11)",
                          f"INSERT INTO api_club_officers (club_id, user_id) VALUES ({i}, 11)",
                          f"INSERT INTO api_club_members (club_id, user_id) VALUES ({i}, 12)",
                          f"INSERT INTO api_club_officers (club_id, user_id) VALUES ({i}, 12)",
                          ]
            if i > 1:
                id_list = range(35, 450)
                chosen_ids = random.sample(id_list, random.randint(50, 115))
                for j in chosen_ids:
                    member_queries.append(f"INSERT INTO api_club_members (club_id, user_id) VALUES ({i}, {j})")
            for query in member_queries:
                cursor.execute(query)

        conn.commit()

def close_connection(conn):
    if conn:
        conn.close()


def generate_large_club(conn):
    users = []
    names = []

    for i in range(1, LARGE_CLUB_MEMBERS + 1):
        users.append("test" + str(i) + "@gmail.com")
        names.append("test" + str(i))
    
    with conn.cursor() as cursor:
        for username, name in zip(users, names):
            queries = build_insert_user_query(username, name, False)   
            for query in queries:   
                cursor.execute(query)
        conn.commit()

        club_query = f'''
                        INSERT INTO api_club (name, description, culture, time_commitment, interests, icon, gallery, is_approved, "useQuestions", questionnaire, responses, meetings, deletion_votes, "officerQuestionnaire", "officerResponses", "acceptingApplications", "clubPhoneNumber", "clubEmail") VALUES 
                        ('big club', 'test', 'test', '16+ hours', '{{"cs", "ds"}}', '{IMAGE}',
                        '{{}}', true, false, '{{}}', '{{}}', '{{}}', '{{}}', '[{{"text": "Whats your name?", "required": true}}]'::json, '{{}}', true, '', '')
                    '''
        cursor.execute(club_query)
        conn.commit()

        for i in range(13, 13 + LARGE_CLUB_MEMBERS):
            query = f'INSERT INTO api_club_members (club_id, user_id) VALUES (2, {i})'
            cursor.execute(query)

        cursor.execute('INSERT INTO api_club_officers (club_id, user_id) VALUES (2, 1)')
        cursor.execute('INSERT INTO api_club_members (club_id, user_id) VALUES (2, 1)')
        conn.commit()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--drop', help="drop database", action='store_true')
    args = parser.parse_args()

    conn = connect_db()
    if conn:
        if args.drop:
            drop_tables(conn)
            print("Database dropped successfully")
            print("migrating...")
            command = ["python3", "manage.py", "migrate"]
            result = subprocess.run(command)
            print("Migrated successfully.")

        else:
            insert_user_data(conn)
            insert_club_data(conn)
            #generate_large_club(conn)
            close_connection(conn)
            print("Test data inserted successfully.")
