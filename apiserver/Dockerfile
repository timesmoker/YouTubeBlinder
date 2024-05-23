FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    software-properties-common \
    wget \
    curl \
    build-essential \
    libffi-dev \
    libssl-dev \
    libbz2-dev \
    apt-transport-https \
    ca-certificates

RUN apt-get install -y openjdk-11-jdk

RUN apt-get install -y python3 python3-pip

ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

WORKDIR /app

COPY . /app
RUN pip install --no-cache-dir -r requirements.txt

CMD ["bash"]
