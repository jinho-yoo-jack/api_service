#!/bin/sh

# Set source type
SOURCE_TYPE=v1-card
export SOURCE_TYPE

# Include
."`dirname $0`/env.sh"

# Mode
MODE=$1
echo -- Run As ${MODE}

INDEX_NAME=${SOURCE_TYPE}
export INDEX_NAME

echo -- index_name as ${INDEX_NAME}

case $MODE in
init)
    SOURCE_BUILD=`${BASE_PATH}/bin/utils/newindex.sh ${ELASTICSEARCH_HOST} ${INDEX_NAME}`
    ELASTIC_INDEX=${INDEX_NAME}_${SOURCE_BUILD}
    export ELASTIC_INDEX

    SETTING_SCRIPT=$(<${BASE_PATH}/template/setting.json)

    echo "{ ELASTIC_HOST=>\""${ELASTICSEARCH_HOST}"\", ELASTIC_INDEX=>\""${ELASTIC_INDEX"\" }"

    curl -XPUT 'http://'"${ELASTICSEARCH_HOST}"'/'"${ELASTIC_INDEX}" -H 'Content-Type: application/json' -s -d '
    {
        "mapping" : {
            "_doc" : {
                "properties" : {
                    "pageid" : {"type" : "keyword"},
                    "pagetitle" : {
                        "type" : "keyword",
                        "fields" : {
                            "exact"   : {"type":"text", "analyzer" : "sh_exact_analyzer", "search_analyzer" : "standard"},
                            "keyword" : {"type":"text", "analyzer" : "sh_keyword_analyzer", "search_analyzer" : "standard"},
                            "ngram"   : {"type":"text", "analyzer" : "sh_front_analyzer", "search_analyzer" : "standard"},
                            "chosung" : {"type":"text", "analyzer" : "sh_chosung_analyzer", "search_analyzer" : "standard"},
                            "kobrick" : {"type":"text", "analyzer" : "kobrick", "search_analyzer" : "kobrick_search"}
                        }
                    },
                    "search_title" : {"type" : "alias", "path" : "pagetitle"},
                    "search_title_exact" : {"type" : "alias", "path" : "pagetitle.exact"},
                    "search_title_keyword" : {"type" : "alias", "path" : "pagetitle.keyword"},
                    "search_title_ngram" : {"type" : "alias", "path" : "pagetitle.ngram"},
                    "search_title_chosung" : {"type" : "alias", "path" : "pagetitle.chosung"},
                    "search_title_kobrick" : {"type" : "alias", "path" : "pagetitle.kobrick"},
                }
            }
        },
        '"${SETTING_SCRIPT}"'
    }
    '; echo
    ;;
alias)
    SOURCE_BUILD=${BASE_PATH}/bin/utils/lastindex.sh ${ELASTICSEARCH_HOST} ${INDEX_NAME}
    ELASTIC_INDEX=${INDEX_NAME}_${SOURCE_BUILD}
    export ELASTIC_INDEX

    echo "{ ELASTIC_HOST=>\""${ELASTICSEARCH_HOST}"\", ELASTIC_INDEX=>\""${ELASTIC_INDEX}"\" }"

    ${BASE_PATH}/bin/utils/alias_noClose.sh "${ELASTIC_HOST}" "${ELASTIC_INDEX}" "${INDEX_NAME}" "${OPENQUERY_HOST}"

    ${BASE_PATH}/bin/utils/alias.sh "${ELASTIC_HOST}" "${ELASTIC_INDEX}" "${INDEX_NAME_CARDSEARCH}" "${OPENQUERY_HOST}"

    ${BASE_PATH}/bin/utils/removeOldIndex.sh "${ELASTIC_HOST}" "${ELASTIC_INDEX}" "${INDEX_NAME}" 4 "${OPENQUERY_HOST}"

    ;;
