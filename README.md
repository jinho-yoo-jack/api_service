# API Service
> `(WEB --> Kafka(Message Queue) <-- Logstash --> Elasticsearch + Node.js)`
## Action Process
1. Web Event 발생
2. 사용자 Session Info Topic(web-log) Msg Publish at kafka
3. logstash consume kafa Topic((web-log)) Msg and output to Elasticsearch
4. Elasticsearch wel-log index 재가공(유용한 데이터 축출)
5. API 서비스

# 1. Kafka
## 정의 
: Message Queue의 일종, pub-sub모델의 Message Queue.
## 특징 
1. publisher는 메세지를 topic을 통해서 카테고리화 한다. 
  분류된 메세지를 받기를 원하는 receiver는 그 해당 topic을 구독(subscribe)함으로써 메세지를 읽어 올 수 있다.
2. 메시지를 기본적으로 메모리에 저장하는 기존 메시징 시스템과는 달리 메시지를 파일 시스템에 저장 → 카프카 재시작으로 인한 메세지 유실 우려 감소
3. 기존의 메시징 시스템에서는 broker가 consumer에게 메시지를 push해 주는 방식인데 반해, Kafka는 consumer가 broker로부터 직접 메시지를 가지고 가는 pull 방식으로 
   동작하기 때문에 consumer는 자신의 처리능력만큼의 메시지만 broker로부터 가져오기 때문에 최적의 성능을 낼 수 있다.
## 구조 
1. producer  : 메세지 발행자.
- 발행자는 메시지를 만들고 Topic에 메시지를 작성(push)한다.
2. consumer  : 메세지 소비자.
- 소비자는 메시지를 소비하는 주체로써, Topic를 구독하여, 소비자에게 필요한 메시지만 소비(pull)한다.
3. consumer group : consumer들끼리 메세지를 나눠서 가져간다. offset을 공유하여 중복으로 가져가지 않는다.
4. broker : Kafka 서버를 가리킨다.
5. zookeeper : Kafka 서버(+Cluster) 상태를 관리한다.
6. cluster : Broker들의 묶음
7. topic : 메세지 종류
8. partitions : topic이 나눠지는 단위
9. Log : 1개의 메세지
10. offset : 파티션 내에서 각 메시지가 가지는 unique id

## Kafka Config 설정(+Cluster)
1. 위치 : kafka설치경로/config/server.properties
2. 설정 : 
```sh
# Broker의 ID로 Cluster내에서 Broker를 구분하기위해 사용.
broker.id=0
 
# 생성되지 않은 토픽을 자동으로 생성할지 여부. 기본값은 true.
auto.create.topics.enable=false
 
# Broker가 받은 데이터를 관리위한 저장공간.
log.dirs=C:/work/kafka_2.12-2.1.0/data/kafka
 
# Broker가 사용하는 호스트와 포트를 지정, 형식은 PLAINTEXT://your.host.name:port 을 사용
listeners=PLAINTEXT://:9092
 
# Producer와 Consumer가 접근할 호스트와 포트를 지정, 기본값은 listeners를 사용.
advertised.listeners=PLAINTEXT://localhost:9092
 
# 서버가 받을 수 있는 메세지의 최대 크기, 기본값 1MB.
# Consumer에서는 fetch.message.max.bytes를 사용하는데
# message.max.bytes >= fetch.message.max.bytes로 조건에 맞게 잘 설정해야한다.
message.max.bytes=1000000
 
# 네트워크 요청을 처리하는 쓰레드의 수, 기본값 3.
num.network.threads=3
 
# I/O가 생길때 마다 생성되는 쓰레드의 수, 기본값 8.
num.io.threads=8
 
# 서버가 받을 수 있는 최대 요청 사이즈이며, 서버 메모리가 고갈 되는걸 방지함.
# JAVA의 Heap 보다 작게 설정해야 함, 기본값 104857600.
socket.request.max.bytes=104857600
 
# 소켓 서버가 사용하는 송수신 버퍼 (SO_SNDBUF, SO_RCVBUF) 사이즈, 기본값 102400.
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
 
# 토픽당 파티션의 수를 의미하며, 입력한 수만큼 병렬처리를 할 수 있지만 데이터 파일도 그만큼 늘어남. 기본값 1.
num.partitions=1
 
# 세그먼트 파일의 기본 사이즈, 기본값 1GB.
# 토픽별로 수집한 데이터를 보관하는 파일이며, 세그먼트 파일의 용량이 차면 새로운 파일을 생성.
log.segment.bytes=1073741824
 
# 세그먼트 파일의 삭제 주기, 기본값 hours, 168시간( 7일 ).
# 옵션 [ bytes, ms, minutes, hours ] 
log.retention.hours=168
 
# 세그먼트 파일의 삭제 주기에 따른 처리, 기본값은 delete.
# 옵션 [ compact, delete ]
# compact는 파일에서 불필요한 records를 지우는 방식.
log.cleanup.policy=delete
 
# 세그먼트 파일의 삭제 여부를 체크하는 주기, 기본값 5분.
log.retention.check.interval.ms=300000
 
# 세그먼트 파일의 삭제를 처리할 쓰레드의 수. 기본값 1.
log.cleaner.threads=1
 
# 오프셋 커밋 파티션의 수, 한번 배포되면 수정할 수 없음. 기본값 50.
offsets.topic.num.partitions=50
 
# 토픽에 설정된 replication의 인수가 지정한 값보다 크면 새로운 토픽을 생성하고
# 작으면 브로커의 수와 같게 된다. 기본값 3.
offsets.topic.replication.factor=1
 
# 주키퍼의 접속 정보.
zookeeper.connect=localhost:2181
 
# 주키퍼 접속 시도 제한시간.
zookeeper.connection.timeout.ms=6000
```

