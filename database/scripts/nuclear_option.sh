docker stop $(docker ps -aq) 2>/dev/null || true && \
docker rm $(docker ps -aq) 2>/dev/null || true && \
docker volume rm $(docker volume ls -q) 2>/dev/null || true && \
docker network prune -f && \
docker rmi $(docker images -q) -f 2>/dev/null || true && \
docker builder prune -a -f