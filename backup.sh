#!/usr/bin/env bash

#Get current date
NOW="$(date +'%d-%m-%Y_%H-%M')"

# Settings:

# Path to a temporary directory
DIR=/home/relay/backup/

# Name of the database
DB_NAME=paradigm

function mongodb_dump
{
  # Name of the compressed file
  FILE="${DIR}${DB_NAME}_${NOW}.tar.gz"

  # Dump the database
  mongodump --host=192.168.1.7 --port=27017 -d $DB_NAME -o $DIR

  # Compress
  tar -zcvf $FILE $DIR$DB_NAME

  # Remove the temporary database dump directory
  rm -fr $DIR$DB_NAME
}

mongodb_dump