## zookeeper Config 설정
1. 위치 : kafka설치경로/config/zookeeper.properties
2. 설정
```sh
# zookeeper 데이터 위치, 원하는 경로에 저장입력.
dataDir=/var/zookeeper
 
# 하나의 클라이언트에서 동시접속하는 개수 제한, 기본값은 60이며, 0은 무제한
maxClientCnxns=0
    
# zookeeper port
clientPort=2181
 
# 멀티 서버 설정
# 2888은 각각의 zoopkeeper 간의 통신을 위해서 사용
# 3888은 Leader 선출을 위해서 사용
# server.id=host:port:port
server.1=localhost:2888:3888
# server.2=server_host_1:2888:3888
# server.3=server_host_2:2888:3888
 
# 멀티 서버 설정시 각 서버의 dataDir 밑에 myid 파일이 있어야함.
# server.1,server.2,server.3 의 숫자는 /var/zookeeper1/myid의 값과 동일해야된다.
# server.1에서 echo 1 > myid
# server.2에서 echo 2 > myid
# server.3에서 echo 3 > myid
 
# 리더 서버에 연결해서 동기화하는 시간, [멀티서버옵션]
#initLimit=5
 
# 리더 서버를 제외한 노드 서버가 리더와 동기화하는 시간, [멀티서버옵션]
#syncLimit=2
 
# 토픽을 삭제할 수 있도록 설정
delete.topic.enable=true
```
## Kafka(Broker) 실행
1. CMD : bin/kafka-server-start.sh config/server.properties

## Topic 생성
1. 생성CMD : bin/kafka-topics.sh --create --zookeeper 192.168.0.32:2181 --replication-factor 2 --partitions 4 --topic test
- 옵션: --partitions [NUMBER] topic 파티션 수 설정, --topic [TOPIC_NAME] topic 이름 설정
2. 확인CMD : bin/kafka-topics.sh --list --zookeeper 192.168.0.32:2181

## Kafka Cluster Config on Single Node
### zookeeper 설정
1. zookeeper#1,2,3 config 설정
- file : /config/zookeeper1.properties
```sh
# zookeeper 데이터 위치, 원하는 경로에 저장입력.
# single node일 경우, 각각의 파일경로 상이하게 설정.
# 1번 zookeeper : dataDir = /var/zookeeper
# 2번 zookeeper : dataDir = /var/zookeeper-2
dataDir=/var/zookeeper
    
# zookeeper port
# single node cluster 환경일 경우, 각각의 properties 마다 다르게 설정해야함.
# 1번 zookeeper : clientPort=12181
# 2번 zookeeper : clientPort=22181
clientPort=2181
 
# 멀티 서버 설정
# 2888은 각각의 zoopkeeper 간의 통신을 위해서 사용
# 3888은 Leader 선출을 위해서 사용
# server.id=host:port:port
server.1=localhost:2888:3888
server.2=server_host_1:12888:13888
server.3=server_host_2:22888:23888
 
# 멀티 서버 설정시 각 서버의 dataDir 밑에 myid 파일이 있어야함.
# server.1,server.2,server.3 의 숫자는 /var/dataDir의 지정디렉토리/myid의 값과 동일해야된다.
# server.1에서 echo 1 > myid
# server.2에서 echo 2 > myid
# server.3에서 echo 3 > myid
 
# 리더 서버에 연결해서 동기화하는 시간, [멀티서버옵션]
initLimit=5
 
# 리더 서버를 제외한 노드 서버가 리더와 동기화하는 시간, [멀티서버옵션]
syncLimit=2
 
# 토픽을 삭제할 수 있도록 설정
delete.topic.enable=true
```
2. 각각의 properties을 이용해서 zookeeper 구동<br>$./bin/zookeeper-server-start.sh config/zookeeper1.properties -d<br>$ ./bin/zookeeper-server-start.sh config/zookeeper2.properties -d<br>$ ./bin/zookeeper-server-start.sh config/zookeeper3.properties -d

