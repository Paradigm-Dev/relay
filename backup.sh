#!/usr/bin/env bash

#Get current date
NOW="$(date +'%d-%m-%Y_%H-%M')"

# Settings:

# Path to a temporary directory
DIR=~/backup/

# Name of the database
DB_NAME=books

function mongodb_dump
{
  # Name of the compressed file
  FILE="${DIR}${DB_NAME}_${NOW}.tar.gz"

  # Dump the database
  mongodump -d $DB_NAME -o $DIR

  # Compress
  tar -zcvf $FILE $DIR$DB_NAME

  # Remove the temporary database dump directory
  rm -fr $DB_NAME
}

mongodb_dump