static)
    /bin/rm -rf ${BASE_PATH}/data/${INDEX_NAME}

    # DB Query 주석 처리를 위한 문자열
    export USE_STATIC=""
    export USE_DYNAMIC="--"
    export CLEAN_RUN=true

    SOURCE_BUILD=`${BASE_PATH}/bin/utils/lastindex.sh ${ELASTICSEARCH_HOST} ${INDEX_NAME}
    ELASTIC_INDEX=${INDEX_NAME}_${SOURCE_BUILD}
    export ELASTIC_INDEX

    echo "{ ELASTIC_HOST=>\""${ELASTICSEARCH_HOST}"\", ELASTIC_INDEX=>\""${ELASTIC_INDEX"\" }"

    # System Message
    MESSAGE="'"${ELASTIC_INDEX}"' 색인에 대해 전체 색인을 시작합니다. "
    curl -XPOST 'http://'${GATEWAY_HOST}'/console/_alert' -H 'Content-Type: application/json' -d '
    {
        "level" : "info",
        "code"  : "0",
        "section": "FULL Index",
        "message" : "['"${ELASTIC_INDEX}"'] 전체 색인 START",
        "detail" : "'"${MESSAGE}"'"
    }
    ';

    # Start Logstash Input -> filter -> output
    ${LOGSTASH_PATH}/bin/logstash --path.confg ${BASE_PATH}/config/${SOURCE_TYPE}/logstash.conf
    --path.data ${BASE_PATH}/data/${INDEX_NAME}/logstash --path.logs ${LOG_PATH}/logstash ${LOGSTASH_OPTS} &

    # LOGSTASH의 PID
    CHILD_PID=$!

    # trap 설정
    # - Script 실행 중에 시스템에서 Signal를 받으면, 해당 하는 Signal를 받아드리면 trap 명령어 실행으로 SIGNAL_TERM 함수 호출
    # 그렇지 않으면 Signal를 무시하고 계속해서 프로세스를 진행한다.
    # TERM : 가능하면 프로세스를 종료한다.
    # INT  : 프로세스를 중지 시킨다.
    # KILL : 무조건 프로세스를 종료한다.
    trap "SIGNAL_TERM ${CHILD_PID}" TERM INT KILL
    wait "${CHILD_PID}"
    NEWDOCUMENT=`curl -f -XGET 'http://'"${ELASTICSEARCH_HOST}"'/_cat/indices/'"${ELASTIC_INDEX}"'?h=docs.count' -s`
    echo ${NEWDOCUMENT}

    # System Message
    # Gateway Logging
    # 검색로그는 Elasticsearch Query 포함하는 것이 좋아 보인다.
    # - 실무에서는 운영서버에 직접 접근하여 Log를 확인하고 Error를 찾고 추적하기가 어렵다.
    # - openQuery가 좀 더 관리도구 관점이 되기 위해서는 이런 기능 또한 필요해 보인다.
    MESSAGE="'"${ELASTIC_INDEX}"' 색인에 대해 전체 색인을 완료 하였습니다. 색인 건수는 '"${NEWDOCUMENT}"'건 입니다."
    curl -XPOST 'http://'${GATEWAY_HOST}'/console/_alert' -H 'Content-Type: application/json' -d '
    {
        "level" : "info",
        "code"  : "0",
        "section": "FULL Index",
        "message" : "['"${ELASTIC_INDEX}"'] 전체 색인 COMPLETED",
        "detail" : "'"${MESSAGE}"'"
    }
    ';
    ;;
dynamic)
    export USE_STATIC="--"
    export USE_DYNAMIC=""
    export CLEAN_RUN="false"
    export SCHEDULE="0-59/10 3-23 * * *"

    SOURCE_BUILD=`${BASE_PATH}/bin/utils/lastindex.sh ${ELASTICSEARCH_HOST} ${INDEX_NAME}
    ELASTIC_INDEX=${INDEX_NAME}_${SOURCE_BUILD}
    export ELASTIC_INDEX

    echo "{ ELASTIC_HOST=>\""${ELASTICSEARCH_HOST}"\", ELASTIC_INDEX=>\""${ELASTIC_INDEX"\" }"

    ${LOGSTASH_PATH}/bin/logstash --path.confg ${BASE_PATH}/config/${SOURCE_TYPE}/logstash.conf
     --path.data ${BASE_PATH}/data/${INDEX_NAME}/logstash --path.logs ${LOG_PATH}/logstash ${LOGSTASH_OPTS} &

    CHILD_PID=$!
    trap "SIGNAL_TERM ${CHILD_PID}" TERM INT KILL
    wait "${CHILD_PID}"

    ;;
delete)
    export USE_STATIC="--"
    export USE_DYNAMIC="--"
    export SCHEDULE="0-59/10 3-23 * * *"

    SOURCE_BUILD=`${BASE_PATH}/bin/utils/lastindex.sh ${ELASTICSEARCH_HOST} ${INDEX_NAME}
    ELASTIC_INDEX=${INDEX_NAME}_${SOURCE_BUILD}

    echo "{ ELASTIC_HOST=>\""${ELASTICSEARCH_HOST}"\", ELASTIC_INDEX=>\""${ELASTIC_INDEX"\" }"


    ${LOGSTASH_PATH}/bin/logstash --path.confg ${BASE_PATH}/config/${SOURCE_TYPE}/logstash.conf
    --path.data ${BASE_PATH}/data/${INDEX_NAME}/logstash --path.logs ${LOG_PATH}/logstash ${LOGSTASH_OPTS} &

    CHILD_PID=$!
    trap "SIGNAL_TERM ${CHILD_PID}" TERM INT KILL
    wait "${CHILD_PID}"
    ;;
*)

    echo "Usage) $0 [init|static|dynamic|alias]"
    exit1
    ;;
esac






