### kafka(Broker) 설정
1. kafka#1,2,3 config 설정
- file : /config/server1.properties
```sh
# Broker의 ID로 Cluster내에서 Broker를 구분하기위해 사용.
# 각가의 properties 마다 다르게 설정
broker.id=0
 
# 생성되지 않은 토픽을 자동으로 생성할지 여부. 기본값은 true.
auto.create.topics.enable=false
 
# Broker가 받은 데이터를 관리위한 저장공간.
# single node 일 경우, 다르게 설정
# ex) /tmp/kafka-log, /tmp/kafka-log1, /tmp/kafka-log2
log.dirs=C:/work/kafka_2.12-2.1.0/data/kafka
 
# Broker가 사용하는 호스트와 포트를 지정, 형식은 PLAINTEXT://your.host.name:port 을 사용
# single node일 경우, Broker 마다 상이하게 포트 설정
# 1번 Broker : listeners=PLAINTEXT://:9092
# 2번 Broker : listeners=PLAINTEXT://:19092
listeners=PLAINTEXT://:9092
 
# Producer와 Consumer가 접근할 호스트와 포트를 지정, 기본값은 listeners를 사용.
# single node일 경우, Broker 마다 상이하게 포트 설정
# 1번 Broker : advertised.listeners=PLAINTEXT://localhost:9092
# 2번 Broker : advertised.listeners=PLAINTEXT://localhost:19092
advertised.listeners=PLAINTEXT://localhost:9092

# 토픽당 파티션의 수를 의미하며, 입력한 수만큼 병렬처리를 할 수 있지만 데이터 파일도 그만큼 늘어남. 기본값 1.
num.partitions=3

# 주키퍼의 접속 정보.
zookeeper.connect=localhost:2181,localhost:12181,localhost:22181
```
2. kafka 실행<br>$./bin/kafka-server-start.sh config/server1.properties -d<br>$./bin/kafka-server-start.sh config/server2.properties -d<br>$./bin/kafka-server-start.sh config/server3.properties -d




# 2. Logstash Shell
2-1. 실행CMD : $ ./v1-card.sh [init/static/alias]
```sh
#!/bin/sh
# $0 : ./v1-card.sh
# $1 : init or static or alias
# set source type
SOURCE_TYPE = v1-card
export SOURC_TYPE

# include
# v1-card.sh의 Directory를 return
. "`dirname $0`/env.sh"

# mode
MODE = $1
echo -- run as ${MODE}

INDEX_NAME = ${SOURCE_TYPE}
export INDEX_NAME

case $MODE in
init)
      SOURCE_BUILDE = `${BASE_PATH}/bin/utils/newindex.sh ${ELASTICSEARCH_HOST} ${INDEX_NAME}`
      ELASTIC_INDEX = ${INDEX_NAME}_${SOURCE_BUILD}
      export ELASTIC_INDEX
      
      SETTING_SCRIPT = $(<${BASE_PATH}/template/setting.json)
      curl -XPUT 'http://'"${ELASTICSEARCH_HOST}"'/'"${ELASTIC_INDEX" -H 'Content-Type:application/json' -s -d'
      {
          "mapping" : {
              "_doc" : {
                "properties" : {
                    "pageid" : { "type" : "keyword" },
                    "pagetitle" : { "type" : "keyword" ,
                          "field" : {
                             "exact" : {"type":"text","analyzer":"sh_exact_analyzer","search_analyzer":"standard" },
                             "keyword" : {"type":text","analyzer":"sh_keyword_analyzer","search_analyzer":"standard"},
                             "ngram":{"type":"text","analyzer":"sh_front_analyzer","search_analzyer":"standard"},
                             "chosung":{"type":"text","analyzer":"sh_chosung_analyzer","search_analzyer":"standard"},
                             "kobrick":{"type":"text","analyzer":"kobrick","search_analzyer":"kobrick_search"},
                          }
                    },
                    "search_title" : {"type":"alias","path":"pagetitle"},
                    "search_title_exact" : {"type":"alias", "path":"pagetitle.exact"},
                    "search_title_keyword" : {"type":"alias", "path":"pagetitle.keyword"},
                    "search_title_ngram" : {"type":"alias", "path":"pagetitle.ngram"},                                        
                    "search_title_chosung" : {"type":"alias", "path":"pagetitle.chosung"},
                    "search_title_kobrick" : {"type":"alias", "path":"pagetitle.kobrick"},
                    ...
                    ...
              }
            }
          },
          '"${SETTING_SCRIPT}"'
     }
     '; echo
     ;;
alias)
      
```


