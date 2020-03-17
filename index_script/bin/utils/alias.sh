#!/bin/sh

# Set Parameter
ELASTICSEARCH_HOST=$1
INDEX=$2
ALIAS=$3
OPENQUERY_HOST=$4

# Check Essential Argv
if [ "x${ELASTICSEARCH_HOST}" = "x" ] || [ "x${INDEX}" = "x" ] || [ "x${ALIAS}" = "x" ] || [ "x${OPENQUERY_HOST} = x" ]; then
  echo "Usage ) $0 <elasticsearch_host> <index> <alias> <openquery_host>"
  exit 1
fi

# Check index exists or not
curl -f -XGET 'http://'"${ELASTICSEARCH_HOST}"'/'"${INDEX}" -s -o /dev/null 2>&1
if [ "0" -ne "$?" ]; then
  echo "! Error: not exists index : ${INDEX}";
  exit 1;
fi

NOWDOCUMENT=`curl -f -XGET 'http://'"${ELASTICSEARCH_HOST}"'/_cat/indices/'"${ALIAS}"'?h=docs.count' -s`
NOWINDEX=`curl -f -XGET 'http://'"${ELASTICSEARCH_HOST}"'/_cat/indices/'"${ALIAS}"'?h=index' -s`
NEWDOCUMENT=`curl -f -XGET 'http://'"${ELASTICSEARCH_HOST}"'/_cat/indices/'"${ALIAS}"'?h=docs.count' -s`

percent=100

if [ ${NOWINDEX} = ${INDEX} ]; 
then
  echo "Alias를 수행하고자 하는 Index명이 현재 서비스되고 있는 서비스명과 동일합니다.";
  # System Message
  MESSAGE="Alias를 변경하고자 하는 Index명이 현재 서비스ㄷ되고 있는 서비스명('"${NOWINDEX}"')과 동일합니다. Alias 변경을 수행하지 않았습니다."
  curl -XPOST 'http://'${GATEWAY_HOST}'/console/_alert' -H 'Content-Type: application/json' -d '
  {
      "level" : "error",
      "code" : "0",
      "confirm" : "false",
      "section" : "Alias Change",
      "message" : "['"${NOWINDEX}"'] Alias 변경 실패",
      "details" : "'"${MESSAGE}"'"
  }
  '; echo

elif [ $percent -ge 50 -a $percent -le 150 ];
then
  echo "색인 Alias 변경 시작"
  # 현재 Alias Remove and 새로운 색인 index로 Alias 설정
  curl -XPOST 'http://'"${ELASTICSEARCH_HOST}"'/_aliases' -H 'Content-Type: application/json' -d '
  {
    "action" : {
      {"remove" : {"index" : "*", "alias" : "'${ALIAS}'"}}
      {"add" : {"index" : "'${INDEX}'", "alias" : "'${ALIAS}'"}}
    }
  }
  '; echo
  echo "색인의 Alias 변경이 성공 하였습니다."

  # System Message
  MESSAGE="색인의 Alias 변경이 성공하였습니다.('"${INDEX}"' => '"${ALIAS}"')"
  curl -XPOST 'http://'${GATEWAY_HOST}'/console/_alert' -H 'Content-Type: application/json' -d '
  {
      "level" : "info",
      "code" : "0",
      "section" : "Alias Change",
      "message" : "['"${ALIAS}"'] Alias 변경 완료",
      "details" : "'"${MESSAGE}"'"
  }'; echo


  # 기존 Alias Index Status Change Open --> Close
  curl -XPOST 'http://'"${ELASTICSEARCH_HOST}"'/'"${NOWINDEX}"'/_close'; echo

  echo "색인을 Close 상태로 변경 하였습니다."

  # System Message
  MESSAGE="색인의 Close 상태로 변경 하였습니다.('"${INDEX}"' => '"${ALIAS}"')"
  curl -XPOST 'http://'${GATEWAY_HOST}'/console/_alert' -H 'Content-Type: application/json' -d '
  {
      "level" : "info",
      "code" : "0",
      "section" : "Alias Change",
      "message" : "['"${NOWINDEX}"'] Index 변경 완료",
      "details" : "'"${MESSAGE}"'"
  }
  '; echo
else
  echo "Conunt of documents exceeded the allowable range"

  #System Message
  MESSAGE="기존 색인 ('"$NOWINDEX"' => '"$NOWDOCUMENT"'건)과 신규 색인('"$INDEC"' => '"$NOWDOCUMENT"')건의 문서건수 변경 허용범위(50%)를 초과하지 않아 신규 색인을 반영하지 않았습니다."
  
  curl -XPOST 'http://'${GATEWAY_HOST}'/console/_alert' -H 'Content-Type: application/json' -d '
  {
      "level" : "error",
      "code" : "0",
      "confirm" : "false"
      "section" : "Alias Change",
      "message" : "['"${NOWINDEX}"'] Alias 변경 실패",
      "details" : "'"${MESSAGE}"'"
  }
  '; echo
fi


























