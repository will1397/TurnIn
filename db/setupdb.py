#!/usr/bin/python

import MySQLdb as db
import json

with open('../config/config.json') as json_data:
  config = json.load(json_data)

host = config.get('mysql').get('host')
user = config.get('mysql').get('user')
password = config.get('mysql').get('password')
database = config.get('mysql').get('database')

def setupDB():

  print(database)
  con = db.connect(host,user,password,database)
  cur = con.cursor()

  #create table
  cur.execute('''CREATE TABLE IF NOT EXISTS Users
              (
              id  INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
              name VARCHAR(150) NOT NULL,
              username VARCHAR(150) NOT NULL,
              password VARCHAR(150) NOT NULL,
              PRIMARY KEY (id)
              );''')

  cur.execute('''CREATE TABLE IF NOT EXISTS Filebox
              (
              username VARCHAR(150) NOT NULL,
              boxname VARCHAR(150) NOT NULL,
              time INT(100) NOT NULL,
              code INT(11)
              );''')

  cur.execute('''CREATE TABLE IF NOT EXISTS Files
              (
              boxname VARCHAR(150) NOT NULL,
              filename VARCHAR(150) NOT NULL,
              username VARCHAR(150) NOT NULL
              );''')

  if con:
    con.close()
  
setupDB()