# 3. node.js
## pm2 설정
## pm2 logrotate
- 명령어 :  $ pm2 set pm2-logrotate:[PARAM] [VALUE] <br>
  자동으로 pm2-logrotate Rebooting<br>
- Default Value<br>
Module: pm2-logrotate<br>
$ pm2 set pm2-logrotate:max_size 10k<br>
$ pm2 set pm2-logrotate:retain 30<br>
$ pm2 set pm2-logrotate:compress false<br>
$ pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss<br>
$ pm2 set pm2-logrotate:workerInterval 30<br>
$ pm2 set pm2-logrotate:rotateInterval 0 0 * * *<br>
$ pm2 set pm2-logrotate:rotateModule true<br>
- 실행예시  
```sh
 jinokku  ~/DEV/node  pm2 install pm2-logrotate
[PM2][Module] Installing NPM pm2-logrotate module
[PM2][Module] Calling [NPM] to install pm2-logrotate ...
+ pm2-logrotate@2.7.0
added 228 packages from 251 contributors and audited 487 packages in 4.824s
found 0 vulnerabilities

[PM2][Module] Module downloaded
[PM2][WARN] Applications pm2-logrotate not running, starting...
[PM2] App [pm2-logrotate] launched (1 instances)
Module: pm2-logrotate
$ pm2 set pm2-logrotate:max_size 10M
$ pm2 set pm2-logrotate:retain 30
$ pm2 set pm2-logrotate:compress false
$ pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
$ pm2 set pm2-logrotate:workerInterval 30
$ pm2 set pm2-logrotate:rotateInterval 0 0 * * *
$ pm2 set pm2-logrotate:rotateModule true
Modules configuration. Copy/Paste line to edit values.
[PM2][Module] Module successfully installed and launched
[PM2][Module] Checkout module options: `$ pm2 conf`
┌─────┬──────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name             │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
└─────┴──────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
Module
┌────┬───────────────────────────────────────┬────────────────────┬───────┬──────────┬──────┬──────────┬──────────┬──────────┐
│ id │ module                                │ version            │ pid   │ status   │ ↺    │ cpu      │ mem      │ user     │
├────┼───────────────────────────────────────┼────────────────────┼───────┼──────────┼──────┼──────────┼──────────┼──────────┤
│ 0  │ pm2-logrotate                         │ 2.7.0              │ 7747  │ online   │ 0    │ 0%       │ 12.7mb   │ jinokku  │
└────┴───────────────────────────────────────┴────────────────────┴───────┴──────────┴──────┴──────────┴──────────┴──────────┘
 jinokku  ~/DEV/node  pm2 set pm2-logrotate:max_size 10k
[PM2] Module pm2-logrotate restarted
[PM2] Setting changed
Module: pm2-logrotate
$ pm2 set pm2-logrotate:max_size 10k
$ pm2 set pm2-logrotate:retain 30
$ pm2 set pm2-logrotate:compress false
$ pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
$ pm2 set pm2-logrotate:workerInterval 30
$ pm2 set pm2-logrotate:rotateInterval 0 0 * * *
$ pm2 set pm2-logrotate:rotateModule true
 jinokku  ~/DEV/node  pm2 set list
Module: pm2-logrotate
$ pm2 set pm2-logrotate:max_size 10k
$ pm2 set pm2-logrotate:retain 30
$ pm2 set pm2-logrotate:compress false
$ pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
$ pm2 set pm2-logrotate:workerInterval 30
$ pm2 set pm2-logrotate:rotateInterval 0 0 * * *
$ pm2 set pm2-logrotate:rotateModule true
Module: module-db-v2
$ pm2 set module-db-v2:pm2-logrotate [object Object]
```
