#!/bin/sh

# Set path
SOURCE_PATH=$0
echo ${SOURCE_PATH}
export SOURCE_PATH
BASE_PATH=$(cd `dirname $SOURCE_PATH`/..; pwd)
# echo ${BASE_PATH} : *현재 실행되고 있는 파일의 위치를 기준으로 return 상위 디렉토리 ==> cd../; pwd)

LOG_PATH=${BASE_PATH}/logs/{SOURCE_TYPE}
export LOG_PATH

IS_REAL=${HOSTNAME:0:2}
export IS_REAL

# Signal Function
# trap "SIGNAL_TERM ${CHILD_PID}" TERM INT KILL
SIGNAL_TERM() {
    PID=$1
    if [ "x" != "x${PID}" ]; then
        if [ "0" != "${PID}" ]; then
            echo "Caught SIGTERM signal => ${PID}"
            kill -TERM "${PID}" 2>/dev/null
        fi
    fi
}

# Set Timezone
TZ=Asia/Seoul
export TZ

# Set JAVA_HOME
JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.131-11.b12.el7.x86_64
export JAVA_HOME

# Set Logstash
LOGSTASH_PAHT=/shcsw/openqry/logstash
LOGSTASH_OPTS="--pipeline.batch.size 1000"
export LOGSTASH_PAHT LOGSTASH_OPTS

#CMS oracle JDBC
CMS_ORACLE_JDBC_HOST=IP_ADDR
CMS_ORACLE_JDBC_PORT=PORT_NUM
CMS_ORACLE_JDBC_DATABASE=DATABASE_NAME
CMS_ORACLE_JDBC_USER=
CMS_ORACLE_CONNECTION_STRING="jdbc:oracle:thin:@IP_ADDR:PORT:DATABASE_NAME"
export CMS_ORACLE_JDBC_HOST CMS_ORACLE_JDBC_PORT CMS_ORACLE_JDBC_DATABASE CMS_ORACLE_JDBC_USER CMS_ORACLE_CONNECTION_STRING

#HOME PAGE oracle JDBC
HP_ORACLE_JDBC_HOST=
HP_ORACLE_JDBC_PORT=
HP_ORACLE_JDBC_DATABASE=
HP_ORACLE_JDBC_USER=
HP_ORACLE_CONNECTION_STRING="jdbc:oracle:thin:@(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=HOSTNAME_vip)(PORT=))
(ADDRESS=(PROTOCOL=TCP)(HOST=HOSTNAME_vip)(PORT=))(FAILOVER=ON)(LOAD_BALANCE=off))(CONNECT_DATA=(SERVER=)(SERVICE_NAME=)))"

$ Set Elasticsearch(RE)
ELASTICSEARCH_RE_HOST=hostname:29200
if[ ${IS_REAL} == "dev" ]; then
    ELASTICSEARCH_RE_HOST=DEVHOSTNAME:29200
fi
export ELASTICSEARCH_RE_HOST

# Set Elasticsearch(SE)
ELASTICSEARCH_HOST=hostname:9200
if[ ${IS_REAL} == "dev" ]; then
    ELASTICSEARCH_HOST=DEVHOSTNAME:9200
fi

# Set OPENQUERY_HOST
OPENQUERY_HOST=hostname:9200
if[ ${IS_REAL} == "dev" ]; then
    OPENQUERY_HOST=DEVHOSTNAME:9200
fi


































